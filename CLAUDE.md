# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Generate API client (orval) then start Vite dev server
pnpm build        # Generate API client, type-check, then build
pnpm lint         # Run ESLint
pnpm start        # Generate API client (prod) then start Vite dev server
```

No test suite is configured.

## Environment

Requires a `.env` file with:
```
VITE_HTTP_API_URL=<backend URL>
VITE_STORAGE_URL=<storage URL>
```

The `src/env/index.ts` validates these at runtime via Zod — the app will throw on startup if they're missing.

## Architecture

**API layer (generated):** The backend API is defined in `swagger.json`. Running `pnpm orval` regenerates `src/http/generated/` using [Orval](https://orval.dev/) in `tags-split` mode — one file per OpenAPI tag. These files produce React Query hooks (`useXxx`) backed by the Axios instance in `src/lib/api.ts`. **Never edit files in `src/http/generated/` by hand.**

**Routing:** `src/router/index.tsx` uses React Router v7. Two layout groups:
- `/authentication` → `PublicLayout` (sign-in, sign-up)
- `""` → `AppLayout` (protected; auth-checks via `useCheckAuth` hook and redirects to `/authentication` if unauthenticated)

**Providers:** `src/providers.tsx` wraps the whole app in `ThemeProvider` (dark/light, persisted to localStorage) → `QueryClientProvider` → `Toaster` (sonner).

**UI components:** `src/components/ui/` holds shadcn/ui primitives. Application-level components live directly in `src/components/`. Pages live under `src/pages/protected/` and `src/pages/public/`.

**Styling:** User tailwind with index.css variables; avoid using style

**CleanCode:** Always try to organize into smaller reusable components. If a component is only used in one page then create it inside the page folder as a component, hook, util etc

**Path alias:** `@/` resolves to `src/`.

**Linting/formatting:** Biome (`@biomejs/biome`). Orval is configured to run Biome on generated files automatically.

## API Source of Truth

The backend API is documented in `swagger.md` (generated from the OpenAPI spec).

* **Always use `swagger.md` as the primary reference** for endpoints, request/response formats, and authentication.
* Do **not infer API shapes manually** if they are defined in `swagger.md`.
* Prefer using the generated React Query hooks in `src/http/generated/` (created by Orval) instead of calling endpoints directly.

### Workflow for API-related tasks

When implementing features that interact with the backend:

1. Look up the endpoint in `swagger.md`
2. Identify the corresponding generated hook in `src/http/generated/`
3. Use the existing hook (`useXxx`) instead of writing custom fetch logic

### Notes

* `swagger.json` is the raw OpenAPI spec (machine-oriented)
* `swagger.md` is optimized for readability and AI reasoning
* Both files are generated — do not edit manually

## Organização, papel e assentos

A **organização ativa não é estado do front**: vem do cookie de sessão e o back a
resolve a cada request. Ler por `useOrganizations()`; trocar é
`POST /auth/switch-organization` seguido de `queryClient.clear()` — todo dado em
cache pertence à organização anterior, e mantê-lo mostraria caso de um escritório
sob o cabeçalho de outro.

`useOrgAbilities()` espelha a matriz de papéis do back (`src/services/tenant/visibility.ts`)
e serve **só para esconder UI**. A autoridade é a API, que devolve 403 (verbo
negado) ou 404 (invisível). Esconder um botão nunca substitui a checagem do
servidor.

`/convite/:token` é rota fixa acordada com o back — `buildInviteUrl` monta
`${CLIENT_URL}/convite/${token}`. Mudar o caminho quebra todo convite já enviado.
Criar conta **não** abre sessão, então o token viaja por `?next=` (restrito a
`/convite/` para não virar redirect aberto) pela cadeia cadastro → login → aceite.

**Preço e teto vêm do Stripe**, nunca de constante: `usePlans()` lê
`GET /billing/plans` (planos por escritório, com `maxMembers` e o preço do
advogado adicional em `extraMember`), `useGetOrganizationPlan` dá a ocupação
(`members de maxMembers`, convite pendente já conta) e `usePreviewPlan` o valor
da troca. Escrever valor à mão foi o que fez a landing anunciar um preço enquanto
a fatura cobrava outro.

Convite que estoura o teto volta **409** com a mensagem do plano: a tela mostra o
caminho para `/assinatura` em vez de deixar tentar de novo. Troca de plano
acontece no app (`ChangePlanDialog`), não no Customer Portal.

## Theme Tokens
- Never hardcode `text-white` or `text-black` — use semantic tokens
- Over a `bg-primary` background: use `text-primary-foreground`, `bg-primary-foreground/15`, `border-primary-foreground/20`
- Standard text: `text-foreground` / `text-muted-foreground`; surfaces: `bg-background` / `bg-card`
- Always verify both light and dark themes when editing color-related styles

## Forms & Multi-Step Conventions
- Draft saving fires ONLY on explicit button click — never on step change or field blur
- Validation errors display only for the current step's fields, never future steps
- Use `Controller` for numeric inputs; filter out negatives unless explicitly required
- Step state persists across back-navigation — do not reset on prev-step

## Agent Rules
Do NOT spawn subagents automatically. Handle all tasks directly in the main session.
Only use subagents when explicitly asked.

