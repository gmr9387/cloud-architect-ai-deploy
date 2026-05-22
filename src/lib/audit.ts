// Compute-only engines: Audit, Risk, Observability.
// All derive from existing topology data + governance tables. No mutation.

import { Service, ServiceDependency, Environment, ServiceEnvState } from '@/hooks/useTopologies';

export type AuditLevel = 'PASS' | 'WARNING' | 'FAIL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AuditCheck {
  id: string;
  category: 'secrets' | 'database' | 'monitoring' | 'cicd' | 'backup' | 'domains' | 'parity' | 'alerts';
  title: string;
  level: AuditLevel;
  detail: string;
  environment?: string;
}

export interface RiskFinding {
  id: string;
  level: RiskLevel;
  title: string;
  category: 'spof' | 'backup' | 'monitoring' | 'rollback' | 'drift' | 'secrets';
  affected: string;
  explanation: string;
  mitigation: string;
}

export interface ObservabilityRow {
  service: Service;
  logs: 'covered' | 'partial' | 'missing' | 'not_required';
  metrics: 'covered' | 'partial' | 'missing' | 'not_required';
  traces: 'covered' | 'partial' | 'missing' | 'not_required';
  alerts: 'covered' | 'partial' | 'missing' | 'not_required';
}

interface AuditInputs {
  services: Service[];
  dependencies: ServiceDependency[];
  environments: Environment[];
  serviceEnvState: ServiceEnvState[];
  secretsByEnv: Record<string, { name: string; state: string; expiresAt?: string | null }[]>;
  blueprintsByEnv: Record<string, { hasBackup: boolean; hasRollback: boolean; hasCicd: boolean; hasMonitoring: boolean }>;
  recentFailures: number;
  hasRunbooks: boolean;
}

const levelFromStatus = (s: string): AuditLevel =>
  s === 'ready' || s === 'covered' ? 'PASS' : s === 'partial' ? 'WARNING' : 'FAIL';

export function runAudit(i: AuditInputs): { checks: AuditCheck[]; score: number } {
  const checks: AuditCheck[] = [];

  for (const env of i.environments) {
    const k = env.environment_kind;
    const required = k === 'production';

    // Secrets
    const envSecrets = i.secretsByEnv[k] || [];
    const missingSecrets = envSecrets.filter((s) => s.state === 'missing').length;
    const expired = envSecrets.filter((s) => s.state === 'expired').length;
    if (envSecrets.length === 0 && required) {
      checks.push({ id: `secrets-${k}`, category: 'secrets', title: 'Secrets registered', level: 'FAIL', detail: 'No secrets registered for production. Register required secrets so we can audit presence.', environment: k });
    } else {
      checks.push({
        id: `secrets-${k}`,
        category: 'secrets',
        title: 'Secrets present',
        level: missingSecrets || expired ? (required ? 'FAIL' : 'WARNING') : 'PASS',
        detail: missingSecrets || expired ? `${missingSecrets} missing, ${expired} expired in ${k}.` : `All registered secrets present in ${k}.`,
        environment: k,
      });
    }

    // Database
    checks.push({
      id: `db-${k}`,
      category: 'database',
      title: 'Database readiness',
      level: levelFromStatus(env.database_status),
      detail: `Database status reported as ${env.database_status}. Migrations + RLS + backups must be ready for production.`,
      environment: k,
    });

    // Monitoring
    checks.push({
      id: `mon-${k}`,
      category: 'monitoring',
      title: 'Monitoring coverage',
      level: levelFromStatus(env.monitoring_status),
      detail: `Logs / metrics / traces status: ${env.monitoring_status}.`,
      environment: k,
    });

    // Alerts (heuristic: monitoring is at least partial)
    checks.push({
      id: `alerts-${k}`,
      category: 'alerts',
      title: 'Alert coverage',
      level: env.monitoring_status === 'ready' ? 'PASS' : env.monitoring_status === 'partial' ? 'WARNING' : 'FAIL',
      detail: 'On-call paging routes required for production. Derived from monitoring readiness.',
      environment: k,
    });

    // CI/CD + Backup from blueprint
    const bp = i.blueprintsByEnv[k];
    checks.push({
      id: `cicd-${k}`,
      category: 'cicd',
      title: 'CI/CD pipeline defined',
      level: bp?.hasCicd ? 'PASS' : required ? 'FAIL' : 'WARNING',
      detail: bp?.hasCicd ? 'Deployment pipeline documented in blueprint.' : 'No CI/CD plan in blueprint for this environment.',
      environment: k,
    });
    checks.push({
      id: `backup-${k}`,
      category: 'backup',
      title: 'Backup strategy',
      level: bp?.hasBackup ? 'PASS' : required ? 'FAIL' : 'WARNING',
      detail: bp?.hasBackup ? 'Backup strategy documented.' : 'No backup strategy documented for this environment.',
      environment: k,
    });
    checks.push({
      id: `domain-${k}`,
      category: 'domains',
      title: 'Hosting target / domains',
      level: bp?.hasCicd || env.config_status === 'ready' ? 'PASS' : 'WARNING',
      detail: 'Confirm host + custom domain + TLS for this environment.',
      environment: k,
    });
  }

  // Environment parity (cross-env)
  const prod = i.environments.find((e) => e.environment_kind === 'production');
  const staging = i.environments.find((e) => e.environment_kind === 'staging');
  if (prod && staging) {
    const drift =
      (prod.config_status !== staging.config_status ? 1 : 0) +
      (prod.database_status !== staging.database_status ? 1 : 0) +
      (prod.monitoring_status !== staging.monitoring_status ? 1 : 0);
    checks.push({
      id: 'parity',
      category: 'parity',
      title: 'Environment parity (staging vs production)',
      level: drift === 0 ? 'PASS' : drift === 1 ? 'WARNING' : 'FAIL',
      detail: drift === 0 ? 'Staging mirrors production posture.' : `${drift} axes of drift between staging and production.`,
    });
  }

  const points = checks.reduce((acc, c) => acc + (c.level === 'PASS' ? 100 : c.level === 'WARNING' ? 60 : 0), 0);
  const score = checks.length ? Math.round(points / checks.length) : 0;
  return { checks, score };
}

export function runRiskEngine(
  services: Service[],
  dependencies: ServiceDependency[],
  environments: Environment[],
  blueprintsByEnv: AuditInputs['blueprintsByEnv'],
): RiskFinding[] {
  const findings: RiskFinding[] = [];

  // SPOF: services with high inbound dependency count and only one instance.
  const inbound = new Map<string, number>();
  dependencies.forEach((d) => inbound.set(d.to_service_id, (inbound.get(d.to_service_id) || 0) + 1));
  services.forEach((s) => {
    const dep = inbound.get(s.id) || 0;
    if (dep >= 3 && (s.service_type === 'database' || s.service_type === 'queue' || s.service_type === 'worker')) {
      findings.push({
        id: `spof-${s.id}`,
        level: 'HIGH',
        category: 'spof',
        title: `Single point of failure: ${s.name}`,
        affected: s.name,
        explanation: `${dep} downstream services depend on this ${s.service_type}. An outage cascades across the system.`,
        mitigation: 'Add a read replica / standby, multi-AZ deployment, or circuit breakers on consumers.',
      });
    }
  });

  // Backup missing in production
  const prodBp = blueprintsByEnv['production'];
  if (!prodBp?.hasBackup) {
    findings.push({
      id: 'backup-prod',
      level: 'HIGH',
      category: 'backup',
      title: 'No backup strategy for production',
      affected: 'Production',
      explanation: 'Production blueprint has no documented backup strategy. Data loss is irrecoverable.',
      mitigation: 'Define PITR + off-site snapshots + tested restore drill cadence in the production blueprint.',
    });
  }

  // Rollback plan missing
  if (!prodBp?.hasRollback) {
    findings.push({
      id: 'rollback-prod',
      level: 'HIGH',
      category: 'rollback',
      title: 'No rollback strategy for production',
      affected: 'Production',
      explanation: 'Production deploys have no documented rollback plan. Failed deploys cannot be reverted predictably.',
      mitigation: 'Document blue/green or version-tagged rollback steps; attach a rollback runbook.',
    });
  }

  // Monitoring gaps
  services.forEach((s) => {
    if (s.observability_requirements?.length && s.readiness_status !== 'ready') {
      findings.push({
        id: `mon-${s.id}`,
        level: s.service_type === 'database' || s.service_type === 'worker' ? 'HIGH' : 'MEDIUM',
        category: 'monitoring',
        title: `Monitoring gap on ${s.name}`,
        affected: s.name,
        explanation: `Service requires ${s.observability_requirements.join(', ')} but readiness is ${s.readiness_status}.`,
        mitigation: 'Wire OpenTelemetry exporters, dashboards, and alert routes for this service.',
      });
    }
  });

  // Environment drift
  const prod = environments.find((e) => e.environment_kind === 'production');
  const staging = environments.find((e) => e.environment_kind === 'staging');
  if (prod && staging) {
    const drift = (['config_status', 'database_status', 'monitoring_status'] as const).filter(
      (k) => prod[k] !== staging[k],
    );
    if (drift.length >= 2) {
      findings.push({
        id: 'drift',
        level: 'MEDIUM',
        category: 'drift',
        title: 'Environment drift between staging and production',
        affected: 'staging vs production',
        explanation: `Drift detected on: ${drift.join(', ')}. Staging is no longer a reliable rehearsal of production.`,
        mitigation: 'Align IaC + secrets + monitoring posture between environments.',
      });
    }
  }

  return findings.sort((a, b) => (a.level === 'HIGH' ? -1 : b.level === 'HIGH' ? 1 : 0));
}

export function buildObservabilityCoverage(
  services: Service[],
  environments: Environment[],
): { rows: ObservabilityRow[]; score: number } {
  const prod = environments.find((e) => e.environment_kind === 'production');
  const baseFromMonitoring = (req: boolean): ObservabilityRow['logs'] => {
    if (!req) return 'not_required';
    if (!prod) return 'missing';
    return prod.monitoring_status === 'ready' ? 'covered' : prod.monitoring_status === 'partial' ? 'partial' : 'missing';
  };

  const rows: ObservabilityRow[] = services.map((s) => {
    const reqs = new Set(s.observability_requirements || []);
    const has = (kw: string[]) => kw.some((k) => Array.from(reqs).some((r) => r.includes(k)));
    return {
      service: s,
      logs: baseFromMonitoring(reqs.size > 0 || s.service_type !== 'storage'),
      metrics: baseFromMonitoring(has(['metric', 'latency', 'rate', 'depth', 'count']) || s.service_type !== 'storage'),
      traces: baseFromMonitoring(has(['trace']) || s.service_type === 'worker' || s.service_type === 'edge_function' || s.service_type === 'api'),
      alerts: baseFromMonitoring(s.service_type === 'database' || s.service_type === 'worker' || s.service_type === 'queue' || s.service_type === 'webhook_ingress'),
    };
  });

  const points = rows.reduce((acc, r) => {
    return acc + (['logs', 'metrics', 'traces', 'alerts'] as const).reduce((a, k) => {
      const v = r[k];
      return a + (v === 'covered' ? 100 : v === 'partial' ? 60 : v === 'not_required' ? 100 : 0);
    }, 0) / 4;
  }, 0);
  const score = rows.length ? Math.round(points / rows.length) : 0;
  return { rows, score };
}

export const AUDIT_LEVEL_CLASSES: Record<AuditLevel, string> = {
  PASS: 'bg-success/10 text-success border-success/30',
  WARNING: 'bg-warning/10 text-warning border-warning/30',
  FAIL: 'bg-destructive/10 text-destructive border-destructive/30',
};

export const RISK_LEVEL_CLASSES: Record<RiskLevel, string> = {
  LOW: 'bg-success/10 text-success border-success/30',
  MEDIUM: 'bg-warning/10 text-warning border-warning/30',
  HIGH: 'bg-destructive/10 text-destructive border-destructive/30',
};
