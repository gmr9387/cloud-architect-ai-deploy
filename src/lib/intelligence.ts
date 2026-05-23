// Architecture Intelligence engines for Phase 3.
// Pure compute over existing topology + governance data. No mutations.

import { Service, ServiceDependency, Environment, ServiceEnvState } from '@/hooks/useTopologies';
import { DeploymentBlueprint, DeploymentEvent, Runbook, SecretRecord } from '@/hooks/useGovernance';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

export const SEVERITY_CLASSES: Record<Severity, string> = {
  LOW: 'bg-success/10 text-success border-success/30',
  MEDIUM: 'bg-warning/10 text-warning border-warning/30',
  HIGH: 'bg-destructive/10 text-destructive border-destructive/30',
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. ARCHITECTURE REVIEW ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export interface ReviewFinding {
  id: string;
  category: 'spof' | 'scaling' | 'redundancy' | 'concentration' | 'operational';
  title: string;
  severity: Severity;
  affected: string[];
  rationale: string;
  recommendation: string;
}

export function runArchitectureReview(
  services: Service[],
  dependencies: ServiceDependency[],
  environments: Environment[],
): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  const inbound = new Map<string, ServiceDependency[]>();
  const outbound = new Map<string, ServiceDependency[]>();
  dependencies.forEach((d) => {
    inbound.set(d.to_service_id, [...(inbound.get(d.to_service_id) || []), d]);
    outbound.set(d.from_service_id, [...(outbound.get(d.from_service_id) || []), d]);
  });
  const byId = new Map(services.map((s) => [s.id, s]));

  // SPOFs
  services.forEach((s) => {
    const inbCount = inbound.get(s.id)?.length || 0;
    const critical = ['database', 'queue', 'cache', 'webhook_ingress'].includes(s.service_type);
    if (critical && inbCount >= 2) {
      findings.push({
        id: `review-spof-${s.id}`,
        category: 'spof',
        title: `Single point of failure: ${s.name}`,
        severity: inbCount >= 3 ? 'HIGH' : 'MEDIUM',
        affected: [s.name, ...(inbound.get(s.id) || []).map((d) => byId.get(d.from_service_id)?.name || '').filter(Boolean)],
        rationale: `${inbCount} services depend on this ${s.service_type}. No redundant instance is declared. An outage cascades to every consumer.`,
        recommendation:
          s.service_type === 'database'
            ? 'Add a hot standby / read replica in a separate AZ. Define automated failover and document target RTO/RPO.'
            : s.service_type === 'queue'
            ? 'Deploy queue in HA mode (multi-broker), add dead-letter routing, and have consumers tolerate broker restart.'
            : 'Run at least two instances behind a load balancer or in a managed HA tier.',
      });
    }
  });

  // Scaling bottlenecks
  services.forEach((s) => {
    if ((s.service_type === 'worker' || s.service_type === 'api') && !s.scaling_profile) {
      findings.push({
        id: `review-scale-${s.id}`,
        category: 'scaling',
        title: `No declared scaling profile: ${s.name}`,
        severity: 'MEDIUM',
        affected: [s.name],
        rationale: `${s.service_type} services without a declared scaling profile cannot be capacity-planned and will degrade silently under load.`,
        recommendation: 'Declare min/max instances, concurrency, autoscale signal (CPU, queue depth, RPS), and a known load ceiling.',
      });
    }
  });

  // Dependency concentration (fan-out)
  services.forEach((s) => {
    const out = outbound.get(s.id)?.length || 0;
    if (out >= 5) {
      findings.push({
        id: `review-conc-${s.id}`,
        category: 'concentration',
        title: `High dependency concentration: ${s.name}`,
        severity: out >= 7 ? 'HIGH' : 'MEDIUM',
        affected: [s.name],
        rationale: `${s.name} depends on ${out} downstream services. Any of them failing degrades this service. Blast radius is wide.`,
        recommendation: 'Identify non-essential dependencies. Move slow/optional calls behind circuit breakers, queues, or feature flags.',
      });
    }
  });

  // Missing redundancy at edge
  const edges = services.filter((s) => s.service_type === 'edge_function' || s.service_type === 'api');
  if (edges.length > 0 && !edges.some((e) => (e.scaling_profile || '').match(/multi|ha|replic|cluster/i))) {
    findings.push({
      id: 'review-edge-redundancy',
      category: 'redundancy',
      title: 'Edge/API tier has no documented redundancy',
      severity: 'MEDIUM',
      affected: edges.map((e) => e.name),
      rationale: 'No edge or API service declares multi-instance or multi-region scaling. A single zone failure can take the surface down.',
      recommendation: 'Declare multi-AZ or multi-region posture for at least the public entry points.',
    });
  }

  // Operational risk: services with no health check
  services.forEach((s) => {
    if (['api', 'worker', 'edge_function'].includes(s.service_type) && !s.health_check_path) {
      findings.push({
        id: `review-health-${s.id}`,
        category: 'operational',
        title: `No health check declared: ${s.name}`,
        severity: 'LOW',
        affected: [s.name],
        rationale: 'Orchestrators cannot detect a broken instance and route traffic to it.',
        recommendation: 'Expose a /health or /ready endpoint that checks downstream connectivity.',
      });
    }
  });

  // Operational: production environment risk score
  const prod = environments.find((e) => e.environment_kind === 'production');
  if (prod && prod.risk_score >= 60) {
    findings.push({
      id: 'review-prod-risk',
      category: 'operational',
      title: 'Production carries elevated operational risk',
      severity: 'HIGH',
      affected: ['production'],
      rationale: `Production risk score is ${prod.risk_score}/100. Multiple readiness axes are not green.`,
      recommendation: 'Resolve red items in the readiness checklist before next deploy. Block deploys gating on this score.',
    });
  }

  return findings.sort((a, b) => sevWeight(b.severity) - sevWeight(a.severity));
}

const sevWeight = (s: Severity) => (s === 'HIGH' ? 3 : s === 'MEDIUM' ? 2 : 1);

// ─────────────────────────────────────────────────────────────────────────────
// 2. CHANGE IMPACT ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

export interface ImpactReport {
  changedServiceId: string;
  changedServiceName: string;
  directDownstream: Service[];
  transitiveDownstream: Service[];
  directUpstream: Service[];
  affectedDependencies: ServiceDependency[];
  overall: Severity;
  reasoning: string[];
}

export function analyzeChangeImpact(
  changedServiceId: string,
  services: Service[],
  dependencies: ServiceDependency[],
): ImpactReport {
  const byId = new Map(services.map((s) => [s.id, s]));
  const changed = byId.get(changedServiceId)!;

  // Inbound dependencies = services that DEPEND ON the changed one (downstream impact)
  const directDownstreamIds = dependencies.filter((d) => d.to_service_id === changedServiceId).map((d) => d.from_service_id);
  const directUpstreamIds = dependencies.filter((d) => d.from_service_id === changedServiceId).map((d) => d.to_service_id);

  // Transitive: walk up the inbound graph
  const visited = new Set<string>(directDownstreamIds);
  const queue = [...directDownstreamIds];
  while (queue.length) {
    const cur = queue.shift()!;
    dependencies
      .filter((d) => d.to_service_id === cur)
      .forEach((d) => {
        if (!visited.has(d.from_service_id) && d.from_service_id !== changedServiceId) {
          visited.add(d.from_service_id);
          queue.push(d.from_service_id);
        }
      });
  }
  const transitiveIds = [...visited].filter((id) => !directDownstreamIds.includes(id));

  const affectedDeps = dependencies.filter(
    (d) => d.to_service_id === changedServiceId || d.from_service_id === changedServiceId,
  );

  const reasoning: string[] = [];
  const downstreamCount = directDownstreamIds.length + transitiveIds.length;
  reasoning.push(`${directDownstreamIds.length} service(s) depend on ${changed.name} directly.`);
  if (transitiveIds.length) reasoning.push(`${transitiveIds.length} additional service(s) are reached transitively.`);
  reasoning.push(`${directUpstreamIds.length} downstream dependency(ies) may need re-validation.`);
  if (changed.service_type === 'database' || changed.service_type === 'queue') {
    reasoning.push(`Changing a ${changed.service_type} is high-risk: schema/contract changes can break consumers silently.`);
  }
  if (affectedDeps.some((d) => d.dependency_type === 'sync')) {
    reasoning.push('Synchronous dependencies are involved — failures propagate immediately.');
  }

  let overall: Severity = 'LOW';
  if (downstreamCount >= 5 || changed.service_type === 'database') overall = 'HIGH';
  else if (downstreamCount >= 2 || affectedDeps.some((d) => d.dependency_type === 'sync')) overall = 'MEDIUM';

  return {
    changedServiceId,
    changedServiceName: changed.name,
    directDownstream: directDownstreamIds.map((id) => byId.get(id)!).filter(Boolean),
    transitiveDownstream: transitiveIds.map((id) => byId.get(id)!).filter(Boolean),
    directUpstream: directUpstreamIds.map((id) => byId.get(id)!).filter(Boolean),
    affectedDependencies: affectedDeps,
    overall,
    reasoning,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ARCHITECTURE DRIFT DETECTION
// ─────────────────────────────────────────────────────────────────────────────

export interface DriftItem {
  id: string;
  area: 'service' | 'dependency' | 'configuration' | 'monitoring' | 'backup';
  title: string;
  severity: Severity;
  expected: string;
  actual: string;
  affected: string;
}

export function detectDrift(
  services: Service[],
  dependencies: ServiceDependency[],
  environments: Environment[],
  serviceEnvState: ServiceEnvState[],
  blueprints: DeploymentBlueprint[],
  secrets: SecretRecord[],
): DriftItem[] {
  const items: DriftItem[] = [];
  const prodEnv = environments.find((e) => e.environment_kind === 'production');
  const prodBp = blueprints.find((b) => b.environment === 'production' && b.is_current);

  // Missing services in production env
  if (prodEnv) {
    services.forEach((s) => {
      const ses = serviceEnvState.find((x) => x.service_id === s.id && x.environment_id === prodEnv.id);
      if (!ses || ses.deployment_status === 'missing') {
        items.push({
          id: `drift-svc-${s.id}`,
          area: 'service',
          title: `Service not deployed to production: ${s.name}`,
          severity: 'HIGH',
          expected: 'Deployed per topology blueprint',
          actual: ses?.deployment_status ?? 'no record',
          affected: s.name,
        });
      }
    });
  }

  // Configuration drift: blueprint hosting target unmatched
  if (prodBp && prodEnv && prodEnv.config_status !== 'ready' && prodBp.hosting_target) {
    items.push({
      id: 'drift-cfg-hosting',
      area: 'configuration',
      title: 'Hosting configuration not fully aligned',
      severity: 'MEDIUM',
      expected: prodBp.hosting_target,
      actual: `config_status=${prodEnv.config_status}`,
      affected: 'production',
    });
  }

  // Monitoring drift
  if (prodBp && prodEnv && prodBp.monitoring_plan && prodEnv.monitoring_status !== 'ready') {
    items.push({
      id: 'drift-monitoring',
      area: 'monitoring',
      title: 'Monitoring drift vs blueprint',
      severity: 'HIGH',
      expected: 'Monitoring plan declared in current blueprint',
      actual: `environment monitoring_status=${prodEnv.monitoring_status}`,
      affected: 'production',
    });
  }

  // Backup drift
  if (prodBp && prodEnv) {
    if (!prodBp.backup_strategy) {
      items.push({
        id: 'drift-backup-missing',
        area: 'backup',
        title: 'No backup strategy declared',
        severity: 'HIGH',
        expected: 'Documented backup + restore drill',
        actual: 'absent',
        affected: 'production',
      });
    }
  }

  // Undocumented secrets (services declare required_secrets that have no registry entry in production)
  services.forEach((s) => {
    (s.required_secrets || []).forEach((sec) => {
      const reg = secrets.find((r) => r.environment === 'production' && r.secret_name === sec && (r.service_id === s.id || r.service_id === null));
      if (!reg) {
        items.push({
          id: `drift-sec-${s.id}-${sec}`,
          area: 'configuration',
          title: `Required secret not registered: ${sec}`,
          severity: 'MEDIUM',
          expected: `Registered in secrets registry for production`,
          actual: 'no registry entry',
          affected: s.name,
        });
      }
    });
  });

  // Undocumented dependencies: any dependency without notes is "undocumented" beyond a threshold
  const undocumented = dependencies.filter((d) => !d.notes).length;
  if (undocumented >= 3) {
    items.push({
      id: 'drift-deps-undoc',
      area: 'dependency',
      title: `${undocumented} dependencies have no documented rationale`,
      severity: 'LOW',
      expected: 'Every dependency annotated with intent / contract',
      actual: `${undocumented} unannotated edges`,
      affected: 'topology',
    });
  }

  return items.sort((a, b) => sevWeight(b.severity) - sevWeight(a.severity));
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CAPACITY & SCALE PLANNING
// ─────────────────────────────────────────────────────────────────────────────

export interface CapacityAssumption {
  serviceId: string;
  currentRps: number;      // requests per second (or jobs/sec)
  growthMultiplier6m: number;
  growthMultiplier12m: number;
  ceilingRps: number;      // estimated ceiling for current scaling profile
}

export interface CapacityProjection {
  service: Service;
  current: number;
  m6: number;
  m12: number;
  ceiling: number;
  current_pct: number;
  m6_pct: number;
  m12_pct: number;
  status_current: Severity;
  status_m6: Severity;
  status_m12: Severity;
}

const pctSeverity = (pct: number): Severity => (pct >= 100 ? 'HIGH' : pct >= 70 ? 'MEDIUM' : 'LOW');

export function projectCapacity(services: Service[], assumptions: CapacityAssumption[]): CapacityProjection[] {
  return services.map((s) => {
    const a = assumptions.find((x) => x.serviceId === s.id) ?? {
      serviceId: s.id,
      currentRps: 10,
      growthMultiplier6m: 1.5,
      growthMultiplier12m: 2.5,
      ceilingRps: 100,
    };
    const m6 = Math.round(a.currentRps * a.growthMultiplier6m);
    const m12 = Math.round(a.currentRps * a.growthMultiplier12m);
    const c = Math.max(1, a.ceilingRps);
    return {
      service: s,
      current: a.currentRps,
      m6,
      m12,
      ceiling: c,
      current_pct: Math.round((a.currentRps / c) * 100),
      m6_pct: Math.round((m6 / c) * 100),
      m12_pct: Math.round((m12 / c) * 100),
      status_current: pctSeverity((a.currentRps / c) * 100),
      status_m6: pctSeverity((m6 / c) * 100),
      status_m12: pctSeverity((m12 / c) * 100),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. FAILURE SIMULATION
// ─────────────────────────────────────────────────────────────────────────────

export type FailureKind = 'service_outage' | 'database_outage' | 'queue_outage' | 'secret_expiration' | 'monitoring_failure';

export interface SimulationResult {
  kind: FailureKind;
  targetName: string;
  impactedServices: Service[];
  businessImpact: string;
  recoveryPath: string[];
  severity: Severity;
}

export function simulateFailure(
  kind: FailureKind,
  targetServiceId: string | null,
  services: Service[],
  dependencies: ServiceDependency[],
  runbooks: Runbook[],
): SimulationResult {
  const byId = new Map(services.map((s) => [s.id, s]));
  const target = targetServiceId ? byId.get(targetServiceId) : null;

  let impacted: Service[] = [];
  let businessImpact = '';
  let severity: Severity = 'MEDIUM';

  if (kind === 'monitoring_failure') {
    impacted = services;
    businessImpact = 'No visibility into running systems. Incidents go undetected; MTTR rises sharply. Customer-facing failures discovered via support tickets.';
    severity = 'HIGH';
  } else if (kind === 'secret_expiration') {
    impacted = target ? [target] : services.filter((s) => (s.required_secrets || []).length > 0);
    businessImpact = 'Affected services begin returning auth errors at the next outbound call. User-visible breakage usually within minutes.';
    severity = 'HIGH';
  } else if (target) {
    const visited = new Set<string>([target.id]);
    const queue = [target.id];
    while (queue.length) {
      const cur = queue.shift()!;
      dependencies
        .filter((d) => d.to_service_id === cur)
        .forEach((d) => {
          if (!visited.has(d.from_service_id)) {
            visited.add(d.from_service_id);
            queue.push(d.from_service_id);
          }
        });
    }
    impacted = [...visited].map((id) => byId.get(id)!).filter(Boolean);
    severity = impacted.length >= 4 ? 'HIGH' : impacted.length >= 2 ? 'MEDIUM' : 'LOW';
    businessImpact =
      kind === 'database_outage'
        ? 'All reads/writes against this datastore fail. Anything user-facing that requires this data goes down.'
        : kind === 'queue_outage'
        ? 'Producers buffer or drop messages. Consumers idle. Async work (emails, jobs, webhooks) is delayed or lost.'
        : `Direct outage of ${target.name}. Synchronous callers fail-fast; async callers degrade gracefully if circuit breakers exist.`;
  }

  // Recovery path: pull related runbooks first, then generic steps.
  const relatedRunbooks = runbooks.filter((r) => !r.service_id || r.service_id === targetServiceId);
  const recoveryPath: string[] = [];
  if (relatedRunbooks.length) {
    recoveryPath.push(`Open runbook(s): ${relatedRunbooks.slice(0, 3).map((r) => r.title).join(', ')}`);
  }
  recoveryPath.push('Confirm scope from monitoring (services impacted, error rate).');
  if (kind === 'database_outage') recoveryPath.push('Failover to standby / promote replica. Verify replication lag = 0.');
  if (kind === 'queue_outage') recoveryPath.push('Restart broker. Re-drive dead-letter queue. Verify consumer lag.');
  if (kind === 'service_outage') recoveryPath.push('Restart instances or roll back to last good version per rollback runbook.');
  if (kind === 'secret_expiration') recoveryPath.push('Rotate secret, redeploy affected services, verify auth success.');
  if (kind === 'monitoring_failure') recoveryPath.push('Restore monitoring stack. Backfill alerting. Run synthetic checks.');
  recoveryPath.push('Communicate status to stakeholders. Post-incident review within 48h.');

  return { kind, targetName: target?.name ?? 'platform-wide', impactedServices: impacted, businessImpact, recoveryPath, severity };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. RECOVERY READINESS SCORE
// ─────────────────────────────────────────────────────────────────────────────

export interface RecoveryDimension {
  id: string;
  label: string;
  score: number; // 0..100
  status: Severity;
  detail: string;
}

export function calculateRecoveryReadiness(
  services: Service[],
  environments: Environment[],
  blueprints: DeploymentBlueprint[],
  runbooks: Runbook[],
): { dimensions: RecoveryDimension[]; overall: number; overallStatus: Severity } {
  const prodBp = blueprints.find((b) => b.environment === 'production' && b.is_current);
  const prodEnv = environments.find((e) => e.environment_kind === 'production');

  const dims: RecoveryDimension[] = [];

  // Backups
  const backupScore = prodBp?.backup_strategy ? 100 : 0;
  dims.push({
    id: 'backup',
    label: 'Backups',
    score: backupScore,
    status: backupScore >= 80 ? 'LOW' : 'HIGH',
    detail: prodBp?.backup_strategy ? 'Backup strategy documented in current production blueprint.' : 'No backup strategy documented. Data loss is unrecoverable.',
  });

  // Rollback
  const rollbackScore = prodBp?.rollback_strategy ? 100 : 0;
  dims.push({
    id: 'rollback',
    label: 'Rollback plans',
    score: rollbackScore,
    status: rollbackScore >= 80 ? 'LOW' : 'HIGH',
    detail: prodBp?.rollback_strategy ? 'Rollback strategy documented.' : 'No rollback strategy. Failed deploys cannot be reversed predictably.',
  });

  // Monitoring
  const monScore = prodEnv?.monitoring_status === 'ready' ? 100 : prodEnv?.monitoring_status === 'partial' ? 60 : 0;
  dims.push({
    id: 'monitoring',
    label: 'Monitoring',
    score: monScore,
    status: monScore >= 80 ? 'LOW' : monScore >= 50 ? 'MEDIUM' : 'HIGH',
    detail: `Production monitoring status: ${prodEnv?.monitoring_status ?? 'unknown'}.`,
  });

  // Runbooks
  const rollbackRb = runbooks.filter((r) => r.kind === 'rollback' || r.kind === 'outage' || r.kind === 'incident').length;
  const rbScore = rollbackRb >= 3 ? 100 : rollbackRb >= 1 ? 60 : 0;
  dims.push({
    id: 'runbooks',
    label: 'Runbooks',
    score: rbScore,
    status: rbScore >= 80 ? 'LOW' : rbScore >= 50 ? 'MEDIUM' : 'HIGH',
    detail: `${rollbackRb} incident/rollback/outage runbook(s) defined.`,
  });

  // Ownership
  const withOwner = runbooks.filter((r) => !!r.owner).length;
  const ownershipScore = runbooks.length === 0 ? 0 : Math.round((withOwner / runbooks.length) * 100);
  dims.push({
    id: 'ownership',
    label: 'Ownership',
    score: ownershipScore,
    status: ownershipScore >= 80 ? 'LOW' : ownershipScore >= 50 ? 'MEDIUM' : 'HIGH',
    detail: runbooks.length ? `${withOwner}/${runbooks.length} runbooks have a named owner.` : 'No runbooks defined — ownership cannot be assessed.',
  });

  const overall = Math.round(dims.reduce((a, d) => a + d.score, 0) / dims.length);
  const overallStatus: Severity = overall >= 80 ? 'LOW' : overall >= 50 ? 'MEDIUM' : 'HIGH';
  return { dimensions: dims, overall, overallStatus };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. EXECUTIVE METRICS (uses deployment events for trends)
// ─────────────────────────────────────────────────────────────────────────────

export function executiveMetrics(events: DeploymentEvent[]) {
  const total = events.length;
  const success = events.filter((e) => e.status === 'success').length;
  const failed = events.filter((e) => e.status === 'failed').length;
  const rolled = events.filter((e) => e.kind === 'rollback').length;
  const successRate = total ? Math.round((success / total) * 100) : 0;
  const rollbackRate = total ? Math.round((rolled / total) * 100) : 0;
  const failureRate = total ? Math.round((failed / total) * 100) : 0;
  // Trend: split last 30 events into halves
  const recent = events.slice(0, 30);
  const half = Math.max(1, Math.floor(recent.length / 2));
  const newer = recent.slice(0, half);
  const older = recent.slice(half);
  const newerSr = newer.length ? newer.filter((e) => e.status === 'success').length / newer.length : 0;
  const olderSr = older.length ? older.filter((e) => e.status === 'success').length / older.length : 0;
  const successTrend = Math.round((newerSr - olderSr) * 100);
  return { total, success, failed, rolled, successRate, rollbackRate, failureRate, successTrend };
}
