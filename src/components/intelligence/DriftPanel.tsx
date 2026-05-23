import React, { useMemo } from 'react';
import { Topology, useTopologyDetail } from '@/hooks/useTopologies';
import { useBlueprints, useSecrets } from '@/hooks/useGovernance';
import { detectDrift, SEVERITY_CLASSES } from '@/lib/intelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitCompare } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DriftPanel: React.FC<{ topology: Topology }> = ({ topology }) => {
  const { data } = useTopologyDetail(topology.id);
  const { data: blueprints = [] } = useBlueprints(topology.id);
  const { data: secrets = [] } = useSecrets(topology.id);

  const items = useMemo(() => {
    if (!data) return [];
    return detectDrift(data.services, data.dependencies, data.environments, data.serviceEnvState, blueprints, secrets);
  }, [data, blueprints, secrets]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <GitCompare className="w-5 h-5" />Architecture Drift
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Compares the declared production blueprint to the recorded environment state. Detects missing services, configuration drift, undocumented dependencies, monitoring drift, and backup drift.
          </p>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <Card><CardContent className="p-8 text-sm text-muted-foreground text-center">No drift detected. Production matches the current blueprint.</CardContent></Card>
      ) : (
        items.map((d) => (
          <Card key={d.id} className={cn('border', SEVERITY_CLASSES[d.severity])}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-sm">{d.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wider">{d.area} · {d.affected}</div>
                </div>
                <Badge variant="outline" className={cn('font-mono text-[10px]', SEVERITY_CLASSES[d.severity])}>{d.severity}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="border border-border rounded p-2"><span className="font-medium">Expected: </span><span className="text-muted-foreground">{d.expected}</span></div>
                <div className="border border-border rounded p-2"><span className="font-medium">Actual: </span><span className="text-muted-foreground">{d.actual}</span></div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
