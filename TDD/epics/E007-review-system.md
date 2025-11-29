# Epic E007: Review System

## Overview

Product and shop reviews with ratings, media support, verified purchase badges, and seller responses.

## Scope

- Product reviews
- Shop reviews
- Review moderation
- Seller responses
- Helpful votes
- Review media

## User Roles Involved

- **Admin**: Full review moderation
- **Seller**: Reply to reviews, view shop reviews
- **User**: Create, edit, delete own reviews
- **Guest**: View approved reviews

---

## Features

### F007.1: Create Review

**US007.1.1**: Write Product Review

```
As a user who purchased a product
I want to write a review
So that I can share my experience

Acceptance Criteria:
- Given I have a delivered order for this product
- When I submit a review with rating and comment
- Then review is created with "verified purchase" badge
- And review goes to moderation queue
```

### F007.2: Review Media

**US007.2.1**: Add Images to Review
**US007.2.2**: Add Video to Review

### F007.3: Review Display

**US007.3.1**: View Product Reviews
**US007.3.2**: View Review Summary (rating distribution)
**US007.3.3**: Sort/Filter Reviews

### F007.4: Review Moderation

**US007.4.1**: Approve/Reject Review (Admin)
**US007.4.2**: Flag Inappropriate Review

### F007.5: Seller Response

**US007.5.1**: Reply to Review

```
As a seller
I want to reply to reviews
So that I can address customer feedback
```

### F007.6: Helpful Votes

**US007.6.1**: Mark Review as Helpful

---

## API Endpoints

| Endpoint                   | Method | Auth       | Description     |
| -------------------------- | ------ | ---------- | --------------- |
| `/api/reviews`             | GET    | Public     | List reviews    |
| `/api/reviews`             | POST   | User       | Create review   |
| `/api/reviews/:id`         | GET    | Public     | Get review      |
| `/api/reviews/:id`         | PATCH  | User/Admin | Update review   |
| `/api/reviews/:id`         | DELETE | User/Admin | Delete review   |
| `/api/reviews/:id/helpful` | POST   | User       | Vote helpful    |
| `/api/reviews/summary`     | GET    | Public     | Rating summary  |
| `/api/reviews/bulk`        | POST   | Admin      | Bulk operations |

---

## Data Models

```typescript
interface ReviewBE {
  id: string;
  productId: string | null;
  shopId: string | null;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1-5
  title: string | null;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  helpful: number;
  notHelpful: number;
  replyText: string | null;
  replyAt: Timestamp | null;
  status: "pending" | "approved" | "rejected";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Related Epics

- E002: Product Catalog (product reviews)
- E006: Shop Management (shop reviews)
- E005: Order Management (verified purchase)

---

## Test Documentation

- **API Specs**: `/TDD/resources/reviews/API-SPECS.md`
- **Test Cases**: `/TDD/resources/reviews/TEST-CASES.md`

### Test Coverage

- Unit tests for rating calculations
- Unit tests for review validation
- Integration tests for CRUD operations
- E2E tests for verified purchase review flow
- RBAC tests for moderation and seller response

---

## Pending Routes

| Route             | Priority  | Status     | Notes                                                      |
| ----------------- | --------- | ---------- | ---------------------------------------------------------- |
| `/user/reviews`   | 🟢 LOW    | ⬜ PENDING | User's own reviews list. Alternative: `/reviews` (public). |
| `/seller/reviews` | 🟢 LOW    | ⬜ PENDING | Shop reviews for seller. Alternative: `/reviews` (public). |
| `/admin/reviews`  | 🟡 MEDIUM | ⬜ PENDING | Review moderation page. Part of admin panel.               |

**Navigation Change**: Removed from USER_MENU_ITEMS and SELLER_MENU_ITEMS in `navigation.ts`.

**See**: `TDD/PENDING-ROUTES.md` for full details
