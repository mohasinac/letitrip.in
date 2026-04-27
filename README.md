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

## Local Development — Seed Firestore

After starting the dev server, seed all Firestore collections with one command:

```bash
# 1. Start the dev server
npm run dev

# 2. Seed Firestore (run once — safe to re-run, uses upsert)
curl -X POST http://localhost:3000/api/demo/seed \
  -H "Content-Type: application/json" \
  -d '{"action":"load"}'
```

Or use the UI at **[http://localhost:3000/demo/seed](http://localhost:3000/demo/seed)** to seed or delete collections interactively.

### What gets seeded

| Collection | Count | Notes |
|---|---|---|
| `users` | 8 | 1 admin, 3 buyers, 3 sellers |
| `categories` | 13 | 4 root + 9 children |
| `products` | 10 | 9 regular + 1 auction |
| `orders` | 12 | Various statuses |
| `reviews` | 15 | Approved / pending / rejected |
| `bids` | 8 | For auction product |
| `coupons` | 10 | Fixed / percent / free-shipping |
| `carouselSlides` | 6 | Hero carousel |
| `homepageSections` | 14 | All section types |
| `siteSettings` | 1 | Announcement bar |
| `faqs` | 102 | FAQ accordion |

### Demo user accounts

| Email | Role | Password |
|---|---|---|
| admin@letitrip.in | admin | TempPass123! |
| john.doe@example.com | buyer | TempPass123! |
| electronics.store@example.com | seller | TempPass123! |

Full details: [src/app/[locale]/demo/seed/README.md](src/app/%5Blocale%5D/demo/seed/README.md)

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
npm run test:smoke
npm run test:smoke:existing
npm run index:generate
npm run firebase:reset:dry
```

## Smoke Tests (Pages + APIs)

Automated smoke coverage is provided by `scripts/qa/smoke-pages-api.mjs`.

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

## Firebase Full Reset

Use this when you need to wipe the linked Firebase project completely (Firestore, RTDB, Storage, Auth users, Cloud Functions, and reset rules/indexes):

```bash
# Non-destructive preview
npm run firebase:reset:dry

# Requires explicit confirmation
npm run firebase:reset -- --yes

# Shortcut
npm run firebase:reset:all
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
