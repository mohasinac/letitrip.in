# LetItRip Copilot Instructions

> **MANDATORY rules — every tier, every file, no exceptions.**  
> Full rule details: [`.github/instructions/`](.github/instructions/)  
> Full codebase reference: [`docs/GUIDE.md`](docs/GUIDE.md)

---

## Developer Environment

**OS**: Windows 11 | **Shell**: PowerShell | **Workspace**: `D:\proj\letitrip.in`

- Chain commands with `;` — NEVER `&&`
- Use backslash paths in terminal; forward slashes in imports
- **NEVER write scripts to fix source files** — use `multi_replace_string_in_file` / `replace_string_in_file` only
- **PowerShell/Python writes to `src/`, `messages/`, or `scripts/seed-data/` require explicit UTF-8-no-BOM encoding, double-verification of the command before execution, and a corruption check after writing** — see Rule 28-B in `rules-code-quality.instructions.md`.

## Stack

Next.js 16.1.6 (App Router) · React 19.2 · TypeScript · Tailwind CSS · Firebase (Auth, Firestore, Storage, Realtime DB) · Resend · TanStack Query v5 · react-hook-form v7 · Server Actions · React Context + hooks

**npm packages** (`@mohasinac/*` scope, v1.4.x on npmjs.org): `@mohasinac/core` (Logger, Queue, StorageManager, EventBus, CacheManager) · `@mohasinac/http` (ApiClient, apiClient singleton) · `@mohasinac/next` (IAuthVerifier, createApiErrorHandler) · `@mohasinac/react` (14 hooks) · `@mohasinac/ui` (Semantic + Typography + DataTable primitives) · `@mohasinac/contracts` (all interfaces: IRepository, IAuthProvider, IEmailProvider, IStyleAdapter, ProviderRegistry) · 30+ `@mohasinac/feat-*` packages  
Installed from npm registry (`^1.4.0`) — letitrip.in's `package.json` uses published npm tarballs, not local `file:` references.

---

## Three-Tier Architecture

```
Tier 3 — Pages     src/app/                ← thin shell, <150 lines, no inline forms/tables
Tier 2 — Features  src/features/<name>/    ← owns components/, hooks/, types/, constants/, index.ts
Tier 1 — Shared    src/components/ src/hooks/ src/utils/ src/helpers/ src/classes/ src/constants/
```

Import rules: Pages → Tier 1+2. Features → Tier 1 ONLY (never another feature). Shared → Tier 1 only.

---

## Rule Index

Detailed rules are in `.github/instructions/` — auto-loaded by VS Code Copilot based on the file you're editing.

| File | Rules | Applies to |
|------|-------|------------|
| [rules-architecture.instructions.md](.github/instructions/rules-architecture.instructions.md) | 1, 2, 9, 10, 24, 38 — feature modules, barrel imports, thin pages, package ownership | `src/**` |
| [rules-strings-i18n.instructions.md](.github/instructions/rules-strings-i18n.instructions.md) | 3, 33 — `useTranslations` vs `UI_LABELS`, i18n | `src/**` |
| [rules-styling.instructions.md](.github/instructions/rules-styling.instructions.md) | 4, 25 — `THEME_CONSTANTS`, mobile-first, widescreen | `src/**/*.tsx` |
| [rules-components.instructions.md](.github/instructions/rules-components.instructions.md) | 7, 8, 31, 32, 34 — Typography/Form/Semantic primitives, DataTable, filters | `src/**/*.tsx` |
| [rules-hooks-utils.instructions.md](.github/instructions/rules-hooks-utils.instructions.md) | 5, 6 — existing utils/helpers/hooks | `src/**` |
| [rules-firebase.instructions.md](.github/instructions/rules-firebase.instructions.md) | 11, 12, 13, 14 — Firebase backend-only, upload flow, repositories, API routes | `src/app/api/**`, `src/repositories/**`, `src/actions/**` |
| [rules-services.instructions.md](.github/instructions/rules-services.instructions.md) | 20, 21 — 2-hop: reads Hook→apiClient, mutations Hook→Action; no service layer | `src/**` |
| [rules-media.instructions.md](.github/instructions/rules-media.instructions.md) | 28 — MediaImage/Video/Avatar/Gallery | `src/**/*.tsx` |
| [rules-constants.instructions.md](.github/instructions/rules-constants.instructions.md) | 15, 16, 17, 18, 19 — singletons, RBAC, schema constants, ROUTES, API_ENDPOINTS | `src/**` |
| [rules-code-quality.instructions.md](.github/instructions/rules-code-quality.instructions.md) | 22, 23, 24, 26, 27, 28-B, 28-C — no dialogs, logging, build verification, tests, encoding corruption | `src/**` |
| [rules-docs-seed.instructions.md](.github/instructions/rules-docs-seed.instructions.md) | 29, 30 — seed data sync, CHANGELOG sync | `scripts/**`, `src/db/**` |
| [rules-functions.instructions.md](.github/instructions/rules-functions.instructions.md) | 35 — scheduled jobs, Firestore triggers | `functions/**` |

---

## Critical Stops (check these first)

- **Barrel imports only** — `@/components`, not `@/components/ui/Button`
- **No raw HTML tags** — use `Heading`, `Text`, `Caption`, `Label`, `Span`, `TextLink`, `Button`, `Section`, `Nav`, `Ul`, `Li`… from `@/components`
- **No hardcoded strings in JSX** — use `useTranslations()` from `next-intl`
- **No Firebase client SDK** in UI code — Auth/Firestore/Storage are backend-only
- **No `fetch()` or `apiClient` in components** — reads use `useQuery` with `apiClient` in the `queryFn` inside a hook; components only call hooks
- **No `src/services/` directory** — the service layer has been deleted; `apiClient` lives in hooks directly
- **Package-first shared logic** — do not create new reusable logic under `src/lib/**`; use LIR packages (`@mohasinac/core`, `@mohasinac/http`, `@mohasinac/react`, `@mohasinac/ui`, `@mohasinac/feat-*`) and keep app code as thin composition
- **Shared components belong in LIR** — if a component/hook/helper is reusable across pages or projects, move it to the appropriate `@mohasinac/*` package instead of duplicating in app-local folders
- **Slim app policy** — migrate shared code to `@mohasinac/*` packages (`@mohasinac/ui` for shared UI; `@mohasinac/react` for generic hooks; `@mohasinac/core` for utilities/classes; `@mohasinac/feat-*` for domain modules), then remove duplicated app-local implementations
- **Mutations use Server Actions** — import from `@/actions`; call via `useMutation` or directly inside event handlers; **never** call `apiClient` from a mutation
- **No direct Firestore queries** in API routes — use repositories from `@/repositories`
- **No file upload to Storage from browser** — stage locally → submit FormData to backend
- **Forms use `react-hook-form` + `zodResolver`** — `useForm` from `react-hook-form`, resolver from `@hookform/resolvers/zod`, schema from `@/db/schema/`; no custom form state
- **Server pages call repositories directly** — async RSC pages import from `@/repositories` and pass `initialData` to client views; no `useQuery` / service calls in page files
- **Pages ≤ 150 lines** — extract to `src/features/<name>/components/<Domain>View.tsx`
- **No `alert()`/`confirm()`** — use `useMessage()` / `ConfirmDeleteModal`
- **No `console.log()`** — use `logger` (client) / `serverLogger` (API routes)
- **Filter/sort/page state in URL** — `useUrlTable`, never `useState`
- **Admin list hooks use factory** — `createAdminListQuery` from `@/features/admin/hooks`; never write raw `useQuery` + URLSearchParams parsing for admin lists
- **Admin filter strings use `buildSieveFilters`** — from `@/helpers`; never manual `filtersArr.push()` + `.join(",")`
- **Media in `aspect-*` containers** — never fixed `h-[px]` wrappers
- **Cron/triggers in `functions/src/`** — never inside Next.js API routes
- **Delete old code when replacing** — no `@deprecated` stubs, no dual implementations
- **Build must pass**: `npx tsc --noEmit` → `npm run build` before handing back
- **No mojibake** — if garbled characters appear (`ãÆ`, `â€™`, `Ã©`, `ï¿½`), stop and fix with `replace_string_in_file` before continuing; see Rule 28-C- **Dev server — reuse existing**: before starting `npm run dev`, run `netstat -ano | Select-String ":3000.*LISTENING"` — if output is non-empty, port 3000 is already in use; use it for testing instead of starting a second server
- **`dynamicParams = false` for fully-static dynamic routes** — any page that has `generateStaticParams()` returning ALL possible values must also export `export const dynamicParams = false;` to avoid Vercel `NEXT_MISSING_LAMBDA` build errors
- **Cold-start guard on feat-* routes** — every `app/api/*/route.ts` that re-exports a `@mohasinac/feat-*` handler MUST wrap it with `withProviders()` from `@/providers.config`:
  ```ts
  import { withProviders } from "@/providers.config";
  import { GET as _GET } from "@mohasinac/feat-products";
  export const GET = withProviders(_GET);
  ```
  Bare `export { GET } from "@mohasinac/feat-*"` will cause 500 errors on Vercel cold starts because `registerProviders()` hasn't finished yet.
- **Never publish packages from letitrip.in** — packages live in `D:\proj\packages`; bump version → build → publish there, then update `package.json` here and run `npm install`
- **Vercel logs** for production debugging: `vercel ls` → get deployment URL → `vercel logs <url>` (not `--prod`; that flag is unsupported in v48+)
## Migration State (as of 2026-04-06)

| Stage | Description | Status |
|-------|-------------|--------|
| A | Security fixes — rate-limit (Upstash Redis), HMAC `timingSafeEqual`, magic-byte MIME, nonce-based CSP, apiClient SSR fix, hydration fixes | ✅ Complete |
| B1 | Monorepo bootstrap — `pnpm-workspace.yaml`, `turbo.json`, `packages/*` stubs | ✅ Complete |
| B2–B4 | `@lir/*` extracted → renamed to `@mohasinac/*` scope | ✅ Complete |
| C | TanStack Query v5 — `useApiQuery`/`useApiMutation` adapters **deleted**; all hooks use `useQuery`/`useMutation` from `@tanstack/react-query` directly; `QueryProvider` in root layout | ✅ Complete |
| D | react-hook-form — `useForm` from `react-hook-form` + `zodResolver`; custom `useForm.ts` deleted | ✅ Complete |
| E1–E8 | SSR Phases 1–8 — async RSC, `generateMetadata`, ISR, auth cookie, SSE islands, profile SSR | ✅ Complete |
| F1–F4 | Styling cleanup, `@mohasinac/react` (10 hooks), `@mohasinac/ui` (Semantic + Typography + primitives) extracted | ✅ Complete |
| G1–G5 | Server Actions, FilterPanel, Repository fixes, Schema adapters, AES-256-GCM credentials | ✅ Complete |
| H1–H7 | Dead exports/services removed; snippets → docs; `TECH_DEBT.md`; per-package `CHANGELOG.md` | ✅ Complete |
| I1 | Service layer deleted — all 33 `*.service.ts` removed; `src/services/` gone | ✅ Complete |
| Sec | SSRF fix; Stored XSS fix in `renderProseMirrorNode` | ✅ Complete |
| J1 | Admin hooks factory — `createAdminListQuery`; `buildSieveFilters`; actions split | ✅ Complete |
| K1 | **npm publish** — all 58 `@mohasinac/*` packages published at v1.1.0; `letitrip.in` updated to use `^1.1.0` npm tarballs; `pnpm-lock.yaml` → `package-lock.json` (clean npm ci); Vercel deploy green | ✅ Complete |
| K2 | `dynamicParams = false` added to `src/app/[locale]/faqs/[category]/page.tsx` — fixes Vercel `NEXT_MISSING_LAMBDA` for fully-static dynamic routes | ✅ Complete |
| L1 | Cold-start race fix — `withProviders()` wrapper in `providers.config.ts`; `await initProviders()` in `createApiHandler`; all 17 feat-* route stubs rewritten | ✅ Complete |
| L2 | `@mohasinac/ui@1.4.3` — `DataTable<T extends object>` generic fix; all TS errors in admin DataTable views resolved | ✅ Complete |

---

## Development Commands

```bash
npm run dev          # dev server (webpack) — check port 3000 first!
npm run build        # production build
npx tsc --noEmit     # type-check only
npm test             # run tests
npm run lint         # lint
```

```powershell
# Before starting dev server — reuse existing if running:
netstat -ano | Select-String ":3000.*LISTENING"   # non-empty = already running

# Vercel deploy (auto-triggered by git push to main):
git add . ; git commit -m "..."; git push origin main

# Check Vercel deployment status:
vercel ls --prod 2>&1 | Select-Object -First 8

# Simulate Vercel cloud build locally:
vercel build --prod

# Firebase infra:
.\scripts\deploy-firestore-indices.ps1   # Firestore composite indices
.\scripts\deploy-firestore-rules.ps1     # Firestore/Storage/DB rules
.\scripts\deploy-functions.ps1           # Firebase Functions
.\scripts\sync-env-to-vercel.ps1         # sync .env.local → Vercel
.\scripts\pull-env-from-vercel.ps1       # pull env from Vercel
```

---

## Full Reference

See [`docs/GUIDE.md`](docs/GUIDE.md) for complete inventory of every function, hook, component, class, constant, schema, repository, and API endpoint.

