import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type BlueprintEnv = 'development' | 'staging' | 'production';
export type DeploymentEventKind = 'deploy' | 'rollback' | 'failure' | 'hotfix';
export type DeploymentEventStatus = 'success' | 'failed' | 'in_progress' | 'reverted';
export type SecretState = 'present' | 'missing' | 'expired' | 'rotating';
export type RunbookKind = 'deployment' | 'rollback' | 'outage' | 'incident' | 'secret_rotation' | 'backup_restore';

export interface DeploymentBlueprint {
  id: string;
  topology_id: string;
  environment: BlueprintEnv;
  version: number;
  is_current: boolean;
  hosting_target: string | null;
  database_plan: string | null;
  secrets_plan: string | null;
  monitoring_plan: string | null;
  cicd_plan: string | null;
  rollback_strategy: string | null;
  backup_strategy: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeploymentEvent {
  id: string;
  topology_id: string;
  service_id: string | null;
  environment: BlueprintEnv;
  kind: DeploymentEventKind;
  status: DeploymentEventStatus;
  version_tag: string | null;
  triggered_by: string | null;
  duration_seconds: number | null;
  failure_reason: string | null;
  notes: string | null;
  occurred_at: string;
}

export interface SecretRecord {
  id: string;
  topology_id: string;
  service_id: string | null;
  environment: BlueprintEnv;
  secret_name: string;
  state: SecretState;
  last_rotated_at: string | null;
  expires_at: string | null;
  rotation_interval_days: number | null;
  owner: string | null;
  notes: string | null;
}

export interface Runbook {
  id: string;
  topology_id: string;
  service_id: string | null;
  kind: RunbookKind;
  title: string;
  summary: string | null;
  owner: string | null;
  estimated_duration_minutes: number | null;
  steps: { text: string }[];
  validation_steps: { text: string }[];
  rollback_steps: { text: string }[];
  updated_at: string;
}

export function useBlueprints(topologyId?: string) {
  return useQuery({
    queryKey: ['blueprints', topologyId],
    enabled: !!topologyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deployment_blueprints')
        .select('*')
        .eq('topology_id', topologyId!)
        .order('environment')
        .order('version', { ascending: false });
      if (error) throw error;
      return (data ?? []) as DeploymentBlueprint[];
    },
  });
}

export function useUpsertBlueprint(topologyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<DeploymentBlueprint> & { environment: BlueprintEnv; newVersion?: boolean }) => {
      if (input.newVersion) {
        // Mark prior current as not current, create new version.
        const { data: prior } = await supabase
          .from('deployment_blueprints')
          .select('version')
          .eq('topology_id', topologyId)
          .eq('environment', input.environment)
          .order('version', { ascending: false })
          .limit(1);
        const nextVersion = (prior?.[0]?.version ?? 0) + 1;
        await supabase
          .from('deployment_blueprints')
          .update({ is_current: false })
          .eq('topology_id', topologyId)
          .eq('environment', input.environment);
        const { error } = await supabase.from('deployment_blueprints').insert({
          topology_id: topologyId,
          environment: input.environment,
          version: nextVersion,
          is_current: true,
          hosting_target: input.hosting_target ?? null,
          database_plan: input.database_plan ?? null,
          secrets_plan: input.secrets_plan ?? null,
          monitoring_plan: input.monitoring_plan ?? null,
          cicd_plan: input.cicd_plan ?? null,
          rollback_strategy: input.rollback_strategy ?? null,
          backup_strategy: input.backup_strategy ?? null,
          notes: input.notes ?? null,
        });
        if (error) throw error;
      } else if (input.id) {
        const { error } = await supabase
          .from('deployment_blueprints')
          .update({
            hosting_target: input.hosting_target,
            database_plan: input.database_plan,
            secrets_plan: input.secrets_plan,
            monitoring_plan: input.monitoring_plan,
            cicd_plan: input.cicd_plan,
            rollback_strategy: input.rollback_strategy,
            backup_strategy: input.backup_strategy,
            notes: input.notes,
          })
          .eq('id', input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('deployment_blueprints').insert({
          topology_id: topologyId,
          environment: input.environment,
          version: 1,
          is_current: true,
          hosting_target: input.hosting_target ?? null,
          database_plan: input.database_plan ?? null,
          secrets_plan: input.secrets_plan ?? null,
          monitoring_plan: input.monitoring_plan ?? null,
          cicd_plan: input.cicd_plan ?? null,
          rollback_strategy: input.rollback_strategy ?? null,
          backup_strategy: input.backup_strategy ?? null,
          notes: input.notes ?? null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blueprints', topologyId] }),
  });
}

export function useDeploymentEvents(topologyId?: string) {
  return useQuery({
    queryKey: ['deployment-events', topologyId],
    enabled: !!topologyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deployment_events')
        .select('*')
        .eq('topology_id', topologyId!)
        .order('occurred_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as DeploymentEvent[];
    },
  });
}

export function useRecordEvent(topologyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<DeploymentEvent> & { environment: BlueprintEnv; kind: DeploymentEventKind; status: DeploymentEventStatus }) => {
      const { error } = await supabase.from('deployment_events').insert({
        topology_id: topologyId,
        environment: input.environment,
        kind: input.kind,
        status: input.status,
        version_tag: input.version_tag ?? null,
        triggered_by: input.triggered_by ?? null,
        duration_seconds: input.duration_seconds ?? null,
        failure_reason: input.failure_reason ?? null,
        notes: input.notes ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deployment-events', topologyId] }),
  });
}

export function useSecrets(topologyId?: string) {
  return useQuery({
    queryKey: ['secrets-registry', topologyId],
    enabled: !!topologyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('secrets_registry')
        .select('*')
        .eq('topology_id', topologyId!)
        .order('environment')
        .order('secret_name');
      if (error) throw error;
      return (data ?? []) as SecretRecord[];
    },
  });
}

export function useUpsertSecret(topologyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<SecretRecord> & { environment: BlueprintEnv; secret_name: string }) => {
      if (input.id) {
        const { error } = await supabase
          .from('secrets_registry')
          .update({
            state: input.state,
            last_rotated_at: input.last_rotated_at,
            expires_at: input.expires_at,
            rotation_interval_days: input.rotation_interval_days,
            owner: input.owner,
            notes: input.notes,
          })
          .eq('id', input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('secrets_registry').insert({
          topology_id: topologyId,
          environment: input.environment,
          secret_name: input.secret_name,
          state: input.state ?? 'missing',
          last_rotated_at: input.last_rotated_at ?? null,
          expires_at: input.expires_at ?? null,
          rotation_interval_days: input.rotation_interval_days ?? null,
          owner: input.owner ?? null,
          notes: input.notes ?? null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secrets-registry', topologyId] }),
  });
}

export function useRunbooks(topologyId?: string) {
  return useQuery({
    queryKey: ['runbooks', topologyId],
    enabled: !!topologyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('runbooks')
        .select('*')
        .eq('topology_id', topologyId!)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Runbook[];
    },
  });
}

export function useUpsertRunbook(topologyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Runbook> & { kind: RunbookKind; title: string }) => {
      const payload = {
        topology_id: topologyId,
        kind: input.kind,
        title: input.title,
        summary: input.summary ?? null,
        owner: input.owner ?? null,
        estimated_duration_minutes: input.estimated_duration_minutes ?? null,
        service_id: input.service_id ?? null,
        steps: input.steps ?? [],
        validation_steps: input.validation_steps ?? [],
        rollback_steps: input.rollback_steps ?? [],
      };
      if (input.id) {
        const { error } = await supabase.from('runbooks').update(payload).eq('id', input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('runbooks').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['runbooks', topologyId] }),
  });
}

export function useDeleteRunbook(topologyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('runbooks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['runbooks', topologyId] }),
  });
}
