import React, { useMemo } from 'react';
import { Topology, useTopologyDetail } from '@/hooks/useTopologies';
import { useBlueprints } from '@/hooks/useGovernance';
import { runRiskEngine, RISK_LEVEL_CLASSES, RiskLevel } from '@/lib/audit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export const RiskPanel: React.FC<{ topology: Topology }> = ({ topology }) => {
  const { data: detail } = useTopologyDetail(topology.id);
  const { data: blueprints = [] } = useBlueprints(topology.id);

  const findings = useMemo(() => {
    if (!detail) return [];
    const blueprintsByEnv: Record<string, any> = {};
    (['development', 'staging', 'production'] as const).forEach((e) => {
      const cur = blueprints.find((b) => b.environment === e && b.is_current);
      blueprintsByEnv[e] = {
        hasBackup: !!cur?.backup_strategy,
        hasRollback: !!cur?.rollback_strategy,
        hasCicd: !!cur?.cicd_plan,
        hasMonitoring: !!cur?.monitoring_plan,
      };
    });
    return runRiskEngine(detail.services, detail.dependencies, detail.environments, blueprintsByEnv);
  }, [detail, blueprints]);

  const counts = findings.reduce((acc, f) => ({ ...acc, [f.level]: (acc[f.level] || 0) + 1 }), {} as Record<RiskLevel, number>);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="w-5 h-5" />Deployment Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="outline" className={RISK_LEVEL_CLASSES.HIGH}>{counts.HIGH || 0} HIGH</Badge>
          <Badge variant="outline" className={RISK_LEVEL_CLASSES.MEDIUM}>{counts.MEDIUM || 0} MEDIUM</Badge>
          <Badge variant="outline" className={RISK_LEVEL_CLASSES.LOW}>{counts.LOW || 0} LOW</Badge>
          <span className="text-xs text-muted-foreground self-center">{findings.length} active findings</span>
        </CardContent>
      </Card>

      {findings.length === 0 ? (
        <Card><CardContent className="p-8 text-sm text-muted-foreground text-center">No active risks detected. Keep blueprints and audits current.</CardContent></Card>
      ) : (
        findings.map((f) => (
          <Card key={f.id} className={cn(RISK_LEVEL_CLASSES[f.level], 'border')}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-sm">{f.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Affected: {f.affected} · Category: {f.category}</div>
                </div>
                <Badge variant="outline" className={cn('font-mono text-[10px]', RISK_LEVEL_CLASSES[f.level])}>{f.level}</Badge>
              </div>
              <div className="text-xs"><span className="font-medium">Why it matters: </span><span className="text-muted-foreground">{f.explanation}</span></div>
              <div className="text-xs"><span className="font-medium">Mitigation: </span><span className="text-muted-foreground">{f.mitigation}</span></div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
