import React, { useState } from 'react';
import { Topology, useTopologyDetail, Service } from '@/hooks/useTopologies';
import { useRunbooks } from '@/hooks/useGovernance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Library, Search } from 'lucide-react';
import { READINESS_CLASSES } from '@/lib/readiness';
import { cn } from '@/lib/utils';

export const KnowledgeBasePanel: React.FC<{ topology: Topology }> = ({ topology }) => {
  const { data } = useTopologyDetail(topology.id);
  const { data: runbooks = [] } = useRunbooks(topology.id);
  const [q, setQ] = useState('');

  const filtered = (data?.services ?? []).filter((s) =>
    !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.service_type.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Library className="w-5 h-5" />Architecture Knowledge Base
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Every service rendered as institutional knowledge: purpose, dependencies, deployment strategy, recovery path, and operational notes. Pulled from your topology + runbook records.
          </p>
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search services…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map((s) => (
          <ServiceKnowledgeCard
            key={s.id}
            service={s}
            allServices={data!.services}
            dependencies={data!.dependencies}
            runbooks={runbooks.filter((r) => r.service_id === s.id || r.service_id === null)}
          />
        ))}
      </div>
    </div>
  );
};

const ServiceKnowledgeCard: React.FC<{
  service: Service;
  allServices: Service[];
  dependencies: { from_service_id: string; to_service_id: string; dependency_type: string }[];
  runbooks: { id: string; kind: string; title: string; owner: string | null }[];
}> = ({ service, allServices, dependencies, runbooks }) => {
  const byId = new Map(allServices.map((s) => [s.id, s]));
  const upstream = dependencies.filter((d) => d.from_service_id === service.id).map((d) => byId.get(d.to_service_id)?.name).filter(Boolean) as string[];
  const downstream = dependencies.filter((d) => d.to_service_id === service.id).map((d) => byId.get(d.from_service_id)?.name).filter(Boolean) as string[];
  const rollback = runbooks.find((r) => r.kind === 'rollback');
  const incident = runbooks.find((r) => r.kind === 'incident' || r.kind === 'outage');

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-semibold text-sm">{service.name}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{service.service_type} · {service.runtime ?? '—'}</div>
          </div>
          <Badge variant="outline" className={cn('text-[10px] capitalize', READINESS_CLASSES[service.readiness_status])}>{service.readiness_status}</Badge>
        </div>

        {service.description && <p className="text-xs text-muted-foreground">{service.description}</p>}

        <KvRow label="Purpose" value={service.description || 'Not documented'} />
        <KvRow label="Hosting" value={service.hosting_target || 'Not declared'} />
        <KvRow label="Hosting rationale" value={service.hosting_rationale || 'Not documented'} />
        <KvRow label="Region" value={service.region || '—'} />
        <KvRow label="Scaling profile" value={service.scaling_profile || 'Not declared'} />
        <KvRow label="Health check" value={service.health_check_path || 'Not exposed'} />

        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Dependencies</div>
          <div className="text-xs mt-0.5">
            <span className="text-muted-foreground">Depends on: </span>{upstream.length ? upstream.join(', ') : '—'}
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Depended on by: </span>{downstream.length ? downstream.join(', ') : '—'}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Required secrets</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {(service.required_secrets || []).map((s) => (<Badge key={s} variant="outline" className="text-[10px] font-mono">{s}</Badge>))}
            {!service.required_secrets?.length && <span className="text-xs text-muted-foreground">None declared</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="border border-border rounded p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Recovery strategy</div>
            <div className="text-xs mt-0.5">{rollback ? rollback.title : 'No rollback runbook attached'}</div>
            {rollback?.owner && <div className="text-[10px] text-muted-foreground">Owner: {rollback.owner}</div>}
          </div>
          <div className="border border-border rounded p-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Incident response</div>
            <div className="text-xs mt-0.5">{incident ? incident.title : 'No incident runbook attached'}</div>
            {incident?.owner && <div className="text-[10px] text-muted-foreground">Owner: {incident.owner}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const KvRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-xs grid grid-cols-[110px_1fr] gap-2">
    <span className="text-muted-foreground">{label}</span>
    <span>{value}</span>
  </div>
);
