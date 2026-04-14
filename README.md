# letitrip.in

Standalone Next.js marketplace application that consumes `@mohasinac/appkit` from npm registry.

## Standalone Model

- `letitrip.in` is a standalone app repository.
- `appkit` is a separate standalone core library repository.
- Production and CI/server installs resolve `@mohasinac/appkit` from npm registry.
- Local development overrides (watch/prerelease workflows) are optional and handled manually.

## Stack

- Next.js App Router + TypeScript
- Firebase (Auth, Firestore, Storage, RTDB)
- Tailwind CSS
- next-intl
- React Query + react-hook-form + Zod

## Install

```bash
npm install
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run type-check
npm test
npm run test:smoke
npm run test:smoke:existing
npm run index:generate
```

## Smoke Tests (Pages + APIs)

Automated smoke coverage is provided by `scripts/smoke-pages-api.mjs`.

What it validates:
- Page interactions: home CTA click, blog filter interaction, contact form submit, login submit feedback
- API endpoints: `/api/products`, `/api/blog`, `/api/categories`, `/api/search`, `/api/events`, `/api/stores`, `/api/admin/users`, `/api/contact`

Usage:

```bash
# Start its own local dev server and run smoke checks
npm run test:smoke

# Reuse an already running local server
npm run test:smoke:existing
```

Prerequisite (one-time after Playwright updates):

```bash
npx playwright install chromium
```

## Appkit Dependency

`package.json` intentionally uses npm registry versioning for appkit:

```json
"@mohasinac/appkit": "^2.1.1"
```

If you use a local watch/prerelease workflow, keep that as a local-only override and do not commit file/link-based dependency specs.

## Repository Layout

```text
src/             Next.js app code, actions, features, shared modules
functions/       Firebase functions
messages/        i18n message catalogs
scripts/         project tooling
docs/            architecture and feature documentation
```
