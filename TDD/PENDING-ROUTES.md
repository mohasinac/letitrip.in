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

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E009 - Returns & Refunds
- **Reason Removed**: No dedicated page, tracked in orders
- **Alternative**: `/user/orders` (return requests visible there)
- **Implementation Notes**:
  - Could be a filtered view of orders with return status
  - Consider creating as a tab or filter in orders page

### `/user/reviews`

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🟢 LOW
- **Epic**: E007 - Review System
- **Reason Removed**: No dedicated "my reviews" page
- **Alternative**: `/reviews` (public reviews page)
- **Implementation Notes**:
  - Low priority - users can see reviews on products
  - Consider adding as tab in user profile

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

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E006 - Shop Management
- **Reason Removed**: No dedicated seller settings page
- **Alternative**: `/seller/my-shops/{slug}/edit` (shop-specific settings)
- **Implementation Notes**:
  - Could consolidate shop settings into one page
  - Consider: notification preferences, payout settings, etc.

### `/seller/reviews`

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E007 - Review System
- **Reason Removed**: No seller reviews management page
- **Alternative**: `/reviews` (can filter by shop)
- **Implementation Notes**:
  - Should show reviews for seller's products
  - Include response capability

### `/seller/help`

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🟢 LOW
- **Epic**: E010 - Support Tickets
- **Reason Removed**: No seller help center
- **Alternative**: `/faq`, `/support/ticket`
- **Implementation Notes**:
  - Low priority - can use general FAQ/support
  - Consider seller-specific FAQ section

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

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E014 - Homepage CMS
- **Reason Removed**: No dedicated featured sections page
- **Alternative**: `/admin/homepage`
- **Implementation Notes**:
  - Featured sections management in homepage
  - Could be a separate page or tab

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

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🔴 HIGH
- **Epic**: E017 - Analytics & Reporting
- **Reason Removed**: Part of analytics not implemented
- **Alternative**: None
- **Implementation Notes**:
  - Sales breakdown, revenue charts, top products
  - Part of E017 implementation

### `/admin/analytics/auctions`

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E017 - Analytics & Reporting
- **Reason Removed**: Part of analytics not implemented
- **Alternative**: None
- **Implementation Notes**:
  - Auction success rates, average bids, popular categories

### `/admin/analytics/users`

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E017 - Analytics & Reporting
- **Reason Removed**: Part of analytics not implemented
- **Alternative**: `/admin/users` (list only)
- **Implementation Notes**:
  - User growth, retention, activity metrics

### `/admin/auctions/live`

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E003 - Auction System
- **Reason Removed**: No dedicated live auctions page
- **Alternative**: `/admin/auctions` (filter by status)
- **Implementation Notes**:
  - Could be filter on main auctions page
  - Real-time monitoring capability

### `/admin/auctions/moderation`

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🟢 LOW
- **Epic**: E003 - Auction System
- **Reason Removed**: No moderation queue page
- **Alternative**: `/admin/auctions` (filter pending)
- **Implementation Notes**:
  - Auction approval workflow
  - Flagged/reported auctions

### `/admin/blog/categories`

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🟢 LOW
- **Epic**: E020 - Blog System
- **Reason Removed**: Blog categories management not implemented
- **Alternative**: Categories inline in blog post editor
- **Implementation Notes**:
  - Low priority - can manage inline
  - Consider if blog grows significantly

### `/admin/blog/tags`

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🟢 LOW
- **Epic**: E020 - Blog System
- **Reason Removed**: Blog tags management not implemented
- **Alternative**: Tags inline in blog post editor
- **Implementation Notes**:
  - Low priority - can manage inline
  - Tag autocomplete in editor sufficient

### `/admin/settings/general`

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🔴 HIGH
- **Epic**: E021 - System Configuration
- **Reason Removed**: Settings pages are placeholders
- **Alternative**: `/admin/settings` (placeholder page)
- **Implementation Notes**:
  - Site name, logo, contact info
  - Part of E021 implementation

### `/admin/settings/payment`

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🔴 HIGH
- **Epic**: E021 - System Configuration
- **Reason Removed**: Settings pages are placeholders
- **Alternative**: Environment variables
- **Implementation Notes**:
  - Razorpay/PayU configuration
  - Part of E021 implementation

### `/admin/settings/shipping`

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E021 - System Configuration
- **Reason Removed**: Settings pages are placeholders
- **Alternative**: None
- **Implementation Notes**:
  - Shipping zones, carriers, rates
  - Part of E021 implementation

### `/admin/settings/email`

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E021 - System Configuration
- **Reason Removed**: Settings pages are placeholders
- **Alternative**: Environment variables (Resend API)
- **Implementation Notes**:
  - SMTP configuration, templates
  - Part of E021 implementation

### `/admin/settings/notifications`

- **Status**: ⬜ NOT IMPLEMENTED
- **Priority**: 🟡 MEDIUM
- **Epic**: E021 - System Configuration
- **Reason Removed**: Settings pages are placeholders
- **Alternative**: None
- **Implementation Notes**:
  - Global notification settings
  - Depends on E016 implementation

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

1. `/forgot-password` - Critical for user experience
2. `/user/notifications` - E016 epic
3. `/admin/analytics` - E017 epic
4. `/admin/settings/*` - E021 epic

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
