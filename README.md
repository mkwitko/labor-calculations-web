# Labor Calculations Web

Web client for a Brazilian labor-law case management and settlement calculator: public landing pages and calculators, plus an authenticated workspace for law firms.

**Status:** Deployed for a private client; this repository is a source-available portfolio copy. Product copy and UI strings are in Brazilian Portuguese.

## What it does

- Public marketing site with prerendered SEO pages (calculator landing pages, methodology, privacy, terms, LGPD).
- Public labor-calculation tools (worker, HR, single-verba calculators) and shareable calculation links.
- Authenticated app: cases, clients, calculations, agenda, workflow, templates (DOCX preview/validate), team and billing screens.
- Client portal flow: invite acceptance, login, password reset.
- Referral redirect and embeddable calculator widget (`public/widget.js`).
- In-app messaging over a server-sent-events stream (`src/components/messaging`).
- Command palette, guided tours, dark/light theme.

## Screenshots

Public worker-facing flow (Portuguese UI, dark theme by default) with fictitious inputs and seed data.

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/02-calculadora-trabalhador-desktop.png" alt="Severance calculator, step 1 of 7: how the job ended"><br><sub>Severance calculator, step 1 of 7: how the job ended.</sub></td>
    <td width="50%"><img src="docs/screenshots/03-resultado-trabalhador-desktop.png" alt="Severance result: value range with itemised amounts and legal citations"><br><sub>Severance result: value range with itemised amounts and legal citations.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/04-calculadora-horas-extras-desktop.png" alt="Overtime calculator form (fictitious salary and hours)"><br><sub>Overtime calculator form (fictitious salary and hours).</sub></td>
    <td></td>
  </tr>
</table>

<table>
  <tr>
    <td width="25%"><img src="docs/screenshots/02-calculadora-trabalhador-mobile.png" alt="Severance calculator on mobile"><br><sub>Severance calculator on mobile.</sub></td>
    <td width="25%"><img src="docs/screenshots/03-resultado-trabalhador-mobile.png" alt="Severance result on mobile"><br><sub>Severance result on mobile.</sub></td>
  </tr>
</table>

## Architecture

System context: this repo is the browser client of the labor-calculations backend.

```mermaid
flowchart LR
  Lawyer([Law firm user]) --> Web
  Worker([Worker / HR visitor]) --> Web
  Client([Client portal user]) --> Web
  subgraph Edge[Cloudflare Worker + static assets]
    Web[labor-calculations-web<br/>React SPA, prerendered public pages]
    Proxy["/lxl/* analytics proxy<br/>worker/index.ts"]
  end
  Web -->|axios, cookies, x-session-id| API[labor-calculations-api]
  API -->|SSE message stream| Web
  Proxy --> PostHog
  Web --> Sentry
  API -.->|swagger.json, Orval| Web
```

Layers inside this repo:

```mermaid
flowchart TD
  Router["Lazy routes, 4 layout groups<br/>src/router/index.tsx"] --> Pages["Pages: landing, public, portal, protected<br/>src/pages"]
  Pages --> Comp["Shared components, gates, error boundaries<br/>src/components"]
  Pages --> Gen["Orval hooks (generated, gitignored)<br/>src/http/generated"]
  Comp --> Gen
  Gen --> Axios["Axios instance, 401 handling<br/>src/lib/api.ts"]
  Pages --> Stream["SSE hook with backoff<br/>src/components/messaging"]
  Env["Zod env check<br/>src/env"] -.-> Axios
```

Main flow, a public calculation (`src/pages/public/calculadora`):

```mermaid
sequenceDiagram
  participant V as Visitor
  participant W as Wizard (steps.ts)
  participant A as API
  V->>W: answer steps (audience, dates, salary, verbas)
  W->>A: POST public calculations (usePostPublicCalculations)
  A-->>W: breakdown by verba
  W-->>V: result (worker view or lawyer view), share link
  V->>A: open shared calculation or send to a lawyer
```

- The API client is generated from `swagger.json` with Orval (one file per OpenAPI tag); it is not committed.
- Pages are split by audience: `src/pages/{landing,public,portal,protected}`, each under its own lazy layout.
- A 401 on any request clears the session and redirects to the lawyer login or the client-portal login depending on the request URL (`src/lib/api.ts`).
- The message thread listens to a server-sent-events stream and falls back to polling while it is down (`src/components/messaging/use-message-stream.ts`).
- A small Cloudflare Worker exists only to reverse-proxy analytics under an opaque path; everything else is static assets with SPA fallback.
- Public pages are prerendered at build time (`scripts/prerender.mjs`).

## Key engineering decisions

- Generated, typed API layer from the OpenAPI contract: `orval.config.ts`, `src/lib/api.ts`.
- Environment validated at startup with Zod, failing fast on bad config: `src/env/index.ts`.
- First-party analytics proxy so ad blockers do not skew funnel data: `worker/index.ts`, `wrangler.jsonc`.
- Prerendering plus `drop-trailing-slash` asset handling so legal pages resolve without redirects: `scripts/prerender.mjs`, `wrangler.jsonc`.
- Route-level error boundaries and subscription/plan feature gates: `src/components/route-error-boundary.tsx`, `src/components/plan-feature-gate.tsx`.

## Tech stack

React 19, TypeScript, Vite, React Router 7, TanStack Query, Tailwind CSS 4, shadcn/Base UI, react-hook-form + Zod, Orval, Sentry, PostHog, Cloudflare Workers, Vitest, Biome/ESLint.

## Getting started

Prerequisites: Node 22, pnpm 10, a running compatible backend (see Related repositories).

```bash
pnpm install
cp .env.example .env   # fill in values (also required to run tests)
pnpm dev               # generates the API client, then starts Vite
```

| Variable | Purpose |
|---|---|
| `VITE_HTTP_API_URL` | Backend API base URL |
| `VITE_STORAGE_URL` | Public object storage base URL |
| `VITE_DEFAULT_FGTS_RATE` | Default FGTS rate (percent) |
| `VITE_DEFAULT_MINIMUM_WAGE` | Default minimum wage |
| `VITE_SENTRY_DSN` | Optional Sentry DSN |
| `VITE_POSTHOG_KEY` | Optional PostHog public project key |
| `VITE_POSTHOG_HOST` | Leave empty to use the first-party proxy |

## Testing

20 test files, 119 tests, passing with `.env` copied from `.env.example` (Vitest + Testing Library, jsdom). Coverage is thin for the size of the app: mostly utilities, hooks and a few components.

```bash
pnpm exec orval && pnpm test
npx tsc -b
```

## Project structure

```text
src/pages/        landing, public, portal, protected (app) routes
src/components/   shared and ui primitives
src/lib/          axios instance, analytics, session, query client
src/http/         generated API client (gitignored)
worker/           Cloudflare Worker (analytics proxy)
scripts/          prerender
swagger.json      API contract used for codegen
```

## Related repositories

- [labor-calculations-api](https://github.com/mkwitko/labor-calculations-api): backend for this client

## License

All rights reserved. Source available for portfolio review.
