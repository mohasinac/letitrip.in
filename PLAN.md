# LetItRip E-Commerce Platform Redesign Plan

**Date**: February 7, 2026  
**Status**: Planning Phase  
**Compliance**: Following 11-Point Coding Standards (100%)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Database Schema Design](#database-schema-design)
4. [Admin Dashboard Structure](#admin-dashboard-structure)
5. [Homepage Structure](#homepage-structure)
6. [API Endpoints](#api-endpoints)
7. [Component Architecture](#component-architecture)
8. [Implementation Phases](#implementation-phases)
9. [Technical Requirements](#technical-requirements)
10. [Timeline & Milestones](#timeline--milestones)

---

## 1. Executive Summary

### Project Goals

Transform LetItRip into a comprehensive multi-seller e-commerce and auction platform with:

- **Dynamic Homepage Management** - CMS-like control over all homepage sections
- **Advanced Admin Dashboard** - Complete site and content management
- **Rich Text Support** - WYSIWYG editors for content creation
- **Modular Architecture** - Reusable components following DRY principles
- **SEO Optimization** - Configurable metadata, structured data
- **Performance** - Lazy loading, image optimization, caching

### Core Features

1. **Admin Dashboard** (8 tabs)
   - Dashboard Analytics
   - User Management
   - Products Management
   - Auctions Management
   - Site Settings
   - Content Management (Carousel, Sections, Banners)
   - Review Management
   - Coupon System

2. **Dynamic Homepage** (10 sections)
   - Hero Carousel (9x9 grid system)
   - Welcome Section
   - Top Categories (4 max, auto-scroll)
   - Featured Products (18 max, promoted)
   - Featured Auctions (18 max, promoted)
   - Site Features
   - Customer Reviews
   - Advertisement Banners
   - FAQ Section
   - Footer with Site Info

---

## 2. System Architecture

### Technology Stack

- **Frontend**: Next.js 16.1.1, React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Storage, Auth, Realtime DB)
- **Rich Text**: Draft.js or Tiptap (React-based WYSIWYG)
- **State Management**: React Context + Custom Hooks
- **Image Handling**: Firebase Storage + Next.js Image Optimization
- **Caching**: Redis-like in-memory cache (CacheManager class)

### Design Patterns

- **Repository Pattern** - Data access layer
- **Singleton Pattern** - Services (CacheManager, Logger)
- **Factory Pattern** - Component creation
- **Strategy Pattern** - Content rendering
- **Observer Pattern** - Real-time updates

---

## 3. Database Schema Design

### 3.1 New Firestore Collections

#### `siteSettings` Collection

```typescript
interface SiteSettingsDocument {
  id: "global"; // Singleton document
  siteName: string;
  motto: string;
  logo: {
    url: string;
    alt: string;
    format: "svg" | "png";
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  emailSettings: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
    ogImage: string;
  };
  features: {
    id: string;
    name: string;
    description: string;
    icon: string;
    enabled: boolean;
  }[];
  legalPages: {
    termsOfService: string; // Rich text JSON
    privacyPolicy: string;
    refundPolicy: string;
    shippingPolicy: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### `carouselSlides` Collection

```typescript
interface CarouselSlideDocument {
  id: string;
  title: string;
  order: number; // Display order
  active: boolean;
  media: {
    type: "image" | "video";
    url: string;
    alt: string;
    thumbnail?: string; // For videos
  };
  link?: {
    url: string;
    openInNewTab: boolean;
  };
  mobileMedia?: {
    type: "image" | "video";
    url: string;
  };
  cards: {
    id: string;
    gridPosition: { row: number; col: number }; // 9x9 grid (1-9)
    mobilePosition?: { row: number; col: number }; // 2x2 grid (1-2)
    width: number; // Grid cells span
    height: number; // Grid cells span
    background: {
      type: "color" | "gradient" | "image";
      value: string;
    };
    content: {
      title?: string;
      subtitle?: string;
      description?: string;
    };
    buttons: {
      id: string;
      text: string;
      link: string;
      variant: "primary" | "secondary" | "outline";
      openInNewTab: boolean;
    }[];
    isButtonOnly: boolean; // Card acts as large button
    mobileHideText: boolean; // Hide text on mobile
  }[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin user ID
}
```

#### `homepageSections` Collection

```typescript
interface HomepageSectionDocument {
  id: string;
  type:
    | "welcome"
    | "categories"
    | "products"
    | "auctions"
    | "reviews"
    | "features"
    | "banner"
    | "faq";
  order: number;
  enabled: boolean;
  config: Record<string, any>; // Type-specific configuration
  createdAt: Date;
  updatedAt: Date;
}

// Section-specific configs
interface WelcomeSectionConfig {
  h1: string;
  subtitle: string;
  description: string; // Rich text JSON
  showCTA: boolean;
  ctaText?: string;
  ctaLink?: string;
}

interface CategoriesSectionConfig {
  title: string;
  categories: {
    categoryId: string;
    name: string;
    featuredCount: 9;
    autoScroll: boolean;
    scrollInterval: number; // milliseconds
  }[];
  maxCategories: 4;
}

interface ProductsSectionConfig {
  title: string;
  subtitle?: string;
  maxProducts: 18;
  rows: 2;
  itemsPerRow: 3;
  mobileItemsPerRow: 1;
  autoScroll: boolean;
  scrollInterval: number;
}

interface AuctionsSectionConfig {
  title: string;
  subtitle?: string;
  maxAuctions: 18;
  rows: 2;
  itemsPerRow: 3;
  mobileItemsPerRow: 1;
  autoScroll: boolean;
  scrollInterval: number;
}

interface ReviewsSectionConfig {
  title: string;
  maxReviews: 18;
  itemsPerView: 3;
  mobileItemsPerView: 1;
  autoScroll: boolean;
  scrollInterval: number;
}

interface FeaturesSectionConfig {
  title: string;
  features: string[]; // Feature IDs from siteSettings
}

interface BannerSectionConfig {
  height: "sm" | "md" | "lg" | "xl"; // 200px, 300px, 400px, 500px
  backgroundImage?: string;
  backgroundColor?: string;
  gradient?: string;
  content: {
    title: string;
    subtitle?: string;
    description?: string;
  };
  buttons: {
    text: string;
    link: string;
    variant: "primary" | "secondary" | "outline";
  }[];
  clickable: boolean;
  clickLink?: string;
}

interface FAQSectionConfig {
  title: string;
  faqs: {
    id: string;
    question: string;
    answer: string; // Rich text JSON
    category: "general" | "shipping" | "returns" | "payment" | "account";
    order: number;
  }[];
}
```

#### `coupons` Collection

```typescript
interface CouponDocument {
  id: string;
  code: string; // Unique coupon code
  name: string;
  description: string;
  type: "percentage" | "fixed" | "free_shipping" | "buy_x_get_y";

  // Discount configuration
  discount: {
    value: number; // Percentage (0-100) or fixed amount
    maxDiscount?: number; // Max discount for percentage type
    minPurchase?: number; // Minimum purchase amount
  };

  // Buy X Get Y configuration (for BOGO deals)
  bxgy?: {
    buyQuantity: number;
    getQuantity: number;
    applicableProducts?: string[]; // Product IDs
    applicableCategories?: string[];
  };

  // Tiered discounts
  tiers?: {
    minAmount: number;
    discountValue: number;
  }[];

  // Usage limits
  usage: {
    totalLimit?: number; // Total uses across all users
    perUserLimit?: number; // Uses per user
    currentUsage: number;
  };

  // Validity
  validity: {
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
  };

  // Restrictions
  restrictions: {
    applicableProducts?: string[];
    applicableCategories?: string[];
    applicableSellers?: string[];
    excludeProducts?: string[];
    excludeCategories?: string[];
    firstTimeUserOnly: boolean;
    combineWithSellerCoupons: boolean;
  };

  // Metadata
  createdBy: string; // Admin user ID
  createdAt: Date;
  updatedAt: Date;
  stats: {
    totalUses: number;
    totalRevenue: number;
    totalDiscount: number;
  };
}
```

#### `couponUsage` Collection (Subcollection of users)

```typescript
// Path: users/{userId}/couponUsage/{couponId}
interface CouponUsageDocument {
  id: string; // Coupon ID
  userId: string;
  couponCode: string;
  usageCount: number;
  lastUsedAt: Date;
  orders: string[]; // Order IDs where coupon was used
}
```

### 3.2 Enhanced Existing Collections

#### Update `products` Collection

```typescript
// Add to existing ProductDocument
interface ProductDocumentEnhancement {
  // Promotion flags
  isFeatured: boolean; // Show in featured section
  isTopProduct: boolean; // Show in top products (promoted ad)
  featuredUntil?: Date; // Expiry for featured status

  // Admin moderation
  moderationStatus: "approved" | "pending" | "flagged" | "rejected";
  moderationNotes?: string;
  moderatedBy?: string; // Admin user ID
  moderatedAt?: Date;
  flags: {
    reason: string;
    reportedBy: string;
    reportedAt: Date;
  }[];

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}
```

#### Update `orders` Collection

```typescript
// Add to existing OrderDocument
interface OrderDocumentEnhancement {
  // Shipment tracking
  shipment?: {
    carrier: string;
    trackingNumber: string;
    estimatedDelivery: Date;
    actualDelivery?: Date;
    status: "pending" | "shipped" | "in_transit" | "delivered" | "returned";
    updates: {
      status: string;
      location: string;
      timestamp: Date;
    }[];
  };

  // Coupons applied
  coupons: {
    code: string;
    discount: number;
    type: "platform" | "seller";
  }[];

  // Revenue calculation
  revenue: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    platformFee: number;
    sellerPayout: number;
    total: number;
  };
}
```

#### Update `reviews` Collection

```typescript
// Add to existing ReviewDocument
interface ReviewDocumentEnhancement {
  // Homepage feature
  isFeatured: boolean; // Show on homepage
  featuredUntil?: Date;

  // Admin moderation
  moderationStatus: "approved" | "pending" | "rewrite_requested" | "rejected";
  moderationNotes?: string;
  moderatedBy?: string;
  moderatedAt?: Date;

  // Rewrite request
  rewriteRequest?: {
    reason: string;
    requestedBy: string;
    requestedAt: Date;
    resolved: boolean;
  };
}
```

#### Update `users` Collection

```typescript
// Add to existing UserDocument
interface UserDocumentEnhancement {
  // Soft ban system
  banned: {
    isBanned: boolean;
    bannedAt?: Date;
    bannedBy?: string; // Admin user ID
    bannedUntil?: Date; // null = permanent
    reason?: string;
    type: "soft" | "permanent";
  };

  // Statistics
  stats: {
    totalOrders: number;
    totalSpent: number;
    totalSales: number; // For sellers
    averageRating: number;
  };
}
```

### 3.3 Firestore Indices Required

```json
{
  "indexes": [
    // Carousel slides
    {
      "collectionGroup": "carouselSlides",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "active", "order": "ASCENDING" },
        { "fieldPath": "order", "order": "ASCENDING" }
      ]
    },

    // Homepage sections
    {
      "collectionGroup": "homepageSections",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "enabled", "order": "ASCENDING" },
        { "fieldPath": "order", "order": "ASCENDING" }
      ]
    },

    // Featured products
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isTopProduct", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },

    // Moderation status
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "moderationStatus", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },

    // Featured reviews
    {
      "collectionGroup": "reviews",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isFeatured", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },

    // Active coupons
    {
      "collectionGroup": "coupons",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "validity.isActive", "order": "ASCENDING" },
        { "fieldPath": "validity.endDate", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## 4. Admin Dashboard Structure

### 4.1 Admin Tabs Navigation

```typescript
const ADMIN_TABS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    path: "/admin",
  },
  { id: "users", label: "Users", icon: "Users", path: "/admin/users" },
  {
    id: "products",
    label: "Products",
    icon: "Package",
    path: "/admin/products",
  },
  { id: "auctions", label: "Auctions", icon: "Gavel", path: "/admin/auctions" },
  { id: "site", label: "Site Settings", icon: "Settings", path: "/admin/site" },
  { id: "content", label: "Content", icon: "Layout", path: "/admin/content" },
  { id: "reviews", label: "Reviews", icon: "Star", path: "/admin/reviews" },
  { id: "coupons", label: "Coupons", icon: "Tag", path: "/admin/coupons" },
];
```

### 4.2 Dashboard Page (`/admin`)

**Components**:

- `AnalyticsOverview` - Key metrics cards
- `UsersChart` - New users over time
- `OrdersChart` - Orders and revenue trends
- `ShipmentsChart` - Shipment status breakdown
- `RevenueChart` - Revenue breakdown (products, auctions, fees)
- `TopPagesTable` - Most viewed pages (using Firebase Analytics)

**Metrics to Display**:

- Total Users, New This Month
- Total Orders, Pending, Shipped, Delivered
- Total Revenue, This Month, Growth %
- Active Shipments, Delayed Shipments
- Top Products (by views, sales)
- Top Sellers (by revenue)

### 4.3 Users Management (`/admin/users`)

**Features**:

- User list with filters (role, status, banned)
- Search by name, email, phone
- User details modal
- Actions:
  - Promote/Demote role (user → seller → moderator → admin)
  - Soft ban (temporary or permanent)
  - Delete user (keep orders for revenue)
- Bulk actions support

**Components**:

- `UserListTable` with server-side pagination
- `UserActionsMenu` dropdown
- `BanUserModal` with reason and duration
- `DeleteUserModal` with confirmation

### 4.4 Products Management (`/admin/products`)

**Features**:

- All products from all sellers
- Filters: category, status, seller, moderation status
- Search by name, SKU
- Actions:
  - Publish/Unpublish
  - Delete (archive)
  - Flag (with reason)
  - Request review (with comments)
  - Feature on homepage
  - Mark as top product (promoted ad)
- Bulk actions support

**Components**:

- `ProductListTable` with images
- `ProductModerationPanel`
- `FlagProductModal`
- `FeatureProductModal`

### 4.5 Auctions Management (`/admin/auctions`)

Similar to products but with auction-specific features:

- Bid history
- Extend auction time
- Cancel auction (with refund)
- Feature on homepage
- Mark as top auction

### 4.6 Site Settings (`/admin/site`)

**Sections**:

1. **Basic Info**
   - Site name, motto
   - Contact email, phone, address
   - Social media links

2. **Branding**
   - Logo upload (SVG preferred)
   - Favicon
   - Brand colors

3. **Email Settings**
   - From name, email
   - SMTP settings (if not using Resend)
   - Email templates

4. **SEO**
   - Default title, description
   - Keywords
   - Open Graph image
   - Structured data

5. **Features**
   - Checkboxes for site features
   - Secure checkout, Fast shipping, etc.

6. **Legal Pages** (Rich text editor)
   - Terms of Service
   - Privacy Policy
   - Refund Policy
   - Shipping Policy

**Components**:

- `SiteInfoForm`
- `LogoUploadSection`
- `EmailSettingsForm`
- `SEOConfigForm`
- `FeaturesChecklistEditor`
- `RichTextEditor` (Draft.js or Tiptap)

### 4.7 Content Management (`/admin/content`)

**Sub-tabs**:

1. **Carousel** - Manage hero slides
2. **Sections** - Homepage section ordering
3. **Banners** - Advertisement banners
4. **FAQ** - FAQ management

#### Carousel Editor

- List of slides with preview
- Add/Edit/Delete slides
- Drag-and-drop ordering
- Grid editor (9x9) for card placement
- Card designer with:
  - Background color/gradient/image
  - Text content (title, subtitle, description)
  - Up to 2 buttons
  - Button-only mode
- Mobile preview (2x2 grid)
- Publish/Unpublish slides

#### Section Manager

- Drag-and-drop section reordering
- Enable/Disable sections
- Configure section-specific settings
- Preview mode

#### Banner Editor

- Create custom banners
- Set height (sm, md, lg, xl)
- Background image/color/gradient
- Add content and buttons
- Link configuration

#### FAQ Manager

- Add/Edit/Delete FAQs
- Categorize FAQs
- Rich text answers
- Drag-and-drop ordering

**Components**:

- `CarouselSlideList`
- `CarouselSlideEditor` with grid system
- `GridCardEditor`
- `SectionOrderManager` (drag-and-drop)
- `BannerEditor`
- `FAQEditor`

### 4.8 Reviews Management (`/admin/reviews`)

**Features**:

- All reviews from all orders
- Filters: rating, status, featured
- Actions:
  - Approve/Reject
  - Feature on homepage
  - Request rewrite (with reason)
  - Delete
- Moderation queue view

**Components**:

- `ReviewListTable`
- `ReviewModerationPanel`
- `FeatureReviewModal`
- `RequestRewriteModal`

### 4.9 Coupons Management (`/admin/coupons`)

**Features**:

- Create complex coupons
- Coupon types:
  - Percentage discount
  - Fixed amount discount
  - Free shipping
  - Buy X Get Y
  - Tiered discounts
- Set restrictions:
  - Applicable products/categories/sellers
  - Usage limits (total, per user)
  - Validity dates
  - First-time users only
  - Combine with seller coupons
- View usage statistics
- Deactivate/Delete coupons

**Components**:

- `CouponListTable`
- `CouponCreator` wizard
- `CouponStatsCard`
- `TieredDiscountEditor`
- `BXGYConfigEditor`

---

## 5. Homepage Structure

### 5.1 Section Order (Configurable)

1. **Hero Carousel** (9x9 grid system)
2. **Welcome Section** (H1 + description)
3. **Top Categories** (4 max, auto-scroll)
4. **Featured Products** (18 max, 2 rows)
5. **Advertisement Banner 1**
6. **Featured Auctions** (18 max, 2 rows)
7. **Site Features** (icons + text)
8. **Advertisement Banner 2**
9. **Customer Reviews** (18 max, horizontal scroll)
10. **FAQ Section**
11. **Footer** (site info, links, social)

### 5.2 Component Breakdown

#### HeroCarousel Component

```typescript
interface HeroCarouselProps {
  slides: CarouselSlideDocument[];
  autoPlay?: boolean;
  interval?: number;
}

// Features:
// - Full-width responsive carousel
// - 9x9 grid overlay for cards (desktop)
// - 2x2 grid overlay for cards (mobile)
// - Video support with controls
// - Swipe gestures on mobile
// - Keyboard navigation
// - Lazy loading for images
```

#### WelcomeSection Component

```typescript
interface WelcomeSectionProps {
  h1: string;
  subtitle: string;
  description: string; // Rich text HTML
  showCTA: boolean;
  ctaText?: string;
  ctaLink?: string;
}
```

#### TopCategoriesSection Component

```typescript
interface TopCategoriesSectionProps {
  title: string;
  categories: {
    id: string;
    name: string;
    products: ProductDocument[];
  }[];
  autoScroll: boolean;
}

// Features:
// - Horizontal scrollable container
// - 3 products visible (1 on mobile)
// - Auto-scroll if no user interaction
// - "View All" button per category
```

#### FeaturedProductsSection Component

```typescript
interface FeaturedProductsSectionProps {
  title: string;
  subtitle?: string;
  products: ProductDocument[];
  rows: number;
  itemsPerRow: number;
}

// Features:
// - 2 rows of products
// - Horizontal scroll per row
// - Lazy loading
// - Quick view modal
```

#### AdvertisementBanner Component

```typescript
interface AdvertisementBannerProps {
  height: "sm" | "md" | "lg" | "xl";
  backgroundImage?: string;
  backgroundColor?: string;
  content: {
    title: string;
    subtitle?: string;
    description?: string;
  };
  buttons: ButtonConfig[];
  clickable: boolean;
  clickLink?: string;
}
```

#### CustomerReviewsSection Component

```typescript
interface CustomerReviewsSectionProps {
  title: string;
  reviews: ReviewDocument[];
  autoScroll: boolean;
}

// Features:
// - Horizontal scrollable cards
// - 3 visible (1 on mobile)
// - Star ratings
// - User avatars
// - Product links
```

#### FAQSection Component

```typescript
interface FAQSectionProps {
  title: string;
  faqs: {
    question: string;
    answer: string; // HTML
    category: string;
  }[];
}

// Features:
// - Accordion UI
// - Category tabs
// - Search functionality
// - Rich text answers
```

---

## 6. API Endpoints

### 6.1 Admin APIs

#### Site Settings

- `GET /api/admin/site-settings` - Get all settings
- `PATCH /api/admin/site-settings` - Update settings
- `POST /api/admin/site-settings/logo` - Upload logo
- `POST /api/admin/site-settings/favicon` - Upload favicon

#### Carousel

- `GET /api/admin/carousel` - List all slides
- `POST /api/admin/carousel` - Create slide
- `GET /api/admin/carousel/[id]` - Get slide details
- `PATCH /api/admin/carousel/[id]` - Update slide
- `DELETE /api/admin/carousel/[id]` - Delete slide
- `POST /api/admin/carousel/[id]/cards` - Add card to slide
- `PATCH /api/admin/carousel/[id]/cards/[cardId]` - Update card
- `DELETE /api/admin/carousel/[id]/cards/[cardId]` - Delete card
- `PATCH /api/admin/carousel/reorder` - Reorder slides

#### Homepage Sections

- `GET /api/admin/homepage/sections` - List all sections
- `PATCH /api/admin/homepage/sections/[id]` - Update section
- `PATCH /api/admin/homepage/sections/reorder` - Reorder sections

#### Banners

- `GET /api/admin/banners` - List all banners
- `POST /api/admin/banners` - Create banner
- `PATCH /api/admin/banners/[id]` - Update banner
- `DELETE /api/admin/banners/[id]` - Delete banner

#### FAQ

- `GET /api/admin/faq` - List all FAQs
- `POST /api/admin/faq` - Create FAQ
- `PATCH /api/admin/faq/[id]` - Update FAQ
- `DELETE /api/admin/faq/[id]` - Delete FAQ
- `PATCH /api/admin/faq/reorder` - Reorder FAQs

#### Users Management

- `GET /api/admin/users` - List users (with filters)
- `GET /api/admin/users/[uid]` - Get user details
- `PATCH /api/admin/users/[uid]` - Update user
- `POST /api/admin/users/[uid]/ban` - Ban user
- `POST /api/admin/users/[uid]/unban` - Unban user
- `DELETE /api/admin/users/[uid]` - Delete user

#### Products Management

- `GET /api/admin/products` - List all products
- `PATCH /api/admin/products/[id]` - Update product
- `POST /api/admin/products/[id]/flag` - Flag product
- `POST /api/admin/products/[id]/feature` - Feature product
- `POST /api/admin/products/[id]/moderate` - Moderate product
- `DELETE /api/admin/products/[id]` - Delete product

#### Auctions Management

- `GET /api/admin/auctions` - List all auctions
- `PATCH /api/admin/auctions/[id]` - Update auction
- `POST /api/admin/auctions/[id]/flag` - Flag auction
- `POST /api/admin/auctions/[id]/feature` - Feature auction
- `POST /api/admin/auctions/[id]/extend` - Extend auction
- `POST /api/admin/auctions/[id]/cancel` - Cancel auction
- `DELETE /api/admin/auctions/[id]` - Delete auction

#### Reviews Management

- `GET /api/admin/reviews` - List all reviews
- `PATCH /api/admin/reviews/[id]` - Update review
- `POST /api/admin/reviews/[id]/feature` - Feature review
- `POST /api/admin/reviews/[id]/request-rewrite` - Request rewrite
- `POST /api/admin/reviews/[id]/approve` - Approve review
- `POST /api/admin/reviews/[id]/reject` - Reject review
- `DELETE /api/admin/reviews/[id]` - Delete review

#### Coupons Management

- `GET /api/admin/coupons` - List all coupons
- `POST /api/admin/coupons` - Create coupon
- `GET /api/admin/coupons/[id]` - Get coupon details
- `PATCH /api/admin/coupons/[id]` - Update coupon
- `DELETE /api/admin/coupons/[id]` - Delete coupon
- `POST /api/admin/coupons/[id]/deactivate` - Deactivate coupon
- `GET /api/admin/coupons/[id]/stats` - Get usage stats

#### Analytics

- `GET /api/admin/analytics/overview` - Dashboard metrics
- `GET /api/admin/analytics/users` - User statistics
- `GET /api/admin/analytics/orders` - Order statistics
- `GET /api/admin/analytics/revenue` - Revenue breakdown
- `GET /api/admin/analytics/top-pages` - Most viewed pages

### 6.2 Public APIs

#### Homepage Data

- `GET /api/homepage/carousel` - Active carousel slides
- `GET /api/homepage/sections` - All enabled sections
- `GET /api/homepage/categories` - Top categories with products
- `GET /api/homepage/products` - Featured products
- `GET /api/homepage/auctions` - Featured auctions
- `GET /api/homepage/reviews` - Featured reviews
- `GET /api/homepage/features` - Site features
- `GET /api/homepage/faq` - Public FAQs

#### Coupons

- `POST /api/coupons/validate` - Validate coupon code
- `POST /api/coupons/apply` - Apply coupon to order

---

## 7. Component Architecture

### 7.1 Shared Components

#### RichTextEditor

```typescript
interface RichTextEditorProps {
  value: string; // JSON or HTML
  onChange: (value: string) => void;
  placeholder?: string;
  toolbar?: "basic" | "full" | "minimal";
  height?: number;
  maxLength?: number;
}

// Features:
// - Bold, Italic, Underline, Strikethrough
// - Headings (H1-H6)
// - Lists (ordered, unordered)
// - Links, Images
// - Text alignment
// - Code blocks
// - Undo/Redo
// - Character counter
// - Copy/Paste formatting
```

#### GridEditor

```typescript
interface GridEditorProps {
  rows: number;
  cols: number;
  cards: GridCard[];
  onCardsChange: (cards: GridCard[]) => void;
  backgroundImage?: string;
  backgroundVideo?: string;
}

// Features:
// - Visual grid overlay
// - Drag-and-drop card placement
// - Resize cards by dragging edges
// - Card z-index management
// - Preview mode
// - Mobile preview toggle
```

#### ImageUpload

```typescript
interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  acceptedFormats?: string[];
  maxSize?: number; // MB
  aspectRatio?: number;
  showCrop?: boolean;
  uploadPath: string; // Firebase Storage path
}

// Features:
// - Drag-and-drop upload
// - Image preview
// - Crop tool (optional)
// - Format validation
// - Size validation
// - Progress indicator
```

#### DataTable

```typescript
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    column: string;
    direction: "asc" | "desc";
    onSortChange: (column: string, direction: "asc" | "desc") => void;
  };
  filters?: FilterConfig[];
  actions?: ActionConfig<T>[];
  bulkActions?: BulkActionConfig<T>[];
  onRowClick?: (row: T) => void;
}

// Features:
// - Server-side pagination
// - Multi-column sorting
// - Advanced filters
// - Row selection
// - Bulk actions
// - Responsive design
// - Export to CSV
```

### 7.2 Admin-Specific Components

- `AdminLayout` - Sidebar navigation + content area
- `AdminTabs` - Top navigation tabs
- `StatsCard` - Metric display card
- `Chart` - Reusable chart component (using recharts)
- `ModerationPanel` - Review/approve/reject interface
- `BulkActionBar` - Actions for selected items
- `ConfirmModal` - Confirmation dialogs
- `NotificationToast` - Success/error messages

### 7.3 Homepage-Specific Components

- `HomepageLayout` - Container with section ordering
- `SectionContainer` - Wrapper for each section
- `HorizontalScroll` - Auto-scrolling horizontal container
- `ProductCard` - Product display card
- `AuctionCard` - Auction display with countdown
- `ReviewCard` - Customer review display
- `FeatureCard` - Site feature icon + text
- `CategoryCard` - Category with products
- `BannerCard` - Advertisement banner

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal**: Set up database schemas and API structure

- [ ] Create Firestore schemas for all new collections
- [ ] Update existing schemas with enhancements
- [ ] Create repository classes following existing pattern
- [ ] Deploy Firestore indices
- [ ] Create API endpoint structure (routes only, no logic)
- [ ] Update constants (routes, endpoints, UI labels)
- [ ] Create TypeScript types for all new interfaces

**Files to Create**:

- `src/db/schema/site-settings.ts`
- `src/db/schema/carousel-slides.ts`
- `src/db/schema/homepage-sections.ts`
- `src/db/schema/coupons.ts`
- `src/repositories/site-settings.repository.ts`
- `src/repositories/carousel.repository.ts`
- `src/repositories/homepage-sections.repository.ts`
- `src/repositories/coupons.repository.ts`

### Phase 2: Admin Infrastructure (Week 2)

**Goal**: Build admin dashboard structure and shared components

- [ ] Create admin layout with tabs
- [ ] Implement `RichTextEditor` component
- [ ] Implement `GridEditor` component
- [ ] Implement `ImageUpload` component
- [ ] Implement `DataTable` component
- [ ] Create admin hooks (useAdminAnalytics, useAdminUsers, etc.)
- [ ] Implement authentication middleware for admin routes
- [ ] Create admin-specific constants and utilities

**Files to Create**:

- `src/app/admin/layout.tsx` (admin layout)
- `src/components/admin/RichTextEditor.tsx`
- `src/components/admin/GridEditor.tsx`
- `src/components/admin/DataTable.tsx`
- `src/hooks/useAdminAnalytics.ts`
- `src/hooks/useAdminProducts.ts`
- `src/hooks/useAdminCoupons.ts`

### Phase 3: Admin Pages - Part 1 (Week 3)

**Goal**: Dashboard, Users, and Site Settings

- [ ] Dashboard page with analytics
- [ ] Users management page
- [ ] Site settings page (all sections)
- [ ] Implement corresponding API endpoints
- [ ] Write tests for critical flows
- [ ] Update documentation

**Files to Create**:

- `src/app/admin/page.tsx` (dashboard)
- `src/app/admin/users/page.tsx`
- `src/app/admin/site/page.tsx`
- `src/app/api/admin/analytics/*`
- `src/app/api/admin/users/*`
- `src/app/api/admin/site-settings/*`

### Phase 4: Admin Pages - Part 2 (Week 4)

**Goal**: Products, Auctions, and Reviews

- [ ] Products management page
- [ ] Auctions management page
- [ ] Reviews management page
- [ ] Implement moderation workflows
- [ ] Implement corresponding API endpoints
- [ ] Write tests

**Files to Create**:

- `src/app/admin/products/page.tsx`
- `src/app/admin/auctions/page.tsx`
- `src/app/admin/reviews/page.tsx`
- `src/app/api/admin/products/*`
- `src/app/api/admin/auctions/*`
- `src/app/api/admin/reviews/*`

### Phase 5: Content Management (Week 5)

**Goal**: Carousel, Sections, Banners, FAQ

- [ ] Carousel editor with grid system
- [ ] Section order manager
- [ ] Banner editor
- [ ] FAQ manager
- [ ] Implement drag-and-drop functionality
- [ ] Implement corresponding API endpoints
- [ ] Write tests

**Files to Create**:

- `src/app/admin/content/page.tsx`
- `src/components/admin/CarouselEditor.tsx`
- `src/components/admin/GridCardEditor.tsx`
- `src/components/admin/SectionOrderManager.tsx`
- `src/components/admin/BannerEditor.tsx`
- `src/components/admin/FAQEditor.tsx`
- `src/app/api/admin/carousel/*`
- `src/app/api/admin/homepage/*`
- `src/app/api/admin/banners/*`
- `src/app/api/admin/faq/*`

### Phase 6: Coupon System (Week 6)

**Goal**: Complete coupon management

- [ ] Coupon creator wizard
- [ ] Tiered discount editor
- [ ] BXGY configuration editor
- [ ] Coupon validation logic
- [ ] Coupon application in checkout
- [ ] Usage tracking and statistics
- [ ] Implement corresponding API endpoints
- [ ] Write tests

**Files to Create**:

- `src/app/admin/coupons/page.tsx`
- `src/components/admin/CouponCreator.tsx`
- `src/components/admin/TieredDiscountEditor.tsx`
- `src/components/admin/BXGYConfigEditor.tsx`
- `src/app/api/admin/coupons/*`
- `src/app/api/coupons/*` (public)

### Phase 7: Homepage Implementation (Week 7-8)

**Goal**: Build all homepage sections

- [ ] Hero carousel with grid system
- [ ] Welcome section
- [ ] Top categories section
- [ ] Featured products section
- [ ] Featured auctions section
- [ ] Advertisement banners
- [ ] Customer reviews section
- [ ] Site features section
- [ ] FAQ section
- [ ] Enhanced footer
- [ ] Implement lazy loading
- [ ] Optimize performance
- [ ] Write tests

**Files to Create**:

- `src/components/homepage/HeroCarousel.tsx`
- `src/components/homepage/WelcomeSection.tsx`
- `src/components/homepage/TopCategoriesSection.tsx`
- `src/components/homepage/FeaturedProductsSection.tsx`
- `src/components/homepage/FeaturedAuctionsSection.tsx`
- `src/components/homepage/AdvertisementBanner.tsx`
- `src/components/homepage/CustomerReviewsSection.tsx`
- `src/components/homepage/SiteFeaturesSection.tsx`
- `src/components/homepage/FAQSection.tsx`
- `src/app/api/homepage/*`

### Phase 8: Testing & Optimization (Week 9)

**Goal**: Ensure quality and performance

- [ ] Write unit tests for all new components
- [ ] Write integration tests for API endpoints
- [ ] Perform accessibility audit
- [ ] Optimize images and assets
- [ ] Implement caching strategies
- [ ] Test on multiple devices and browsers
- [ ] Fix bugs and edge cases
- [ ] Update all documentation

### Phase 9: Deployment & Documentation (Week 10)

**Goal**: Production-ready release

- [ ] Deploy to production
- [ ] Configure Firebase indices
- [ ] Set up monitoring and logging
- [ ] Create admin user guide
- [ ] Create video tutorials
- [ ] Update CHANGELOG.md
- [ ] Run final audit (11-point standards)
- [ ] Celebrate! 🎉

---

## 9. Technical Requirements

### 9.1 Rich Text Editor

**Recommended Library**: Tiptap (React-based, extensible)

**Features Required**:

- Basic formatting (bold, italic, underline)
- Headings, lists, links
- Image upload and embedding
- Code blocks
- Copy/paste with formatting preservation
- Keyboard shortcuts
- Character/word counter
- Export to HTML

**Installation**:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link
```

### 9.2 Drag-and-Drop

**Recommended Library**: dnd-kit

**Features Required**:

- Sortable lists (for section ordering)
- Grid placement (for carousel cards)
- Multi-touch support
- Accessibility features

**Installation**:

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 9.3 Image Optimization

**Strategy**:

- Use Next.js Image component for automatic optimization
- Firebase Storage for hosting
- Generate multiple sizes (thumbnail, small, medium, large)
- WebP format with fallbacks
- Lazy loading with blur placeholders

### 9.4 Caching Strategy

**Levels**:

1. **Browser Cache** - Static assets (CDN)
2. **Application Cache** - CacheManager class for API responses
3. **Database Cache** - Firestore caching enabled
4. **CDN Cache** - CloudFlare or similar

**Cache Invalidation**:

- Time-based expiry (TTL)
- Event-based (on content update)
- Manual purge option in admin

### 9.5 Performance Targets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

**Strategies**:

- Code splitting by route
- Lazy load below-the-fold components
- Preload critical resources
- Minimize JavaScript bundle size
- Use service workers for offline support

---

## 10. Timeline & Milestones

### Week 1-2: Foundation & Infrastructure

- Database schemas
- API structure
- Admin layout
- Shared components

### Week 3-4: Core Admin Features

- Dashboard
- User management
- Site settings
- Product/Auction management

### Week 5-6: Content & Coupons

- Carousel editor
- Section manager
- Banner editor
- Coupon system

### Week 7-8: Homepage Implementation

- All homepage sections
- Performance optimization
- Mobile responsiveness

### Week 9: Testing & QA

- Unit tests
- Integration tests
- Bug fixes
- Performance audit

### Week 10: Deployment

- Production release
- Documentation
- User training
- Monitoring setup

---

## Success Criteria

### Functional Requirements

- ✅ All 8 admin tabs functional
- ✅ All 10 homepage sections configurable
- ✅ Rich text editing works smoothly
- ✅ Image uploads and optimization working
- ✅ Coupon system fully operational
- ✅ Mobile-responsive design

### Non-Functional Requirements

- ✅ Lighthouse score > 90
- ✅ 100% TypeScript compliance
- ✅ All tests passing
- ✅ Zero security vulnerabilities
- ✅ 11-point coding standards met
- ✅ Documentation complete

### Business Requirements

- ✅ Admin can manage entire site from dashboard
- ✅ Homepage is fully dynamic and editable
- ✅ SEO optimized for search engines
- ✅ Fast load times on all devices
- ✅ Scalable architecture for future growth

---

## Notes & Considerations

1. **Backward Compatibility**: Ensure existing products, orders, and users are not affected
2. **Migration Strategy**: Write migration scripts for schema updates
3. **Rollback Plan**: Keep old homepage as backup during transition
4. **User Training**: Create video tutorials for admins
5. **Monitoring**: Set up error tracking (Sentry) and analytics (Google Analytics)
6. **Backup**: Automated daily Firestore backups
7. **Security**: Regular security audits, penetration testing

---

## Questions to Resolve

1. ⚠️ **Rich Text Editor**: Tiptap vs Draft.js vs Lexical?
2. ⚠️ **Carousel Library**: Build custom or use react-slick/swiper?
3. ⚠️ **Grid System**: CSS Grid vs absolute positioning for carousel cards?
4. ⚠️ **Video Hosting**: Firebase Storage or external CDN (YouTube, Vimeo)?
5. ⚠️ **Analytics**: Firebase Analytics vs Google Analytics vs custom?
6. ⚠️ **Payment Integration**: Stripe vs PayPal vs both for coupons?

---

**End of Plan** - Ready for Implementation 🚀
