import React, { useMemo } from 'react';
import { Topology, useTopologyDetail } from '@/hooks/useTopologies';
import { useBlueprints, useSecrets } from '@/hooks/useGovernance';
import { runAudit, AUDIT_LEVEL_CLASSES, AuditLevel } from '@/lib/audit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS: Record<AuditLevel, React.ReactNode> = {
  PASS: <CheckCircle2 className="w-4 h-4 text-success" />,
  WARNING: <AlertTriangle className="w-4 h-4 text-warning" />,
  FAIL: <XCircle className="w-4 h-4 text-destructive" />,
};

export const AuditPanel: React.FC<{ topology: Topology }> = ({ topology }) => {
  const { data: detail, isLoading } = useTopologyDetail(topology.id);
  const { data: blueprints = [] } = useBlueprints(topology.id);
  const { data: secrets = [] } = useSecrets(topology.id);

  const result = useMemo(() => {
    if (!detail) return null;
    const secretsByEnv: Record<string, any[]> = {};
    secrets.forEach((s) => {
      (secretsByEnv[s.environment] ||= []).push({ name: s.secret_name, state: s.state });
    });
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
    return runAudit({
      services: detail.services,
      dependencies: detail.dependencies,
      environments: detail.environments,
      serviceEnvState: detail.serviceEnvState,
      secretsByEnv,
      blueprintsByEnv,
      recentFailures: 0,
      hasRunbooks: false,
    });
  }, [detail, blueprints, secrets]);

  if (isLoading || !result) return <Card><CardContent className="p-6 text-sm text-muted-foreground">Running audit…</CardContent></Card>;

  const counts = result.checks.reduce(
    (acc, c) => ({ ...acc, [c.level]: (acc[c.level] || 0) + 1 }),
    {} as Record<AuditLevel, number>,
  );

  const byEnv = result.checks.reduce((acc, c) => {
    const k = c.environment || 'cross-env';
    (acc[k] ||= []).push(c);
    return acc;
  }, {} as Record<string, typeof result.checks>);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="w-5 h-5" />Deployment Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold tabular-nums">{result.score}%</span>
            <span className="text-sm text-muted-foreground">readiness across {result.checks.length} checks</span>
          </div>
          <Progress value={result.score} />
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="outline" className={AUDIT_LEVEL_CLASSES.PASS}>{counts.PASS || 0} PASS</Badge>
            <Badge variant="outline" className={AUDIT_LEVEL_CLASSES.WARNING}>{counts.WARNING || 0} WARNING</Badge>
            <Badge variant="outline" className={AUDIT_LEVEL_CLASSES.FAIL}>{counts.FAIL || 0} FAIL</Badge>
          </div>
        </CardContent>
      </Card>

      {Object.entries(byEnv).map(([env, checks]) => (
        <Card key={env}>
          <CardHeader className="pb-2"><CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">{env}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {checks.map((c) => (
              <div key={c.id} className={cn('flex items-start gap-3 p-3 rounded border', AUDIT_LEVEL_CLASSES[c.level])}>
                <div className="mt-0.5">{ICONS[c.level]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{c.title}</span>
                    <Badge variant="outline" className="text-[10px] capitalize">{c.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.detail}</p>
                </div>
                <Badge variant="outline" className={cn('font-mono text-[10px]', AUDIT_LEVEL_CLASSES[c.level])}>{c.level}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
