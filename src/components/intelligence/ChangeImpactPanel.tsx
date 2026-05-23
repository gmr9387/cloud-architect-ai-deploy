import React, { useMemo, useState } from 'react';
import { Topology, useTopologyDetail } from '@/hooks/useTopologies';
import { analyzeChangeImpact, SEVERITY_CLASSES } from '@/lib/intelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ChangeImpactPanel: React.FC<{ topology: Topology }> = ({ topology }) => {
  const { data } = useTopologyDetail(topology.id);
  const [target, setTarget] = useState<string | null>(null);

  const report = useMemo(() => {
    if (!data || !target) return null;
    return analyzeChangeImpact(target, data.services, data.dependencies);
  }, [data, target]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-5 h-5" />Change Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Select the service you intend to change. The engine walks the dependency graph and explains the downstream blast radius before you deploy.
          </p>
          <Select value={target ?? undefined} onValueChange={setTarget}>
            <SelectTrigger className="max-w-md"><SelectValue placeholder="Select a service to change…" /></SelectTrigger>
            <SelectContent>
              {data?.services.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name} <span className="text-muted-foreground text-xs">· {s.service_type}</span></SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {report && (
        <Card className={cn('border', SEVERITY_CLASSES[report.overall])}>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Impact Report</div>
                <div className="font-semibold text-base">Change to {report.changedServiceName}</div>
              </div>
              <Badge variant="outline" className={cn('font-mono', SEVERITY_CLASSES[report.overall])}>{report.overall} IMPACT</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <Stat label="Direct downstream consumers" value={report.directDownstream.length} services={report.directDownstream.map((s) => s.name)} />
              <Stat label="Transitive consumers" value={report.transitiveDownstream.length} services={report.transitiveDownstream.map((s) => s.name)} />
              <Stat label="Upstream dependencies" value={report.directUpstream.length} services={report.directUpstream.map((s) => s.name)} />
            </div>

            <div>
              <div className="text-xs font-medium mb-1">Reasoning</div>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                {report.reasoning.map((r, i) => (<li key={i}>{r}</li>))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number; services: string[] }> = ({ label, value, services }) => (
  <div className="border border-border rounded-md p-3 bg-card/60">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="text-2xl font-bold mt-1">{value}</div>
    {services.length > 0 && (
      <div className="text-[11px] text-muted-foreground mt-1 line-clamp-3">{services.join(', ')}</div>
    )}
  </div>
);
