# AI Agent Project Guide - JustForView.in

**Last Updated:** November 8, 2025  
**Project Type:** Next.js 14+ Auction & E-commerce Platform (India)  
**Stack:** TypeScript, Tailwind CSS, Firebase Admin SDK, Razorpay

---

## 📋 Quick Start for AI Agents

This document is designed for AI agents to quickly understand the project architecture, patterns, and implementation requirements. Read this FIRST before implementing any features.

---

## 🏗️ Architecture Overview

### Core Principles

1. **No Mocks** - All APIs are real, use service layer or direct fetch
2. **Code Over Docs** - Implement features, skip documentation unless requested
3. **Component Reuse** - ALWAYS use Phase 2 components, never recreate
4. **Slug-Based URLs** - SEO-friendly routes (shops/products/categories use slugs, coupons use codes)
5. **Unified API Pattern** - Single endpoint serves all roles with different permissions

### Tech Stack

```yaml
Frontend:
  - Framework: Next.js 14+ (App Router)
  - Language: TypeScript (strict mode)
  - Styling: Tailwind CSS
  - State: React Context + Hooks
  - Forms: React Hook Form + Zod validation

Backend:
  - API: Next.js API Routes
  - Database: Firebase Firestore (via Admin SDK)
  - Auth: Session-based (existing implementation)
  - Storage: Firebase Storage
  - Payments: Razorpay (primary)

Real-time:
  - Auctions: WebSocket (Socket.io) for live bidding
  - Job Scheduler: Node-cron for auction end automation

UI Libraries:
  - Icons: Lucide React
  - Rich Text: TipTap
  - Tables: Custom DataTable component
  - Media: Custom MediaUploader with canvas API
```

---

## 📁 Project Structure

```
/src
  /app                          # Next.js App Router
    /api                        # Backend API routes
      /lib/firebase             # Firebase Admin SDK (SERVER-SIDE ONLY)
        admin.ts                # Firebase initialization
        collections.ts          # Firestore helpers
        queries.ts              # Query builders
        transactions.ts         # Transaction helpers
      /[resource]               # REST endpoints
        route.ts                # GET (list), POST (create)
        /[slug|code|id]
          route.ts              # GET (detail), PATCH (update), DELETE
    /seller                     # Seller dashboard pages
    /admin                      # Admin pages (users, categories only)
    /user                       # User account pages
    /(public pages)             # Homepage, shops, products, etc.

  /components                   # React components
    /common                     # Reusable components (Phase 2)
      DataTable.tsx             # ✅ Table with sorting/pagination
      FilterSidebar.tsx         # ✅ Filter UI
      FormModal.tsx             # ✅ Create/edit modals
      InlineEditor.tsx          # ✅ Quick inline edits
      ConfirmDialog.tsx         # ✅ Delete confirmations
      StatusBadge.tsx           # ✅ Status indicators
      ActionMenu.tsx            # ✅ Dropdown actions
      EmptyState.tsx            # ✅ Empty state placeholder
      StatsCard.tsx             # ✅ Analytics cards
      RichTextEditor.tsx        # ✅ WYSIWYG editor
      SlugInput.tsx             # ✅ Auto-slug generation
      TagInput.tsx              # ✅ Tag input
      DateTimePicker.tsx        # ✅ Date/time picker
      CategorySelector.tsx      # ✅ Category tree selector
      UploadProgress.tsx        # ✅ Upload progress indicator
      PendingUploadsWarning.tsx # ✅ Navigation warning

    /cards                      # Display cards (Phase 2.3)
      ProductCard.tsx           # ✅ Product card
      ShopCard.tsx              # ✅ Shop card
      CategoryCard.tsx          # ✅ Category card
      AuctionCard.tsx           # ✅ Auction card
      *CardSkeleton.tsx         # ✅ Loading skeletons
      CardGrid.tsx              # ✅ Responsive grid
      *QuickView.tsx            # ✅ Quick view modals

    /filters                    # Filter components (Phase 2.7)
      ProductFilters.tsx        # ✅ Product filters
      ShopFilters.tsx           # ✅ Shop filters
      OrderFilters.tsx          # ✅ Order filters
      CouponFilters.tsx         # ✅ Coupon filters
      AuctionFilters.tsx        # ✅ Auction filters
      # ... all 9 filter components ✅

    /media                      # Media handling (Phase 2.2.1)
      MediaUploader.tsx         # ✅ Upload with preview
      ImageEditor.tsx           # ✅ Crop/rotate/filters
      VideoRecorder.tsx         # ✅ Video recording
      CameraCapture.tsx         # ✅ Camera capture
      MediaGallery.tsx          # ✅ Gallery with lightbox

    /seller                     # Seller-specific components
      SellerSidebar.tsx         # ✅ Seller navigation
      SellerHeader.tsx          # ✅ Seller header
      ShopSelector.tsx          # ✅ Shop dropdown (admin/seller)
      ProductInlineForm.tsx     # ✅ Quick product edit
      ShopForm.tsx              # ✅ Shop create/edit form
      ViewToggle.tsx            # ✅ Grid/table toggle

  /services                     # API wrappers (Phase 2.8)
    api.service.ts              # ✅ Base HTTP client
    auth.service.ts             # ✅ Authentication
    shops.service.ts            # ✅ Shops API wrapper
    products.service.ts         # ✅ Products API wrapper
    orders.service.ts           # ✅ Orders API wrapper
    coupons.service.ts          # ✅ Coupons API wrapper
    categories.service.ts       # ✅ Categories API wrapper
    auctions.service.ts         # ✅ Auctions API wrapper
    # ... all 13 services ✅

  /contexts                     # React Context
    AuthContext.tsx             # ✅ Authentication state
    UploadContext.tsx           # ✅ Upload queue management

  /hooks                        # Custom hooks
    useFilters.ts               # ✅ Filter state + URL sync
    useUploadQueue.ts           # ✅ Upload queue processing
    useMediaUpload.ts           # ✅ Single file upload
    useSlugValidation.ts        # ✅ Slug uniqueness check

  /lib                          # Utilities
    rbac.ts                     # ✅ Role-based access control
    formatters.ts               # ✅ Currency/date/number formatting
    export.ts                   # ✅ CSV/PDF export
    filter-helpers.ts           # ✅ Filter utilities
    upload-manager.ts           # ✅ Upload retry/persistence
    /validation                 # ✅ Zod schemas (all resources)
    /media                      # ✅ Media processing utils
    /seo                        # ✅ SEO metadata/schema

  /constants                    # Configuration
    database.ts                 # ✅ Firestore collection names
    storage.ts                  # ✅ Storage bucket paths
    navigation.ts               # ✅ Navigation menus
    filters.ts                  # ✅ Filter configurations
    media.ts                    # ✅ Media constraints
    faq.ts                      # ✅ FAQ data
    footer.ts                   # ✅ Footer links

  /types                        # TypeScript types
    index.ts                    # ✅ Core entity types
    media.ts                    # ✅ Media types
```

---

## 🔄 Development Patterns

### 1. API Route Pattern

**File:** `/src/app/api/[resource]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

// GET /api/products - List products (role-based)
export async function GET(req: NextRequest) {
  const db = getFirestoreAdmin();
  const { searchParams } = new URL(req.url);
  const shopId = searchParams.get("shop_id");

  // Role-based filtering
  let query = db.collection(COLLECTIONS.PRODUCTS);
  if (shopId) query = query.where("shop_id", "==", shopId);

  const snapshot = await query.get();
  const products = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json({ products });
}

// POST /api/products - Create product (seller/admin)
export async function POST(req: NextRequest) {
  const db = getFirestoreAdmin();
  const body = await req.json();

  // Validate ownership, shop_id, etc.
  const docRef = await db.collection(COLLECTIONS.PRODUCTS).add({
    ...body,
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ id: docRef.id });
}
```

**Pattern Rules:**

- ✅ Import Firebase Admin from `/src/app/api/lib/firebase/admin.ts`
- ✅ Use constants from `/src/constants/database.ts`
- ✅ Validate request (auth, ownership, permissions)
- ✅ Return consistent JSON format
- ✅ Handle errors with proper HTTP status codes

### 2. Service Layer Pattern

**File:** `/src/services/products.service.ts`

```typescript
import { apiService } from "./api.service";

export const productsService = {
  // List products
  list: async (filters?: any) => {
    return apiService.get("/api/products", { params: filters });
  },

  // Get by slug
  getBySlug: async (slug: string) => {
    return apiService.get(`/api/products/${slug}`);
  },

  // Create product
  create: async (data: any) => {
    return apiService.post("/api/products", data);
  },

  // Update product
  update: async (slug: string, data: any) => {
    return apiService.patch(`/api/products/${slug}`, data);
  },

  // Delete product
  delete: async (slug: string) => {
    return apiService.delete(`/api/products/${slug}`);
  },
};
```

**Pattern Rules:**

- ✅ Use `apiService` for HTTP calls (handles auth headers)
- ✅ Return promises (no try-catch, let caller handle errors)
- ✅ Use TypeScript for type safety
- ✅ Follow REST conventions

### 3. Page Component Pattern

**File:** `/src/app/seller/products/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/common/DataTable";
import FilterSidebar from "@/components/common/FilterSidebar";
import ProductFilters from "@/components/filters/ProductFilters";
import { productsService } from "@/services/products.service";
import { useFilters } from "@/hooks/useFilters";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { filters, updateFilters } = useFilters("products");

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productsService.list(filters);
      setProducts(data.products);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <FilterSidebar>
        <ProductFilters filters={filters} onChange={updateFilters} />
      </FilterSidebar>

      <div className="flex-1">
        <DataTable data={products} loading={loading} />
      </div>
    </div>
  );
}
```

**Pattern Rules:**

- ✅ Use "use client" directive
- ✅ Use Phase 2 components (DataTable, FilterSidebar, etc.)
- ✅ Use service layer for data fetching
- ✅ Use useFilters hook for filter state
- ✅ Handle loading/error states
- ✅ NO MOCKS - fetch real data

### 4. Form Component Pattern

**File:** `/src/components/seller/ProductForm.tsx`

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/lib/validation/product";
import SlugInput from "@/components/common/SlugInput";
import RichTextEditor from "@/components/common/RichTextEditor";
import MediaUploader from "@/components/media/MediaUploader";

export default function ProductForm({ onSubmit, initialData }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SlugInput
        title={register("name").value}
        value={register("slug").value}
        onChange={(slug) =>
          register("slug").onChange({ target: { value: slug } })
        }
        validateEndpoint="/api/products/validate-slug"
      />

      <RichTextEditor
        value={register("description").value}
        onChange={(html) =>
          register("description").onChange({ target: { value: html } })
        }
      />

      <MediaUploader
        context="product_images"
        maxFiles={10}
        onUpload={(files) => console.log("Uploaded:", files)}
      />

      <button type="submit">Save Product</button>
    </form>
  );
}
```

**Pattern Rules:**

- ✅ Use React Hook Form + Zod validation
- ✅ Use Phase 2 form components (SlugInput, RichTextEditor, MediaUploader)
- ✅ Handle validation errors
- ✅ Show loading state on submit

---

## 🎯 Component Usage Matrix

**ALWAYS use Phase 2 components. NEVER recreate custom implementations.**

| Page Type               | Required Components                                                            |
| ----------------------- | ------------------------------------------------------------------------------ |
| **List Pages**          | DataTable + FilterSidebar + ActionMenu + StatusBadge + EmptyState + ViewToggle |
| **Create/Edit Forms**   | FormModal + SlugInput + RichTextEditor + MediaUploader + CategorySelector      |
| **Product Pages**       | ProductCard + ProductFilters + ProductQuickView + CardGrid                     |
| **Shop Pages**          | ShopCard + ShopFilters + ShopSelector + CardGrid                               |
| **Auction Pages**       | AuctionCard + AuctionFilters + AuctionQuickView + CardGrid                     |
| **Analytics Pages**     | StatsCard + DataTable + DateTimePicker                                         |
| **Media Management**    | MediaUploader + ImageEditor + MediaGallery + VideoRecorder                     |
| **Inline Actions**      | InlineEditor + ActionMenu + ConfirmDialog                                      |
| **Upload Management**   | UploadProgress + PendingUploadsWarning (auto-included via UploadContext)       |
| **Filtering**           | FilterSidebar + [Resource]Filters (e.g., ProductFilters) + useFilters hook     |
| **Status Display**      | StatusBadge (for order status, product status, shop verification, etc.)        |
| **Empty States**        | EmptyState (when no data available)                                            |
| **Loading States**      | [Component]Skeleton (ProductCardSkeleton, ShopCardSkeleton, etc.)              |
| **Date/Time Selection** | DateTimePicker (for date ranges, auction end times, coupon expiry)             |
| **Category Selection**  | CategorySelector (leaf-only validation for sellers, tree view for admins)      |
| **Tag Management**      | TagInput (with autocomplete for product tags, keywords)                        |

---

## 🔐 Role-Based Access Control

### Roles Hierarchy

```
guest < user < seller < admin
```

### Permission Rules

```typescript
// Example from /src/lib/rbac.ts
export const PERMISSIONS = {
  shops: {
    list: ["guest", "user", "seller", "admin"], // All can view
    create: ["user", "seller", "admin"], // Users can create 1 shop
    update: ["seller", "admin"], // Owner or admin
    delete: ["admin"], // Admin only
    verify: ["admin"], // Admin only
  },
  products: {
    list: ["guest", "user", "seller", "admin"],
    create: ["seller", "admin"],
    update: ["seller", "admin"], // Owner or admin
    delete: ["seller", "admin"], // Owner or admin
  },
  auctions: {
    list: ["guest", "user", "seller", "admin"],
    create: ["seller", "admin"], // 5 max per shop, unlimited for admin
    bid: ["user", "seller", "admin"],
  },
  categories: {
    list: ["guest", "user", "seller", "admin"],
    create: ["admin"],
    update: ["admin"],
    delete: ["admin"],
  },
};
```

### Unified Seller/Admin Interface

**Key Architectural Decision:** Admins use the SAME `/seller/*` routes with elevated permissions.

```
/seller/my-shops        - Sellers see their shop(s), admins see ALL shops
/seller/products        - Sellers see their products, admins see ALL products
/seller/coupons         - Sellers see their coupons, admins see ALL coupons
/seller/auctions        - Sellers see their auctions, admins see ALL auctions
/seller/orders          - Sellers see their orders, admins see ALL orders
/seller/analytics       - Sellers see their stats, admins see ALL stats
```

**Admin-Only Routes:**

```
/admin/users            - User management (ban, role change)
/admin/categories       - Category tree management
/admin/hero-slides      - Homepage hero carousel
/admin/featured-sections - Homepage featured content
```

**Benefits:**

- ✅ 50% less code (no duplicate admin pages)
- ✅ Consistent UX for both roles
- ✅ Easier maintenance
- ✅ Single source of truth

---

## 🌐 URL Routing Conventions

### Slug-Based URLs (SEO-Friendly)

| Resource   | Management Route                | Public Route         | Identifier |
| ---------- | ------------------------------- | -------------------- | ---------- |
| Shops      | `/seller/my-shops/[slug]/edit`  | `/shops/[slug]`      | slug       |
| Products   | `/seller/products/[slug]/edit`  | `/products/[slug]`   | slug       |
| Categories | `/admin/categories/[slug]/edit` | `/categories/[slug]` | slug       |
| Coupons    | `/seller/coupons/[code]/edit`   | N/A (no public page) | code       |
| Auctions   | `/seller/auctions/[id]/edit`    | `/auctions/[id]`     | id         |
| Orders     | `/seller/orders/[id]`           | `/user/orders/[id]`  | id         |

**Why Slugs?**

- ✅ SEO-friendly URLs
- ✅ Human-readable
- ✅ Better user experience
- ✅ Unique per resource (enforced by Firestore indexes)

**Slug Generation Rules:**

- Auto-generate from title/name (lowercase, hyphenated)
- Real-time validation via `/api/[resource]/validate-slug`
- Unique constraint enforced (per shop for products/coupons, globally for shops/categories)
- Manual editing allowed (with validation)

---

## 💾 Database Architecture

### Firestore Collections

```typescript
// From /src/constants/database.ts
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
  AUCTIONS: "auctions", // includes shop_id
  BIDS: "bids",
  WATCHLIST: "watchlist",
  WON_AUCTIONS: "wonAuctions",
};
```

### Key Relationships

```
shops (1) ──< (N) products (shop_id)
shops (1) ──< (N) auctions (shop_id)
shops (1) ──< (N) coupons (shop_id)
shops (1) ──< (N) orders (shop_id)

users (1) ──< (N) shops (owner_id)
users (1) ──< (N) orders (user_id)
users (1) ──< (N) bids (user_id)
users (1) ──< (N) reviews (user_id)

categories (1) ──< (N) products (category_id)
products (1) ──< (N) order_items (product_id)
auctions (1) ──< (N) bids (auction_id)
```

### Composite Indexes (firestore.indexes.json)

```json
{
  "indexes": [
    {
      "collectionGroup": "shops",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "owner_id", "order": "ASCENDING" },
        { "fieldPath": "slug", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "shop_id", "order": "ASCENDING" },
        { "fieldPath": "slug", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category_id", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "price", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "coupons",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "shop_id", "order": "ASCENDING" },
        { "fieldPath": "code", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## 🎨 UI/UX Requirements

### Data Fetching

- ✅ **NO MOCKS** - Always fetch real data from APIs
- ✅ Use service layer (`productsService`, `shopsService`, etc.)
- ✅ Implement loading states (spinners/skeletons)
- ✅ Implement error handling (user-friendly messages)
- ✅ Show empty states (EmptyState component)

### Table Actions (DataTable)

```
┌───────────────────────────────────────────────────────────┐
│ Product Name      │ Category  │ Price    │ Stock │ Actions │
├───────────────────────────────────────────────────────────┤
│ iPhone 14 Pro     │ Mobile    │ ₹1,29,999│ 25    │ 👁 ✏ → 🗑│
│ Magic Mouse       │ Accessory │ ₹8,999   │ 100   │ 👁 ✏ → 🗑│
└───────────────────────────────────────────────────────────┘

👁 = View (opens public page in new tab)
✏ = Quick Edit (inline modal)
→ = Edit Page (full wizard)
🗑 = Delete (with confirmation)
```

**Action Button Order (Left to Right):**

1. **Eye (👁)** - View public page (opens `/products/[slug]` in new tab)
2. **Pencil (✏)** - Quick inline edit (opens modal)
3. **Arrow (→)** - Full edit page (navigates to `/seller/products/[slug]/edit`)
4. **Trash (🗑)** - Delete (shows ConfirmDialog)

### Filter Sidebar Requirements

- ✅ **Collapsible Sections** - Accordion pattern with chevron icons
- ✅ **Searchable Options** - For filters with >200 options (debounced 300ms)
- ✅ **Fixed Height with Scroll** - Max 300px per section
- ✅ **Filter Count Badge** - Show active filter count
- ✅ **Clear Actions** - Clear individual/section/all filters
- ✅ **URL Sync** - Filters persist in URL for shareable states
- ✅ **Apply Button** - Required for category, price range, rating filters
- ✅ **Realtime Updates** - In Stock checkbox, Sort dropdown (no apply button)

### Grid/Table View Toggle

- ✅ Both views display same data
- ✅ View preference saved to localStorage
- ✅ Smooth transition between views
- ✅ Maintain scroll position on toggle

### Public View Behavior

**View Button (Eye Icon) Pattern:**

- ✅ Always opens public-facing page (NOT seller/admin view)
- ✅ Opens in new tab (target="\_blank" rel="noopener noreferrer")
- ✅ Allows sellers to preview customer experience
- ✅ Verify SEO metadata, images, descriptions

---

## 💰 Product Pricing Structure

### Three-Tier Pricing System

```typescript
interface ProductPricing {
  actualPrice?: number; // Internal cost (NOT shown to customers)
  originalPrice?: number; // MSRP (shown crossed out if on sale)
  salePrice: number; // Current price (REQUIRED, what customer pays)
}
```

### Display Logic

**Customer View (ProductCard):**

```
┌─────────────────────────┐
│  Product Image          │
│                         │
│  iPhone 14 Pro          │
│  ₹1,29,999  ₹1,49,999  │ <- salePrice  originalPrice (crossed)
│  13% OFF                │ <- Discount badge
└─────────────────────────┘
```

**Seller View (DataTable):**

```
┌──────────────┬──────────┬───────────┬───────────┬────────┐
│ Product      │ Cost     │ MSRP      │ Sale Price│ Margin │
├──────────────┼──────────┼───────────┼───────────┼────────┤
│ iPhone 14    │ ₹95,000  │ ₹1,49,999 │ ₹1,29,999 │ 36.8%  │
└──────────────┴──────────┴───────────┴───────────┴────────┘
```

### Calculation Rules

- **Discount %** = `((originalPrice - salePrice) / originalPrice) * 100`
- **Margin %** = `((salePrice - actualPrice) / salePrice) * 100`
- If `originalPrice` not set → Show only `salePrice`, no discount badge
- If `originalPrice` ≤ `salePrice` → Show only `salePrice` (no discount)
- If `actualPrice` not set → Margin calculation hidden

---

## 🚀 Implementation Checklist

### ✅ COMPLETED PHASES

#### Phase 1: Static Pages & SEO ✅

- [x] FAQ section (40+ India-specific FAQs)
- [x] Legal pages (Privacy, Terms, Refund, Shipping, Cookie)
- [x] SEO (Sitemap, Robots.txt, Schema.org, Open Graph)

#### Phase 2: Shared Components & Utilities ✅

- [x] 2.1: CRUD Components (DataTable, FormModal, FilterSidebar, etc.)
- [x] 2.2: Form Components (RichTextEditor, CategorySelector, TagInput, DateTimePicker, SlugInput)
- [x] 2.2.1: Media Components (MediaUploader, ImageEditor, VideoRecorder, CameraCapture, MediaGallery)
- [x] 2.3: Display Cards (ProductCard, ShopCard, CategoryCard, AuctionCard + Skeletons + QuickView)
- [x] 2.4: Utilities (RBAC, Validation, Formatters, Export)
- [x] 2.5: Constants (Database, Storage, Filters, Media)
- [x] 2.6: Upload Context (UploadContext, UploadProgress, PendingUploadsWarning)
- [x] 2.7: Filter Components (All 9 filters: Product, Shop, Order, Coupon, Auction, etc.)
- [x] 2.8: Service Layer (All 13 services: shops, products, orders, coupons, categories, auctions, etc.)

#### Phase 3: Seller Dashboard (Partial) ✅

- [x] 3.1: Seller Layout (SellerSidebar, SellerHeader, Dashboard)
- [x] 3.2: Database Integration (Firebase Admin SDK, Collections, Queries, Transactions)
- [x] 3.3: My Shops List (DataTable + FilterSidebar + ShopFilters)
- [x] 3.4: Product Management (Partial - List, Create, Edit pages with wizard)

---

### 🔨 PENDING TASKS (Priority Order)

#### Phase 3.3: My Shops Management (COMPLETE)

**Priority: HIGH** - Core seller functionality

- [ ] `/seller/my-shops/create/page.tsx` - Create shop form
  - Use `ShopForm` component
  - Redirect to `/seller/my-shops/[slug]/edit` after creation
  - Enforce shop creation limit (1 for users, unlimited for admins)
- [ ] `/components/seller/ShopForm.tsx` - Unified shop form
  - Use `SlugInput` (validates via `/api/shops/validate-slug`)
  - Use `RichTextEditor` for description
  - Use `MediaUploader` for logo/banner
  - Support create + edit modes
- [ ] `/seller/my-shops/[slug]/edit/page.tsx` - Edit shop
  - Load shop data via `shopsService.getBySlug(slug)`
  - Use `ShopForm` component in edit mode
  - Show delete button (admin only)
- [ ] `/seller/my-shops/[slug]/page.tsx` - Shop details/dashboard
  - Show shop stats using `StatsCard`
  - Show recent products using `DataTable`
  - Show recent orders using `DataTable`
  - Link to public shop page (View button)

**API Status:** ✅ All shop APIs implemented (`/api/shops`, `/api/shops/[slug]`, `/api/shops/validate-slug`)

---

#### Phase 3.4: Product Management (COMPLETE)

**Priority: HIGH** - Core seller functionality

**Status:** Pages created, need additional components

- [ ] `/components/seller/ProductTable.tsx` - Product table
  - Built on `DataTable` component
  - Support filters from `ProductFilters`
  - Inline actions (View, Quick Edit, Edit Page, Delete)
  - Eye button opens `/products/[slug]` (public view)
- [ ] `/components/seller/ProductFullForm.tsx` - Complete product form
  - Use all Phase 2 form components:
    - `SlugInput` (validates via `/api/products/validate-slug`)
    - `RichTextEditor` (description)
    - `CategorySelector` (leaf-only for sellers)
    - `TagInput` (keywords)
    - `MediaUploader` (images/videos)
    - `DateTimePicker` (publish date)
  - Three-tier pricing inputs (actualPrice, originalPrice, salePrice)
  - SEO metadata fields (title, description, keywords)
  - Product condition (new, refurbished, used)
  - Returnable checkbox
  - Stock tracking

**API Status:** ✅ All product APIs implemented (`/api/products`, `/api/products/[slug]`, `/api/products/validate-slug`)

---

#### Phase 3.5: Coupon Management (COMPLETE)

**Priority: MEDIUM** - Business feature

- [ ] `/seller/coupons/create/page.tsx` - Create coupon
  - Use `CouponForm` component
  - `ShopSelector` (admins select any shop, sellers select own)
  - Redirect to `/seller/coupons/[code]/edit` after creation
- [ ] `/seller/coupons/[code]/edit/page.tsx` - Edit coupon
  - Load coupon via `couponsService.getByCode(code)`
  - Use `CouponForm` component in edit mode
  - Show delete button (owner/admin only)
- [ ] `/components/seller/CouponForm.tsx` - Coupon form
  - Code input (validates via `/api/coupons/validate-code`)
  - Discount type (percentage, flat, BOGO, tiered)
  - Min/max purchase amount
  - Usage limits (total, per user)
  - `DateTimePicker` for start/end dates
  - `TagInput` for applicable categories/products
  - Active/inactive toggle
- [ ] `/components/seller/CouponPreview.tsx` - Coupon preview
  - Show how coupon appears to customers
  - Use `StatusBadge` for active/expired state
  - Calculate sample discount

**API Status:** ✅ All coupon APIs implemented (`/api/coupons`, `/api/coupons/[code]`, `/api/coupons/validate-code`)

---

#### Phase 3.6: Shop Analytics

**Priority: MEDIUM** - Business intelligence

- [ ] `/seller/analytics/page.tsx` - Analytics dashboard
  - `ShopSelector` (admins see all shops, sellers see own)
  - `DateTimePicker` for date range selection
  - Overview cards using `StatsCard`:
    - Total revenue, orders, products, customers
    - Average order value, conversion rate
  - Charts:
    - Sales over time (line chart)
    - Top products (bar chart)
    - Revenue by category (pie chart)
    - Customer locations (map)
- [ ] `/components/seller/AnalyticsOverview.tsx` - Overview cards
- [ ] `/components/seller/SalesChart.tsx` - Sales chart
- [ ] `/components/seller/TopProducts.tsx` - Top selling products
- [ ] `/components/seller/PayoutRequest.tsx` - Request payout
- [ ] `/api/analytics/route.ts` - Analytics API
  - Aggregate queries (revenue, orders, customers)
  - Role-based filtering (shop_id for sellers, all for admins)
  - Date range filtering

---

#### Phase 4: Auction System

**Priority: HIGH** - Core platform feature

- [ ] 4.1: Auction Management (Seller)
  - `/seller/auctions/page.tsx` - List auctions (DataTable + AuctionFilters)
  - `/seller/auctions/create/page.tsx` - Create auction (AuctionForm)
  - `/seller/auctions/[id]/edit/page.tsx` - Edit auction (AuctionForm)
  - `/components/seller/AuctionForm.tsx` - Auction form
    - Starting price, reserve price, buy now price
    - `DateTimePicker` for start/end times
    - `MediaUploader` for images/videos
    - Featured checkbox (admin only)
  - Enforce auction limits (5 per shop, unlimited for admins)
- [ ] 4.2: Live Bidding (WebSocket)
  - Setup Socket.io server
  - Real-time bid updates
  - Countdown timer
  - Auto-bid feature
  - Bid history display
- [ ] 4.3: Auction End Automation
  - Node-cron job scheduler
  - Close auctions at end time
  - Notify winners
  - Create orders for Buy Now
  - Update inventory

**API Status:** ✅ Auction APIs implemented, bidding/watchlist need enhancement

---

#### Phase 5: Admin Dashboard

**Priority: MEDIUM** - Administrative tools

- [ ] 5.1: Admin Layout
  - Extend `SellerSidebar` with admin-only items
  - Or create separate `AdminSidebar`
- [ ] 5.2: User Management
  - `/admin/users/page.tsx` - User list (DataTable + UserFilters)
  - Ban/unban users
  - Change user roles
  - View user activity
- [ ] 5.3: Category Management
  - `/admin/categories/page.tsx` - Category tree (CategoryTree)
  - `/admin/categories/create/page.tsx` - Create category
  - `/admin/categories/[slug]/edit/page.tsx` - Edit category
  - `/components/admin/CategoryTree.tsx` - Tree view with drag-drop
  - `/components/admin/CategoryForm.tsx` - Category form
    - Parent selector
    - `SlugInput` (validates via `/api/categories/validate-slug`)
    - `MediaUploader` for image
    - Featured/homepage checkboxes
    - SEO metadata
- [ ] 5.4: Homepage Management
  - `/admin/hero-slides/page.tsx` - Hero carousel slides
  - `/admin/featured-sections/page.tsx` - Featured categories/shops
  - Drag-drop reordering

**API Status:** ✅ Category APIs implemented, user/homepage APIs pending

---

#### Phase 6: User Pages & Shopping

**Priority: HIGH** - Customer-facing features

- [ ] 6.1: User Dashboard
  - `/user/page.tsx` - Dashboard (StatsCard + recent orders/favorites)
  - `/user/settings/page.tsx` - Account settings
  - `/user/addresses/page.tsx` - Shipping addresses
- [ ] 6.2: Shopping Cart
  - `/cart/page.tsx` - Cart page
  - Add/remove items
  - Update quantities
  - Apply coupons
  - Calculate totals
- [ ] 6.3: Checkout
  - `/checkout/page.tsx` - Checkout flow
  - Address selection
  - Payment method (Razorpay)
  - Order review
  - Place order
- [ ] 6.4: Order Tracking
  - `/user/orders/page.tsx` - Order history
  - `/user/orders/[id]/page.tsx` - Order details + tracking
  - Cancel order
  - Request return
- [ ] 6.5: Product Pages
  - `/products/[slug]/page.tsx` - Product detail (eBay-style)
  - `/components/product/ProductGallery.tsx` - Image gallery
  - `/components/product/ProductInfo.tsx` - Title, price, stock
  - `/components/product/ProductDescription.tsx` - Full description
  - `/components/product/ProductReviews.tsx` - Customer reviews
  - `/components/product/SimilarProducts.tsx` - Similar products
- [ ] 6.6: Shop Pages
  - `/shops/[slug]/page.tsx` - Shop storefront
  - `/components/shop/ShopHeader.tsx` - Shop banner, logo, rating
  - `/components/shop/ShopProducts.tsx` - Shop products
  - `/components/shop/ShopAuctions.tsx` - Shop auctions
  - `/components/shop/ShopReviews.tsx` - Shop reviews
- [ ] 6.7: Category Pages
  - `/categories/[slug]/page.tsx` - Category page
  - `/components/category/CategoryHeader.tsx` - Category banner
  - `/components/category/CategoryProducts.tsx` - Products
  - `/components/category/SubcategoryNav.tsx` - Subcategories

**API Status:** ✅ Shop/product public APIs ready, cart/checkout/orders need implementation

---

## 📝 Documentation Files

**Reference Guides (Already Created):**

- ✅ `FEATURE_IMPLEMENTATION_CHECKLIST.md` - Original detailed checklist
- ✅ `MEDIA_COMPONENTS_GUIDE.md` - Media handling guide
- ✅ `SERVICE_LAYER_ARCHITECTURE.md` - Service layer patterns
- ✅ `SERVICE_LAYER_QUICK_REF.md` - Quick reference
- ✅ `FILTER_AND_UPLOAD_GUIDE.md` - Filters and uploads
- ✅ `PHASE_2.7_FILTER_COMPONENTS.md` - Filter implementation
- ✅ `PHASE_2.8_QUICK_REF.md` - Service layer quick ref

**To Create:**

- [ ] `AUCTION_SYSTEM_GUIDE.md` - Live auction implementation
- [ ] `SIMILAR_PRODUCTS_ALGORITHM.md` - Product recommendation algorithm
- [ ] `PRODUCT_ARCHITECTURE.md` - Product data structure

---

## 🎯 Quick Reference for AI Agents

### Before Starting Any Task:

1. ✅ Check if Phase 2 component exists - ALWAYS reuse, NEVER recreate
2. ✅ Check if service exists - Use service layer, don't fetch directly
3. ✅ Check if API exists - Don't create duplicate endpoints
4. ✅ Check database.ts for collection names - Don't hardcode strings
5. ✅ Check storage.ts for bucket paths - Don't hardcode strings
6. ✅ Check validation schemas - Use existing Zod schemas

### When Creating Pages:

1. ✅ Use "use client" directive for interactive pages
2. ✅ Use Phase 2 components (DataTable, FilterSidebar, etc.)
3. ✅ Use service layer for data fetching
4. ✅ Use useFilters hook for filter state
5. ✅ Handle loading/error states
6. ✅ Show EmptyState when no data
7. ✅ NO MOCKS - fetch real data

### When Creating Forms:

1. ✅ Use React Hook Form + Zod validation
2. ✅ Use SlugInput for slug fields (with validation endpoint)
3. ✅ Use RichTextEditor for descriptions
4. ✅ Use MediaUploader for images/videos
5. ✅ Use CategorySelector for categories
6. ✅ Use TagInput for tags/keywords
7. ✅ Use DateTimePicker for dates/times
8. ✅ Show validation errors
9. ✅ Show loading state on submit

### When Creating APIs:

1. ✅ Import Firebase Admin from `/src/app/api/lib/firebase/admin.ts`
2. ✅ Use constants from `/src/constants/database.ts`
3. ✅ Validate request (auth, ownership, permissions)
4. ✅ Return consistent JSON format
5. ✅ Handle errors with proper HTTP status codes
6. ✅ Use role-based filtering (admin sees all, seller sees own)

### When Working with URLs:

1. ✅ Use slugs for shops/products/categories
2. ✅ Use codes for coupons
3. ✅ Use IDs for orders/auctions
4. ✅ Validate slug uniqueness via API endpoint
5. ✅ Auto-generate slugs from titles (lowercase, hyphenated)

### When Implementing RBAC:

1. ✅ Check role hierarchy: guest < user < seller < admin
2. ✅ Admin can do everything seller can do + more
3. ✅ Use same routes for seller/admin (different permissions)
4. ✅ Show ShopSelector for admins (dropdown to select any shop)
5. ✅ Filter data by shop_id for sellers, show all for admins

---

## 🐛 Common Pitfalls to Avoid

1. ❌ **Don't recreate Phase 2 components** - Always reuse existing components
2. ❌ **Don't use mocks** - Always fetch real data from APIs
3. ❌ **Don't hardcode collection names** - Use constants from database.ts
4. ❌ **Don't import Firebase Admin in client** - Only in API routes
5. ❌ **Don't use IDs in URLs** - Use slugs for shops/products/categories
6. ❌ **Don't create duplicate admin routes** - Use seller routes with role checks
7. ❌ **Don't forget loading states** - Show spinners/skeletons while loading
8. ❌ **Don't forget error handling** - Show user-friendly error messages
9. ❌ **Don't forget empty states** - Show EmptyState when no data
10. ❌ **Don't forget validation** - Use Zod schemas from lib/validation

---

## 📊 Project Status Summary

**Phase 1:** ✅ 100% Complete (Static Pages & SEO)  
**Phase 2:** ✅ 100% Complete (Shared Components & Utilities)  
**Phase 3:** 🔄 60% Complete (Seller Dashboard - Layout, Products, Coupons)  
**Phase 4:** ⏳ 0% Complete (Auction System)  
**Phase 5:** ⏳ 0% Complete (Admin Dashboard)  
**Phase 6:** ⏳ 0% Complete (User Pages & Shopping)

**Next Priority:** Complete Phase 3.3 (My Shops Management)

---

## 🚀 Getting Started for AI Agents

1. **Read this guide completely** - Understand architecture and patterns
2. **Check pending tasks** - Pick highest priority tasks
3. **Review existing code** - See how Phase 2 components are used
4. **Follow patterns** - Use established patterns for consistency
5. **Test thoroughly** - Verify functionality before marking complete
6. **Update this guide** - Mark tasks as complete, add new insights

---

**Last Updated:** November 8, 2025  
**Maintained By:** AI Agents + Human Developers  
**Questions?** Check reference docs in `/CHECKLIST/` folder
