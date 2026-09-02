# Plan: Lottery + Event + Prize-Draw Consolidation

## Context

Three surfaces unified into one draw mechanism:
1. **Events** — admin-run community draws (raffle, spin_wheel, + new `lottery` type)
2. **Prize-Draw Products** — seller-run mystery draws, extended with full lottery mechanics via `prizeDrawMode: "lottery"`
3. **Schema bug fix** — `eventTypeSchema` Zod is missing `"raffle"`, `"spin_wheel"`, `"cancelled"` right now

All lottery-style entries (whether sourced from an event or a product) go into a new top-level **`lotteryEntries`** collection. Non-lottery event entries stay in `eventEntries`. This keeps the two flows completely separate while sharing the same server-side weighted draw algorithm.

---

## Architecture Decision Map

| Surface | Source collection | Entry collection | Who triggers draw | Auth |
|---------|------------------|------------------|-------------------|------|
| Event type `"lottery"` | `events` | `lotteryEntries` | **User self-pull** (slot assigned immediately on submit) | Must be logged in |
| Prize-draw `prizeDrawMode: "lottery"` | `products` | `lotteryEntries` | **User self-pull** (slot assigned immediately on submit) | Must be logged in |
| Event type `"raffle"` / `"spin_wheel"` | `events` | `eventEntries` (unchanged) | Admin (server action) | Optional (poll/survey allow guest) |
| Prize-draw `prizeDrawMode: "reveal"` (classic) | `products` | no separate entries | N/A — self-reveal | Buyer auth via cart |

**Admin/Store owner role**: SET UP only — create the lottery, view entries, flag scammers. They do NOT trigger draws; the draw happens automatically at the user's pull time.

**Weight/chance visibility**:
- Admin: sees slot price + computed weight + chance percentage in the edit/entries view
- Store owner: sees slot price in the prize-draw edit form — weight and chance ratio are NOT shown
- User: sees slot number + item name only — no price, no weight, no chance info

---

## New `lotteryEntries` Firestore Collection

```ts
// appkit/src/features/lottery/schemas/firestore.ts  (NEW file)
export interface LotteryEntryDocument {
  id: string;              // Firestore auto-ID
  sourceType: "event" | "product";
  eventId?: string;        // set when sourceType === "event"
  productId?: string;      // set when sourceType === "product"
  userId: string;          // must be authenticated
  userDisplayName?: string;
  userEmail?: string;      // PII — encrypted at rest
  userPhone: string;       // PII — encrypted at rest; required
  transactionId: string;   // user-provided external payment TX ID
  paymentTime: Date;       // user-provided time of payment
  purchasedItemNumber: number;      // slot/item number they submitted for
  userLotteryNumber: number;        // sequential per source (1, 2, 3…)
  assignedPrizeSlotNumber?: number; // filled after draw
  status: "pending" | "drawn" | "won" | "flagged" | "cancelled";
  isFlagged: boolean;
  flagNote?: string;
  flaggedBy?: string;
  flaggedAt?: Date;
  submittedAt: Date;
  drawnAt?: Date;
}

export const LOTTERY_ENTRIES_COLLECTION = "lotteryEntries";
```

PII fields (`userPhone`, `userEmail`) encrypted via existing `encryptPiiFields` / `decryptPiiFields` pattern (same as `EventEntryRepository`).

---

## New `LotteryConfig` + `LotterySlot` Shared Types

```ts
// appkit/src/features/lottery/types/index.ts  (NEW file)
export interface LotterySlot {
  slotNumber: number;           // 1..totalSlots
  name: string;                 // prize item name shown to users
  priceInPaise: number;         // NEVER sent to client — determines weight
  weight: number;               // computed server-side; NEVER sent to client
  isBooked: boolean;
  bookedByUserLotteryNumber?: number;
  bookedByUserId?: string;
  bookedByDisplayName?: string;
}

export type LotteryPricingMode = "uniform" | "variable";
// uniform: all slots cost the same (uniformPriceInPaise); all slots equal weight (no weighting)
// variable: each slot has its own priceInPaise; weight computed per slot (lower price = higher chance)

export interface LotteryConfig {
  slots: LotterySlot[];
  totalSlots: number;                   // 1..200
  pricingMode: LotteryPricingMode;      // "uniform" | "variable"
  uniformPriceInPaise?: number;         // set when pricingMode === "uniform"; all slots cost this
  drawWindowDurationMinutes: number;
  maxPullsPerTransaction: number;       // max pulls one TX ID is valid for (default 1)
  maxPullsPerUser: number;              // max total pulls one user may make in this lottery (default 1)
                                        // if 1: one slot per user ever; if > 1: each extra purchase = +1 pull
}

export type LotteryEntryStatus = "pending" | "drawn" | "won" | "flagged" | "cancelled";
```

Weighted draw (server-only, never exported to client):
```ts
function computeWeight(priceInPaise: number, maxPriceInPaise: number): number {
  if (maxPriceInPaise === 0) return 50;
  return Math.max(1, Math.round((1 - priceInPaise / maxPriceInPaise) * 99) + 1);
}
function pickWeightedSlot(unclaimed: LotterySlot[]): LotterySlot {
  const total = unclaimed.reduce((s, sl) => s + sl.weight, 0);
  let r = Math.random() * total;
  for (const sl of unclaimed) { r -= sl.weight; if (r <= 0) return sl; }
  return unclaimed[unclaimed.length - 1];
}
```

**Draw happens at submit time — no admin batch trigger.** When a user submits their pull form, the server immediately runs the weighted random selection on unclaimed slots and assigns them a slot. The slot is marked booked atomically (Firestore transaction). Users who pull earlier have access to more unclaimed slots — first-come gets the widest selection. `drawWindowDurationMinutes` controls how long the window is open; once the window closes or all slots are claimed, new pulls are rejected.

**Pricing rules:**
- `pricingMode: "uniform"`: all slots cost `uniformPriceInPaise`; all have identical weight (purely random, no advantage for any slot). Admin sees this on the admin slot view.
- `pricingMode: "variable"`: each slot has its own `priceInPaise`; lower-price slots get higher weight. Weight hidden from store owners and users; only admin sees it.

**Pull limits (enforced server-side, both checks required):**
- `maxPullsPerTransaction`: how many pulls one transaction ID is valid for (default 1). Prevents one payment from claiming multiple slots.
- `maxPullsPerUser`: how many total pulls one user can make in this lottery (default 1 = strictly one slot per user per lottery). If set > 1, each additional qualifying transaction grants +1 pull up to the limit.

---

## Phase 1 — All Confirmed Bug Fixes (8 bugs, factual)

### Bug 1a–1d: `appkit/src/features/events/schemas/index.ts`

**1a** `eventTypeSchema` missing `"raffle"`, `"spin_wheel"` (any API validation rejects these types):
```ts
export const eventTypeSchema = z.enum([
  "sale", "offer", "poll", "survey", "feedback",
  "raffle", "spin_wheel", "lottery",   // ← raffle + spin_wheel were missing; lottery is new
]);
```

**1b** `eventStatusSchema` missing `"cancelled"`:
```ts
export const eventStatusSchema = z.enum(["draft", "active", "paused", "ended", "cancelled"]);
```

**1c** `eventItemSchema` missing 18 fields (raffle fields, spin fields, surveyConfig, feedbackConfig, slug — all silently stripped on `.parse()`). Extend the schema to include every field in `EventItem`:
- `slug?: z.string()`
- `surveyConfig?: surveyConfigSchema` (create `surveyConfigSchema`)
- `feedbackConfig?: feedbackConfigSchema` (create `feedbackConfigSchema`)
- All raffle fields: `hasRaffle`, `raffleType`, `raffleTopN`, `rafflePrize`, `rafflePrizeCouponId`, `rafflePrizeProductIds`, `raffleGithubFunctionUrl`, `raffleWinnerUserId`, `raffleWinnerDisplayName`, `raffleTriggeredAt`, `raffleEntryCount`
- All spin_wheel fields: `spinPrizes`, `spinMaxPerUser`, `spinWindowStart`, `spinWindowEnd`
- `lotteryConfig` (new)

**1d** `pollConfigSchema` missing `requireLogin?`:
```ts
export const pollConfigSchema = z.object({
  allowMultiSelect: z.boolean(),
  allowComment: z.boolean(),
  options: z.array(z.object({ id: z.string(), label: z.string() })),
  resultsVisibility: z.enum(["always", "after_vote", "after_end"]),
  requireLogin: z.boolean().optional(),   // ← was missing
});
```

### Bug 1e: `appkit/src/features/products/schemas/index.ts` — `listingType` enum

TS `ListingType` has: `"standard" | "auction" | "pre-order" | "prize-draw" | "classified" | "digital-code" | "live"`.
Schema has: `["standard","auction","pre-order","prize-draw","bundle"]` — missing `"classified"`, `"digital-code"`, `"live"`; includes removed `"bundle"`.

Fix both `productItemSchema.listingType` and `productListParamsSchema.listingType`:
```ts
z.enum(["standard", "auction", "pre-order", "prize-draw", "classified", "digital-code", "live"])
```

### Bug 1f: Three-way `condition` mismatch across products

- `ProductDocument.condition` (`firestore.ts:178`): `"new"|"used"|"refurbished"|"broken"|"graded"` — has `"graded"`, lacks `"like_new"/"good"/"fair"/"poor"`
- `ProductCondition` TS type (`types/index.ts`): `"new"|"like_new"|"good"|"fair"|"poor"|"used"|"refurbished"|"broken"` — lacks `"graded"`
- `productItemSchema.condition` Zod: same as TS type (no `"graded"`)

Fix: unify all three to include every value (collectibles legitimately use all):
```ts
// ProductDocument.condition, ProductCondition, and productItemSchema.condition — all set to:
"new" | "like_new" | "good" | "fair" | "poor" | "used" | "refurbished" | "broken" | "graded"
```

Update `PRODUCT_FIELDS.CONDITION_VALUES` constant to include all 9 values.

### Bug 4a: `src/app/[locale]/events/[id]/_helpers.ts` — `eventIsActive` wrong for paused/cancelled

`eventIsActive` returns `true` for `"paused"` or `"cancelled"` events that have a future `endsAt`, causing the Participate tab to render when it should not.

```ts
// Fix: status must be exactly "active"
export function eventIsActive(event: RawEvent, now: number = Date.now()): boolean {
  if (event.status !== "active") return false;   // ← strict check, not just "not ended"
  if (!event.endsAt) return true;
  const endsAtMs = new Date(event.endsAt as string).getTime();
  return Number.isFinite(endsAtMs) && endsAtMs > now;
}
```

### Bug 4b: `src/app/[locale]/events/[id]/_constants.ts` — `EVENT_STATUS` + badge map incomplete

`EVENT_STATUS` constant is missing `PAUSED` and `CANCELLED` keys. `EVENT_STATUS_BADGE` map has no entry for `"paused"`, so paused events render the wrong fallback badge colour.

```ts
// Add to EVENT_STATUS:
PAUSED: "paused",
CANCELLED: "cancelled",

// Add to EVENT_STATUS_BADGE:
[EVENT_STATUS.PAUSED]: "warning",      // yellow/amber badge
[EVENT_STATUS.CANCELLED]: "danger",    // red badge
```

---

## Phase 2 — Add `lottery` to EventType

**`appkit/src/features/events/types/index.ts`**

```ts
export type EventType =
  | "sale" | "offer" | "poll" | "survey" | "feedback"
  | "raffle" | "spin_wheel"
  | "lottery";   // NEW

import type { LotteryConfig } from "../../lottery/types";

// Add to EventItem:
lotteryConfig?: Omit<LotteryConfig, never>;  // slots sent with weight/price stripped by adapter
```

**`appkit/src/features/events/schemas/firestore.ts`**

```ts
// Add to EventDocument:
lotteryConfig?: LotteryConfig;
```

The `lotteryConfig.slots[].priceInPaise` and `.weight` fields are stripped by the `toClientEvent` adapter before any data leaves the server.

---

## Phase 3 — Extend Prize-Draw Product for Lottery Mode

**`appkit/src/features/products/schemas/firestore.ts`**

```ts
// Add to PrizeDrawItem:
prizeSlotPrice?: number;  // price in paise for this specific slot (lottery mode only)
                          // lower prizeSlotPrice = higher weight = higher chance (hidden from UI)

// Add to ProductDocument (prize-draw fields section):
prizeDrawMode?: "reveal" | "lottery";  // default "reveal" for backward compat
lotteryConfig?: LotteryConfig;         // when prizeDrawMode === "lottery"
```

Backward compat: existing prize-draws without `prizeDrawMode` behave as `"reveal"` (no change).

When `prizeDrawMode === "lottery"`:
- Each `PrizeDrawItem.prizeSlotPrice` drives the weight (same algorithm as event lottery)
- Users enter via TX ID + phone form (not via cart/payment flow)
- `lotteryConfig.slots` mirrors the product's `prizeDrawItems` with `slotNumber = itemNumber`
- Admin or store owner triggers the draw

Weight source priority: `PrizeDrawItem.prizeSlotPrice` → falls back to `PrizeDrawItem.estimatedValue` if `prizeSlotPrice` absent.

---

## Phase 4 — New Lottery Entry Repository

**`appkit/src/features/lottery/repository/lottery-entry.repository.ts`** (NEW)

```ts
class LotteryEntryRepository extends BaseRepository<LotteryEntryDocument> {
  static readonly SIEVE_FIELDS = {
    sourceType: { canFilter: true },
    eventId: { canFilter: true },
    productId: { canFilter: true },
    userId: { canFilter: true },
    status: { canFilter: true },
    submittedAt: { canFilter: true, canSort: true },
    userLotteryNumber: { canSort: true },
  };

  async nextUserLotteryNumber(sourceId: string, field: "eventId" | "productId"): Promise<number> {
    // Count existing entries for this source, return count + 1
    // Wrapped in Firestore transaction to prevent races
  }

  async listForSource(sourceId: string, field: "eventId" | "productId", model: SieveModel): Promise<FirebaseSieveResult<LotteryEntryDocument>>

  async countByTransactionId(sourceId: string, transactionId: string): Promise<number>
  // enforces maxPullsPerTransaction
}

export const lotteryEntryRepository = new LotteryEntryRepository();
```

PII encryption/decryption for `userPhone` + `userEmail` overridden in `mapDoc` (same pattern as `EventEntryRepository`).

---

## Phase 5 — Server Actions

**`appkit/src/_internal/server/features/lottery/actions.ts`** (NEW, `"use server"`)

| Action | Description |
|--------|-------------|
| `submitLotteryPullAction({ sourceType, eventId?, productId?, userId, userPhone, transactionId, paymentTime, purchasedItemNumber })` | **User-initiated.** Validates inputs; checks `maxPullsPerTransaction`; runs weighted random slot selection atomically in Firestore transaction; marks slot booked; assigns sequential `userLotteryNumber`; creates `LotteryEntryDocument` with `assignedPrizeSlotNumber` already set. Returns assigned slot so user sees their prize immediately. Rejects if no slots remain or draw window is closed. |
| `flagLotteryEntryAction({ entryId, flagNote, flaggedByUserId })` | **Admin only.** Sets `isFlagged: true`, `flagNote`, `flaggedBy`, `flaggedAt`, `status: "flagged"`. The slot remains booked; use `reopenLotterySlotAction` to free it. |
| `reopenLotterySlotAction({ sourceType, sourceId, slotNumber, adminUserId })` | **Admin only.** Clears `isBooked` on the slot so it can be claimed in a future pull. Only valid when the associated entry is `"flagged"`. |
| `createLotteryEventAction(data)` | **Admin only.** Creates event with `type: "lottery"` + `lotteryConfig`. Weights computed server-side, never returned to client. |
| `updateLotteryEventAction(id, data)` | **Admin only.** Updates event + `lotteryConfig`; recomputes slot weights. |
| `setProductLotteryModeAction(productId, lotteryConfig)` | **Store owner or Admin.** Sets `prizeDrawMode: "lottery"` + `lotteryConfig`. Store owners provide `prizeSlotPrice` but weight is NEVER shown to store owners — stripped by adapter before any store-facing response. |

**Data layer: `appkit/src/_internal/server/features/lottery/data.ts`** (NEW, uses `React.cache`)

```ts
export const getLotteryEventCached = cache(async (id: string) => { /* strips weight+price */ });
export const listLotteryEvents = cache(async (opts) => { /* type=lottery, strips weight+price */ });
export const getLotteryProductCached = cache(async (slug: string) => { /* prize-draw in lottery mode, strips weight+price */ });
export const getLotteryEntriesForAdmin = async (sourceType, sourceId, opts) => { /* includes phone+txId */ };
export const getLotteryEntriesForUser = async (userId, opts) => { /* own entries only, no phone of others */ };
```

**Adapter: `appkit/src/_internal/server/features/lottery/adapters.ts`** (NEW)

`toClientLotterySlot(slot)` — removes `priceInPaise` and `weight` before any client response.

---

## Phase 6 — Client Components

All in `appkit/src/_internal/client/features/lottery/` (new directory), all `"use client"`:

| Component | Props | Purpose |
|-----------|-------|---------|
| `LotterySlotGrid` | `slots: ClientLotterySlot[], totalSlots: number` | Visual N×cols grid: booked slots show buyer display name + user number in green; available slots show slot number + name in white. Never shows price or weight. |
| `LotteryPullForm` | `sourceType, eventId?, productId?, totalSlots, maxPulls, onSuccess` | `<Form>` with: `<FieldInput name="transactionId">`, `<FieldInput name="paymentTime" type="datetime-local">`, `<FieldInput name="itemNumber" type="number">`, `<FieldInput name="userPhone" type="tel">`. Zod: phone ≥10 chars, TX ID ≥4 chars, itemNumber within totalSlots range. Success shows assigned `userLotteryNumber`. |
| `LotteryListView` | `items: ClientLotteryEvent[], adminMode?: boolean` | Card grid of lotteries. Admin sees all statuses; user sees active only. |
| `LotteryDetailView` | `event: ClientLotteryEvent, user, currentEntry?` | Cover + description + `LotterySlotGrid` + `LotteryPullForm` (if active + logged in). Shows draw result if ended. |
| `LotteryAdminEditView` | `eventId?: string` | Admin form: title, description, slot builder table (add/remove rows with name + price), window config, optional link to product. |
| `LotteryEntriesView` | `sourceType, sourceId, isAdmin, isStoreOwner` | Table: TX ID (admin/owner only), phone (admin/owner only), user number, claimed slot, status badge. Admin row actions: Flag + Reopen Slot. Store owner can view but NOT flag (admin only). No "Draw Next Window" — draws are user-initiated. |
| `LotteryAdminSlotView` | `slots: ClientLotterySlot[]` (admin shape) | Admin-only view showing slots with price + computed weight + % chance. Separate from `LotterySlotGrid` (public) which never shows price/weight. |
| `PrizeDrawLotteryDetailView` | `product: ClientProduct, user, currentEntry?` | Same as `LotteryDetailView` but sourced from product. Integrates with existing `PrizeDrawDetailPageView` via a `mode` prop. |

Extend `EventParticipateClient.tsx` — add `case "lottery": return <LotteryPullForm sourceType="event" eventId={...} />`.

---

## Phase 7 — Action Registry + Routes

**`appkit/src/_internal/shared/actions/action-registry.ts`**

New `LOTTERY` bucket:
```ts
LOTTERY: {
  "pull": { id: "lottery.pull", label: "Submit Entry", kind: "primary",
    description: "Submit a lottery pull entry — slot assigned immediately." },
  "flag-entry": { id: "lottery.flag-entry", label: "Flag as Scammer", kind: "danger",
    confirmation: { title: "Flag this entry?", body: "Entry will be marked fraudulent. Their claimed slot stays booked until you manually reopen it.", confirmLabel: "Flag entry", confirmKind: "danger" } },
  "reopen-slot": { id: "lottery.reopen-slot", label: "Reopen Slot", kind: "secondary",
    confirmation: { title: "Reopen this slot?", body: "The slot will be available for new pulls. The flagged entry's slot assignment is removed.", confirmLabel: "Reopen" } },
  "cancel": { id: "lottery.cancel", label: "Cancel Lottery", kind: "danger",
    confirmation: { title: "Cancel lottery?", body: "Draw window closes immediately. Pending pulls rejected.", confirmLabel: "Cancel", confirmKind: "danger" } },
}
```

Note: no `"trigger-draw"` action — draws are user-initiated, not admin-triggered.

Add `LOTTERY` to `ActionResource` union.

**`appkit/src/next/routing/route-map.ts`**

```ts
PUBLIC: {
  LOTTERIES: "/lottery",
  LOTTERY_DETAIL: (id: string) => `/lottery/${id}`,
}
ADMIN: {
  LOTTERIES: "/admin/lotteries",
  LOTTERY_ENTRIES: (id: string) => `/admin/lotteries/${id}/entries`,
}
STORE: {
  PRIZE_DRAW_ENTRIES: (id: string) => `/store/prize-draws/${id}/entries`,
}
ADMIN: {
  // existing:
  PRIZE_DRAWS_ENTRIES: (id: string) => `/admin/prize-draws/${id}/entries`,
}
```

---

## Phase 8 — Consumer Pages + API Routes

### Public pages

| File | `revalidate` | Notes |
|------|-------------|-------|
| `src/app/[locale]/lottery/page.tsx` | 120 | Lottery list; renders `<LotteryListView>`; auth check — show "Login to participate" CTA if not authed |
| `src/app/[locale]/lottery/[id]/layout.tsx` | 30 | Suspense + metadata |
| `src/app/[locale]/lottery/[id]/page.tsx` | 30 | Full lottery detail; renders `<LotteryDetailView>`; auth-gated pull form |

Prize-draw product page: modify `src/app/[locale]/prize-draws/[slug]/page.tsx` to detect `prizeDrawMode === "lottery"` and render `<PrizeDrawLotteryDetailView>` instead of `<PrizeDrawDetailPageView>`. Pass `revalidate = 30` for lottery-mode products (slots change), keep 120 for reveal-mode.

### Admin pages

| File | Notes |
|------|-------|
| `src/app/[locale]/admin/lotteries/page.tsx` | Lists lottery-type events; renders `<LotteryListView adminMode>` |
| `src/app/[locale]/admin/lotteries/layout.tsx` | `makeAdminSectionLayout("events:read")` |
| `src/app/[locale]/admin/lotteries/[id]/entries/page.tsx` | Full `<LotteryEntriesView>` with draw + flag |
| `src/app/[locale]/admin/prize-draws/[id]/entries/page.tsx` | NEW — product lottery entries (admin view) |

Create/edit: `/admin/events/new` + `/admin/events/[id]/edit` (existing `AdminEventEditorView`) — extend to show lottery-specific fields when `type === "lottery"` is selected. No new page needed.

### Store pages

| File | Notes |
|------|-------|
| `src/app/[locale]/store/prize-draws/[id]/entries/page.tsx` | NEW — store owner views their prize-draw lottery entries (phone + TX ID visible); can trigger draw |

### API routes

| Route | Method | RBAC | Calls |
|-------|--------|------|-------|
| `src/app/api/events/[id]/lottery-pull/route.ts` | POST | `auth: true` + soft-ban check | `submitLotteryPullAction({ sourceType: "event", eventId: id, ...body })` — draws immediately |
| `src/app/api/events/[id]/lottery-entries/route.ts` | GET | admin: full (phone+txId); user: own only (no others' phone) | `getLotteryEntriesForAdmin` or `getLotteryEntriesForUser` |
| `src/app/api/products/[id]/lottery-pull/route.ts` | POST | `auth: true` | `submitLotteryPullAction({ sourceType: "product", productId: id, ...body })` — draws immediately |
| `src/app/api/products/[id]/lottery-entries/route.ts` | GET | admin+store-owner: full; user: own only | list entries |
| `src/app/api/lottery-entries/[entryId]/flag/route.ts` | PATCH | `roles: ROLES_ADMIN_ONLY` | `flagLotteryEntryAction` |
| `src/app/api/lottery-entries/[entryId]/reopen-slot/route.ts` | POST | `roles: ROLES_ADMIN_ONLY` | `reopenLotterySlotAction` |

Rate-limit `lottery-pull` routes: apply `applyRateLimit(request, { maxAttempts: 5, windowMs: 60_000 })` to prevent TX ID spamming.

### `src/constants/api.ts`

```ts
LOTTERY_PULL: (id: string) => `/api/events/${id}/lottery-pull`,
LOTTERY_DRAW: (id: string) => `/api/events/${id}/draw`,
LOTTERY_ENTRIES: (id: string) => `/api/events/${id}/lottery-entries`,
PRODUCT_LOTTERY_PULL: (id: string) => `/api/products/${id}/lottery-pull`,
PRODUCT_LOTTERY_DRAW: (id: string) => `/api/products/${id}/draw`,
PRODUCT_LOTTERY_ENTRIES: (id: string) => `/api/products/${id}/lottery-entries`,
FLAG_LOTTERY_ENTRY: (entryId: string) => `/api/lottery-entries/${entryId}/flag`,
```

### `src/constants/navigation.tsx`

Add "Lotteries" to `ADMIN_NAV_GROUPS` under Promotions group (alongside Events).

---

## Phase 9 — Seed Data

**`appkit/src/seed/events-seed-data.ts`** — add 2 lottery events:

- `event-pokemon-number-draw-july-2026`: `type: "lottery"`, `status: "active"`, `lotteryConfig.totalSlots: 25`, 15 pre-booked (mapped to seed users), `drawWindowDurationMinutes: 5`
- `event-yugioh-slot-raffle-draft`: `type: "lottery"`, `status: "draft"`, 10 slots, all unbooked

**`appkit/src/seed/lottery-entries-seed-data.ts`** (NEW) — 5 entries for the active lottery with `userLotteryNumber: 1-5`, dummy `transactionId: "TXN-SEED-00X"`, `status: "pending"`.

**`appkit/src/seed/products-prize-draws-seed-data.ts`** — extend one existing prize-draw seed product to have `prizeDrawMode: "lottery"` + `lotteryConfig` with 10 slots (5 pre-booked). Other stays as `"reveal"` mode.

**`appkit/src/seed/manifest.ts`** — add `lotteryEntries` collection.

**`src/app/api/demo/seed/route.ts`** — add `lotteryEntries` to the seed collection list.

---

## Phase 10 — Firestore Indexes

**`appkit/firebase/base/firestore.indexes.json`** — add:

```json
// lotteryEntries queries
{ "collectionGroup": "lotteryEntries", "fields": [
    { "fieldPath": "eventId" }, { "fieldPath": "submittedAt", "order": "ASCENDING" }]},
{ "collectionGroup": "lotteryEntries", "fields": [
    { "fieldPath": "productId" }, { "fieldPath": "submittedAt", "order": "ASCENDING" }]},
{ "collectionGroup": "lotteryEntries", "fields": [
    { "fieldPath": "eventId" }, { "fieldPath": "status" },
    { "fieldPath": "submittedAt", "order": "ASCENDING" }]},
{ "collectionGroup": "lotteryEntries", "fields": [
    { "fieldPath": "productId" }, { "fieldPath": "status" },
    { "fieldPath": "submittedAt", "order": "ASCENDING" }]},
{ "collectionGroup": "lotteryEntries", "fields": [
    { "fieldPath": "userId" }, { "fieldPath": "submittedAt", "order": "DESCENDING" }]},
// events type+status index for lottery list queries
{ "collectionGroup": "events", "fields": [
    { "fieldPath": "type" }, { "fieldPath": "status" },
    { "fieldPath": "startsAt", "order": "DESCENDING" }]}
```

---

## Phase 11 — Vercel Optimisation

| Change | Estimated impact |
|--------|-----------------|
| `/events/[id]/winner` → `revalidate = 3600` (ended event, static) | ~50× fewer ISR rebuilds for concluded events |
| `/lottery/[id]` ended state → `revalidate = 3600` | Zero cold starts for finished lotteries |
| `/lottery/[id]` active state → `revalidate = 30` (slots change as draws happen) | Keeps slot grid fresh |
| `Cache-Control: public, s-maxage=120, stale-while-revalidate=600` on `GET /api/events` (non-admin) | CDN absorbs list requests |
| `Cache-Control: public, s-maxage=30, stale-while-revalidate=300` on `GET /api/events/[id]` (active lottery) | Reduce per-user polling |
| All admin/store GET routes: `Cache-Control: no-store` | Prevents stale admin data. Set it on the response — do NOT reach for a route-segment config, which is banned by `audit-no-force-dynamic`. These routes are already per-request because their layout reads the session. |
| Lottery entry list pages: `pageSize: 20`, never load all 200 at once | Cap Firestore reads per request |

---

## Phase 12 — Second Database Schema (documented, not implemented)

Fields that would migrate to a financial relational DB in future:

```sql
-- lottery_transactions — audit trail for all lottery pulls
CREATE TABLE lottery_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type   TEXT NOT NULL CHECK (source_type IN ('event', 'product')),
  source_id     TEXT NOT NULL,           -- Firebase event/product doc ID
  entry_id      TEXT NOT NULL,           -- Firebase lotteryEntries doc ID
  user_id       TEXT NOT NULL,           -- Firebase Auth UID
  external_tx_id TEXT NOT NULL,          -- user-provided UPI ref / payment ref
  payment_time  TIMESTAMPTZ,             -- user-reported
  slot_price_paise INTEGER,              -- slot price at time of entry
  verified_by_admin BOOLEAN DEFAULT FALSE,
  verified_at   TIMESTAMPTZ,
  flag_note     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
-- Index: (source_type, source_id), (user_id), (external_tx_id)

-- prize_draw_payments — classic reveal-mode prize draw purchases
-- payout_records       — Razorpay payout trail (already in Firebase payouts collection)
-- refund_audit_trail   — refund + deduction history
```

Firebase retains: slot names, booked status, display names, event metadata, product listings.
Second DB retains: TX IDs, amounts, payment verification, audit trail.

Add `// FUTURE_FINANCIAL_DB: external_tx_id → lottery_transactions.external_tx_id` comments to:
- `LotteryEntryDocument.transactionId`
- `LotteryEntryDocument.userPhone`
- `LotterySlot.priceInPaise`
- `PrizeDrawItem.prizeSlotPrice`

---

## Phase 13 — Unit Tests

### New test files in `appkit/src/features/lottery/__tests__/`

**`lottery-draw.test.ts`** — pure algorithmic tests (no Firestore, no mocks needed):

| Test case | What it verifies |
|-----------|-----------------|
| `computeWeight(0, 10000)` = 100 | zero price → max weight |
| `computeWeight(10000, 10000)` = 1 | max price → min weight 1 (never 0) |
| `computeWeight(5000, 10000)` = 51 | midpoint → midpoint weight |
| `uniform mode: all weights equal` | when `pricingMode === "uniform"` all slots get weight 50 (no discrimination) |
| `pickWeightedSlot([{weight:1},{weight:99}])` over 10000 iterations → high-weight slot ~99% | statistical distribution check (allow ±3%) |
| `pickWeightedSlot([])` → throws | empty array guard |
| `pickWeightedSlot([oneSlot])` → returns it | single slot always wins |

**`lottery-entry.test.ts`** — entry submission logic (mock Firestore):

| Test case | What it verifies |
|-----------|-----------------|
| Successful pull with 1 unclaimed slot → entry created, slot booked | happy path |
| Pull when no slots remain → throws `LOTTERY_FULL` error | no slots guard |
| Pull when draw window closed → throws `LOTTERY_WINDOW_CLOSED` | window guard |
| Pull when `maxPullsPerUser = 1` and user already has 1 entry → throws `USER_LIMIT_REACHED` | user limit |
| Pull when `maxPullsPerTransaction = 1` and TX ID already used → throws `TX_ALREADY_USED` | TX ID limit |
| Pull when `maxPullsPerUser = 2` and user has 1 entry → succeeds | multiple pulls allowed |
| Flagging entry sets correct fields | flag action |
| Reopening slot only works if entry is flagged (not won/drawn) | slot reopen guard |
| Sequential `userLotteryNumber` — concurrent pulls get unique numbers | concurrency guard |

**`lottery-schema.test.ts`** — Zod schema validation:

| Test case | What it verifies |
|-----------|-----------------|
| `lotteryEntrySubmitSchema.parse({ transactionId: "TXN1", phone: "9876543210", ... })` passes | valid input |
| Phone with < 10 digits → validation error on `userPhone` | phone validation |
| `itemNumber: 0` → error (min 1) | slot number bounds |
| `itemNumber: 201` with `totalSlots: 200` → error | upper bound |
| Missing `transactionId` → error | required field |

### Updates to existing test files

If `appkit/src/features/events/__tests__/` exists: add tests for `eventTypeSchema` accepting `"raffle"`, `"spin_wheel"`, `"lottery"` (regression tests for the bug fix in Phase 1).

If `appkit/src/features/products/__tests__/` exists: add tests for `listingType` accepting `"classified"`, `"digital-code"`, `"live"` and rejecting `"bundle"`.

### Test runner

Tests use the existing Jest configuration. Run with `npm test --prefix appkit -- --testPathPattern=lottery` to run only lottery tests. All tests must pass as part of `npm run check`.

---

## appkit Export Surface

| File | Additions |
|------|-----------|
| `appkit/src/index.ts` | `LotteryListView`, `LotteryDetailView`, `LotterySlotGrid`, `LotteryPullForm`, `PrizeDrawLotteryDetailView`; `LotteryConfig`, `LotterySlot`, `LotteryEntryDocument`, updated `EventType` |
| `appkit/src/client.ts` | Same client-safe set |
| `appkit/src/server.ts` | `lotteryEntryRepository`, all 5 server actions, `getLotteryEventCached`, `listLotteryEvents`, `getLotteryProductCached` |

---

## Complete File Change List

**appkit — ~28 files**

- `features/events/types/index.ts` — add `"lottery"` to `EventType`, add `LotteryConfig` import
- `features/events/schemas/firestore.ts` — add `lotteryConfig?` to `EventDocument`
- `features/events/schemas/index.ts` — **BUG FIX** + extend schemas
- `features/products/schemas/firestore.ts` — add `prizeSlotPrice?` to `PrizeDrawItem`; add `prizeDrawMode?` + `lotteryConfig?` to `ProductDocument`
- `features/lottery/schemas/firestore.ts` — NEW: `LotteryEntryDocument`, collection const
- `features/lottery/types/index.ts` — NEW: `LotteryConfig`, `LotterySlot`, `LotteryEntryStatus`
- `features/lottery/schemas/zod.ts` — NEW: Zod schemas for entry submission
- `features/lottery/repository/lottery-entry.repository.ts` — NEW
- `features/lottery/__tests__/lottery-draw.test.ts` — NEW (algorithmic unit tests)
- `features/lottery/__tests__/lottery-entry.test.ts` — NEW (action logic, mocked Firestore)
- `features/lottery/__tests__/lottery-schema.test.ts` — NEW (Zod validation tests)
- `_internal/server/features/lottery/data.ts` — NEW (React.cache wrappers)
- `_internal/server/features/lottery/adapters.ts` — NEW (strip price/weight)
- `_internal/server/features/lottery/actions.ts` — NEW (`"use server"` — 5 actions)
- `_internal/server/features/lottery/metadata.ts` — NEW
- `_internal/client/features/lottery/LotterySlotGrid.tsx` — NEW
- `_internal/client/features/lottery/LotteryPullForm.tsx` — NEW
- `_internal/client/features/lottery/LotteryListView.tsx` — NEW
- `_internal/client/features/lottery/LotteryDetailView.tsx` — NEW
- `_internal/client/features/lottery/LotteryAdminEditView.tsx` — NEW
- `_internal/client/features/lottery/LotteryEntriesView.tsx` — NEW
- `_internal/client/features/lottery/PrizeDrawLotteryDetailView.tsx` — NEW
- `_internal/client/features/events/EventParticipateClient.tsx` — MODIFY (add lottery case)
- `_internal/shared/actions/action-registry.ts` — MODIFY (add LOTTERY bucket)
- `next/routing/route-map.ts` — MODIFY (add LOTTERIES, LOTTERY_ENTRIES, PRIZE_DRAW_ENTRIES routes)
- `seed/events-seed-data.ts` — MODIFY (add 2 lottery events)
- `seed/lottery-entries-seed-data.ts` — NEW
- `seed/products-prize-draws-seed-data.ts` — MODIFY (1 product → lottery mode)
- `seed/manifest.ts` — MODIFY (add lotteryEntries)
- `firebase/base/firestore.indexes.json` — MODIFY (6 new indexes)
- `index.ts`, `client.ts`, `server.ts` — MODIFY exports

**Consumer — ~17 files**

- `src/app/[locale]/lottery/page.tsx` — NEW
- `src/app/[locale]/lottery/[id]/layout.tsx` — NEW
- `src/app/[locale]/lottery/[id]/page.tsx` — NEW
- `src/app/[locale]/admin/lotteries/page.tsx` — NEW
- `src/app/[locale]/admin/lotteries/layout.tsx` — NEW
- `src/app/[locale]/admin/lotteries/[id]/entries/page.tsx` — NEW
- `src/app/[locale]/admin/prize-draws/[id]/entries/page.tsx` — NEW
- `src/app/[locale]/store/prize-draws/[id]/entries/page.tsx` — NEW
- `src/app/[locale]/prize-draws/[slug]/page.tsx` — MODIFY (detect lottery mode)
- `src/app/api/events/[id]/lottery-pull/route.ts` — NEW
- `src/app/api/events/[id]/draw/route.ts` — NEW
- `src/app/api/events/[id]/lottery-entries/route.ts` — NEW
- `src/app/api/products/[id]/lottery-pull/route.ts` — NEW
- `src/app/api/products/[id]/draw/route.ts` — NEW
- `src/app/api/products/[id]/lottery-entries/route.ts` — NEW
- `src/app/api/lottery-entries/[entryId]/flag/route.ts` — NEW
- `src/constants/api.ts` — MODIFY (7 new API route constants)
- `src/constants/navigation.tsx` — MODIFY (Lotteries in admin nav)
- `codebaseexports.md` — MODIFY

---

## Verification

```
1.  npm run check                   # must be 0 before touching anything
2.  # Phase 1 schema bug fixes first → npm run check (expect 0)
3.  npm test --prefix appkit -- --testPathPattern=lottery   # all lottery unit tests pass
4.  # All phases → npm run check (expect 0) after each phase
4.  npm run dev
5.  /demo/seed → seed events + lotteryEntries + products
6.  /lottery → shows 1 active lottery, 1 draft (admin sees both)
7.  /lottery/event-pokemon-number-draw-july-2026 → slot grid + pull form (login required)
8.  Submit pull: TX ID + phone + payment time + item number → assigned user #6 shown
9.  /admin/lotteries/event-pokemon-number-draw-july-2026/entries → all 6 entries visible
10. Flag entry 3 → confirmation → red badge
11. "Draw Next Window" → draws oldest 5-min bucket → slots go green in grid
12. Verify priceInPaise + weight NOT in /api/events/[id] response
13. /prize-draws/[lottery-mode-product-slug] → slot grid renders (not reveal UI)
14. Submit product pull → entry appears in /store/prize-draws/[id]/entries
15. /admin/events → poll/raffle/spin_wheel events still load (bug fix verified)
16. npm run check → 0
17. git add + git commit
18. node scripts/deploy.mjs
19. npm run firebase generate && npm run firebase deploy --only indexes
```
