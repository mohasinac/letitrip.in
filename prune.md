# Prune Candidates - letitrip.in

This document is the single migration backlog for moving reusable code from letitrip.in into appkit while enforcing the architecture rules.

Last updated: April 12, 2026
Source references used: letitrip.in/index.md, appkit/index.md, current workspace scan.

---

## Non-Negotiable Rules

1. Appkit-first: if reusable across 2+ apps, it belongs in appkit.
2. No re-export shims: delete shim files and import appkit directly at usage sites.
3. Merge duplicate concepts with config props instead of parallel files.
4. SSR-first: avoid 'use client' unless required for interactive primitives/browser APIs.
5. Use appkit HTML wrappers and wrapper variants; avoid repeated raw className patterns.
6. Hooks, contexts, repositories, schemas, and infra adapters belong in appkit.
7. ID generation must use shared typed generators with optional customId support.
8. Media fields must use typed media descriptors and standardized upload/cleanup lifecycle.

---

## Architectural Verdicts (Robust Decisions)

### Verdict A - Listing Logic
Auction, pre-order, and standard listing logic is generic marketplace behavior and must live in appkit. letitrip should pass listingType config only.

### Verdict B - Media Contract
All media-capable entities should support typed media arrays. For this migration, each relevant form should support:
- up to 5 images
- up to 1 video

This must be enforced in UI validation, schema validation, and API validation.

### Verdict C - Order Image Propagation
Orders should automatically copy main images from ordered items into an order-level imageUrls array so order UIs can render without extra product fetches.

### Verdict D - Orphaned Media Cleanup
Do both, not one:
1. Immediate cleanup on form abort/unmount via onAbort.
2. Scheduled cleanup in Firebase Functions at 10:00 AM IST (Asia/Kolkata) for leftover temporary media.

Use temporary upload naming (tmp prefix/suffix) until save succeeds. On successful save, finalize by removing tmp marker in persisted reference. Daily cron deletes unresolved tmp objects older than TTL.

This dual strategy protects against browser crash, tab close, network failures, and backend save failures.

---

## Rule Checks (Quick Commands)

### Appkit-first violations
```pwsh
Get-ChildItem src -Recurse -Include *.ts,*.tsx |
  Where-Object FullName -notmatch 'app\\|actions\\|config\\|constants\\|providers.config.ts|features.config.ts'
```

### Re-export shim violations
```pwsh
Select-String -Path "src\**\*.ts","src\**\*.tsx" -Pattern "^export (\{[^}]+\}|\*) from" -Recurse
```

### Raw HTML tag violations
```pwsh
Select-String -Path "src\**\*.tsx" -Pattern "<(div|section|article|main|aside|nav|header|footer|ul|ol|li|span|p|h[1-6])\b" -Recurse
```

### Media upload anti-patterns
```pwsh
Select-String -Path "src\**\*.tsx" -Pattern 'type="file"|type=.file.' -Recurse |
  Where-Object { $_.Path -notmatch 'MediaUpload(Field|List)' }
```

### Ad-hoc ID generation violations
```pwsh
Select-String -Path "src\**\*.ts","src\**\*.tsx" -Pattern "Date\.now\(|Math\.random\(|uuidv4\(|crypto\.randomUUID\(" -Recurse
```

---

## Priority Migration Plan

1. Media lifecycle hardening (forms + schema + cleanup job)
2. Listing logic consolidation into appkit configurable utilities
3. Order image propagation to order imageUrls
4. Remove remaining re-export shims
5. Replace duplicate hooks/utils/repos with appkit imports

---

## Task Group 1 - Media Model and Limits (5 images + 1 video)

### Goal
Standardize products, auctions, pre-orders, reviews, and stores on a shared media model with strict limits.

### Target entities
- products
- auctions
- pre-orders
- reviews
- stores

### Required constraints
- images: max 5
- video: max 1
- accepted media types validated in both form and API schema
- migration keeps backward compatibility for legacy mainImage/images fields during rollout

### Candidate letitrip files to migrate/replace
- src/components/products/ProductForm.tsx
- src/features/products/components/AuctionDetailView.tsx
- src/features/products/components/PreOrderDetailView.tsx
- src/features/products/components/ProductImageGallery.tsx
- src/features/products/components/ProductReviews.tsx
- src/features/seller/components/SellerCreateProductView.tsx
- src/features/seller/components/SellerEditProductView.tsx
- src/features/seller/components/SellerStoreSetupView.tsx
- src/hooks/useProductReviews.ts
- src/components/AvatarUpload.tsx
- src/components/admin/media-upload.client.ts

### Candidate schema files
- src/db/schema/products.ts
- src/db/schema/reviews.ts
- src/db/schema/stores.ts
- src/db/schema/orders.ts (for order imageUrls propagation)

### Appkit destination
- appkit/src/features/media/*
- appkit/src/features/products/*
- appkit/src/features/auctions/*
- appkit/src/features/pre-orders/*
- appkit/src/features/reviews/*
- appkit/src/features/stores/*

### Acceptance criteria
- all target forms use MediaUploadField/MediaUploadList from appkit
- each form enforces 5 image / 1 video limit
- schemas/apis enforce same limits server-side
- abort flow always reports staged URLs for deletion

---

## Task Group 2 - Orphaned Media Prevention and Recovery

### Goal
Prevent storage leaks from unsaved uploads and recover from crashes.

### Required implementation plan (documented task only)
1. Uploads are created as temporary objects:
   - filename contains tmp marker (e.g., tmp- prefix)
2. On successful entity save:
   - media references are finalized (tmp marker removed in canonical URL/path reference)
3. On user cancel/unmount:
   - immediate delete for staged temporary objects (onAbort)
4. On crashes/failed flows:
   - scheduled Firebase cleanup job deletes stale tmp media daily

### Firebase Functions task backlog
- add new job file: functions/src/jobs/mediaTmpCleanup.ts
- register scheduler in functions/src/index.ts
- schedule: 10:00 AM IST daily
  - timezone: Asia/Kolkata
  - cron equivalent: 30 4 * * * (UTC)
- cleanup policy:
  - delete only tmp-marked objects
  - delete older than configured TTL (recommended 24h)
  - write audit logs for deleted object count

### Safety constraints
- never delete non-tmp media in cron job
- support idempotent retries
- emit metrics/alerts on cleanup failure

### Acceptance criteria
- immediate abort cleanup works in forms
- cron cleanup removes leftover tmp media from failed sessions
- no data loss for successfully saved media

---

## Task Group 3 - Listing Logic Consolidation

### Goal
Move all auction/pre-order/listing behavior into appkit and keep letitrip as config consumer.

### Current known candidate files
- src/features/products/components/PlaceBidForm.tsx
- src/features/products/components/AuctionDetailView.tsx
- src/features/products/components/PreOrderDetailView.tsx
- src/features/products/components/PreOrdersView.tsx
- src/utils/order-splitter.ts

### Appkit target areas
- appkit/src/features/products/
- appkit/src/features/auctions/
- appkit/src/features/pre-orders/
- appkit/src/features/orders/

### Required outcome
- letitrip passes listingType and marketplace config only
- appkit owns bidding windows, pre-order eligibility, countdown behavior, and reusable listing rules

---

## Task Group 4 - Order Image URL Aggregation

### Goal
Orders should automatically contain imageUrls derived from purchased item main images.

### Required behavior
- during order create/update, collect mainImage/productImage from items
- deduplicate and store as order.imageUrls: string[]
- keep existing item-level image fields for compatibility

### Candidate files
- src/actions/order.actions.ts
- src/repositories/order.repository.ts
- src/db/schema/orders.ts
- src/features/cart/components/CheckoutOrderReview.tsx

### Acceptance criteria
- order detail views can render from order.imageUrls without additional product reads
- schema includes imageUrls with stable typing

---

## Task Group 5 - ID Generator Standardization

### Goal
Use shared appkit generators only; eliminate local duplicates/ad-hoc generation.

### Required tasks
- delete/stop using src/utils/id-generators.ts in letitrip
- import from @mohasinac/appkit/utils
- keep customId override behavior for caller-supplied IDs
- remove Date.now/Math.random/randomUUID IDs for Firestore documents

### Candidate files
- src/utils/id-generators.ts
- src/db/schema/orders.ts (createOrderId usage)
- scripts/seed-*.ts

### Acceptance criteria
- all document IDs generated via appkit typed generators
- generators support customId for externally provided IDs

---

## Task Group 6 - Re-export and Duplicate Cleanup

### Goal
Eliminate shim files and local duplicates after migration.

### High-confidence shim set
- src/lib/monitoring/error-tracking.ts
- src/lib/monitoring/runtime.ts
- src/lib/monitoring/performance.ts
- src/lib/api/cache-middleware.ts
- src/lib/api-response.ts
- src/lib/firebase/firestore-helpers.ts
- src/utils/converters/cookie.converter.ts
- src/utils/formatters/date.formatter.ts
- src/utils/formatters/number.formatter.ts
- src/utils/formatters/string.formatter.ts
- src/utils/validators/email.validator.ts
- src/utils/validators/phone.validator.ts
- src/utils/validators/password.validator.ts
- src/utils/validators/input.validator.ts
- src/utils/validators/url.validator.ts
- src/utils/events/event-manager.ts

### Required process
1. Replace import sites with canonical appkit paths
2. Delete shim file
3. Verify no references remain

---

## Risk Register and Mitigations

1. Risk: media leaks from crash before save
Mitigation: immediate onAbort + daily tmp cron cleanup

2. Risk: accidental cleanup of valid media
Mitigation: cron only touches tmp-marked objects older than TTL

3. Risk: schema mismatch between UI and API
Mitigation: enforce same max constraints (5 images, 1 video) in both layers

4. Risk: breaking existing product/review/store UIs
Mitigation: transitional compatibility for mainImage/images/video until full migration complete

---

## Definition of Done for this prune plan

1. No duplicated sections in this file; one authoritative backlog only.
2. All new requirements captured as explicit tasks and acceptance criteria.
3. Media lifecycle includes both immediate cleanup and scheduled fallback cleanup.
4. Listing/media/id/order-image requirements are represented as migration tasks, not assumptions.
