# LetItRip

A full-featured multi-vendor marketplace platform built with Next.js 16 App Router, TypeScript, Firebase, and Tailwind CSS.

---

## What is LetItRip?

LetItRip is an e-commerce marketplace supporting three purchase modes:

- **Buy Now** — standard add-to-cart product purchases
- **Auctions** — timed bidding on products with real-time bid updates
- **Pre-Orders** — reserve products before availability

The platform hosts multiple seller stores, supports events/promotions/coupons, includes a virtual currency system (RipCoins), and provides separate portals for admins, sellers, and buyers.

---

## Tech Stack

| Layer         | Technology                                                     |
| ------------- | -------------------------------------------------------------- |
| Framework     | Next.js 16.1.1 (App Router, Server Components, Server Actions) |
| Language      | TypeScript                                                     |
| Styling       | Tailwind CSS + `THEME_CONSTANTS` tokens                        |
| Auth          | Firebase Auth (email/password + Google OAuth)                  |
| Database      | Firestore (primary data) + Firebase Realtime DB (bids, events) |
| Storage       | Firebase Storage (media)                                       |
| Search        | Algolia                                                        |
| Payments      | Razorpay                                                       |
| Email         | Resend                                                         |
| Shipping      | ShipRocket                                                     |
| Data Fetching | TanStack Query v5                                              |
| Forms         | react-hook-form v7 + Zod                                       |
| i18n          | next-intl                                                      |
| Monorepo      | pnpm workspaces + Turborepo                                    |

---

## Repository Layout

```
letitrip.in/
├── src/
│   ├── app/                  # Next.js App Router pages + API routes
│   ├── features/             # Feature modules (products, admin, seller, user…)
│   ├── components/           # Shared UI components
│   ├── actions/              # Server Actions (all mutations)
│   ├── hooks/                # Shared React hooks
│   ├── services/             # API call wrappers (read-only)
│   ├── repositories/         # Firestore repository layer
│   ├── constants/            # App-wide constants (routes, RBAC, theme…)
│   ├── helpers/              # Pure utility functions (auth, data, logging)
│   └── utils/                # Low-level formatters, validators, converters
├── packages/
│   ├── core/                 # @lir/core — Logger, Queue, EventBus, Cache
│   ├── http/                 # @lir/http — ApiClient
│   ├── next/                 # @lir/next — IAuthVerifier, createApiErrorHandler
│   ├── react/                # @lir/react — UI hooks (breakpoint, gesture, camera…)
│   └── ui/                   # @lir/ui — Typography, Semantic HTML, DataTable, primitives
├── functions/                # Firebase Cloud Functions (cron jobs + Firestore triggers)
├── messages/                 # next-intl translation strings (en.json)
└── scripts/                  # Seed scripts, deployment scripts
```

---

## Three-Tier Architecture

```
Tier 3 — Pages     src/app/[locale]/…page.tsx       thin shell, ≤150 lines
Tier 2 — Features  src/features/<name>/              owns components, hooks, types
Tier 1 — Shared    src/components/ hooks/ utils/…   used by any tier
```

**Import rules:**

- Pages → Tier 1 + 2
- Features → Tier 1 only (never another feature)
- Shared → Tier 1 only

---

## User Roles

| Role        | Access                                                                   |
| ----------- | ------------------------------------------------------------------------ |
| `guest`     | Browse public pages, view products/auctions/events                       |
| `user`      | Buy, cart, wishlist, orders, notifications, RipCoins                     |
| `seller`    | Everything user has + seller portal (products, orders, payouts, coupons) |
| `admin`     | Full platform access + admin portal                                      |
| `moderator` | Review/content moderation                                                |

---

## Development

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npx tsc --noEmit     # Type-check only
npm test             # Run Jest tests
npm run lint         # ESLint
```

### Firebase scripts

```powershell
.\scripts\deploy-firestore-indices.ps1   # Deploy composite indexes
.\scripts\deploy-firestore-rules.ps1     # Deploy Firestore/Storage/DB rules
.\scripts\deploy-functions.ps1           # Deploy Cloud Functions
.\scripts\sync-env-to-vercel.ps1         # Sync .env.local → Vercel
.\scripts\pull-env-from-vercel.ps1       # Pull env from Vercel
```

---

## Documentation Index

| Document                                                         | Contents                                        |
| ---------------------------------------------------------------- | ----------------------------------------------- |
| [docs/architecture.md](docs/architecture.md)                     | Architecture overview, data flow, auth session  |
| [docs/layouts.md](docs/layouts.md)                               | App layouts (root, locale, admin, seller, user) |
| [docs/pages-public.md](docs/pages-public.md)                     | Public-facing pages                             |
| [docs/pages-user.md](docs/pages-user.md)                         | User portal pages                               |
| [docs/pages-seller.md](docs/pages-seller.md)                     | Seller portal pages                             |
| [docs/pages-admin.md](docs/pages-admin.md)                       | Admin portal pages                              |
| [docs/api-routes.md](docs/api-routes.md)                         | All API route endpoints                         |
| [docs/actions.md](docs/actions.md)                               | Server Actions reference                        |
| [docs/repositories.md](docs/repositories.md)                     | Firestore repository layer                      |
| [docs/services.md](docs/services.md)                             | Service layer (read API wrappers)               |
| [docs/components.md](docs/components.md)                         | Shared component library                        |
| [docs/hooks.md](docs/hooks.md)                                   | Shared hooks reference                          |
| [docs/constants.md](docs/constants.md)                           | Constants reference                             |
| [docs/features/products.md](docs/features/products.md)           | Products, Auctions, Pre-Orders feature          |
| [docs/features/cart-checkout.md](docs/features/cart-checkout.md) | Cart & Checkout feature                         |
| [docs/features/orders.md](docs/features/orders.md)               | Orders feature                                  |
| [docs/features/events.md](docs/features/events.md)               | Events feature                                  |
| [docs/features/reviews.md](docs/features/reviews.md)             | Reviews feature                                 |
| [docs/features/blog.md](docs/features/blog.md)                   | Blog feature                                    |
| [docs/features/categories.md](docs/features/categories.md)       | Categories feature                              |
| [docs/features/search.md](docs/features/search.md)               | Search feature                                  |
| [docs/features/stores.md](docs/features/stores.md)               | Stores feature                                  |
| [docs/features/homepage.md](docs/features/homepage.md)           | Homepage feature                                |
| [docs/features/auth.md](docs/features/auth.md)                   | Auth feature                                    |
| [docs/features/seller.md](docs/features/seller.md)               | Seller portal feature                           |
| [docs/features/admin.md](docs/features/admin.md)                 | Admin portal feature                            |
| [docs/features/user.md](docs/features/user.md)                   | User portal feature                             |
| [docs/features/promotions.md](docs/features/promotions.md)       | Promotions & Coupons feature                    |
| [docs/features/ripcoins.md](docs/features/ripcoins.md)           | RipCoins virtual currency feature               |
| [docs/features/notifications.md](docs/features/notifications.md) | Notifications feature                           |
| [docs/features/wishlist.md](docs/features/wishlist.md)           | Wishlist feature                                |
| [docs/packages/core.md](docs/packages/core.md)                   | @lir/core package                               |
| [docs/packages/http.md](docs/packages/http.md)                   | @lir/http package                               |
| [docs/packages/next.md](docs/packages/next.md)                   | @lir/next package                               |
| [docs/packages/react.md](docs/packages/react.md)                 | @lir/react package                              |
| [docs/packages/ui.md](docs/packages/ui.md)                       | @lir/ui package                                 |
