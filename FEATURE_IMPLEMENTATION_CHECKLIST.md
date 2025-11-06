# Feature Implementation Checklist

## Unified Approach Strategy

- **Component Pattern**: Reusable components for CRUD operations (DataTable, InlineEditor, FormModal)
- **Layout Pattern**: Consistent layout structure for all pages (Header → Breadcrumb → Content → Footer)
- **API Pattern**: **Unified RESTful endpoints that behave differently based on authenticated user's role**
- **Auth Pattern**: Role-based access control (RBAC) using existing AuthGuard
- **Form Pattern**: Unified form validation and submission handling
- **State Pattern**: Consistent state management for loading, error, success states

### Unified API Architecture

**Core Principle**: Same endpoint, different behavior based on role

**Example - `/api/shops`:**

- **Guest/User**: Returns only public, verified shops
- **Seller**: Returns own shops + public shops
- **Admin**: Returns all shops with advanced filters

**Benefits:**

- ✅ Reduced code duplication (no separate `/api/admin/shops`, `/api/seller/shops`)
- ✅ Easier maintenance (changes in one place)
- ✅ Consistent API surface (predictable URLs)
- ✅ Better security (centralized authorization)
- ✅ Easier testing (fewer endpoints to test)

**See `UNIFIED_API_ARCHITECTURE.md` for complete documentation**

---

## Quick Reference: Unified API Endpoints

| Resource       | Endpoint                    | GET                            | POST                   | PATCH                         | DELETE                |
| -------------- | --------------------------- | ------------------------------ | ---------------------- | ----------------------------- | --------------------- |
| **Shops**      | `/api/shops`                | List (filtered by role)        | Create (seller/admin)  | -                             | -                     |
|                | `/api/shops/[id]`           | Detail (role-based)            | -                      | Update (owner/admin)          | Delete (owner/admin)  |
|                | `/api/shops/[id]/verify`    | -                              | -                      | Verify (admin)                | -                     |
|                | `/api/shops/[id]/ban`       | -                              | -                      | Ban (admin)                   | -                     |
|                | `/api/shops/[id]/feature`   | -                              | -                      | Feature (admin)               | -                     |
|                | `/api/shops/[id]/payments`  | Payments (owner/admin)         | Process (admin)        | -                             | -                     |
| **Products**   | `/api/products`             | List (role-filtered)           | Create (seller/admin)  | -                             | -                     |
|                | `/api/products/[id]`        | Detail (public/owner)          | -                      | Update (owner/admin)          | Delete (owner/admin)  |
| **Categories** | `/api/categories`           | List (public)                  | Create (admin)         | -                             | -                     |
|                | `/api/categories/[id]`      | Detail (public)                | -                      | Update (admin)                | Delete (admin)        |
|                | `/api/categories/tree`      | Tree (public)                  | -                      | -                             | -                     |
|                | `/api/categories/leaves`    | Leaves (public)                | -                      | -                             | -                     |
| **Orders**     | `/api/orders`               | List (role-filtered)           | Create (user)          | -                             | -                     |
|                | `/api/orders/[id]`          | Detail (owner/seller/admin)    | -                      | Update status (seller/admin)  | -                     |
|                | `/api/orders/[id]/shipment` | -                              | Create (seller/admin)  | -                             | -                     |
| **Returns**    | `/api/returns`              | List (role-filtered)           | Initiate (user)        | -                             | -                     |
|                | `/api/returns/[id]`         | Detail (owner/seller/admin)    | -                      | Update (seller/admin)         | -                     |
|                | `/api/returns/[id]/approve` | -                              | Approve (seller/admin) | -                             | -                     |
|                | `/api/returns/[id]/refund`  | -                              | Process (seller/admin) | -                             | -                     |
|                | `/api/returns/[id]/resolve` | -                              | Resolve (admin)        | -                             | -                     |
| **Coupons**    | `/api/coupons`              | List (public active/owner all) | Create (seller/admin)  | -                             | -                     |
|                | `/api/coupons/[id]`         | Detail (public/owner)          | -                      | Update (owner/admin)          | Delete (owner/admin)  |
| **Reviews**    | `/api/reviews`              | List (public approved)         | Create (user)          | -                             | -                     |
|                | `/api/reviews/[id]`         | Detail (public)                | -                      | Moderate (owner/admin)        | Delete (author/admin) |
| **Users**      | `/api/users`                | List (admin)                   | -                      | -                             | -                     |
|                | `/api/users/[id]`           | Detail (self/admin)            | -                      | Update (self/admin)           | -                     |
|                | `/api/users/[id]/ban`       | -                              | -                      | Ban (admin)                   | -                     |
|                | `/api/users/[id]/role`      | -                              | -                      | Change role (admin)           | -                     |
| **Analytics**  | `/api/analytics`            | Get (seller: own, admin: all)  | -                      | -                             | -                     |
| **Revenue**    | `/api/revenue`              | Get (seller: own, admin: all)  | -                      | -                             | -                     |
| **Payouts**    | `/api/payouts`              | List (seller: own, admin: all) | Request (seller)       | -                             | -                     |
|                | `/api/payouts/[id]`         | -                              | -                      | Approve (admin)               | -                     |
| **Media**      | `/api/media/upload`         | -                              | Upload (authenticated) | -                             | -                     |
|                | `/api/media/[id]`           | -                              | -                      | Update metadata (owner/admin) | Delete (owner/admin)  |
| **Auctions**   | `/api/auctions`             | List (role-filtered)           | Create (seller/admin)  | -                             | -                     |
|                | `/api/auctions/[id]`        | Detail (public)                | -                      | Update (owner/admin)          | Delete (owner/admin)  |
|                | `/api/auctions/[id]/bid`    | List bids (public)             | Place bid (user)       | -                             | -                     |
|                | `/api/auctions/[id]/feature`| -                              | -                      | Feature (admin)               | -                     |
|                | `/api/auctions/live`        | Live auctions (public)         | -                      | -                             | -                     |

**Legend:**

- 📖 Public access
- 🔐 Authenticated users
- 👤 Owner only
- 🏪 Shop owner/Seller
- 👑 Admin only

---

## Phase 1: Static Pages & SEO Foundation

### 1.1 FAQ Section & Page

- [ ] Create `/src/app/faq/page.tsx` - FAQ page component
- [ ] Create `/src/components/faq/FAQSection.tsx` - Reusable FAQ component
- [ ] Create `/src/components/faq/FAQItem.tsx` - Individual FAQ accordion item
- [ ] Add FAQ section to homepage (`/src/app/page.tsx`)
- [ ] Add FAQ data structure in `/src/constants/faq.ts`
- [ ] Add FAQ link to footer navigation (`/src/constants/footer.ts`)
- [ ] Create FAQ schema markup for SEO

### 1.2 Policy & Legal Pages

- [ ] Create `/src/app/privacy-policy/page.tsx` - Privacy Policy
- [ ] Create `/src/app/terms-of-service/page.tsx` - Terms of Service
- [ ] Create `/src/app/refund-policy/page.tsx` - Refund Policy
- [ ] Create `/src/app/shipping-policy/page.tsx` - Shipping Policy
- [ ] Create `/src/app/cookie-policy/page.tsx` - Cookie Policy
- [ ] Create `/src/components/legal/LegalPageLayout.tsx` - Unified legal page wrapper
- [ ] Add legal page links to footer
- [ ] Add last updated dates and version tracking

### 1.3 SEO & Crawler Support

- [ ] Create `/src/app/sitemap.ts` - Dynamic sitemap generation
- [ ] Create `/src/app/robots.txt` - Robots.txt configuration
- [ ] Create `/src/lib/seo/metadata.ts` - SEO metadata utilities
- [ ] Create `/src/lib/seo/schema.ts` - Schema.org markup utilities
- [ ] Add Open Graph tags to layout
- [ ] Add Twitter Card metadata to layout
- [ ] Create `/public/manifest.json` - PWA manifest
- [ ] Implement breadcrumb JSON-LD schema (enhance existing Breadcrumb component)
- [ ] Add canonical URLs to all pages
- [ ] Create `/src/app/sitemap.xml/route.ts` - API route for dynamic sitemap

---

## Phase 2: Shared Components & Utilities

### 2.1 Reusable CRUD Components

- [ ] Create `/src/components/common/DataTable.tsx` - Unified data table with sorting, filtering, pagination
- [ ] Create `/src/components/common/InlineEditor.tsx` - Quick inline edit component
- [ ] Create `/src/components/common/FormModal.tsx` - Modal for create/edit forms
- [ ] Create `/src/components/common/ConfirmDialog.tsx` - Confirmation dialog for delete/ban actions
- [ ] Create `/src/components/common/StatusBadge.tsx` - Unified status indicator
- [ ] Create `/src/components/common/ActionMenu.tsx` - Dropdown action menu
- [ ] Create `/src/components/common/FilterBar.tsx` - Unified filter interface (top bar for quick filters)
- [ ] Create `/src/components/common/FilterSidebar.tsx` - **Advanced filter sidebar (collapsible on mobile, visible on desktop)**
- [ ] Create `/src/components/common/StatsCard.tsx` - Analytics card component
- [ ] Create `/src/components/common/EmptyState.tsx` - Empty state placeholder

### 2.2 Form Components

- [ ] Create `/src/components/forms/RichTextEditor.tsx` - Rich text editor for descriptions
- [ ] Create `/src/components/forms/CategorySelector.tsx` - Tree category selector
- [ ] Create `/src/components/forms/TagInput.tsx` - Tag input component
- [ ] Create `/src/components/forms/DateTimePicker.tsx` - Date/time picker
- [ ] Create `/src/components/forms/SlugInput.tsx` - Auto-generate slug input

### 2.2.1 Advanced Media Components

- [ ] Create `/src/components/media/MediaUploader.tsx` - Unified media uploader (photos/videos from file or camera)
- [ ] Create `/src/components/media/CameraCapture.tsx` - Camera photo capture component
- [ ] Create `/src/components/media/VideoRecorder.tsx` - Video recording component (camera or screen)
- [ ] Create `/src/components/media/ImageEditor.tsx` - Image adjustment tool (crop, rotate, zoom, flip, filters)
- [ ] Create `/src/components/media/VideoThumbnailGenerator.tsx` - Generate video thumbnails using canvas
- [ ] Create `/src/components/media/MediaPreviewCard.tsx` - Preview card for images/videos before upload
- [ ] Create `/src/components/media/MediaEditorModal.tsx` - Modal wrapper for media editing
- [ ] Create `/src/components/media/MediaGallery.tsx` - Gallery view for multiple media items
- [ ] Create `/src/components/media/MediaMetadataForm.tsx` - Form for slug and description of media
- [ ] Create `/src/lib/media/image-processor.ts` - Image processing utilities (crop, rotate, resize)
- [ ] Create `/src/lib/media/video-processor.ts` - Video thumbnail extraction utilities
- [ ] Create `/src/lib/media/media-validator.ts` - Media validation (size, format, dimensions)
- [ ] Create `/src/types/media.ts` - Media types (MediaFile, MediaMetadata, EditorState)

### 2.3 Public Display Cards

- [ ] Create `/src/components/cards/ProductCard.tsx` - Product card for listings (image, name, price, rating, quick actions)
- [ ] Create `/src/components/cards/ShopCard.tsx` - Shop card for shop listings (logo, name, rating, products count, featured badge)
- [ ] Create `/src/components/cards/CategoryCard.tsx` - Category card with image and product count
- [ ] Create `/src/components/cards/ProductCardSkeleton.tsx` - Loading skeleton for product card
- [ ] Create `/src/components/cards/ShopCardSkeleton.tsx` - Loading skeleton for shop card
- [ ] Create `/src/components/cards/CategoryCardSkeleton.tsx` - Loading skeleton for category card
- [ ] Create `/src/components/cards/CardGrid.tsx` - Responsive grid wrapper for cards
- [ ] Create `/src/components/cards/ProductQuickView.tsx` - Quick view modal for products

### 2.4 Shared Utilities

- [ ] Create `/src/lib/rbac.ts` - Role-based access control utilities
- [ ] Create `/src/lib/validation/shop.ts` - Shop validation schemas
- [ ] Create `/src/lib/validation/product.ts` - Product validation schemas
- [ ] Create `/src/lib/validation/coupon.ts` - Coupon validation schemas
- [ ] Create `/src/lib/validation/category.ts` - Category validation schemas
- [ ] Create `/src/lib/formatters.ts` - Currency, date, number formatters
- [ ] Create `/src/lib/export.ts` - CSV/PDF export utilities
- [ ] Update `/src/types/index.ts` - Add types for Shop, Product, Order, etc.

### 2.5 Constants & Configuration

- [ ] Create `/src/constants/database.ts` - **Database collection names (SHOPS, PRODUCTS, ORDERS, etc.)**
- [ ] Create `/src/constants/storage.ts` - **Storage bucket names (PRODUCT_IMAGES, SHOP_LOGOS, etc.)**
- [ ] Create `/src/constants/filters.ts` - **Filter configurations for each resource type**
- [ ] Create `/src/constants/media.ts` - **Media upload limits, formats, validation rules**
- [ ] Update `/src/constants/navigation.ts` - Add seller/admin navigation items

### 2.6 Upload Context & State Management

- [ ] Create `/src/contexts/UploadContext.tsx` - **Global upload state management (track pending uploads)**
- [ ] Create `/src/hooks/useUploadQueue.ts` - **Hook for managing upload queue**
- [ ] Create `/src/hooks/useMediaUpload.ts` - **Hook for media uploads with retry logic**
- [ ] Create `/src/lib/upload-manager.ts` - **Upload manager utility (handle failed uploads, retry)**
- [ ] Create `/src/components/common/UploadProgress.tsx` - **Global upload progress indicator**
- [ ] Create `/src/components/common/PendingUploadsWarning.tsx` - **Warning before navigation with pending uploads**

### 2.7 Filter Components (Resource-Specific)

- [ ] Create `/src/components/filters/ProductFilters.tsx` - **Product filter sidebar (price, category, stock, condition)**
- [ ] Create `/src/components/filters/ShopFilters.tsx` - **Shop filter sidebar (verified, rating, categories)**
- [ ] Create `/src/components/filters/OrderFilters.tsx` - **Order filter sidebar (status, date range, amount, shop)**
- [ ] Create `/src/components/filters/ReturnFilters.tsx` - **Return filter sidebar (status, date, reason, intervention)**
- [ ] Create `/src/components/filters/CouponFilters.tsx` - **Coupon filter sidebar (type, status, shop, expiry)**
- [ ] Create `/src/components/filters/UserFilters.tsx` - **User filter sidebar (role, status, registration date)**
- [ ] Create `/src/components/filters/CategoryFilters.tsx` - **Category filter sidebar (featured, homepage, parent)**
- [ ] Create `/src/components/filters/ReviewFilters.tsx` - **Review filter sidebar (rating, status, verified purchase)**
- [ ] Create `/src/hooks/useFilters.ts` - **Hook for managing filter state and URL sync**
- [ ] Create `/src/lib/filter-helpers.ts` - **Filter utilities (build query from filters, persist filters)**

---

## Phase 3: Seller Dashboard & Shop Management

### 3.1 Seller Layout & Navigation

- [ ] Create `/src/app/seller/layout.tsx` - Seller dashboard layout
- [ ] Create `/src/components/seller/SellerSidebar.tsx` - Seller navigation sidebar
- [ ] Create `/src/components/seller/SellerHeader.tsx` - Seller dashboard header
- [ ] Update `/src/constants/navigation.ts` - Add seller navigation items
- [ ] Add seller route protection with AuthGuard (role: seller)

### 3.2 My Shops Management

- [ ] Create `/src/app/seller/my-shops/page.tsx` - List all shops (admins see all, users see their 1) **with FilterSidebar**
- [ ] Create `/src/app/seller/my-shops/create/page.tsx` - Create shop form **→ redirect to edit page after creation**
- [ ] Create `/src/app/seller/my-shops/[id]/edit/page.tsx` - Edit shop form **with failed upload retry & UploadContext**
- [ ] Create `/src/app/seller/my-shops/[id]/page.tsx` - Shop details/dashboard
- [ ] Create `/src/components/seller/ShopForm.tsx` - Unified shop form component
- [ ] Create `/src/components/seller/ShopCard.tsx` - Shop card display
- [ ] Implement shop creation limit (1 for users, unlimited for admins)
- [ ] Create `/src/app/api/shops/route.ts` - **Unified Shops API** (GET: list based on role, POST: create with ownership)
- [ ] Create `/src/app/api/shops/[id]/route.ts` - **Unified Shop API** (GET/PATCH/DELETE: access control by role/ownership)
- [ ] **Handle media upload failures**: Save shop with media URLs as null, allow retry in edit page

### 3.3 Product Management

- [ ] Create `/src/app/seller/my-shops/[shopId]/products/page.tsx` - Product list with inline edit **+ ProductFilters sidebar**
- [ ] Create `/src/app/seller/my-shops/[shopId]/products/create/page.tsx` - Full product creation **→ redirect to edit page**
- [ ] Create `/src/app/seller/my-shops/[shopId]/products/[id]/edit/page.tsx` - Full product edit **with failed upload retry**
- [ ] Create `/src/components/seller/ProductTable.tsx` - Product table with inline actions **+ filter support**
- [ ] Create `/src/components/seller/ProductInlineForm.tsx` - Quick product creation (name, price, category, slug, image)
- [ ] Create `/src/components/seller/ProductFullForm.tsx` - Complete product form (SEO, condition, returnable, publish date)
- [ ] Create `/src/components/seller/ProductImageManager.tsx` - Multi-image management **with retry for failed uploads**
- [ ] Create `/src/app/api/products/route.ts` - **Unified Products API** (GET: public/filtered by role, POST: seller/admin only)
- [ ] Create `/src/app/api/products/[id]/route.ts` - **Unified Product API** (GET: public, PATCH/DELETE: owner/admin only)
- [ ] **Implement create flow**: 1) Save product to DB, 2) Upload media to storage, 3) Update URLs in DB, 4) Redirect to edit page
- [ ] **Handle partial failures**: Product saved but media failed → show warning, allow retry in edit page

### 3.4 Coupon Management

- [ ] Create `/src/app/seller/my-shops/[shopId]/coupons/page.tsx` - Coupon list **with CouponFilters sidebar**
- [ ] Create `/src/app/seller/my-shops/[shopId]/coupons/create/page.tsx` - Create coupon
- [ ] Create `/src/app/seller/my-shops/[shopId]/coupons/[id]/edit/page.tsx` - Edit coupon
- [ ] Create `/src/components/seller/CouponForm.tsx` - Coupon form with discount types
- [ ] Implement coupon types: Percentage, Flat, BOGO (Buy X Get Y), Tiered discounts
- [ ] Create `/src/components/seller/CouponPreview.tsx` - Coupon preview component
- [ ] Create `/src/lib/coupon-calculator.ts` - Coupon calculation logic
- [ ] Create `/src/app/api/coupons/route.ts` - **Unified Coupons API** (GET: by shop, POST: seller/admin only)
- [ ] Create `/src/app/api/coupons/[id]/route.ts` - **Unified Coupon API** (GET: public if active, PATCH/DELETE: owner/admin only)

### 3.5 Shop Analytics

- [ ] Create `/src/app/seller/my-shops/[shopId]/analytics/page.tsx` - Shop analytics dashboard
- [ ] Create `/src/components/seller/AnalyticsOverview.tsx` - Overview cards (products, orders, revenue)
- [ ] Create `/src/components/seller/SalesChart.tsx` - Sales chart component
- [ ] Create `/src/components/seller/TopProducts.tsx` - Top selling products
- [ ] Create `/src/components/seller/PayoutRequest.tsx` - Request payout form
- [ ] Create `/src/app/api/analytics/route.ts` - **Unified Analytics API** (GET: filtered by role & ownership)

### 3.6 Shop Reviews

- [ ] Create `/src/app/seller/my-shops/[shopId]/reviews/page.tsx` - Shop reviews list
- [ ] Create `/src/components/seller/ReviewCard.tsx` - Review display component
- [ ] Create `/src/components/seller/ReviewFilters.tsx` - Filter reviews by rating
- [ ] Create `/src/app/api/reviews/route.ts` - **Unified Reviews API** (GET: by shop/product, POST: authenticated users only)

### 3.7 Auction Management

- [ ] Create `/src/app/seller/my-shops/[shopId]/auctions/page.tsx` - **Shop auctions list (max 5 active per shop)**
- [ ] Create `/src/app/seller/my-shops/[shopId]/auctions/create/page.tsx` - **Create auction → redirect to edit page**
- [ ] Create `/src/app/seller/my-shops/[shopId]/auctions/[id]/edit/page.tsx` - **Edit auction with media retry**
- [ ] Create `/src/app/seller/my-shops/[shopId]/auctions/[id]/page.tsx` - **Auction details with live bids**
- [ ] Create `/src/components/seller/AuctionForm.tsx` - **Auction form (item, starting bid, reserve price, duration)**
- [ ] Create `/src/components/seller/AuctionTable.tsx` - **Auctions table with status (active, ended, pending)**
- [ ] Create `/src/components/seller/AuctionBidsList.tsx` - **Live bids list with highest bidder**
- [ ] Create `/src/components/seller/AuctionTimer.tsx` - **Countdown timer for auction end**
- [ ] Implement auction limit validation (5 active per shop, unlimited for admin)
- [ ] Create `/src/app/api/auctions/route.ts` - **Unified Auctions API** (GET: public/filtered by role, POST: seller/admin only)
- [ ] Create `/src/app/api/auctions/[id]/route.ts` - **Unified Auction API** (GET: public, PATCH/DELETE: owner/admin only)
- [ ] Create `/src/app/api/auctions/[id]/bid/route.ts` - **Place bid API** (GET: list bids, POST: authenticated users only)
- [ ] **Handle media upload failures**: Save auction with media URLs as null, allow retry in edit page

---

## Phase 4: Seller Orders & Fulfillment

### 4.1 My Orders

- [ ] Create `/src/app/seller/orders/page.tsx` - All orders across seller's shops **with OrderFilters sidebar**
- [ ] Create `/src/app/seller/orders/[id]/page.tsx` - Order details
- [ ] Create `/src/components/seller/OrderTable.tsx` - Orders table with filters **+ FilterSidebar integration**
- [ ] Create `/src/components/seller/OrderDetails.tsx` - Order details component
- [ ] Create `/src/components/seller/OrderStatusFlow.tsx` - Order status tracker
- [ ] Create `/src/components/seller/ShipmentManager.tsx` - Shipment creation (Shiprocket/Manual)
- [ ] Create `/src/components/seller/InvoiceGenerator.tsx` - Generate/print invoice
- [ ] Create `/src/components/seller/ShippingLabelGenerator.tsx` - Generate/print shipping label
- [ ] Create `/src/lib/shiprocket.ts` - Shiprocket API integration
- [ ] Create `/src/app/api/orders/route.ts` - **Unified Orders API** (GET: filtered by role/ownership, POST: customer checkout)
- [ ] Create `/src/app/api/orders/[id]/route.ts` - **Unified Order API** (GET: owner/seller/admin, PATCH: status update by role)
- [ ] Create `/src/app/api/orders/[id]/shipment/route.ts` - **Shipment API** (POST: seller/admin create shipment)

### 4.2 My Revenue

- [ ] Create `/src/app/seller/revenue/page.tsx` - Revenue dashboard **with date range filters**
- [ ] Create `/src/components/seller/RevenueOverview.tsx` - Revenue stats cards
- [ ] Create `/src/components/seller/RevenueChart.tsx` - Revenue charts (line, bar)
- [ ] Create `/src/components/seller/RevenueByShop.tsx` - Revenue breakdown by shop
- [ ] Create `/src/components/seller/PayoutHistory.tsx` - Payout history table
- [ ] Create `/src/components/seller/PayoutRequestForm.tsx` - Payout request with UPI/Bank details
- [ ] Create `/src/app/api/revenue/route.ts` - **Unified Revenue API** (GET: seller sees own, admin sees all)
- [ ] Create `/src/app/api/payouts/route.ts` - **Unified Payouts API** (GET/POST: seller request, admin approve)

### 4.3 My Returns & Refunds

- [ ] Create `/src/app/seller/returns/page.tsx` - Returns & refunds list **with ReturnFilters sidebar**
- [ ] Create `/src/app/seller/returns/[id]/page.tsx` - Return details **with media upload retry if needed**
- [ ] Create `/src/components/seller/ReturnTable.tsx` - Returns table **+ FilterSidebar integration**
- [ ] Create `/src/components/seller/ReturnDetails.tsx` - Return details with media viewer
- [ ] Create `/src/components/seller/ReturnMediaGallery.tsx` - View images/videos
- [ ] Create `/src/components/seller/RefundManager.tsx` - Process full/partial refunds
- [ ] Create `/src/components/seller/ReturnApproval.tsx` - Approve/reject return
- [ ] Create `/src/app/api/returns/route.ts` - **Unified Returns API** (GET: by role/ownership, POST: customer initiate)
- [ ] Create `/src/app/api/returns/[id]/route.ts` - **Unified Return API** (GET/PATCH: role-based access)
- [ ] Create `/src/app/api/returns/[id]/approve/route.ts` - **Approve Return** (POST: seller/admin only)
- [ ] Create `/src/app/api/returns/[id]/refund/route.ts` - **Process Refund** (POST: seller/admin only)

---

## Phase 5: Admin Dashboard

### 5.1 Admin Layout & Navigation

- [ ] Create `/src/app/admin/layout.tsx` - Admin dashboard layout
- [ ] Create `/src/components/admin/AdminSidebar.tsx` - Admin navigation sidebar
- [ ] Create `/src/components/admin/AdminHeader.tsx` - Admin dashboard header
- [ ] Update `/src/constants/navigation.ts` - Add admin navigation items
- [ ] Add admin route protection with AuthGuard (role: admin)

### 5.2 All Shops Management

- [ ] Create `/src/app/admin/shops/page.tsx` - All shops list **with ShopFilters sidebar (verified, banned, featured)**
- [ ] Create `/src/app/admin/shops/[id]/page.tsx` - Shop details & analytics
- [ ] Create `/src/components/admin/ShopManagement.tsx` - Shop management table **+ FilterSidebar integration**
- [ ] Create `/src/components/admin/ShopVerification.tsx` - Verify/ban shop actions
- [ ] Create `/src/components/admin/ShopPayments.tsx` - Manage payments & dues
- [ ] Create `/src/components/admin/ShopFeatureFlags.tsx` - Set featured/homepage flags
- [ ] Use `/src/app/api/shops/route.ts` - **Uses unified Shops API** (admin sees all shops)
- [ ] Create `/src/app/api/shops/[id]/verify/route.ts` - **Verify Shop** (PATCH: admin only)
- [ ] Create `/src/app/api/shops/[id]/ban/route.ts` - **Ban/Unban Shop** (PATCH: admin only)
- [ ] Create `/src/app/api/shops/[id]/feature/route.ts` - **Set Feature Flags** (PATCH: admin only)
- [ ] Create `/src/app/api/shops/[id]/payments/route.ts` - **Shop Payments** (GET/POST: admin only)

### 5.3 All Users Management

- [ ] Create `/src/app/admin/users/page.tsx` - All users list **with UserFilters sidebar (role, status, date)**
- [ ] Create `/src/app/admin/users/[id]/page.tsx` - User details
- [ ] Create `/src/components/admin/UserManagement.tsx` - User management table **+ FilterSidebar integration**
- [ ] Create `/src/components/admin/UserDetails.tsx` - User details view
- [ ] Create `/src/components/admin/UserActions.tsx` - Ban/suspend/delete user
- [ ] Create `/src/components/admin/RoleManager.tsx` - Assign/change user roles
- [ ] Create `/src/app/api/users/route.ts` - **Unified Users API** (GET: admin only with filters)
- [ ] Create `/src/app/api/users/[id]/route.ts` - **Unified User API** (GET: own profile or admin, PATCH: own or admin)
- [ ] Create `/src/app/api/users/[id]/ban/route.ts` - **Ban User** (PATCH: admin only)
- [ ] Create `/src/app/api/users/[id]/role/route.ts` - **Change Role** (PATCH: admin only)

### 5.4 All Orders Management

- [ ] Create `/src/app/admin/orders/page.tsx` - All orders from all sellers **with OrderFilters sidebar + advanced filters**
- [ ] Create `/src/app/admin/orders/[id]/page.tsx` - Order details (admin view)
- [ ] Create `/src/components/admin/OrderManagement.tsx` - Orders table with advanced filters **+ FilterSidebar**
- [ ] Create `/src/components/admin/OrderAnalytics.tsx` - Order analytics dashboard
- [ ] Use `/src/app/api/orders/route.ts` - **Uses unified Orders API** (admin sees all orders with advanced filters)

### 5.5 All Returns & Refunds Management

- [ ] Create `/src/app/admin/returns/page.tsx` - All returns requiring admin intervention **with ReturnFilters sidebar**
- [ ] Create `/src/app/admin/returns/[id]/page.tsx` - Return details (admin view)
- [ ] Create `/src/components/admin/ReturnManagement.tsx` - Returns table **+ FilterSidebar integration**
- [ ] Create `/src/components/admin/ReturnResolution.tsx` - Admin intervention actions
- [ ] Create `/src/components/admin/DisputeHandler.tsx` - Handle disputes
- [ ] Use `/src/app/api/returns/route.ts` - **Uses unified Returns API** (admin sees all with intervention flag)
- [ ] Create `/src/app/api/returns/[id]/resolve/route.ts` - **Resolve Dispute** (POST: admin only)

### 5.6 Category Management

- [ ] Create `/src/app/admin/categories/page.tsx` - Category tree view with inline editing **+ CategoryFilters**
- [ ] Create `/src/app/admin/categories/create/page.tsx` - Create category (full form)
- [ ] Create `/src/app/admin/categories/[id]/edit/page.tsx` - Edit category (full form) **with media retry**
- [ ] Create `/src/components/admin/CategoryTree.tsx` - Tree view with drag-drop reordering
- [ ] Create `/src/components/admin/CategoryInlineForm.tsx` - Quick create (name, featured, homepage, slug)
- [ ] Create `/src/components/admin/CategoryFullForm.tsx` - Full form (SEO, image, description)
- [ ] Create `/src/components/admin/CategorySelector.tsx` - Leaf-only selector for sellers
- [ ] Implement leaf-node validation for seller product creation
- [ ] Create `/src/app/api/categories/route.ts` - **Unified Categories API** (GET: public tree, POST: admin only)
- [ ] Create `/src/app/api/categories/[id]/route.ts` - **Unified Category API** (GET: public, PATCH/DELETE: admin only)
- [ ] Create `/src/app/api/categories/tree/route.ts` - **Category Tree** (GET: public, full tree structure)
- [ ] Create `/src/app/api/categories/leaves/route.ts` - **Leaf Categories** (GET: public, for product creation)

### 5.7 Auction House Management

- [ ] Create `/src/app/admin/auctions/page.tsx` - **All auctions (live, ended, upcoming) with AuctionFilters**
- [ ] Create `/src/app/admin/auctions/[id]/page.tsx` - **Auction details with bid history**
- [ ] Create `/src/components/admin/AuctionManagement.tsx` - **Auctions table + FilterSidebar integration**
- [ ] Create `/src/components/admin/FeaturedAuctionManager.tsx` - **Set featured auctions (priority order)**
- [ ] Create `/src/components/admin/AuctionModeration.tsx` - **Approve/reject/cancel auctions**
- [ ] Create `/src/components/admin/AuctionAnalytics.tsx` - **Auction analytics dashboard**
- [ ] Use `/src/app/api/auctions/route.ts` - **Uses unified Auctions API** (admin sees all, no limit)
- [ ] Create `/src/app/api/auctions/[id]/feature/route.ts` - **Set Featured Auction** (PATCH: admin only)
- [ ] Create `/src/app/api/auctions/live/route.ts` - **Live Auctions Feed** (GET: public, WebSocket support)

---

## Phase 6: User Pages & Shopping Experience

### 6.1 User Account & Profile

- [ ] Create `/src/app/user/layout.tsx` - User account layout with sidebar navigation
- [ ] Create `/src/app/user/settings/page.tsx` - Account settings page
- [ ] Create `/src/components/user/AccountSettingsForm.tsx` - **Change name, email, mobile**
- [ ] Create `/src/components/user/PasswordChangeForm.tsx` - **Change password with validation**
- [ ] Create `/src/components/user/EmailVerificationCard.tsx` - **Verify email with OTP**
- [ ] Create `/src/components/user/MobileVerificationCard.tsx` - **Verify mobile with OTP**
- [ ] Create `/src/components/user/AvatarUploader.tsx` - **Upload avatar image (uses STORAGE_BUCKETS.USER_AVATARS)**
- [ ] Create `/src/components/user/AccountDeletion.tsx` - Delete account with confirmation
- [ ] Create `/src/app/api/users/me/route.ts` - **Current user profile (GET/PATCH)**
- [ ] Create `/src/app/api/users/me/password/route.ts` - **Change password (POST)**
- [ ] Create `/src/app/api/users/me/verify-email/route.ts` - **Send/verify email OTP (POST)**
- [ ] Create `/src/app/api/users/me/verify-mobile/route.ts` - **Send/verify mobile OTP (POST)**
- [ ] Create `/src/app/api/users/me/avatar/route.ts` - **Upload/delete avatar (POST/DELETE)**

### 6.2 My Orders (User View)

- [ ] Create `/src/app/user/orders/page.tsx` - **User's order history with OrderFilters**
- [ ] Create `/src/app/user/orders/[id]/page.tsx` - **Order details with tracking**
- [ ] Create `/src/components/user/OrderCard.tsx` - **Order summary card**
- [ ] Create `/src/components/user/OrderTimeline.tsx` - **Order status timeline**
- [ ] Create `/src/components/user/OrderTracker.tsx` - **Real-time shipment tracking**
- [ ] Create `/src/components/user/OrderItemsList.tsx` - **Order items with product links**
- [ ] Create `/src/components/user/OrderActions.tsx` - **Cancel/Return/Review actions**
- [ ] Create `/src/components/user/DownloadInvoice.tsx` - **Download invoice button**
- [ ] Use `/src/app/api/orders/route.ts` - **Unified Orders API (user sees only their orders)**
- [ ] Use `/src/app/api/orders/[id]/route.ts` - **Unified Order API (user sees own order details)**
- [ ] Create `/src/app/api/orders/[id]/cancel/route.ts` - **Cancel order (POST: user before shipping)**
- [ ] Create `/src/app/api/orders/[id]/track/route.ts` - **Track shipment (GET: user/seller/admin)**

### 6.3 My Favorites (Wishlist)

- [ ] Create `/src/app/user/favorites/page.tsx` - **Wishlist page with ProductCard grid**
- [ ] Create `/src/components/user/FavoritesList.tsx` - **Favorites grid with filters**
- [ ] Create `/src/components/user/FavoriteButton.tsx` - **Add/remove favorite (heart icon)**
- [ ] Create `/src/components/user/FavoritesEmpty.tsx` - **Empty state with suggestions**
- [ ] Create `/src/hooks/useFavorites.ts` - **Favorites state management hook**
- [ ] Create `/src/app/api/favorites/route.ts` - **Favorites API (GET: list, POST: add)**
- [ ] Create `/src/app/api/favorites/[id]/route.ts` - **Remove favorite (DELETE)**
- [ ] Implement favorites sync across devices
- [ ] Add favorites count badge in header

### 6.4 Cart & Guest Cart

- [ ] Create `/src/app/cart/page.tsx` - **Cart page (guest + authenticated)**
- [ ] Create `/src/components/cart/CartList.tsx` - **Cart items list**
- [ ] Create `/src/components/cart/CartItem.tsx` - **Cart item with quantity controls**
- [ ] Create `/src/components/cart/CartSummary.tsx` - **Cart totals with coupon**
- [ ] Create `/src/components/cart/CouponInput.tsx` - **Apply/remove coupon**
- [ ] Create `/src/components/cart/CartEmpty.tsx` - **Empty cart state**
- [ ] Create `/src/components/cart/AddToCartButton.tsx` - **Add to cart button (product pages)**
- [ ] Create `/src/contexts/CartContext.tsx` - **Global cart state (localStorage for guest)**
- [ ] Create `/src/hooks/useCart.ts` - **Cart operations hook (add, remove, update quantity)**
- [ ] Create `/src/lib/cart-merger.ts` - **Merge guest cart with user cart on login**
- [ ] Create `/src/app/api/cart/route.ts` - **Cart API (GET: user cart, POST: add item)**
- [ ] Create `/src/app/api/cart/[id]/route.ts` - **Update/remove cart item (PATCH/DELETE)**
- [ ] Create `/src/app/api/cart/merge/route.ts` - **Merge guest cart on login (POST)**
- [ ] Implement cart persistence (localStorage for guest, DB for authenticated)
- [ ] Add cart count badge in header
- [ ] Show mini cart dropdown in header

### 6.5 Checkout & Payment

- [ ] Create `/src/app/checkout/page.tsx` - **Checkout page (multi-step)**
- [ ] Create `/src/components/checkout/CheckoutSteps.tsx` - **Step indicator (Address → Payment → Review)**
- [ ] Create `/src/components/checkout/AddressStep.tsx` - **Select/add shipping address**
- [ ] Create `/src/components/checkout/PaymentStep.tsx` - **Select payment method (Razorpay/PayPal/COD)**
- [ ] Create `/src/components/checkout/ReviewStep.tsx` - **Order review before placing**
- [ ] Create `/src/components/checkout/OrderSummary.tsx` - **Order summary sidebar (items, shipping, tax, total)**
- [ ] Create `/src/components/checkout/CouponSection.tsx` - **Apply coupon in checkout**
- [ ] Create `/src/components/checkout/AddressForm.tsx` - **Add/edit address form**
- [ ] Create `/src/components/checkout/AddressSelector.tsx` - **Select saved address**
- [ ] Create `/src/components/checkout/PaymentMethodCard.tsx` - **Payment method option**
- [ ] Create `/src/components/checkout/RazorpayButton.tsx` - **Razorpay integration**
- [ ] Create `/src/components/checkout/PayPalButton.tsx` - **PayPal integration**
- [ ] Create `/src/lib/razorpay.ts` - **Razorpay SDK integration**
- [ ] Create `/src/lib/paypal.ts` - **PayPal SDK integration**
- [ ] Create `/src/lib/checkout-calculator.ts` - **Calculate totals (subtotal, shipping, tax, discount, final)**
- [ ] Create `/src/app/api/checkout/calculate/route.ts` - **Calculate order totals (POST)**
- [ ] Create `/src/app/api/checkout/create-order/route.ts` - **Create order from cart (POST)**
- [ ] Create `/src/app/api/checkout/verify-payment/route.ts` - **Verify payment signature (POST)**
- [ ] Create `/src/app/api/addresses/route.ts` - **User addresses (GET/POST)**
- [ ] Create `/src/app/api/addresses/[id]/route.ts` - **Update/delete address (PATCH/DELETE)**
- [ ] Create `/src/app/checkout/success/page.tsx` - **Order success page**
- [ ] Create `/src/app/checkout/failed/page.tsx` - **Payment failed page**
- [ ] Implement order email confirmation
- [ ] Implement payment webhook handlers (Razorpay/PayPal)

### 6.6 Product Search & Discovery

- [ ] Create `/src/app/search/page.tsx` - **Universal search results page**
- [ ] Create `/src/components/search/SearchResults.tsx` - **Search results grid**
- [ ] Create `/src/components/search/SearchFilters.tsx` - **Advanced filters (category, price, shop, rating)**
- [ ] Create `/src/components/search/SearchSortOptions.tsx` - **Sort by (relevance, price, rating, new)**
- [ ] Create `/src/components/search/SearchBar.tsx` - **Enhanced search bar with suggestions**
- [ ] Create `/src/components/search/SearchSuggestions.tsx` - **Autocomplete suggestions**
- [ ] Create `/src/components/search/RecentSearches.tsx` - **Recent searches list**
- [ ] Create `/src/components/search/PopularSearches.tsx` - **Popular/trending searches**
- [ ] Create `/src/components/search/SearchByShop.tsx` - **Filter products by shop**
- [ ] Create `/src/components/search/SearchByCategory.tsx` - **Filter products by category**
- [ ] Create `/src/components/search/SearchToggle.tsx` - **Toggle between Products/Auctions search**
- [ ] Create `/src/hooks/useSearch.ts` - **Search state management hook**
- [ ] Create `/src/lib/search-engine.ts` - **Full-text search implementation**
- [ ] Create `/src/app/api/search/route.ts` - **Search API (GET: products OR auctions based on type param)**
- [ ] Create `/src/app/api/search/suggestions/route.ts` - **Autocomplete suggestions (GET)**
- [ ] Implement search indexing (Algolia/Elasticsearch or native)
- [ ] Add search analytics tracking
- [ ] Support voice search (optional)
- [ ] **Add "In Stock" checkbox filter (realtime)**
- [ ] **Add sort dropdown (Relevance, Latest, Price Low-High, Price High-Low) (realtime)**
- [ ] **Filters apply only on "Apply Filters" button click**

### 6.7 Shop & Category Pages

- [ ] Create `/src/app/shops/[id]/page.tsx` - **Shop details page with products AND auctions tabs**
- [ ] Create `/src/components/shop/ShopHeader.tsx` - **Shop banner, logo, name, rating**
- [ ] Create `/src/components/shop/ShopProducts.tsx` - **Shop products grid with filters**
- [ ] Create `/src/components/shop/ShopAuctions.tsx` - **Shop auctions grid (active/ended)**
- [ ] Create `/src/components/shop/ShopAbout.tsx` - **Shop description and policies**
- [ ] Create `/src/components/shop/ShopReviews.tsx` - **Shop reviews section**
- [ ] Create `/src/components/shop/ShopCategories.tsx` - **Shop's product categories**
- [ ] Create `/src/components/shop/FollowShopButton.tsx` - **Follow/unfollow shop**
- [ ] Create `/src/app/categories/[slug]/page.tsx` - **Category page with products (realtime search)**
- [ ] Create `/src/components/category/CategoryHeader.tsx` - **Category banner and description**
- [ ] Create `/src/components/category/CategoryProducts.tsx` - **Products in category with filters**
- [ ] Create `/src/components/category/CategorySearch.tsx` - **Realtime category search**
- [ ] Create `/src/components/category/SubcategoryNav.tsx` - **Subcategory navigation**
- [ ] Use `/src/app/api/shops/[id]/route.ts` - **Unified Shop API (public shop details)**
- [ ] Use `/src/app/api/categories/[id]/route.ts` - **Unified Category API (public category)**
- [ ] Create `/src/app/api/categories/search/route.ts` - **Realtime category search (GET)**

### 6.8 Product Pages (eBay-style)

- [ ] Create `/src/app/products/[id]/page.tsx` - **Product detail page (eBay-style layout)**
- [ ] Create `/src/components/product/ProductGallery.tsx` - **Image/video gallery with zoom**
- [ ] Create `/src/components/product/ProductInfo.tsx` - **Title, price, rating, stock status**
- [ ] Create `/src/components/product/ProductDescription.tsx` - **Full description with tabs**
- [ ] Create `/src/components/product/ProductSpecifications.tsx` - **Product specs table**
- [ ] Create `/src/components/product/ProductVariants.tsx` - **Variants from same leaf category (no child categories)**
- [ ] Create `/src/components/product/ProductReviews.tsx` - **Customer reviews with filters**
- [ ] Create `/src/components/product/WriteReviewForm.tsx` - **Write review with media upload**
- [ ] Create `/src/components/product/ProductActions.tsx` - **Add to cart, buy now, favorite**
- [ ] Create `/src/components/product/ProductShipping.tsx` - **Shipping info and delivery estimate**
- [ ] Create `/src/components/product/ProductShopCard.tsx` - **Seller info mini card**
- [ ] Create `/src/components/product/SimilarProducts.tsx` - **Similar products (10 max, diverse shops, category parents hierarchy)**
- [ ] Create `/src/components/product/SellerOtherProducts.tsx` - **Other products from same seller (shop_id)**
- [ ] Create `/src/components/product/RecentlyViewed.tsx` - **Recently viewed products**
- [ ] Use `/src/app/api/products/[id]/route.ts` - **Unified Product API (public product details)**
- [ ] Create `/src/app/api/products/[id]/reviews/route.ts` - **Product reviews (GET/POST)**
- [ ] Create `/src/app/api/products/[id]/variants/route.ts` - **Product variants (GET: same leaf category)**
- [ ] Create `/src/app/api/products/[id]/similar/route.ts` - **Similar products (GET: max 10, diverse shops)**
- [ ] Create `/src/app/api/products/[id]/seller-items/route.ts` - **Seller's other products (GET: by shop_id)**
- [ ] Implement product view tracking
- [ ] Add product schema markup (SEO)
- [ ] **Products save shop_id, not user_id**

### 6.9 Auction Pages (eBay-style)

- [ ] Create `/src/app/auctions/page.tsx` - **All auctions page (live, upcoming, ended)**
- [ ] Create `/src/app/auctions/live/page.tsx` - **Live auctions page (WebSocket)**
- [ ] Create `/src/app/auctions/featured/page.tsx` - **Featured auctions (admin curated)**
- [ ] Create `/src/app/auctions/[id]/page.tsx` - **Auction detail page (eBay-style layout)**
- [ ] Create `/src/components/auction/AuctionGallery.tsx` - **Image/video gallery**
- [ ] Create `/src/components/auction/AuctionInfo.tsx` - **Title, current bid, time left, bid count**
- [ ] Create `/src/components/auction/AuctionTimer.tsx` - **Live countdown timer**
- [ ] Create `/src/components/auction/AuctionBidding.tsx` - **Place bid form with validation**
- [ ] Create `/src/components/auction/AuctionBidHistory.tsx` - **Bid history list (live updates)**
- [ ] Create `/src/components/auction/AuctionDescription.tsx` - **Full description with tabs**
- [ ] Create `/src/components/auction/AuctionShopCard.tsx` - **Seller shop info**
- [ ] Create `/src/components/auction/SimilarAuctions.tsx` - **Similar auctions (10 max, diverse shops)**
- [ ] Create `/src/components/auction/SellerOtherAuctions.tsx` - **Other auctions from same seller (shop_id)**
- [ ] Create `/src/components/auction/AuctionWatchButton.tsx` - **Watch/unwatch auction**
- [ ] Create `/src/components/auction/AuctionFilters.tsx` - **Auction filters (category, time left, bid range)**
- [ ] Create `/src/components/auction/AuctionSortOptions.tsx` - **Sort (Time Left: Less-More, More-Less, Price, Ending Soon)**
- [ ] Use `/src/app/api/auctions/[id]/route.ts` - **Unified Auction API (public auction details)**
- [ ] Create `/src/app/api/auctions/[id]/similar/route.ts` - **Similar auctions (GET: max 10, diverse shops)**
- [ ] Create `/src/app/api/auctions/[id]/seller-items/route.ts` - **Seller's other auctions (GET: by shop_id)**
- [ ] Create `/src/app/api/auctions/featured/route.ts` - **Featured auctions (GET: admin curated)**
- [ ] Implement WebSocket for live bidding updates
- [ ] Add auction schema markup (SEO)
- [ ] **Auctions save shop_id, not user_id**
- [ ] **No variants for auctions**
- [ ] **Add "Ending Soon" sort (realtime)**
- [ ] **Filters apply only on "Apply Filters" button**

### 6.10 User Bidding & Watchlist

- [ ] Create `/src/app/user/bids/page.tsx` - **User's active bids with live updates**
- [ ] Create `/src/app/user/watchlist/page.tsx` - **Watched auctions with notifications**
- [ ] Create `/src/app/user/won-auctions/page.tsx` - **Won auctions awaiting payment**
- [ ] Create `/src/components/user/BidsList.tsx` - **Active bids list with status**
- [ ] Create `/src/components/user/WatchlistGrid.tsx` - **Watched auctions grid**
- [ ] Create `/src/components/user/WonAuctionCard.tsx` - **Won auction with payment button**
- [ ] Create `/src/hooks/useLiveBids.ts` - **WebSocket hook for live bid updates**
- [ ] Create `/src/app/api/users/me/bids/route.ts` - **User's bids (GET)**
- [ ] Create `/src/app/api/users/me/watchlist/route.ts` - **User's watchlist (GET/POST/DELETE)**
- [ ] Create `/src/app/api/users/me/won-auctions/route.ts` - **Won auctions (GET)**

### 6.11 Returns & Refunds (User Initiate)

- [ ] Create `/src/app/user/returns/page.tsx` - **User's returns list with ReturnFilters**
- [ ] Create `/src/app/user/returns/create/page.tsx` - **Initiate return request**
- [ ] Create `/src/app/user/returns/[id]/page.tsx` - **Return details and status**
- [ ] Create `/src/components/user/ReturnForm.tsx` - **Return form (reason, description, media)**
- [ ] Create `/src/components/user/ReturnItemSelector.tsx` - **Select items to return**
- [ ] Create `/src/components/user/ReturnReasonSelector.tsx` - **Return reason dropdown**
- [ ] Create `/src/components/user/ReturnMediaUploader.tsx` - **Upload images/videos (uses UploadContext)**
- [ ] Create `/src/components/user/ReturnStatus.tsx` - **Return status tracker**
- [ ] Create `/src/components/user/RefundStatus.tsx` - **Refund status and amount**
- [ ] Use `/src/app/api/returns/route.ts` - **Unified Returns API (user: initiate, list own)**
- [ ] Use `/src/app/api/returns/[id]/route.ts` - **Unified Return API (user: view own return)**
- [ ] Validate return eligibility (within return window, not used, etc.)
- [ ] **Handle media upload failures in return creation (redirect to return detail page for retry)**

---

## Phase 7: API & Backend

### 7.1 Database Schema Updates

- [ ] Create shops table/collection schema
- [ ] Create products table/collection schema **(includes shop_id, not user_id)**
- [ ] Create orders table/collection schema
- [ ] Create order_items table/collection schema
- [ ] Create coupons table/collection schema
- [ ] Create categories table/collection schema (nested set or closure table)
- [ ] Create returns table/collection schema
- [ ] Create refunds table/collection schema
- [ ] Create payouts table/collection schema
- [ ] Create reviews table/collection schema
- [ ] Create shipments table/collection schema
- [ ] Create cart table/collection schema (for authenticated users)
- [ ] Create addresses table/collection schema (user shipping addresses)
- [ ] Create favorites/wishlist table/collection schema
- [ ] Create payment_transactions table/collection schema (Razorpay/PayPal records)
- [ ] Create search_analytics table/collection schema (search tracking)
- [ ] Create **auctions table/collection schema** (shop_id, starting_bid, reserve_price, end_time, status, featured)
- [ ] Create **bids table/collection schema** (auction_id, user_id, bid_amount, bid_time, is_winning)
- [ ] Create **watchlist table/collection schema** (user_id, auction_id, created_at)
- [ ] Create **won_auctions table/collection schema** (auction_id, winner_id, final_bid, payment_status)
- [ ] Add indexes for performance (shop_id, user_id, status, created_at, category_id)
- [ ] Add indexes for auctions (end_time, status, featured, shop_id)
- [ ] Add compound index for similar products query (category_id, shop_id)
- [ ] Create migration scripts

### 6.2 Middleware & Auth

- [ ] Update `/src/app/api/middleware/auth.ts` - Add role checking middleware
- [ ] Create `/src/app/api/middleware/rbac.ts` - **Role-based access control middleware (core of unified API)**
- [ ] Create `/src/app/api/middleware/ownership.ts` - **Verify resource ownership (replaces shop-ownership.ts)**
- [ ] Create `/src/lib/api-helpers/filter-by-role.ts` - **Query filtering based on user role**
- [ ] Create `/src/lib/api-helpers/response-formatter.ts` - **Unified API response format**
- [ ] Update rate limiting for new endpoints (different limits per role)

### 6.3 External Integrations

- [ ] Implement Shiprocket API integration
- [ ] Implement payment gateway for refunds
- [ ] Implement cloud storage for product images
- [ ] Implement email notifications (order, shipment, refund)
- [ ] Implement SMS notifications (optional)

---

## Phase 7: API & Backend

### 7.1 Database Schema Updates

- [ ] Create shops table/collection schema
- [ ] Create products table/collection schema
- [ ] Create orders table/collection schema
- [ ] Create order_items table/collection schema
- [ ] Create coupons table/collection schema
- [ ] Create categories table/collection schema (nested set or closure table)
- [ ] Create returns table/collection schema
- [ ] Create refunds table/collection schema
- [ ] Create payouts table/collection schema
- [ ] Create reviews table/collection schema
- [ ] Create shipments table/collection schema
- [ ] Create cart table/collection schema (for authenticated users)
- [ ] Create addresses table/collection schema (user shipping addresses)
- [ ] Create favorites/wishlist table/collection schema
- [ ] Create payment_transactions table/collection schema (Razorpay/PayPal records)
- [ ] Create search_analytics table/collection schema (search tracking)
- [ ] Add indexes for performance (shop_id, user_id, status, created_at)
- [ ] Create migration scripts

### 7.2 Middleware & Auth

- [ ] Update `/src/app/api/middleware/auth.ts` - Add role checking middleware
- [ ] Create `/src/app/api/middleware/rbac.ts` - **Role-based access control middleware (core of unified API)**
- [ ] Create `/src/app/api/middleware/ownership.ts` - **Verify resource ownership (replaces shop-ownership.ts)**
- [ ] Create `/src/lib/api-helpers/filter-by-role.ts` - **Query filtering based on user role**
- [ ] Create `/src/lib/api-helpers/response-formatter.ts` - **Unified API response format**
- [ ] Update rate limiting for new endpoints (different limits per role)

### 7.3 External Integrations

- [ ] Implement Shiprocket API integration
- [ ] Implement Razorpay payment gateway (checkout, refunds, webhooks)
- [ ] Implement PayPal payment gateway (checkout, refunds, webhooks)
- [ ] Implement SMS OTP service (Twilio/AWS SNS) for mobile verification
- [ ] Implement Email OTP service (SendGrid/AWS SES) for email verification
- [ ] Implement cloud storage for product images (Firebase Storage/AWS S3)
- [ ] Implement email notifications (order, shipment, refund, auction won)
- [ ] Implement SMS notifications (order updates, OTP, auction ending soon)
- [ ] Implement search indexing (Algolia/Elasticsearch or native Firestore)
- [ ] Implement product recommendation engine (based on view history)
- [ ] **Implement WebSocket server for live auction bidding**
- [ ] **Implement real-time auction timer updates**
- [ ] **Implement auction end job scheduler (close auctions, notify winners)**

---

## Phase 8: Testing & Documentation

### 7.1 Testing

- [ ] Create unit tests for utilities (coupon calculator, formatters, validators)
- [ ] Create API integration tests
- [ ] Create E2E tests for critical flows (create shop, create product, place order)
- [ ] Test role-based access control
- [ ] Test shop creation limits
- [ ] Test category leaf-node validation
- [ ] Test inline editing functionality
- [ ] Performance testing for data tables with large datasets

### 7.2 Documentation

- [ ] Create `/docs/SELLER_GUIDE.md` - Seller dashboard guide
- [ ] Create `/docs/ADMIN_GUIDE.md` - Admin dashboard guide
- [ ] Create `/docs/API_REFERENCE.md` - API documentation
- [ ] Create `/docs/COUPON_TYPES.md` - Coupon types documentation
- [ ] Create `/docs/CATEGORY_MANAGEMENT.md` - Category tree management
- [ ] Update main README.md with new features
- [ ] Create video tutorials (optional)

## Phase 8: Testing & Documentation

### 8.1 Testing

- [ ] Create unit tests for utilities (coupon calculator, formatters, validators)
- [ ] Create unit tests for cart operations (add, remove, update, merge)
- [ ] Create unit tests for checkout calculator (totals, taxes, shipping, discounts)
- [ ] Create unit tests for auction bidding logic (bid validation, winner calculation)
- [ ] Create API integration tests
- [ ] Create E2E tests for critical flows (create shop, create product, place order)
- [ ] Create E2E tests for user flows (search → product → cart → checkout → payment)
- [ ] Create E2E tests for auction flows (create auction → place bid → win auction → payment)
- [ ] Create E2E tests for guest cart merge on login
- [ ] Test role-based access control
- [ ] Test shop creation limits (1 per user)
- [ ] Test auction creation limits (5 active per shop, unlimited for admin)
- [ ] Test category leaf-node validation
- [ ] Test inline editing functionality
- [ ] Test payment integrations (Razorpay/PayPal sandbox)
- [ ] Test cart persistence across sessions
- [ ] Test coupon validation and application
- [ ] Test WebSocket live bidding (concurrent bids, race conditions)
- [ ] Test auction auto-close scheduler
- [ ] Performance testing for data tables with large datasets
- [ ] Performance testing for search with large product catalog
- [ ] Performance testing for similar products algorithm (diverse shops)

### 8.2 Documentation

- [ ] Create `/docs/SELLER_GUIDE.md` - Seller dashboard guide
- [ ] Create `/docs/ADMIN_GUIDE.md` - Admin dashboard guide
- [ ] Create `/docs/USER_GUIDE.md` - **User shopping guide (cart, checkout, orders, returns)**
- [ ] Create `/docs/AUCTION_GUIDE.md` - **Auction system guide (create, bid, win)**
- [ ] Create `/docs/API_REFERENCE.md` - API documentation
- [ ] Create `/docs/COUPON_TYPES.md` - Coupon types documentation
- [ ] Create `/docs/CATEGORY_MANAGEMENT.md` - Category tree management
- [ ] Create `/docs/PAYMENT_INTEGRATION.md` - **Payment gateway setup and testing**
- [ ] Create `/docs/SEARCH_GUIDE.md` - **Search functionality and filters**
- [ ] Create `/docs/CART_CHECKOUT_FLOW.md` - **Cart and checkout workflow**
- [ ] Create `/docs/WEBSOCKET_IMPLEMENTATION.md` - **WebSocket for live auctions**
- [ ] Create `/docs/SIMILAR_PRODUCTS_ALGORITHM.md` - **Similar products logic (variants, similar, seller items)**
- [ ] Update main README.md with new features
- [ ] Create video tutorials (optional)

---

## Phase 9: UI/UX Polish

### 8.1 Responsive Design

- [ ] Ensure all seller pages are mobile responsive
- [ ] Ensure all admin pages are mobile responsive
- [ ] Test on various screen sizes
- [ ] Optimize navigation for mobile (hamburger menu for seller/admin)

### 8.2 Loading & Error States

- [ ] Add loading skeletons to all data tables
- [ ] Add error boundaries to all major sections
- [ ] Add empty states with helpful CTAs
- [ ] Add success/error toast notifications
- [ ] Add optimistic UI updates where applicable

### 8.3 Accessibility

- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Test with screen readers
- [ ] Ensure proper color contrast
- [ ] Add focus indicators

## Phase 9: UI/UX Polish

### 9.1 Responsive Design

- [ ] Ensure all seller pages are mobile responsive
- [ ] Ensure all admin pages are mobile responsive
- [ ] Ensure all user pages are mobile responsive (cart, checkout, orders, favorites)
- [ ] Ensure search page is mobile responsive with collapsible filters
- [ ] Ensure product detail pages work well on mobile
- [ ] Test on various screen sizes (320px, 375px, 768px, 1024px, 1440px)
- [ ] Optimize navigation for mobile (hamburger menu for seller/admin)
- [ ] Optimize checkout flow for mobile (simplified steps)

### 9.2 Loading & Error States

- [ ] Add loading skeletons to all data tables
- [ ] Add loading skeletons to product grids (ProductCardSkeleton)
- [ ] Add loading skeletons to shop pages (ShopCardSkeleton)
- [ ] Add loading states for cart operations (add, update, remove)
- [ ] Add loading states for checkout steps
- [ ] Add loading states for payment processing
- [ ] Add error boundaries to all major sections
- [ ] Add empty states with helpful CTAs
- [ ] Add cart empty state with product suggestions
- [ ] Add favorites empty state with trending products
- [ ] Add success/error toast notifications
- [ ] Add optimistic UI updates where applicable (cart updates, favorites)

### 9.3 Accessibility

- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works (cart, checkout, filters)
- [ ] Test with screen readers
- [ ] Ensure proper color contrast
- [ ] Add focus indicators
- [ ] Add alt text to all product images
- [ ] Add proper heading hierarchy (h1, h2, h3)
- [ ] Ensure form validation messages are accessible

---

## Phase 10: Performance & Optimization

### 9.1 Performance

- [ ] Implement pagination for large datasets
- [ ] Add virtual scrolling for long lists
- [ ] Optimize images (next/image)
- [ ] Implement code splitting for seller/admin routes
- [ ] Add service worker for offline support (optional)
- [ ] Implement Redis caching for frequently accessed data

### 9.2 SEO Final Touches

- [ ] Submit sitemap to Google Search Console
- [ ] Implement structured data testing
- [ ] Add meta descriptions to all pages
- [ ] Optimize page load speed (Lighthouse score)
- [ ] Implement lazy loading for images
- [ ] Add preconnect/prefetch for external resources

## Phase 10: Performance & Optimization

### 10.1 Performance

- [ ] Implement pagination for large datasets
- [ ] Add virtual scrolling for long lists
- [ ] Optimize images (next/image) - product images, shop logos, avatars, auction images
- [ ] Implement code splitting for seller/admin routes
- [ ] Implement code splitting for user routes (lazy load checkout, orders, auctions)
- [ ] Add service worker for offline support (optional)
- [ ] Implement Redis caching for frequently accessed data (products, categories, shops, live auctions)
- [ ] Cache search results (with TTL)
- [ ] Cache auction bid counts and current bids (short TTL)
- [ ] Optimize cart operations (debounce quantity updates)
- [ ] Optimize WebSocket connections (connection pooling, heartbeat)
- [ ] Preload critical resources (fonts, hero images)
- [ ] Implement image lazy loading
- [ ] Implement infinite scroll for product/auction listings (alternative to pagination)
- [ ] Optimize database queries (compound indexes for common filters)
- [ ] Optimize similar products query (max 10, diverse shops algorithm)
- [ ] Optimize auction end scheduler (batch processing)

### 10.2 SEO Final Touches

- [ ] Submit sitemap to Google Search Console
- [ ] Implement structured data testing
- [ ] Add meta descriptions to all pages (product, shop, category, auction, user pages)
- [ ] Add product schema markup (price, availability, rating, reviews)
- [ ] Add auction schema markup (bid, end time, status)
- [ ] Add organization schema markup
- [ ] Add breadcrumb schema markup (all pages)
- [ ] Optimize page load speed (Lighthouse score > 90)
- [ ] Implement lazy loading for images
- [ ] Add preconnect/prefetch for external resources (Razorpay, PayPal CDN, WebSocket)
- [ ] Optimize Core Web Vitals (LCP, FID, CLS)
- [ ] Add canonical URLs to prevent duplicate content
- [ ] Implement hreflang tags (if multi-language)

---

## Phase 11: Deployment & Monitoring

### 10.1 Deployment

- [ ] Set up production environment variables
- [ ] Configure CDN for static assets
- [ ] Set up database backups
- [ ] Configure SSL certificates
- [ ] Set up monitoring (error tracking, analytics)
- [ ] Create deployment pipeline

### 10.2 Monitoring

- [ ] Set up error monitoring (Sentry/similar)
- [ ] Set up performance monitoring (New Relic/similar)
- [ ] Set up user analytics (Google Analytics/similar)
- [ ] Create admin dashboard for system health
- [ ] Set up alerts for critical errors
- [ ] Create logs retention policy

## Phase 11: Deployment & Monitoring

### 11.1 Deployment

- [ ] Set up production environment variables (payment keys, API keys, secrets)
- [ ] Configure CDN for static assets (images, videos)
- [ ] Set up database backups (automated daily backups)
- [ ] Configure SSL certificates
- [ ] Set up monitoring (error tracking, analytics)
- [ ] Set up payment gateway production credentials (Razorpay/PayPal)
- [ ] Configure email/SMS service production credentials
- [ ] Set up cloud storage production bucket
- [ ] Create deployment pipeline (CI/CD)
- [ ] Set up staging environment for testing
- [ ] Configure domain and DNS

### 11.2 Monitoring

- [ ] Set up error monitoring (Sentry/similar)
- [ ] Set up performance monitoring (New Relic/similar)
- [ ] Set up user analytics (Google Analytics/similar)
- [ ] Monitor payment transaction success/failure rates
- [ ] Monitor cart abandonment rate
- [ ] Monitor checkout conversion rate
- [ ] Monitor search performance and popular queries
- [ ] **Monitor auction activity (active auctions, bid rates, conversion rates)**
- [ ] **Monitor WebSocket connection health (concurrent connections, latency)**
- [ ] **Monitor auction end scheduler performance**
- [ ] Create admin dashboard for system health
- [ ] Set up alerts for critical errors (payment failures, API downtime, WebSocket failures)
- [ ] Set up alerts for high cart abandonment
- [ ] **Set up alerts for auction end failures**
- [ ] **Set up alerts for WebSocket disconnections**
- [ ] Create logs retention policy
- [ ] Monitor database performance (slow queries)
- [ ] Track user engagement metrics (favorites, reviews, returns, auction bids)

---

## Implementation Priority

### High Priority (MVP)

1. **User Shopping Flow**: Search → Product → Cart → Checkout → Payment → Orders
2. **Auction System**: Create Auction → Browse → Bid → Win → Payment
3. **Core User Pages**: My Orders, Account Settings, Favorites, My Bids, Watchlist
4. **Payment Integration**: Razorpay and PayPal
5. **Cart System**: Guest cart + authenticated cart with merge on login
6. Seller: My Shops, Product Management (basic), Auction Management (5 max), My Orders (basic)
7. Admin: All Shops, All Orders, All Auctions, Featured Auctions, Category Management
8. Static Pages: FAQ, Privacy Policy, Terms of Service
9. SEO: Sitemap, robots.txt, metadata

### Medium Priority

1. **Advanced Search**: Filters by category, shop, price, rating (Products + Auctions toggle)
2. **Similar Products Algorithm**: Variants, similar (diverse shops), seller items
3. **WebSocket Live Bidding**: Real-time updates, concurrent bid handling
4. **Returns & Refunds**: User initiate, seller approve, admin resolve
5. **User Profile**: Email/mobile verification, avatar upload, password change
6. Seller: Coupon Management, Shop Analytics, My Revenue
7. Admin: User Management, Returns Management, Auction Analytics

### Low Priority

1. **Product Recommendations**: Based on view history
2. **Shop Follow System**: Follow/unfollow shops
3. **Voice Search**: Voice-activated product/auction search
4. **Auction Notifications**: Email/SMS for ending soon, outbid, won
5. Advanced analytics and charts
6. Shiprocket integration
7. Video tutorials
8. PWA features

---

## Unified Component Library

### Components to Create (Reusable)

**General:**

- `<DataTable />` - Universal table with sorting, filtering, pagination
- `<InlineEditor />` - Quick inline editing
- `<FormModal />` - Modal forms
- `<ConfirmDialog />` - Confirmation dialogs
- `<StatusBadge />` - Status indicators
- `<ActionMenu />` - Action dropdown
- `<StatsCard />` - Analytics cards
- `<EmptyState />` - Empty states
- `<FilterBar />` - Unified filters
- `<FilterSidebar />` - Advanced filter sidebar (collapsible on mobile)
- `<RichTextEditor />` - Rich text editor
- `<CategorySelector />` - Category tree selector
- `<DateTimePicker />` - Date/time picker
- `<SlugInput />` - Auto-slug generator

**Cards:**

- `<ProductCard />` - Product display card for public pages
- `<ShopCard />` - Shop display card for public pages
- `<CategoryCard />` - Category display card for public pages
- `<CardGrid />` - Responsive grid layout for cards
- `<ProductQuickView />` - Quick view modal for products

**Media:**

- `<MediaUploader />` - Unified photo/video uploader with camera support
- `<CameraCapture />` - Camera photo capture
- `<VideoRecorder />` - Video recording from camera
- `<ImageEditor />` - Image adjustment tool (crop, rotate, zoom, filters)
- `<VideoThumbnailGenerator />` - Canvas-based video thumbnail generator
- `<MediaPreviewCard />` - Preview media before upload with metadata
- `<MediaEditorModal />` - Modal for editing media with metadata
- `<MediaGallery />` - Gallery view for multiple media items

**User Shopping:**

- `<AddToCartButton />` - Add to cart button
- `<FavoriteButton />` - Add/remove favorite (heart icon)
- `<CartItem />` - Cart item with quantity controls
- `<CartSummary />` - Cart totals with coupon
- `<CouponInput />` - Apply/remove coupon
- `<AddressForm />` - Add/edit shipping address
- `<AddressSelector />` - Select saved address
- `<PaymentMethodCard />` - Payment method option
- `<OrderCard />` - Order summary card
- `<OrderTimeline />` - Order status timeline
- `<OrderTracker />` - Real-time shipment tracking
- `<SearchBar />` - Enhanced search bar with suggestions
- `<SearchFilters />` - Advanced filters for search results
- `<SearchToggle />` - **Toggle between Products/Auctions search**

**Auctions:**

- `<AuctionCard />` - **Auction display card (current bid, time left)**
- `<AuctionTimer />` - **Live countdown timer**
- `<AuctionBidding />` - **Place bid form with validation**
- `<AuctionBidHistory />` - **Bid history list (live updates via WebSocket)**
- `<AuctionWatchButton />` - **Watch/unwatch auction**
- `<LiveAuctionFeed />` - **Real-time auction updates**
- `<AuctionFilters />` - **Auction-specific filters (time left, bid range)**
- `<AuctionSortOptions />` - **Sort (Time Left, Price, Ending Soon)**

---

## Constants & Configuration

All constants follow the DRY principle and are centralized in `/src/constants/`:

### Database Collections (`/src/constants/database.ts`)

```typescript
export const COLLECTIONS = {
  SHOPS: "shops",
  PRODUCTS: "products", // includes shop_id
  ORDERS: "orders",
  ORDER_ITEMS: "orderItems",
  CART: "cart",
  FAVORITES: "favorites",
  ADDRESSES: "addresses",
  CATEGORIES: "categories",
  COUPONS: "coupons",
  RETURNS: "returns",
  REFUNDS: "refunds",
  REVIEWS: "reviews",
  USERS: "users",
  SESSIONS: "sessions",
  PAYOUTS: "payouts",
  TRANSACTIONS: "transactions",
  PAYMENT_TRANSACTIONS: "paymentTransactions",
  SHIPMENTS: "shipments",
  NOTIFICATIONS: "notifications",
  SEARCH_ANALYTICS: "searchAnalytics",
  AUCTIONS: "auctions", // includes shop_id
  BIDS: "bids",
  WATCHLIST: "watchlist",
  WON_AUCTIONS: "wonAuctions",
};
```

### Storage Buckets (`/src/constants/storage.ts`)

```typescript
export const STORAGE_BUCKETS = {
  SHOP_LOGOS: "shops/logos",
  SHOP_BANNERS: "shops/banners",
  PRODUCT_IMAGES: "products/images",
  PRODUCT_VIDEOS: "products/videos",
  AUCTION_IMAGES: "auctions/images", // New
  AUCTION_VIDEOS: "auctions/videos", // New
  CATEGORY_IMAGES: "categories/images",
  USER_AVATARS: "users/avatars",
  RETURN_MEDIA: "returns/media",
  REVIEW_IMAGES: "reviews/images",
  REVIEW_VIDEOS: "reviews/videos",
  ORDER_INVOICES: "orders/invoices",
};
```

### API Routes Pattern

All APIs follow unified pattern with role-based filtering:

```
/api/[resource]           - GET (list), POST (create)
/api/[resource]/[id]      - GET (detail), PATCH (update), DELETE
/api/[resource]/[id]/[action] - POST (specific actions)
```

---

## Development Notes

### Design Principles

1. **DRY (Don't Repeat Yourself)**: Reuse components, utilities, and patterns
2. **Responsive First**: Mobile-first design approach
3. **Accessibility**: WCAG 2.1 AA compliance
4. **Performance**: Optimize for speed and efficiency
5. **Security**: Role-based access control, input validation, payment security
6. **Scalability**: Design for growth (pagination, caching, optimization)
7. **Constants-Based**: All database/storage names in constants
8. **Unified API**: Single endpoints with role-based behavior

### Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Firebase/Firestore (assumed)
- **Auth**: Existing session-based auth with role support
- **Payments**: Razorpay (primary), PayPal (alternative)
- **SMS/Email**: Twilio/AWS SNS (SMS), SendGrid/AWS SES (Email)
- **Search**: Algolia/Elasticsearch or native Firestore
- **Real-time**: WebSocket (Socket.io) for live auction bidding
- **Job Scheduler**: Node-cron / BullMQ for auction end automation
- **State**: React Context + hooks
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Headless UI / Radix UI (recommended)
- **Charts**: Recharts / Chart.js
- **Tables**: TanStack Table (React Table)
- **Rich Text**: TipTap / Lexical
- **Media Processing**: Canvas API, MediaStream API (camera/video recording)
- **Image Editing**: react-easy-crop / Cropper.js / Konva.js
- **Video Processing**: Canvas API for thumbnail generation
- **Cart**: localStorage (guest) + Firestore (authenticated)

### Folder Structure Convention

```
/src/app/[role]/[feature]/[action]/page.tsx       # Frontend pages
/src/components/[role]/[Component].tsx             # Role-specific components
/src/components/common/[Component].tsx             # Shared components
/src/app/api/[resource]/route.ts                   # Unified API: GET (list), POST (create)
/src/app/api/[resource]/[id]/route.ts              # Unified API: GET (detail), PATCH (update), DELETE
/src/app/api/[resource]/[id]/[action]/route.ts     # Unified API: POST (specific actions)
```

**API Examples:**

- `/api/shops` - List/create shops (behavior varies by role)
- `/api/shops/[id]` - Get/update/delete shop (role-based access)
- `/api/products` - List/create products (filtered by role, saved with shop_id)
- `/api/products/[id]` - Product details with variants/similar products
- `/api/products/[id]/variants` - Product variants (same leaf category)
- `/api/products/[id]/similar` - Similar products (max 10, diverse shops)
- `/api/products/[id]/seller-items` - Seller's other products (by shop_id)
- `/api/orders` - List/create orders (user's own or all if admin)
- `/api/auctions` - List/create auctions (5 max per shop, unlimited for admin)
- `/api/auctions/[id]` - Auction details (saved with shop_id)
- `/api/auctions/[id]/bid` - Place bid (WebSocket real-time updates)
- `/api/auctions/[id]/similar` - Similar auctions (max 10, diverse shops)
- `/api/auctions/live` - Live auctions feed (WebSocket)
- `/api/auctions/featured` - Featured auctions (admin curated)
- `/api/cart` - Get/update user cart (authenticated) or guest cart (session)
- `/api/cart/merge` - Merge guest cart into user cart on login
- `/api/checkout/create-order` - Create order from cart
- `/api/checkout/verify-payment` - Verify Razorpay/PayPal payment
- `/api/search` - Universal search (products OR auctions based on type param)
- `/api/categories/search` - Realtime category search
- `/api/favorites` - User favorites/wishlist
- `/api/addresses` - User shipping addresses

---

## Key Features & Implementation Notes

### Products Architecture

- **Products save `shop_id`, not `user_id`** - Enables shop ownership transfer
- **Variants**: Products from same leaf category (no child categories)
- **Similar Products Algorithm**:
  1. First, products from same leaf category (different shops)
  2. If <10, go to parent category
  3. If still <10, go to grandparent category
  4. Max 10 products, prioritize diverse shops (different shop_id)
- **Seller Items**: Other products from same `shop_id`
- **Common Products Page**: Single page with different filters for all products, search results, shop products, category products

### Auctions Architecture

- **Auctions save `shop_id`, not `user_id`**
- **Auction Limits**: 5 active auctions per shop, unlimited for admin
- **No Variants**: Auctions are standalone items
- **Similar Auctions**: Same algorithm as products (max 10, diverse shops)
- **Live Bidding**: WebSocket for real-time updates
- **Auction End Automation**: Job scheduler to close auctions, notify winners
- **Featured Auctions**: Admin can set priority order for homepage

### Search Architecture

- **Toggle Search Type**: Products OR Auctions (not both simultaneously)
- **Category Search**: Realtime search on categories page
- **Filters**:
  - Apply only on "Apply Filters" button click
  - **In Stock checkbox**: Realtime (no apply button needed)
  - **Sort dropdown**: Realtime (no apply button needed)
- **Sort Options**:
  - Products: Relevance, Latest, Price Low-High, Price High-Low
  - Auctions: Time Left (Less-More, More-Less), Price, Ending Soon
- **Shop & Category Filters**: Added to search filters

### Filter Behavior

- **FilterSidebar**: Collapsible on mobile, visible on desktop
- **Apply Button**: Required for category, price range, rating filters
- **Realtime Updates**: In Stock checkbox, Sort dropdown
- **URL Sync**: Filters persist in URL for shareable states

---

## Completion Tracking

- **Total Tasks**: 480+
- **Completed**: 0
- **In Progress**: 0
- **Blocked**: 0

## Documentation Files Created

- ✅ `FEATURE_IMPLEMENTATION_CHECKLIST.md` - Main implementation checklist (480+ tasks)
- ✅ `MEDIA_COMPONENTS_GUIDE.md` - Comprehensive media handling guide
- ✅ `UNIFIED_API_ARCHITECTURE.md` - Complete unified API documentation
- ✅ `UNIFIED_API_QUICKSTART.md` - Developer quick start guide
- ✅ `FILTER_AND_UPLOAD_GUIDE.md` - Filter sidebar & upload management guide

## Recommended Documentation to Create

- [ ] `AUCTION_SYSTEM_GUIDE.md` - Live auction system implementation (WebSocket, bidding, scheduler)
- [ ] `SIMILAR_PRODUCTS_ALGORITHM.md` - Detailed algorithm for variants/similar/seller items
- [ ] `PRODUCT_ARCHITECTURE.md` - Product data structure, shop_id vs user_id, eBay-style pages

Last Updated: November 7, 2025
