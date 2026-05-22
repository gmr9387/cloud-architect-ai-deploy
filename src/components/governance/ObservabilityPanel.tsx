import React, { useMemo } from 'react';
import { Topology, useTopologyDetail } from '@/hooks/useTopologies';
import { buildObservabilityCoverage, COVERAGE_CLASSES_LIKE } from '@/lib/audit-coverage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ObservabilityPanel: React.FC<{ topology: Topology }> = ({ topology }) => {
  const { data: detail } = useTopologyDetail(topology.id);
  const result = useMemo(() => detail ? buildObservabilityCoverage(detail.services, detail.environments) : null, [detail]);

  if (!result) return <Card><CardContent className="p-6 text-sm text-muted-foreground">Computing coverage…</CardContent></Card>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Activity className="w-5 h-5" />Observability Coverage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold tabular-nums">{result.score}%</span>
            <span className="text-sm text-muted-foreground">coverage across {result.rows.length} services × 4 signals</span>
          </div>
          <Progress value={result.score} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Service</th>
                <th className="text-left p-3">Logs</th>
                <th className="text-left p-3">Metrics</th>
                <th className="text-left p-3">Traces</th>
                <th className="text-left p-3">Alerts</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((r) => (
                <tr key={r.service.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="font-medium">{r.service.name}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">{r.service.service_type.replace('_', ' ')}</div>
                  </td>
                  {(['logs', 'metrics', 'traces', 'alerts'] as const).map((k) => (
                    <td key={k} className="p-3">
                      <Badge variant="outline" className={cn('capitalize', COVERAGE_CLASSES_LIKE[r[k]])}>{r[k].replace('_', ' ')}</Badge>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
