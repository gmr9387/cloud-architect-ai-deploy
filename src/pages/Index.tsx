import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { useTopologies, useEnsureSeedTopologies } from '@/hooks/useTopologies';
import { TopologyWorkspace } from '@/components/topology/TopologyWorkspace';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Boxes, GitBranch, KeyRound, Activity, ShieldAlert, BookOpen, Download, Workflow } from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'topologies', label: 'Topologies', icon: Boxes, phase: 1 },
  { id: 'pipelines', label: 'CI/CD Pipelines', icon: Workflow, phase: 2 },
  { id: 'secrets', label: 'Secrets', icon: KeyRound, phase: 2 },
  { id: 'observability', label: 'Observability', icon: Activity, phase: 3 },
  { id: 'risks', label: 'Risks', icon: ShieldAlert, phase: 3 },
  { id: 'runbooks', label: 'Runbooks', icon: BookOpen, phase: 4 },
  { id: 'exports', label: 'Exports', icon: Download, phase: 4 },
] as const;

const PhasePlaceholder: React.FC<{ label: string; phase: number }> = ({ label, phase }) => (
  <Card>
    <CardContent className="p-10 text-center space-y-3">
      <Badge variant="outline">Phase {phase}</Badge>
      <h3 className="text-lg font-semibold">{label}</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        This module is part of the planned rollout. Topology data, services, secrets, and observability
        requirements modeled in Phase 1 feed directly into this surface.
      </p>
    </CardContent>
  </Card>
);

const Index: React.FC = () => {
  const { user } = useAuth();
  useEnsureSeedTopologies();
  const { data: topologies, isLoading } = useTopologies();
  const [activeSection, setActiveSection] = useState<string>('topologies');
  const [activeTopologyId, setActiveTopologyId] = useState<string | null>(null);

  useEffect(() => {
    if (topologies && topologies.length && !activeTopologyId) {
      setActiveTopologyId(topologies[0].id);
    }
  }, [topologies, activeTopologyId]);

  const activeTopology = topologies?.find((t) => t.id === activeTopologyId);
  const activeSectionMeta = SECTIONS.find((s) => s.id === activeSection)!;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-3 xl:col-span-2 space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Welcome</p>
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>

            <nav className="space-y-1" aria-label="Main">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const active = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                      active ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-muted/50 text-muted-foreground',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{s.label}</span>
                    {s.phase > 1 && <span className="text-[9px] uppercase opacity-60">P{s.phase}</span>}
                  </button>
                );
              })}
            </nav>

            {activeSection === 'topologies' && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Systems</p>
                <div className="space-y-1">
                  {isLoading && <Skeleton className="h-9 w-full" />}
                  {topologies?.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTopologyId(t.id)}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                        activeTopologyId === t.id
                          ? 'bg-accent/10 text-accent border border-accent/20'
                          : 'hover:bg-muted/50',
                      )}
                    >
                      <GitBranch className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate text-left flex-1">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main */}
          <main className="col-span-12 lg:col-span-9 xl:col-span-10">
            {activeSection === 'topologies' ? (
              <>
                {isLoading || !activeTopology ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-96 w-full" />
                  </div>
                ) : (
                  <TopologyWorkspace key={activeTopology.id} topology={activeTopology} />
                )}
              </>
            ) : (
              <PhasePlaceholder label={activeSectionMeta.label} phase={activeSectionMeta.phase} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
