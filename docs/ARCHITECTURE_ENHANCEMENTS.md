# Architecture Enhancement Plan

> **Comprehensive analysis and enhancement roadmap for LetItRip.in e-commerce platform**

**Date**: February 8, 2026  
**Platform**: Next.js 16.1.1 + Firebase  
**Focus**: Backend-Heavy Architecture

---

## 📊 Current Architecture Analysis

### ✅ Strengths

1. **Clean Architecture**
   - Repository pattern for data access
   - Barrel imports for organization
   - Strong TypeScript typing
   - Separation of concerns (utils/helpers/hooks)

2. **Existing Core Features**
   - Products with auction support
   - Order management
   - User authentication & profiles
   - Reviews & ratings
   - Coupons & discounts
   - Categories management
   - Session management
   - Admin dashboard
   - Media upload (images/videos)

3. **Infrastructure**
   - Firebase Firestore (scalable NoSQL)
   - Firebase Storage (media)
   - Firebase Auth (authentication)
   - Resend (email service)
   - Server-side rendering with Next.js

### ⚠️ Missing Critical E-commerce Features

#### 1. **Shopping Cart System** 🛒 (HIGH PRIORITY)

**Status**: Not implemented  
**Impact**: Users cannot add items before purchase

**Required Implementation**:

- `src/db/schema/cart.ts` - Cart collection schema
- `src/repositories/cart.repository.ts` - Cart data access
- `src/app/api/cart/**` - Cart API endpoints (add, remove, update, clear)
- `src/hooks/useCart.ts` - Client-side cart management
- Cart state management (Context or Zustand)

```typescript
// Proposed Schema
interface CartDocument {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  appliedCoupons: string[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date; // Auto-cleanup after 30 days
}

interface CartItem {
  productId: string;
  productTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedVariant?: {
    size?: string;
    color?: string;
    sku?: string;
  };
  sellerId: string;
  availableQuantity: number;
  mainImage: string;
}
```

---

#### 2. **Wishlist System** ❤️ (HIGH PRIORITY)

**Status**: Partially implemented (UI references exist)  
**Missing**: Backend schema and API

**Required Implementation**:

- `src/db/schema/wishlist.ts`
- `src/repositories/wishlist.repository.ts`
- `src/app/api/wishlist/**`
- `src/hooks/useWishlist.ts`

```typescript
// Proposed Schema
interface WishlistDocument {
  id: string;
  userId: string;
  items: WishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface WishlistItem {
  productId: string;
  addedAt: Date;
  priceWhenAdded: number;
  notifyOnPriceChange: boolean;
  notifyOnStockAvailable: boolean;
}
```

---

#### 3. **Payment Gateway Integration** 💳 (CRITICAL)

**Status**: Not implemented  
**Impact**: Cannot process real transactions

**Recommended Providers**:

- **Razorpay** (India-focused, best for INR)
- **Stripe** (Global, best for international)
- **Paytm** (India-focused alternative)
- **PayPal** (International buyers)

**Required Implementation**:

```
src/lib/payment/
├── razorpay.ts         # Razorpay SDK wrapper
├── stripe.ts           # Stripe SDK wrapper
├── payment.types.ts    # Payment interfaces
└── payment.helper.ts   # Payment utilities

src/app/api/payment/
├── create-order/route.ts        # Initialize payment
├── verify-payment/route.ts      # Verify payment signature
├── webhook/route.ts             # Payment status webhooks
├── refund/route.ts              # Process refunds
└── payment-methods/route.ts     # Saved payment methods
```

**Schema Changes**:

```typescript
// Add to OrderDocument
interface OrderDocument {
  // ... existing fields
  payment: {
    gateway: "razorpay" | "stripe" | "paytm" | "cod";
    transactionId?: string;
    orderId?: string;
    signature?: string;
    method: "card" | "upi" | "netbanking" | "wallet" | "cod";
    status: "pending" | "processing" | "completed" | "failed";
    failureReason?: string;
    retryCount: number;
    paidAt?: Date;
  };
}
```

---

#### 4. **Inventory Management** 📦 (MEDIUM PRIORITY)

**Status**: Basic stock tracking exists  
**Missing**: Advanced inventory features

**Required Features**:

- Low stock alerts
- Inventory history/logs
- Multi-warehouse support
- Stock reservations during checkout
- Automatic stock updates on order cancellation

**New Schema**:

```typescript
// src/db/schema/inventory.ts
interface InventoryLogDocument {
  id: string;
  productId: string;
  type:
    | "addition"
    | "sale"
    | "return"
    | "adjustment"
    | "reservation"
    | "cancellation";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  orderId?: string;
  performedBy: string;
  createdAt: Date;
}

interface StockReservationDocument {
  id: string;
  productId: string;
  userId: string;
  orderId: string;
  quantity: number;
  reservedAt: Date;
  expiresAt: Date; // Auto-release after 15 minutes
  status: "active" | "completed" | "expired" | "cancelled";
}
```

**API Endpoints**:

```
src/app/api/inventory/
├── logs/route.ts              # Get inventory history
├── reserve/route.ts           # Reserve stock during checkout
├── release/route.ts           # Release expired reservations
├── adjust/route.ts            # Manual stock adjustment (admin)
└── low-stock/route.ts         # Get low stock alerts
```

---

#### 5. **Notifications System** 🔔 (HIGH PRIORITY)

**Status**: Not implemented  
**Impact**: No user engagement, order updates

**Required Channels**:

- **Email** (Resend already configured)
- **SMS** (Twilio, MSG91, or Fast2SMS)
- **Push Notifications** (Firebase Cloud Messaging)
- **In-app Notifications** (Firestore collection)

**Implementation**:

```
src/lib/notifications/
├── email/
│   ├── templates/           # Email HTML templates
│   ├── email.service.ts     # Send emails via Resend
│   └── email.types.ts
├── sms/
│   ├── sms.service.ts       # SMS provider integration
│   └── sms.types.ts
├── push/
│   ├── fcm.service.ts       # Firebase Cloud Messaging
│   └── push.types.ts
└── notification.manager.ts   # Unified notification interface

src/db/schema/notifications.ts
src/repositories/notification.repository.ts

src/app/api/notifications/
├── send/route.ts            # Send notification
├── mark-read/route.ts       # Mark as read
├── preferences/route.ts     # User notification preferences
└── subscribe-push/route.ts  # Subscribe to push notifications
```

**Notification Types**:

- Order placed
- Order confirmed
- Order shipped
- Order delivered
- Payment successful/failed
- Low stock alerts (sellers)
- New review on product (sellers)
- Price drop on wishlist items
- Auction ending soon
- Auction won/outbid

---

#### 6. **Search & Filters** 🔍 (HIGH PRIORITY)

**Status**: Basic UI exists  
**Missing**: Backend search API with advanced filtering

**Recommended Solutions**:

- **Algolia** (Best for e-commerce search)
- **Meilisearch** (Self-hosted, fast)
- **Elasticsearch** (Complex but powerful)
- **Basic Firestore Queries** (Limited but free)

**Implementation with Algolia**:

```
src/lib/search/
├── algolia.ts              # Algolia configuration
├── indexing.ts             # Product indexing
└── search.types.ts

src/app/api/search/
├── products/route.ts       # Product search
├── suggestions/route.ts    # Autocomplete suggestions
└── facets/route.ts         # Get filter options

// Sync products to Algolia
src/lib/search/sync.ts
- On product create → Add to Algolia
- On product update → Update in Algolia
- On product delete → Remove from Algolia
```

**Filter Capabilities**:

- Full-text search
- Category/subcategory
- Price range
- Ratings
- Seller
- Availability
- Features/specifications
- Sort by (price, popularity, rating, newest)

---

#### 7. **Shipping Integration** 🚚 (MEDIUM PRIORITY)

**Status**: Not implemented  
**Current**: Manual tracking number entry

**Recommended Providers**:

- **Shiprocket** (India-focused, multi-courier)
- **Delhivery** (India)
- **DHL/FedEx APIs** (International)

**Implementation**:

```
src/lib/shipping/
├── shiprocket.ts           # Shiprocket SDK wrapper
├── shipping.types.ts
└── rate-calculator.ts      # Calculate shipping costs

src/app/api/shipping/
├── calculate-rate/route.ts    # Get shipping cost
├── create-shipment/route.ts   # Create shipment
├── track/route.ts             # Track shipment
├── generate-label/route.ts    # Generate shipping label
└── courier-partners/route.ts  # Get available couriers
```

**Features**:

- Real-time shipping cost calculation
- Multiple courier options
- Automatic tracking updates
- Generate shipping labels
- Bulk shipping label generation
- Address validation

---

#### 8. **Seller Dashboard** 👔 (HIGH PRIORITY)

**Status**: Multi-seller support exists but no seller interface  
**Missing**: Complete seller management interface

**Required Pages**:

```
src/app/seller/
├── dashboard/              # Seller overview
├── products/               # Product management
│   ├── add/
│   ├── edit/[id]/
│   └── inventory/
├── orders/                 # Order fulfillment
├── earnings/               # Revenue & payouts
├── analytics/              # Sales analytics
├── reviews/                # Customer reviews
├── coupons/                # Seller-specific coupons
└── settings/               # Seller profile & preferences
```

**API Endpoints**:

```
src/app/api/seller/
├── dashboard/route.ts       # Seller stats
├── earnings/route.ts        # Earnings & payouts
├── orders/route.ts          # Seller orders
├── analytics/route.ts       # Sales analytics
├── payout-requests/route.ts # Request payout
└── performance/route.ts     # Seller performance metrics
```

**New Schema**:

```typescript
// src/db/schema/seller-profile.ts
interface SellerProfileDocument {
  id: string;
  userId: string;
  businessName: string;
  businessType: "individual" | "company";
  gstNumber?: string;
  panNumber: string;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  verificationStatus: "pending" | "verified" | "rejected";
  documents: {
    type: string;
    url: string;
    uploadedAt: Date;
  }[];
  commission: number; // Platform commission (%)
  totalEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

#### 9. **Analytics & Reporting** 📈 (MEDIUM PRIORITY)

**Status**: Basic admin stats exist  
**Missing**: Comprehensive analytics

**Implementation**:

```
src/lib/analytics/
├── tracker.ts              # Event tracking
├── aggregator.ts           # Data aggregation
├── reports.ts              # Report generation
└── analytics.types.ts

src/db/schema/analytics.ts  # Analytics events collection

src/app/api/analytics/
├── events/route.ts         # Track events
├── dashboard/route.ts      # Dashboard metrics
├── sales/route.ts          # Sales reports
├── products/route.ts       # Product performance
├── customers/route.ts      # Customer insights
└── export/route.ts         # Export reports (CSV/Excel)
```

**Key Metrics**:

- Daily/Weekly/Monthly sales
- Revenue trends
- Top-selling products
- Customer acquisition cost
- Conversion rates
- Cart abandonment rate
- Average order value
- Customer lifetime value
- Traffic sources
- Seller performance

---

#### 10. **Product Variants** 👕 (MEDIUM PRIORITY)

**Status**: Not implemented  
**Impact**: Cannot sell items with size/color options

**Schema Changes**:

```typescript
// Add to ProductDocument
interface ProductDocument {
  // ... existing fields
  hasVariants: boolean;
  variants?: ProductVariant[];
}

interface ProductVariant {
  id: string;
  sku: string;
  attributes: {
    size?: string;
    color?: string;
    material?: string;
    // ... flexible key-value pairs
  };
  price: number; // Can differ from base price
  stockQuantity: number;
  images: string[]; // Variant-specific images
  isActive: boolean;
}
```

---

#### 11. **Order Tracking & Lifecycle** 📍 (HIGH PRIORITY)

**Status**: Basic status tracking  
**Missing**: Detailed lifecycle management

**Enhanced Implementation**:

```typescript
// src/db/schema/order-timeline.ts
interface OrderTimelineDocument {
  id: string;
  orderId: string;
  events: OrderEvent[];
}

interface OrderEvent {
  status: OrderStatus;
  timestamp: Date;
  location?: string;
  description: string;
  performedBy?: string;
  metadata?: Record<string, any>;
}

// API for timeline
src/app/api/orders/
├── [id]/timeline/route.ts     # Get order timeline
├── [id]/track/route.ts        # Track order with courier
├── [id]/cancel/route.ts       # Cancel order
├── [id]/return/route.ts       # Initiate return
└── [id]/invoice/route.ts      # Generate invoice
```

**Status Workflow**:

```
pending → confirmed → processing → shipped → out_for_delivery → delivered
        ↓                   ↓            ↓
    cancelled           cancelled    returned
```

---

#### 12. **Refunds & Returns Management** 🔄 (MEDIUM PRIORITY)

**Status**: Fields exist but no workflow  
**Missing**: Complete return/refund process

**Implementation**:

```typescript
// src/db/schema/returns.ts
interface ReturnRequestDocument {
  id: string;
  orderId: string;
  userId: string;
  productId: string;
  reason: string;
  reasonCategory: 'defective' | 'wrong_item' | 'not_satisfied' | 'size_issue' | 'other';
  description: string;
  images: string[]; // Photos of defective item
  requestedAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  refundMethod: 'original_payment' | 'wallet' | 'bank_transfer';
  refundStatus: 'pending' | 'processing' | 'completed' | 'failed';
  returnShippingLabel?: string;
  createdAt: Date;
  updatedAt: Date;
}

src/app/api/returns/
├── create/route.ts         # Create return request
├── [id]/approve/route.ts   # Approve return (admin)
├── [id]/reject/route.ts    # Reject return (admin)
└── [id]/process-refund/route.ts # Process refund
```

---

#### 13. **Recommendations Engine** 🎯 (LOW PRIORITY)

**Status**: Not implemented  
**Nice-to-have**: Personalized product recommendations

**Approaches**:

- **Simple**: Related products by category/tags
- **Advanced**: Collaborative filtering (ML-based)
- **Hybrid**: Combine both approaches

**Implementation**:

```
src/lib/recommendations/
├── related-products.ts     # By category/tags
├── collaborative.ts        # User behavior-based
├── trending.ts             # Popular products
└── personalized.ts         # User-specific

src/app/api/recommendations/
├── related/route.ts        # Related to current product
├── for-you/route.ts        # Personalized for user
├── trending/route.ts       # Trending products
└── recently-viewed/route.ts
```

---

#### 14. **Advanced Features** ⚡

##### A. **Product Comparisons**

```typescript
// src/app/api/compare/route.ts
GET /api/compare?ids=prod1,prod2,prod3
// Returns side-by-side comparison of specifications
```

##### B. **Bulk Order Management** (Admin)

```
src/app/api/admin/orders/
├── bulk-status-update/route.ts
├── bulk-export/route.ts
└── bulk-invoice/route.ts
```

##### C. **Flash Sales / Limited Time Offers**

```typescript
interface FlashSaleDocument {
  id: string;
  name: string;
  products: string[]; // Product IDs
  discount: number;
  startDate: Date;
  endDate: Date;
  maxQuantityPerUser: number;
  totalLimit: number;
  currentSold: number;
  isActive: boolean;
}
```

##### D. **Pre-orders**

```typescript
// Add to ProductDocument
interface ProductDocument {
  isPreOrder: boolean;
  preOrderReleaseDate?: Date;
  preOrderLimit?: number;
}
```

##### E. **Gift Cards**

```typescript
interface GiftCardDocument {
  id: string;
  code: string;
  value: number;
  balance: number;
  purchasedBy: string;
  recipientEmail?: string;
  message?: string;
  expiresAt: Date;
  isActive: boolean;
}
```

##### F. **Subscription Products**

```typescript
interface SubscriptionDocument {
  id: string;
  userId: string;
  productId: string;
  frequency: "weekly" | "monthly" | "quarterly";
  nextDeliveryDate: Date;
  status: "active" | "paused" | "cancelled";
  deliveryCount: number;
}
```

---

## 🏗️ Recommended Implementation Priority

### Phase 1: Critical E-commerce Features (Weeks 1-4)

1. **Shopping Cart** (Week 1)
   - Schema, repository, API, hooks
   - Cart persistence (user & session-based)
2. **Payment Gateway** (Week 2)
   - Razorpay integration
   - Payment verification
   - Webhook handling

3. **Wishlist** (Week 3)
   - Complete backend implementation
   - Connect to existing UI

4. **Order Tracking** (Week 4)
   - Enhanced order lifecycle
   - Timeline/history tracking

### Phase 2: Enhanced User Experience (Weeks 5-8)

5. **Search & Filters** (Week 5)
   - Algolia integration
   - Advanced filtering

6. **Notifications** (Week 6-7)
   - Email templates
   - SMS integration
   - Push notifications
   - In-app notifications

7. **Inventory Management** (Week 8)
   - Stock reservations
   - Inventory logs
   - Low stock alerts

### Phase 3: Seller & Admin Tools (Weeks 9-12)

8. **Seller Dashboard** (Week 9-10)
   - Seller profile setup
   - Product management
   - Order fulfillment interface

9. **Analytics & Reporting** (Week 11)
   - Event tracking
   - Dashboard metrics
   - Report generation

10. **Shipping Integration** (Week 12)
    - Shiprocket integration
    - Rate calculation
    - Label generation

### Phase 4: Advanced Features (Weeks 13-16)

11. **Product Variants** (Week 13)
12. **Returns Management** (Week 14)
13. **Recommendations** (Week 15)
14. **Advanced Features** (Week 16)
    - Bulk operations
    - Flash sales
    - Gift cards

---

## 🔧 Backend Architecture Improvements

### 1. **API Response Standardization**

Create consistent API response format:

```typescript
// src/lib/api/response-handler.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
  timestamp: string;
}

export function successResponse<T>(data: T, meta?: any): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: any,
): ApiResponse {
  return {
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString(),
  };
}
```

### 2. **Rate Limiting & Security**

```typescript
// src/lib/security/rate-limiter.ts
import { RateLimiter } from "@vercel/edge";

export const rateLimiter = new RateLimiter({
  interval: "1m",
  limit: 60, // 60 requests per minute
});

// Apply to API routes
export async function withRateLimit(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { success } = await rateLimiter.limit(ip);

  if (!success) {
    throw new ApiError("RATE_LIMIT_EXCEEDED", "Too many requests", 429);
  }
}
```

### 3. **Background Jobs & Queues**

```typescript
// src/lib/jobs/queue.ts
import { Queue } from "@/classes";

export const emailQueue = new Queue();
export const notificationQueue = new Queue();
export const indexingQueue = new Queue(); // For Algolia sync

// Example: Send order confirmation email
emailQueue.enqueue({
  priority: 1,
  execute: async () => {
    await sendOrderConfirmationEmail(orderData);
  },
});
```

### 4. **Caching Strategy**

```typescript
// src/lib/cache/strategy.ts
import { cacheManager } from "@/classes";

// Cache product details (5 minutes)
export async function getCachedProduct(productId: string) {
  const cacheKey = `product:${productId}`;
  const cached = cacheManager.get(cacheKey);

  if (cached) return cached;

  const product = await productRepository.findById(productId);
  cacheManager.set(cacheKey, product, 300000); // 5 min TTL

  return product;
}

// Cache categories (1 hour)
export async function getCachedCategories() {
  const cacheKey = "categories:all";
  const cached = cacheManager.get(cacheKey);

  if (cached) return cached;

  const categories = await categoriesRepository.findAll();
  cacheManager.set(cacheKey, categories, 3600000); // 1 hour TTL

  return categories;
}
```

### 5. **Webhook Handlers**

```typescript
// src/app/api/webhooks/
├── payment/route.ts         # Payment gateway webhooks
├── shipping/route.ts        # Shipping provider webhooks
└── algolia/route.ts         # Algolia sync webhooks
```

### 6. **Scheduled Jobs (Cron)**

```typescript
// src/app/api/cron/
├── cleanup-carts/route.ts           # Clean expired carts (daily)
├── release-reservations/route.ts    # Release expired stock (hourly)
├── send-reminders/route.ts          # Cart abandonment emails (daily)
├── update-analytics/route.ts        # Aggregate analytics (daily)
└── expire-coupons/route.ts          # Deactivate expired coupons (daily)

// Use Vercel Cron or external service (EasyCron, cron-job.org)
```

### 7. **Database Optimization**

**Firestore Composite Indexes** (update `firestore.indexes.json`):

```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "price", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "orderDate", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### 8. **Error Tracking & Monitoring**

**Integrate Sentry**:

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Or use Firebase Crashlytics**

---

## 📁 Proposed New Folder Structure

```
src/
├── app/
│   ├── api/
│   │   ├── cart/              # NEW: Cart management
│   │   ├── wishlist/          # NEW: Wishlist management
│   │   ├── payment/           # NEW: Payment processing
│   │   ├── shipping/          # NEW: Shipping integration
│   │   ├── search/            # NEW: Search & filters
│   │   ├── notifications/     # NEW: Notification management
│   │   ├── inventory/         # NEW: Inventory management
│   │   ├── returns/           # NEW: Returns & refunds
│   │   ├── analytics/         # NEW: Analytics & reports
│   │   ├── recommendations/   # NEW: Product recommendations
│   │   ├── seller/            # NEW: Seller-specific APIs
│   │   └── webhooks/          # NEW: External service webhooks
│   │       ├── payment/
│   │       ├── shipping/
│   │       └── algolia/
│   ├── seller/                # NEW: Seller dashboard pages
│   └── cart/                  # NEW: Cart page
│
├── db/
│   └── schema/
│       ├── cart.ts            # NEW
│       ├── wishlist.ts        # NEW
│       ├── inventory-logs.ts  # NEW
│       ├── stock-reservations.ts # NEW
│       ├── notifications.ts   # NEW
│       ├── returns.ts         # NEW
│       ├── seller-profiles.ts # NEW
│       └── analytics.ts       # NEW
│
├── repositories/
│   ├── cart.repository.ts     # NEW
│   ├── wishlist.repository.ts # NEW
│   ├── inventory.repository.ts # NEW
│   ├── notification.repository.ts # NEW
│   ├── return.repository.ts   # NEW
│   └── seller.repository.ts   # NEW
│
├── lib/
│   ├── payment/               # NEW: Payment gateways
│   │   ├── razorpay.ts
│   │   ├── stripe.ts
│   │   └── payment.types.ts
│   ├── shipping/              # NEW: Shipping providers
│   │   ├── shiprocket.ts
│   │   └── shipping.types.ts
│   ├── search/                # NEW: Search integration
│   │   ├── algolia.ts
│   │   └── indexing.ts
│   ├── notifications/         # NEW: Notification services
│   │   ├── email/
│   │   ├── sms/
│   │   ├── push/
│   │   └── notification.manager.ts
│   ├── analytics/             # NEW: Analytics tracking
│   │   ├── tracker.ts
│   │   └── aggregator.ts
│   ├── recommendations/       # NEW: Recommendation engine
│   ├── cache/                 # NEW: Caching strategies
│   └── jobs/                  # NEW: Background jobs
│
├── hooks/
│   ├── useCart.ts             # NEW
│   ├── useWishlist.ts         # NEW
│   ├── useCheckout.ts         # NEW
│   ├── useNotifications.ts    # NEW
│   └── useSearch.ts           # NEW
│
└── contexts/
    ├── CartContext.tsx        # NEW
    └── NotificationContext.tsx # NEW
```

---

## 🚀 Immediate Quick Wins

### 1. **Cart State Management** (2-3 days)

Implement client-side cart with local storage backup before full backend.

### 2. **Basic Product Search** (1 day)

Use Firestore array-contains for basic tag-based search.

### 3. **Email Notifications** (1-2 days)

Order confirmations using existing Resend integration.

### 4. **Admin Analytics Dashboard** (2 days)

Basic metrics using existing data (orders, products, users).

### 5. **Seller Product Management** (3 days)

CRUD interface for sellers to manage their products.

---

## 📊 Success Metrics

**Key Performance Indicators (KPIs)**:

1. Cart abandonment rate < 70%
2. Average order value > ₹1000
3. Checkout completion rate > 60%
4. Search conversion rate > 5%
5. Seller response time < 24 hours
6. Customer satisfaction > 4.5/5
7. API response time < 200ms
8. System uptime > 99.9%

---

## 🔒 Security Enhancements

1. **PCI DSS Compliance** (for payment data)
2. **GDPR/Data Protection** (user data handling)
3. **Rate Limiting** (prevent abuse)
4. **Input Sanitization** (XSS prevention)
5. **SQL/NoSQL Injection Prevention**
6. **Secure Session Management**
7. **API Key Rotation**
8. **Audit Logs** (admin actions)

---

## 📝 Next Steps

1. **Review & Prioritize**: Discuss priorities with team
2. **Technical Specifications**: Create detailed specs for Phase 1
3. **Database Design**: Finalize new schema designs
4. **API Contracts**: Define API endpoints and contracts
5. **Start Implementation**: Begin with Shopping Cart (highest impact)

---

**Document Owner**: System Architect  
**Last Review**: February 8, 2026  
**Next Review**: After Phase 1 completion
