# Offers Feature

**Feature paths:**

- Buyer: `src/features/user/components/UserOffersView.tsx`
- Seller: `src/features/seller/components/SellerOffersView.tsx`
- Product: `src/features/products/components/MakeOfferForm.tsx`

**Actions:** `src/actions/offer.actions.ts`  
**Schema:** `src/db/schema/offers.ts`  
**Repository:** `src/repositories/offer.repository.ts`  
**Functions:** `functions/src/jobs/offerExpiry.ts`, `functions/src/repositories/offer.repository.ts`

---

## Overview

The make-an-offer system lets buyers propose a price on any listed product. Sellers can accept, decline, or counter. Buyers can counter back against the seller's counter. Accepted offers move to checkout; declined/expired/withdrawn offers are closed.

---

## Business Rules

| Rule                   | Detail                                                                                                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Offer limit            | Max **3 offer documents** per buyer per product. Resets automatically when the product's `updatedAt` advances (seller edits the listing). Tracked purely by doc count — no separate counter field. |
| One active offer       | A buyer may only hold **one active** (`pending` or `countered`) offer per product at a time. Making a new offer requires withdrawing the existing one first.                                       |
| Buyer counter range    | Buyer's `counterAmount` must be **within ±20 %** of the seller's `counterAmount`.                                                                                                                  |
| RC on buyer counter    | Only the net **delta** (`counterAmount − offerAmount`) is tracked. The original engagement is reused.                                                                                              |
| Counter replaces offer | A buyer counter closes the existing `countered` offer (status → `withdrawn`) and writes a fresh `pending` offer at the new price.                                                                  |
| Expiry guard           | Any mutation action on an expired offer is rejected immediately — the cron has already cleaned up.                                                                                                 |
| Product availability   | Checkout is blocked if the product has gone out of stock (`stock ≤ 0`) or been archived since the offer was accepted.                                                                              |

---

## Offer Lifecycle

```
Buyer makes offer
        │
        ├── Seller ACCEPTS  ──► checkoutOfferAction ──► paid (order created)
        │
        ├── Seller DECLINES ──► declined status
        │
        ├── Seller COUNTERS ──► buyer receives counter
        │       │
        │       ├── Buyer ACCEPTS counter ──► acceptCounterOfferAction
        │       │       │   status → accepted
        │       │       └── checkoutOfferAction ──► paid
        │       │
        │       ├── Buyer COUNTERS BACK (±20 %) ──► counterOfferByBuyerAction
        │       │       │   Old offer withdrawn; fresh pending offer created
        │       │       │   Subject to 3-offer limit
        │       │       └── back to "Seller COUNTERS" branch above
        │       │
        │       └── Buyer WITHDRAWS ──► withdrawOfferAction
        │
        └── 48h EXPIRY (CRON) ──► offerExpiry job notifies buyer
```

---

## Schema (`src/db/schema/offers.ts`)

```ts
type OfferStatus =
  | "pending" // Buyer submitted, awaiting seller response
  | "accepted" // Seller accepted — ready for checkout at lockedPrice
  | "declined" // Seller declined
  | "countered" // Seller sent a counter — awaiting buyer response
  | "expired" // Passed expiresAt without a response
  | "withdrawn" // Buyer withdrew, or closed by a buyer counter
  | "paid"; // Buyer completed checkout

interface OfferDocument {
  id: string;
  productId: string;
  productTitle: string;
  productSlug?: string;
  productImageUrl?: string;
  buyerUid: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  sellerName: string;
  offerAmount: number; // buyer's proposed price
  listedPrice: number; // original listed price at offer time
  counterAmount?: number; // seller's counter
  lockedPrice?: number; // final agreed price (set on accept)
  currency: string;
  status: OfferStatus;
  buyerNote?: string;
  sellerNote?: string;
  expiresAt: Date; // createdAt + 48h
  acceptedAt?: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Constants:** `OFFER_COLLECTION = "offers"`, `OFFER_FIELDS`, `OfferStatus`

---

## Server Actions (`src/actions/offer.actions.ts`)

| Action                             | Auth   | Description                                                                                                                                                                                         |
| ---------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `makeOfferAction(input)`           | buyer  | Validates product status; enforces 3-offer limit (by doc count since `product.updatedAt`); **blocks if an active offer already exists** on this product (`hasActiveOffer`); creates `OfferDocument` |
| `respondToOfferAction(input)`      | seller | Accept / decline / counter. **Rejects if offer has expired.**                                                                                                                                       |
| `acceptCounterOfferAction(input)`  | buyer  | Status → accepted. **Rejects if counter has expired.**                                                                                                                                              |
| `counterOfferByBuyerAction(input)` | buyer  | Counter back within ±20 % of seller's counter; enforces 3-offer limit; closes old offer, creates fresh one. **Rejects if counter has expired.**                                                     |
| `withdrawOfferAction(input)`       | buyer  | Marks withdrawn. **Rejects if already expired** (already cleaned up by cron).                                                                                                                       |
| `checkoutOfferAction(offerId)`     | buyer  | Adds to cart at `lockedPrice`. **Blocked if product out of stock or archived.**                                                                                                                     |
| `listBuyerOffersAction()`          | buyer  | Sieve-enabled paginated read                                                                                                                                                                        |
| `listSellerOffersAction()`         | seller | Sieve-enabled paginated read                                                                                                                                                                        |

**Exported types:** `MakeOfferInput`, `RespondToOfferInput`, `BuyerCounterInput`

---

## API Routes

| Method | Route                | Description                            |
| ------ | -------------------- | -------------------------------------- |
| GET    | `/api/seller/offers` | Authenticated seller's incoming offers |
| GET    | `/api/user/offers`   | Authenticated buyer's outgoing offers  |

---

## Feature Hooks

### Seller

```ts
const { offers, isLoading } = useSellerOffers(params);
const { respond, isPending } = useRespondToOffer();
```

### Buyer

```ts
const { offers, isLoading } = useUserOffers(params);
const { mutate: makeOffer } = useMakeOffer();
const { mutate: acceptCounter } = useAcceptCounter();
const { mutate: counterBack } = useCounterOfferByBuyer();
const { mutate: withdraw } = useWithdrawOffer();
```

---

## Feature Components

### `SellerOffersView`

DataTable showing incoming offers. Columns: product, buyer, offer amount, status, expiry. Row action: open counter modal (`min: offer–20%, max: offer+5%`), accept, decline.

### `UserOffersView`

DataTable showing buyer's sent offers. Status badge per row. Actions: accept counter, counter back (shows when status is `countered`), checkout, withdraw.

### `MakeOfferForm`

Embedded on `ProductDetailView`. Requires auth. Input: offer amount (₹). Displays remaining offer count (out of 3) upfront. Calls `makeOfferAction`.

---

## Repository (`src/repositories/offer.repository.ts`)

| Method                                          | Description                                                                                                                            |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `create(input)`                                 | Inserts new offer doc with 48h `expiresAt`                                                                                             |
| `findById(id)`                                  | Single doc lookup                                                                                                                      |
| `findByBuyer(uid, model?)`                      | Buyer offer list with optional Sieve filtering                                                                                         |
| `findBySeller(id, model?)`                      | Seller offer list with optional Sieve filtering                                                                                        |
| `findPendingBySeller(id)`                       | All pending offers for a seller                                                                                                        |
| `findExpired()`                                 | Pending **and countered** offers past `expiresAt` (used by server-side sweep; mirrors `findExpiredActive` in functions repo)           |
| `hasActiveOffer(uid, productId)`                | Returns `true` if buyer has any `pending` or `countered` offer on this product; uses `.select().limit(1)` (stub read) for minimal cost |
| `countByBuyerAndProduct(uid, productId, since)` | Count offer docs for a buyer on a product created on or after `since`; uses `.select()` (stub reads) for minimal cost                  |
| `accept(id, price, note?)`                      | Sets status `accepted`, `lockedPrice`, `acceptedAt`                                                                                    |
| `decline(id, note?)`                            | Sets status `declined`                                                                                                                 |
| `counter(id, amount, note?)`                    | Sets status `countered`, `counterAmount`                                                                                               |
| `acceptCounter(id)`                             | Promotes `counterAmount` to `lockedPrice`, status `accepted`                                                                           |
| `withdraw(id)`                                  | Sets status `withdrawn`                                                                                                                |
| `expireMany(ids[])`                             | Batch-updates status to `expired` (499-doc Firestore batches)                                                                          |

---

## Functions

### `offerExpiry.ts` (CRON daily 00:15 UTC)

Queries all `pending` and `countered` offers where `expiresAt <= now`. For each:

1. Marks offer `expired`
2. Sends buyer notification

Uses `offerRepository.findExpiredActive(now)` and `expireMany(ids)` (499-doc Firestore batches).
