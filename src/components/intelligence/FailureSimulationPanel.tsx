import React, { useMemo, useState } from 'react';
import { Topology, useTopologyDetail } from '@/hooks/useTopologies';
import { useRunbooks } from '@/hooks/useGovernance';
import { simulateFailure, FailureKind, SEVERITY_CLASSES } from '@/lib/intelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FlaskConical, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const KINDS: { value: FailureKind; label: string }[] = [
  { value: 'service_outage', label: 'Service outage' },
  { value: 'database_outage', label: 'Database outage' },
  { value: 'queue_outage', label: 'Queue outage' },
  { value: 'secret_expiration', label: 'Secret expiration' },
  { value: 'monitoring_failure', label: 'Monitoring failure' },
];

export const FailureSimulationPanel: React.FC<{ topology: Topology }> = ({ topology }) => {
  const { data } = useTopologyDetail(topology.id);
  const { data: runbooks = [] } = useRunbooks(topology.id);
  const [kind, setKind] = useState<FailureKind>('service_outage');
  const [target, setTarget] = useState<string | null>(null);

  const candidates = useMemo(() => {
    if (!data) return [];
    if (kind === 'database_outage') return data.services.filter((s) => s.service_type === 'database');
    if (kind === 'queue_outage') return data.services.filter((s) => s.service_type === 'queue');
    if (kind === 'monitoring_failure') return [];
    return data.services;
  }, [data, kind]);

  const result = useMemo(() => {
    if (!data) return null;
    if (kind !== 'monitoring_failure' && !target) return null;
    return simulateFailure(kind, target, data.services, data.dependencies, runbooks);
  }, [data, kind, target, runbooks]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />Failure Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2 text-xs text-warning">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Simulation only. Nothing is executed against your environments. This models the blast radius of a hypothetical failure.</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Failure scenario</label>
              <Select value={kind} onValueChange={(v: FailureKind) => { setKind(v); setTarget(null); }}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KINDS.map((k) => (<SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            {kind !== 'monitoring_failure' && (
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Target</label>
                <Select value={target ?? undefined} onValueChange={setTarget}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a target service…" /></SelectTrigger>
                  <SelectContent>
                    {candidates.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className={cn('border', SEVERITY_CLASSES[result.severity])}>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Simulation result</div>
                <div className="font-semibold text-base">{KINDS.find((k) => k.value === result.kind)?.label} · {result.targetName}</div>
              </div>
              <Badge variant="outline" className={cn('font-mono', SEVERITY_CLASSES[result.severity])}>{result.severity}</Badge>
            </div>

            <div>
              <div className="text-xs font-medium mb-1">Business impact</div>
              <p className="text-xs text-muted-foreground">{result.businessImpact}</p>
            </div>

            <div>
              <div className="text-xs font-medium mb-1">Impacted services ({result.impactedServices.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {result.impactedServices.map((s) => (
                  <Badge key={s.id} variant="outline" className="text-[10px]">{s.name}</Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium mb-1">Recovery path</div>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                {result.recoveryPath.map((r, i) => (<li key={i}>{r}</li>))}
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
