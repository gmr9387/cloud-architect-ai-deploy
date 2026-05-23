import React, { useMemo } from 'react';
import { Topology, useTopologyDetail } from '@/hooks/useTopologies';
import { runArchitectureReview, SEVERITY_CLASSES, Severity } from '@/lib/intelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Microscope } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ArchitectureReviewPanel: React.FC<{ topology: Topology }> = ({ topology }) => {
  const { data } = useTopologyDetail(topology.id);
  const findings = useMemo(
    () => (data ? runArchitectureReview(data.services, data.dependencies, data.environments) : []),
    [data],
  );
  const counts = findings.reduce((a, f) => ({ ...a, [f.severity]: (a[f.severity] || 0) + 1 }), {} as Record<Severity, number>);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Microscope className="w-5 h-5" />Architecture Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Static analysis of topology, dependencies, and operational posture. Every finding lists severity, affected services, rationale, and remediation. No black-box scoring.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={SEVERITY_CLASSES.HIGH}>{counts.HIGH || 0} HIGH</Badge>
            <Badge variant="outline" className={SEVERITY_CLASSES.MEDIUM}>{counts.MEDIUM || 0} MEDIUM</Badge>
            <Badge variant="outline" className={SEVERITY_CLASSES.LOW}>{counts.LOW || 0} LOW</Badge>
            <span className="text-xs text-muted-foreground self-center">{findings.length} findings</span>
          </div>
        </CardContent>
      </Card>

      {findings.length === 0 ? (
        <Card><CardContent className="p-8 text-sm text-muted-foreground text-center">No architecture concerns detected for this topology.</CardContent></Card>
      ) : (
        findings.map((f) => (
          <Card key={f.id} className={cn('border', SEVERITY_CLASSES[f.severity])}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-sm">{f.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wider">{f.category}</div>
                </div>
                <Badge variant="outline" className={cn('font-mono text-[10px]', SEVERITY_CLASSES[f.severity])}>{f.severity}</Badge>
              </div>
              <div className="text-xs"><span className="font-medium">Affected: </span><span className="text-muted-foreground">{f.affected.join(', ')}</span></div>
              <div className="text-xs"><span className="font-medium">Rationale: </span><span className="text-muted-foreground">{f.rationale}</span></div>
              <div className="text-xs"><span className="font-medium">Recommendation: </span><span className="text-muted-foreground">{f.recommendation}</span></div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
