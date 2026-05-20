import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEED_BLUEPRINTS, BlueprintSeed } from '@/lib/blueprints';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface Topology {
  id: string;
  user_id: string;
  name: string;
  system_key: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  topology_id: string;
  name: string;
  service_type: string;
  runtime: string | null;
  hosting_target: string | null;
  region: string | null;
  scaling_profile: string | null;
  health_check_path: string | null;
  readiness_status: 'ready' | 'partial' | 'blocked' | 'missing';
  required_secrets: string[];
  observability_requirements: string[];
  description: string | null;
  hosting_rationale: string | null;
}

export interface ServiceDependency {
  id: string;
  topology_id: string;
  from_service_id: string;
  to_service_id: string;
  dependency_type: 'sync' | 'async' | 'data' | 'secret';
  notes: string | null;
}

export interface Environment {
  id: string;
  topology_id: string;
  environment_kind: 'local' | 'development' | 'staging' | 'production';
  config_status: 'ready' | 'partial' | 'blocked' | 'missing';
  secrets_status: 'ready' | 'partial' | 'blocked' | 'missing';
  database_status: 'ready' | 'partial' | 'blocked' | 'missing';
  worker_status: 'ready' | 'partial' | 'blocked' | 'missing';
  monitoring_status: 'ready' | 'partial' | 'blocked' | 'missing';
  risk_score: number;
  notes: string | null;
}

export interface ServiceEnvState {
  id: string;
  service_id: string;
  environment_id: string;
  deployment_status: 'ready' | 'partial' | 'blocked' | 'missing';
  config_status: 'ready' | 'partial' | 'blocked' | 'missing';
  secrets_status: 'ready' | 'partial' | 'blocked' | 'missing';
  observability_status: 'covered' | 'partial' | 'missing' | 'not_required';
  last_deployed_at: string | null;
}

const DEFAULT_ENV_STATUSES: Record<
  'local' | 'development' | 'staging' | 'production',
  { config: 'ready' | 'partial' | 'blocked' | 'missing'; secrets: any; database: any; worker: any; monitoring: any }
> = {
  local: { config: 'ready', secrets: 'partial', database: 'ready', worker: 'ready', monitoring: 'missing' },
  development: { config: 'ready', secrets: 'partial', database: 'ready', worker: 'partial', monitoring: 'missing' },
  staging: { config: 'partial', secrets: 'partial', database: 'ready', worker: 'partial', monitoring: 'partial' },
  production: { config: 'missing', secrets: 'missing', database: 'partial', worker: 'missing', monitoring: 'missing' },
};

async function seedBlueprint(userId: string, blueprint: BlueprintSeed) {
  const { data: topology, error: tErr } = await supabase
    .from('topologies')
    .insert({
      user_id: userId,
      name: blueprint.name,
      system_key: blueprint.system_key,
      description: blueprint.description,
    })
    .select()
    .single();
  if (tErr || !topology) throw tErr;

  const serviceRows = blueprint.services.map((s) => ({
    topology_id: topology.id,
    name: s.name,
    service_type: s.service_type,
    runtime: s.runtime ?? null,
    hosting_target: s.hosting_target ?? null,
    region: s.region ?? null,
    scaling_profile: s.scaling_profile ?? null,
    health_check_path: s.health_check_path ?? null,
    readiness_status: s.readiness_status ?? 'missing',
    required_secrets: s.required_secrets ?? [],
    observability_requirements: s.observability_requirements ?? [],
    description: s.description ?? null,
    hosting_rationale: s.hosting_rationale ?? null,
  }));
  const { data: services, error: sErr } = await supabase
    .from('services')
    .insert(serviceRows)
    .select();
  if (sErr || !services) throw sErr;

  const keyToId = new Map<string, string>();
  blueprint.services.forEach((s, i) => keyToId.set(s.key, services[i].id));

  const depRows = blueprint.dependencies
    .map((d) => ({
      topology_id: topology.id,
      from_service_id: keyToId.get(d.from)!,
      to_service_id: keyToId.get(d.to)!,
      dependency_type: d.dependency_type,
      notes: d.notes ?? null,
    }))
    .filter((d) => d.from_service_id && d.to_service_id);
  if (depRows.length) {
    const { error: dErr } = await supabase.from('service_dependencies').insert(depRows);
    if (dErr) throw dErr;
  }

  const envRows = blueprint.environments.map((kind) => ({
    topology_id: topology.id,
    environment_kind: kind,
    config_status: DEFAULT_ENV_STATUSES[kind].config,
    secrets_status: DEFAULT_ENV_STATUSES[kind].secrets,
    database_status: DEFAULT_ENV_STATUSES[kind].database,
    worker_status: DEFAULT_ENV_STATUSES[kind].worker,
    monitoring_status: DEFAULT_ENV_STATUSES[kind].monitoring,
    risk_score: kind === 'production' ? 72 : kind === 'staging' ? 45 : 20,
  }));
  const { data: envs, error: eErr } = await supabase
    .from('environments')
    .insert(envRows)
    .select();
  if (eErr || !envs) throw eErr;

  // Seed per-service env state with sensible defaults per environment kind.
  const sesRows: any[] = [];
  envs.forEach((env) => {
    services.forEach((svc) => {
      const base =
        env.environment_kind === 'production'
          ? 'missing'
          : env.environment_kind === 'staging'
          ? 'partial'
          : svc.readiness_status === 'ready'
          ? 'ready'
          : 'partial';
      sesRows.push({
        topology_id: topology.id,
        service_id: svc.id,
        environment_id: env.id,
        deployment_status: base,
        config_status: base,
        secrets_status: svc.required_secrets?.length ? base : 'not_required' === 'not_required' ? base : base,
        observability_status: svc.observability_requirements?.length
          ? env.environment_kind === 'production'
            ? 'missing'
            : 'partial'
          : 'not_required',
      });
    });
  });
  if (sesRows.length) {
    const { error: sesErr } = await supabase.from('service_environment_state').insert(sesRows);
    if (sesErr) throw sesErr;
  }
}

export function useTopologies() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['topologies', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topologies')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Topology[];
    },
  });
}

/** Ensures the user has the seed blueprints on first login. */
export function useEnsureSeedTopologies() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: topologies, isLoading } = useTopologies();

  useEffect(() => {
    if (!user?.id || isLoading || !topologies) return;
    const existingKeys = new Set(topologies.map((t) => t.system_key));
    const missing = SEED_BLUEPRINTS.filter((b) => !existingKeys.has(b.system_key));
    if (missing.length === 0) return;
    (async () => {
      try {
        for (const bp of missing) {
          await seedBlueprint(user.id, bp);
        }
        qc.invalidateQueries({ queryKey: ['topologies'] });
      } catch (e) {
        console.error('Seed blueprints failed', e);
      }
    })();
  }, [user?.id, isLoading, topologies, qc]);
}

export function useTopologyDetail(topologyId: string | undefined) {
  return useQuery({
    queryKey: ['topology-detail', topologyId],
    enabled: !!topologyId,
    queryFn: async () => {
      const [svcRes, depRes, envRes, sesRes] = await Promise.all([
        supabase.from('services').select('*').eq('topology_id', topologyId!),
        supabase.from('service_dependencies').select('*').eq('topology_id', topologyId!),
        supabase.from('environments').select('*').eq('topology_id', topologyId!),
        supabase.from('service_environment_state').select('*').eq('topology_id', topologyId!),
      ]);
      if (svcRes.error) throw svcRes.error;
      if (depRes.error) throw depRes.error;
      if (envRes.error) throw envRes.error;
      if (sesRes.error) throw sesRes.error;
      return {
        services: (svcRes.data ?? []) as Service[],
        dependencies: (depRes.data ?? []) as ServiceDependency[],
        environments: (envRes.data ?? []) as Environment[],
        serviceEnvState: (sesRes.data ?? []) as ServiceEnvState[],
      };
    },
  });
}
