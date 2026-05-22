import React, { useState } from 'react';
import { Topology, useTopologyDetail } from '@/hooks/useTopologies';
import { useRunbooks, useUpsertRunbook, useDeleteRunbook, Runbook, RunbookKind } from '@/hooks/useGovernance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Plus, Trash2, Pencil } from 'lucide-react';

const KINDS: RunbookKind[] = ['deployment', 'rollback', 'outage', 'incident', 'secret_rotation', 'backup_restore'];

const stepsToText = (steps: { text: string }[]) => steps.map((s) => s.text).join('\n');
const textToSteps = (text: string) => text.split('\n').map((l) => l.trim()).filter(Boolean).map((t) => ({ text: t }));

export const RunbooksPanel: React.FC<{ topology: Topology }> = ({ topology }) => {
  const { data: detail } = useTopologyDetail(topology.id);
  const { data: runbooks = [], isLoading } = useRunbooks(topology.id);
  const upsert = useUpsertRunbook(topology.id);
  const del = useDeleteRunbook(topology.id);
  const [editing, setEditing] = useState<Partial<Runbook> | null>(null);
  const [stepsText, setStepsText] = useState('');
  const [valText, setValText] = useState('');
  const [rbText, setRbText] = useState('');

  const open = (r: Partial<Runbook>) => {
    setEditing(r);
    setStepsText(stepsToText(r.steps || []));
    setValText(stepsToText(r.validation_steps || []));
    setRbText(stepsToText(r.rollback_steps || []));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Operational Runbooks</h3>
          <p className="text-sm text-muted-foreground">Step-by-step procedures for deploys, rollbacks, outages, and incidents.</p>
        </div>
        <Button size="sm" onClick={() => open({ kind: 'deployment', title: '' })}><Plus className="w-4 h-4 mr-1.5" />New runbook</Button>
      </div>

      {isLoading && <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading…</CardContent></Card>}
      {!isLoading && runbooks.length === 0 && (
        <Card><CardContent className="p-8 text-sm text-muted-foreground text-center">No runbooks yet. Create one to prepare your team for production operations.</CardContent></Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {runbooks.map((r) => {
          const svc = detail?.services.find((s) => s.id === r.service_id);
          return (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4" />{r.title}</CardTitle>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <Badge variant="outline" className="capitalize text-[10px]">{r.kind.replace('_', ' ')}</Badge>
                    {svc && <Badge variant="outline" className="text-[10px]">{svc.name}</Badge>}
                    {r.owner && <Badge variant="outline" className="text-[10px]">{r.owner}</Badge>}
                    {r.estimated_duration_minutes && <Badge variant="outline" className="text-[10px]">{r.estimated_duration_minutes}m</Badge>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => open(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => del.mutate(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {r.summary && <p className="text-muted-foreground">{r.summary}</p>}
                {r.steps.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Procedure</div>
                    <ol className="list-decimal list-inside space-y-0.5">{r.steps.map((s, i) => <li key={i}>{s.text}</li>)}</ol>
                  </div>
                )}
                {r.validation_steps.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Validation</div>
                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">{r.validation_steps.map((s, i) => <li key={i}>{s.text}</li>)}</ul>
                  </div>
                )}
                {r.rollback_steps.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Rollback</div>
                    <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">{r.rollback_steps.map((s, i) => <li key={i}>{s.text}</li>)}</ol>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? 'Edit runbook' : 'New runbook'}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Kind</Label>
                  <Select value={editing.kind} onValueChange={(v: RunbookKind) => setEditing({ ...editing, kind: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{KINDS.map((k) => <SelectItem key={k} value={k} className="capitalize">{k.replace('_', ' ')}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Attached service (optional)</Label>
                  <Select value={editing.service_id || 'none'} onValueChange={(v) => setEditing({ ...editing, service_id: v === 'none' ? null : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Topology-wide —</SelectItem>
                      {detail?.services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Title</Label>
                <Input value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Owner</Label>
                  <Input value={editing.owner || ''} onChange={(e) => setEditing({ ...editing, owner: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Est. duration (min)</Label>
                  <Input type="number" value={editing.estimated_duration_minutes || ''} onChange={(e) => setEditing({ ...editing, estimated_duration_minutes: Number(e.target.value) || null })} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Summary</Label>
                <Textarea rows={2} value={editing.summary || ''} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Procedure steps (one per line)</Label>
                <Textarea rows={5} value={stepsText} onChange={(e) => setStepsText(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Validation steps (one per line)</Label>
                <Textarea rows={3} value={valText} onChange={(e) => setValText(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Rollback steps (one per line)</Label>
                <Textarea rows={3} value={rbText} onChange={(e) => setRbText(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!editing?.kind || !editing.title) return;
                await upsert.mutateAsync({
                  ...editing,
                  steps: textToSteps(stepsText),
                  validation_steps: textToSteps(valText),
                  rollback_steps: textToSteps(rbText),
                } as any);
                setEditing(null);
              }}
              disabled={upsert.isPending}
            >Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
