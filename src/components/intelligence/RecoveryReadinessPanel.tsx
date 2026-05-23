import React, { useMemo } from 'react';
import { Topology, useTopologyDetail } from '@/hooks/useTopologies';
import { useBlueprints, useRunbooks } from '@/hooks/useGovernance';
import { calculateRecoveryReadiness, SEVERITY_CLASSES } from '@/lib/intelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LifeBuoy } from 'lucide-react';
import { cn } from '@/lib/utils';

export const RecoveryReadinessPanel: React.FC<{ topology: Topology }> = ({ topology }) => {
  const { data } = useTopologyDetail(topology.id);
  const { data: blueprints = [] } = useBlueprints(topology.id);
  const { data: runbooks = [] } = useRunbooks(topology.id);

  const result = useMemo(() => {
    if (!data) return null;
    return calculateRecoveryReadiness(data.services, data.environments, blueprints, runbooks);
  }, [data, blueprints, runbooks]);

  if (!result) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <LifeBuoy className="w-5 h-5" />Recovery Readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Overall score</div>
              <div className="text-4xl font-bold tabular-nums">{result.overall}<span className="text-base font-normal text-muted-foreground">/100</span></div>
            </div>
            <Badge variant="outline" className={cn('font-mono', SEVERITY_CLASSES[result.overallStatus])}>{result.overallStatus} risk</Badge>
          </div>
          <Progress value={result.overall} className="mt-3" />
          <p className="text-xs text-muted-foreground mt-3">
            Recovery readiness measures whether you can recover from incidents, not whether you can avoid them. Score is the average across five operational dimensions.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {result.dimensions.map((d) => (
          <Card key={d.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{d.label}</div>
                <Badge variant="outline" className={cn('font-mono text-[10px]', SEVERITY_CLASSES[d.status])}>{d.score}</Badge>
              </div>
              <Progress value={d.score} />
              <p className="text-xs text-muted-foreground">{d.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
