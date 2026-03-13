# Reviews Feature

**Feature path:** `src/features/reviews/`  
**Repository:** `reviewRepository`  
**Service:** `reviewService`  
**Actions:** `createReviewAction`, `updateReviewAction`, `deleteReviewAction`, `adminUpdateReviewAction`, `adminDeleteReviewAction`, `voteReviewHelpfulAction`

---

## Overview

Product reviews allow verified buyers to rate and describe their experience. Reviews go through a moderation queue before being publicly visible.

---

## Review Status Lifecycle

```
pending → approved → (visible)
       → rejected  → (hidden)
```

---

## Public Pages

### `ReviewsListView` (`/reviews`)

All public approved reviews across the platform:

- `ReviewFilters` — filter by rating, product, date
- Paginated `ReviewCard` grid
- Data: `useReviews(params)` → `reviewService.list(params)`
- **Type:** `ReviewsListResult`

---

## Product-Level Reviews

### `ProductReviews` (in `features/products`)

Reviews for a specific product, embedded in the product detail tabs:

- Summary: average rating + star distribution bars
- Paginated list of `ReviewCard` components
- "Write a Review" button — opens a modal form
- Helpful vote buttons via `voteReviewHelpfulAction`

**Data:** `useProductReviews(productId, page, pageSize)` → `GET /api/products/[id]/reviews`

---

## ReviewCard — `src/components/ReviewCard.tsx`

Shared card component displaying:

- Reviewer name + avatar (`MediaAvatar`)
- Star rating (`RatingDisplay`)
- Review date (formatted via `formatRelativeTime`)
- Review body text
- Helpful count + vote buttons
- Verified purchase badge (if order exists)
- Status badge for admin context

---

## Writing a Review

**Form submission flow:**

1. User clicks "Write a Review" on product page
2. Modal opens with:
   - Star rating selector
   - Title input
   - Body textarea
3. Submit → `createReviewAction({ productId, rating, title, body })`
4. Review saved with `status: 'pending'`
5. Pending review visible to the author + admin only

**Requirement:** User must have at least one delivered order containing the product.

---

## Editing / Deleting Own Reviews

- `updateReviewAction` — edit within 30 days of posting; status resets to `pending`
- `deleteReviewAction` — soft-delete own review

---

## Helpful Votes

`voteReviewHelpfulAction({ reviewId, vote: 'helpful' | 'unhelpful' })`:

- One vote per user per review
- Increments/decrements `helpfulCount` on the review document
- Used to sort reviews by most helpful

---

## Admin Moderation

### `AdminReviewsView` (`/admin/reviews`)

- DataTable showing all reviews across the platform
- Filter by status, rating, product, date via `ReviewFilters`
- `ReviewDetailView` — full review with product info and reviewer profile
- Status update via `adminUpdateReviewAction({ id, status })`
- Delete via `adminDeleteReviewAction({ id })`

**Columns:** `getReviewTableColumns`, `ReviewRowActions`

---

## Seller Reviews

Sellers can see reviews for their products in the store storefront (`/stores/[storeSlug]/reviews`):

- `StoreReviewsView` — aggregated store-level reviews
- Data: `useStoreReviews(storeSlug)` → `GET /api/stores/[storeSlug]/reviews`

Public seller profile also shows reviews via `buildSellerReviews(...)` (server utility).

---

## Hooks

| Hook                                       | Description                            |
| ------------------------------------------ | -------------------------------------- |
| `useReviews(params)`                       | All reviews list with Sieve pagination |
| `useProductReviews(productId, page, size)` | Product-specific reviews               |
| `useCreateReview`                          | Submit review mutation                 |
| `useAdminReviews(sieveParams)`             | Admin paginated review list            |

---

## API Routes

| Method   | Route                             | Description                             |
| -------- | --------------------------------- | --------------------------------------- |
| `GET`    | `/api/reviews`                    | All approved reviews                    |
| `GET`    | `/api/products/[id]/reviews`      | Product reviews                         |
| `POST`   | `/api/reviews`                    | Create review                           |
| `PATCH`  | `/api/reviews/[id]`               | Update own review                       |
| `DELETE` | `/api/reviews/[id]`               | Delete review                           |
| `POST`   | `/api/reviews/[id]/vote`          | Vote helpful/unhelpful                  |
| `GET`    | `/api/profile/[userId]/reviews`   | User's written reviews (public profile) |
| `GET`    | `/api/stores/[storeSlug]/reviews` | Store reviews                           |
| `GET`    | `/api/admin/reviews`              | Admin review list                       |
| `PATCH`  | `/api/admin/reviews/[id]`         | Admin update status                     |
