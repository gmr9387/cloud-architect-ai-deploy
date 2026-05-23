import React, { useMemo } from 'react';
import { Topology, useTopologyDetail } from '@/hooks/useTopologies';
import { useCapacityAssumptions } from '@/hooks/useCapacity';
import { projectCapacity, SEVERITY_CLASSES } from '@/lib/intelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CapacityPanel: React.FC<{ topology: Topology }> = ({ topology }) => {
  const { data } = useTopologyDetail(topology.id);
  const { assumptions, updateOne } = useCapacityAssumptions(topology.id);

  const projections = useMemo(
    () => (data ? projectCapacity(data.services, assumptions) : []),
    [data, assumptions],
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />Capacity & Scale Planning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Model load assumptions per service. Compare current, 6-month, and 12-month projections against your declared scaling ceiling. Cells turn red when projected load exceeds the ceiling.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Service</th>
                <th className="text-right p-3">Current load</th>
                <th className="text-right p-3">6m × </th>
                <th className="text-right p-3">12m × </th>
                <th className="text-right p-3">Ceiling</th>
                <th className="text-center p-3">Now</th>
                <th className="text-center p-3">+6m</th>
                <th className="text-center p-3">+12m</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p) => {
                const a = assumptions.find((x) => x.serviceId === p.service.id);
                return (
                  <tr key={p.service.id} className="border-t border-border">
                    <td className="p-3">
                      <div className="font-medium">{p.service.name}</div>
                      <div className="text-[10px] text-muted-foreground">{p.service.service_type}</div>
                    </td>
                    <td className="p-3 text-right">
                      <Input className="h-7 w-20 ml-auto text-right" type="number" value={a?.currentRps ?? 10}
                        onChange={(e) => updateOne(p.service.id, { currentRps: Number(e.target.value) })} />
                    </td>
                    <td className="p-3 text-right">
                      <Input className="h-7 w-16 ml-auto text-right" type="number" step="0.1" value={a?.growthMultiplier6m ?? 1.5}
                        onChange={(e) => updateOne(p.service.id, { growthMultiplier6m: Number(e.target.value) })} />
                    </td>
                    <td className="p-3 text-right">
                      <Input className="h-7 w-16 ml-auto text-right" type="number" step="0.1" value={a?.growthMultiplier12m ?? 2.5}
                        onChange={(e) => updateOne(p.service.id, { growthMultiplier12m: Number(e.target.value) })} />
                    </td>
                    <td className="p-3 text-right">
                      <Input className="h-7 w-20 ml-auto text-right" type="number" value={a?.ceilingRps ?? 100}
                        onChange={(e) => updateOne(p.service.id, { ceilingRps: Number(e.target.value) })} />
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className={cn('font-mono text-[10px]', SEVERITY_CLASSES[p.status_current])}>{p.current_pct}%</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className={cn('font-mono text-[10px]', SEVERITY_CLASSES[p.status_m6])}>{p.m6_pct}%</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className={cn('font-mono text-[10px]', SEVERITY_CLASSES[p.status_m12])}>{p.m12_pct}%</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground">
        Assumptions are saved locally per topology. RPS is generic — use it as requests/sec for APIs, jobs/sec for workers, or messages/sec for queues.
      </p>
    </div>
  );
};
