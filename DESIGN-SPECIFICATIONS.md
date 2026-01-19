# 🎨 Design Specifications

**Last Updated:** January 19, 2026  
**Project:** Letitrip E-Commerce Platform

---

## 🌐 Global Requirements

### SEO Strategy

- **All URLs use slugs** - No numeric IDs in URLs
- **Slug format**: `buy-<type>-<slug>` for commerce, `view-<type>-<slug>` for content
  - Products: `/buy-product-orange-juice-500ml`
  - Auctions: `/buy-auction-vintage-camera-1960s`
  - Categories: `/buy-category-electronics`
  - Shops: `/buy-shop-johns-electronics`
  - Blogs: `/view-blog-how-to-choose-laptops`
  - Orders: `/view-order-ord-abc123xyz`
  - Reviews: `/view-review-rev-xyz789abc`
- **Database**: Slugs are primary identifiers in Firestore
- **Navigation**: All routing via URL params/paths, no code-based navigation (except auth tokens)

### SEO Fields (All Resources)

```typescript
{
  slug: string; // Required, unique, follows format above
  seoTitle: string;
  seoDescription: string; // Short description
  seoKeywords: string[];
  specifications: Record<string, string>; // Key-value pairs
}
```

### Logo

- **Format**: SVG only (not text)
- **Location**: `public/logo.svg`
- **Usage**: Header, Footer, Mobile Nav

---

## 🏗️ Layout Structure

### Root Layout

```
┌─────────────────────────────────────┐
│      Advertisement Banner (10%)      │
├─────────────────────────────────────┤
│         Header/Navbar (10%)          │
├─────────────────────────────────────┤
│   Search Bar (10% - if active)       │
├─────────────────────────────────────┤
│                                      │
│         Page Content (60-70%)        │
│                                      │
├─────────────────────────────────────┤
│         Footer (10%)                 │
└─────────────────────────────────────┘
```

### Header (Common in Layout)

- **Desktop**: Normal bar with navigation + search icon
- **Mobile**: Top bar (logo + search) + Bottom bar (icon + label)

### Footer (Common in Layout)

**3 Rows × 4 Columns Grid**

- **Row 1**: Public page links categorized (FAQ, Legal, Support, etc.)
- **Row 2**: Partner logos (Lucide brand icons or custom SVG)
- **Row 3**: Copyright © 2026 + Year

---

## 🧭 Navigation System

### Main Navigation (Horizontally Scrollable)

- Home
- Products
- Categories
- Auctions
- Shops
- User Icon (or avatar if signed in)

### Sub Navigation (Route/Page Specific)

- **Context**: Admin Dashboard, Seller Dashboard, User Dashboard
- **Desktop Placement**:
  - Admin/Seller: Left sidebar
  - User: Right sidebar (allows both open simultaneously)
- **Mobile**: Hidden by default, opens with hamburger menu
- **Behavior**: Auto-hidden on mobile, visible on desktop (can be toggled)
- **User Icon Click**: Opens user sidebar

### Breadcrumbs

- **Source**: Page URL or token from page
- **Format**: `Home / Products / Orange Juice / 500ml Variant`
- **Every Page**: Must have breadcrumbs

---

## 🔍 Global Search

### Search Types

- All (default)
- Products
- Auctions
- Categories
- Reviews
- Blog Posts
- Shops
- Others
- **Multi-select**: Can check multiple types at once

### Search Behavior

1. **Live Suggestions**: Top 10 closest matches as user types
2. **Execute**: Enter key or Search button click
3. **Navigation**: Updates URL → `/search?q=orange&type=products,auctions`
4. **Results Page**: Tabbed interface with infinite scroll

### Page-Specific Search

- **Location**: Above grid/table view
- **Scope**: Filters current resource only
- **No Navigation**: Stays on current page, updates query params
- **Example**: On products page, search locks to `type=products`

---

## 📄 Search Results Page

### Layout

```
Breadcrumbs: Home / Search / "orange juice"
┌─────────────────────────────────────────────┐
│  Tab 1: All (120) | Products (50) | ...     │
├──────────────┬──────────────────────────────┤
│              │  [Grid/Table] [Stock] [Sort] │
│   Filters    │  ┌──────┬──────┬──────┬────┐ │
│   Sidebar    │  │ Item │ Item │ Item │... │ │
│              │  └──────┴──────┴──────┴────┘ │
│              │  [Load More] (Cursor-based)  │
└──────────────┴──────────────────────────────┘
```

### Features

- **Tabs**: One per search type + "All" tab
- **Infinite Scroll**: Each tab independent
- **Filters**: Left sidebar (separate from sub-navigation)
- **Controls**: Grid/Table toggle, Stock checkbox, Sort dropdown (right side)

---

## 🏠 Homepage Structure

### Sections (Top to Bottom)

1. **Advertisement Banner** (10% height)
2. **Navbar** (10% height)
3. **Search Bar** (10% height - conditional on search click)
4. **Welcome Section** (10% height)
   - Heading: "Welcome to Let It Rip"
   - Subheading: 1-2 lines
   - **Background**: Video OR image with options
5. **Hero Carousel** (50% height)
   - **Media**: Image or video support
   - **Details Card**: Configurable position
   - **Buttons**: Max 2, primary button = default onClick link
6. **Popular Categories** (Horizontal scroller)
7. **Featured Products** (Horizontal scroller)
8. **Popular Products** (Horizontal scroller)
9. **FAQ Section**
   - Category selector (horizontal scroller)
   - FAQs (accordions based on selected category)
10. **Footer** (10% height)

---

## 📦 Resource Listing Pages

**Applies to**: Products, Categories, Auctions, Reviews, Shops, Blogs

### Layout

```
Breadcrumbs: Home / Products
┌──────────────────┬─────────────────────────────────────┐
│                  │ 🔍 Search current page              │
│   Filters        ├─────────────────────────────────────┤
│   Sidebar        │  [Grid] [Table]  ☑ In Stock  [Sort]│
│                  │                                      │
│  - Price Range   │  ┌────────┬────────┬────────┬────┐  │
│  - Category      │  │Product │Product │Product │... │  │
│  - Condition     │  │  Card  │  Card  │  Card  │    │  │
│  - Seller        │  └────────┴────────┴────────┴────┘  │
│  - Features      │                                      │
│  ...             │  [Load More] (Cursor pagination)     │
└──────────────────┴─────────────────────────────────────┘
```

### Features

1. **View Modes**: Grid (default) or Table view
2. **Filters**: Left sidebar (independent of sub-navigation)
3. **Quick Controls** (Right side):
   - Grid/Table toggle
   - In Stock checkbox
   - Sort dropdown
4. **Pagination**: Cursor-based (not numbered pages)
5. **URL Params**: `?view=grid&stock=true&sort=price-asc&cursor=abc123`
6. **Search Bar**: Above toggles, filters current page only

---

## 🏪 Shop Details Page

**URL**: `/buy-shop-<shop-slug>/<tab?>`  
**Breadcrumbs**: `Home / Shops / John's Electronics`

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Shop Name + Icons (Featured ⭐ Popular 🔥)             │
├─────────────────────────────────────────────────────────┤
│  Featured Products (5 max, horizontal scroll)           │
│  Featured Auctions (5 max, horizontal scroll)           │
├─────────────────────────────────────────────────────────┤
│  🔍 Search this shop                                    │
├─────────────────────────────────────────────────────────┤
│  Tab: Products (120) | Auctions (45) | Reviews (89)    │
├──────────────┬──────────────────────────────────────────┤
│              │  [Grid/Table] [Stock] [Sort]             │
│   Filters    │  ┌──────┬──────┬──────┬────┐            │
│   Sidebar    │  │ Item │ Item │ Item │... │            │
│              │  └──────┴──────┴──────┴────┘            │
└──────────────┴──────────────────────────────────────────┘
```

### Tabs

- **Products**: Shop's products (filters + toggles)
- **Auctions**: Shop's auctions (filters + toggles)
- **Reviews**: Shop reviews

### Features

- Shop-specific search bar above tabs
- Filters locked to current shop slug
- Featured items at top

---

## 🛍️ Product Details Page

**URL**: `/buy-product-<product-slug>`  
**Breadcrumbs**: `Home / Products / Orange Juice`

### Layout (Desktop)

```
┌─────────────┬────────────────────┬──────────────────┐
│             │                    │  [Wishlist]      │
│   Media     │  Title             │  [Add to Cart]   │
│   Gallery   │  Short Description │  [Buy Now]       │
│             │  Shop Link         │  [Compare]       │
│             │  Category          │  [Share]         │
└─────────────┴────────────────────┴──────────────────┘
├──────────────────────────────────────────────────────┤
│  Icons Row: ⚠️ Incomplete | 📦 Damaged | 🚫 Non-     │
│  Returnable | ⭐ Seller Rating Low | 🚚 Shipping     │
│  Time | ⭐ Featured | 🔥 Popular | 📅 Pre-order | 💰 │
├──────────────────────────────────────────────────────┤
│  SEO & Specifications (Key-Value pairs)              │
├──────────────────────────────────────────────────────┤
│  Large Description (Rich text with images)           │
├──────────────────────────────────────────────────────┤
│  Variants (Same category, horizontal scroll)         │
│  [Product] [Product] [Product] ...                   │
├──────────────────────────────────────────────────────┤
│  Similar Products (Related categories, horiz scroll) │
│  [Product] [Product] [Product] ...                   │
├──────────────────────────────────────────────────────┤
│  Reviews (Table mode, filtered by category)          │
└──────────────────────────────────────────────────────┘
```

### Mobile Layout

- **Stacking**: Media → Title/Description → Buttons (flex column)

### Variants Logic

- **Same Category**: Products with identical category
- **Click**: Opens that product's details page

### Similar Products

- **Parent Category Match**: Uncle/grandparent/sibling categories
- **Excludes**: Current product

---

## 📂 Category Details Page

**URL**: `/buy-category-<category-slug>/<tab?>`  
**Breadcrumbs**: `Home / Categories / Electronics`

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Category Name + Icons (Featured ⭐ Popular 🔥)         │
│  Description + SEO Text + Image                         │
├─────────────────────────────────────────────────────────┤
│  Similar Categories (Horizontal scroll)                 │
│  [Category] [Category] [Category] ...                   │
├─────────────────────────────────────────────────────────┤
│  🔍 Search in this category                             │
├─────────────────────────────────────────────────────────┤
│  Tab: Products (450) | Auctions (120)                   │
├──────────────┬──────────────────────────────────────────┤
│              │  [Grid/Table] [Stock] [Sort]             │
│   Filters    │  ┌──────┬──────┬──────┬────┐            │
│   Sidebar    │  │ Item │ Item │ Item │... │            │
│              │  └──────┴──────┴──────┴────┘            │
└──────────────┴──────────────────────────────────────────┘
```

### Category Hierarchy Logic

- **Category A** → Children X (3 items) + Y (4 items) = **7 total items**
- **Search Category A**: Shows combined results from X and Y
- **Recursive**: Applies to all subcategories

### Tabs

- **Products**: Products in this category + subcategories
- **Auctions**: Auctions in this category + subcategories

---

## 📝 Blog Details Page

**URL**: `/view-blog-<blog-slug>`  
**Breadcrumbs**: `Home / Blogs / How to Choose Laptops`

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Blog Title + Icons (Featured ⭐ Popular 🔥)            │
│  Author Profile Link | Category | Date                  │
├─────────────────────────────────────────────────────────┤
│  Blog Content (Rich text with images)                   │
├─────────────────────────────────────────────────────────┤
│  Poll (Optional - logged-in users can vote)             │
├─────────────────────────────────────────────────────────┤
│  Similar Blog Posts (Horizontal scroll)                 │
│  [Blog] [Blog] [Blog] ...                               │
├─────────────────────────────────────────────────────────┤
│  Comments Section                                        │
│  └─ Comment 1                                           │
│  └─ Comment 2                                           │
│  └─ [Add Comment Form]                                  │
└─────────────────────────────────────────────────────────┘
```

### Features

- **Poll**: Embedded in blog post, requires login
- **Comments**: Threaded discussion
- **Similar Posts**: Same category or author

---

## 🎯 Auction Details Page

**URL**: `/buy-auction-<auction-slug>`  
**Breadcrumbs**: `Home / Auctions / Vintage Camera 1960s`

### Layout (Desktop)

```
┌─────────────┬────────────────────┬──────────────────┐
│             │                    │  ⏰ Time Left:   │
│   Media     │  Title             │     2h 45m       │
│   Gallery   │  Short Description │                  │
│  (Fullscr.) │  Shop Link         │  Current Bid:    │
│             │  Category          │  ₹12,500         │
│             │                    │                  │
│             │                    │  [Place Bid]     │
│             │                    │  [Buy Now]       │
│             │                    │  [Wishlist]      │
└─────────────┴────────────────────┴──────────────────┘
├──────────────────────────────────────────────────────┤
│  Last 5 Bids (Table)                                 │
│  User | Amount | Time                                │
├──────────────────────────────────────────────────────┤
│  Icons: ⭐ Featured | 🗑️ Junk | 📦 Bulk | 🏋️ Heavy │
├──────────────────────────────────────────────────────┤
│  SEO & Specifications (Key-Value pairs)              │
├──────────────────────────────────────────────────────┤
│  Similar Auctions (Same/related category, horiz)     │
│  [Auction] [Auction] [Auction] ...                   │
├──────────────────────────────────────────────────────┤
│  Seller Reviews (Table mode, previous auctions only) │
└──────────────────────────────────────────────────────┘
```

### Media Gallery

- **Fullscreen Lightroom**: Zoom, pan, next/prev
- **Navigation**: Arrow keys or swipe

---

## ⭐ Review Details Page

**URL**: `/view-review-<review-slug>`  
**Breadcrumbs**: `Home / Reviews / Great Product Quality`

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  Product/Auction Link (works even if expired)           │
│  Category | Seller Profile Link                         │
├─────────────────────────────────────────────────────────┤
│  Rating: ⭐⭐⭐⭐⭐ 5/5                                    │
├─────────────────────────────────────────────────────────┤
│  Shared Experience (100 words max)                      │
│  "This product exceeded my expectations..."            │
├─────────────────────────────────────────────────────────┤
│  Media (Horizontal scroll, fullscreen on click)         │
│  [Image 1] [Image 2] [Image 3] [Video]                 │
│  Max: 3 images + 1 video                                │
└─────────────────────────────────────────────────────────┘
```

### Expired Products

- **Navigable**: Links work even if product is expired
- **Details Page**: Shows "Product Unavailable" notice
- **Variants**: Don't include expired products
- **Suggestions**: Can show as "Previously Available" type

---

## 📊 Datatables (CMS Resources)

**Used In**: Seller/Admin/User dashboards for managing resources

### Layout

```
┌─────────────────────────────────────────────────────────┐
│  🔍 Search [Enter to search]                   [+ New]  │
├──────────────┬──────────────────────────────────────────┤
│              │  [Grid] [Table]  ☑ Active  [Sort]       │
│   Filters    ├──────────────────────────────────────────┤
│   Sidebar    │  [Bulk Actions ▼]  (Table mode only)    │
│              │                                          │
│  Admin-only  │  ┌─┬──────┬───────┬───────┬─────────┐   │
│  filters:    │  │☑│Name  │Status │Price  │Actions  │   │
│  - User      │  ├─┼──────┼───────┼───────┼─────────┤   │
│  - Shop      │  │☑│Item 1│Active │₹1,200 │⚡📝👁🗑│   │
│              │  │☑│Item 2│Stock  │₹800   │⚡📝👁🗑│   │
│              │  └─┴──────┴───────┴───────┴─────────┘   │
└──────────────┴──────────────────────────────────────────┘
```

### Features

1. **Search**: Enter key or button click (no live suggestions)
2. **View Modes**: Table (default) or Grid
3. **Bulk Actions** (Table mode only):
   - Activate/Deactivate
   - In Stock/Out of Stock
   - Bulk Price Change
   - Bulk Delete (with confirmation)
4. **Row Actions**:
   - ⚡ **Lightning**: Inline edit
   - 📝 **Pencil**: Edit in wizard
   - 👁 **Eye**: View in new tab (not for users)
   - 🗑 **Bin**: Delete (with confirmation)
5. **Admin Filters**: Can filter by User ID or Shop (sellers restricted to their own)

---

## 🧙 Wizards (Detailed Edits)

**Used For**: Creating/Editing products, auctions, shops, etc.

### Steps

1. **Step 1**: Required fields (title, price, category, etc.)
2. **Step 2**: Media (optional, except products = 1 image minimum)
3. **Step 3**: SEO (description, keywords - inherits from category/shop)
4. **Step 4**: Specifications & features (pre-order, custom specs)

### Behavior

- **Non-Linear**: Can jump to any step (e.g., Step 1 → Step 4 → Step 2)
- **Always Visible**: Save/Create/Finish button on every step
- **Inline Validation**: Real-time error feedback
- **Error Badges**: Show error count per step (e.g., "Step 1: 1 error")

### UI

```
┌─────────────────────────────────────────────────────────┐
│  [1 Required ⚠️] [2 Media ✓] [3 SEO ✓] [4 Specs]       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Current Step Content                                   │
│                                                          │
│  [Cancel]              [Save Draft]     [Finish & Save] │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Dropdowns with Create Options

**Used For**: Categories, Addresses, Coupons during product/order creation

### Behavior

- **Dropdown**: Shows existing options
- **+ Create New**: Opens modal with required fields
- **On Save**: Adds to dropdown, auto-selects for current resource

### Example: Category Dropdown

```
┌────────────────────────────┐
│ Select Category            │
├────────────────────────────┤
│ Electronics                │
│ Fashion                    │
│ Home & Garden              │
├────────────────────────────┤
│ + Create New Category      │ ← Opens modal
└────────────────────────────┘
```

### Modal

- Required fields only
- Quick creation
- No wizard steps
- Auto-selects after creation

---

## 🎟️ Coupons

### Admin Coupons

- **Scope**: Global (all shops) or Shop-specific
- **Types**: Percentage, Fixed Amount, Free Shipping
- **Conditions**: Min order value, user eligibility, expiry

### Seller Coupons

- **Scope**: Own shops only
- **Creation**: Same interface as admin
- **Restrictions**: Cannot create global coupons

### Coupon Code Format

- `SAVE20` - 20% off
- `FLAT100` - ₹100 off
- `FREESHIP` - Free shipping
- `NEWUSER25` - 25% off for new users

---

## 🛒 Carts

### Cart Persistence

1. **Guest User**: LocalStorage (browser-specific)
2. **Guest → Sign In**: Merge guest cart with user cart
3. **Signed In**: Firestore (synced across devices)
4. **Multi-Device**: Real-time sync via Firestore

### Cart Items

```typescript
{
  productId: string;
  productSlug: string;
  quantity: number;
  price: number;
  addedAt: Timestamp;
  shopId: string;
}
```

---

## 💳 Payments

### Payment Gateways

- **Primary**: Razorpay
- **Secondary**: PhonePe, Paytm
- **COD**: Cash on Delivery (for eligible orders)

### Security Measures

1. **Server-Side Verification**: All payment confirmations on backend
2. **Webhooks**: Listen for Razorpay/PhonePe webhooks
3. **Idempotency**: Prevent duplicate charges
4. **PCI Compliance**: Never store card details
5. **2FA**: Require OTP for high-value orders
6. **Fraud Detection**: Monitor suspicious patterns

### Payment Flow

1. User clicks "Pay Now"
2. Backend creates order (`/api/orders`)
3. Backend initiates payment gateway request
4. User completes payment on gateway
5. Gateway sends webhook to backend
6. Backend verifies signature, updates order status
7. Frontend receives confirmation, shows success

---

## 🔥 Firebase

### Architecture

- **Minimize Client-Side Firebase**: Use API routes instead
- **Client-Side Only For**:
  - Real-time listeners (chat, notifications)
  - Auth state changes
  - File uploads (with signed URLs)
- **API Routes For**:
  - CRUD operations
  - Payment processing
  - Order management
  - Admin actions

### Firestore Indexes

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "categorySlug", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    // ... more indexes
  ]
}
```

### Security Rules

- **Strict Rules**: Deny by default
- **Server-Side Tokens**: Validate custom claims
- **Field-Level Security**: Protect sensitive fields
- **Rate Limiting**: Prevent abuse

### Firebase Functions

- **Triggers**: onCreate, onUpdate, onDelete
- **Scheduled**: Daily cleanup, weekly reports
- **Callable**: Secure server-side logic
- **Example Uses**:
  - Send order confirmation emails
  - Update search indexes
  - Generate thumbnails
  - Process auction bids

---

## ⚡ Performance & Design

### Performance Optimization

1. **Code Splitting**: Dynamic imports for routes
2. **Image Optimization**: Next.js Image component, WebP format
3. **Lazy Loading**: Below-the-fold content
4. **Caching**: React Query with 5min stale time
5. **Bundle Size**: Tree shaking, minimize dependencies
6. **SSR/SSG**: Server-side rendering for SEO pages
7. **CDN**: Serve static assets from CDN
8. **Database**: Proper indexes, cursor pagination

### Lightweight App

- **Remove Unused Code**: Regular audits
- **Minify Assets**: Terser, CSS minification
- **Compress**: Gzip/Brotli compression
- **Audit Tools**: Lighthouse, Bundle Analyzer

### Modern Styles & Colors

- **Design System**: Consistent spacing, typography
- **Color Palette**: Modern, accessible (WCAG AA)
  - Primary: Blue (#3B82F6)
  - Secondary: Gray (#6B7280)
  - Success: Green (#10B981)
  - Warning: Yellow (#F59E0B)
  - Danger: Red (#EF4444)
- **Dark Mode**: Full support
- **Animations**: Subtle, performant (CSS transforms)
- **Typography**: System fonts for performance
- **Icons**: Lucide React (tree-shakable)

---

## 📐 Component Library Status

### ✅ Already in React Library (Reuse These!)

**Layout Components:**

- ✅ Header - Main navigation header
- ✅ Footer - Footer with links
- ✅ MobileNavigation - Bottom nav bar
- ✅ Container, Section, Wrapper - Layout containers
- ✅ Breadcrumb - Breadcrumb navigation

**Cards (All with Skeletons):**

- ✅ ProductCard - Product display with badges
- ✅ AuctionCard - Auction with timer
- ✅ CategoryCard - Category display
- ✅ ShopCard - Shop display
- ✅ ReviewCard - Review with media
- ✅ BlogCard - Blog post display
- ✅ StatsCard - Statistics display

**Search & Filters:**

- ✅ SearchInput - Basic search input
- ✅ SearchBar - Page-specific search
- ✅ SearchFilters - Type filters
- ✅ SearchResults - Results display
- ✅ SearchableDropdown - Dropdown with search
- ✅ ContentTypeFilter - Multi-type selection
- ✅ UnifiedFilterSidebar - Advanced filters with persistence
- ✅ ProductFilters, AuctionFilters, CategoryFilters, ShopFilters, etc.
- ✅ PriceRangeFilter - Price range slider

**Tables & Data:**

- ✅ DataTable - Full-featured data table
- ✅ ResponsiveTable - Mobile-responsive table
- ✅ InlineEditRow - Inline editing
- ✅ BulkActionBar - Bulk actions toolbar
- ✅ QuickCreateRow - Quick create in table
- ✅ ActionMenu - Row action menu
- ✅ StatusBadge - Status display

**Resource Listing:**

- ✅ ResourceListing - Complete grid/list view with filters
- ✅ HorizontalScroller - Side-scrolling items
- ✅ SimilarItems - Related items scroller

**Pagination:**

- ✅ CursorPagination - Cursor-based pagination
- ✅ SimplePagination - Number-based pagination
- ✅ AdvancedPagination - Full pagination controls

**Product Components:**

- ✅ ProductGallery - Media gallery
- ✅ ProductInfo - Product details
- ✅ ProductVariants - Variants selector
- ✅ SimilarProducts - Related products
- ✅ ProductDescription - Rich text description
- ✅ ReviewList - Product reviews
- ✅ ReviewForm - Review submission

**Auction Components:**

- ✅ AuctionGallery - Media gallery
- ✅ AuctionInfo - Auction details
- ✅ LiveCountdown - Real-time timer
- ✅ LiveBidHistory - Bid history table
- ✅ SimilarAuctions - Related auctions
- ✅ AutoBidSetup - Auto-bid configuration

**Media:**

- ✅ MediaGallery - Media gallery with lightbox
- ✅ MediaPreviewCard - Media preview

**Homepage:**

- ✅ HeroSlide - Hero carousel slide
- ✅ WelcomeHero - Welcome section
- ✅ ValueProposition - Value props display

**Wizards:**

- ✅ CategorySelectionStep - Category picker
- ✅ ShopSelectionStep - Shop picker
- ✅ ContactInfoStep - Contact form
- ✅ BusinessAddressStep - Address form

**Forms & UI:**

- ✅ Button, Checkbox, ToggleSwitch - Basic inputs
- ✅ MobileInput - Mobile number input
- ✅ Textarea - Text area input
- ✅ FormLayout - Form layout wrapper
- ✅ FieldError - Error display
- ✅ LoadingSpinner - Loading indicator
- ✅ Toast - Toast notifications
- ✅ ConfirmDialog - Confirmation dialog
- ✅ ErrorBoundary - Error boundary

### 🔨 Need to Create/Enhance

- [ ] Update Header - Add SVG logo support
- [ ] Update Footer - 3×4 grid layout with partner logos
- [ ] Advertisement Banner - Homepage ad banner
- [ ] Enhance HeroSlide - Add video support
- [ ] FAQ Accordion - FAQ with category filter
- [ ] SEO Fields Group - SEO form fields
- [ ] Enhanced SearchResults - Add tabbed interface
- [ ] Breadcrumbs - Dynamic URL generation

### 📝 Notes

**Most components already exist in the library!** We'll focus on:

1. Enhancing existing components (SVG logo, video support)
2. Creating missing specialized components (FAQ, SEO fields)
3. Integrating components into pages with proper data flow

**Total Reduction:** ~30 components don't need to be created!

---

## 🗂️ Database Schema Updates

### Collections

```
products/
  - slug (indexed, unique)
  - seoTitle, seoDescription, seoKeywords
  - categorySlug (indexed)
  - shopSlug (indexed)
  - specifications: {}
  - status: 'active' | 'inactive' | 'outOfStock'
  - featured: boolean
  - popular: boolean

auctions/
  - slug (indexed, unique)
  - seoTitle, seoDescription, seoKeywords
  - categorySlug (indexed)
  - shopSlug (indexed)
  - specifications: {}
  - bidEndTime: Timestamp
  - currentBid: number

categories/
  - slug (indexed, unique)
  - parentSlug: string | null
  - children: string[] (slugs)
  - seoTitle, seoDescription, seoKeywords

shops/
  - slug (indexed, unique)
  - ownerUid (indexed)
  - seoTitle, seoDescription, seoKeywords

blogs/
  - slug (indexed, unique)
  - authorUid (indexed)
  - categorySlug (indexed)
  - seoTitle, seoDescription, seoKeywords
  - poll: {} | null

reviews/
  - slug (indexed, unique)
  - productSlug | auctionSlug
  - rating: 1-5
  - media: { images: string[], video: string | null }

carts/
  - userId: string | 'guest-{id}'
  - items: []
  - updatedAt: Timestamp
```

---

## 🎯 Implementation Priority

### Phase 2A: Core Pages (Week 1)

1. Homepage with all sections
2. Product listing page
3. Product details page
4. Category listing page
5. Category details page

### Phase 2B: Commerce Flow (Week 2)

1. Global search + results page
2. Shop details page
3. Auction listing page
4. Auction details page
5. Cart page

### Phase 2C: User Features (Week 3)

1. Blog listing + details pages
2. Review listing + details pages
3. User dashboard
4. Order management
5. Wishlist

### Phase 2D: Seller/Admin (Week 4)

1. Seller dashboard
2. Product/Auction wizards
3. Datatables with bulk actions
4. Admin dashboard
5. Coupons management

### Phase 2E: Polish & Security (Week 5)

1. Payment integration
2. Firebase functions + indexes
3. Cart persistence
4. Performance optimization
5. Security hardening

---

**End of Design Specifications**
