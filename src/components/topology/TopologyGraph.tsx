import React, { useMemo } from 'react';
import { Service, ServiceDependency } from '@/hooks/useTopologies';
import { SERVICE_TYPE_LABEL } from '@/lib/blueprints';
import { READINESS_CLASSES } from '@/lib/readiness';
import { cn } from '@/lib/utils';

interface Props {
  services: Service[];
  dependencies: ServiceDependency[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

// Group services by type into vertical lanes for a clean architecture view.
const LANE_ORDER = [
  ['frontend'],
  ['edge_function', 'api', 'webhook_ingress'],
  ['worker', 'scheduler'],
  ['queue'],
  ['database', 'storage'],
  ['telemetry', 'observability', 'vault'],
];

const LANE_LABELS = ['Client', 'Edge / API', 'Workers', 'Queue', 'Data', 'Platform'];

export const TopologyGraph: React.FC<Props> = ({ services, dependencies, selectedId, onSelect }) => {
  const layout = useMemo(() => {
    const laneIndex = new Map<string, number>();
    LANE_ORDER.forEach((types, idx) => types.forEach((t) => laneIndex.set(t, idx)));

    const lanes: Service[][] = LANE_ORDER.map(() => []);
    services.forEach((s) => {
      const idx = laneIndex.get(s.service_type) ?? LANE_ORDER.length - 1;
      lanes[idx].push(s);
    });

    const LANE_W = 200;
    const ROW_H = 84;
    const TOP = 56;
    const positions = new Map<string, { x: number; y: number }>();

    lanes.forEach((lane, laneIdx) => {
      lane.forEach((s, rowIdx) => {
        positions.set(s.id, {
          x: laneIdx * LANE_W + 24,
          y: TOP + rowIdx * ROW_H,
        });
      });
    });

    const maxRows = Math.max(1, ...lanes.map((l) => l.length));
    const width = LANE_ORDER.length * LANE_W + 24;
    const height = TOP + maxRows * ROW_H + 24;

    return { positions, width, height, lanes };
  }, [services]);

  const NODE_W = 168;
  const NODE_H = 60;

  const depColor = (t: string) =>
    ({ sync: 'hsl(var(--primary))', async: 'hsl(var(--accent))', data: 'hsl(var(--success))', secret: 'hsl(var(--warning))' }[t] ||
    'hsl(var(--muted-foreground))');

  return (
    <div className="w-full overflow-x-auto rounded-lg border bg-card/40">
      <svg width={layout.width} height={layout.height} className="block min-w-full">
        {/* Lane headers */}
        {LANE_LABELS.map((label, i) => (
          <g key={label}>
            <rect
              x={i * 200}
              y={0}
              width={200}
              height={layout.height}
              fill={i % 2 === 0 ? 'hsl(var(--muted) / 0.15)' : 'transparent'}
            />
            <text
              x={i * 200 + 24}
              y={28}
              fontSize="11"
              fontWeight="600"
              fill="hsl(var(--muted-foreground))"
              className="uppercase tracking-wider"
            >
              {label}
            </text>
          </g>
        ))}

        {/* Edges */}
        <defs>
          {['sync', 'async', 'data', 'secret'].map((t) => (
            <marker
              key={t}
              id={`arrow-${t}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" fill={depColor(t)} />
            </marker>
          ))}
        </defs>

        {dependencies.map((d) => {
          const from = layout.positions.get(d.from_service_id);
          const to = layout.positions.get(d.to_service_id);
          if (!from || !to) return null;
          const x1 = from.x + NODE_W;
          const y1 = from.y + NODE_H / 2;
          const x2 = to.x;
          const y2 = to.y + NODE_H / 2;
          const midX = (x1 + x2) / 2;
          const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
          const isAsync = d.dependency_type === 'async';
          return (
            <path
              key={d.id}
              d={path}
              stroke={depColor(d.dependency_type)}
              strokeWidth={1.5}
              fill="none"
              strokeDasharray={isAsync ? '4 3' : undefined}
              markerEnd={`url(#arrow-${d.dependency_type})`}
              opacity={selectedId && d.from_service_id !== selectedId && d.to_service_id !== selectedId ? 0.25 : 0.85}
            />
          );
        })}

        {/* Nodes */}
        {services.map((s) => {
          const p = layout.positions.get(s.id)!;
          const isSelected = s.id === selectedId;
          const statusColor =
            s.readiness_status === 'ready'
              ? 'hsl(var(--success))'
              : s.readiness_status === 'partial'
              ? 'hsl(var(--warning))'
              : s.readiness_status === 'blocked'
              ? 'hsl(var(--destructive))'
              : 'hsl(var(--muted-foreground))';
          return (
            <g
              key={s.id}
              transform={`translate(${p.x}, ${p.y})`}
              className="cursor-pointer"
              onClick={() => onSelect?.(s.id)}
            >
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={8}
                fill="hsl(var(--card))"
                stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                strokeWidth={isSelected ? 2 : 1}
              />
              <circle cx={12} cy={12} r={4} fill={statusColor} />
              <text x={24} y={16} fontSize="11" fontWeight="600" fill="hsl(var(--foreground))">
                {s.name.length > 22 ? s.name.slice(0, 21) + '…' : s.name}
              </text>
              <text x={12} y={36} fontSize="10" fill="hsl(var(--muted-foreground))">
                {SERVICE_TYPE_LABEL[s.service_type as keyof typeof SERVICE_TYPE_LABEL]}
              </text>
              <text x={12} y={50} fontSize="9" fill="hsl(var(--muted-foreground))">
                {s.hosting_target ? (s.hosting_target.length > 26 ? s.hosting_target.slice(0, 25) + '…' : s.hosting_target) : '—'}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-4 py-3 border-t text-xs text-muted-foreground">
        {[
          { t: 'sync', label: 'Sync request' },
          { t: 'async', label: 'Async / event' },
          { t: 'data', label: 'Data access' },
          { t: 'secret', label: 'Secret access' },
        ].map((e) => (
          <span key={e.t} className="flex items-center gap-2">
            <span className="inline-block w-6 h-0.5" style={{ background: depColor(e.t) }} />
            {e.label}
          </span>
        ))}
        <span className="flex items-center gap-2 ml-auto">
          {(['ready', 'partial', 'blocked', 'missing'] as const).map((r) => (
            <span key={r} className={cn('px-2 py-0.5 rounded border text-[10px] capitalize', READINESS_CLASSES[r])}>
              {r}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
};
