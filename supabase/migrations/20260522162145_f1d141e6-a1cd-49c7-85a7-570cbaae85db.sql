
-- Enums
DO $$ BEGIN
  CREATE TYPE public.blueprint_env AS ENUM ('development','staging','production');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.deployment_event_kind AS ENUM ('deploy','rollback','failure','hotfix');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.deployment_event_status AS ENUM ('success','failed','in_progress','reverted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.secret_state AS ENUM ('present','missing','expired','rotating');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.runbook_kind AS ENUM ('deployment','rollback','outage','incident','secret_rotation','backup_restore');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Deployment Blueprints (versioned)
CREATE TABLE public.deployment_blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topology_id UUID NOT NULL,
  environment public.blueprint_env NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT true,
  hosting_target TEXT,
  database_plan TEXT,
  secrets_plan TEXT,
  monitoring_plan TEXT,
  cicd_plan TEXT,
  rollback_strategy TEXT,
  backup_strategy TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_blueprints_topology ON public.deployment_blueprints(topology_id, environment, version DESC);

ALTER TABLE public.deployment_blueprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners access blueprints" ON public.deployment_blueprints
  FOR ALL TO authenticated
  USING (public.user_owns_topology(topology_id))
  WITH CHECK (public.user_owns_topology(topology_id));

CREATE TRIGGER trg_blueprints_updated BEFORE UPDATE ON public.deployment_blueprints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Deployment Events
CREATE TABLE public.deployment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topology_id UUID NOT NULL,
  service_id UUID,
  environment public.blueprint_env NOT NULL,
  kind public.deployment_event_kind NOT NULL DEFAULT 'deploy',
  status public.deployment_event_status NOT NULL DEFAULT 'success',
  version_tag TEXT,
  triggered_by TEXT,
  duration_seconds INTEGER,
  failure_reason TEXT,
  notes TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_topology ON public.deployment_events(topology_id, occurred_at DESC);

ALTER TABLE public.deployment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners access deployment events" ON public.deployment_events
  FOR ALL TO authenticated
  USING (public.user_owns_topology(topology_id))
  WITH CHECK (public.user_owns_topology(topology_id));

-- Secrets Registry (no values — only metadata)
CREATE TABLE public.secrets_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topology_id UUID NOT NULL,
  service_id UUID,
  environment public.blueprint_env NOT NULL,
  secret_name TEXT NOT NULL,
  state public.secret_state NOT NULL DEFAULT 'missing',
  last_rotated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  rotation_interval_days INTEGER,
  owner TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(topology_id, environment, secret_name, service_id)
);
CREATE INDEX idx_secrets_topology ON public.secrets_registry(topology_id, environment);

ALTER TABLE public.secrets_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners access secrets registry" ON public.secrets_registry
  FOR ALL TO authenticated
  USING (public.user_owns_topology(topology_id))
  WITH CHECK (public.user_owns_topology(topology_id));

CREATE TRIGGER trg_secrets_updated BEFORE UPDATE ON public.secrets_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Runbooks
CREATE TABLE public.runbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topology_id UUID NOT NULL,
  service_id UUID,
  kind public.runbook_kind NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  owner TEXT,
  estimated_duration_minutes INTEGER,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  validation_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  rollback_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_runbooks_topology ON public.runbooks(topology_id);

ALTER TABLE public.runbooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners access runbooks" ON public.runbooks
  FOR ALL TO authenticated
  USING (public.user_owns_topology(topology_id))
  WITH CHECK (public.user_owns_topology(topology_id));

CREATE TRIGGER trg_runbooks_updated BEFORE UPDATE ON public.runbooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
