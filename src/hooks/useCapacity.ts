import { useEffect, useState } from 'react';
import { CapacityAssumption } from '@/lib/intelligence';

// Lightweight per-topology capacity assumptions persisted in localStorage.
// Avoids a schema migration for what is fundamentally planning state.
const key = (topologyId: string) => `valtaris.capacity.${topologyId}`;

export function useCapacityAssumptions(topologyId: string | undefined) {
  const [assumptions, setAssumptions] = useState<CapacityAssumption[]>([]);

  useEffect(() => {
    if (!topologyId) return;
    try {
      const raw = localStorage.getItem(key(topologyId));
      setAssumptions(raw ? JSON.parse(raw) : []);
    } catch {
      setAssumptions([]);
    }
  }, [topologyId]);

  const update = (next: CapacityAssumption[]) => {
    setAssumptions(next);
    if (topologyId) localStorage.setItem(key(topologyId), JSON.stringify(next));
  };

  const updateOne = (serviceId: string, patch: Partial<CapacityAssumption>) => {
    const existing = assumptions.find((a) => a.serviceId === serviceId);
    const merged: CapacityAssumption = {
      serviceId,
      currentRps: existing?.currentRps ?? 10,
      growthMultiplier6m: existing?.growthMultiplier6m ?? 1.5,
      growthMultiplier12m: existing?.growthMultiplier12m ?? 2.5,
      ceilingRps: existing?.ceilingRps ?? 100,
      ...patch,
    };
    const next = existing
      ? assumptions.map((a) => (a.serviceId === serviceId ? merged : a))
      : [...assumptions, merged];
    update(next);
  };

  return { assumptions, update, updateOne };
}
