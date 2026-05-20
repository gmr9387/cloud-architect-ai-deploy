import React from 'react';
import { Service, Environment, ServiceEnvState } from '@/hooks/useTopologies';
import { READINESS_CLASSES, COVERAGE_CLASSES } from '@/lib/readiness';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Props {
  services: Service[];
  environments: Environment[];
  serviceEnvState: ServiceEnvState[];
}

const ENV_ORDER = ['local', 'development', 'staging', 'production'] as const;

export const EnvironmentMatrix: React.FC<Props> = ({ services, environments, serviceEnvState }) => {
  const envs = [...environments].sort(
    (a, b) => ENV_ORDER.indexOf(a.environment_kind as any) - ENV_ORDER.indexOf(b.environment_kind as any),
  );
  const stateLookup = new Map<string, ServiceEnvState>();
  serviceEnvState.forEach((s) => stateLookup.set(`${s.service_id}:${s.environment_id}`, s));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Environment Matrix</CardTitle>
        <p className="text-xs text-muted-foreground">
          Per-service deployment status across environments. Drift between staging and production is the highest signal.
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left font-medium py-2 pr-4 sticky left-0 bg-card">Service</th>
              {envs.map((e) => (
                <th key={e.id} className="text-left font-medium py-2 px-3 capitalize">{e.environment_kind}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map((svc) => (
              <tr key={svc.id} className="border-b border-border/40 hover:bg-muted/30">
                <td className="py-2 pr-4 sticky left-0 bg-card">
                  <div className="font-medium">{svc.name}</div>
                  <div className="text-[10px] text-muted-foreground">{svc.hosting_target || '—'}</div>
                </td>
                {envs.map((env) => {
                  const s = stateLookup.get(`${svc.id}:${env.id}`);
                  if (!s) return <td key={env.id} className="py-2 px-3 text-muted-foreground">—</td>;
                  return (
                    <td key={env.id} className="py-2 px-3 align-top">
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className={cn('text-[10px] w-fit capitalize', READINESS_CLASSES[s.deployment_status])}>
                          deploy: {s.deployment_status}
                        </Badge>
                        <Badge variant="outline" className={cn('text-[10px] w-fit capitalize', READINESS_CLASSES[s.secrets_status])}>
                          secrets: {s.secrets_status}
                        </Badge>
                        <Badge variant="outline" className={cn('text-[10px] w-fit capitalize', COVERAGE_CLASSES[s.observability_status])}>
                          obs: {s.observability_status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
