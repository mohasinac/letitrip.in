# Offers Feature

**Feature paths:**

- Buyer: `src/features/user/components/UserOffersView.tsx`
- Seller: `src/features/seller/components/SellerOffersView.tsx`
- Product: `src/features/products/components/MakeOfferForm.tsx`

**Actions:** `src/actions/offer.actions.ts`  
**Schema:** `src/db/schema/offers.ts`  
**Functions:** `functions/src/jobs/offerExpiry.ts`, `functions/src/repositories/offer.repository.ts`

---

## Overview

The make-an-offer system lets buyers propose a price on any listed product. RC coins are locked during the offer lifetime, ensuring buyers have skin in the game. Sellers can accept, decline, or counter. Accepted offers move to checkout; declined/expired offers release the locked RC.

**Economics:** 10 RC = ₹1. RC required to make an offer = `offerAmount / 10` (i.e. matching coin value).

---

## Offer Lifecycle

```
Buyer makes offer (RC engaged)
        │
        ├── Seller ACCEPTS  ──► buyer calls checkoutOfferAction ──► paid (RC released, order created)
        │
        ├── Seller DECLINES ──► RC released ──► expired status
        │
        ├── Seller COUNTERS ──► buyer receives counter
        │       │
        │       ├── Buyer ACCEPTS counter ──► acceptCounterOfferAction (RC adjusted to counter price)
        │       │       └── then buyer checkouts ──► paid
        │       │
        │       └── Buyer WITHDRAWS       ──► withdrawOfferAction (RC released)
        │
        └── 48h EXPIRY (CRON)  ──► offerExpiry job releases RC, notifies buyer
```

---

## Schema (`src/db/schema/offers.ts`)

```ts
interface OfferDocument {
  productId: string;
  buyerUid: string;
  sellerId: string;
  offerAmount: number; // buyer's proposed price in ₹
  counterAmount?: number; // seller's counter in ₹
  lockedPrice: number; // price locked at checkout time
  lockedRC: number; // engaged RC coins
  status: OfferStatus; // pending | accepted | declined | countered | expired | withdrawn | paid
  expiresAt: Date; // 48h from creation
  createdAt: Date;
  updatedAt: Date;
}
```

**Constants:** `OFFERS_COLLECTION = "offers"`, `OfferStatus` enum

---

## Server Actions (`src/actions/offer.actions.ts`)

| Action                              | Auth   | Description                                                   |
| ----------------------------------- | ------ | ------------------------------------------------------------- |
| `makeOfferAction(input)`            | buyer  | Validates product status, engages RC, creates `OfferDocument` |
| `respondToOfferAction(input)`       | seller | Accept / decline / counter. Releases RC on decline            |
| `acceptCounterOfferAction(offerId)` | buyer  | Adjusts `lockedRC` to counter price                           |
| `withdrawOfferAction(offerId)`      | buyer  | Releases locked RC, marks withdrawn                           |
| `checkoutOfferAction(offerId)`      | buyer  | Marks paid, deducts RC, creates order                         |
| `listBuyerOffersAction(params)`     | buyer  | Sieve-enabled paginated read                                  |
| `listSellerOffersAction(params)`    | seller | Sieve-enabled paginated read                                  |

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
const { acceptCounter } = useAcceptCounter();
const { withdraw } = useWithdrawOffer();
```

---

## Feature Components

### `SellerOffersView`

DataTable showing incoming offers. Columns: product, buyer, offer amount, status, expiry. Row action: open counter modal (`min: offer–20%, max: offer+5%`), accept, decline.

### `UserOffersView`

DataTable showing buyer's sent offers. Status badge per row. Actions: accept counter, checkout, withdraw.

### `MakeOfferForm`

Embedded on `ProductDetailView`. Requires auth. Input: offer amount (₹). Displays required RC engagement upfront. Calls `makeOfferAction`.

---

## Functions

### `offerExpiry.ts` (CRON daily 00:15 UTC)

Queries all `pending` and `countered` offers where `expiresAt <= now`. For each:

1. Releases buyer's `engagedRC` (writes RC ledger, updates `user.rcBalance`)
2. Marks offer `expired`
3. Sends buyer notification

Uses `offerRepository.findExpiredActive(now)` and `expireMany(ids)` (499-doc Firestore batches).
