import React, { useMemo, useState } from 'react';
import { Topology } from '@/hooks/useTopologies';
import { useDeploymentEvents, useRecordEvent, BlueprintEnv, DeploymentEventKind, DeploymentEventStatus } from '@/hooks/useGovernance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Workflow, Plus, ArrowDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CLASSES: Record<DeploymentEventStatus, string> = {
  success: 'bg-success/10 text-success border-success/30',
  failed: 'bg-destructive/10 text-destructive border-destructive/30',
  in_progress: 'bg-warning/10 text-warning border-warning/30',
  reverted: 'bg-muted/40 text-muted-foreground border-border',
};

export const CICDPanel: React.FC<{ topology: Topology }> = ({ topology }) => {
  const { data: events = [], isLoading } = useDeploymentEvents(topology.id);
  const record = useRecordEvent(topology.id);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ environment: 'production', kind: 'deploy', status: 'success' });

  const metrics = useMemo(() => {
    if (events.length === 0) return null;
    const last30 = events.filter((e) => new Date(e.occurred_at).getTime() > Date.now() - 30 * 86400000);
    const deploys = last30.filter((e) => e.kind === 'deploy');
    const successes = deploys.filter((e) => e.status === 'success').length;
    const rollbacks = last30.filter((e) => e.kind === 'rollback').length;
    const failures = last30.filter((e) => e.status === 'failed').length;
    const durations = deploys.map((e) => e.duration_seconds).filter((d): d is number => !!d);
    const avgLead = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;
    return {
      total: deploys.length,
      successRate: deploys.length ? Math.round((successes / deploys.length) * 100) : 0,
      rollbackRate: deploys.length ? Math.round((rollbacks / deploys.length) * 100) : 0,
      failures,
      avgLead,
      freq: (deploys.length / 30).toFixed(2),
    };
  }, [events]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">CI/CD Governance</h3>
          <p className="text-sm text-muted-foreground">Track deployments, failures, and rollbacks. This is governance — pipeline execution lives in your CI.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Record event</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: '30d deploys', value: metrics?.total ?? 0 },
          { label: 'Success rate', value: metrics ? `${metrics.successRate}%` : '—' },
          { label: 'Rollback rate', value: metrics ? `${metrics.rollbackRate}%` : '—' },
          { label: 'Failures', value: metrics?.failures ?? 0 },
          { label: 'Avg lead time', value: metrics?.avgLead ? `${Math.round(metrics.avgLead / 60)}m` : '—' },
        ].map((m) => (
          <Card key={m.label}><CardContent className="p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</div>
            <div className="text-2xl font-bold tabular-nums mt-1">{m.value}</div>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Workflow className="w-4 h-4" />Recent events</CardTitle></CardHeader>
        <CardContent className="p-0">
          {isLoading && <div className="p-6 text-sm text-muted-foreground">Loading…</div>}
          {!isLoading && events.length === 0 && (
            <div className="p-8 text-sm text-muted-foreground text-center">No deployment events recorded yet.</div>
          )}
          {events.map((e) => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-3 border-t border-border first:border-t-0 text-sm">
              <Badge variant="outline" className={cn('uppercase text-[10px]', STATUS_CLASSES[e.status])}>{e.status}</Badge>
              <div className="flex items-center gap-1.5 capitalize text-xs">
                {e.kind === 'rollback' ? <RotateCcw className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />} {e.kind}
              </div>
              <Badge variant="outline" className="capitalize text-[10px]">{e.environment}</Badge>
              {e.version_tag && <span className="font-mono text-xs">{e.version_tag}</span>}
              <span className="text-xs text-muted-foreground flex-1 truncate">{e.failure_reason || e.notes || ''}</span>
              <span className="text-[10px] text-muted-foreground">{new Date(e.occurred_at).toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record deployment event</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Environment</Label>
                <Select value={form.environment} onValueChange={(v) => setForm({ ...form, environment: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(['development', 'staging', 'production'] as BlueprintEnv[]).map((e) => <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Kind</Label>
                <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(['deploy', 'rollback', 'failure', 'hotfix'] as DeploymentEventKind[]).map((k) => <SelectItem key={k} value={k} className="capitalize">{k}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(['success', 'failed', 'in_progress', 'reverted'] as DeploymentEventStatus[]).map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Version tag</Label>
                <Input value={form.version_tag || ''} placeholder="v1.4.2" onChange={(e) => setForm({ ...form, version_tag: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Duration (seconds)</Label>
                <Input type="number" value={form.duration_seconds || ''} onChange={(e) => setForm({ ...form, duration_seconds: Number(e.target.value) || null })} />
              </div>
            </div>
            {form.status === 'failed' && (
              <div>
                <Label className="text-xs">Failure reason</Label>
                <Textarea rows={2} value={form.failure_reason || ''} onChange={(e) => setForm({ ...form, failure_reason: e.target.value })} />
              </div>
            )}
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea rows={2} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => { await record.mutateAsync(form); setOpen(false); setForm({ environment: 'production', kind: 'deploy', status: 'success' }); }}
              disabled={record.isPending}
            >Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
