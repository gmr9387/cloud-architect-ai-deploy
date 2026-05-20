
-- Enums
CREATE TYPE public.service_type AS ENUM (
  'frontend','api','worker','edge_function','database','storage',
  'queue','telemetry','vault','webhook_ingress','scheduler','observability'
);

CREATE TYPE public.readiness_status AS ENUM ('ready','partial','blocked','missing');
CREATE TYPE public.environment_kind AS ENUM ('local','development','staging','production');
CREATE TYPE public.dependency_type AS ENUM ('sync','async','data','secret');
CREATE TYPE public.coverage_status AS ENUM ('covered','partial','missing','not_required');

-- Topologies
CREATE TABLE public.topologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  system_key TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.topologies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view topologies" ON public.topologies FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners insert topologies" ON public.topologies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners update topologies" ON public.topologies FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners delete topologies" ON public.topologies FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Ownership helper (security definer to avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.user_owns_topology(_topology_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.topologies
    WHERE id = _topology_id AND user_id = auth.uid()
  );
$$;

-- Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topology_id UUID NOT NULL REFERENCES public.topologies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  service_type public.service_type NOT NULL,
  runtime TEXT,
  hosting_target TEXT,
  region TEXT,
  scaling_profile TEXT,
  health_check_path TEXT,
  readiness_status public.readiness_status NOT NULL DEFAULT 'missing',
  required_secrets TEXT[] NOT NULL DEFAULT '{}',
  observability_requirements TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  hosting_rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners access services" ON public.services FOR ALL TO authenticated
USING (public.user_owns_topology(topology_id))
WITH CHECK (public.user_owns_topology(topology_id));

-- Dependencies
CREATE TABLE public.service_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topology_id UUID NOT NULL REFERENCES public.topologies(id) ON DELETE CASCADE,
  from_service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  to_service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  dependency_type public.dependency_type NOT NULL DEFAULT 'sync',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_service_id, to_service_id, dependency_type)
);

ALTER TABLE public.service_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners access dependencies" ON public.service_dependencies FOR ALL TO authenticated
USING (public.user_owns_topology(topology_id))
WITH CHECK (public.user_owns_topology(topology_id));

-- Environments
CREATE TABLE public.environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topology_id UUID NOT NULL REFERENCES public.topologies(id) ON DELETE CASCADE,
  environment_kind public.environment_kind NOT NULL,
  config_status public.readiness_status NOT NULL DEFAULT 'missing',
  secrets_status public.readiness_status NOT NULL DEFAULT 'missing',
  database_status public.readiness_status NOT NULL DEFAULT 'missing',
  worker_status public.readiness_status NOT NULL DEFAULT 'missing',
  monitoring_status public.readiness_status NOT NULL DEFAULT 'missing',
  risk_score INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (topology_id, environment_kind)
);

ALTER TABLE public.environments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners access environments" ON public.environments FOR ALL TO authenticated
USING (public.user_owns_topology(topology_id))
WITH CHECK (public.user_owns_topology(topology_id));

-- Per-service state inside an environment
CREATE TABLE public.service_environment_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topology_id UUID NOT NULL REFERENCES public.topologies(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  environment_id UUID NOT NULL REFERENCES public.environments(id) ON DELETE CASCADE,
  deployment_status public.readiness_status NOT NULL DEFAULT 'missing',
  config_status public.readiness_status NOT NULL DEFAULT 'missing',
  secrets_status public.readiness_status NOT NULL DEFAULT 'missing',
  observability_status public.coverage_status NOT NULL DEFAULT 'missing',
  last_deployed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (service_id, environment_id)
);

ALTER TABLE public.service_environment_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners access service env state" ON public.service_environment_state FOR ALL TO authenticated
USING (public.user_owns_topology(topology_id))
WITH CHECK (public.user_owns_topology(topology_id));

-- updated_at triggers
CREATE TRIGGER trg_topologies_updated BEFORE UPDATE ON public.topologies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_environments_updated BEFORE UPDATE ON public.environments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_ses_updated BEFORE UPDATE ON public.service_environment_state
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_services_topology ON public.services(topology_id);
CREATE INDEX idx_deps_topology ON public.service_dependencies(topology_id);
CREATE INDEX idx_envs_topology ON public.environments(topology_id);
CREATE INDEX idx_ses_topology ON public.service_environment_state(topology_id);
CREATE INDEX idx_ses_env ON public.service_environment_state(environment_id);
