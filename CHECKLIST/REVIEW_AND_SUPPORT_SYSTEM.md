# Review & Customer Support System

## Overview

This document outlines the enhanced review system and customer support center implementation for the justforview.in marketplace. Both systems follow the unified API architecture with strict UI/API separation (no Firebase in UI components).

---

## 1. Enhanced Review System

### 1.1 Multi-Dimensional Review Filtering

Reviews can be filtered across multiple dimensions to provide targeted insights:

**Filter Dimensions:**

- **Product ID**: Reviews specific to a product
- **Category ID**: Reviews for all products in a category (leaf categories only)
- **Shop ID**: All reviews for a shop's products
- **Auction ID**: Reviews specific to auction items
- **Rating**: Filter by star rating (1-5)
- **Verified Purchase**: Show only verified purchases (linked via `order_item_id`)

### 1.2 Database Schema: Reviews

```typescript
interface Review {
  id: string;
  product_id: string; // Product being reviewed
  category_id: string; // Leaf category ID
  shop_id: string; // Shop that owns the product
  auction_id?: string; // Optional: If reviewing an auction item
  order_item_id: string; // Link to purchase (for verification)
  user_id: string; // Reviewer
  rating: number; // 1-5 stars
  title: string; // Review title
  comment: string; // Review text
  media: string[]; // Images/videos
  verified_purchase: boolean; // Computed from order_item_id
  helpful_count: number; // Users who found this helpful
  created_at: Date;
  updated_at: Date;
}
```

### 1.3 Review Components

#### `/src/components/product/ReviewFilters.tsx`

**Filter sidebar for reviews:**

- Rating filter (1-5 stars, All ratings)
- Verified purchase toggle
- Category filter (if viewing category reviews)
- Shop filter (if viewing shop reviews)
- Sort by: Most recent, Most helpful, Highest rating, Lowest rating

#### `/src/components/product/ReviewSummary.tsx`

**Overview card displaying:**

- Average rating (e.g., 4.3/5)
- Total review count
- Rating breakdown (5-star bar chart)
- Verified purchase percentage
- Filters applied indicator

#### `/src/components/product/ReviewCard.tsx`

**Individual review display:**

- User name & avatar
- Verified purchase badge
- Rating stars
- Review title
- Review comment
- Media gallery (if images/videos uploaded)
- Helpful button with count
- Review date
- Report button (for inappropriate content)

### 1.4 Review API Endpoints

#### `GET /api/reviews`

**Query Parameters:**

```typescript
{
  product_id?: string;      // Filter by product
  category_id?: string;     // Filter by category
  shop_id?: string;         // Filter by shop
  auction_id?: string;      // Filter by auction
  rating?: number;          // Filter by rating (1-5)
  verified?: boolean;       // Only verified purchases
  sort?: 'recent' | 'helpful' | 'rating_high' | 'rating_low';
  page?: number;
  limit?: number;
}
```

**Response:**

```typescript
{
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  summary: {
    average_rating: number;
    total_reviews: number;
    rating_breakdown: { [key: number]: number }; // e.g., {5: 150, 4: 80, ...}
    verified_percentage: number;
  };
}
```

#### `POST /api/reviews`

**Create new review (authenticated users only):**

```typescript
{
  product_id: string;       // Required
  order_item_id: string;    // Required (verifies purchase)
  rating: number;           // Required (1-5)
  title: string;            // Required
  comment: string;          // Required
  media?: string[];         // Optional
}
```

**Response:**

```typescript
{
  success: true;
  review: Review;
  verified_purchase: boolean;
}
```

**Validation Rules:**

- User must have purchased the product (via `order_item_id`)
- One review per order item
- Rating must be 1-5
- Title max 100 chars
- Comment max 2000 chars
- Media max 5 files

#### `POST /api/reviews/[id]/helpful`

**Mark review as helpful:**

```typescript
{
  user_id: string; // Authenticated user
}
```

**Response:**

```typescript
{
  success: true;
  helpful_count: number;
}
```

### 1.5 Review Verification Logic

```typescript
// Pseudo-code for review verification
async function verifyPurchase(
  userId: string,
  productId: string,
  orderItemId: string
): Promise<boolean> {
  // 1. Check if order_item exists
  const orderItem = await db.collection("order_items").doc(orderItemId).get();
  if (!orderItem.exists) return false;

  // 2. Verify order_item belongs to the user
  const order = await db.collection("orders").doc(orderItem.order_id).get();
  if (order.user_id !== userId) return false;

  // 3. Verify product_id matches
  if (orderItem.product_id !== productId) return false;

  // 4. Verify order is completed (not cancelled/refunded)
  if (order.status !== "completed") return false;

  return true;
}
```

### 1.6 Use Cases

**Use Case 1: Product Detail Page**

```typescript
// Fetch reviews for a specific product
const response = await fetch(
  `/api/reviews?product_id=${productId}&sort=recent&page=1&limit=10`
);
```

**Use Case 2: Category Reviews Page**

```typescript
// Fetch all reviews for products in a category
const response = await fetch(
  `/api/reviews?category_id=${categoryId}&verified=true&sort=helpful`
);
```

**Use Case 3: Shop Reviews Page**

```typescript
// Fetch all reviews for a shop
const response = await fetch(`/api/reviews?shop_id=${shopId}&rating=5&page=1`);
```

**Use Case 4: Auction Item Reviews**

```typescript
// Fetch reviews for items won in auctions
const response = await fetch(`/api/reviews?auction_id=${auctionId}`);
```

---

## 2. Customer Support Center

### 2.1 Ticket System Architecture

The support system follows a three-tier escalation model:

1. **User → Seller**: Order-related issues (shop-specific)
2. **Seller → Admin**: Escalated disputes
3. **User → Admin**: Direct for account/payment issues

### 2.2 Database Schema: Support Tickets

```typescript
interface SupportTicket {
  id: string;
  user_id: string; // User who created ticket
  shop_id?: string; // Optional: Shop if order-related
  category: TicketCategory; // Type of issue
  priority: TicketPriority; // Urgency level
  subject: string; // Ticket subject
  status: TicketStatus; // Current status
  assigned_to?: string; // Support staff/admin ID
  escalated: boolean; // Escalated to admin
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
}

enum TicketCategory {
  ORDER_ISSUE = "order_issue",
  RETURN_REFUND = "return_refund",
  PRODUCT_QUESTION = "product_question",
  ACCOUNT = "account",
  PAYMENT = "payment",
  OTHER = "other",
}

enum TicketPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

enum TicketStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  WAITING_RESPONSE = "waiting_response",
  RESOLVED = "resolved",
  CLOSED = "closed",
}
```

### 2.3 Database Schema: Ticket Messages

```typescript
interface TicketMessage {
  id: string;
  ticket_id: string; // Parent ticket
  sender_id: string; // User/seller/admin ID
  sender_role: "user" | "seller" | "admin"; // Sender type
  message: string; // Message text
  attachments: string[]; // File URLs
  created_at: Date;
}
```

### 2.4 Support Components

#### `/src/components/support/TicketForm.tsx`

**Create ticket form:**

- Category selector (dropdown)
- Subject (text input)
- Description (textarea)
- Attachments (file upload, max 5)
- Priority (auto-set based on category)

#### `/src/components/support/TicketCard.tsx`

**Ticket summary card:**

- Ticket ID (e.g., #TKT-00123)
- Category badge
- Priority indicator
- Status badge
- Subject
- Last updated timestamp
- Unread messages count

#### `/src/components/support/TicketMessages.tsx`

**Message thread:**

- Messages grouped by sender role (user/seller/admin)
- Avatar and name
- Timestamp
- Attachments preview
- "Typing..." indicator (real-time)

#### `/src/components/support/TicketReplyForm.tsx`

**Reply form:**

- Message textarea
- Attach files button
- Send button
- Close ticket button (if issue resolved)

#### `/src/components/support/TicketStatus.tsx`

**Status timeline:**

- Open → In Progress → Resolved → Closed
- Timestamps for each transition
- Color-coded status badges

#### `/src/components/support/TicketFilters.tsx`

**Filter sidebar:**

- Status filter (all, open, in-progress, resolved, closed)
- Category filter (multi-select)
- Priority filter (multi-select)
- Date range filter
- Escalated toggle

#### `/src/components/support/SupportFAQ.tsx`

**FAQ section:**

- Search bar
- Category tabs (Orders, Returns, Payments, etc.)
- Expandable Q&A cards
- "Did this help?" feedback buttons
- "Contact Support" CTA

### 2.5 Support API Endpoints

#### `GET /api/support/tickets`

**List tickets with filtering:**

**Query Parameters:**

```typescript
{
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  escalated?: boolean;
  shop_id?: string;        // For sellers
  sort?: 'recent' | 'priority' | 'updated';
  page?: number;
  limit?: number;
}
```

**Response (role-based):**

```typescript
// User: sees own tickets
// Seller: sees tickets for their shops
// Admin: sees all tickets

{
  tickets: SupportTicket[];
  pagination: PaginationData;
  summary: {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
  };
}
```

#### `POST /api/support/tickets`

**Create new ticket:**

```typescript
{
  category: TicketCategory;
  subject: string;
  description: string;
  shop_id?: string;        // Optional: if order-related
  order_id?: string;       // Optional: reference order
  attachments?: string[];
}
```

**Response:**

```typescript
{
  success: true;
  ticket: SupportTicket;
  message: "Ticket created. You will receive updates via email.";
}
```

#### `GET /api/support/tickets/[id]`

**Get ticket details:**

**Response:**

```typescript
{
  ticket: SupportTicket;
  messages: TicketMessage[];
  related_order?: Order;   // If applicable
}
```

#### `POST /api/support/tickets/[id]/messages`

**Add message to ticket:**

```typescript
{
  message: string;
  attachments?: string[];
}
```

**Response:**

```typescript
{
  success: true;
  message: TicketMessage;
  notification_sent: boolean;
}
```

#### `POST /api/support/tickets/[id]/close`

**Close ticket:**

```typescript
{
  resolution: string; // Final resolution message
}
```

**Response:**

```typescript
{
  success: true;
  ticket: SupportTicket; // Updated with status: 'closed'
}
```

#### `POST /api/support/tickets/[id]/escalate` (Seller only)

**Escalate to admin:**

```typescript
{
  reason: string; // Why escalating
}
```

**Response:**

```typescript
{
  success: true;
  ticket: SupportTicket; // Updated with escalated: true
}
```

#### `POST /api/support/tickets/[id]/assign` (Admin only)

**Assign ticket to support staff:**

```typescript
{
  assigned_to: string; // Admin/staff user ID
}
```

**Response:**

```typescript
{
  success: true;
  ticket: SupportTicket; // Updated with assigned_to
}
```

### 2.6 Ticket Assignment Logic

```typescript
// Pseudo-code for automatic ticket routing
async function routeTicket(ticket: SupportTicket): Promise<void> {
  // Order/Return/Refund issues go to seller
  if (
    ["order_issue", "return_refund"].includes(ticket.category) &&
    ticket.shop_id
  ) {
    const shop = await db.collection("shops").doc(ticket.shop_id).get();
    await notifySeller(shop.owner_id, ticket);
    return;
  }

  // Account/Payment issues go directly to admin
  if (["account", "payment"].includes(ticket.category)) {
    await notifyAdmins(ticket);
    return;
  }

  // Product questions: notify seller first, admin if no response in 24h
  if (ticket.category === "product_question" && ticket.shop_id) {
    const shop = await db.collection("shops").doc(ticket.shop_id).get();
    await notifySeller(shop.owner_id, ticket);

    // Schedule escalation check
    await scheduleEscalationCheck(ticket.id, 24 * 60 * 60 * 1000); // 24 hours
    return;
  }

  // Default: route to admin
  await notifyAdmins(ticket);
}
```

### 2.7 Email Notifications

**Trigger Events:**

1. **Ticket Created**: Notify user (confirmation) and assigned party (seller/admin)
2. **New Message**: Notify recipient(s)
3. **Status Changed**: Notify user
4. **Ticket Escalated**: Notify admin
5. **Ticket Resolved**: Notify user with resolution details
6. **No Response (24h)**: Reminder to assigned party

**Email Template Example:**

```
Subject: [Ticket #TKT-00123] New message from Support

Hi [User Name],

You have a new message on your support ticket:

Ticket: #TKT-00123
Subject: [Ticket Subject]
Status: In Progress

---
[Message Content]
---

View and reply: https://justforview.in/support/tickets/TKT-00123

Thanks,
JustForView Support Team
```

### 2.8 User Flows

#### Flow 1: User Creates Ticket

```
1. User goes to /support
2. Clicks "Create Ticket" or "Contact Support"
3. Fills out form (category, subject, description)
4. Optionally attaches files
5. Submits → Ticket created
6. User receives confirmation email
7. Ticket routed to seller (if order-related) or admin
8. Seller/admin receives notification
```

#### Flow 2: Seller Responds to Ticket

```
1. Seller receives email notification
2. Goes to /seller/support-tickets
3. Opens ticket
4. Views message thread
5. Types reply
6. Sends → User receives email notification
7. User views reply in /support/tickets/[id]
8. User responds
9. Continues until resolved
10. Seller marks as resolved
11. User confirms and closes ticket
```

#### Flow 3: Escalation to Admin

```
1. Seller unable to resolve issue
2. Clicks "Escalate to Admin"
3. Provides escalation reason
4. Ticket marked as escalated
5. Admin receives notification
6. Admin reviews and takes over
7. Admin resolves and closes ticket
```

#### Flow 4: Direct Admin Contact

```
1. User has account/payment issue
2. Creates ticket with category: Account/Payment
3. Ticket automatically routed to admin
4. Admin receives notification
5. Admin responds and resolves
6. User closes ticket
```

---

## 3. UI/API Separation Rules

### 3.1 Strict Guidelines

**✅ ALLOWED in UI Components:**

- `fetch()` or `axios` calls to `/api/*` endpoints
- SWR or React Query for data fetching
- Local state management (useState, useContext)
- Form libraries (React Hook Form)
- UI libraries (Headless UI, Radix UI)

**❌ FORBIDDEN in UI Components:**

- Direct Firebase imports (`import { getFirestore } from 'firebase/firestore'`)
- Firestore queries in components
- Firebase admin SDK usage
- Direct database writes
- Auth token manipulation (except via API)

### 3.2 Example: Correct Review Fetching

**❌ WRONG (Direct Firebase):**

```typescript
// BAD: Don't do this in components
import { collection, query, where, getDocs } from "firebase/firestore";

const ReviewList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const q = query(
        collection(db, "reviews"),
        where("product_id", "==", productId)
      );
      const snapshot = await getDocs(q);
      setReviews(snapshot.docs.map((doc) => doc.data()));
    };
    fetchReviews();
  }, [productId]);

  return <div>{/* render reviews */}</div>;
};
```

**✅ CORRECT (Via API):**

```typescript
// GOOD: Use API endpoint
import useSWR from "swr";

const ReviewList = ({ productId }) => {
  const { data, error } = useSWR(`/api/reviews?product_id=${productId}`);

  if (error) return <ErrorState />;
  if (!data) return <LoadingState />;

  return (
    <div>
      {data.reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
};
```

### 3.3 API Route Structure

**All Firebase logic stays in API routes:**

```typescript
// /src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { authMiddleware } from "@/app/api/middleware/auth";

export async function GET(request: NextRequest) {
  const db = getFirestore();
  const { searchParams } = new URL(request.url);

  const productId = searchParams.get("product_id");
  const categoryId = searchParams.get("category_id");
  const shopId = searchParams.get("shop_id");

  // Build query based on filters
  let query = db.collection("reviews");

  if (productId) query = query.where("product_id", "==", productId);
  if (categoryId) query = query.where("category_id", "==", categoryId);
  if (shopId) query = query.where("shop_id", "==", shopId);

  const snapshot = await query.get();
  const reviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return NextResponse.json({ reviews });
}

export async function POST(request: NextRequest) {
  // Verify authentication
  const user = await authMiddleware(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Verify purchase
  const verified = await verifyPurchase(
    user.uid,
    body.product_id,
    body.order_item_id
  );
  if (!verified) {
    return NextResponse.json(
      { error: "Must purchase to review" },
      { status: 403 }
    );
  }

  // Create review
  const db = getFirestore();
  const reviewRef = await db.collection("reviews").add({
    ...body,
    user_id: user.uid,
    verified_purchase: true,
    helpful_count: 0,
    created_at: new Date(),
    updated_at: new Date(),
  });

  const review = await reviewRef.get();
  return NextResponse.json({ success: true, review: review.data() });
}
```

---

## 4. Implementation Checklist

### 4.1 Review System (✅ Completed in FEATURE_IMPLEMENTATION_CHECKLIST.md)

- [x] Section 6.8: Product Pages with enhanced reviews
- [x] Database schema: reviews table with multi-dimensional linking
- [x] API endpoints: /api/reviews with filtering
- [x] Components: ReviewFilters, ReviewSummary, ReviewCard
- [x] Testing: Review filtering and verification tests

### 4.2 Customer Support Center (✅ Completed in FEATURE_IMPLEMENTATION_CHECKLIST.md)

- [x] Section 6.12: User support center
- [x] Section 4.4: Seller support tickets
- [x] Section 5.8: Admin support management
- [x] Database schema: support_tickets and ticket_messages tables
- [x] API endpoints: /api/support/tickets with role-based access
- [x] Components: TicketForm, TicketCard, TicketMessages, TicketFilters
- [x] Email notifications for ticket updates
- [x] Testing: Ticket workflow and escalation tests

### 4.3 Documentation (Added to checklist)

- [ ] Create `/docs/REVIEW_SYSTEM_GUIDE.md`
- [ ] Create `/docs/CUSTOMER_SUPPORT_GUIDE.md`
- [ ] Create `/docs/UI_API_SEPARATION.md`

---

## 5. Key Metrics & Analytics

### 5.1 Review Metrics

**Track:**

- Average rating per product/category/shop
- Verified purchase percentage
- Review response rate (seller replies)
- Helpful vote distribution
- Review velocity (reviews per day)

**Dashboard KPIs:**

- Products with <3.5 stars (need attention)
- Reviews pending seller response
- Most helpful reviewers (gamification)

### 5.2 Support Metrics

**Track:**

- Average response time (first response)
- Average resolution time
- Ticket volume by category
- Escalation rate
- Customer satisfaction (CSAT) after ticket closure

**Dashboard KPIs:**

- Open tickets >48h old
- Tickets pending seller response
- Admin escalations (should be <10%)
- Resolution rate (target: >90%)

---

## 6. Future Enhancements

### 6.1 Review System

- [ ] Review moderation (flagged reviews)
- [ ] Seller responses to reviews
- [ ] Review photos verification (AI check for fake images)
- [ ] Review incentives (discounts for verified reviews)
- [ ] Review badges (Top Reviewer, Verified Buyer)

### 6.2 Support System

- [ ] Live chat integration
- [ ] AI-powered suggested responses
- [ ] Ticket priority prediction (ML model)
- [ ] Self-service resolution flows
- [ ] Video call support for complex issues

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Author:** GitHub Copilot  
**Status:** Implementation Ready
