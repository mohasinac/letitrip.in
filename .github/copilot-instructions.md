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

**Workspace packages** (`packages/`): `@lir/core` (Logger, Queue, StorageManager, EventBus, CacheManager) · `@lir/http` (ApiClient, apiClient singleton) · `@lir/next` (IAuthVerifier, createApiErrorHandler) · `@lir/react` (10 UI hooks) · `@lir/ui` (Semantic + Typography primitives with inlined tokens)  
Linked via `tsconfig` path aliases + `transpilePackages` — **not** npm install.

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
| [rules-architecture.instructions.md](.github/instructions/rules-architecture.instructions.md) | 1, 2, 9, 10, 24 — feature modules, barrel imports, thin pages | `src/**` |
| [rules-strings-i18n.instructions.md](.github/instructions/rules-strings-i18n.instructions.md) | 3, 33 — `useTranslations` vs `UI_LABELS`, i18n | `src/**` |
| [rules-styling.instructions.md](.github/instructions/rules-styling.instructions.md) | 4, 25 — `THEME_CONSTANTS`, mobile-first, widescreen | `src/**/*.tsx` |
| [rules-components.instructions.md](.github/instructions/rules-components.instructions.md) | 7, 8, 31, 32, 34 — Typography/Form/Semantic primitives, DataTable, filters | `src/**/*.tsx` |
| [rules-hooks-utils.instructions.md](.github/instructions/rules-hooks-utils.instructions.md) | 5, 6 — existing utils/helpers/hooks | `src/**` |
| [rules-firebase.instructions.md](.github/instructions/rules-firebase.instructions.md) | 11, 12, 13, 14 — Firebase backend-only, upload flow, repositories, API routes | `src/app/api/**`, `src/lib/**` |
| [rules-services.instructions.md](.github/instructions/rules-services.instructions.md) | 20, 21 — UI→Hook→Service→apiClient chain | `src/**` |
| [rules-media.instructions.md](.github/instructions/rules-media.instructions.md) | 28 — MediaImage/Video/Avatar/Gallery | `src/**/*.tsx` |
| [rules-constants.instructions.md](.github/instructions/rules-constants.instructions.md) | 15, 16, 17, 18, 19 — singletons, RBAC, schema constants, ROUTES, API_ENDPOINTS | `src/**` |
| [rules-code-quality.instructions.md](.github/instructions/rules-code-quality.instructions.md) | 22, 23, 24, 26, 27 — no dialogs, logging, build verification, tests | `src/**` |
| [rules-docs-seed.instructions.md](.github/instructions/rules-docs-seed.instructions.md) | 29, 30 — seed data sync, CHANGELOG sync | `scripts/**`, `src/db/**` |
| [rules-functions.instructions.md](.github/instructions/rules-functions.instructions.md) | 35 — scheduled jobs, Firestore triggers | `functions/**` |

---

## Critical Stops (check these first)

- **Barrel imports only** — `@/components`, not `@/components/ui/Button`
- **No raw HTML tags** — use `Heading`, `Text`, `Caption`, `Label`, `Span`, `TextLink`, `Button`, `Section`, `Nav`, `Ul`, `Li`… from `@/components`
- **No hardcoded strings in JSX** — use `useTranslations()` from `next-intl`
- **No Firebase client SDK** in UI code — Auth/Firestore/Storage are backend-only
- **No `fetch()` or `apiClient` in components** — reads use `useQuery` from `@tanstack/react-query`; queryFn must call a service function from `@/services`
- **Mutations use Server Actions** — import from `@/actions`; call via `useMutation` or directly inside event handlers; **never** call a service for a mutation
- **No direct Firestore queries** in API routes — use repositories from `@/repositories`
- **No file upload to Storage from browser** — stage locally → submit FormData to backend
- **Forms use `react-hook-form` + `zodResolver`** — `useForm` from `react-hook-form`, resolver from `@hookform/resolvers/zod`, schema from `@/db/schema/`; no custom form state
- **Server pages call repositories directly** — async RSC pages import from `@/repositories` and pass `initialData` to client views; no `useQuery` / service calls in page files
- **Pages ≤ 150 lines** — extract to `src/features/<name>/components/<Domain>View.tsx`
- **No `alert()`/`confirm()`** — use `useMessage()` / `ConfirmDeleteModal`
- **No `console.log()`** — use `logger` (client) / `serverLogger` (API routes)
- **Filter/sort/page state in URL** — `useUrlTable`, never `useState`
- **Media in `aspect-*` containers** — never fixed `h-[px]` wrappers
- **Cron/triggers in `functions/src/`** — never inside Next.js API routes
- **Delete old code when replacing** — no `@deprecated` stubs, no dual implementations
- **Build must pass**: `npx tsc --noEmit` → `npm run build` before handing back

## Migration State (as of 2026-03-13)

| Stage | Description | Status |
|-------|-------------|--------|
| A | Security fixes — rate-limit (Upstash Redis), HMAC `timingSafeEqual`, magic-byte MIME, nonce-based CSP, apiClient SSR fix, hydration fixes | ✅ Complete |
| B1 | Monorepo bootstrap — `pnpm-workspace.yaml`, `turbo.json`, `packages/*` stubs | ✅ Complete |
| B2 | `@lir/core` extracted — Logger, Queue, StorageManager, EventBus, CacheManager | ✅ Complete |
| B3 | `@lir/http` extracted — ApiClient, ApiClientError, apiClient singleton | ✅ Complete |
| B4 | `@lir/next` extracted — IAuthVerifier interface, createApiErrorHandler factory | ✅ Complete |
| C | TanStack Query v5 — `useApiQuery`/`useApiMutation` adapters **deleted**; all hooks use `useQuery`/`useMutation` from `@tanstack/react-query` directly; `QueryProvider` in root layout | ✅ Complete |
| D | react-hook-form — `useForm` from `react-hook-form` + `zodResolver`; custom `useForm.ts` deleted | ✅ Complete |
| E1 | SSR Phase 1 — blog/products/events/sellers/promotions: async RSC + `generateMetadata` | ✅ Complete |
| E2 | SSR Phase 2 — homepage `initialData` pre-fetch | ✅ Complete |
| E3 | SSR Phase 3 — listing pages (products, categories, stores, search) | ✅ Complete |
| E4 | SSR Phase 6 — static pages ISR | ✅ Complete |
| E5 | SSR Phase 7 — SEO: `generateMetadata` all pages, JSON-LD | ✅ Complete |
| E6 | SSR Phase 4 — auth session cookie (`__session`) | ✅ Complete |
| E7 | SSR Phase 5 + E8 — real-time SSE islands; profile SSR | ✅ Complete |
| F1 | Styling cleanup — `globals.css` dead vars removed; `gray-*` purged; `THEME_CONSTANTS` pure aliases deleted | ✅ Complete |
| F2 | `@lir/react` extracted — 10 UI hooks (useMediaQuery, useBreakpoint, useClickOutside, useKeyPress, useLongPress, useGesture, useSwipe, useCamera, usePullToRefresh, useCountdown) | ✅ Complete |
| F3 | `@lir/ui` extracted — Semantic.tsx (10 components) + Typography.tsx (Heading/Text/Label/Caption/Span) with inlined UI_THEME tokens | ✅ Complete |
| F4 | `@lir/ui` extended + tsconfig wired — Spinner, Skeleton, Button, Badge, Alert, Divider, Progress; `@lir/*` path aliases + `transpilePackages`; `src/classes/*` + `src/hooks/*` re-export packages | ✅ Complete |
| G1 | Server Actions — 20+ actions in `src/actions/`; all mutations → Server Actions (`useMutation` wraps Server Action); dead pure-passthrough service methods deleted | ✅ Complete |
| G2 | FilterPanel config-driven — all 14 admin filter components use `FilterPanel` pattern | ✅ Complete |
| G3 | Repository fixes — dead `category-metrics.ts` deleted; metrics wired in products API | ✅ Complete |
| G4 | Schema adapters — dead `schema.adapter.ts` deleted | ✅ Complete |
| G5 | AES-256-GCM encrypted provider credentials in `siteSettings`; `SiteCredentialsForm`; DB-first `razorpay.ts`/`email.ts` | ✅ Complete |
| H1–H7 | Dead barrel exports removed; `animation.*` aliases deleted; dead services deleted (contact, newsletter, payment-event, demo); snippets moved to `docs/snippets/`; `TECH_DEBT.md` created; per-package `CHANGELOG.md` files added | ✅ Complete |
| Sec | TD-005: media/crop + media/trim migrated to `createApiHandler`; SSRF fix on `sourceUrl`; Stored XSS fix in `renderProseMirrorNode` (escapeHtml + link allowlist) | ✅ Complete |
| H8 | Publish `@lir/*` to npm registry (build pipeline, `dist/` output, set `private: false`) | 🔲 Optional |

---

## Development Commands

```bash
npm run dev          # dev server (Turbopack)
npm run build        # production build
npx tsc --noEmit     # type-check only
npm test             # run tests
npm run lint         # lint
```

```powershell
.\scripts\deploy-firestore-indices.ps1   # Firestore composite indices
.\scripts\deploy-firestore-rules.ps1     # Firestore/Storage/DB rules
.\scripts\deploy-functions.ps1           # Firebase Functions
.\scripts\sync-env-to-vercel.ps1         # sync .env.local → Vercel
.\scripts\pull-env-from-vercel.ps1       # pull env from Vercel
```

---

## Full Reference

See [`docs/GUIDE.md`](docs/GUIDE.md) for complete inventory of every function, hook, component, class, constant, schema, repository, and API endpoint.

