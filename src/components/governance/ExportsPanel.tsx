import React, { useMemo } from 'react';
import { Topology, useTopologyDetail } from '@/hooks/useTopologies';
import { useBlueprints, useSecrets, useDeploymentEvents } from '@/hooks/useGovernance';
import { runAudit, runRiskEngine, buildObservabilityCoverage } from '@/lib/audit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText } from 'lucide-react';

function downloadFile(name: string, content: string, mime = 'text/markdown') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export const ExportsPanel: React.FC<{ topology: Topology }> = ({ topology }) => {
  const { data: detail } = useTopologyDetail(topology.id);
  const { data: blueprints = [] } = useBlueprints(topology.id);
  const { data: secrets = [] } = useSecrets(topology.id);
  const { data: events = [] } = useDeploymentEvents(topology.id);

  const reports = useMemo(() => {
    if (!detail) return null;
    const secretsByEnv: Record<string, any[]> = {};
    secrets.forEach((s) => (secretsByEnv[s.environment] ||= []).push({ name: s.secret_name, state: s.state }));
    const blueprintsByEnv: Record<string, any> = {};
    (['development', 'staging', 'production'] as const).forEach((e) => {
      const cur = blueprints.find((b) => b.environment === e && b.is_current);
      blueprintsByEnv[e] = {
        hasBackup: !!cur?.backup_strategy,
        hasRollback: !!cur?.rollback_strategy,
        hasCicd: !!cur?.cicd_plan,
        hasMonitoring: !!cur?.monitoring_plan,
      };
    });
    const audit = runAudit({
      services: detail.services,
      dependencies: detail.dependencies,
      environments: detail.environments,
      serviceEnvState: detail.serviceEnvState,
      secretsByEnv,
      blueprintsByEnv,
      recentFailures: events.filter((e) => e.status === 'failed').length,
      hasRunbooks: false,
    });
    const risks = runRiskEngine(detail.services, detail.dependencies, detail.environments, blueprintsByEnv);
    const observability = buildObservabilityCoverage(detail.services, detail.environments);
    return { audit, risks, observability };
  }, [detail, blueprints, secrets, events]);

  if (!detail || !reports) return <Card><CardContent className="p-6 text-sm text-muted-foreground">Preparing reports…</CardContent></Card>;

  const date = new Date().toISOString().slice(0, 10);

  const buildReadiness = () => `# Deployment Readiness Report — ${topology.name}
_Generated ${date}_

## Score
**${reports.audit.score}%** across ${reports.audit.checks.length} checks.

## Findings
${reports.audit.checks.map((c) => `- **[${c.level}]** ${c.title}${c.environment ? ` (${c.environment})` : ''} — ${c.detail}`).join('\n')}
`;

  const buildArchitecture = () => `# Architecture Report — ${topology.name}
_Generated ${date}_

## Description
${topology.description || ''}

## Services (${detail.services.length})
${detail.services.map((s) => `### ${s.name}
- **Type:** ${s.service_type}
- **Runtime:** ${s.runtime || '—'}
- **Hosting:** ${s.hosting_target || '—'}
- **Region:** ${s.region || '—'}
- **Readiness:** ${s.readiness_status}
- **Required secrets:** ${(s.required_secrets || []).join(', ') || '—'}
- **Observability:** ${(s.observability_requirements || []).join(', ') || '—'}
${s.hosting_rationale ? `\n_${s.hosting_rationale}_` : ''}`).join('\n\n')}

## Dependencies (${detail.dependencies.length})
${detail.dependencies.map((d) => {
  const from = detail.services.find((s) => s.id === d.from_service_id)?.name;
  const to = detail.services.find((s) => s.id === d.to_service_id)?.name;
  return `- ${from} → ${to} (${d.dependency_type})`;
}).join('\n')}
`;

  const buildRisk = () => `# Risk Report — ${topology.name}
_Generated ${date}_

${reports.risks.length === 0 ? '_No active risks detected._' : reports.risks.map((r) => `## [${r.level}] ${r.title}
- **Affected:** ${r.affected}
- **Category:** ${r.category}
- **Why:** ${r.explanation}
- **Mitigation:** ${r.mitigation}`).join('\n\n')}
`;

  const buildObservability = () => `# Observability Report — ${topology.name}
_Generated ${date}_

## Coverage Score: ${reports.observability.score}%

| Service | Logs | Metrics | Traces | Alerts |
|---|---|---|---|---|
${reports.observability.rows.map((r) => `| ${r.service.name} | ${r.logs} | ${r.metrics} | ${r.traces} | ${r.alerts} |`).join('\n')}
`;

  const EXPORTS = [
    { name: 'Deployment Readiness Report', desc: 'Pass/warning/fail audit + readiness score.', build: buildReadiness, file: `readiness-${topology.system_key}-${date}.md` },
    { name: 'Architecture Report', desc: 'Services, runtimes, hosting, dependencies.', build: buildArchitecture, file: `architecture-${topology.system_key}-${date}.md` },
    { name: 'Risk Report', desc: 'SPOFs, drift, missing backups/rollback/monitoring.', build: buildRisk, file: `risk-${topology.system_key}-${date}.md` },
    { name: 'Observability Report', desc: 'Logs/metrics/traces/alerts coverage matrix.', build: buildObservability, file: `observability-${topology.system_key}-${date}.md` },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Exports</h3>
        <p className="text-sm text-muted-foreground">Generate auditable Markdown reports. PDF-ready — paste into your governance tooling or convert with any Markdown-to-PDF pipeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {EXPORTS.map((ex) => (
          <Card key={ex.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" />{ex.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{ex.desc}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => downloadFile(ex.file, ex.build())}>
                  <Download className="w-4 h-4 mr-1.5" />Download .md
                </Button>
                <Badge variant="outline" className="text-[10px] self-center">PDF-ready</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
