# Session 2 - Phase 3: Detail Pages

**Status:** 🚀 IN PROGRESS  
**Started:** November 1, 2025  
**Target Pages:** 2 detail pages  
**Estimated Time:** 4-6 hours  
**Complexity:** Medium-High (Timeline component, status tracking, complex layouts)

---

## 📋 Phase 3 Scope

### Pages to Migrate:

1. **`/seller/orders/[id]` - Order Details** (1027 lines)
2. **`/seller/shipments/[id]` - Shipment Details** (623 lines)

**Total:** 1,650 lines of MUI code to modernize

---

## 🎯 Components Needed

### New Components to Create:

1. **Timeline Component** (Priority: HIGH)

   - Used for: Order status tracking, Shipment tracking history
   - Features:
     - Vertical timeline with dots/icons
     - Timeline connector lines
     - Opposite content (timestamps)
     - Color variants (primary, success, error, warning, info)
     - Icon support
   - Current Usage:
     - `@mui/lab/Timeline`
     - `TimelineItem`, `TimelineSeparator`, `TimelineConnector`, `TimelineContent`, `TimelineDot`, `TimelineOppositeContent`

2. **Status Badge with Timeline Colors** (Priority: MEDIUM)
   - Extend existing UnifiedBadge if needed
   - Match timeline color variants

### Existing Components to Reuse:

- ✅ `PageHeader` - Page title, breadcrumbs, back button, action buttons
- ✅ `UnifiedCard` - Section containers
- ✅ `UnifiedButton` - All action buttons
- ✅ `UnifiedBadge` - Status badges
- ✅ `UnifiedModal` - Confirmation dialogs (approve, reject, cancel)
- ✅ `UnifiedAlert` - Success/error messages
- ✅ `RoleGuard` - Authentication wrapper

---

## 📄 Page 1: Order Details (`/seller/orders/[id]`)

### Current Structure (MUI):

- **Lines:** 1,027
- **MUI Imports:** Box, Container, Typography, Card, Button, Chip, Grid, Divider, Paper, Table, CircularProgress, Snackbar, Alert, Dialog, TextField, Avatar, Stack
- **MUI Lab:** Timeline components (6 imports)
- **Icons:** 10+ Material-UI icons

### Key Features:

1. **Order Header**

   - Order number, status badge, payment status
   - Action buttons: Back, Generate Invoice, Approve, Reject, Cancel
   - Timestamp info

2. **Order Items Table**

   - Product image, name, SKU, price, quantity, total
   - Links to products

3. **Customer Information**

   - Name, email, phone
   - Shipping address
   - Billing address

4. **Order Summary**

   - Subtotal
   - Coupon discount (if applied)
   - Sale discount (if applied)
   - Shipping charges
   - Tax
   - Total

5. **Timeline/History**

   - Order placed
   - Payment received
   - Approved/Rejected
   - Shipped
   - Delivered/Cancelled
   - Color-coded dots
   - Timestamps

6. **Action Dialogs**
   - Approve confirmation
   - Reject with reason
   - Cancel with reason

### Migration Strategy:

1. Create Timeline component first
2. Replace MUI layout components (Box, Container, Grid) with modern equivalents
3. Replace MUI Card → UnifiedCard
4. Replace MUI Button → UnifiedButton
5. Replace MUI Chip → UnifiedBadge
6. Replace MUI Dialog → UnifiedModal
7. Replace MUI Snackbar/Alert → UnifiedAlert
8. Replace MUI Table → Modern table with Tailwind
9. Keep existing logic (API calls, state management)

---

## 📄 Page 2: Shipment Details (`/seller/shipments/[id]`)

### Current Structure (MUI):

- **Lines:** 623
- **MUI Imports:** Box, Container, Typography, Card, Button, Chip, Grid, Paper, CircularProgress, Snackbar, Alert, Divider, Stack
- **MUI Lab:** Timeline components (6 imports)
- **Icons:** 8+ Material-UI icons

### Key Features:

1. **Shipment Header**

   - Tracking number, carrier, status badge
   - Action buttons: Back, Print Label, Refresh Tracking, Cancel Shipment
   - Order number link

2. **Tracking Information**

   - Carrier name
   - Tracking number (copyable)
   - Current status
   - Weight & dimensions
   - Shiprocket IDs (if available)

3. **Addresses**

   - From address (seller/warehouse)
   - To address (customer)

4. **Tracking Timeline**

   - Pickup scheduled
   - In transit
   - Out for delivery
   - Delivered
   - Failed/Returned
   - Location info
   - Timestamps

5. **Documents**

   - Shipping label download
   - Invoice download
   - Manifest download

6. **Action APIs**
   - Update tracking from carrier
   - Print label
   - Cancel shipment

### Migration Strategy:

1. Reuse Timeline component from Order Details
2. Replace MUI layout components
3. Replace MUI Card → UnifiedCard
4. Replace MUI Button → UnifiedButton
5. Replace MUI Chip → UnifiedBadge
6. Replace MUI Snackbar/Alert → UnifiedAlert
7. Keep existing API integration
8. Simpler than Order Details (no dialogs, just action buttons)

---

## 🔧 Implementation Plan

### Step 1: Create Timeline Component (1-2 hours)

- [ ] Design Timeline component API
- [ ] Implement vertical timeline
- [ ] Add timeline separator/connector
- [ ] Support timeline dots with icons
- [ ] Color variants (primary, success, error, warning, info)
- [ ] Opposite content support (timestamps)
- [ ] Responsive design
- [ ] Export from unified/index.ts

### Step 2: Migrate Order Details Page (2-3 hours)

- [ ] Create backup: `page.tsx.mui-backup`
- [ ] Replace MUI imports with modern components
- [ ] Update layout (Grid → modern grid)
- [ ] Replace MUI Card with UnifiedCard
- [ ] Replace MUI Button with UnifiedButton
- [ ] Replace MUI Chip with UnifiedBadge
- [ ] Replace MUI Dialog with UnifiedModal
- [ ] Replace MUI Alert with UnifiedAlert
- [ ] Replace MUI Table with modern table
- [ ] Replace MUI Timeline with new Timeline component
- [ ] Test all actions (approve, reject, cancel, generate invoice)
- [ ] Verify TypeScript errors → 0
- [ ] Delete backup after verification

### Step 3: Migrate Shipment Details Page (1-2 hours)

- [ ] Create backup: `page.tsx.mui-backup`
- [ ] Replace MUI imports with modern components
- [ ] Update layout
- [ ] Replace MUI components with modern equivalents
- [ ] Replace MUI Timeline with new Timeline component
- [ ] Test all actions (update tracking, print label, cancel)
- [ ] Verify TypeScript errors → 0
- [ ] Delete backup after verification

### Step 4: Testing & Cleanup (30 minutes)

- [ ] Test order detail page end-to-end
- [ ] Test shipment detail page end-to-end
- [ ] Verify timeline displays correctly
- [ ] Check responsive design
- [ ] Clean up any remaining backup files
- [ ] Update checklist

---

## 📊 Success Criteria

- [ ] Timeline component created and working
- [ ] Order details page: 0 TypeScript errors
- [ ] Shipment details page: 0 TypeScript errors
- [ ] All API calls working
- [ ] All action buttons functional
- [ ] Timeline displays order/shipment history
- [ ] Responsive design works
- [ ] Clean codebase (no backups)
- [ ] Documentation updated

---

## 🚀 Let's Start!

**First Task:** Create Timeline component

This will be the foundation for both detail pages.
