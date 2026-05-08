# CloudDeploy

**An AI-augmented deployment dashboard that turns scattered build, ship, and monitoring signals into one explainable workflow — for solo engineers and small platform teams who don't want a Jenkins room.**

[![CI](https://github.com/your-handle/clouddeploy/actions/workflows/ci.yml/badge.svg)](https://github.com/your-handle/clouddeploy/actions)
[![Coverage](https://codecov.io/gh/your-handle/clouddeploy/branch/main/graph/badge.svg)](https://codecov.io/gh/your-handle/clouddeploy)
[![License: Apache 2.0](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](./LICENSE)

[Live Demo](https://cloud-architect-ai-deploy.lovable.app) · [Changelog](./CHANGELOG.md) · [Open an Issue](https://github.com/your-handle/clouddeploy/issues)

---

![Hero — CloudDeploy dashboard on first load](./docs/assets/hero.png)

---

## The Problem

Shipping a small product today means stitching together a CI provider, a hosting dashboard, a log viewer, an analytics tool, an error tracker, and — increasingly — a separate AI assistant for code review and image work. Each tab has its own auth, its own data model, and its own opinion about what "healthy" means. The result: deploy anxiety, slow incident response, and a stack that costs more to operate than the product earns.

---

## Solution

CloudDeploy is a single dashboard that owns the deploy → monitor → optimize loop. Projects, deployments, performance metrics, and AI-driven insights live in one authenticated workspace backed by a managed Postgres + Auth + Storage layer (Lovable Cloud). AI features — image processing, code analysis, optimization recommendations — run inline through a managed AI gateway, so there are no extra API keys to provision. You sign in, create a project, and everything else is one tab away.

---

## Key Capabilities

| Capability | What It Actually Does | Status |
|------------|----------------------|--------|
| **Authenticated Workspaces** | Email/password auth with per-user profiles and RLS-enforced data isolation | `Stable` |
| **Project Management** | Persistent CRUD on projects with framework, repo URL, and deploy timestamps | `Stable` |
| **AI Image Processor** | In-browser image transforms powered by the managed AI gateway | `Stable` |
| **Code Analyzer** | Static code review with AI-suggested improvements | `Stable` |
| **Real-Time Analytics** | Live performance, uptime, and deployment metrics | `Beta` |
| **File Upload Manager** | Drag-and-drop uploads tied to project storage | `Beta` |
| **Deployment Pipeline UI** | Visual pipeline status — backend executor pending | `Beta` |
| **Team Collaboration** | Multi-user projects, roles, audit log | `Planned` |
| **Deployment History** | Full timeline + rollback per project | `Planned` |

> `Stable` = production-ready · `Beta` = functional, API may shift · `Planned` = committed, not started

---

## Demo

![Workflow demo](./docs/assets/demo.gif)

*Caption: Sign in, create a project, run an AI code analysis, and watch live metrics — without leaving the tab.*

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Browser (React 18 + Vite)                                   │
│    ├─ Auth Context ──────────┐                               │
│    ├─ Project Hooks ─────────┤                               │
│    └─ AI Tool Components ────┤                               │
│                              ▼                               │
│              Lovable Cloud (managed Supabase)                │
│    ┌─────────────┬──────────────┬──────────────────────┐    │
│    │  Postgres   │  Auth + RLS  │  Storage + Edge Fns  │    │
│    └─────────────┴──────────────┴──────────────────────┘    │
│                              │                               │
│                              ▼                               │
│                  Lovable AI Gateway (no API key)             │
│              Gemini 2.5 / GPT-5 family models                │
└──────────────────────────────────────────────────────────────┘
```

📐 [Architecture deep-dive →](./docs/architecture.md)

**Decisions worth understanding before you fork or contribute:**

| Decision | Why | What I ruled out |
|----------|-----|------------------|
| Lovable Cloud over self-hosted Supabase | Zero-ops Postgres + Auth + Storage; one fewer dashboard | Raw Supabase project, Firebase, custom Node API |
| Lovable AI Gateway over direct OpenAI/Anthropic | No user-managed API keys; unified billing; model swap without code change | Per-provider SDKs, BYO key flow |
| Clean Architecture (entities / use-cases / adapters) | Keeps business logic testable independent of React and Supabase | Component-only architecture, Redux-centric flow |
| RLS on every table over server-enforced auth | Auth lives next to data; impossible to ship a route that forgets to check | Express middleware, manual policy checks |
| Tailwind semantic tokens over raw color classes | Single source of truth for theming; dark mode is free | Inline styles, CSS modules, styled-components |

> Full decision log: [`/docs/decisions`](./docs/decisions) — read this before proposing architectural changes.

---

## Stack

| Layer | Choice | Why This, Not That |
|-------|--------|--------------------|
| **UI** | React 18 + TypeScript | Mature ecosystem, strict types catch refactor breakage |
| **Styling** | Tailwind CSS + shadcn/ui | Tokens > stylesheets; shadcn is owned code, not a black-box dep |
| **Backend** | Lovable Cloud (Supabase) | Postgres + Auth + Storage + Edge in one provision step |
| **Database** | PostgreSQL with RLS | Auth-aware queries; no separate authz layer to drift |
| **Auth** | Supabase Auth | Email + OAuth out of the box; integrates with RLS |
| **AI** | Lovable AI Gateway | No user API keys; multi-model (Gemini, GPT-5) behind one endpoint |
| **Build** | Vite 5 | Sub-second HMR; chosen over Webpack/Turbopack for DX |
| **Testing** | Vitest + React Testing Library | Vite-native, no separate Jest config to maintain |
| **State** | React Context + custom hooks | No Redux tax for an app this size |
| **Deploy** | Lovable hosting | One-click publish; CDN + preview URLs included |

---

## Getting Started

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | `>= 18` | [nvm](https://github.com/nvm-sh/nvm) recommended |
| npm | `>= 9` | Bundled with Node |

### Local Setup

```bash
# Clone
git clone https://github.com/your-handle/clouddeploy.git
cd clouddeploy

# Install
npm ci

# Start dev server (Lovable Cloud env is auto-provisioned via .env)
npm run dev
```

Open `http://localhost:5173`. First compile is ~5s. HMR after that.

> Lovable Cloud credentials in `.env` are managed automatically — do not edit by hand.

---

## Configuration

All config is environment-variable driven. No secrets in code, ever.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_SUPABASE_URL` | ✅ | — | Lovable Cloud project URL (auto-managed) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ | — | Public anon key (auto-managed) |
| `VITE_SUPABASE_PROJECT_ID` | ✅ | — | Project identifier (auto-managed) |

Edge function secrets (e.g. AI keys) are managed via the Lovable Cloud secrets store — never committed.

---

## Usage

### Minimal Example — sign in, create a project

```typescript
import { supabase } from "@/integrations/supabase/client";

await supabase.auth.signInWithPassword({ email, password });

const { data, error } = await supabase
  .from("projects")
  .insert({ name: "my-app", framework: "react", repository_url: repo })
  .select()
  .single();
```

### Common Patterns

**Subscribing to live project changes**

```typescript
const channel = supabase
  .channel("projects")
  .on("postgres_changes",
      { event: "*", schema: "public", table: "projects" },
      (payload) => console.log(payload))
  .subscribe();
```

**Calling the AI gateway from an edge function**

```typescript
const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}` },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",
    messages: [{ role: "user", content: prompt }],
  }),
});
```

---

## Deployment

| Environment | URL | Trigger |
|-------------|-----|---------|
| **Production** | `https://cloud-architect-ai-deploy.lovable.app` | Publish from Lovable editor |
| **Preview** | Auto-generated per chat session | Every Lovable change |

### Releasing

```bash
npm version patch   # or minor / major
git push --follow-tags
```

Follows [Semantic Versioning](https://semver.org). Every release gets a [CHANGELOG](./CHANGELOG.md) entry.

---

## Testing

```bash
npm run test              # Unit (Vitest)
npm run test:coverage     # Full suite + coverage report
```

**Coverage floors** — enforced in CI:

| Scope | Floor |
|-------|-------|
| Core business logic (`use-cases/`, `entities/`) | ≥ 90% |
| Hooks and adapters | ≥ 85% |
| UI components | ≥ 70% |

---

## Security

**Do not open a public issue for vulnerabilities.**

Report privately: **your-email@domain.com**

Acknowledged within **24 hours**, resolution timeline within **72 hours**.

- Row-Level Security on every user-owned table
- No service-role keys in client code
- Dependencies scanned on every PR
- Full policy: [SECURITY.md](./SECURITY.md)

---

## Roadmap

| Version | What | Status |
|---------|------|--------|
| **v1.1** | Real deployment executor (replace UI-only pipeline) | 🟡 In progress |
| **v1.2** | Team workspaces + role-based access | 🔵 Planned |
| **v1.3** | Deployment history + one-click rollback | 🔵 Planned |
| **v2.0** | Self-hostable distribution | 🔵 Planned — RFC open |

---

## Contributing

1. **For significant changes** — open an issue first.
2. **Branch naming:** `feat/`, `fix/`, `chore/` prefixes
3. **Commits:** [Conventional Commits](https://www.conventionalcommits.org)
4. **Tests required** for any new behavior
5. **One approval** required to merge

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before your first PR.

---

## License

Apache 2.0 © Your Name

See [LICENSE](./LICENSE). Apache 2.0 was chosen over MIT for its explicit patent grant.

---

## Operational Context

This system was designed for environments where:
- deploy mistakes are expensive and need a visible audit trail
- a single operator owns the full stack and can't context-switch across five tabs
- AI assistance must be available without provisioning per-user API keys
- workflows cross auth, data, storage, and AI in a single user action
- interruptions to the deploy loop directly cost revenue

## System Philosophy

This project prioritizes:
- **deterministic workflows** over opaque automation — every action has a visible trigger
- **explainability** over magic — AI suggestions show their reasoning and source
- **operational visibility** over hidden state — RLS, logs, and metrics are first-class
- **composability** over lock-in — Clean Architecture lets the backend or AI provider swap without rewriting the UI
