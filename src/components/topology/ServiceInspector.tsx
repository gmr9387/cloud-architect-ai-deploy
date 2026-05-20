import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Service, ServiceDependency } from '@/hooks/useTopologies';
import { SERVICE_TYPE_LABEL, READINESS_LABEL } from '@/lib/blueprints';
import { READINESS_CLASSES } from '@/lib/readiness';
import { cn } from '@/lib/utils';
import { Server, Globe, KeyRound, Activity, ShieldAlert } from 'lucide-react';

interface Props {
  service: Service | null;
  allServices: Service[];
  dependencies: ServiceDependency[];
  onClose: () => void;
}

export const ServiceInspector: React.FC<Props> = ({ service, allServices, dependencies, onClose }) => {
  if (!service) return null;
  const outgoing = dependencies.filter((d) => d.from_service_id === service.id);
  const incoming = dependencies.filter((d) => d.to_service_id === service.id);
  const nameById = new Map(allServices.map((s) => [s.id, s.name]));

  return (
    <Sheet open={!!service} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{SERVICE_TYPE_LABEL[service.service_type as keyof typeof SERVICE_TYPE_LABEL]}</Badge>
            <Badge variant="outline" className={cn('text-xs', READINESS_CLASSES[service.readiness_status])}>
              {READINESS_LABEL[service.readiness_status]}
            </Badge>
          </div>
          <SheetTitle>{service.name}</SheetTitle>
          {service.description && <SheetDescription>{service.description}</SheetDescription>}
        </SheetHeader>

        <div className="mt-6 space-y-6 text-sm">
          <section className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2"><Server className="w-4 h-4" /> Runtime</h4>
            <dl className="grid grid-cols-3 gap-y-2 text-xs">
              <dt className="text-muted-foreground">Runtime</dt><dd className="col-span-2">{service.runtime || '—'}</dd>
              <dt className="text-muted-foreground">Hosting</dt><dd className="col-span-2">{service.hosting_target || '—'}</dd>
              <dt className="text-muted-foreground">Region</dt><dd className="col-span-2">{service.region || '—'}</dd>
              <dt className="text-muted-foreground">Scaling</dt><dd className="col-span-2">{service.scaling_profile || '—'}</dd>
              <dt className="text-muted-foreground">Health</dt><dd className="col-span-2">{service.health_check_path || '—'}</dd>
            </dl>
          </section>

          {service.hosting_rationale && (
            <section className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2"><Globe className="w-4 h-4" /> Why it runs here</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{service.hosting_rationale}</p>
            </section>
          )}

          <section className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2"><KeyRound className="w-4 h-4" /> Required secrets</h4>
            {service.required_secrets.length === 0 ? (
              <p className="text-xs text-muted-foreground">No secrets required.</p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {service.required_secrets.map((s) => (
                  <li key={s}><Badge variant="outline" className="text-[10px] font-mono">{s}</Badge></li>
                ))}
              </ul>
            )}
            <p className="text-[10px] text-muted-foreground">Names only — values never displayed.</p>
          </section>

          <section className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2"><Activity className="w-4 h-4" /> Observability requirements</h4>
            {service.observability_requirements.length === 0 ? (
              <p className="text-xs text-muted-foreground">No observability declared.</p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {service.observability_requirements.map((s) => (
                  <li key={s}><Badge variant="outline" className="text-[10px]">{s}</Badge></li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Dependencies</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground mb-1">Depends on</p>
                {outgoing.length === 0 ? <p className="text-muted-foreground/70">—</p> : (
                  <ul className="space-y-1">
                    {outgoing.map((d) => (
                      <li key={d.id} className="flex items-center justify-between">
                        <span>{nameById.get(d.to_service_id)}</span>
                        <Badge variant="outline" className="text-[9px] capitalize">{d.dependency_type}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Used by</p>
                {incoming.length === 0 ? <p className="text-muted-foreground/70">—</p> : (
                  <ul className="space-y-1">
                    {incoming.map((d) => (
                      <li key={d.id} className="flex items-center justify-between">
                        <span>{nameById.get(d.from_service_id)}</span>
                        <Badge variant="outline" className="text-[9px] capitalize">{d.dependency_type}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};
