import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { useTopologies, useEnsureSeedTopologies } from '@/hooks/useTopologies';
import { TopologyWorkspace } from '@/components/topology/TopologyWorkspace';
import { BlueprintsPanel } from '@/components/governance/BlueprintsPanel';
import { AuditPanel } from '@/components/governance/AuditPanel';
import { RiskPanel } from '@/components/governance/RiskPanel';
import { ObservabilityPanel } from '@/components/governance/ObservabilityPanel';
import { SecretsPanel } from '@/components/governance/SecretsPanel';
import { CICDPanel } from '@/components/governance/CICDPanel';
import { RunbooksPanel } from '@/components/governance/RunbooksPanel';
import { ExportsPanel } from '@/components/governance/ExportsPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import {
  Boxes, GitBranch, KeyRound, Activity, ShieldAlert, BookOpen, Download, Workflow, ShieldCheck, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'topologies', label: 'Topologies', icon: Boxes },
  { id: 'blueprints', label: 'Blueprints', icon: FileText },
  { id: 'audits', label: 'Readiness Audits', icon: ShieldCheck },
  { id: 'pipelines', label: 'CI/CD Governance', icon: Workflow },
  { id: 'secrets', label: 'Secrets', icon: KeyRound },
  { id: 'observability', label: 'Observability', icon: Activity },
  { id: 'risks', label: 'Risks', icon: ShieldAlert },
  { id: 'runbooks', label: 'Runbooks', icon: BookOpen },
  { id: 'exports', label: 'Exports', icon: Download },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

const Index: React.FC = () => {
  const { user } = useAuth();
  useEnsureSeedTopologies();
  const { data: topologies, isLoading } = useTopologies();
  const [activeSection, setActiveSection] = useState<SectionId>('topologies');
  const [activeTopologyId, setActiveTopologyId] = useState<string | null>(null);

  useEffect(() => {
    if (topologies && topologies.length && !activeTopologyId) {
      setActiveTopologyId(topologies[0].id);
    }
  }, [topologies, activeTopologyId]);

  const activeTopology = topologies?.find((t) => t.id === activeTopologyId) || null;

  const renderSection = () => {
    if (!activeTopology) {
      return (
        <Card><CardContent className="p-8 text-sm text-muted-foreground text-center">Select a system to begin.</CardContent></Card>
      );
    }
    switch (activeSection) {
      case 'topologies': return <TopologyWorkspace key={activeTopology.id} topology={activeTopology} />;
      case 'blueprints': return <BlueprintsPanel topology={activeTopology} />;
      case 'audits': return <AuditPanel topology={activeTopology} />;
      case 'pipelines': return <CICDPanel topology={activeTopology} />;
      case 'secrets': return <SecretsPanel topology={activeTopology} />;
      case 'observability': return <ObservabilityPanel topology={activeTopology} />;
      case 'risks': return <RiskPanel topology={activeTopology} />;
      case 'runbooks': return <RunbooksPanel topology={activeTopology} />;
      case 'exports': return <ExportsPanel topology={activeTopology} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
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
                  </button>
                );
              })}
            </nav>

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
          </aside>

          <main className="col-span-12 lg:col-span-9 xl:col-span-10">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-96 w-full" />
              </div>
            ) : (
              renderSection()
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
