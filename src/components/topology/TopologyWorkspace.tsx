import React, { useState } from 'react';
import { useTopologyDetail, Topology } from '@/hooks/useTopologies';
import { TopologyGraph } from '@/components/topology/TopologyGraph';
import { ServiceInspector } from '@/components/topology/ServiceInspector';
import { EnvironmentMatrix } from '@/components/environments/EnvironmentMatrix';
import { ReadinessChecklist } from '@/components/environments/ReadinessChecklist';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Boxes, Layers, Activity } from 'lucide-react';
import { READINESS_CLASSES } from '@/lib/readiness';
import { cn } from '@/lib/utils';

export const TopologyWorkspace: React.FC<{ topology: Topology }> = ({ topology }) => {
  const { data, isLoading } = useTopologyDetail(topology.id);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const { services, dependencies, environments, serviceEnvState } = data;
  const selectedService = services.find((s) => s.id === selectedServiceId) || null;

  const readinessCounts = services.reduce(
    (acc, s) => {
      acc[s.readiness_status] = (acc[s.readiness_status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
            <Boxes className="w-3.5 h-3.5" /> Topology · {topology.system_key}
          </div>
          <h2 className="text-2xl font-bold mt-1">{topology.name}</h2>
          {topology.description && <p className="text-sm text-muted-foreground mt-1 max-w-3xl">{topology.description}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {(['ready', 'partial', 'blocked', 'missing'] as const).map((r) => (
            <Badge key={r} variant="outline" className={cn('capitalize', READINESS_CLASSES[r])}>
              {readinessCounts[r] || 0} {r}
            </Badge>
          ))}
          <Badge variant="outline">{services.length} services</Badge>
          <Badge variant="outline">{dependencies.length} edges</Badge>
        </div>
      </header>

      <Tabs defaultValue="topology" className="space-y-4">
        <TabsList>
          <TabsTrigger value="topology"><Boxes className="w-4 h-4 mr-1.5" />Topology</TabsTrigger>
          <TabsTrigger value="environments"><Layers className="w-4 h-4 mr-1.5" />Environments</TabsTrigger>
          <TabsTrigger value="readiness"><Activity className="w-4 h-4 mr-1.5" />Readiness</TabsTrigger>
        </TabsList>

        <TabsContent value="topology" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <TopologyGraph
                services={services}
                dependencies={dependencies}
                selectedId={selectedServiceId}
                onSelect={setSelectedServiceId}
              />
              <p className="text-xs text-muted-foreground mt-3">
                Click any service to inspect runtime, secrets, observability, and dependencies.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environments">
          <EnvironmentMatrix services={services} environments={environments} serviceEnvState={serviceEnvState} />
        </TabsContent>

        <TabsContent value="readiness">
          <ReadinessChecklist environments={environments} />
        </TabsContent>
      </Tabs>

      <ServiceInspector
        service={selectedService}
        allServices={services}
        dependencies={dependencies}
        onClose={() => setSelectedServiceId(null)}
      />
    </div>
  );
};
