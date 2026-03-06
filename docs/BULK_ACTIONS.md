# Bulk Actions — Comprehensive Specification

> **Status:** Planning document. Describes every bulk action endpoint — both existing and to-be-built — across all tiers.  
> **Rule compliance:** Every implementation must follow Rules 11 (Firebase backend-only), 12 (repository pattern), 13 (API route pattern), 14 (error classes), 16 (RBAC), 17 (collection constants), 19 (API endpoint constants).

---

## Table of Contents

1. [Conventions & Pattern](#1-conventions--pattern)
2. [Existing Bulk Implementations](#2-existing-bulk-implementations)
3. [Admin Bulk Actions](#3-admin-bulk-actions)
4. [Seller Bulk Actions](#4-seller-bulk-actions)
5. [User Bulk Actions](#5-user-bulk-actions)
6. [RBAC Matrix](#6-rbac-matrix)
7. [Repository Quick Reference](#7-repository-quick-reference)
8. [Response Shape Reference](#8-response-shape-reference)
9. [Implementation Template](#9-implementation-template)

---

## 1. Conventions & Pattern

### Route naming

| Context | Pattern                          | Example                    |
| ------- | -------------------------------- | -------------------------- |
| Admin   | `POST /api/admin/{domain}/bulk`  | `/api/admin/products/bulk` |
| Seller  | `POST /api/seller/{domain}/bulk` | `/api/seller/orders/bulk`  |
| User    | `POST /api/user/{domain}/bulk`   | `/api/user/orders/bulk`    |
| Shared  | `POST /api/{domain}/bulk`        | `/api/notifications/bulk`  |

### Request body

```ts
// Every bulk action body follows this discriminated union
{
  action: string,          // discriminant — routes to the correct handler
  ids: string[],           // 1–100 document IDs to act on (validated)
  ...actionSpecificParams  // per-action optional fields (reason, role, status…)
}
```

### ID limits

- Minimum: 1 id
- Maximum: 100 ids per request (hard limit enforced by Zod `.min(1).max(100)`)
- Operations over 100 records must be split into multiple requests

### Auth pattern

All bulk routes MUST:

1. Verify `__session` cookie via `verifySessionCookie()`
2. Assert the required role via `isAdmin()` / `isSeller()` / or user ownership check
3. Throw `AuthenticationError` / `AuthorizationError` before touching any data

### Validation

Use Zod `discriminatedUnion` on `action` (see §9 template). Each action variant is its own schema — shared fields (`ids`) go into a base schema that each variant extends.

### Response shape

See §8 for the canonical `BulkActionResult` shape. Every bulk endpoint returns the same envelope.

### Partial success

**Bulk actions MUST NOT fail the entire request if one record is ineligible or throws.** Per-item results are tracked in `succeeded[]`, `skipped[]`, and `failed[]` arrays. The HTTP status is always `200` unless auth or validation fails.

---

## 2. Existing Bulk Implementations

### 2.1 `POST /api/seller/orders/bulk`

**File:** `src/app/api/seller/orders/bulk/route.ts`  
**Auth:** Seller session  
**Registered endpoint constant:** `API_ENDPOINTS.SELLER.ORDERS_BULK`

#### Action: `request_payout`

```ts
{
  action: 'request_payout',
  ids: string[]                       // order IDs — empty array allowed (selects ALL eligible)
}
```

**Logic:**

1. Verify seller session
2. Load all seller orders (`orderRepository.listForSeller`)
3. Filter eligible: `status == 'delivered'`, `shippingMethod == 'custom'`, `payoutStatus` not `'requested'` or `'paid'`
4. If `ids` is non-empty, further restrict to requested IDs
5. Compute `grossAmount`, `platformFee` (5 % = `PLATFORM_COMMISSION_RATE`), `netAmount`
6. Create one `PayoutDocument` via `payoutRepository.create()`
7. Patch all eligible orders with `payoutStatus: 'requested'`, `payoutId`

**Response:**

```ts
{
  payoutId: string,
  requested: string[],     // order IDs included in payout
  skipped: string[],       // ineligible order IDs
  eligibleCount: number,
  skippedCount: number,
  netAmount: number,
  grossAmount: number,
  platformFee: number
}
```

---

### 2.2 `PATCH /api/notifications/read-all`

**File:** `src/app/api/notifications/read-all/route.ts`  
**Auth:** User session (own notifications only)  
**Registered endpoint constant:** `API_ENDPOINTS.NOTIFICATIONS.READ_ALL`

**Logic:** Calls `notificationRepository.markAllAsRead(userId)` — marks every unread notification for the current user as read. No request body required.

> **Note:** This is an implicit bulk action. It follows a narrower pattern (no `ids`, no `action` discriminant). It is documented here for completeness; new bulk endpoints should follow the §1 pattern.

---

## 3. Admin Bulk Actions

All admin bulk routes require:

- Valid session cookie
- `isAdmin(user) === true` (role hierarchy ≥ 3)
- Throw `AuthorizationError(ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED)` if not satisfied

---

### 3.1 `POST /api/admin/users/bulk`

**Endpoint constant to add:** `API_ENDPOINTS.ADMIN.USERS_BULK`  
**RBAC:** admin only

| action            | Extra params                                                    | Repository calls                                                | Notes                                                               |
| ----------------- | --------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------- |
| `disable`         | —                                                               | `userRepository.disable(uid)` per ID                            | Skip already-disabled users                                         |
| `enable`          | —                                                               | `userRepository.enable(uid)` per ID                             | Skip already-enabled users                                          |
| `update-role`     | `role: UserRole` (not `'admin'` — cannot bulk-promote to admin) | `userRepository.updateRole(uid, role)` per ID                   | Disallow same-role assignments; disallow `'admin'` target role      |
| `revoke-sessions` | —                                                               | `sessionRepository.revokeAllUserSessions(uid, adminUid)` per ID | —                                                                   |
| `delete`          | —                                                               | `userRepository.delete(uid)` per ID                             | Hard delete — irreversible; require `{ confirm: true }` extra param |

**Zod schema sketch:**

```ts
const disableSchema = z.object({
  action: z.literal("disable"),
  ids: z.array(z.string()).min(1).max(100),
});
const enableSchema = z.object({
  action: z.literal("enable"),
  ids: z.array(z.string()).min(1).max(100),
});
const updateRoleSchema = z.object({
  action: z.literal("update-role"),
  ids: z.array(z.string()).min(1).max(100),
  role: z.enum(["user", "seller", "moderator"]),
});
const revokeSessionsSchema = z.object({
  action: z.literal("revoke-sessions"),
  ids: z.array(z.string()).min(1).max(100),
});
const deleteSchema = z.object({
  action: z.literal("delete"),
  ids: z.array(z.string()).min(1).max(100),
  confirm: z.literal(true),
});

const bulkActionSchema = z.discriminatedUnion("action", [
  disableSchema,
  enableSchema,
  updateRoleSchema,
  revokeSessionsSchema,
  deleteSchema,
]);
```

---

### 3.2 `POST /api/admin/products/bulk`

**Endpoint constant to add:** `API_ENDPOINTS.ADMIN.PRODUCTS_BULK`  
**RBAC:** admin only

| action            | Extra params                               | Repository calls                                                                          | Notes                                                        |
| ----------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `publish`         | —                                          | `productRepository.updateProduct(id, { status: PRODUCT_FIELDS.STATUS_VALUES.PUBLISHED })` | Skip already published                                       |
| `unpublish`       | —                                          | `productRepository.updateProduct(id, { status: 'draft' })`                                | —                                                            |
| `feature`         | —                                          | `productRepository.updateProduct(id, { featured: true })`                                 | —                                                            |
| `unfeature`       | —                                          | `productRepository.updateProduct(id, { featured: false })`                                | —                                                            |
| `update-category` | `category: string`, `subcategory?: string` | `productRepository.updateProduct(id, { category, subcategory })`                          | Validate category exists via `categoriesRepository.findById` |
| `delete`          | `confirm: true`                            | `productRepository.delete(id)`                                                            | Hard delete; also should remove from Algolia index           |

---

### 3.3 `POST /api/admin/reviews/bulk`

**Endpoint constant to add:** `API_ENDPOINTS.ADMIN.REVIEWS_BULK`  
**RBAC:** admin or moderator (`hasAnyRole(user, ['admin','moderator'])`)

| action      | Extra params                                        | Repository calls                                          | Notes                 |
| ----------- | --------------------------------------------------- | --------------------------------------------------------- | --------------------- |
| `approve`   | `moderatorNote?: string`                            | `reviewRepository.approve(id, moderatorUid, note)`        | Skip already-approved |
| `reject`    | `rejectionReason: string`, `moderatorNote?: string` | `reviewRepository.reject(id, moderatorUid, reason, note)` | Skip already-rejected |
| `feature`   | —                                                   | `reviewRepository.update(id, { featured: true })`         | —                     |
| `unfeature` | —                                                   | `reviewRepository.update(id, { featured: false })`        | —                     |
| `delete`    | `confirm: true`                                     | `reviewRepository.delete(id)`                             | —                     |

---

### 3.4 `POST /api/admin/orders/bulk`

**Endpoint constant to add:** `API_ENDPOINTS.ADMIN.ORDERS_BULK`  
**RBAC:** admin only

| action          | Extra params                                     | Repository calls                                                               | Notes                                                    |
| --------------- | ------------------------------------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `update-status` | `status: OrderStatus`                            | `orderRepository.updateStatus(id, status)`                                     | Validate status transition is allowed                    |
| `mark-refunded` | `refundAmount?: number`, `refundReason?: string` | `orderRepository.updateStatus(id, 'refunded', { refundAmount, refundReason })` | Only valid for `delivered`/`cancelled` orders            |
| `cancel`        | `reason: string`                                 | `orderRepository.cancelOrder(id, reason)`                                      | Only valid for `pending`/`confirmed`/`processing` orders |

---

### 3.5 `POST /api/admin/blog/bulk`

**Endpoint constant to add:** `API_ENDPOINTS.ADMIN.BLOG_BULK`  
**RBAC:** admin only

| action      | Extra params    | Repository calls                                                              | Notes                  |
| ----------- | --------------- | ----------------------------------------------------------------------------- | ---------------------- |
| `publish`   | —               | `blogRepository.update(id, { status: 'published', publishedAt: new Date() })` | Skip already published |
| `unpublish` | —               | `blogRepository.update(id, { status: 'draft' })`                              | —                      |
| `archive`   | —               | `blogRepository.update(id, { status: 'archived' })`                           | —                      |
| `feature`   | —               | `blogRepository.update(id, { isFeatured: true })`                             | —                      |
| `unfeature` | —               | `blogRepository.update(id, { isFeatured: false })`                            | —                      |
| `delete`    | `confirm: true` | `blogRepository.delete(id)`                                                   | —                      |

---

### 3.6 `POST /api/admin/faqs/bulk`

**Endpoint constant to add:** `API_ENDPOINTS.ADMIN.FAQS_BULK`  
**RBAC:** admin only

| action       | Extra params    | Repository calls                                 | Notes               |
| ------------ | --------------- | ------------------------------------------------ | ------------------- |
| `activate`   | —               | `faqsRepository.update(id, { isActive: true })`  | Skip already active |
| `deactivate` | —               | `faqsRepository.update(id, { isActive: false })` | —                   |
| `delete`     | `confirm: true` | `faqsRepository.delete(id)`                      | —                   |

---

### 3.7 `POST /api/admin/coupons/bulk`

**Endpoint constant to add:** `API_ENDPOINTS.ADMIN.COUPONS_BULK`  
**Requires new route file:** `src/app/api/admin/coupons/bulk/route.ts`  
**RBAC:** admin only

| action       | Extra params    | Repository calls                                    | Notes                          |
| ------------ | --------------- | --------------------------------------------------- | ------------------------------ |
| `activate`   | —               | `couponsRepository.update(id, { isActive: true })`  | Skip already active            |
| `deactivate` | —               | `couponsRepository.update(id, { isActive: false })` | —                              |
| `delete`     | `confirm: true` | `couponsRepository.delete(id)`                      | Only if not used in any orders |

---

### 3.8 `POST /api/admin/carousel/bulk`

**Endpoint constant to add:** `API_ENDPOINTS.ADMIN.CAROUSEL_BULK`  
**Requires new route file:** `src/app/api/carousel/bulk/route.ts`  
**RBAC:** admin only

> Note: carousel reorder already has its own endpoint (`POST /api/carousel/reorder`). The bulk endpoint covers activate/deactivate/delete.

| action       | Extra params    | Repository calls                                   | Notes                                                     |
| ------------ | --------------- | -------------------------------------------------- | --------------------------------------------------------- |
| `activate`   | —               | `carouselRepository.update(id, { active: true })`  | Enforce `MAX_ACTIVE_SLIDES` limit — skip if limit reached |
| `deactivate` | —               | `carouselRepository.update(id, { active: false })` | —                                                         |
| `delete`     | `confirm: true` | `carouselRepository.delete(id)`                    | Auto-deactivate first if active                           |

---

### 3.9 `POST /api/admin/newsletter/bulk`

**Endpoint constant to add:** `API_ENDPOINTS.ADMIN.NEWSLETTER_BULK`  
**RBAC:** admin only

| action        | Extra params    | Repository calls                       | Notes                                    |
| ------------- | --------------- | -------------------------------------- | ---------------------------------------- |
| `delete`      | `confirm: true` | `newsletterRepository.deleteById(id)`  | Hard delete subscriber records           |
| `unsubscribe` | —               | `newsletterRepository.unsubscribe(id)` | Marks as unsubscribed but retains record |
| `resubscribe` | —               | `newsletterRepository.resubscribe(id)` | Re-opt-in                                |

---

### 3.10 `POST /api/admin/payouts/bulk`

**Endpoint constant to add:** `API_ENDPOINTS.ADMIN.PAYOUTS_BULK`  
**RBAC:** admin only

| action      | Extra params                                       | Repository calls                                                                        | Notes                             |
| ----------- | -------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------- |
| `approve`   | —                                                  | `payoutRepository.updateStatus(id, 'approved')`                                         | Only valid for `pending` payouts  |
| `reject`    | `reason: string`                                   | `payoutRepository.updateStatus(id, 'rejected', { rejectionReason: reason })`            | Only valid for `pending` payouts  |
| `mark-paid` | `transactionId?: string`, `paymentMethod?: string` | `payoutRepository.updateStatus(id, 'paid', { transactionId, processedAt: new Date() })` | Only valid for `approved` payouts |

---

### 3.11 `POST /api/admin/events/bulk`

**Endpoint constant to add:** `API_ENDPOINTS.ADMIN.EVENTS_BULK`  
**Requires new route file:** `src/app/api/admin/events/bulk/route.ts`  
**RBAC:** admin only

| action     | Extra params      | Repository calls                                | Notes                                                           |
| ---------- | ----------------- | ----------------------------------------------- | --------------------------------------------------------------- |
| `activate` | —                 | `eventRepository.changeStatus(id, 'active')`    | Skip already active                                             |
| `cancel`   | `reason?: string` | `eventRepository.changeStatus(id, 'cancelled')` | —                                                               |
| `delete`   | `confirm: true`   | `eventRepository.delete(id)`                    | Hard delete; also delete all entries via `eventEntryRepository` |

---

### 3.12 `POST /api/admin/sessions/bulk`

**Endpoint constant:** `API_ENDPOINTS.ADMIN.SESSIONS_BULK` (existing admin sessions routes are `admin/sessions` and `admin/sessions/[id]`)  
**RBAC:** admin only

| action   | Extra params | Repository calls                                | Notes                         |
| -------- | ------------ | ----------------------------------------------- | ----------------------------- |
| `revoke` | —            | `sessionRepository.revokeSession(id, adminUid)` | Skip already-revoked sessions |

> Note: Per-user session revocation (`admin/sessions/revoke-user`) already exists. This bulk action targets individual session IDs, not user-scoped.

---

## 4. Seller Bulk Actions

All seller bulk routes require:

- Valid session cookie
- `isSeller(user) || isAdmin(user)` (role hierarchy ≥ 1)
- Ownership verification: confirm that the target records belong to the seller's `uid`

---

### 4.1 `POST /api/seller/orders/bulk` (EXISTING + EXTEND)

**Current action:** `request_payout` — see §2.1.  
**New actions to add:**

| action         | Extra params                                                        | Repository calls                                                                      | Notes                                                                                                 |
| -------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `mark-shipped` | `trackingNumber?: string`, `carrier?: string`, `shippedAt?: string` | `orderRepository.updateStatus(id, 'shipped', { trackingNumber, carrier, shippedAt })` | Only `custom` shipping orders in `confirmed`/`processing` status; validate seller ownership per order |
| `cancel`       | `reason: string`                                                    | `orderRepository.cancelOrder(id, reason)`                                             | Only `pending`/`confirmed` orders; validate seller ownership                                          |

**Important:** The existing `request_payout` uses `request_payout` (snake_case) — new actions should use kebab-case (`mark-shipped`, `cancel`) to match the admin pattern. Use `z.union` on the action literal to support both styles if backward compat is needed.

---

### 4.2 `POST /api/seller/products/bulk`

**Endpoint constant to add:** `API_ENDPOINTS.SELLER.PRODUCTS_BULK`  
**Requires new route file:** `src/app/api/seller/products/bulk/route.ts`  
**RBAC:** seller or admin  
**Ownership check:** `productRepository.findBySeller(sellerUid)` and filter to only process IDs that belong to the seller

| action         | Extra params            | Repository calls                                               | Notes                                        |
| -------------- | ----------------------- | -------------------------------------------------------------- | -------------------------------------------- |
| `publish`      | —                       | `productRepository.updateProduct(id, { status: 'published' })` | Skip already published                       |
| `unpublish`    | —                       | `productRepository.updateProduct(id, { status: 'draft' })`     | —                                            |
| `delete`       | `confirm: true`         | `productRepository.delete(id)`                                 | Hard delete; seller must own each product    |
| `update-stock` | `stockQuantity: number` | `productRepository.updateAvailableQuantity(id, stockQuantity)` | Apply same quantity to all selected products |
| `feature`      | —                       | `productRepository.updateProduct(id, { featured: true })`      | —                                            |
| `unfeature`    | —                       | `productRepository.updateProduct(id, { featured: false })`     | —                                            |

---

## 5. User Bulk Actions

All user bulk routes require:

- Valid session cookie
- Scoped to authenticated user's own data only (no cross-user access)

---

### 5.1 `POST /api/notifications/bulk`

**Endpoint constant to add:** `API_ENDPOINTS.NOTIFICATIONS.BULK`  
**Requires new route file:** `src/app/api/notifications/bulk/route.ts`  
**RBAC:** authenticated user (own notifications only)

| action      | Extra params    | Repository calls                               | Notes                                            |
| ----------- | --------------- | ---------------------------------------------- | ------------------------------------------------ |
| `mark-read` | —               | `notificationRepository.markAsRead(id)` per ID | Only marks notifications that belong to `userId` |
| `delete`    | `confirm: true` | `notificationRepository.delete(id)` per ID     | Only deletes notifications belonging to `userId` |

> Note: `PATCH /api/notifications/read-all` already covers mark-all-read. This endpoint is for selective bulk operations on specific IDs.

---

### 5.2 `POST /api/user/orders/bulk`

**Endpoint constant to add:** `API_ENDPOINTS.USER.ORDERS_BULK`  
**Requires new route file:** `src/app/api/user/orders/bulk/route.ts`  
**RBAC:** authenticated user (own orders only)

| action   | Extra params     | Repository calls                          | Notes                                                                                     |
| -------- | ---------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| `cancel` | `reason: string` | `orderRepository.cancelOrder(id, reason)` | Only `pending` orders; validate `userId` ownership per order; skip non-cancellable orders |

---

### 5.3 `POST /api/user/wishlist/bulk`

**Endpoint constant to add:** `API_ENDPOINTS.USER.WISHLIST_BULK`  
**Requires new route file:** `src/app/api/user/wishlist/bulk/route.ts`  
**RBAC:** authenticated user (own wishlist only)

| action   | Extra params    | Repository calls                                       | Notes                                  |
| -------- | --------------- | ------------------------------------------------------ | -------------------------------------- |
| `remove` | —               | `wishlistRepository.removeItem(uid, productId)` per ID | IDs are `productId` values             |
| `clear`  | `confirm: true` | `wishlistRepository.clearWishlist(uid)`                | Ignores `ids` — clears entire wishlist |

---

## 6. RBAC Matrix

| Endpoint                          | user | seller | moderator | admin |
| --------------------------------- | :--: | :----: | :-------: | :---: |
| `POST /api/admin/users/bulk`      |  ✗   |   ✗    |     ✗     |   ✓   |
| `POST /api/admin/products/bulk`   |  ✗   |   ✗    |     ✗     |   ✓   |
| `POST /api/admin/reviews/bulk`    |  ✗   |   ✗    |     ✓     |   ✓   |
| `POST /api/admin/orders/bulk`     |  ✗   |   ✗    |     ✗     |   ✓   |
| `POST /api/admin/blog/bulk`       |  ✗   |   ✗    |     ✗     |   ✓   |
| `POST /api/admin/faqs/bulk`       |  ✗   |   ✗    |     ✗     |   ✓   |
| `POST /api/admin/coupons/bulk`    |  ✗   |   ✗    |     ✗     |   ✓   |
| `POST /api/admin/carousel/bulk`   |  ✗   |   ✗    |     ✗     |   ✓   |
| `POST /api/admin/newsletter/bulk` |  ✗   |   ✗    |     ✗     |   ✓   |
| `POST /api/admin/payouts/bulk`    |  ✗   |   ✗    |     ✗     |   ✓   |
| `POST /api/admin/events/bulk`     |  ✗   |   ✗    |     ✗     |   ✓   |
| `POST /api/admin/sessions/bulk`   |  ✗   |   ✗    |     ✗     |   ✓   |
| `POST /api/seller/orders/bulk`    |  ✗   |   ✓    |     ✗     |   ✓   |
| `POST /api/seller/products/bulk`  |  ✗   |   ✓    |     ✗     |   ✓   |
| `POST /api/notifications/bulk`    |  ✓   |   ✓    |     ✓     |   ✓   |
| `POST /api/user/orders/bulk`      |  ✓   |   ✓    |     ✓     |   ✓   |
| `POST /api/user/wishlist/bulk`    |  ✓   |   ✓    |     ✓     |   ✓   |

**Helpers to use:**

```ts
import { isAdmin, isModerator, isSeller } from "@/constants";
import { ROLE_HIERARCHY } from "@/constants";
// For combined checks:
const canActAsSeller = ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY["seller"];
const canActAsAdmin = ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY["admin"];
const canModerate = ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY["moderator"];
```

---

## 7. Repository Quick Reference

| Domain           | Repository                   | Key bulk-relevant methods                                                                                   |
| ---------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Users            | `userRepository`             | `disable(uid)`, `enable(uid)`, `updateRole(uid, role)`, `delete(id)`                                        |
| Sessions         | `sessionRepository`          | `revokeSession(id, revokedBy)`, `revokeAllUserSessions(uid, revokedBy)`                                     |
| Products         | `productRepository`          | `updateProduct(id, data)`, `updateAvailableQuantity(id, qty)`, `delete(id)`                                 |
| Orders           | `orderRepository`            | `updateStatus(id, status, extra?)`, `cancelOrder(id, reason, refund?)`, `updatePaymentStatus(id, status)`   |
| Reviews          | `reviewRepository`           | `approve(id, modUid, note?)`, `reject(id, modUid, reason, note?)`, `update(id, data)`, `delete(id)`         |
| Blog             | `blogRepository`             | `update(id, data)`, `delete(id)`                                                                            |
| FAQs             | `faqsRepository`             | `update(id, data)`, `delete(id)`                                                                            |
| Coupons          | `couponsRepository`          | `update(id, data)`, `delete(id)`                                                                            |
| Carousel         | `carouselRepository`         | `update(id, data)`, `delete(id)`, `getActiveSlides()` — use count to enforce `MAX_ACTIVE_SLIDES`            |
| Newsletter       | `newsletterRepository`       | `deleteById(id)`, `unsubscribe(id)`, `resubscribe(id)`                                                      |
| Payouts          | `payoutRepository`           | `updateStatus(id, status, extra?)`                                                                          |
| Events           | `eventRepository`            | `changeStatus(id, status)`, `delete(id)`                                                                    |
| EventEntries     | `eventEntryRepository`       | `delete(id)`                                                                                                |
| Notifications    | `notificationRepository`     | `markAsRead(id)`, `markAllAsRead(userId)`, `delete(id)` — note: `delete` is inherited from `BaseRepository` |
| Wishlist         | `wishlistRepository`         | `removeItem(uid, productId)`, `clearWishlist(uid)`                                                          |
| HomepageSections | `homepageSectionsRepository` | `update(id, data)`                                                                                          |

### Atomic multi-record writes — `unitOfWork`

When bulk actions need to write to **multiple collections atomically** (e.g. update order + create notification + update product stock), use `unitOfWork`:

```ts
import { unitOfWork } from "@/repositories";

// Transaction (read-then-write)
await unitOfWork.runTransaction(async (tx) => {
  const order = await unitOfWork.orders.findByIdOrFailInTx(tx, orderId);
  unitOfWork.orders.updateInTx(tx, orderId, { status: "cancelled" });
  unitOfWork.products.updateInTx(tx, order.productId, {
    stockQuantity: FieldValue.increment(1),
  });
});

// Batch (write-only, up to 500 ops)
await unitOfWork.runBatch((batch) => {
  for (const id of ids) {
    unitOfWork.reviews.updateInBatch(batch, id, {
      status: "approved",
      moderatorId,
    });
  }
});
```

> **Batch limit:** 500 ops per batch. If `ids.length > 250` (each record may count as 2 ops: read + write), split into multiple batches.

---

## 8. Response Shape Reference

### Standard `BulkActionResult<T>` envelope

```ts
interface BulkActionResult<T = Record<string, unknown>> {
  action: string;
  summary: {
    total: number; // ids.length
    succeeded: number;
    skipped: number;
    failed: number;
  };
  succeeded: string[]; // IDs successfully processed
  skipped: string[]; // IDs skipped (already in target state, not owned, etc.)
  failed: Array<{
    id: string;
    reason: string; // human-readable skip/fail reason — never expose stack traces
  }>;
  data?: T; // action-specific payload (e.g. { payoutId } for request_payout)
}
```

**HTTP status codes:**

- `200` — partial or full success (check `summary.failed` for per-item failures)
- `400` — Zod validation failed (malformed body, invalid action, ids out of range)
- `401` — no session / expired session
- `403` — insufficient role
- `500` — unexpected server error (via `handleApiError` → `ERROR_MESSAGES.GENERIC.UNEXPECTED`)

---

## 9. Implementation Template

Full route template following Rule 13 (API route pattern) and the existing `seller/orders/bulk` reference:

```ts
// src/app/api/{context}/{domain}/bulk/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { verifySessionCookie } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors/error-handler";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { isAdmin } from "@/constants";
import { someRepository } from "@/repositories";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const BASE_IDS = z.array(z.string().min(1)).min(1).max(100);

const actionASchema = z.object({
  action: z.literal("action-a"),
  ids: BASE_IDS,
});

const actionBSchema = z.object({
  action: z.literal("action-b"),
  ids: BASE_IDS,
  reason: z.string().min(1).max(500),
});

const bulkActionSchema = z.discriminatedUnion("action", [
  actionASchema,
  actionBSchema,
]);

type BulkAction = z.infer<typeof bulkActionSchema>;

// ---------------------------------------------------------------------------
// Action handlers
// ---------------------------------------------------------------------------

async function handleActionA(
  ids: string[],
  actorUid: string,
): Promise<{
  succeeded: string[];
  skipped: string[];
  failed: Array<{ id: string; reason: string }>;
}> {
  const succeeded: string[] = [];
  const skipped: string[] = [];
  const failed: Array<{ id: string; reason: string }> = [];

  for (const id of ids) {
    try {
      const record = await someRepository.findById(id);
      if (!record) {
        skipped.push(id);
        continue;
      }
      // Skip if already in target state
      if (record.someField === "targetValue") {
        skipped.push(id);
        continue;
      }
      await someRepository.update(id, { someField: "targetValue" });
      succeeded.push(id);
    } catch {
      failed.push({ id, reason: ERROR_MESSAGES.GENERIC.UNEXPECTED });
    }
  }

  return { succeeded, skipped, failed };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const sessionCookie = request.cookies.get("__session")?.value;
    if (!sessionCookie)
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    const decodedToken = await verifySessionCookie(sessionCookie);
    if (!decodedToken)
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.SESSION_EXPIRED);

    // 2. Role check
    if (!isAdmin(decodedToken)) {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED);
    }

    // 3. Validate body
    const body = await request.json();
    const parsed = bulkActionSchema.safeParse(body);
    if (!parsed.success) return ApiErrors.validationError(parsed.error.issues);

    const payload = parsed.data;
    let result: ReturnType<typeof handleActionA> extends Promise<infer R>
      ? R
      : never;
    let extraData: Record<string, unknown> = {};

    // 4. Route by action
    switch (payload.action) {
      case "action-a":
        result = await handleActionA(payload.ids, decodedToken.uid);
        break;

      case "action-b": {
        // inline handler for simple actions
        const succeeded: string[] = [];
        const skipped: string[] = [];
        const failed: Array<{ id: string; reason: string }> = [];
        for (const id of payload.ids) {
          try {
            await someRepository.update(id, { reason: payload.reason });
            succeeded.push(id);
          } catch {
            failed.push({ id, reason: ERROR_MESSAGES.GENERIC.UNEXPECTED });
          }
        }
        result = { succeeded, skipped, failed };
        break;
      }
    }

    // 5. Build response
    return successResponse(
      {
        action: payload.action,
        summary: {
          total: payload.ids.length,
          succeeded: result.succeeded.length,
          skipped: result.skipped.length,
          failed: result.failed.length,
        },
        succeeded: result.succeeded,
        skipped: result.skipped,
        failed: result.failed,
        ...extraData,
      },
      SUCCESS_MESSAGES.ADMIN.BULK_ACTION_COMPLETED,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## 9b. Async Bulk Jobs via RTDB (`useBulkEvent`)

For bulk operations on large data sets or when the server needs more than a few seconds, the API route can offload processing asynchronously and return a job handle instead of blocking. The client gets real-time progress and the final result via the `bulk_events` RTDB channel.

### When to use async vs synchronous

|                   | Synchronous (current default) | Async (RTDB-backed)                    |
| ----------------- | ----------------------------- | -------------------------------------- |
| Volume            | ≤ 25 items                    | 26–100 items                           |
| Expected duration | < 3 s                         | > 3 s                                  |
| Client pattern    | `useBulkAction`               | `useBulkEvent` + job-init call         |
| HTTP response     | `BulkActionResult` directly   | `BulkActionJob { jobId, customToken }` |

### RTDB node shape (`/bulk_events/{jobId}`)

```json
{
  "status": "pending",
  "action": "publish",
  "summary": { "total": 80, "succeeded": 42, "skipped": 0, "failed": 0 }
}
```

On completion the server overwrites the node with `status: "success"` and the full `BulkActionResult` fields:

```json
{
  "status": "success",
  "action": "publish",
  "summary": { "total": 80, "succeeded": 78, "skipped": 2, "failed": 0 },
  "succeeded": ["id1", "id2", "..."],
  "skipped": ["id79", "id80"],
  "failed": []
}
```

On error: `{ "status": "failed", "error": "human-readable message" }`.

### Security — `BulkActionJob` custom token

The server issues a Firebase custom token that encodes **only** `{ bulkJobId: jobId }`. The `database.rules.json` rule:

```json
"bulk_events": {
  "$jobId": {
    ".read": "auth != null && auth.token.bulkJobId == $jobId",
    ".write": false
  }
}
```

### Async route skeleton

```ts
// POST /api/admin/products/bulk-async
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession(request); // throws 401/403
    const { ids, action } = parseBody(request); // throws 400

    const jobId = `bulk-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Write pending node + issue custom token — both via Admin SDK
    await getAdminDb()
      .ref(`bulk_events/${jobId}`)
      .set({ status: "pending", action, createdAt: Date.now() });
    const customToken = await getAdminAuth().createCustomToken(session.uid, {
      bulkJobId: jobId,
    });

    // Kick off background work (do NOT await)
    processBulkAsync(jobId, action, ids).catch((err) => {
      getAdminDb()
        .ref(`bulk_events/${jobId}`)
        .update({ status: "failed", error: err.message });
    });

    return successResponse({ jobId, customToken } satisfies BulkActionJob);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Client usage

```tsx
import { useBulkEvent, useBulkSelection, RealtimeEventStatus } from "@/hooks";
import { useMessage } from "@/hooks";
import { useEffect } from "react";

const selection = useBulkSelection({ items, keyExtractor: (p) => p.id });
const bulkEvent = useBulkEvent();
const { showSuccess, showError } = useMessage();

useEffect(() => {
  if (bulkEvent.status === RealtimeEventStatus.SUCCESS && bulkEvent.result) {
    const { summary } = bulkEvent.result;
    showSuccess(`${summary.succeeded} of ${summary.total} items published`);
    if (summary.failed > 0)
      showError(`${summary.failed} items failed — see details`);
    selection.clearSelection();
    refetch();
    bulkEvent.reset();
  }
  if (
    bulkEvent.status === RealtimeEventStatus.FAILED ||
    bulkEvent.status === RealtimeEventStatus.TIMEOUT
  ) {
    showError(bulkEvent.error ?? "Bulk operation failed.");
    bulkEvent.reset();
  }
}, [bulkEvent.status]); // eslint-disable-line react-hooks/exhaustive-deps

const handleBulkPublish = async () => {
  try {
    const { jobId, customToken } = await adminService.bulkProductsAsync({
      action: "publish",
      ids: selection.selectedIds,
    });
    bulkEvent.subscribe(jobId, customToken); // starts RTDB listener
  } catch (err) {
    showError((err as Error).message);
  }
};
```

---

## 10. API Endpoint Constants to Add

The following entries need to be added to `src/constants/api-endpoints.ts`:

```ts
// Under ADMIN:
USERS_BULK:        '/api/admin/users/bulk',
PRODUCTS_BULK:     '/api/admin/products/bulk',
REVIEWS_BULK:      '/api/admin/reviews/bulk',
ORDERS_BULK:       '/api/admin/orders/bulk',
BLOG_BULK:         '/api/admin/blog/bulk',
FAQS_BULK:         '/api/admin/faqs/bulk',
COUPONS_BULK:      '/api/admin/coupons/bulk',
CAROUSEL_BULK:     '/api/carousel/bulk',
NEWSLETTER_BULK:   '/api/admin/newsletter/bulk',
PAYOUTS_BULK:      '/api/admin/payouts/bulk',
EVENTS_BULK:       '/api/admin/events/bulk',
SESSIONS_BULK:     '/api/admin/sessions/bulk',

// Under SELLER:
PRODUCTS_BULK:     '/api/seller/products/bulk',
// ORDERS_BULK already exists as: SELLER.ORDERS_BULK = '/api/seller/orders/bulk'

// Under USER (new group or existing):
ORDERS_BULK:       '/api/user/orders/bulk',
WISHLIST_BULK:     '/api/user/wishlist/bulk',

// Under NOTIFICATIONS:
BULK:              '/api/notifications/bulk',
```

---

## 11. Success/Error Message Constants to Add

Add to `src/constants/messages.ts`:

```ts
// SUCCESS_MESSAGES.ADMIN
BULK_ACTION_COMPLETED: 'Bulk action completed successfully',

// ERROR_MESSAGES (already have GENERIC.UNEXPECTED for per-item failures)
// No new entries needed — per-item failures use GENERIC.UNEXPECTED
// Auth failures use existing AUTH.* entries
```

---

## 12. Existing Route Files Reference

All 132 current API route files (relative to `src/app/api/`):

```
admin/algolia/sync
admin/analytics
admin/bids
admin/bids/[id]
admin/blog
admin/blog/[id]
admin/coupons
admin/coupons/[id]
admin/dashboard
admin/events
admin/events/[id]
admin/events/[id]/entries
admin/events/[id]/entries/[entryId]
admin/events/[id]/stats
admin/events/[id]/status
admin/newsletter
admin/newsletter/[id]
admin/orders
admin/orders/[id]
admin/payouts
admin/payouts/[id]
admin/payouts/weekly
admin/products
admin/products/[id]
admin/reviews
admin/sessions
admin/sessions/[id]
admin/sessions/revoke-user
admin/stores
admin/stores/[uid]
admin/users
admin/users/[uid]
auth/apple/callback
auth/apple/start
auth/event/init
auth/forgot-password
auth/google/callback
auth/google/start
auth/login
auth/logout
auth/register
auth/reset-password
auth/send-verification
auth/session
auth/session/activity
auth/session/validate
auth/verify-email
bids
bids/[id]
blog
blog/[slug]
carousel
carousel/[id]
carousel/reorder
cart
cart/[itemId]
categories
categories/[id]
chat
chat/[chatId]/messages
checkout
contact
coupons/validate
demo/seed
events
events/[id]
events/[id]/enter
events/[id]/leaderboard
faqs
faqs/[id]
faqs/[id]/vote
homepage-sections
homepage-sections/[id]
homepage-sections/reorder
logs/write
media/crop
media/trim
media/upload
newsletter/subscribe
notifications
notifications/[id]
notifications/read-all
notifications/unread-count
payment/create-order
payment/event/init
payment/verify
payment/webhook
products
products/[id]
profile/[userId]
profile/[userId]/reviews
profile/add-phone
profile/delete-account
profile/verify-phone
promotions
realtime/token
reviews
reviews/[id]
reviews/[id]/vote
ripcoins/balance
ripcoins/history
ripcoins/purchase
ripcoins/purchase/verify
search
seller/analytics
seller/orders
seller/orders/[id]/ship
seller/orders/bulk          ← EXISTING
seller/payouts
seller/payout-settings
seller/products
seller/shipping
seller/shipping/verify-pickup
seller/store
site-settings
stores
stores/[storeSlug]
stores/[storeSlug]/auctions
stores/[storeSlug]/products
stores/[storeSlug]/reviews
user/addresses
user/addresses/[id]
user/addresses/[id]/set-default
user/become-seller
user/change-password
user/orders
user/orders/[id]
user/orders/[id]/cancel
user/profile
user/sessions
user/sessions/[id]
user/wishlist
user/wishlist/[productId]
webhooks/shiprocket
```

**New route files to create** (bulk endpoints not yet present):

```
admin/users/bulk
admin/products/bulk
admin/reviews/bulk
admin/orders/bulk
admin/blog/bulk
admin/faqs/bulk
admin/coupons/bulk
carousel/bulk
admin/newsletter/bulk
admin/payouts/bulk
admin/events/bulk
admin/sessions/bulk
seller/products/bulk
notifications/bulk
user/orders/bulk
user/wishlist/bulk
```
