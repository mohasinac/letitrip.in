# Feature Implementation Checklist

**⚠️ ARCHITECTURE UPDATE (November 7, 2025)**

**Database Integration Approach:** All API routes will integrate directly with Firebase Firestore using Firebase Admin SDK (server-side only). No additional service layer abstraction between API routes and database.

**Data Flow:** UI → API Route → Firebase Admin SDK → Firestore

**Service Layer:** Existing client-side service wrappers (Phase 2.8) are optional convenience wrappers that call API routes. They provide type safety and consistent error handling but are not required.

**Key Change:** Previously planned service layer abstraction has been simplified. API routes now handle database operations directly, making the architecture simpler and more performant.

**Next Step:** Phase 3.2 - Setup Firebase Admin SDK for direct database integration in all API routes.

---

## Unified Approach Strategy

- **Component Pattern**: Reusable components for CRUD operations (DataTable, InlineEditor, FormModal)
- **Layout Pattern**: Consistent layout structure for all pages (Header → Breadcrumb → Content → Footer)
- **API Pattern**: **Unified RESTful endpoints that behave differently based on authenticated user's role**
- **Database Pattern**: **Direct Firebase integration in API routes - no service layer abstraction**
- **Auth Pattern**: Role-based access control (RBAC) using existing AuthGuard
- **Form Pattern**: Unified form validation and submission handling
- **State Pattern**: Consistent state management for loading, error, success states

### Slug-first, DRY rules (Nov 7, 2025)

- Use slugs for Shops, Products, and Categories across all pages and API routes. No IDs in routes.
- Coupons use CODE, not slug (unique per shop). No IDs in routes.
- Categories are global (not shop-specific).
- DRY slug validation: shared util `src/lib/validation/slug.ts` + endpoints:
  - `/api/shops/validate-slug` (global uniqueness)
  - `/api/products/validate-slug` (scoped to `shop_id`)
  - `/api/categories/validate-slug` (global uniqueness)
- Forms use debounced live validation via the above endpoints.

### Unified API Architecture

**Core Principle**: Same endpoint, different behavior based on role

**Database Integration**: Direct Firebase Firestore integration in API routes (server-side only)

**Data Flow**: UI → API Route → Firebase Firestore

**Example - `/api/shops`:**

- **Guest/User**: Returns only public, verified shops (Firebase query with filters)
- **Seller**: Returns own shops + public shops (Firebase query with role-based filters)
- **Admin**: Returns all shops with advanced filters (Firebase query with admin access)

**Benefits:**

- ✅ Reduced code duplication (no separate `/api/admin/shops`, `/api/seller/shops`)
- ✅ Direct database integration (simpler architecture)
- ✅ Easier maintenance (single layer to modify)
- ✅ Consistent API surface (predictable URLs)
- ✅ Better security (centralized authorization in API routes)
- ✅ Easier debugging (direct Firebase queries)
- ✅ Better performance (no extra abstraction layer)

**Database Integration:**

- All API routes integrate directly with Firebase Firestore
- Use Firebase Admin SDK in API routes (server-side only)
- Role-based queries using Firestore where clauses
- Ownership validation using session user ID
- Batch operations for complex transactions

**See `UNIFIED_API_ARCHITECTURE.md` for complete documentation**

---

## Quick Reference: Unified API Endpoints

| Resource       | Endpoint                                 | GET                                     | POST                          | PATCH                         | DELETE                |
| -------------- | ---------------------------------------- | --------------------------------------- | ----------------------------- | ----------------------------- | --------------------- |
| **Shops**      | `/api/shops`                             | List (filtered by role)                 | Create (seller/admin)         | -                             | -                     |
|                | `/api/shops/[slug]`                      | Detail (role-based)                     | -                             | Update (owner/admin)          | Delete (owner/admin)  |
|                | `/api/shops/[slug]/verify`               | -                                       | -                             | Verify (admin)                | -                     |
|                | `/api/shops/[slug]/ban`                  | -                                       | -                             | Ban (admin)                   | -                     |
|                | `/api/shops/[slug]/feature`              | -                                       | -                             | Feature (admin)               | -                     |
|                | `/api/shops/[slug]/payments`             | Payments (owner/admin)                  | Process (admin)               | -                             | -                     |
| **Products**   | `/api/products`                          | List (role-filtered)                    | Create (seller/admin)         | -                             | -                     |
|                | `/api/products/[slug]`                   | Detail (public/owner)                   | -                             | Update (owner/admin)          | Delete (owner/admin)  |
|                | `/api/products/[slug]/variants`          | Variants (same leaf category)           | -                             | -                             | -                     |
|                | `/api/products/[slug]/similar`           | Similar (max 10, diverse shops)         | -                             | -                             | -                     |
|                | `/api/products/[slug]/seller-items`      | Seller other products (shop_id)         | -                             | -                             | -                     |
| **Categories** | `/api/categories`                        | List (public)                           | Create (admin)                | -                             | -                     |
|                | `/api/categories/[slug]`                 | Detail (public)                         | -                             | Update (admin)                | Delete (admin)        |
|                | `/api/categories/tree`                   | Tree (public)                           | -                             | -                             | -                     |
|                | `/api/categories/leaves`                 | Leaves (public)                         | -                             | -                             | -                     |
|                | `/api/categories/[slug]/recent-products` | Recent products (10)                    | -                             | -                             | -                     |
| **Orders**     | `/api/orders`                            | List (role-filtered)                    | Create (user)                 | -                             | -                     |
|                | `/api/orders/[id]`                       | Detail (owner/seller/admin)             | -                             | Update status (seller/admin)  | -                     |
|                | `/api/orders/[id]/shipment`              | -                                       | Create (seller/admin)         | -                             | -                     |
|                | `/api/orders/[id]/cancel`                | -                                       | Cancel (user/admin pre-ship)  | -                             | -                     |
|                | `/api/orders/[id]/track`                 | Tracking info                           | -                             | -                             | -                     |
|                | `/api/orders/[id]/invoice`               | Invoice PDF (rate limited)              | -                             | -                             | -                     |
| **Returns**    | `/api/returns`                           | List (role-filtered)                    | Initiate (user)               | -                             | -                     |
|                | `/api/returns/[id]`                      | Detail (owner/seller/admin)             | -                             | Update (seller/admin)         | -                     |
|                | `/api/returns/[id]/approve`              | -                                       | Approve (seller/admin)        | -                             | -                     |
|                | `/api/returns/[id]/refund`               | -                                       | Process (seller/admin)        | -                             | -                     |
|                | `/api/returns/[id]/resolve`              | -                                       | Resolve (admin)               | -                             | -                     |
|                | `/api/returns/[id]/media`                | Signed upload URLs (GET)                | Confirm uploaded media (POST) | -                             | -                     |
| **Coupons**    | `/api/coupons`                           | List (public active/owner all)          | Create (seller/admin)         | -                             | -                     |
|                | `/api/coupons/[code]`                    | Detail (public/owner)                   | -                             | Update (owner/admin)          | Delete (owner/admin)  |
| **Reviews**    | `/api/reviews`                           | List (public approved)                  | Create (user)                 | -                             | -                     |
|                | `/api/reviews/[id]`                      | Detail (public)                         | -                             | Moderate (owner/admin)        | Delete (author/admin) |
| **Users**      | `/api/users`                             | List (admin)                            | -                             | -                             | -                     |
|                | `/api/users/[id]`                        | Detail (self/admin)                     | -                             | Update (self/admin)           | -                     |
|                | `/api/users/[id]/ban`                    | -                                       | -                             | Ban (admin)                   | -                     |
|                | `/api/users/[id]/role`                   | -                                       | -                             | Change role (admin)           | -                     |
| **Analytics**  | `/api/analytics`                         | Get (seller: own, admin: all)           | -                             | -                             | -                     |
| **Revenue**    | `/api/revenue`                           | Get (seller: own, admin: all)           | -                             | -                             | -                     |
| **Payouts**    | `/api/payouts`                           | List (seller: own, admin: all)          | Request (seller)              | -                             | -                     |
|                | `/api/payouts/[id]`                      | -                                       | -                             | Approve (admin)               | -                     |
| **Media**      | `/api/media/upload`                      | -                                       | Upload (authenticated)        | -                             | -                     |
|                | `/api/media/[id]`                        | -                                       | -                             | Update metadata (owner/admin) | Delete (owner/admin)  |
| **Auctions**   | `/api/auctions`                          | List (role-filtered)                    | Create (seller/admin)         | -                             | -                     |
|                | `/api/auctions/[id]`                     | Detail (public)                         | -                             | Update (owner/admin)          | Delete (owner/admin)  |
|                | `/api/auctions/[id]/bid`                 | List bids (public)                      | Place bid (user)              | -                             | -                     |
|                | `/api/auctions/[id]/feature`             | -                                       | -                             | Feature (admin)               | -                     |
|                | `/api/auctions/live`                     | Live auctions (public)                  | -                             | -                             | -                     |
|                | `/api/auctions/featured`                 | Featured auctions (public)              | -                             | -                             | -                     |
|                | `/api/auctions/watchlist`                | User watchlist (auth)                   | Add/remove watch (user)       | -                             | -                     |
|                | `/api/auctions/my-bids`                  | User bids (auth)                        | -                             | -                             | -                     |
|                | `/api/auctions/won`                      | Won auctions (auth)                     | -                             | -                             | -                     |
|                | `/api/auctions/[id]/similar`             | Similar auctions (max 10)               | -                             | -                             | -                     |
| **Search**     | `/api/search`                            | Universal search (products or auctions) | -                             | -                             | -                     |
| **Docs**       | `/api/swagger`                           | OpenAPI JSON                            | -                             | -                             | -                     |
|                | `/api-docs`                              | Swagger UI (Next.js page)               | -                             | -                             | -                     |

**Legend:**

- 📖 Public access
- 🔐 Authenticated users
- 👤 Owner only
- 🏪 Shop owner/Seller
- 👑 Admin only

---

## Phase 1: Static Pages & SEO Foundation

### 1.1 FAQ Section & Page ✅ COMPLETED

- [x] Create `/src/app/faq/page.tsx` - FAQ page component
- [x] Create `/src/components/faq/FAQSection.tsx` - Reusable FAQ component
- [x] Create `/src/components/faq/FAQItem.tsx` - Individual FAQ accordion item
- [x] Add FAQ section to homepage (`/src/app/page.tsx`)
- [x] Add FAQ data structure in `/src/constants/faq.ts`
- [x] Add FAQ link to footer navigation (`/src/constants/footer.ts`)
- [x] **UPDATE (Nov 7, 2025): Enhanced all 40+ FAQs with India-specific content** (UPI, customs, unboxing video, COD policy, GST, KYC, etc.)
- [ ] Create FAQ schema markup for SEO (moved to Phase 1.3)

### 1.2 Policy & Legal Pages ✅ COMPLETED

- [x] Create `/src/app/privacy-policy/page.tsx` - Privacy Policy
- [x] Create `/src/app/terms-of-service/page.tsx` - Terms of Service
- [x] Create `/src/app/refund-policy/page.tsx` - Refund Policy (with India-specific requirements)
- [x] Create `/src/app/shipping-policy/page.tsx` - Shipping Policy (India-focused)
- [x] Create `/src/app/cookie-policy/page.tsx` - Cookie Policy
- [x] Create `/src/components/legal/LegalPageLayout.tsx` - Unified legal page wrapper
- [x] Add legal page links to footer (`/src/constants/footer.ts`)
- [x] Add last updated dates and version tracking

### 1.3 SEO & Crawler Support ✅ COMPLETED

- [x] Create `/src/app/sitemap.ts` - Dynamic sitemap generation
- [x] Create `/src/app/robots.ts` - Robots.txt configuration
- [x] Create `/src/lib/seo/metadata.ts` - SEO metadata utilities
- [x] Create `/src/lib/seo/schema.ts` - Schema.org markup utilities
- [x] Add Open Graph tags to layout
- [x] Add Twitter Card metadata to layout
- [x] Create `/public/manifest.json` - PWA manifest
- [x] Implement breadcrumb JSON-LD schema (enhanced Breadcrumb component)
- [x] Add canonical URLs to all pages (via metadata.ts)
- [x] Organization & WebSite JSON-LD schemas in root layout

---

## Phase 2: Shared Components & Utilities

### 2.1 Reusable CRUD Components ✅ COMPLETED

- [x] Create `/src/components/common/DataTable.tsx` - Unified data table with sorting, filtering, pagination
- [x] Create `/src/components/common/InlineEditor.tsx` - Quick inline edit component
- [x] Create `/src/components/common/FormModal.tsx` - Modal for create/edit forms
- [x] Create `/src/components/common/ConfirmDialog.tsx` - Confirmation dialog for delete/ban actions
- [x] Create `/src/components/common/StatusBadge.tsx` - Unified status indicator
- [x] Create `/src/components/common/ActionMenu.tsx` - Dropdown action menu
- [x] Create `/src/components/common/FilterBar.tsx` - Unified filter interface (top bar for quick filters)
- [x] Create `/src/components/common/FilterSidebar.tsx` - **Advanced filter sidebar (collapsible on mobile, visible on desktop)**
- [x] Create `/src/components/common/StatsCard.tsx` - Analytics card component
- [x] Create `/src/components/common/EmptyState.tsx` - Empty state placeholder

### 2.2 Form Components ✅ COMPLETED

- [x] Create `/src/components/common/RichTextEditor.tsx` - Rich text editor for descriptions, blog posts
- [x] Create `/src/components/common/CategorySelector.tsx` - Tree category selector (leaf-only for sellers)
- [x] Create `/src/components/common/TagInput.tsx` - Tag input with autocomplete suggestions
- [x] Create `/src/components/common/DateTimePicker.tsx` - Date/time picker (date, time, datetime modes)
- [x] Create `/src/components/common/SlugInput.tsx` - Auto-generate slug from title with validation

### 2.2.1 Advanced Media Components ✅ COMPLETED

- [x] Create `/src/components/media/MediaUploader.tsx` - Unified media uploader (photos/videos from file or camera)
- [x] Create `/src/components/media/CameraCapture.tsx` - Camera photo capture component
- [x] Create `/src/components/media/VideoRecorder.tsx` - Video recording component (camera or screen)
- [x] Create `/src/components/media/ImageEditor.tsx` - Image adjustment tool (crop, rotate, zoom, flip, filters)
- [x] Create `/src/components/media/VideoThumbnailGenerator.tsx` - Generate video thumbnails using canvas
- [x] Create `/src/components/media/MediaPreviewCard.tsx` - Preview card for images/videos before upload
- [x] Create `/src/components/media/MediaEditorModal.tsx` - Modal wrapper for media editing
- [x] Create `/src/components/media/MediaGallery.tsx` - Gallery view for multiple media items
- [x] Create `/src/components/media/MediaMetadataForm.tsx` - Form for slug and description of media
- [x] Create `/src/lib/media/image-processor.ts` - Image processing utilities (crop, rotate, resize, filters)
- [x] Create `/src/lib/media/video-processor.ts` - Video thumbnail extraction utilities
- [x] Create `/src/lib/media/media-validator.ts` - Media validation (size, format, dimensions)
- [x] Create `/src/types/media.ts` - Media types (MediaFile, MediaMetadata, EditorState)

**Complete:** All media components and utilities are production-ready.
**Features:** File upload (drag-drop, file picker), camera capture, video recording (camera/screen), image editing (rotate, flip, brightness, contrast, saturation, filters), video thumbnail generation, gallery with lightbox, drag-drop reorder, bulk actions, metadata forms with auto-slug.
**See:** `/CHECKLIST/MEDIA_COMPONENTS_GUIDE.md` for integration guide

### 2.3 Public Display Cards ✅ COMPLETED

- [x] Create `/src/components/cards/ProductCard.tsx` - Product card for listings (image, name, price, rating, quick actions)
- [x] Create `/src/components/cards/ShopCard.tsx` - Shop card for shop listings (logo, name, rating, products count, featured badge)
- [x] Create `/src/components/cards/CategoryCard.tsx` - Category card with image and product count
- [x] Create `/src/components/cards/AuctionCard.tsx` - Auction card for listings (image, current bid, time remaining, watch button)
- [x] Create `/src/components/cards/ProductCardSkeleton.tsx` - Loading skeleton for product card
- [x] Create `/src/components/cards/ShopCardSkeleton.tsx` - Loading skeleton for shop card
- [x] Create `/src/components/cards/CategoryCardSkeleton.tsx` - Loading skeleton for category card
- [x] Create `/src/components/cards/AuctionCardSkeleton.tsx` - Loading skeleton for auction card
- [x] Create `/src/components/cards/CardGrid.tsx` - Responsive grid wrapper for cards
- [x] Create `/src/components/cards/ProductQuickView.tsx` - Quick view modal for products
- [x] Create `/src/components/cards/AuctionQuickView.tsx` - Quick view modal for auctions with bid placement

**Complete:** All card components and skeletons are production-ready.
**Features:** Product cards (add to cart, favorites, quick view), shop cards (follow, verified badge), category cards (3 variants), auction cards (current bid, countdown timer, watch button, ending soon badge), loading skeletons, responsive grid, quick view modals with image gallery.
**Product Features:** Quantity selector, specifications, add to cart, favorites.
**Auction Features:** Bid placement form, auto-bid option, watchlist, countdown timer, bid history display, ending soon alerts.
**Design:** eBay-style cards with hover effects, badges, price/bid formatting (Indian Rupees), condition tags, stock status, time remaining indicators, verified shop badges.

### 2.4 Shared Utilities ✅ COMPLETED

- [x] Create `/src/lib/rbac.ts` - Role-based access control utilities
- [x] Create `/src/lib/validation/shop.ts` - Shop validation schemas
- [x] Create `/src/lib/validation/product.ts` - Product validation schemas
- [x] Create `/src/lib/validation/coupon.ts` - Coupon validation schemas
- [x] Create `/src/lib/validation/category.ts` - Category validation schemas
- [x] Create `/src/lib/validation/auction.ts` - Auction validation schemas
- [x] Create `/src/lib/formatters.ts` - Currency, date, number formatters
- [x] Create `/src/lib/export.ts` - CSV/PDF export utilities
- [x] Update `/src/types/index.ts` - Add types for Shop, Product, Order, etc.

**Complete:** All shared utilities are production-ready.
**Features:** RBAC with role hierarchy and permissions, comprehensive Zod validation schemas (shop/product/coupon/category/auction), formatters for currency (Indian Rupees), dates, numbers, percentages, phone, file size, duration, export utilities (CSV for products/orders/revenue/customers, invoice HTML generation, print/download), complete TypeScript type definitions for all entities.
**Integration:** ProductCard and ShopCard already using formatters for currency and numbers.

### 2.5 Constants & Configuration ✅ COMPLETED

- [x] Create `/src/constants/database.ts` - **Database collection names (SHOPS, PRODUCTS, ORDERS, etc.)**
- [x] Create `/src/constants/storage.ts` - **Storage bucket names (PRODUCT_IMAGES, SHOP_LOGOS, etc.)**
- [x] Create `/src/constants/filters.ts` - **Filter configurations for each resource type**
- [x] Create `/src/constants/media.ts` - **Media upload limits, formats, validation rules**
- [x] Update `/src/constants/navigation.ts` - Add seller/admin navigation items (already present)

### 2.6 Upload Context & State Management ✅ COMPLETED

- [x] Create `/src/contexts/UploadContext.tsx` - **Global upload state management (track pending uploads)**
- [x] Create `/src/hooks/useUploadQueue.ts` - **Hook for managing upload queue**
- [x] Create `/src/hooks/useMediaUpload.ts` - **Hook for media uploads with retry logic**
- [x] Create `/src/lib/upload-manager.ts` - **Upload manager utility (handle failed uploads, retry)**
- [x] Create `/src/components/common/UploadProgress.tsx` - **Global upload progress indicator**
- [x] Create `/src/components/common/PendingUploadsWarning.tsx` - **Warning before navigation with pending uploads**

**Complete:** All upload management components are production-ready.
**Features:** Global upload context with progress tracking, automatic queue processing (max 3 concurrent), retry logic with exponential backoff, failed upload persistence (localStorage), progress indicator (fixed bottom-right), pending uploads warning (prevents navigation), upload statistics.
**UploadContext:** Track uploads (pending/uploading/success/error), add/update/remove uploads, retry failed, clear completed/failed/all, counts (pending/uploading/failed/success).
**useUploadQueue:** Auto-process queue (configurable concurrency), XMLHttpRequest with progress tracking, start/pause/retry controls, cancel individual uploads.
**useMediaUpload:** Single file upload with validation (size/type), progress callback, success/error handling, retry with max attempts, reset/cancel.
**upload-manager:** Failed upload persistence, cleanup old uploads (7 days), exponential backoff retry, upload statistics, resource context tracking.
**UploadProgress:** Expandable/collapsible UI, real-time progress bars, status icons (pending/uploading/success/error), retry failed button, clear actions, minimized view.
**PendingUploadsWarning:** Browser refresh/back/forward interception, Next.js navigation interception, upload count display, stay/leave actions.

### 2.7 Filter Components (Resource-Specific) ✅ COMPLETED

- [x] Create `/src/components/filters/ProductFilters.tsx` - **Product filter sidebar (price, category, stock, condition)**
- [x] Create `/src/components/filters/ShopFilters.tsx` - **Shop filter sidebar (verified, rating, categories)**
- [x] Create `/src/components/filters/OrderFilters.tsx` - **Order filter sidebar (status, date range, amount, shop)**
- [x] Create `/src/components/filters/ReturnFilters.tsx` - **Return filter sidebar (status, date, reason, intervention)**
- [x] Create `/src/components/filters/CouponFilters.tsx` - **Coupon filter sidebar (type, status, shop, expiry)**
- [x] Create `/src/components/filters/UserFilters.tsx` - **User filter sidebar (role, status, registration date)**
- [x] Create `/src/components/filters/CategoryFilters.tsx` - **Category filter sidebar (featured, homepage, parent)**
- [x] Create `/src/components/filters/ReviewFilters.tsx` - **Review filter sidebar (rating, status, verified purchase)**
- [x] Create `/src/components/filters/AuctionFilters.tsx` - **Auction filter sidebar (status, time left, bid range, featured)**
- [x] Create `/src/hooks/useFilters.ts` - **Hook for managing filter state and URL sync**
- [x] Create `/src/lib/filter-helpers.ts` - **Filter utilities (build query from filters, persist filters)**

**Complete:** All filter components are production-ready with consistent API and styling.
**Features:** URL synchronization, localStorage persistence, active filter count, clear all, apply filters button, mobile-responsive design.
**Components:** ProductFilters, ShopFilters, OrderFilters, ReturnFilters, CouponFilters, UserFilters, CategoryFilters, ReviewFilters, AuctionFilters.
**Hook:** useFilters (filter state management, URL sync, localStorage persistence, onChange callback).
**Utilities:** buildQueryFromFilters, filtersToSearchParams, searchParamsToFilters, persistFilters, loadPersistedFilters, getActiveFilterCount, hasActiveFilters, filtersToSummary, validateFilters.
**See:** `/CHECKLIST/PHASE_2.7_FILTER_COMPONENTS.md` for integration guide and usage examples

### 2.8 Service Layer Foundation ✅ COMPLETED (Client-side wrappers only)

**Pattern: Client-side API wrappers following auth.service.ts**

**⚠️ ARCHITECTURE CHANGE (Nov 7, 2025)**: Service layer will remain as client-side API wrappers only. All database operations will be integrated directly in API routes using Firebase Admin SDK.

- [x] Create `/src/services/index.ts` - **Export all services**
- [x] Create `/src/services/shops.service.ts` - **Client-side shops API wrapper (calls /api/shops using apiService)**
- [x] Create `/src/services/products.service.ts` - **Client-side products API wrapper (calls /api/products using apiService)**
- [x] Create `/src/services/orders.service.ts` - **Client-side orders API wrapper (calls /api/orders using apiService)**
- [x] Create `/src/services/coupons.service.ts` - **Client-side coupons API wrapper (calls /api/coupons using apiService)**
- [x] Create `/src/services/categories.service.ts` - **Client-side categories API wrapper (calls /api/categories using apiService)**
- [x] Create `/src/services/auctions.service.ts` - **Client-side auctions API wrapper (calls /api/auctions using apiService)**
- [x] Create `/src/services/returns.service.ts` - **Client-side returns API wrapper (calls /api/returns using apiService)**
- [x] Create `/src/services/reviews.service.ts` - **Client-side reviews API wrapper (calls /api/reviews using apiService)**
- [x] Create `/src/services/users.service.ts` - **Client-side users API wrapper (calls /api/users using apiService)**
- [x] Create `/src/services/analytics.service.ts` - **Client-side analytics API wrapper (calls /api/analytics using apiService)**
- [x] Create `/src/services/media.service.ts` - **Client-side media API wrapper (calls /api/media using apiService)**
- [x] Create `/src/services/cart.service.ts` - **Client-side cart API wrapper (calls /api/cart using apiService)**
- [x] Create `/src/services/favorites.service.ts` - **Client-side favorites API wrapper (calls /api/favorites using apiService)**
- [x] Create `/src/services/support.service.ts` - **Client-side support API wrapper (calls /api/support using apiService)**
- [ ] **OPTIONAL**: Update UI components to use services instead of direct fetch()

**Complete:** All 13 service wrappers implemented following auth.service.ts pattern.
**Features:** Type-safe API clients, consistent error handling, guest storage helpers (cart/favorites), pagination support, filter builders, file upload handling, local caching.
**Services:** shops, products, orders, coupons, categories, auctions, returns, reviews, users, analytics, media, cart, favorites, support.
**Guest Support:** Cart and favorites services include localStorage helpers for guest users with auto-sync on login.
**Media Handling:** Media service includes file validation, constraints by context, signed URL uploads, multi-file support.
**Pattern:** UI Component → Service.method() (optional) → API Route → Firebase Admin SDK → Firestore
**Alternative Pattern:** UI Component → fetch('/api/endpoint') → API Route → Firebase Admin SDK → Firestore
**Next:** Phase 3.2 - Setup Firebase Admin SDK for database integration in API routes
**Reference:** `/src/services/auth.service.ts` is THE template services follow.
**Architecture:** Services are client-side (no database imports), use apiService for HTTP calls, API routes handle database operations directly with Firebase Admin SDK.
**See:** `/CHECKLIST/SERVICE_LAYER_ARCHITECTURE.md` and `/CHECKLIST/SERVICE_LAYER_QUICK_REF.md` for service wrapper usage

---

## Phase 3: Seller Dashboard & Shop Management

**🎯 KEY ARCHITECTURAL DECISION: Unified Seller/Admin Interface**

**Why?** Admins are essentially "super sellers" who can manage all shops. Instead of building separate admin routes for shops/products/coupons/auctions/orders/returns, we use the **same seller routes** with role-based permissions.

**Benefits:**

- ✅ **50% less code** - No duplicate admin pages for shop management
- ✅ **Consistent UX** - Admins and sellers use identical interfaces
- ✅ **Easier maintenance** - One codebase for both roles
- ✅ **Faster development** - Build once, use for both roles
- ✅ **Better testing** - Test one interface instead of two

**How It Works:**

1. **Shop Selector Dropdown**:
   - Sellers see "My Shop" or their shops
   - Admins see "All Shops" + dropdown with all shops
2. **API Role Detection**:
   - Sellers: `GET /api/products?shop_id=user_shop`
   - Admins: `GET /api/products` (returns all shops' products)
3. **Permission Checks**:
   - Sellers can only edit their own shop's items
   - Admins can edit any shop's items
4. **Additional Admin Actions**:
   - Shop verification, ban, feature flags
   - Unlimited auction creation (vs 5 per shop for sellers)
   - Dispute resolution, ticket assignment

**Admin-Only Routes:**

- `/admin/users` - User management (ban, role change)
- `/admin/categories` - Category tree management
- `/admin/hero-slides` - Homepage hero carousel
- `/admin/featured-sections` - Homepage featured categories/shops
- `/admin/blog` - Blog management

**Shared Routes (Role-Based Permissions):**

- `/seller/my-shops` - Shop list/create/edit (admins see all)
- `/seller/products` - Product management (admins see all shops)
- `/seller/coupons` - Coupon management (admins see all shops)
- `/seller/auctions` - Auction management (admins unlimited, sellers 5 max)
- `/seller/orders` - Order management (admins see all)
- `/seller/returns` - Returns management (admins see all + resolve)
- `/seller/analytics` - Analytics (admins see all shops)
- `/seller/reviews` - Reviews (admins see all + moderate)
- `/seller/support-tickets` - Support tickets (admins see all + assign)

### 3.1 Seller Layout & Navigation ✅ COMPLETED

- [x] Create `/src/app/seller/layout.tsx` - Seller dashboard layout
- [x] Create `/src/components/seller/SellerSidebar.tsx` - Seller navigation sidebar
- [x] Create `/src/components/seller/SellerHeader.tsx` - Seller dashboard header
- [x] Create `/src/app/seller/page.tsx` - Seller dashboard page with stats and quick actions
- [x] Create `/src/lib/utils.ts` - Utility functions (cn for class merging)
- [x] Add seller route protection with AuthGuard (role: seller + admin)
- [x] Install dependencies (clsx, tailwind-merge)

**Reset (Nov 7, 2025): Phase 3 restarted. Only dashboard is ready.**

### 3.2 Database Integration Setup

- [x] Create `/src/app/api/lib/firebase/admin.ts` - **Firebase Admin SDK initialization (server-side only, in API folder)**
- [x] Create `/src/app/api/lib/firebase/collections.ts` - **Firestore collection references and helpers (in API folder)**
- [x] Create `/src/app/api/lib/firebase/queries.ts` - **Common Firestore query builders (role-based filters, in API folder)**
- [x] Create `/src/app/api/lib/firebase/transactions.ts` - **Transaction helpers for complex operations (in API folder)**
- [ ] Update `/src/constants/database.ts` - Add Firestore collection names (verify completeness)
- [ ] Setup Firebase Admin SDK credentials (service account JSON)
- [ ] Configure Firebase Admin environment variables
- [x] Test Firebase Admin connection in API route (`/api/test/firebase`)
- [x] Create database indexes for common queries (updated `firestore.indexes.json`)
- [x] Document initial composite indexes (shops, products, coupons, categories, auctions, bids, favorites) added Nov 7, 2025
- [ ] Document Firebase security rules for production

**Slug Cleanup:** Legacy `[id]` shop/product routes removed; only `[slug]` now active.

### 3.3 My Shops Management (Slug-based)

- [ ] Create `/src/app/seller/my-shops/page.tsx` - List all shops (admins see all, users see their 1) **with FilterSidebar**
- [ ] Create `/src/app/seller/my-shops/create/page.tsx` - Create shop form **→ redirect to edit page after creation using slug**
- [ ] Create `/src/components/seller/ShopForm.tsx` - Unified shop form component
- [ ] Implement shop creation limit (1 for users, unlimited for admins)
- [x] Create `/src/app/api/shops/route.ts` - **Unified Shops API with Firebase integration** (GET: role-based query, POST: create with ownership, **supports slug parameter**)
- [ ] Create `/src/app/seller/my-shops/[slug]/edit/page.tsx` - **Edit shop form using slug (SEO-friendly)** with media uploads (logo/banner)
- [ ] Create `/src/app/seller/my-shops/[slug]/page.tsx` - **Shop details/dashboard using slug**
- [ ] Create `/src/app/api/shops/[slug]/route.ts` - **GET/PATCH/DELETE by slug (use ID internally)**
- [ ] Create `/src/app/api/shops/validate-slug/route.ts` - **Live slug uniqueness check API** (GET: check if slug exists in shops collection)
- [x] Add real-time slug validation in ShopForm (check uniqueness while typing, debounced)
- [ ] Add Firestore index for shops queries (owner_id, verified, featured, created_at, **slug**) ✅ Implemented (see firestore.indexes.json)

**Pattern:** UI → fetch('/api/shops') → API Route → Firebase Admin SDK → Firestore (shops collection)
**SEO:** Shops use slug-based URLs like `/seller/my-shops/awesome-shop/edit` instead of IDs.

### 3.4 Product Management (Centralized, Slug-based)

**Architecture Change:** Products managed from `/seller/products` with shop selector dropdown instead of nested under shop routes.

- [ ] Create `/src/app/seller/products/page.tsx` - **Centralized product list with shop selector dropdown + ProductFilters sidebar (admins see all shops, sellers see own)**
- [ ] Create `/src/app/seller/products/create/page.tsx` - **Product creation with shop dropdown selector → redirect to edit page using slug (admins select any shop, sellers select from own)**
- [ ] Create `/src/app/seller/products/[slug]/edit/page.tsx` - **Product edit using slug (SEO-friendly) with shop dropdown (admins can edit any, sellers edit own)**
- [ ] Create `/src/components/seller/ShopSelector.tsx` - **Dropdown to select shop (admins: all shops, sellers: own shops, filters products/coupons/auctions/analytics by selected shop)**
- [ ] Create `/src/components/seller/ProductTable.tsx` - Product table with inline actions **+ filter support**
- [ ] Create `/src/components/seller/ProductInlineForm.tsx` - Quick product creation (name, price, category, slug, image)
- [] Create `/src/components/seller/ProductFullForm.tsx` - Complete product form (SEO, condition, returnable, publish date)
- [x] Create `/src/app/api/products/route.ts` - **Unified Products API with Firebase** (GET: role-based query, POST: create with shop_id, **supports slug parameter**)
- [x] Create `/src/app/api/products/[slug]/route.ts` - **Unified Product API with Firebase** (GET/PATCH/DELETE by slug)
- [x] Create `/src/app/api/products/validate-slug/route.ts` - **Live slug uniqueness check API** (GET: check if slug exists in products collection, scoped to shop_id)
- [ ] Add real-time slug validation in ProductFullForm (check uniqueness while typing, debounced, per shop)
- [x] Add Firestore indexes for products queries (shop_id, slug, category_id, status, price, created_at) ✅ Added composite indexes incl. shop_id+slug and category_id+status+price
- [x] Add unique compound index (shop_id + slug) to ensure slug uniqueness per shop ✅ Added

**Pattern:** API Route → Firebase Admin SDK → Firestore (products collection)
**Security:** Validate shop ownership before allowing product creation/modification
**Database:** Products save shop_id (not user_id), link to shops collection
**SEO:** Use slugs in URLs: `/seller/products/awesome-laptop/edit` instead of IDs

### 3.5 Coupon Management (Centralized, Code-based)

**Architecture Change:** Coupons managed from `/seller/coupons` with shop selector dropdown.

- [ ] Create `/src/app/seller/coupons/page.tsx` - **Centralized coupon list with shop selector + CouponFilters sidebar (admins see all, sellers see own)**
- [ ] Create `/src/app/seller/coupons/create/page.tsx` - **Create coupon with shop dropdown selector (admins select any shop, sellers select own)**
- [ ] Create `/src/app/seller/coupons/[code]/edit/page.tsx` - **Edit coupon with shop dropdown (admins can edit any, sellers edit own)** (Coupons use CODE)
- [ ] Create `/src/components/seller/CouponForm.tsx` - Coupon form with discount types
- [ ] Implement coupon types: Percentage, Flat, BOGO (Buy X Get Y), Tiered discounts
- [ ] Create `/src/components/seller/CouponPreview.tsx` - Coupon preview component
- [ ] Create `/src/lib/coupon-calculator.ts` - Coupon calculation logic
- [x] Create `/src/app/api/coupons/route.ts` - **Unified Coupons API with Firebase** (GET: by shop, POST: seller/admin only)
- [x] Create `/src/app/api/coupons/[code]/route.ts` - **Unified Coupon API with Firebase** (GET: public if active, PATCH/DELETE: owner/admin only)
- [x] Create `/src/app/api/coupons/validate-code/route.ts` - **Live coupon code uniqueness check API** (GET: check if code exists, scoped to shop_id)
- [ ] Add real-time code validation in CouponForm (check uniqueness while typing, debounced, per shop)
- [x] Add Firestore indexes for coupons queries (shop_id, code, active, expiry_date) ✅ Added (shop_id+code, shop_id+is_active+end_date)
- [x] Add unique compound index (shop_id + code) to ensure code uniqueness per shop ✅ Added

**Pattern:** API Route → Firebase Admin SDK → Firestore (coupons collection)
**Security:** Validate shop ownership before allowing coupon creation/modification
**Code Note:** Coupons use coupon CODE (not slug) - codes must be unique per shop

### 3.6 Shop Analytics (Per-Shop View)

- [ ] Create `/src/app/seller/analytics/page.tsx` - **Analytics dashboard with shop selector dropdown (admins see all shops, sellers see own)**
- [ ] Create `/src/components/seller/AnalyticsOverview.tsx` - Overview cards (products, orders, revenue)
- [ ] Create `/src/components/seller/SalesChart.tsx` - Sales chart component
- [ ] Create `/src/components/seller/TopProducts.tsx` - Top selling products
- [ ] Create `/src/components/seller/PayoutRequest.tsx` - Request payout form
- [ ] Create `/src/app/api/analytics/route.ts` - **Unified Analytics API with Firebase** (GET: aggregated queries filtered by role & ownership)
- [ ] Add Firestore composite indexes for analytics queries (shop_id + date range, status filters)

---

## Phase 5: Admin Dashboard

**⚠️ ARCHITECTURE UPDATE**: Admin uses the same `/seller/*` routes with elevated permissions. No separate `/admin` routes needed for shop/product/coupon/auction management.

### 5.1 Admin Layout & Navigation

- [ ] Create `/src/app/admin/layout.tsx` - Admin dashboard layout **OR** reuse `/src/app/seller/layout.tsx` with role-based menu
- [ ] Create `/src/components/admin/AdminSidebar.tsx` - Admin navigation sidebar **OR** extend SellerSidebar with admin-only items
- [ ] Create `/src/components/admin/AdminHeader.tsx` - Admin dashboard header **OR** extend SellerHeader
- [ ] Update `/src/constants/navigation.ts` - Add admin navigation items (User Management, Category Management, etc.)
- [ ] Add admin route protection with AuthGuard (role: admin)

### 5.6 Category Management (Admin Only) — Slug-based & Global

- [ ] Create `/src/app/admin/categories/page.tsx` - Category tree view with inline editing **+ CategoryFilters**
- [ ] Create `/src/app/admin/categories/create/page.tsx` - Create category (full form)
- [ ] Create `/src/app/admin/categories/[slug]/edit/page.tsx` - Edit category (full form) **with media retry**
- [ ] Create `/src/components/admin/CategoryTree.tsx` - Tree view with drag-drop reordering
- [ ] Create `/src/components/admin/CategoryInlineForm.tsx` - Quick create (name, featured, homepage, slug)
- [ ] Create `/src/components/admin/CategoryFullForm.tsx` - Full form (SEO, image, description)
- [ ] Create `/src/components/admin/CategorySelector.tsx` - Leaf-only selector for sellers
- [ ] Implement leaf-node validation for seller product creation
- [x] Create `/src/app/api/categories/route.ts` - **Unified Categories API with Firebase** (GET: public tree, POST: admin only)
- [x] Create `/src/app/api/categories/[slug]/route.ts` - **Unified Category API with Firebase** (GET: public, PATCH/DELETE: admin only)
- [x] Create `/src/app/api/categories/tree/route.ts` - **Category Tree with Firebase** (GET: public, full tree structure)
- [x] Create `/src/app/api/categories/leaves/route.ts` - **Leaf Categories with Firebase** (GET: public, for product creation)
- [x] Create `/src/app/api/categories/validate-slug/route.ts` - **Live slug uniqueness check (global)**
- [x] Add Firestore indexes for categories queries (parent_id, level, featured, homepage_display, slug) ✅ Added (parent_id+slug, is_featured+slug, show_on_homepage+sort_order, slug)

**Note:** Categories are global, not shop-specific.

---

## Phase 6: User Pages & Shopping Experience

### 6.7 Shop & Category Pages (Slug-based)

- [ ] Create `/src/app/shops/[slug]/page.tsx` - **Shop details page with products AND auctions tabs**
- [ ] Create `/src/components/shop/ShopHeader.tsx` - **Shop banner, logo, name, rating**
- [ ] Create `/src/components/shop/ShopProducts.tsx` - **Shop products grid with filters**
- [ ] Create `/src/components/shop/ShopAuctions.tsx` - **Shop auctions grid (active/ended)**
- [ ] Create `/src/components/shop/ShopAbout.tsx` - **Shop description and policies**
- [ ] Create `/src/components/shop/ShopReviews.tsx` - **Shop reviews section**
- [ ] Create `/src/components/shop/ShopCategories.tsx` - **Derived from global categories (filters only)**
- [ ] Create `/src/components/shop/FollowShopButton.tsx` - **Follow/unfollow shop**
- [ ] Create `/src/app/categories/[slug]/page.tsx` - **Category page with products (realtime search)**
- [ ] Create `/src/components/category/CategoryHeader.tsx` - **Category banner and description**
- [ ] Create `/src/components/category/CategoryProducts.tsx` - **Products in category with filters**
- [ ] Create `/src/components/category/CategorySearch.tsx` - **Realtime category search**
- [ ] Create `/src/components/category/SubcategoryNav.tsx` - **Subcategory navigation**
- [ ] Use `/src/app/api/shops/[slug]/route.ts` - **Unified Shop API (public shop details)**
- [ ] Use `/src/app/api/categories/[slug]/route.ts` - **Unified Category API (public category)**
- [ ] Create `/src/app/api/categories/[slug]/recent-products/route.ts` - **Get 10 recent products from category**
- [ ] Create `/src/app/api/shops/[slug]/recent-products/route.ts` - **Get 10 recent products from shop**

### 6.8 Product Pages (Slug-based)

- [ ] Create `/src/app/products/[slug]/page.tsx` - **Product detail page (eBay-style layout)**
- [ ] Create `/src/components/product/ProductGallery.tsx` - **Image/video gallery with zoom**
- [ ] Create `/src/components/product/ProductInfo.tsx` - **Title, price, rating, stock status**
- [ ] Create `/src/components/product/ProductDescription.tsx` - **Full description with tabs**
- [ ] Create `/src/components/product/ProductSpecifications.tsx` - **Product specs table**
- [ ] Create `/src/components/product/ProductVariants.tsx` - **Variants from same leaf category (no child categories)**
- [ ] Create `/src/components/product/ProductReviews.tsx` - **Customer reviews with advanced filters**
- [ ] Create `/src/components/product/WriteReviewForm.tsx` - **Write review with media upload (after purchase)**
- [ ] Create `/src/components/product/ReviewFilters.tsx` - **Filter by: Rating, Verified Purchase, Category, Shop**
- [ ] Create `/src/components/product/ReviewSummary.tsx` - **Rating breakdown, verified badge, helpful votes**
- [ ] Create `/src/components/product/ReviewCard.tsx` - **Individual review with user, rating, media, helpful button**
- [ ] Create `/src/components/product/ProductActions.tsx` - **Add to cart, buy now, favorite**
- [ ] Create `/src/components/product/ProductShipping.tsx` - **Shipping info and delivery estimate**
- [ ] Create `/src/components/product/ProductShopCard.tsx` - **Seller info mini card**
- [ ] Create `/src/components/product/SimilarProducts.tsx` - **Similar products (10 max, diverse shops, category parents hierarchy)**
- [ ] Create `/src/components/product/SellerOtherProducts.tsx` - **Other products from same seller (shop_id)**
- [ ] Create `/src/components/product/RecentlyViewed.tsx` - **Recently viewed products**
- [ ] Use `/src/app/api/products/[slug]/route.ts` - **Unified Product API (public product details)**
- [x] Create `/src/app/api/products/[slug]/reviews/route.ts` - **Product reviews (GET/POST)**
- [ ] Create `/src/app/api/products/[slug]/variants/route.ts` - **Product variants (GET: same leaf category)**
- [ ] Create `/src/app/api/products/[slug]/similar/route.ts` - **Similar products (GET: max 10, diverse shops)**
- [ ] Create `/src/app/api/products/[slug]/seller-items/route.ts` - **Seller's other products (GET: by shop_id)**

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

```
/api/[resource]                  - GET (list), POST (create)
/api/[resource]/[slug|code|id]   - GET (detail), PATCH (update), DELETE  (use slug for shops/products/categories, code for coupons)
/api/[resource]/[slug]/[action]  - POST (specific actions)
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
9. **Slug-first**: No IDs in routes for shops/products/categories; coupons use codes

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
/src/app/api/[resource]/[slug|code|id]/route.ts    # Unified API: GET (detail), PATCH (update), DELETE
/src/app/api/[resource]/[slug]/[action]/route.ts   # Unified API: POST (specific actions)
```

**API Examples:**

- `/api/shops` - List/create shops (behavior varies by role)
- `/api/shops/[slug]` - Get/update/delete shop (role-based access)
- `/api/products` - List/create products (filtered by role, saved with shop_id)
- `/api/products/[slug]` - Product details with variants/similar products
- `/api/products/[slug]/variants` - Product variants (GET: same leaf category)
- `/api/products/[slug]/similar` - Similar products (GET: max 10, diverse shops)
- `/api/products/[slug]/seller-items` - Seller's other products (GET: by shop_id)
- `/api/orders` - List/create orders (user's own or all if admin)
- `/api/auctions` - List/create auctions (5 max per shop, unlimited for admin)
- `/api/auctions/[id]` - Auction details (saved with shop_id)
- `/api/auctions/[id]/bid` - Place bid (WebSocket real-time updates)
- `/api/auctions/[id]/similar` - Similar auctions (max 10, diverse shops)
- `/api/auctions/live` - Live auctions feed (WebSocket)
- `/api/auctions/featured` - Featured auctions (admin curated)
- `/api/cart` - Get/update user cart (authenticated) or guest cart (session)
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

### Auctions (Auth Hardening Addendum Nov 7, 2025)

- [x] Harden /api/auctions/watchlist to require auth and filter by user_id + type "auction_watch"
- [x] Harden /api/auctions/my-bids to require auth and filter bids by user_id
- [x] Harden /api/auctions/won to require auth and filter auctions by highest_bidder_id + status ended (requires auction docs store highest_bidder_id)
- [x] Add Firestore composite index for won auctions (status + highest_bidder_id + updated_at)

Last Updated: November 7, 2025

## Indexes Addendum (Nov 7, 2025)

New composite indexes added for recent endpoints & performance:

- Orders: (shop_id, created_at desc), (user_id, created_at desc)
- Returns: (shop_id, status, created_at desc), (user_id, created_at desc), (status, created_at desc)
- Won Auctions: (status, highest_bidder_id, updated_at desc)
- Products (existing): (shop_id, slug), (category_id, status, price)
- Shops (existing): (owner_id, verified, featured, created_at)
- Coupons (existing): (shop_id, code), (shop_id, is_active, end_date)
- Categories (existing): (parent_id, slug), (is_featured, slug), (show_on_homepage, sort_order)

Rate limiting considerations:

- Invoice PDF endpoint `/api/orders/[id]/invoice` protected (e.g. 20/min/user)
- Returns media signed URL endpoints `/api/returns/[id]/media` protected (GET/POST different limits)

---

## Development Notes (Addendum Nov 7, 2025)

- Rate limiting middleware added (per-route config) – future Redis store migration pending.
- Invoice generation implemented with pdfkit and streamed as PDF (rate limited).
- Swagger/OpenAPI bootstrapped: `/api/swagger` (spec) + `/api-docs` (UI).
- Returns media flow (signed URL + confirm) pending full UI adaptation (will finalize later).
- Route-based rate limiter wrapper added (`withRouteRateLimit`) with configs for `/api/search`, invoice, and returns media.
- Firebase Admin initialization hardened with env guards and emulator awareness.
- Universal search endpoint `/api/search` implemented (products/auctions, filters, pagination, relevance sort).
- Product reviews POST scaffold added (moderation pending).

---

## Upcoming Tasks (Added Nov 7, 2025)

- Adapt `returns.service.ts` & UI to signed URL + confirm workflow.
- Real-time slug/code validation wiring in ProductFullForm/CouponForm (debounced). (ShopForm done)
- Firebase security rules documentation for production.
- Redis-backed rate limiter implementation.
- OpenAPI JSDoc annotations expansion (auto-generate richer spec).
- DONE (Nov 7, 2025): Universal search endpoint `/api/search` implemented.
- Confirm implementation status for user admin endpoints (ban/role) & add Swagger docs.
- DONE (Nov 7, 2025): Product reviews endpoint scaffolded (`/api/products/[slug]/reviews` GET/POST).
- Similar products & seller items algorithm documentation file.
