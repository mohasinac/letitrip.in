# Admin & Seller Dashboard Improvements Checklist

**Project**: JustForView.in Auction Platform  
**Date**: November 9, 2025  
**Priority**: High → Low (Ordered)

---

## 🔍 Sidebar Search Improvement

### Issue

Admin and Seller sidebar search inputs exist but don't filter navigation items in real-time, and they lose focus when typing.

### Tasks

- [x] **HIGH** - Implement real-time search filtering in `AdminSidebar.tsx` ✅

  - ✅ Filter navigation items based on search query
  - ✅ Search should match: title, href, children
  - ✅ Maintain focus while typing (use controlled component)
  - ✅ Show/hide sections based on matches
  - ✅ Highlight matching text (yellow background)
  - ✅ Show "No results" message when no matches
  - ✅ Auto-expand sections with matching items
  - ✅ Clear button to reset search

- [x] **HIGH** - Implement real-time search filtering in `SellerSidebar.tsx` ✅

  - ✅ Same features as AdminSidebar
  - ✅ Maintain consistent behavior
  - ✅ Blue highlight color theme (matches seller branding)

- [ ] **MEDIUM** - Add keyboard shortcuts

  - `Ctrl+K` / `Cmd+K` to focus search
  - `Escape` to clear search
  - Arrow keys to navigate filtered results

- [ ] **LOW** - Add search history/suggestions
  - Store recent searches in localStorage
  - Show suggestions on focus

---

## 📄 Missing Admin Pages

### High Priority Pages

#### 1. Products Management

- [x] **HIGH** - `/admin/products` - All Products List ✅

  - ✅ Table with inline edit (double-click to edit)
  - ✅ Filters: status, price range (min/max)
  - ✅ Bulk actions: approve/publish, reject/archive, feature, unfeature, delete
  - ✅ Quick edit: name, price, stock, status
  - ✅ Search by name, SKU
  - ✅ Grid and table view toggle
  - ✅ Pagination (20 per page)
  - ✅ Export to CSV
  - ✅ Product stats (rating, sales)
  - ✅ Stock status indicators (color-coded)

- [x] **HIGH** - `/admin/products/[id]/edit` - Product Detail/Edit ✅
  - ✅ Full product form with all fields
  - ✅ Media gallery management (upload, remove images)
  - ✅ Inventory management (stock, SKU, low stock threshold)
  - ✅ SEO settings (meta title, description, tags)
  - ✅ Specifications with add/remove
  - ✅ Pricing (selling, original, cost price)
  - ✅ Product details (condition, brand, manufacturer, warranty)
  - ✅ Feature flags (featured, homepage)
  - ✅ Return policy settings
  - ✅ Product statistics display
  - ✅ Delete product with confirmation
  - ✅ Shop and category selection
  - ✅ Media upload with cleanup hook
  - ✅ Navigation guard for unsaved media

#### 2. Shops Management

- [x] **HIGH** - `/admin/shops` - All Shops List ✅

  - ✅ Table and grid view toggle
  - ✅ Filters: verification status (verified/unverified), shop status (active/banned)
  - ✅ Bulk actions: verify/unverify, ban/unban, feature/unfeature, delete
  - ✅ Quick edit (inline double-click): name, isVerified, isFeatured, showOnHomepage
  - ✅ Search by shop name
  - ✅ Pagination (20 per page)
  - ✅ Export to CSV
  - ✅ Shop stats display (rating, product count, review count)
  - ✅ Status badges (verified, banned, featured, homepage)

- [ ] **HIGH** - `/admin/shops/[id]` - Shop Detail/Edit
  - Shop information
  - Seller details
  - Products list
  - Performance metrics
  - Suspend/activate actions

#### 3. Orders Management

- [ ] **HIGH** - `/admin/orders` - All Orders List

  - Real-time order tracking
  - Filters: status, date, payment, shop
  - Bulk actions: update status, export
  - Quick view order details

- [ ] **HIGH** - `/admin/orders/[id]` - Order Detail
  - Full order information
  - Customer details
  - Items list with images
  - Status timeline
  - Payment information
  - Shipping tracking
  - Refund/cancel actions

#### 4. Reviews Management

- [ ] **HIGH** - `/admin/reviews` - Reviews Moderation
  - Table with filters
  - Approve/reject reviews
  - Flag inappropriate content
  - Respond to reviews
  - Bulk moderation actions

#### 5. Payments & Payouts

- [ ] **HIGH** - `/admin/payments` - Payment Transactions

  - List all payments
  - Filters: status, gateway, date range
  - Transaction details
  - Refund management
  - Payment gateway stats

- [ ] **HIGH** - `/admin/payouts` - Seller Payouts
  - Pending payouts list
  - Process payouts
  - Payout history
  - Hold/release actions
  - Export reports

#### 6. Coupons Management

- [ ] **HIGH** - `/admin/coupons` - Coupon List

  - Active/expired coupons
  - Usage statistics
  - Quick enable/disable
  - Bulk delete expired

- [ ] **HIGH** - `/admin/coupons/create` - Create Coupon

  - Coupon code generator
  - Discount type: percentage, fixed
  - Conditions: min order, categories, products
  - Usage limits
  - Date range

- [ ] **HIGH** - `/admin/coupons/[id]/edit` - Edit Coupon
  - Same as create with prefilled data

#### 7. Returns & Refunds

- [ ] **HIGH** - `/admin/returns` - Returns Management
  - Pending returns list
  - Approve/reject returns
  - Track return shipping
  - Process refunds
  - Return reasons analytics

### Medium Priority Pages

#### 8. Auctions Moderation

- [ ] **MEDIUM** - `/admin/auctions/moderation` - Auction Moderation
  - Pending approval auctions
  - Review auction details
  - Approve/reject/edit
  - Flag suspicious activity
  - Bid verification

#### 9. Support Tickets

- [ ] **MEDIUM** - `/admin/support-tickets` - All Tickets

  - Ticket list with status
  - Filters: priority, category, status
  - Assign to agents
  - Quick reply
  - Escalate tickets

- [ ] **MEDIUM** - `/admin/support-tickets/[id]` - Ticket Detail
  - Full conversation thread
  - Customer information
  - Related orders/products
  - Internal notes
  - Status management
  - Canned responses

#### 10. Blog Management

- [ ] **MEDIUM** - `/admin/blog` - All Blog Posts

  - Posts list with status
  - Quick edit: title, status, featured
  - Filters: status, category, author, date
  - Bulk actions

- [ ] **MEDIUM** - `/admin/blog/create` - Create Post

  - Rich text editor
  - Media upload
  - SEO fields
  - Categories & tags
  - Featured image
  - Publish/draft

- [ ] **MEDIUM** - `/admin/blog/[id]/edit` - Edit Post

  - Same as create with prefilled data

- [ ] **MEDIUM** - `/admin/blog/categories` - Blog Categories

  - Category list
  - Inline add/edit/delete
  - Reorder categories

- [ ] **MEDIUM** - `/admin/blog/tags` - Blog Tags
  - Tag list with usage count
  - Bulk merge tags
  - Delete unused tags

#### 11. Analytics Pages

- [ ] **MEDIUM** - `/admin/analytics/auctions` - Auction Analytics

  - Bid activity charts
  - Popular auction categories
  - Conversion rates
  - Revenue from auctions

- [ ] **MEDIUM** - `/admin/analytics/users` - User Analytics
  - User growth charts
  - Active users metrics
  - User segments
  - Retention rates

#### 12. Featured Sections

- [ ] **MEDIUM** - `/admin/featured-sections` - Featured Content
  - Homepage featured sections
  - Banner management
  - Promotional content
  - Drag & drop ordering

### Low Priority Pages

#### 13. Settings Pages

- [ ] **LOW** - `/admin/settings/general` - General Settings

  - Site name, logo, favicon
  - Contact information
  - Social media links
  - Timezone, currency

- [ ] **LOW** - `/admin/settings/payment` - Payment Gateway Settings

  - Enable/disable gateways
  - API credentials
  - Transaction fees
  - Test mode toggle

- [ ] **LOW** - `/admin/settings/shipping` - Shipping Settings

  - Shipping methods
  - Rates configuration
  - Free shipping rules
  - Shipping zones

- [ ] **LOW** - `/admin/settings/email` - Email Settings

  - SMTP configuration
  - Email templates
  - Test email functionality

- [ ] **LOW** - `/admin/settings/notifications` - Notification Settings
  - Email notifications toggle
  - SMS notifications
  - Push notifications
  - Notification preferences

---

## 📄 Missing Seller Pages

### High Priority Pages

#### 1. Orders Management

- [ ] **HIGH** - `/seller/orders` - Orders List

  - Filter by status
  - Search orders
  - Quick status update
  - Print packing slip
  - Bulk actions

- [ ] **HIGH** - `/seller/orders/[id]` - Order Detail
  - Order information
  - Update status
  - Add tracking number
  - Contact customer
  - Print invoice

#### 2. Returns Management

- [ ] **HIGH** - `/seller/returns` - Returns & Refunds
  - Pending returns
  - Approve/reject returns
  - Track return shipping
  - Process refunds
  - Return history

#### 3. Revenue & Payouts

- [ ] **HIGH** - `/seller/revenue` - Revenue Dashboard
  - Total revenue charts
  - Pending payouts
  - Transaction history
  - Commission breakdown
  - Export financial reports

### Medium Priority Pages

#### 4. Marketing

- [ ] **MEDIUM** - `/seller/marketing` - Marketing Tools
  - Run promotions
  - Create deals
  - Social media integration
  - Email campaigns
  - Performance tracking

#### 5. Support Tickets

- [ ] **MEDIUM** - `/seller/support-tickets` - Support Tickets
  - Customer inquiries
  - Order issues
  - Reply to tickets
  - Ticket status management

---

## 🎯 Implementation Strategy

### Phase 1: Core Functionality (Week 1-2)

1. ✅ Fix sidebar search (real-time filtering, maintain focus)
2. Create missing HIGH priority admin pages
   - Products management
   - Shops management
   - Orders management
   - Payments & Payouts

### Phase 2: Essential Features (Week 3-4)

3. Create missing HIGH priority seller pages
   - Orders management
   - Returns management
   - Revenue dashboard
4. Complete admin reviews and coupons management

### Phase 3: Extended Features (Week 5-6)

5. Create MEDIUM priority admin pages
   - Support tickets
   - Blog management
   - Analytics pages
6. Create MEDIUM priority seller pages
   - Marketing tools
   - Support tickets

### Phase 4: Polish & Settings (Week 7-8)

7. Create LOW priority pages (settings)
8. Add keyboard shortcuts
9. Add search history
10. Performance optimization
11. Mobile responsiveness testing

---

## 📋 Technical Requirements

### All Pages Must Have:

- ✅ AuthGuard with proper role check
- ✅ Responsive design (mobile-first)
- ✅ Loading states
- ✅ Error handling with error boundaries
- ✅ Success/error toast notifications
- ✅ Breadcrumb navigation
- ✅ Page title and meta tags
- ✅ Proper TypeScript types
- ✅ Service layer integration (no direct API calls)
- ✅ Accessibility (WCAG compliant)

### Tables Must Have:

- ✅ Sorting
- ✅ Pagination
- ✅ Filters
- ✅ Search
- ✅ Bulk actions (where applicable)
- ✅ Inline edit (where applicable)
- ✅ Export functionality (CSV/Excel)
- ✅ Loading skeleton
- ✅ Empty state

### Forms Must Have:

- ✅ Validation (client & server)
- ✅ Error messages
- ✅ Loading states on submit
- ✅ Cancel/reset functionality
- ✅ Unsaved changes warning
- ✅ Auto-save draft (where applicable)
- ✅ Media upload with cleanup hook

---

## 🧪 Testing Checklist

### For Each Page:

- [ ] Test all CRUD operations
- [ ] Test filters and search
- [ ] Test pagination
- [ ] Test bulk actions
- [ ] Test error states
- [ ] Test loading states
- [ ] Test empty states
- [ ] Test on mobile devices
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Test form validation
- [ ] Test media uploads
- [ ] Test navigation guards

---

## 📊 Progress Tracking

**Total Tasks**: 48 tasks  
**Completed**: 5 tasks (10%)  
**In Progress**: 0 tasks  
**Blocked**: 0 tasks

### ✅ Recently Completed:

- Real-time search filtering in AdminSidebar (HIGH)
- Real-time search filtering in SellerSidebar (HIGH)
- Admin Products List page with full features (HIGH)
- Admin Product Detail/Edit page with comprehensive form (HIGH)
- Admin Shops List page with full features (HIGH)

### Current Sprint Focus:

1. ✅ ~~Sidebar search implementation (2 tasks)~~ **COMPLETED**
2. ✅ ~~Admin products management (2 tasks)~~ **COMPLETED**
3. ✅ ~~Admin shops management (1/2 tasks)~~ **IN PROGRESS**
4. Admin orders management (2 tasks) - **NEXT**

**Next Sprint**: Payments, Payouts, Reviews, Coupons

---

## 🚀 Quick Start

### To Start Working on Sidebar Search:

1. Read `src/components/admin/AdminSidebar.tsx`
2. Read `src/components/seller/SellerSidebar.tsx`
3. Implement search filtering logic
4. Add keyboard shortcuts
5. Test focus management
6. Deploy and verify

### To Create a New Admin Page:

1. Check `ADMIN_MENU_ITEMS` in `src/constants/navigation.ts`
2. Create page in `src/app/admin/[feature]/page.tsx`
3. Create service in `src/services/[feature].service.ts` (if needed)
4. Add API route in `src/app/api/admin/[feature]/route.ts` (if needed)
5. Create components in `src/components/admin/[Feature]/`
6. Add TypeScript types in `src/types/`
7. Test thoroughly
8. Update this checklist

---

## 📝 Notes

- Follow existing patterns from hero-slides, categories, and homepage pages
- Use inline-edit components for table pages (see `INLINE-EDIT-GUIDE.md`)
- Use media upload with cleanup hook (see `AI-AGENT-GUIDE.md`)
- All API routes should use constants from `src/constants/api-routes.ts`
- Mobile-first responsive design
- Accessibility is mandatory (keyboard, screen readers)
- No mocks - use real APIs
- Focus on code implementation, not documentation

---

**Last Updated**: November 10, 2025  
**Next Review**: After Phase 1 completion

---

## 📝 Changelog

### November 10, 2025

- ✅ Implemented real-time search filtering in AdminSidebar
  - Added controlled search input with focus management
  - Filters nav items by title, href, and children
  - Highlights matching text with yellow background
  - Auto-expands sections with matches
  - Shows "No results" message
  - Clear button to reset search
- ✅ Implemented real-time search filtering in SellerSidebar
  - Same features as AdminSidebar
  - Blue highlight theme for branding consistency
- ✅ Created `/admin/products` - All Products List page
  - Full product listing with grid/table views
  - Advanced filters (status, price range)
  - Search by name or SKU
  - Inline editing (double-click rows)
  - Bulk actions (approve, reject, feature, delete)
  - Pagination with 20 products per page
  - Export to CSV functionality
  - Stock status indicators (red/yellow/green)
- ✅ Created `/admin/products/[id]/edit` - Product Detail/Edit page
  - Comprehensive product editing form
  - All product fields (basic info, pricing, inventory, details, SEO)
  - Media gallery with upload and removal
  - Specifications management
  - Tag management
  - Feature flags and return policy
  - Product statistics display
  - Delete product functionality
  - Media upload with automatic cleanup on failure
  - Navigation guard for unsaved media
- ✅ Created `/admin/shops` - All Shops List page
  - Full shop listing with grid/table views
  - Filters (verification status, shop status)
  - Search by shop name
  - Inline editing (double-click rows): name, isVerified, isFeatured, showOnHomepage
  - Bulk actions (verify/unverify, ban/unban, feature/unfeature, delete)
  - Pagination with 20 shops per page
  - Export to CSV functionality
  - Shop stats display (rating, product count, review count)
  - Status badges (verified, banned, featured, homepage)
  - Product stats display (rating, sales count)
  - Responsive design with mobile support
