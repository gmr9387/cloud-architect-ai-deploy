# Cloud Architect Deploy — Production Platform Rebuild

This is a 10-module enterprise platform. Building it all in one shot would produce shallow, broken surfaces — exactly what the brief says to avoid. I'll ship it in **4 phases**, each independently usable, each grounded in real data (Supabase-backed, no fake metrics).

## Phase 1 — Foundation + Topology + Environments (this turn)

**Goal:** Replace the current demo dashboard shell with the real product spine.

**Database (new tables, RLS on all):**
- `topologies` — top-level architecture container (name, system, owner)
- `services` — typed nodes (frontend, api, worker, edge_function, database, storage, queue, telemetry, vault, webhook_ingress, scheduler, observability); fields: runtime, hosting_target, region, scaling_profile, health_check, readiness_status (ready/partial/blocked/missing)
- `service_dependencies` — directed edges with dependency_type (sync, async, data, secret)
- `environments` — local/dev/staging/production per topology, with config/secrets/db/worker/monitoring status flags + computed risk_score
- `service_environment_state` — per-service status in each environment

**UI (replaces current Index tabs):**
- New nav: Topologies · Environments · Blueprints · Pipelines · Secrets · Observability · Risks · Runbooks · Exports
- **Topology Designer**: dependency graph (custom SVG, no fake metrics), service inspector drawer, readiness badges
- **Environment Matrix**: services × environments grid showing real status; drift indicators between staging→production
- **Production Readiness Checklist** per environment, evidence-based (derived from actual service/secret/observability records)

**Seed:** Two starter topologies — API Glue and Claim Clarity — with their real service inventories from the brief (Modules 3 & 4 blueprints as data, not hardcoded pages).

## Phase 2 — Blueprints + CI/CD + Secrets (next turn)

- Blueprint detail pages for API Glue and Claim Clarity, rendered from topology data with hosting rationale ("why here") and remaining risks
- Claim Clarity gets PHI/PII risk surface, RLS checklist, retention/export controls
- CI/CD Pipeline Planner: pipeline stages table, migration risk panel, rollback plan, release readiness score
- Secrets Governance: per-environment required-vs-present matrix, rotation reminders, `.env.example` generator (no real values shown — names + status only)

## Phase 3 — Observability + Risk Scoring (next turn)

- Observability coverage map (logs/metrics/traces/alerts/uptime per service)
- Telemetry gap detector
- Risk engine: rules over topology data → severity, affected service, reason, mitigation, production impact
- Single-points-of-failure detection, queue/worker/db bottleneck heuristics

## Phase 4 — Runbooks + Exports (final turn)

- Runbook templates (first deploy, migration, rollback, incident, secret rotation, webhook outage, queue backlog, observability outage) with checklist/owner/duration/rollback/validation
- PDF/Markdown export of blueprint, readiness report, risk assessment, runbook summary

---

## Technical details (for reference)

**Stack additions:** Zustand (topology editor state), Zod (service/env schemas), Recharts (already present). Custom SVG dependency graph (no react-flow dep needed for v1).

**RLS model:** Topologies are owned by user_id; services/environments/dependencies scoped via topology ownership via security-definer helper `user_owns_topology(topology_id)`.

**Readiness scoring (Phase 1 baseline):**
- `ready` = all required fields present + dependencies resolved
- `partial` = service exists but missing secrets/observability/health_check
- `blocked` = dependency in non-ready state in same environment
- `missing` = declared in topology but no environment state row

**What's removed:** Current `AI Tools`, `Testing`, `Team`, `Insights` demo tabs and their mock components are replaced. `demoData.ts` deleted. The `projects` table stays (it's the user's portfolio of topologies) and gets re-wired to topologies.

---

**This plan covers Phase 1 only as the implementation.** Approve to ship the foundation + topology designer + environment matrix + API Glue/Claim Clarity seed. Phases 2–4 follow in subsequent turns so each module gets real depth.