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

### 4.1 Admin Tabs Navigation (with Sub-tabs)

```typescript
const ADMIN_TABS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    path: "/admin",
    subTabs: [], // No sub-tabs, just analytics
  },
  {
    id: "users",
    label: "Users",
    icon: "Users",
    path: "/admin/users",
    subTabs: [
      { id: "all", label: "All Users", path: "/admin/users" },
      { id: "active", label: "Active Users", path: "/admin/users/active" },
      { id: "banned", label: "Banned Users", path: "/admin/users/banned" },
      { id: "admins", label: "Administrators", path: "/admin/users/admins" },
    ],
  },
  {
    id: "products",
    label: "Products",
    icon: "Package",
    path: "/admin/products",
    subTabs: [
      { id: "all", label: "All Products", path: "/admin/products" },
      {
        id: "published",
        label: "Published",
        path: "/admin/products/published",
      },
      {
        id: "pending",
        label: "Pending Review",
        path: "/admin/products/pending",
      },
      { id: "flagged", label: "Flagged", path: "/admin/products/flagged" },
      { id: "featured", label: "Featured", path: "/admin/products/featured" },
    ],
  },
  {
    id: "auctions",
    label: "Auctions",
    icon: "Gavel",
    path: "/admin/auctions",
    subTabs: [
      { id: "all", label: "All Auctions", path: "/admin/auctions" },
      { id: "active", label: "Active", path: "/admin/auctions/active" },
      { id: "ended", label: "Ended", path: "/admin/auctions/ended" },
      { id: "flagged", label: "Flagged", path: "/admin/auctions/flagged" },
      { id: "featured", label: "Featured", path: "/admin/auctions/featured" },
    ],
  },
  {
    id: "site",
    label: "Site Settings",
    icon: "Settings",
    path: "/admin/site",
    subTabs: [
      { id: "general", label: "General Info", path: "/admin/site" },
      { id: "branding", label: "Branding", path: "/admin/site/branding" },
      { id: "email", label: "Email Settings", path: "/admin/site/email" },
      { id: "seo", label: "SEO", path: "/admin/site/seo" },
      { id: "features", label: "Features", path: "/admin/site/features" },
      { id: "legal", label: "Legal Pages", path: "/admin/site/legal" },
    ],
  },
  {
    id: "content",
    label: "Content",
    icon: "Layout",
    path: "/admin/content",
    subTabs: [
      {
        id: "carousel",
        label: "Hero Carousel",
        path: "/admin/content/carousel",
      },
      {
        id: "sections",
        label: "Section Order",
        path: "/admin/content/sections",
      },
      { id: "banners", label: "Banners", path: "/admin/content/banners" },
      { id: "faq", label: "FAQ", path: "/admin/content/faq" },
    ],
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: "Star",
    path: "/admin/reviews",
    subTabs: [
      { id: "all", label: "All Reviews", path: "/admin/reviews" },
      {
        id: "pending",
        label: "Pending Approval",
        path: "/admin/reviews/pending",
      },
      { id: "featured", label: "Featured", path: "/admin/reviews/featured" },
      { id: "flagged", label: "Flagged", path: "/admin/reviews/flagged" },
    ],
  },
  {
    id: "coupons",
    label: "Coupons",
    icon: "Tag",
    path: "/admin/coupons",
    subTabs: [
      { id: "all", label: "All Coupons", path: "/admin/coupons" },
      { id: "active", label: "Active", path: "/admin/coupons/active" },
      { id: "expired", label: "Expired", path: "/admin/coupons/expired" },
      { id: "create", label: "Create New", path: "/admin/coupons/create" },
    ],
  },
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

**Sub-tabs**:

#### 4.3.1 All Users (`/admin/users`)

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

#### 4.3.2 Active Users (`/admin/users/active`)

**Features**:

- Pre-filtered to show only active (non-banned, non-disabled) users
- Same actions as All Users tab
- Quick promote to seller/moderator

#### 4.3.3 Banned Users (`/admin/users/banned`)

**Features**:

- Show all soft-banned and permanently banned users
- Ban details (reason, duration, banned by)
- Unban action
- Edit ban duration

#### 4.3.4 Administrators (`/admin/users/admins`)

**Features**:

- Show all users with admin or moderator roles
- Quick demote option
- Activity log
- Permission management

### 4.4 Products Management (`/admin/products`)

**Sub-tabs**:

#### 4.4.1 All Products (`/admin/products`)

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

#### 4.4.2 Published Products (`/admin/products/published`)

**Features**:

- Pre-filtered to show only published products
- Quick unpublish action
- Mark as featured

#### 4.4.3 Pending Review (`/admin/products/pending`)

**Features**:

- Products awaiting moderation
- Quick approve/reject actions
- Bulk moderation
- Add moderation notes

#### 4.4.4 Flagged Products (`/admin/products/flagged`)

**Features**:

- Products flagged by users or system
- Flag details and reasons
- Review and resolve flags
- Contact seller option

#### 4.4.5 Featured Products (`/admin/products/featured`)

**Features**:

- Products marked as featured/top products
- Manage featured duration
- Reorder featured items
- Remove from featured list

### 4.5 Auctions Management (`/admin/auctions`)

**Sub-tabs**:

#### 4.5.1 All Auctions (`/admin/auctions`)

**Features**:

- All auctions from all sellers
- Filters: status, category, seller
- Search by name, auction ID
- Actions:
  - Extend auction time
  - Cancel auction (with refund)
  - Flag auction
  - Feature on homepage
  - Mark as top auction

**Components**:

- `AuctionListTable` with countdown timers
- `AuctionModerationPanel`
- `ExtendAuctionModal`
- `CancelAuctionModal`

#### 4.5.2 Active Auctions (`/admin/auctions/active`)

**Features**:

- Pre-filtered to show only active auctions
- Real-time bid monitoring
- Quick extend time action
- Bid history view

#### 4.5.3 Ended Auctions (`/admin/auctions/ended`)

**Features**:

- Completed auctions
- Winner information
- Payment status
- Archive/delete options

#### 4.5.4 Flagged Auctions (`/admin/auctions/flagged`)

**Features**:

- Auctions flagged for review
- Flag details and reasons
- Investigate and resolve
- Automatic refund option

#### 4.5.5 Featured Auctions (`/admin/auctions/featured`)

**Features**:

- Auctions marked as featured
- Manage featured duration
- Reorder featured items
- Remove from featured list

### 4.6 Site Settings (`/admin/site`)

**Sub-tabs**:

#### 4.6.1 General Info (`/admin/site`)

**Features**:

- Site name, motto, tagline
- Contact email, phone, address
- Social media links
- Business hours
- Primary currency

**Components**:

- `SiteInfoForm`
- `ContactInfoSection`
- `SocialLinksEditor`

#### 4.6.2 Branding (`/admin/site/branding`)

**Features**:

- Logo upload (SVG preferred, PNG/JPG fallback)
- Favicon upload
- Brand colors (primary, secondary, accent)
- Font selection
- Logo variations (light/dark mode)

**Components**:

- `LogoUploadSection`
- `ColorPicker`
- `FontSelector`
- `BrandPreview`

#### 4.6.3 Email Settings (`/admin/site/email`)

**Features**:

- From name, email
- Reply-to address
- SMTP settings (if not using Resend)
- Email templates (order confirmation, shipping, etc.)
- Test email functionality

**Components**:

- `EmailSettingsForm`
- `SMTPConfigSection`
- `EmailTemplateEditor`
- `TestEmailButton`

#### 4.6.4 SEO (`/admin/site/seo`)

**Features**:

- Default title, description
- Keywords management
- Open Graph image
- Twitter Card settings
- Structured data (JSON-LD)
- Sitemap configuration
- Robots.txt editor

**Components**:

- `SEOConfigForm`
- `MetaTagsPreview`
- `StructuredDataEditor`
- `RobotsEditor`

#### 4.6.5 Features (`/admin/site/features`)

**Features**:

- Checkboxes for site features
- Secure checkout, Fast shipping, 24/7 support, etc.
- Feature icon selection
- Feature descriptions
- Enable/disable features for homepage display

**Components**:

- `FeaturesChecklistEditor`
- `FeatureIconPicker`
- `FeaturePreview`

#### 4.6.6 Legal Pages (`/admin/site/legal`)

**Features**:

- Terms of Service (Rich text editor)
- Privacy Policy
- Refund Policy
- Shipping Policy
- Cookie Policy
- Version history
- Last updated tracking

**Components**:

- `RichTextEditor` (Tiptap)
- `LegalPageSelector`
- `VersionHistory`

### 4.7 Content Management (`/admin/content`)

**Sub-tabs**:

#### 4.7.1 Hero Carousel (`/admin/content/carousel`)

**Features**:

- List of slides with preview thumbnails
- Add/Edit/Delete slides
- Drag-and-drop slide ordering
- Grid editor (9x9) for card placement
- Card designer with:
  - Background color/gradient/image
  - Text content (title, subtitle, description)
  - Up to 2 buttons per card
  - Button-only mode
  - Position on grid
- Mobile preview (2x2 grid)
- Publish/Unpublish slides
- Schedule slides (start/end dates)

**Components**:

- `CarouselSlideList`
- `CarouselSlideEditor`
- `GridCardEditor` (9x9 desktop, 2x2 mobile)
- `CardDesigner`
- `SlidePreview`

#### 4.7.2 Section Order (`/admin/content/sections`)

**Features**:

- Drag-and-drop section reordering
- Enable/Disable sections
- Configure section-specific settings:
  - Welcome section (H1, description, CTA)
  - Categories section (which categories, auto-scroll)
  - Products section (count, layout)
  - Auctions section (count, layout)
  - Reviews section (count, display)
  - Features section (which features)
- Live preview mode
- Save as template

**Components**:

- `SectionOrderManager` (drag-and-drop)
- `SectionConfigPanel`
- `SectionPreview`
- `TemplateSelector`

#### 4.7.3 Advertisement Banners (`/admin/content/banners`)

**Features**:

- Create custom banners
- Set height (sm: 200px, md: 300px, lg: 400px, xl: 500px)
- Background image/color/gradient
- Add content (title, subtitle, description)
- Up to 3 buttons per banner
- Link configuration (banner clickable)
- Position in homepage (between sections)
- Schedule banners (start/end dates)
- A/B testing support

**Components**:

- `BannerListTable`
- `BannerEditor`
- `BannerPreview`
- `BannerScheduler`

#### 4.7.4 FAQ Management (`/admin/content/faq`)

**Features**:

- Add/Edit/Delete FAQs
- Categorize FAQs (general, shipping, returns, payment, account)
- Rich text answers with formatting
- Drag-and-drop ordering within categories
- Search functionality preview
- Import/Export FAQs (JSON)

**Components**:

- `FAQListTable`
- `FAQEditor` with rich text
- `FAQCategoryManager`
- `FAQPreview`
- `FAQImportExport`

### 4.8 Reviews Management (`/admin/reviews`)

**Sub-tabs**:

#### 4.8.1 All Reviews (`/admin/reviews`)

**Features**:

- All reviews from all orders
- Filters: rating, status, featured, date range
- Search by product, user, review text
- Actions:
  - Approve/Reject
  - Feature on homepage
  - Request rewrite (with reason)
  - Delete
- Bulk moderation
- Export to CSV

**Components**:

- `ReviewListTable`
- `ReviewModerationPanel`
- `FeatureReviewModal`
- `RequestRewriteModal`

#### 4.8.2 Pending Approval (`/admin/reviews/pending`)

**Features**:

- Pre-filtered to show only pending reviews
- Quick approve/reject actions
- Bulk approve
- Review text analysis (sentiment, spam detection)

#### 4.8.3 Featured Reviews (`/admin/reviews/featured`)

**Features**:

- Reviews currently featured on homepage
- Manage featured duration
- Reorder featured reviews
- Remove from featured list
- Featured expiry dates

#### 4.8.4 Flagged Reviews (`/admin/reviews/flagged`)

**Features**:

- Reviews flagged by users or system
- Flag reasons (inappropriate, spam, fake)
- Investigate and resolve
- Contact reviewer option
- Delete or request rewrite

### 4.9 Coupons Management (`/admin/coupons`)

**Sub-tabs**:

#### 4.9.1 All Coupons (`/admin/coupons`)

**Features**:

- List all coupons (active, expired, scheduled)
- Filters: type, status, date range
- Search by code, name
- Quick actions:
  - Activate/Deactivate
  - Edit
  - Clone
  - Delete
- Usage statistics overview

**Components**:

- `CouponListTable`
- `CouponStatsCard`
- `QuickActionsMenu`

#### 4.9.2 Active Coupons (`/admin/coupons/active`)

**Features**:

- Pre-filtered to show only active coupons
- Real-time usage tracking
- Quick deactivate action
- Performance metrics (conversion rate, revenue impact)

#### 4.9.3 Expired Coupons (`/admin/coupons/expired`)

**Features**:

- Expired coupons list
- Historical usage data
- Clone and reschedule option
- Archive/delete options

#### 4.9.4 Create New Coupon (`/admin/coupons/create`)

**Features**:

- Coupon creation wizard (step-by-step)
- Coupon types:
  - Percentage discount (5%, 10%, 20%, etc.)
  - Fixed amount discount ($5 off, $10 off, etc.)
  - Free shipping
  - Buy X Get Y (BOGO)
  - Tiered discounts (spend $50 get 10% off, $100 get 20% off)
- Set restrictions:
  - Applicable products/categories/sellers
  - Usage limits (total uses, per user)
  - Validity dates (start/end)
  - First-time users only
  - Minimum purchase amount
  - Combine with seller coupons (yes/no)
- Preview before creating
- Test coupon functionality

**Components**:

- `CouponCreatorWizard`
- `CouponTypeSelector`
- `DiscountConfigurator`
- `TieredDiscountEditor`
- `BXGYConfigEditor`
- `RestrictionsPanel`
- `CouponPreview`

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
