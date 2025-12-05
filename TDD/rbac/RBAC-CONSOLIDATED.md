# Role-Based Access Control (RBAC) - Consolidated

> **Last Updated**: December 6, 2025  
> **Purpose**: Complete RBAC system documentation with Phase 1 backend implementations  
> **Related**: E039 Backend Infrastructure, API Implementation Roadmap

---

## 📋 Overview

JustForView.in implements a 4-tier role system with granular permissions:

| Role       | Permission Level | Access Scope                        |
| ---------- | ---------------- | ----------------------------------- |
| **Admin**  | 100              | Full platform access, all resources |
| **Seller** | 50               | Own shop management, shop resources |
| **User**   | 10               | Public resources, own data          |
| **Guest**  | 0                | Public browsing only (read-only)    |

---

## 🎯 Permission Matrix

### Core Features by Role

| Feature                 | Admin              | Seller             | User                | Guest   |
| ----------------------- | ------------------ | ------------------ | ------------------- | ------- |
| **User Management**     | ✅ All users       | ✅ Own account     | ✅ Own account      | ❌      |
| **Shop Management**     | ✅ All shops       | ✅ Own shop        | ❌                  | ❌      |
| **Product Management**  | ✅ All products    | ✅ Own products    | ❌                  | ❌      |
| **Auction Management**  | ✅ All auctions    | ✅ Own auctions    | ✅ Participate      | 👁️ View |
| **Order Management**    | ✅ All orders      | ✅ Shop orders     | ✅ Own orders       | ❌      |
| **Payment Processing**  | ✅ All payments    | ❌                 | ✅ Own payments     | ❌      |
| **Payout Processing**   | ✅ All payouts     | ✅ Request payouts | ❌                  | ❌      |
| **Category Management** | ✅ Full CRUD       | ❌                 | ❌                  | ❌      |
| **Homepage CMS**        | ✅ Full control    | ❌                 | ❌                  | ❌      |
| **Review System**       | ✅ Moderate all    | ✅ Reply (own)     | ✅ Write/edit own   | 👁️ View |
| **Support Tickets**     | ✅ All tickets     | ✅ Shop tickets    | ✅ Own tickets      | ❌      |
| **Returns**             | ✅ All returns     | ✅ Shop returns    | ✅ Request          | ❌      |
| **Messaging**           | ✅ View all        | ✅ Shop messages   | ✅ Own messages     | ❌      |
| **Analytics**           | ✅ Platform-wide   | ✅ Shop analytics  | ✅ Own activity     | ❌      |
| **Settings**            | ✅ System settings | ✅ Shop settings   | ✅ Profile settings | ❌      |
| **Blog Management**     | ✅ Full CRUD       | ❌                 | ❌                  | ❌      |
| **Media Management**    | ✅ All media       | ✅ Shop media      | ✅ Own media        | ❌      |

### Phase 1 Backend Features by Role

| Feature                    | Admin                  | Seller            | User               | Guest |
| -------------------------- | ---------------------- | ----------------- | ------------------ | ----- |
| **Payment Gateway Config** | ✅ Configure           | ❌                | ❌                 | ❌    |
| **Payment Webhooks**       | ✅ View logs           | ❌                | ❌                 | ❌    |
| **Address APIs**           | ✅ All addresses       | ❌                | ✅ Own addresses   | ❌    |
| **Shipping Automation**    | ✅ All shipments       | ✅ Shop shipments | ✅ Own shipments   | ❌    |
| **WhatsApp Notifications** | ✅ Configure/test      | ✅ Shop templates | ✅ Receive         | ❌    |
| **Email System**           | ✅ Configure/templates | ✅ Shop emails    | ✅ Receive         | ❌    |
| **Newsletter Management**  | ✅ Full control        | ❌                | ✅ Subscribe/unsub | ❌    |

---

## 👨‍💼 Admin Role (Permission: 100)

### Dashboard Access

```
/admin/dashboard          Platform overview & analytics
/admin/users              User management (all roles)
/admin/products           All products (all shops)
/admin/auctions           All auctions (all shops)
/admin/orders             All orders (all shops)
/admin/shops              Shop management & verification
/admin/categories         Category tree management
/admin/coupons            All coupons (platform & shop)
/admin/reviews            Review moderation
/admin/tickets            All support tickets
/admin/returns            All return requests
/admin/payments           Payment management & refunds
/admin/payouts            Payout processing
/admin/hero-slides        Homepage hero carousel
/admin/homepage           Homepage sections & content
/admin/static-assets      Asset management
/admin/blog               Blog post management
/admin/blog/categories    Blog category management
/admin/blog/tags          Blog tag management
/admin/settings           System settings
/admin/settings/general   Site name, logo, contact
/admin/settings/payment   Payment gateway configuration
/admin/settings/shipping  Shipping zones & carriers
/admin/settings/email     SMTP & email templates
/admin/settings/notifications  Notification preferences
/admin/settings/features  Feature flags
/admin/messages           All conversations (moderation)
/admin/demo               Demo data generation
```

### Exclusive Admin Actions

#### User Management

- ✅ List all users (any role, any status)
- ✅ View any user's full details
- ✅ Ban/unban users
- ✅ Change user roles (user ↔ seller ↔ admin)
- ✅ Bulk user operations (ban, role change, delete)
- ✅ Verify user email manually

#### Shop Management

- ✅ Verify/unverify shops
- ✅ Suspend/unsuspend shops
- ✅ Delete shops (with cascading)
- ✅ Override shop settings
- ✅ View shop analytics (all shops)

#### Product/Auction Management

- ✅ View all products (any status, any shop)
- ✅ Feature/unfeature products
- ✅ Delete any product
- ✅ Feature auctions on homepage
- ✅ Cancel auctions with bids (override)
- ✅ Bulk product operations

#### Order Management

- ✅ View all orders across all shops
- ✅ Override order status
- ✅ Process manual refunds
- ✅ Bulk order operations (status, export)
- ✅ Cancel orders (override seller)

#### Financial

- ✅ View all payments (platform-wide)
- ✅ Process refunds (full/partial)
- ✅ Process payouts to sellers
- ✅ View platform revenue analytics
- ✅ Configure payment gateways (Razorpay, PayU, Cashfree, Stripe, PayPal, PhonePe)

#### Content Management

- ✅ Manage categories (full CRUD)
- ✅ Configure similar category relations
- ✅ Manage hero slides with route fixes
- ✅ Configure homepage sections (featured, trending, etc.)
- ✅ Manage tabbed navigation on homepage
- ✅ Manage blog posts, categories, tags
- ✅ Upload static assets
- ✅ Advanced media uploads (crop, rotate, focus point)
- ✅ Video thumbnail generation

#### System Configuration

- ✅ Update site settings (name, logo, contact)
- ✅ Configure payment gateways
- ✅ Configure shipping zones and carriers
- ✅ Configure SMTP and email templates
- ✅ Toggle feature flags
- ✅ Enable/disable maintenance mode
- ✅ Configure supported languages (i18n - planned)
- ✅ Manage translations (i18n - planned)

#### Messaging & Moderation

- ✅ View all conversations (user ↔ seller)
- ✅ Reply as platform support
- ✅ Moderate messages (flag/delete)
- ✅ Approve/reject reviews
- ✅ Handle escalated tickets
- ✅ Handle escalated returns
- ✅ Add internal notes to tickets

#### Phase 1 Backend Infrastructure (NEW)

##### Payment Gateway Configuration

- ✅ Configure 6 payment providers (API keys, secrets)
- ✅ Test payment gateway connections
- ✅ View webhook logs (all providers)
- ✅ Manual webhook retry
- ✅ Payment failure analytics

##### Email System Management

- ✅ Manage email templates (CRUD)
- ✅ Configure SMTP settings (Resend/SendGrid)
- ✅ Test email delivery
- ✅ View email logs and webhooks
- ✅ Configure newsletter campaigns
- ✅ Schedule newsletters (weekly/monthly)
- ✅ View email analytics (open rate, click rate)

##### Shipping Management

- ✅ Configure Shiprocket API
- ✅ View all shipments (all shops)
- ✅ Manual pickup scheduling
- ✅ Shipping webhook logs
- ✅ Shipping analytics (delivery rates)

##### WhatsApp Management

- ✅ Configure WhatsApp providers (Twilio/Gupshup)
- ✅ Manage message templates
- ✅ Test WhatsApp delivery
- ✅ View WhatsApp logs
- ✅ WhatsApp analytics (delivery rates)

##### Address Management

- ✅ View all user addresses (for support)
- ✅ Manual address verification override

### API Access Pattern

```typescript
// Admin has unrestricted access to all resources
async function checkAdminAccess(user: User, resource: any): Promise<boolean> {
  if (user.role === "admin") {
    return true; // Full access to all resources
  }
  return false;
}

// Example: Admin can access any order
GET /api/admin/orders?status=pending
// Returns all pending orders across all shops

// Example: Admin can refund any payment
POST /api/admin/payments/:id/refund
{
  "amount": 50000,
  "reason": "Customer request"
}
```

### Test Scenarios

- [x] Admin can view users of all roles
- [x] Admin can ban/unban any user
- [x] Admin can change any user's role
- [x] Admin can view all orders across shops
- [x] Admin can process refunds
- [x] Admin can verify/unverify shops
- [x] Admin can manage categories
- [x] Admin can manage homepage content
- [x] Admin can create/edit/delete blog posts
- [x] Admin can manage blog categories and tags
- [x] Admin can update system settings
- [x] Admin can configure payment gateways
- [x] Admin can enable maintenance mode
- [x] Admin can toggle feature flags
- [x] Admin can view all messages
- [x] Admin can reply to any conversation
- [ ] Admin can configure WhatsApp templates
- [ ] Admin can manage email templates
- [ ] Admin can schedule newsletters
- [ ] Admin can view shipping analytics

### Mobile Feature Access (E025)

#### Mobile Navigation

- ✅ MobileAdminSidebar for navigation
- ✅ Hamburger menu in header
- ✅ All admin sections accessible
- ✅ Collapsible section groups

#### Mobile Dashboard

- ✅ Dashboard stat cards responsive (2x2 grid)
- ✅ Pull-to-refresh on dashboard
- ✅ Charts mobile-optimized
- ✅ Quick access tiles touch-friendly

#### Mobile User Management

- ✅ Users list as MobileDataTable cards
- ✅ User search via MobileFormInput
- ✅ Swipe actions (Ban, Edit, View)
- ✅ Role change via MobileActionSheet
- ✅ Bulk select with touch checkboxes
- ✅ Bulk actions via MobileActionSheet

#### Mobile Product/Order Management

- ✅ All products as MobileDataTable cards
- ✅ Filters via MobileBottomSheet
- ✅ Swipe to feature/unfeature
- ✅ All orders as MobileDataTable cards
- ✅ Refund processing via MobileBottomSheet

#### Mobile Content Management

- ✅ Hero slides list as cards
- ✅ Hero slide form mobile-optimized
- ✅ Category tree mobile-optimized
- ✅ Touch drag-to-reorder

---

## 🏪 Seller Role (Permission: 50)

### Dashboard Access

```
/seller/dashboard         Shop overview & analytics
/seller/products          Own products management
/seller/auctions          Own auctions management
/seller/orders            Shop orders (own shop)
/seller/returns           Shop returns (own shop)
/seller/coupons           Shop coupons (own shop)
/seller/revenue           Revenue tracking & payouts
/seller/analytics         Shop analytics
/seller/my-shops          Shop profile management
/seller/messages          Buyer messages
/seller/messages/:id      Conversation view
```

### Seller Actions

#### Shop Management

- ✅ Create shop (if don't have one)
- ✅ Update own shop profile
- ✅ Upload shop logo/banner
- ✅ Configure shop settings
- ✅ View shop analytics

#### Product Management

- ✅ Create products for own shop
- ✅ Update own products (all fields)
- ✅ Delete own draft/archived products
- ✅ Bulk operations on own products
- ✅ Upload product media (images/videos)
- ✅ Change product status (draft/published/archived)
- ❌ Cannot delete published products (admin only)
- ❌ Cannot feature products (admin only)

#### Auction Management

- ✅ Create auctions from own products
- ✅ Update own auctions (before bids)
- ✅ Cancel own auctions (without bids)
- ✅ End auctions early (with bids, with penalty)
- ✅ View bids on own auctions
- ❌ Cannot cancel auctions with bids (admin only)

#### Order Management

- ✅ View orders for own shop
- ✅ Update order status (processing → shipped → delivered)
- ✅ Add tracking information
- ✅ Mark as shipped/delivered
- ✅ Bulk order operations (own shop)
- ❌ Cannot process refunds (admin only)
- ❌ Cannot cancel orders after payment (admin only)

#### Coupon Management

- ✅ Create coupons for own shop
- ✅ Update own coupons
- ✅ Delete own coupons
- ✅ View coupon usage analytics

#### Return Handling

- ✅ View returns for own shop
- ✅ Approve/reject returns (within 24h)
- ✅ Escalate to admin (for disputes)
- ❌ Cannot process refunds (admin only)

#### Support

- ✅ View tickets related to shop
- ✅ Reply to shop tickets
- ✅ Create tickets (as user, for own issues)
- ❌ Cannot view all tickets

#### Messaging

- ✅ View buyer messages for own shop
- ✅ Reply to buyer inquiries
- ✅ View order-related messages
- ✅ Attach images to responses
- ✅ Track response time
- ❌ Cannot view other sellers' messages

#### Financial

- ✅ View revenue/earnings (own shop)
- ✅ Request payouts (minimum threshold)
- ✅ View payout history
- ❌ Cannot process refunds
- ❌ Cannot view platform revenue

#### Phase 1 Backend Features (NEW)

##### Shipping Integration

- ✅ Schedule pickups for own orders
- ✅ Generate shipping labels (Shiprocket)
- ✅ View shipping status (own orders)
- ✅ Receive shipping notifications (WhatsApp/Email)

##### WhatsApp Notifications (Receive)

- ✅ Order placed notifications
- ✅ Pickup scheduled confirmations
- ✅ Payout processed notifications
- ❌ Cannot configure templates (admin only)

##### Email Notifications (Receive)

- ✅ New order emails
- ✅ Return request emails
- ✅ Payout confirmation emails
- ❌ Cannot configure templates (admin only)

### Seller Cannot

- ❌ View other sellers' data (products, orders, analytics)
- ❌ Manage categories
- ❌ Manage homepage content
- ❌ Process refunds (admin only)
- ❌ Verify shops
- ❌ Ban users
- ❌ Access admin dashboard
- ❌ Configure system settings
- ❌ Configure payment gateways
- ❌ Configure shipping providers
- ❌ Configure email templates
- ❌ Schedule newsletters

### API Access Pattern

```typescript
// Seller can only access own shop resources
async function checkSellerAccess(user: User, resource: any): Promise<boolean> {
  if (user.role === "seller") {
    // Check ownership via shopId
    if (resource.shopId === user.shopId) {
      return true;
    }
    // Check if public resource (for viewing)
    if (resource.status === "published" || resource.status === "active") {
      return true; // Can view public resources
    }
    return false;
  }
  return false;
}

// Example: Seller can only see own products
GET /api/seller/products
// Automatically filters by user.shopId

// Example: Seller cannot access other shops
GET /api/products?shopId=other_shop_id
// Returns 403 Forbidden if shopId !== user.shopId
```

### Test Scenarios

- [x] Seller can only see own products
- [x] Seller can only see orders for own shop
- [x] Seller cannot access admin routes
- [x] Seller can create coupons for own shop only
- [x] Seller can reply to reviews on own products
- [x] Seller can process returns for own shop
- [x] Seller can request payouts
- [x] Seller can view messages from buyers
- [x] Seller can reply to buyer messages
- [x] Seller cannot view other sellers' messages
- [x] Seller can see which products are favorited
- [ ] Seller can schedule pickups via Shiprocket
- [ ] Seller receives WhatsApp notifications for orders
- [ ] Seller receives email notifications for returns

### Mobile Feature Access (E025)

#### Mobile Navigation

- ✅ MobileSellerSidebar for navigation
- ✅ Hamburger menu in header
- ✅ Collapsible seller sections
- ✅ MobileQuickActions FAB (Add Product, View Orders, etc.)

#### Mobile Product Management

- ✅ Product list as MobileDataTable cards
- ✅ Product swipe actions (Edit, Delete, Status)
- ✅ Product create wizard mobile-optimized
- ✅ Camera capture for product photos
- ✅ Image editor with touch gestures

#### Mobile Order Management

- ✅ Orders as MobileDataTable cards
- ✅ Swipe right to accept orders
- ✅ Order status via MobileActionSheet
- ✅ Tracking info via MobileFormInput

#### Mobile Media Upload

- ✅ MediaUploader touch-friendly
- ✅ CameraCapture fullscreen mode
- ✅ ImageEditor touch crop/rotate
- ✅ MediaGallery touch reorder

---

## 👤 User Role (Permission: 10)

### Page Access

```
/                         Homepage
/products                 Browse products
/auctions                 Browse auctions
/shops                    Browse shops
/categories               Browse categories
/blog                     Read blog posts
/blog/:slug               Read single post
/search                   Search products/auctions
/cart                     Shopping cart
/checkout                 Checkout flow
/user/profile             Profile management
/user/addresses           Address management
/user/orders              Order history
/user/favorites           Favorite products
/user/watchlist           Auction watchlist
/user/bids                My bids
/user/won-auctions        Won auctions
/user/messages            Messages inbox
/user/messages/:id        Conversation view
/user/tickets             Support tickets
/user/settings            User settings
/user/notifications       Notification preferences
/user/riplimit            RipLimit balance (E028)
```

### User Actions

#### Account Management

- ✅ Register new account
- ✅ Login/logout
- ✅ Update profile (name, email, phone, avatar)
- ✅ Change password
- ✅ Manage addresses (CRUD)
- ✅ Set notification preferences (email, WhatsApp, push)
- ✅ Switch language (i18n - planned)

#### Shopping

- ✅ Browse products (published only)
- ✅ Add to cart
- ✅ Update cart quantity
- ✅ Apply coupons
- ✅ Checkout and pay (UPI, Card, COD, etc.)
- ✅ View order history
- ✅ Cancel pending orders (before processing)
- ❌ Cannot cancel shipped orders

#### Auctions

- ✅ View active auctions
- ✅ Place bids
- ✅ Set auto-bid (max amount, increment)
- ✅ Add to watchlist
- ✅ View my bids
- ✅ Complete won auction purchase
- ❌ Cannot cancel bids after placement

#### Reviews

- ✅ Write reviews (verified purchase only)
- ✅ Edit own reviews (within 24h)
- ✅ Delete own reviews
- ✅ Vote helpful on reviews
- ❌ Cannot moderate reviews

#### Support

- ✅ Create support tickets
- ✅ Reply to own tickets
- ✅ Close own tickets
- ✅ Request returns (with evidence)
- ❌ Cannot view other users' tickets

#### Product Discovery

- ✅ View recently viewed products (auto-tracked)
- ✅ Add products to comparison (max 4)
- ✅ Compare products side-by-side
- ✅ View comparison highlights
- ✅ Remove from comparison
- ✅ Clear viewing history

#### Favorites

- ✅ Add products to favorites
- ✅ Remove from favorites
- ✅ Add auctions to watchlist
- ✅ Enable price drop notifications
- ✅ Enable back-in-stock notifications
- ✅ Sync favorites on login

#### Messaging

- ✅ Send messages to sellers
- ✅ View conversation history
- ✅ Reply to messages
- ✅ Archive conversations
- ✅ Attach images to messages
- ✅ Receive message notifications

#### Shops

- ✅ Follow shops
- ✅ View shop products
- ✅ View shop analytics (public)

#### Phase 1 Backend Features (NEW)

##### Address Management (Enhanced)

- ✅ Add addresses with Google Places autocomplete
- ✅ Set default address for shipping/billing
- ✅ Validate Indian addresses (Pincode API)
- ✅ Save multiple addresses

##### Notifications (Receive)

- ✅ Order status updates (WhatsApp/Email)
- ✅ Shipment tracking updates (WhatsApp/Email)
- ✅ Auction outbid alerts (WhatsApp/Email)
- ✅ Auction won notifications (WhatsApp/Email)
- ✅ Newsletter subscriptions (Email)
- ✅ Manage notification preferences per channel

##### Payments

- ✅ Pay via 6 payment gateways (UPI, Card, Wallet, etc.)
- ✅ View payment history
- ✅ Request refunds (via returns)

### User Cannot

- ❌ Create products/auctions
- ❌ Manage any shop
- ❌ Process orders
- ❌ Access seller dashboard
- ❌ Access admin dashboard
- ❌ View other users' data (orders, addresses, etc.)
- ❌ Moderate content
- ❌ Configure system settings
- ❌ Process refunds directly
- ❌ Configure notifications (only preferences)

### API Access Pattern

```typescript
// User can only access own resources
async function checkUserAccess(user: User, resource: any): Promise<boolean> {
  if (user.role === "user") {
    // Check ownership via userId
    if (resource.userId === user.uid) {
      return true;
    }
    // Check if public resource
    if (resource.status === "published" || resource.status === "active") {
      return true; // Can view public resources
    }
    return false;
  }
  return false;
}

// Example: User can only see own orders
GET /api/orders
// Automatically filters by userId === user.uid

// Example: User cannot access other users' addresses
GET /api/users/:userId/addresses
// Returns 403 Forbidden if userId !== user.uid
```

### Test Scenarios

- [x] User can register and login
- [x] User can update own profile only
- [x] User can manage own addresses
- [x] User can add to cart and checkout
- [x] User can place bids on auctions
- [x] User can write reviews after purchase
- [x] User can create support tickets
- [x] User can add/remove favorites
- [x] User can enable favorite notifications
- [x] User can send messages to sellers
- [x] User can view own conversations only
- [x] User can read blog posts
- [x] User cannot access seller/admin routes
- [ ] User receives WhatsApp notifications for orders
- [ ] User receives email newsletters
- [ ] User can manage notification preferences

### Mobile Feature Access (E025)

#### Mobile Navigation

- ✅ Bottom navigation visible on mobile
- ✅ Mobile sidebar for account navigation
- ✅ Pull-to-refresh on all data pages
- ✅ Swipe actions on cart items, addresses, favorites

#### Mobile Forms

- ✅ MobileFormInput on all user forms
- ✅ MobileFormSelect for dropdowns
- ✅ MobileBottomSheet for address form
- ✅ Touch-friendly input sizes (48px+)

#### Mobile Shopping

- ✅ ProductGallery swipe/zoom
- ✅ Product filters via MobileBottomSheet
- ✅ Cart swipe-to-delete
- ✅ Checkout in mobile-optimized flow

#### Mobile Auctions

- ✅ Auction bid via MobileBottomSheet
- ✅ Auto-bid setup in bottom sheet
- ✅ Watchlist swipe actions

#### Mobile User Dashboard

- ✅ Orders as MobileDataTable cards
- ✅ Bids as MobileDataTable cards
- ✅ Addresses with swipe actions
- ✅ Favorites with swipe actions

---

## 👁️ Guest Role (Permission: 0)

### Page Access (Read-Only)

```
/                         Homepage (view only)
/products                 Browse products (view only)
/auctions                 Browse auctions (view only)
/shops                    Browse shops (view only)
/categories               Browse categories (view only)
/blog                     Read blog posts (view only)
/blog/:slug               Read single post (view only)
/search                   Search (view only)
/login                    Login page
/register                 Registration page
```

### Guest Actions

#### Browsing

- ✅ View homepage
- ✅ Browse products (published only)
- ✅ Browse auctions (active only)
- ✅ Browse shops (verified only)
- ✅ Browse categories
- ✅ Read blog posts
- ✅ Search products/auctions/shops
- ✅ View product details
- ✅ View auction details (cannot bid)
- ✅ View shop profiles

#### Account

- ✅ Register for new account
- ✅ Login to existing account

### Guest Cannot

- ❌ Add to cart (redirected to login)
- ❌ Place bids (redirected to login)
- ❌ Add favorites (redirected to login)
- ❌ Write reviews (redirected to login)
- ❌ Send messages (redirected to login)
- ❌ Create tickets (redirected to login)
- ❌ Checkout (redirected to login)
- ❌ View any user-specific data
- ❌ Access any dashboard

### API Access Pattern

```typescript
// Guest has read-only access to public resources
async function checkGuestAccess(resource: any): Promise<boolean> {
  // Only allow published/active resources
  if (resource.status === "published" || resource.status === "active") {
    return true; // Read-only access
  }
  return false;
}

// Example: Guest can view products
GET /api/products?status=published
// Returns published products only

// Example: Guest cannot add to cart
POST /api/cart
// Returns 401 Unauthorized
```

### Test Scenarios

- [x] Guest can view homepage
- [x] Guest can browse products
- [x] Guest can browse auctions (view only)
- [x] Guest can view shops
- [x] Guest can read blog posts
- [x] Guest can search
- [x] Guest cannot add to cart (redirected)
- [x] Guest cannot place bids (redirected)
- [x] Guest cannot write reviews (redirected)
- [x] Guest cannot access any dashboard
- [x] Guest can register for account
- [x] Guest can login to existing account

---

## 🔒 Permission Enforcement

### Frontend Enforcement

```typescript
// Check role-based access in components
import { useAuth } from "@/contexts/AuthContext";

function AdminOnlyComponent() {
  const { user, isAdmin } = useAuth();

  if (!isAdmin) {
    return <Redirect to="/404" />;
  }

  return <AdminDashboard />;
}

// Check specific permissions
function FeatureComponent() {
  const { hasPermission } = useAuth();

  if (!hasPermission("manage_products")) {
    return null;
  }

  return <ProductManager />;
}
```

### Backend Enforcement (API Routes)

```typescript
// API route with role check
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Authenticate user
  const { user, error } = await getAuthFromRequest(req);

  if (error || !user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check admin role
  if (user.role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }

  // Proceed with admin-only logic
  // ...
}
```

### Firestore Security Rules

```javascript
// firestore.rules - Role-based access
match /users/{userId} {
  // Users can read/write own profile
  allow read: if request.auth.uid == userId;
  allow write: if request.auth.uid == userId;

  // Admins can read/write any profile
  allow read, write: if isAdmin();
}

match /products/{productId} {
  // Anyone can read published products
  allow read: if resource.data.status == 'published';

  // Sellers can write own products
  allow write: if isSeller() && request.auth.token.shopId == resource.data.shopId;

  // Admins can write any product
  allow write: if isAdmin();
}

function isAdmin() {
  return request.auth != null &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

function isSeller() {
  return request.auth != null &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'seller';
}
```

---

## 📊 Permission Testing Matrix

### Test Coverage by Role

| Test Category            | Admin | Seller | User | Guest |
| ------------------------ | ----- | ------ | ---- | ----- |
| **Authentication**       | ✅    | ✅     | ✅   | ✅    |
| **Dashboard Access**     | ✅    | ✅     | ✅   | ❌    |
| **Product CRUD**         | ✅    | ✅     | ❌   | ❌    |
| **Order Management**     | ✅    | ✅     | ✅   | ❌    |
| **Payment Processing**   | ✅    | ❌     | ✅   | ❌    |
| **Content Moderation**   | ✅    | ❌     | ❌   | ❌    |
| **System Configuration** | ✅    | ❌     | ❌   | ❌    |
| **Phase 1 Backend**      | ✅    | ⚠️     | ⚠️   | ❌    |

**Legend:**

- ✅ Fully tested
- ⚠️ Partially tested (receive notifications only)
- ❌ No access / Not applicable

---

## 🚀 Phase 1 Backend RBAC Implementation

### Payment Gateway Configuration (Admin Only)

**API Routes:**

- `POST /api/admin/settings/payment-gateways` - Configure gateway
- `GET /api/admin/settings/payment-gateways` - List gateways
- `PUT /api/admin/settings/payment-gateways/:id` - Update gateway
- `DELETE /api/admin/settings/payment-gateways/:id` - Delete gateway
- `POST /api/admin/settings/payment-gateways/:id/test` - Test connection

**Gateways Supported:**

1. Razorpay (India)
2. PayU (India)
3. Cashfree (India)
4. Stripe (International)
5. PayPal (International)
6. PhonePe (India)

### Payment Webhooks (Admin View Only)

**Firebase Functions:**

- `handleRazorpayWebhook` - Razorpay events
- `handlePayuWebhook` - PayU events
- `handleCashfreeWebhook` - Cashfree events
- `handleStripeWebhook` - Stripe events
- `handlePaypalWebhook` - PayPal events
- `handlePhonepeWebhook` - PhonePe events

**Admin Access:**

- View webhook logs: `GET /api/admin/webhooks/payments`
- Retry failed webhooks: `POST /api/admin/webhooks/payments/:id/retry`

### Address Management APIs

**User Access:**

- `GET /api/addresses` - List own addresses
- `POST /api/addresses` - Create address
- `PUT /api/addresses/:id` - Update own address
- `DELETE /api/addresses/:id` - Delete own address
- `POST /api/addresses/:id/set-default` - Set default

**Admin Access:**

- `GET /api/admin/addresses` - List all addresses (for support)
- `POST /api/admin/addresses/:id/verify` - Manual verification

### Shipping Automation

**Seller Access:**

- `POST /api/seller/shipments/schedule-pickup` - Schedule pickup
- `GET /api/seller/shipments` - View own shipments

**Admin Access:**

- `GET /api/admin/shipments` - View all shipments
- `POST /api/admin/shipments/:id/cancel` - Cancel shipment

**Firebase Functions (Auto-triggered):**

- `schedulePickup` - Auto-schedule for shipped orders
- `trackShipment` - Update tracking info
- `handleShippingWebhook` - Shiprocket events

### WhatsApp Notifications

**User/Seller Access (Receive Only):**

- Users receive: Order updates, auction notifications
- Sellers receive: New orders, pickups, payouts

**Admin Access:**

- `GET /api/admin/settings/whatsapp` - Configure providers
- `POST /api/admin/settings/whatsapp/templates` - Manage templates
- `POST /api/admin/settings/whatsapp/test` - Test delivery
- `GET /api/admin/whatsapp-logs` - View delivery logs

**Firebase Functions:**

- `sendOrderWhatsAppNotification` - Order updates
- `sendShipmentWhatsAppNotification` - Shipping updates
- `sendAuctionWhatsAppNotification` - Auction alerts

### Email System

**User/Seller Access (Receive Only):**

- Users: Order confirmations, shipping updates, newsletters
- Sellers: New orders, return requests, payouts

**User Preferences:**

- `PUT /api/user/email-preferences` - Subscribe/unsubscribe
- Marketing emails opt-in/opt-out
- Transactional emails (always enabled)

**Admin Access:**

- `GET /api/admin/email/templates` - List templates
- `POST /api/admin/email/templates` - Create template
- `PUT /api/admin/email/templates/:id` - Update template
- `DELETE /api/admin/email/templates/:id` - Delete template
- `GET /api/admin/email/inbox` - View test inbox
- `POST /api/admin/email/webhook` - Webhook handler
- `GET /api/admin/email/logs` - View email logs

**Firebase Functions:**

- `sendOrderEmail` - Order confirmations
- `sendShipmentEmail` - Tracking updates
- `sendReturnEmail` - Return confirmations
- `sendPayoutEmail` - Payout notifications
- `sendWeeklyNewsletter` - Scheduled weekly (Monday 10 AM IST)
- `sendMonthlyNewsletter` - Scheduled monthly (1st, 10 AM IST)

---

## 📝 RBAC Checklist for New Features

When implementing new features, ensure RBAC is enforced:

- [ ] Define which roles can access the feature
- [ ] Add role checks in API routes (`getAuthFromRequest`)
- [ ] Add role checks in frontend components (`useAuth`)
- [ ] Update Firestore security rules if needed
- [ ] Add permission tests for each role
- [ ] Document in RBAC files
- [ ] Update API specs with role requirements
- [ ] Test with all role types (admin, seller, user, guest)
- [ ] Verify 401/403 responses for unauthorized access
- [ ] Test mobile access if applicable

---

## 🔗 Related Documentation

- **[E039: Phase 1 Backend Infrastructure](/TDD/epics/E039-phase1-backend-infrastructure.md)** - Complete backend implementation
- **[API Implementation Roadmap](/TDD/resources/api-implementation-roadmap.md)** - API endpoint tracking
- **[AI Agent Development Guide](/TDD/AI-AGENT-GUIDE.md)** - Architecture patterns
- **[Acceptance Criteria](/TDD/acceptance/ACCEPTANCE-CRITERIA.md)** - Feature testing

---

_Last updated: December 6, 2025 - Phase 1 Backend Infrastructure complete_
