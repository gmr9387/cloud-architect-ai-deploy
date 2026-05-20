import { ReadinessStatus } from '@/lib/blueprints';

export const READINESS_CLASSES: Record<ReadinessStatus, string> = {
  ready: 'bg-success/10 text-success border-success/30',
  partial: 'bg-warning/10 text-warning border-warning/30',
  blocked: 'bg-destructive/10 text-destructive border-destructive/30',
  missing: 'bg-muted/40 text-muted-foreground border-border',
};

export const COVERAGE_CLASSES: Record<string, string> = {
  covered: 'bg-success/10 text-success border-success/30',
  partial: 'bg-warning/10 text-warning border-warning/30',
  missing: 'bg-destructive/10 text-destructive border-destructive/30',
  not_required: 'bg-muted/30 text-muted-foreground border-border',
};

export function readinessRank(s: ReadinessStatus): number {
  return { ready: 0, partial: 1, missing: 2, blocked: 3 }[s];
}

export function worstReadiness(values: ReadinessStatus[]): ReadinessStatus {
  if (values.length === 0) return 'missing';
  return values.reduce((acc, v) => (readinessRank(v) > readinessRank(acc) ? v : acc));
}

export interface ReadinessCheck {
  id: string;
  label: string;
  status: ReadinessStatus;
  detail?: string;
}

export function buildEnvironmentChecklist(env: {
  config_status: ReadinessStatus;
  secrets_status: ReadinessStatus;
  database_status: ReadinessStatus;
  worker_status: ReadinessStatus;
  monitoring_status: ReadinessStatus;
}): ReadinessCheck[] {
  return [
    { id: 'config', label: 'Configuration', status: env.config_status, detail: 'Environment-specific config (URLs, regions, flags) validated.' },
    { id: 'secrets', label: 'Secrets', status: env.secrets_status, detail: 'All required secrets present in the secret store for this environment.' },
    { id: 'database', label: 'Database', status: env.database_status, detail: 'Migrations applied, RLS enforced, backups configured.' },
    { id: 'workers', label: 'Workers', status: env.worker_status, detail: 'Long-running services running with healthy probes and autoscale.' },
    { id: 'monitoring', label: 'Monitoring', status: env.monitoring_status, detail: 'Logs, metrics, traces, and alerts wired to an on-call destination.' },
  ];
}

export function readinessScore(checks: ReadinessCheck[]): number {
  if (checks.length === 0) return 0;
  const points = checks.reduce((acc, c) => {
    const p = { ready: 100, partial: 60, missing: 0, blocked: 0 }[c.status];
    return acc + p;
  }, 0);
  return Math.round(points / checks.length);
}
