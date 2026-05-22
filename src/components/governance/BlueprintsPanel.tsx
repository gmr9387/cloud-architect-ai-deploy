import React, { useMemo, useState } from 'react';
import { useTopologyDetail, Topology } from '@/hooks/useTopologies';
import { useBlueprints, useUpsertBlueprint, useSecrets, BlueprintEnv, DeploymentBlueprint } from '@/hooks/useGovernance';
import { runAudit, AUDIT_LEVEL_CLASSES } from '@/lib/audit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GitCompare, Plus, Pencil, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const ENVS: BlueprintEnv[] = ['development', 'staging', 'production'];
const FIELDS: { key: keyof DeploymentBlueprint; label: string; rows?: number }[] = [
  { key: 'hosting_target', label: 'Hosting Target' },
  { key: 'database_plan', label: 'Database' },
  { key: 'secrets_plan', label: 'Secrets', rows: 3 },
  { key: 'monitoring_plan', label: 'Monitoring', rows: 3 },
  { key: 'cicd_plan', label: 'CI/CD', rows: 3 },
  { key: 'rollback_strategy', label: 'Rollback Strategy', rows: 3 },
  { key: 'backup_strategy', label: 'Backup Strategy', rows: 3 },
  { key: 'notes', label: 'Notes', rows: 2 },
];

const emptyBlueprint = (env: BlueprintEnv): Partial<DeploymentBlueprint> => ({ environment: env });

export const BlueprintsPanel: React.FC<{ topology: Topology }> = ({ topology }) => {
  const { data: blueprints = [], isLoading } = useBlueprints(topology.id);
  const { data: secrets = [] } = useSecrets(topology.id);
  const { data: detail } = useTopologyDetail(topology.id);
  const upsert = useUpsertBlueprint(topology.id);
  const [editing, setEditing] = useState<Partial<DeploymentBlueprint> | null>(null);
  const [newVersionMode, setNewVersionMode] = useState(false);
  const [compareEnv, setCompareEnv] = useState<BlueprintEnv | null>(null);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);

  const byEnv = useMemo(() => {
    const m: Record<BlueprintEnv, DeploymentBlueprint[]> = { development: [], staging: [], production: [] };
    blueprints.forEach((b) => m[b.environment].push(b));
    return m;
  }, [blueprints]);

  const auditScore = useMemo(() => {
    if (!detail) return null;
    const secretsByEnv: Record<string, any[]> = {};
    secrets.forEach((s) => {
      (secretsByEnv[s.environment] ||= []).push({ name: s.secret_name, state: s.state, expiresAt: s.expires_at });
    });
    const blueprintsByEnv: Record<string, any> = {};
    ENVS.forEach((e) => {
      const current = byEnv[e].find((b) => b.is_current);
      blueprintsByEnv[e] = {
        hasBackup: !!current?.backup_strategy,
        hasRollback: !!current?.rollback_strategy,
        hasCicd: !!current?.cicd_plan,
        hasMonitoring: !!current?.monitoring_plan,
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
    }).score;
  }, [detail, secrets, byEnv]);

  if (isLoading) return <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading blueprints…</CardContent></Card>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Deployment Blueprints</h3>
          <p className="text-sm text-muted-foreground">Versioned per-environment deployment plans. Compare versions to audit changes.</p>
        </div>
        {auditScore !== null && (
          <Badge variant="outline" className="text-sm">Blueprint coverage drives audit score: {auditScore}%</Badge>
        )}
      </div>

      <Tabs defaultValue="production">
        <TabsList>
          {ENVS.map((e) => (
            <TabsTrigger key={e} value={e} className="capitalize">{e}</TabsTrigger>
          ))}
        </TabsList>

        {ENVS.map((e) => (
          <TabsContent key={e} value={e} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{e}</Badge>
                <span className="text-xs text-muted-foreground">{byEnv[e].length} version(s)</span>
              </div>
              <div className="flex gap-2">
                {byEnv[e].length >= 2 && (
                  <Button size="sm" variant="outline" onClick={() => { setCompareEnv(e); setCompareA(byEnv[e][0].id); setCompareB(byEnv[e][1].id); }}>
                    <GitCompare className="w-4 h-4 mr-1.5" /> Compare versions
                  </Button>
                )}
                {byEnv[e].some((b) => b.is_current) ? (
                  <Button size="sm" variant="outline" onClick={() => { setEditing(byEnv[e].find((b) => b.is_current) || emptyBlueprint(e)); setNewVersionMode(true); }}>
                    <Plus className="w-4 h-4 mr-1.5" /> New version
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => { setEditing(emptyBlueprint(e)); setNewVersionMode(false); }}>
                    <Plus className="w-4 h-4 mr-1.5" /> Create blueprint
                  </Button>
                )}
              </div>
            </div>

            {byEnv[e].length === 0 ? (
              <Card><CardContent className="p-8 text-sm text-muted-foreground text-center">
                No blueprint for {e}. Create one to drive the readiness audit.
              </CardContent></Card>
            ) : (
              byEnv[e].map((bp) => (
                <Card key={bp.id} className={cn(bp.is_current && 'border-primary/40')}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4" /> v{bp.version}
                      {bp.is_current && <Badge variant="default">Current</Badge>}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setEditing(bp); setNewVersionMode(false); }}><Pencil className="w-3.5 h-3.5" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {FIELDS.filter((f) => bp[f.key]).map((f) => (
                      <div key={String(f.key)}>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</div>
                        <div className="whitespace-pre-wrap">{String(bp[f.key])}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {newVersionMode ? 'New blueprint version' : editing?.id ? 'Edit blueprint' : 'Create blueprint'} — <span className="capitalize">{editing?.environment}</span>
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              {FIELDS.map((f) => (
                <div key={String(f.key)}>
                  <Label className="text-xs">{f.label}</Label>
                  {f.rows && f.rows > 1 ? (
                    <Textarea rows={f.rows} value={(editing[f.key] as string) || ''} onChange={(ev) => setEditing({ ...editing, [f.key]: ev.target.value })} />
                  ) : (
                    <Input value={(editing[f.key] as string) || ''} onChange={(ev) => setEditing({ ...editing, [f.key]: ev.target.value })} />
                  )}
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!editing?.environment) return;
                await upsert.mutateAsync({ ...editing, environment: editing.environment, newVersion: newVersionMode });
                setEditing(null);
                setNewVersionMode(false);
              }}
              disabled={upsert.isPending}
            >
              {newVersionMode ? 'Publish new version' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare dialog */}
      <Dialog open={!!compareEnv} onOpenChange={(o) => !o && setCompareEnv(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compare blueprint versions — <span className="capitalize">{compareEnv}</span></DialogTitle>
          </DialogHeader>
          {compareEnv && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[{ id: 'a', val: compareA, set: setCompareA }, { id: 'b', val: compareB, set: setCompareB }].map((s) => (
                  <Select key={s.id} value={s.val || ''} onValueChange={s.set}>
                    <SelectTrigger><SelectValue placeholder="Select version" /></SelectTrigger>
                    <SelectContent>
                      {byEnv[compareEnv].map((b) => <SelectItem key={b.id} value={b.id}>v{b.version}{b.is_current ? ' (current)' : ''}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ))}
              </div>
              <div className="space-y-3">
                {FIELDS.map((f) => {
                  const aVal = (byEnv[compareEnv].find((b) => b.id === compareA)?.[f.key] as string) || '';
                  const bVal = (byEnv[compareEnv].find((b) => b.id === compareB)?.[f.key] as string) || '';
                  const same = aVal === bVal;
                  return (
                    <div key={String(f.key)} className={cn('grid grid-cols-2 gap-3 p-3 rounded border', same ? 'border-border' : 'border-warning/40 bg-warning/5')}>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.label} · A</div>
                        <div className="text-sm whitespace-pre-wrap">{aVal || <span className="text-muted-foreground italic">empty</span>}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.label} · B {!same && <Badge variant="warning" className="ml-1">changed</Badge>}</div>
                        <div className="text-sm whitespace-pre-wrap">{bVal || <span className="text-muted-foreground italic">empty</span>}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
