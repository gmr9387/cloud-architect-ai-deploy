import React from 'react';
import { Environment } from '@/hooks/useTopologies';
import { buildEnvironmentChecklist, readinessScore, READINESS_CLASSES } from '@/lib/readiness';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, MinusCircle, XCircle } from 'lucide-react';

const ICON_BY_STATUS = {
  ready: CheckCircle2,
  partial: AlertTriangle,
  missing: MinusCircle,
  blocked: XCircle,
};

export const ReadinessChecklist: React.FC<{ environments: Environment[] }> = ({ environments }) => {
  const ENV_ORDER = ['local', 'development', 'staging', 'production'];
  const sorted = [...environments].sort(
    (a, b) => ENV_ORDER.indexOf(a.environment_kind) - ENV_ORDER.indexOf(b.environment_kind),
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {sorted.map((env) => {
        const checks = buildEnvironmentChecklist(env);
        const score = readinessScore(checks);
        return (
          <Card key={env.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm capitalize">{env.environment_kind}</CardTitle>
                <Badge variant="outline" className={cn('text-xs', score >= 80 ? 'text-success border-success/30' : score >= 50 ? 'text-warning border-warning/30' : 'text-destructive border-destructive/30')}>
                  {score}% ready
                </Badge>
              </div>
              <Progress value={score} className="h-1.5 mt-2" />
              <p className="text-[10px] text-muted-foreground mt-1">Risk score: {env.risk_score}</p>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {checks.map((c) => {
                const Icon = ICON_BY_STATUS[c.status];
                return (
                  <div key={c.id} className="flex items-start gap-2 text-xs">
                    <Icon className={cn(
                      'w-3.5 h-3.5 mt-0.5 flex-shrink-0',
                      c.status === 'ready' && 'text-success',
                      c.status === 'partial' && 'text-warning',
                      c.status === 'missing' && 'text-muted-foreground',
                      c.status === 'blocked' && 'text-destructive',
                    )} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{c.label}</span>
                        <Badge variant="outline" className={cn('text-[9px] capitalize', READINESS_CLASSES[c.status])}>
                          {c.status}
                        </Badge>
                      </div>
                      {c.detail && <p className="text-muted-foreground text-[10px] mt-0.5 leading-relaxed">{c.detail}</p>}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
