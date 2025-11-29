# Pending Routes Documentation

## Overview

This document tracks page routes that were removed or commented out from navigation because they don't currently exist. These routes are candidates for future implementation.

**Last Updated**: November 2025  
**Related File**: `src/constants/routes.ts`

---

## Priority Legend

| Priority    | Description                                      |
| ----------- | ------------------------------------------------ |
| 🔴 HIGH     | Core functionality, should implement soon        |
| 🟡 MEDIUM   | Nice to have, implement when resources available |
| 🟢 LOW      | Future consideration, not blocking anything      |
| ⚪ DEFERRED | Will not implement, alternative exists           |

---

## User Routes (Authentication Required)

### `/user/notifications`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🔴 HIGH
- **Epic**: E016 - Notifications
- **Implemented**: Session 13 - Full API with pagination, mark as read, delete
- **Features**:
  - Notification list with type icons and colors
  - Mark as read (single/all)
  - Delete (single/read/all)
  - Pagination support

### `/user/returns`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E009 - Returns & Refunds
- **Implemented**: Session 15 - Full user returns page
- **Features**:
  - Returns list with status filtering
  - Return progress visualization
  - Link to related orders

### `/user/reviews`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🟢 LOW
- **Epic**: E007 - Review System
- **Implemented**: Session 16 - Full user reviews page
- **Features**:
  - Reviews list with filtering by status and rating
  - Edit and delete reviews
  - Review stats (total, approved, pending, avg rating)
  - Search functionality

---

## Seller Routes (Seller Role Required)

### `/seller/dashboard`

- **Status**: ⚪ DEFERRED
- **Priority**: ⚪ DEFERRED
- **Epic**: E006 - Shop Management
- **Reason Removed**: Route doesn't exist, `/seller` serves as dashboard
- **Alternative**: `/seller` (main seller page is the dashboard)
- **Implementation Notes**:
  - NOT NEEDED - `/seller` already functions as dashboard
  - Links updated to point to `/seller`

### `/seller/settings`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E006 - Shop Management
- **Implemented**: Session 15 - Full seller settings page
- **Features**:
  - Profile settings (business info)
  - Notification preferences
  - Payout settings (bank details)
  - Business information management

### `/seller/reviews`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E007 - Review System
- **Implemented**: Session 15 - Full seller reviews page
- **Features**:
  - Reviews list with filtering
  - Rating distribution chart
  - Respond to reviews
  - Stats (average rating, response rate)
- **Alternative**: `/reviews` (can filter by shop)
- **Implementation Notes**:
  - Should show reviews for seller's products
  - Include response capability

### `/seller/help`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🟢 LOW
- **Epic**: E010 - Support Tickets
- **Implemented**: Session 16 - Full seller help center
- **Features**:
  - FAQ categories with collapsible questions
  - Search functionality
  - Quick action cards (support ticket, guidelines, fees, policies)
  - Contact section with email and phone
  - Seller Academy promotion

### `/seller/support-tickets/create`

- **Status**: ⚪ DEFERRED
- **Priority**: ⚪ DEFERRED
- **Epic**: E010 - Support Tickets
- **Reason Removed**: Route doesn't exist as separate page
- **Alternative**: `/support/create`
- **Implementation Notes**:
  - NOT NEEDED - `/support/create` handles all ticket creation
  - Links updated to point to `/support/create`

---

## Admin Routes (Admin Role Required)

### `/admin/featured-sections`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E014 - Homepage CMS
- **Implemented**: Session 16 - Full featured sections management
- **Features**:
  - Drag-and-drop reordering
  - Add/remove items from featured sections
  - Section tabs (Products, Auctions, Shops, Categories)
  - Search and select items modal
  - Toggle item active/inactive

### `/admin/analytics`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🔴 HIGH
- **Epic**: E017 - Analytics & Reporting
- **Implemented**: Session 13 - Admin analytics dashboard
- **Features**:
  - Overview stats (revenue, orders, products, customers)
  - Period selector (day/week/month/year)
  - Sales trend chart
  - Top products table

### `/admin/analytics/sales`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🔴 HIGH
- **Epic**: E017 - Analytics & Reporting
- **Implemented**: Session 14 - Sales analytics page
- **Features**:
  - Revenue breakdown by category chart
  - Revenue by payment method breakdown
  - Detailed sales table with pagination
  - Period selector (day/week/month/year)
  - Export functionality

### `/admin/analytics/auctions`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E017 - Analytics & Reporting
- **Implemented**: Session 14 - Auction analytics page
- **Features**:
  - Auction performance metrics
  - Status distribution chart
  - Bidding activity by hour
  - Top performing auctions table
  - Category performance breakdown

### `/admin/analytics/users`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E017 - Analytics & Reporting
- **Implemented**: Session 14 - User analytics page
- **Features**:
  - User stats (total, new, active, churn rate)
  - User segment pie chart (buyers/sellers/admins)
  - Top customers table
  - Recent activity timeline

### `/admin/auctions/live`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E003 - Auction System
- **Implemented**: Session 16 - Full live auctions monitoring dashboard
- **Features**:
  - Real-time countdown timers
  - Auto-refresh every 30 seconds
  - Pause/End auction actions
  - Stats cards (live, bids, value, ending soon, scheduled)
  - Hot auction indicators
  - Quick links to scheduled, ended, and analytics

### `/admin/auctions/moderation`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🟢 LOW
- **Epic**: E003 - Auction System
- **Implemented**: Previously existing - Auction moderation queue
- **Features**:
  - Pending auctions list
  - Approve/Reject/Flag actions
  - Filter sidebar
  - Stats cards
  - Pagination

### `/admin/blog/categories`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🟢 LOW
- **Epic**: E020 - Blog System
- **Implemented**: Session 16 - Full blog category management
- **Features**:
  - Create/Edit/Delete categories
  - Nested category support (parent/child)
  - Post count per category
  - Search functionality
  - Stats cards

### `/admin/blog/tags`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🟢 LOW
- **Epic**: E020 - Blog System
- **Implemented**: Session 16 - Full blog tag management
- **Features**:
  - Create/Edit/Delete tags
  - Bulk add tags
  - Bulk delete selected
  - Post count per tag
  - Popular tags highlight
  - Search and filter

### `/admin/settings/general`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🔴 HIGH
- **Epic**: E021 - System Configuration
- **Implemented**: Session 14 - Full general settings page
- **Features**:
  - Basic info (site name, tagline, description, logos)
  - Contact information (emails, phone, address)
  - Social media links
  - Maintenance mode toggle with message

### `/admin/settings/payment`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🔴 HIGH
- **Epic**: E021 - System Configuration
- **Implemented**: Session 14 - Full payment settings page
- **Features**:
  - Razorpay configuration (key ID, secret, test mode)
  - PayU configuration (merchant key, salt, test mode)
  - COD settings (min/max order value)
  - Currency settings

### `/admin/settings/shipping`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E021 - System Configuration
- **Implemented**: Session 15 - Full shipping settings page
- **Features**:
  - Free shipping threshold
  - Standard/express shipping charges
  - Delivery estimates configuration
  - Restricted pincodes management

### `/admin/settings/email`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E021 - System Configuration
- **Implemented**: Session 15 - Full email settings page
- **Features**:
  - Provider selection (Resend, SMTP, SendGrid)
  - Sender configuration
  - SMTP settings
  - Email template toggles
  - Test email functionality

### `/admin/settings/notifications`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E021 - System Configuration
- **Implemented**: Session 15 - Full notification settings page
- **Features**:
  - Global notification toggle
  - Per-category settings (email, push, in-app)
  - Daily digest configuration
  - Quiet hours settings

---

## Authentication Routes (Public)

### `/forgot-password`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🔴 HIGH
- **Epic**: E001 - User Management
- **Implemented**: Session 13 - Full password reset flow
- **Features**:
  - Email input for reset request
  - Token-based password reset
  - Email sent via Resend API
  - Related: `/reset-password` page for setting new password

---

## Implementation Roadmap

### Immediate (HIGH Priority)

1. ~~`/forgot-password`~~ ✅ - Critical for user experience
2. ~~`/user/notifications`~~ ✅ - E016 epic
3. ~~`/admin/analytics`~~ ✅ - E017 epic
4. ~~`/admin/analytics/sales`~~ ✅ - E017 epic
5. ~~`/admin/settings/general`~~ ✅ - E021 epic
6. ~~`/admin/settings/payment`~~ ✅ - E021 epic

### Short-term (MEDIUM Priority)

1. `/seller/settings` - Consolidate seller preferences
2. `/seller/reviews` - Review management for sellers
3. `/admin/analytics/*` - Full analytics suite
4. `/admin/auctions/live` - Real-time auction monitoring

### Long-term (LOW Priority)

1. `/user/reviews` - User's reviews page
2. `/seller/help` - Seller help center
3. `/admin/blog/categories` - Blog category management
4. `/admin/blog/tags` - Blog tag management
5. `/admin/auctions/moderation` - Moderation queue

### Not Needed (DEFERRED)

1. `/seller/dashboard` - Use `/seller` instead
2. `/seller/support-tickets/create` - Use `/support/create`

---

## Related Documentation

- **Route Constants**: `src/constants/routes.ts`
- **Navigation Constants**: `src/constants/navigation.ts`
- **API Routes**: `src/constants/api-routes.ts`
- **Epic E016**: `TDD/epics/E016-notifications.md`
- **Epic E017**: `TDD/epics/E017-analytics-reporting.md`
- **Epic E021**: `TDD/epics/E021-system-configuration.md`

---

## New Routes (E026-E034)

### `/user/riplimit`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🔴 HIGH
- **Epic**: E028 - RipLimit Bidding Currency
- **Implemented**: Session 13 - Full user dashboard
- **Features**:
  - Balance display with refresh
  - Transaction history with tabs (all/purchases/usage/refunds)
  - Purchase modal with Razorpay integration
  - Pending transactions view

### `/admin/riplimit`

- **Status**: ✅ IMPLEMENTED
- **Priority**: 🔴 HIGH
- **Epic**: E028 - RipLimit Bidding Currency
- **Implemented**: Session 13 - Full admin dashboard
- **Features**:
  - System stats cards (circulation, revenue, blocked)
  - User list with search and filters
  - Balance adjustment modal
  - Pagination for user management

### API Routes for New Epics

```
# E026 - Sieve Pagination
All existing list APIs will be updated to support:
?page=1&pageSize=20&sorts=-createdAt&filters=status==published

# E028 - RipLimit
GET    /api/riplimit/balance           # User balance
GET    /api/riplimit/transactions      # Transaction history
POST   /api/riplimit/purchase          # Initiate purchase
POST   /api/riplimit/purchase/verify   # Verify payment
POST   /api/riplimit/refund            # Request refund
GET    /api/admin/riplimit/stats       # Admin dashboard
POST   /api/admin/riplimit/users/:id/adjust  # Adjust balance

# E029 - Smart Address
GET    /api/location/pincode/:pincode  # Pincode lookup
GET    /api/location/geocode           # Reverse geocode
GET    /api/location/autocomplete      # Address autocomplete

# E033 - Live Header
GET    /api/header/stats               # Cart, notifications, RipLimit counts
```
