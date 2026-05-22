import React, { useMemo, useState } from 'react';
import { Topology } from '@/hooks/useTopologies';
import { useSecrets, useUpsertSecret, BlueprintEnv, SecretState, SecretRecord } from '@/hooks/useGovernance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KeyRound, Plus, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

const ENVS: BlueprintEnv[] = ['development', 'staging', 'production'];
const STATE_CLASSES: Record<SecretState, string> = {
  present: 'bg-success/10 text-success border-success/30',
  missing: 'bg-destructive/10 text-destructive border-destructive/30',
  expired: 'bg-destructive/10 text-destructive border-destructive/30',
  rotating: 'bg-warning/10 text-warning border-warning/30',
};

export const SecretsPanel: React.FC<{ topology: Topology }> = ({ topology }) => {
  const { data: secrets = [], isLoading } = useSecrets(topology.id);
  const upsert = useUpsertSecret(topology.id);
  const [editing, setEditing] = useState<Partial<SecretRecord> | null>(null);

  const byEnv = useMemo(() => {
    const m: Record<BlueprintEnv, SecretRecord[]> = { development: [], staging: [], production: [] };
    secrets.forEach((s) => m[s.environment].push(s));
    return m;
  }, [secrets]);

  if (isLoading) return <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading registry…</CardContent></Card>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Secrets Registry</h3>
          <p className="text-sm text-muted-foreground">Tracks required secrets, state, and rotation. Values are never stored or displayed.</p>
        </div>
        <Button size="sm" onClick={() => setEditing({ environment: 'production', state: 'missing' })}>
          <Plus className="w-4 h-4 mr-1.5" /> Register secret
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {ENVS.map((e) => {
          const list = byEnv[e];
          const missing = list.filter((s) => s.state === 'missing' || s.state === 'expired').length;
          return (
            <Card key={e}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm capitalize flex items-center justify-between">
                  <span className="flex items-center gap-2"><KeyRound className="w-4 h-4" />{e}</span>
                  <Badge variant="outline" className={missing ? STATE_CLASSES.missing : STATE_CLASSES.present}>{list.length - missing}/{list.length} ok</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {list.length === 0 && <div className="text-xs text-muted-foreground py-3 text-center">No secrets registered for {e}.</div>}
                {list.map((s) => {
                  const daysToExpiry = s.expires_at ? Math.ceil((new Date(s.expires_at).getTime() - Date.now()) / 86400000) : null;
                  const expiringSoon = daysToExpiry !== null && daysToExpiry <= 14 && daysToExpiry >= 0;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setEditing(s)}
                      className="w-full text-left p-2 rounded border border-border hover:bg-muted/30 transition flex items-center gap-2"
                    >
                      <Badge variant="outline" className={cn('text-[10px] uppercase', STATE_CLASSES[s.state])}>{s.state}</Badge>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs truncate">{s.secret_name}</div>
                        <div className="text-[10px] text-muted-foreground flex gap-2">
                          {s.owner && <span>owner: {s.owner}</span>}
                          {daysToExpiry !== null && <span className={expiringSoon ? 'text-warning' : ''}>{daysToExpiry < 0 ? 'expired' : `${daysToExpiry}d`}</span>}
                        </div>
                      </div>
                      <Pencil className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? 'Edit secret' : 'Register secret'}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Environment</Label>
                  <Select value={editing.environment} onValueChange={(v: BlueprintEnv) => setEditing({ ...editing, environment: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ENVS.map((e) => <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">State</Label>
                  <Select value={editing.state} onValueChange={(v: SecretState) => setEditing({ ...editing, state: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{(['present', 'missing', 'expired', 'rotating'] as SecretState[]).map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Secret name</Label>
                <Input value={editing.secret_name || ''} placeholder="STRIPE_SECRET_KEY" onChange={(e) => setEditing({ ...editing, secret_name: e.target.value })} disabled={!!editing.id} />
                <p className="text-[10px] text-muted-foreground mt-1">We store the name and metadata only — never the value.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Owner</Label>
                  <Input value={editing.owner || ''} placeholder="@platform-team" onChange={(e) => setEditing({ ...editing, owner: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Rotation interval (days)</Label>
                  <Input type="number" value={editing.rotation_interval_days || ''} onChange={(e) => setEditing({ ...editing, rotation_interval_days: Number(e.target.value) || null })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Last rotated</Label>
                  <Input type="date" value={editing.last_rotated_at?.slice(0, 10) || ''} onChange={(e) => setEditing({ ...editing, last_rotated_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                </div>
                <div>
                  <Label className="text-xs">Expires at</Label>
                  <Input type="date" value={editing.expires_at?.slice(0, 10) || ''} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!editing?.environment || !editing.secret_name) return;
                await upsert.mutateAsync(editing as any);
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
