# Day 5: Review Routes - Complete ✅

## Overview

Successfully completed refactoring of review-related API routes to use the MVC controller pattern with full RBAC implementation.

## Routes Created

### 1. `/api/reviews` (GET, POST)

**File:** `src/app/api/reviews/route.ts` (137 lines)

#### GET - List Reviews

- **Access:** Public (approved only) / Authenticated (own reviews) / Admin (all)
- **Query Parameters:**
  - `productId`: Filter by product
  - `userId`: Filter by user (requires auth)
  - `status`: Filter by status (admin only)
  - `sortBy`: Sort by createdAt, rating, or helpful
  - `limit`: Results per page (default: 20)
  - `offset`: Pagination offset (default: 0)
- **Response:** Array of reviews with total count
- **RBAC:**
  - Public: Only approved reviews
  - Authenticated users: Own reviews
  - Admins: All reviews with any status

#### POST - Create Review

- **Access:** Authenticated users only
- **Body:**
  ```json
  {
    "productId": "string (required)",
    "rating": "number 1-5 (required)",
    "title": "string 5-100 chars (required)",
    "comment": "string 20-1000 chars (required)",
    "images": "string[] (optional, max 5)",
    "orderId": "string (optional, for verification)"
  }
  ```
- **Validation:**
  - Rating: 1-5
  - Title: 5-100 characters
  - Comment: 20-1000 characters
  - Images: Maximum 5
  - Purchase verification: User must have purchased product
- **Response:** Created review object (status: pending)

---

### 2. `/api/reviews/[id]` (GET, PUT, DELETE)

**File:** `src/app/api/reviews/[id]/route.ts` (219 lines)

#### GET - View Review

- **Access:** Public (approved only) / Owner / Admin
- **Response:** Review details
- **RBAC:**
  - Public: Only approved reviews
  - Owner: Can view own reviews (any status)
  - Admin: Can view all reviews

#### PUT - Update Review

- **Access:** Owner only, pending reviews only
- **Body:**
  ```json
  {
    "rating": "number 1-5 (optional)",
    "title": "string 5-100 chars (optional)",
    "comment": "string 20-1000 chars (optional)",
    "images": "string[] (optional, max 5)"
  }
  ```
- **Restrictions:**
  - Only owner can update
  - Only pending reviews can be updated
  - Cannot change status (use approve/reject endpoints)
- **Response:** Updated review object

#### DELETE - Delete Review

- **Access:** Owner or Admin
- **RBAC:**
  - Owner: Can delete own reviews
  - Admin: Can delete any review
- **Response:** Success message

---

### 3. `/api/reviews/[id]/approve` (POST)

**File:** `src/app/api/reviews/[id]/approve/route.ts` (92 lines)

#### POST - Approve Review

- **Access:** Admin only
- **Action:** Changes review status from pending to approved
- **Side Effects:**
  - Review becomes visible to public
  - Product rating is updated
  - Review count is incremented
- **Response:** Approved review object

---

### 4. `/api/reviews/[id]/reject` (POST)

**File:** `src/app/api/reviews/[id]/reject/route.ts` (111 lines)

#### POST - Reject Review

- **Access:** Admin only
- **Body:**
  ```json
  {
    "reason": "string (required, min 10 chars)"
  }
  ```
- **Validation:**
  - Reason must be at least 10 characters
  - Reason is stored with the review
- **Action:** Changes review status to rejected
- **Response:** Rejected review object with reason

---

## RBAC Matrix

| Endpoint                   | Public           | User                | Seller              | Admin                  |
| -------------------------- | ---------------- | ------------------- | ------------------- | ---------------------- |
| GET /reviews               | ✅ Approved only | ✅ Own reviews      | ✅ Approved only    | ✅ All reviews         |
| POST /reviews              | ❌               | ✅ If purchased     | ✅ If purchased     | ❌ Admins can't review |
| GET /reviews/[id]          | ✅ Approved only | ✅ Own or approved  | ✅ Approved only    | ✅ All                 |
| PUT /reviews/[id]          | ❌               | ✅ Own pending only | ✅ Own pending only | ❌                     |
| DELETE /reviews/[id]       | ❌               | ✅ Own reviews      | ✅ Own reviews      | ✅ Any review          |
| POST /reviews/[id]/approve | ❌               | ❌                  | ❌                  | ✅                     |
| POST /reviews/[id]/reject  | ❌               | ❌                  | ❌                  | ✅                     |

---

## Business Rules

### Purchase Verification

- Users can only review products they have purchased
- Verified reviews are marked with a "Verified Purchase" badge
- Purchase check is done via `canUserReviewProduct()` in controller

### Review Moderation Workflow

1. **Pending**: Initial status when review is created
2. **Approved**: Admin approves, review becomes public
3. **Rejected**: Admin rejects with reason, review hidden

### Review Lifecycle

- **Creation**: User submits review → Status: pending
- **Editing**: Owner can edit pending reviews
- **Approval**: Admin approves → Status: approved, visible to public
- **Rejection**: Admin rejects → Status: rejected, reason stored
- **Deletion**: Owner or admin can delete at any time

### Rating System

- Rating: 1-5 stars (required)
- Product average rating auto-calculated on approval
- Rating distribution tracked (1-star, 2-star, etc.)

### Helpful Marking

- Users can mark reviews as helpful
- Helpful count displayed with review
- Cannot mark own review as helpful
- Can only mark each review once

---

## Controller Functions Used

### Review CRUD

- `createReview()`: Create new review with purchase verification
- `getReviewById()`: Get single review with RBAC
- `updateReview()`: Update own pending review
- `deleteReview()`: Delete own or any review (admin)

### Review Listing

- `getProductReviews()`: Get reviews for a product (filtered by status)
- `getUserReviews()`: Get user's own reviews
- `getAllReviews()`: Get all reviews (admin only)

### Review Moderation

- `approveReview()`: Approve pending review
- `rejectReview()`: Reject review with reason
- `bulkApproveReviews()`: Batch approve (not exposed yet)
- `bulkRejectReviews()`: Batch reject (not exposed yet)

### Helpers

- `canUserReviewProduct()`: Check if user purchased product
- `getProductRating()`: Get average rating + distribution
- `getPendingReviewsCount()`: Get count for admin dashboard
- `markReviewHelpful()`: Mark review as helpful (not exposed yet)
- `countReviews()`: Get review counts (not exposed yet)

---

## Error Handling

All routes implement comprehensive error handling:

### Validation Errors (400)

- Missing required fields
- Invalid rating (not 1-5)
- Title too short/long (not 5-100 chars)
- Comment too short/long (not 20-1000 chars)
- Too many images (>5)
- Rejection reason too short (<10 chars)

### Authentication Errors (401)

- Missing JWT token
- Invalid/expired token
- User not found in database

### Authorization Errors (403)

- Non-admins trying to approve/reject
- Users trying to edit others' reviews
- Users trying to delete others' reviews
- Admins trying to create reviews (business rule)
- Trying to edit approved/rejected reviews

### Not Found Errors (404)

- Review not found
- Product not found
- User not found
- Non-approved review (public access)

### Server Errors (500)

- Database errors
- Unexpected errors (logged to console)

---

## Data Validation

### Create Review

```typescript
{
  productId: string (required, must exist)
  rating: number (required, 1-5)
  title: string (required, 5-100 chars)
  comment: string (required, 20-1000 chars)
  images: string[] (optional, max 5)
  orderId: string (optional, for verification)
}
```

### Update Review

```typescript
{
  rating: number (optional, 1-5)
  title: string (optional, 5-100 chars)
  comment: string (optional, 20-1000 chars)
  images: string[] (optional, max 5)
}
```

### Reject Review

```typescript
{
  reason: string (required, min 10 chars)
}
```

---

## Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    /* review object */
  },
  "message": "Operation completed successfully"
}
```

### List Response

```json
{
  "success": true,
  "data": [
    /* array of reviews */
  ],
  "total": 42
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Testing Checklist

### Review Creation

- [ ] User can create review for purchased product
- [ ] User cannot review without purchase
- [ ] Admins cannot create reviews
- [ ] Validation enforced (rating, title, comment length)
- [ ] Images limited to 5
- [ ] Review starts as pending

### Review Viewing

- [ ] Public sees only approved reviews
- [ ] User sees own reviews (any status)
- [ ] Admin sees all reviews
- [ ] Filters work (productId, userId, status)
- [ ] Sorting works (createdAt, rating, helpful)
- [ ] Pagination works

### Review Editing

- [ ] Owner can edit pending reviews
- [ ] Owner cannot edit approved reviews
- [ ] Owner cannot edit rejected reviews
- [ ] Non-owner cannot edit reviews
- [ ] Validation enforced on updates

### Review Deletion

- [ ] Owner can delete own reviews
- [ ] Admin can delete any review
- [ ] Non-owner cannot delete reviews

### Review Moderation

- [ ] Admin can approve pending reviews
- [ ] Admin can reject with reason (min 10 chars)
- [ ] Non-admin cannot approve/reject
- [ ] Approved reviews visible to public
- [ ] Rejected reviews hidden from public
- [ ] Product rating updates on approval

### Authorization

- [ ] JWT validation works
- [ ] Role-based access enforced
- [ ] Owner verification works
- [ ] Admin override works

### Error Handling

- [ ] 400 for validation errors
- [ ] 401 for missing auth
- [ ] 403 for authorization failures
- [ ] 404 for not found
- [ ] 500 for server errors

---

## Notes

### JWT Workaround

Like other routes, we fetch the full user document from Firestore after JWT verification to get additional user data (email, name) that isn't in the minimal JWT payload.

### Purchase Verification

The `canUserReviewProduct()` function in the review controller checks if the user has completed an order containing the product. This prevents fake reviews.

### Review Status Flow

```
Create → Pending → [Admin Approves] → Approved (public)
                 → [Admin Rejects] → Rejected (hidden)
```

### Future Enhancements

Could expose additional endpoints:

- `/api/reviews/[id]/helpful` - POST to mark helpful
- `/api/reviews/product/[productId]` - GET reviews by product (cleaner than query param)
- `/api/reviews/product/[productId]/rating` - GET rating stats
- `/api/reviews/pending` - GET pending count for admin dashboard
- `/api/reviews/bulk/approve` - POST bulk approve
- `/api/reviews/bulk/reject` - POST bulk reject

---

## Code Statistics

- **Total Routes:** 4 routes
- **Total Lines:** 559 lines
- **TypeScript Errors:** 0 ✅
- **Files Created:**
  1. `src/app/api/reviews/route.ts` (137 lines)
  2. `src/app/api/reviews/[id]/route.ts` (219 lines)
  3. `src/app/api/reviews/[id]/approve/route.ts` (92 lines)
  4. `src/app/api/reviews/[id]/reject/route.ts` (111 lines)

---

## Sprint 1 Progress

✅ **Day 1:** Products (2 routes, 348 lines)
✅ **Day 2:** Orders (5 routes, 561 lines)
✅ **Day 3:** Users (3 routes, 514 lines)
✅ **Day 4:** Categories (2 routes, 317 lines)
✅ **Day 5:** Reviews (4 routes, 559 lines)

**Total:** 16 routes, 2,299 lines, 0 errors

**Sprint 1: COMPLETE** 🎉
