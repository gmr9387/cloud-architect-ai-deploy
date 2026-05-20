// Seed blueprints for first-class deployment examples.
// Used to create initial topologies for new users.

export type ServiceType =
  | 'frontend' | 'api' | 'worker' | 'edge_function' | 'database' | 'storage'
  | 'queue' | 'telemetry' | 'vault' | 'webhook_ingress' | 'scheduler' | 'observability';

export type ReadinessStatus = 'ready' | 'partial' | 'blocked' | 'missing';
export type EnvironmentKind = 'local' | 'development' | 'staging' | 'production';
export type DependencyType = 'sync' | 'async' | 'data' | 'secret';

export interface ServiceSeed {
  key: string;
  name: string;
  service_type: ServiceType;
  runtime?: string;
  hosting_target?: string;
  region?: string;
  scaling_profile?: string;
  health_check_path?: string;
  readiness_status?: ReadinessStatus;
  required_secrets?: string[];
  observability_requirements?: string[];
  description?: string;
  hosting_rationale?: string;
}

export interface DependencySeed {
  from: string;
  to: string;
  dependency_type: DependencyType;
  notes?: string;
}

export interface BlueprintSeed {
  system_key: string;
  name: string;
  description: string;
  services: ServiceSeed[];
  dependencies: DependencySeed[];
  environments: EnvironmentKind[];
}

export const API_GLUE_BLUEPRINT: BlueprintSeed = {
  system_key: 'api-glue',
  name: 'API Glue',
  description:
    'Connector orchestration platform — long-lived worker, queue tables, realtime telemetry, webhook ingress, and scheduler running against Supabase Postgres.',
  services: [
    {
      key: 'frontend',
      name: 'Operator Console',
      service_type: 'frontend',
      runtime: 'React 18 / Vite',
      hosting_target: 'Vercel',
      region: 'Global edge',
      scaling_profile: 'edge-cdn',
      readiness_status: 'partial',
      required_secrets: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'],
      observability_requirements: ['frontend-errors', 'web-vitals'],
      hosting_rationale:
        'Static React SPA — Vercel/Netlify give global CDN, preview deployments per PR, and zero infra ops.',
    },
    {
      key: 'edge-api',
      name: 'API Edge Functions',
      service_type: 'edge_function',
      runtime: 'Deno (Supabase Edge)',
      hosting_target: 'Supabase Edge',
      region: 'Multi-region',
      scaling_profile: 'request-scaled',
      readiness_status: 'partial',
      required_secrets: ['SUPABASE_SERVICE_ROLE_KEY', 'CONNECTOR_SIGNING_KEY'],
      observability_requirements: ['function-logs', 'error-rate', 'p95-latency'],
      hosting_rationale:
        'Short-lived request/response handlers that need to be close to Postgres and the user. Edge functions cold-start fast and inherit auth.',
    },
    {
      key: 'worker',
      name: 'Connector Worker',
      service_type: 'worker',
      runtime: 'Node 20 / Container',
      hosting_target: 'Fly.io',
      region: 'iad / fra',
      scaling_profile: 'min=1, max=4 (autoscale on queue depth)',
      health_check_path: '/healthz',
      readiness_status: 'partial',
      required_secrets: ['SUPABASE_SERVICE_ROLE_KEY', 'CONNECTOR_CREDENTIALS_KEY'],
      observability_requirements: ['worker-heartbeat', 'queue-depth', 'job-latency', 'traces'],
      hosting_rationale:
        'Long-running job loop with outbound HTTP retries cannot live in 60s edge functions. Fly.io / Cloud Run / Railway give always-on containers with autoscale and regional pinning.',
    },
    {
      key: 'postgres',
      name: 'Primary Postgres',
      service_type: 'database',
      runtime: 'Postgres 15',
      hosting_target: 'Supabase',
      region: 'us-east-1',
      scaling_profile: 'small (upgrade before prod)',
      readiness_status: 'ready',
      observability_requirements: ['slow-queries', 'connection-pool', 'backup-status'],
      hosting_rationale:
        'Managed Postgres with built-in Auth, RLS, Realtime, and PITR. Single source of truth.',
    },
    {
      key: 'queue-tables',
      name: 'Job Queue Tables',
      service_type: 'queue',
      runtime: 'Postgres (SKIP LOCKED)',
      hosting_target: 'Supabase Postgres',
      readiness_status: 'partial',
      observability_requirements: ['queue-depth', 'dead-letter-count', 'oldest-job-age'],
      hosting_rationale:
        'Postgres-native queue (FOR UPDATE SKIP LOCKED) avoids running a separate broker until volume justifies it. Promote to SQS/PubSub when sustained throughput > a few hundred jobs/s.',
    },
    {
      key: 'realtime',
      name: 'Realtime Telemetry',
      service_type: 'telemetry',
      runtime: 'Supabase Realtime (Phoenix)',
      hosting_target: 'Supabase',
      readiness_status: 'partial',
      observability_requirements: ['channel-count', 'fanout-latency'],
      hosting_rationale:
        'Pushes worker status + connector events to the operator console without polling. Bundled with Postgres.',
    },
    {
      key: 'webhook-ingress',
      name: 'Webhook Ingress',
      service_type: 'webhook_ingress',
      runtime: 'Deno (Supabase Edge)',
      hosting_target: 'Supabase Edge',
      readiness_status: 'partial',
      required_secrets: ['WEBHOOK_SIGNING_SECRET'],
      observability_requirements: ['webhook-success-rate', '4xx-rate', 'replay-attacks'],
      hosting_rationale:
        'Public HTTPS endpoint with HMAC signature verification. Edge keeps it isolated from internal services.',
    },
    {
      key: 'scheduler',
      name: 'Scheduler',
      service_type: 'scheduler',
      runtime: 'pg_cron + pg_net',
      hosting_target: 'Supabase Postgres',
      readiness_status: 'missing',
      observability_requirements: ['job-success-rate', 'missed-runs'],
      hosting_rationale:
        'Cron lives where the data lives. pg_cron triggers edge functions / queue inserts on schedule.',
    },
    {
      key: 'otel',
      name: 'OpenTelemetry Exporter',
      service_type: 'observability',
      runtime: 'OTLP exporter',
      hosting_target: 'Grafana Cloud / Honeycomb / Datadog',
      readiness_status: 'missing',
      required_secrets: ['OTEL_EXPORTER_OTLP_HEADERS'],
      observability_requirements: ['traces', 'metrics', 'logs'],
      hosting_rationale:
        'Vendor-neutral export — pick Grafana Cloud / Honeycomb / Datadog without rewriting instrumentation.',
    },
    {
      key: 'vault',
      name: 'Secrets Vault',
      service_type: 'vault',
      hosting_target: 'Supabase Vault / 1Password / Doppler',
      readiness_status: 'partial',
      hosting_rationale:
        'Centralized secret rotation and audit trail. Edge functions and workers pull at boot, never bake into images.',
    },
  ],
  dependencies: [
    { from: 'frontend', to: 'edge-api', dependency_type: 'sync' },
    { from: 'frontend', to: 'realtime', dependency_type: 'async' },
    { from: 'edge-api', to: 'postgres', dependency_type: 'data' },
    { from: 'edge-api', to: 'queue-tables', dependency_type: 'data' },
    { from: 'worker', to: 'queue-tables', dependency_type: 'data' },
    { from: 'worker', to: 'postgres', dependency_type: 'data' },
    { from: 'worker', to: 'vault', dependency_type: 'secret' },
    { from: 'worker', to: 'otel', dependency_type: 'async' },
    { from: 'webhook-ingress', to: 'queue-tables', dependency_type: 'async' },
    { from: 'scheduler', to: 'queue-tables', dependency_type: 'async' },
    { from: 'realtime', to: 'postgres', dependency_type: 'data' },
    { from: 'edge-api', to: 'vault', dependency_type: 'secret' },
  ],
  environments: ['local', 'development', 'staging', 'production'],
};

export const CLAIM_CLARITY_BLUEPRINT: BlueprintSeed = {
  system_key: 'claim-clarity',
  name: 'Claim Clarity',
  description:
    'Healthcare claims operations — ingestion, evidence storage, payer response processing, reimbursement analytics. Treated as PHI/PII-bearing system with stronger security posture.',
  services: [
    {
      key: 'frontend',
      name: 'Claims Console',
      service_type: 'frontend',
      runtime: 'React 18 / Vite',
      hosting_target: 'Vercel (private deploy)',
      readiness_status: 'partial',
      required_secrets: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'],
      observability_requirements: ['frontend-errors', 'auth-failures'],
      hosting_rationale:
        'Static SPA fronted by SSO. No PHI in build artifacts — all PHI fetched per-session with RLS.',
    },
    {
      key: 'postgres',
      name: 'Claims Postgres',
      service_type: 'database',
      runtime: 'Postgres 15',
      hosting_target: 'Supabase (dedicated instance)',
      region: 'us-east-1',
      readiness_status: 'partial',
      observability_requirements: ['slow-queries', 'failed-auth', 'rls-denials', 'backup-status'],
      hosting_rationale:
        'Dedicated instance (not shared compute) with PITR. All PHI tables enforce RLS by claim_owner / payer_org.',
    },
    {
      key: 'ingestion',
      name: 'Claims Ingestion Pipeline',
      service_type: 'edge_function',
      runtime: 'Deno (Supabase Edge)',
      hosting_target: 'Supabase Edge',
      readiness_status: 'missing',
      required_secrets: ['INGESTION_SIGNING_SECRET', 'SUPABASE_SERVICE_ROLE_KEY'],
      observability_requirements: ['ingest-success', 'schema-violations', 'phi-redaction-coverage'],
      hosting_rationale:
        'Validates payer EDI / FHIR payloads against schema, normalizes, writes to claims tables.',
    },
    {
      key: 'evidence-storage',
      name: 'Evidence Object Storage',
      service_type: 'storage',
      hosting_target: 'Supabase Storage (private bucket, server-side encryption)',
      readiness_status: 'missing',
      observability_requirements: ['object-access-audit', 'unauthorized-read-attempts'],
      hosting_rationale:
        'PHI-bearing PDFs/images. Private bucket, signed URLs only, KMS-backed encryption, access logged.',
    },
    {
      key: 'payer-response',
      name: 'Payer Response Processor',
      service_type: 'worker',
      runtime: 'Node 20 / Container',
      hosting_target: 'Fly.io (HIPAA-eligible region)',
      readiness_status: 'missing',
      required_secrets: ['PAYER_API_CREDENTIALS', 'SUPABASE_SERVICE_ROLE_KEY'],
      observability_requirements: ['response-latency', 'denial-rate', 'retry-budget'],
      hosting_rationale:
        'Long-running poller / processor for payer responses. Must run in HIPAA-eligible region with BAA.',
    },
    {
      key: 'analytics',
      name: 'Reimbursement Analytics',
      service_type: 'api',
      runtime: 'Deno (Supabase Edge)',
      hosting_target: 'Supabase Edge',
      readiness_status: 'missing',
      observability_requirements: ['query-latency', 'export-audit'],
      hosting_rationale:
        'Aggregate views over claims. Aggregates only — no row-level PHI in responses.',
    },
    {
      key: 'audit-log',
      name: 'Audit Log',
      service_type: 'database',
      runtime: 'Postgres (append-only)',
      hosting_target: 'Supabase Postgres',
      readiness_status: 'missing',
      observability_requirements: ['write-failures', 'tamper-attempts'],
      hosting_rationale:
        'Append-only table with trigger-enforced immutability. Required for HIPAA audit trail.',
    },
    {
      key: 'workflow-queue',
      name: 'Workflow / Appeal Queue',
      service_type: 'queue',
      runtime: 'Postgres (SKIP LOCKED)',
      hosting_target: 'Supabase Postgres',
      readiness_status: 'missing',
      observability_requirements: ['queue-depth', 'sla-breaches'],
      hosting_rationale:
        'Tracks appeal workflows with SLA timers. Postgres-native to keep transactional with claim state.',
    },
    {
      key: 'vault',
      name: 'Secrets Vault',
      service_type: 'vault',
      hosting_target: 'Supabase Vault / 1Password',
      readiness_status: 'partial',
      hosting_rationale:
        'Payer credentials rotated quarterly, audit trail required for compliance.',
    },
    {
      key: 'observability',
      name: 'Observability Stack',
      service_type: 'observability',
      hosting_target: 'Datadog (HIPAA tier)',
      readiness_status: 'missing',
      required_secrets: ['DD_API_KEY'],
      observability_requirements: ['logs', 'metrics', 'traces', 'audit-export'],
      hosting_rationale:
        'HIPAA-eligible observability vendor with BAA. PHI scrubbing in pipeline.',
    },
  ],
  dependencies: [
    { from: 'frontend', to: 'ingestion', dependency_type: 'sync' },
    { from: 'frontend', to: 'analytics', dependency_type: 'sync' },
    { from: 'ingestion', to: 'postgres', dependency_type: 'data' },
    { from: 'ingestion', to: 'evidence-storage', dependency_type: 'data' },
    { from: 'ingestion', to: 'audit-log', dependency_type: 'data' },
    { from: 'ingestion', to: 'workflow-queue', dependency_type: 'async' },
    { from: 'payer-response', to: 'workflow-queue', dependency_type: 'data' },
    { from: 'payer-response', to: 'postgres', dependency_type: 'data' },
    { from: 'payer-response', to: 'audit-log', dependency_type: 'data' },
    { from: 'payer-response', to: 'vault', dependency_type: 'secret' },
    { from: 'analytics', to: 'postgres', dependency_type: 'data' },
    { from: 'analytics', to: 'audit-log', dependency_type: 'data' },
    { from: 'ingestion', to: 'observability', dependency_type: 'async' },
    { from: 'payer-response', to: 'observability', dependency_type: 'async' },
  ],
  environments: ['local', 'development', 'staging', 'production'],
};

export const SEED_BLUEPRINTS: BlueprintSeed[] = [API_GLUE_BLUEPRINT, CLAIM_CLARITY_BLUEPRINT];

export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  frontend: 'Frontend',
  api: 'API',
  worker: 'Worker',
  edge_function: 'Edge Function',
  database: 'Database',
  storage: 'Object Storage',
  queue: 'Queue',
  telemetry: 'Telemetry',
  vault: 'Secrets Vault',
  webhook_ingress: 'Webhook Ingress',
  scheduler: 'Scheduler',
  observability: 'Observability',
};

export const READINESS_LABEL: Record<ReadinessStatus, string> = {
  ready: 'Ready',
  partial: 'Partial',
  blocked: 'Blocked',
  missing: 'Missing',
};

export const ENVIRONMENT_ORDER: EnvironmentKind[] = ['local', 'development', 'staging', 'production'];
