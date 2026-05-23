import React, { useMemo } from 'react';
import { Topology, useTopologyDetail } from '@/hooks/useTopologies';
import { useBlueprints, useDeploymentEvents, useRunbooks } from '@/hooks/useGovernance';
import {
  runArchitectureReview, detectDrift, calculateRecoveryReadiness, executiveMetrics, SEVERITY_CLASSES,
} from '@/lib/intelligence';
import { runRiskEngine } from '@/lib/audit';
import { useSecrets } from '@/hooks/useGovernance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Building2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ExecutivePanel: React.FC<{ topology: Topology }> = ({ topology }) => {
  const { data } = useTopologyDetail(topology.id);
  const { data: blueprints = [] } = useBlueprints(topology.id);
  const { data: events = [] } = useDeploymentEvents(topology.id);
  const { data: runbooks = [] } = useRunbooks(topology.id);
  const { data: secrets = [] } = useSecrets(topology.id);

  const intel = useMemo(() => {
    if (!data) return null;
    const bpByEnv: Record<string, any> = {};
    (['development', 'staging', 'production'] as const).forEach((e) => {
      const cur = blueprints.find((b) => b.environment === e && b.is_current);
      bpByEnv[e] = {
        hasBackup: !!cur?.backup_strategy,
        hasRollback: !!cur?.rollback_strategy,
        hasCicd: !!cur?.cicd_plan,
        hasMonitoring: !!cur?.monitoring_plan,
      };
    });
    const review = runArchitectureReview(data.services, data.dependencies, data.environments);
    const risks = runRiskEngine(data.services, data.dependencies, data.environments, bpByEnv);
    const drift = detectDrift(data.services, data.dependencies, data.environments, data.serviceEnvState, blueprints, secrets);
    const recovery = calculateRecoveryReadiness(data.services, data.environments, blueprints, runbooks);
    const metrics = executiveMetrics(events);
    const archHealth = Math.max(0, 100 - review.length * 8 - risks.filter((r) => r.level === 'HIGH').length * 12);
    const driftScore = Math.max(0, 100 - drift.length * 10);
    return { review, risks, drift, recovery, metrics, archHealth, driftScore };
  }, [data, blueprints, events, runbooks, secrets]);

  if (!intel) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-5 h-5" />Executive Architecture Command Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Business continuity view: operational risk, architecture health, recovery readiness, and deployment trends. One pane for leadership, no vanity metrics.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <ExecKpi
          label="Architecture health"
          value={intel.archHealth}
          status={intel.archHealth >= 80 ? 'LOW' : intel.archHealth >= 50 ? 'MEDIUM' : 'HIGH'}
          detail={`${intel.review.length} review findings, ${intel.risks.filter(r => r.level === 'HIGH').length} high risks`}
        />
        <ExecKpi
          label="Recovery readiness"
          value={intel.recovery.overall}
          status={intel.recovery.overallStatus}
          detail="Backups, rollback, monitoring, runbooks, ownership"
        />
        <ExecKpi
          label="Drift score"
          value={intel.driftScore}
          status={intel.driftScore >= 80 ? 'LOW' : intel.driftScore >= 50 ? 'MEDIUM' : 'HIGH'}
          detail={`${intel.drift.length} drift item(s) between blueprint and reality`}
        />
        <ExecKpi
          label="Deployment success"
          value={intel.metrics.successRate}
          status={intel.metrics.successRate >= 90 ? 'LOW' : intel.metrics.successRate >= 70 ? 'MEDIUM' : 'HIGH'}
          detail={`${intel.metrics.total} deploys · ${intel.metrics.rollbackRate}% rollback`}
          trend={intel.metrics.successTrend}
        />
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Operational risk register</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {intel.risks.slice(0, 5).length === 0 && <p className="text-xs text-muted-foreground">No outstanding operational risks.</p>}
          {intel.risks.slice(0, 5).map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-3 border-b border-border last:border-0 pb-2 last:pb-0">
              <div>
                <div className="text-sm font-medium">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.affected}</div>
              </div>
              <Badge variant="outline" className={cn('font-mono text-[10px]', SEVERITY_CLASSES[r.level as 'HIGH' | 'MEDIUM' | 'LOW'])}>{r.level}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Recovery readiness breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {intel.recovery.dimensions.map((d) => (
              <div key={d.id}>
                <div className="flex justify-between text-xs"><span>{d.label}</span><span className="font-mono">{d.score}</span></div>
                <Progress value={d.score} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Deployment trend</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-xs">
            <Row label="Total recorded deploys" value={intel.metrics.total} />
            <Row label="Success rate" value={`${intel.metrics.successRate}%`} />
            <Row label="Rollback rate" value={`${intel.metrics.rollbackRate}%`} />
            <Row label="Failure rate" value={`${intel.metrics.failureRate}%`} />
            <Row label="Success rate trend" value={
              <span className="inline-flex items-center gap-1">
                {intel.metrics.successTrend > 0 ? <TrendingUp className="w-3 h-3 text-success" /> :
                 intel.metrics.successTrend < 0 ? <TrendingDown className="w-3 h-3 text-destructive" /> :
                 <Minus className="w-3 h-3" />}
                {intel.metrics.successTrend > 0 ? '+' : ''}{intel.metrics.successTrend}%
              </span>
            } />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ExecKpi: React.FC<{ label: string; value: number; status: 'LOW' | 'MEDIUM' | 'HIGH'; detail: string; trend?: number }> = ({ label, value, status, detail, trend }) => (
  <Card>
    <CardContent className="p-4 space-y-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold tabular-nums">{value}<span className="text-sm font-normal text-muted-foreground">/100</span></div>
        <Badge variant="outline" className={cn('font-mono text-[10px]', SEVERITY_CLASSES[status])}>{status}</Badge>
      </div>
      <Progress value={value} className="h-1.5" />
      <p className="text-[11px] text-muted-foreground">{detail}{trend !== undefined ? ` · trend ${trend > 0 ? '+' : ''}${trend}%` : ''}</p>
    </CardContent>
  </Card>
);

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between border-b border-border last:border-0 pb-1.5 last:pb-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-mono">{value}</span>
  </div>
);
