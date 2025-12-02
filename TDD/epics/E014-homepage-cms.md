# Epic E014: Homepage CMS

## Overview

Content management for homepage including hero slides, featured sections, and banner management.

## Scope

- Hero slides management
- Featured products/auctions/categories
- Banner configuration
- Homepage layout settings

## User Roles Involved

- **Admin**: Full CMS access
- **Seller**: No access
- **User**: View homepage
- **Guest**: View homepage

---

## Features

### F014.1: Hero Slides

**US014.1.1**: Create Hero Slide (Admin)

```
Fields:
- Title, Subtitle
- Image (desktop/mobile)
- CTA button text and URL
- Display order
- Active status
- Scheduled visibility
```

**US014.1.2**: Manage Hero Slides
**US014.1.3**: Reorder Hero Slides

### F014.2: Featured Sections

**US014.2.1**: Configure Featured Products
**US014.2.2**: Configure Featured Auctions
**US014.2.3**: Configure Featured Categories

### F014.3: Banner Management

**US014.3.1**: Configure Promotional Banner
**US014.3.2**: Schedule Banner Visibility

### F014.4: Homepage Settings

**US014.4.1**: Configure Homepage Layout
**US014.4.2**: Reset to Default

---

## API Endpoints

| Endpoint                | Method | Auth   | Description     |
| ----------------------- | ------ | ------ | --------------- |
| `/api/hero-slides`      | GET    | Public | List slides     |
| `/api/hero-slides`      | POST   | Admin  | Create slide    |
| `/api/hero-slides/:id`  | GET    | Public | Get slide       |
| `/api/hero-slides/:id`  | PATCH  | Admin  | Update slide    |
| `/api/hero-slides/:id`  | DELETE | Admin  | Delete slide    |
| `/api/hero-slides/bulk` | POST   | Admin  | Bulk operations |
| `/api/homepage`         | GET    | Public | Get settings    |
| `/api/homepage`         | PATCH  | Admin  | Update settings |
| `/api/homepage/banner`  | GET    | Public | Get banner      |
| `/api/homepage/banner`  | PATCH  | Admin  | Update banner   |

---

## Data Models

```typescript
interface HeroSlideBE {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  order: number;
  isActive: boolean;
  startDate?: Timestamp;
  endDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Implementation Status

### Session 17 - Homepage Sections & Hero Slides (December 2025)

**Doc References**: docs/14-homepage-sections-admin.md, docs/15-hero-slides-fix.md, docs/18-tabbed-navigation.md

#### Homepage Sections Admin Setup ✅

Implemented admin-curated featured sections:

**Batch APIs Created**:

- `POST /api/products/batch` - Fetch multiple products by IDs
- `POST /api/auctions/batch` - Fetch multiple auctions by IDs
- `POST /api/shops/batch` - Fetch multiple shops by IDs
- `POST /api/categories/batch` - Fetch multiple categories by IDs

**Service Methods**:

- `productsService.getByIds(ids)` - Batch fetch products
- `auctionsService.getByIds(ids)` - Batch fetch auctions
- `shopsService.getByIds(ids)` - Batch fetch shops
- `categoriesService.getByIds(ids)` - Batch fetch categories

**Components Updated**:

- `FeaturedProductsSection` - Checks admin-curated items first, falls back to `featured: true`
- `FeaturedAuctionsSection` - Uses curated items from `/homepage` API
- `FeaturedShopsSection` - Fetches curated shops + products per shop
- `FeaturedCategoriesSection` - Fetches curated categories + products per category

**Section Ordering**:

- Homepage sections render dynamically based on `sectionOrder` from settings
- Admin can reorder sections using up/down arrows in `/admin/homepage`
- Section order saved to settings and persists

#### Hero Slides Field Naming Fix ✅

Standardized camelCase ↔ snake_case transformations:

**Service Transformers**:

- `hero-slides.service.ts` - Added `toApiFormat()` and `fromApiFormat()`
- `homepage.service.ts` - Added `transformSlide()` for public carousel

**Field Mappings**:

- Frontend: `image`, `ctaLink`, `ctaText`, `isActive`, `order`
- API/Database: `image_url`, `link_url`, `cta_text`, `is_active`, `position`

**Files Changed**:

- `src/services/hero-slides.service.ts` - Transformation methods
- `src/services/homepage.service.ts` - Public carousel transformer
- `src/app/admin/hero-slides/create/page.tsx` - Uses camelCase consistently
- `src/app/admin/hero-slides/[id]/edit/page.tsx` - Uses camelCase consistently

**Result**: HeroCarousel fetches from `homepageService.getHeroSlides()` with proper field transformation

#### Route-Based Tabbed Navigation ✅

Implemented tabbed navigation system:

**Components Created**:

- `src/components/navigation/TabNav.tsx` - Tab navigation component (3 variants: underline, pills, default)
- `src/components/navigation/TabbedLayout.tsx` - Layout wrapper
- `src/constants/tabs.ts` - All tab definitions

**Layouts Implemented**:

- `src/app/admin/settings/layout.tsx` - Settings tabs (general, payment, shipping, email, notifications)
- `src/app/admin/auctions/layout.tsx` - Auctions tabs (all, live, moderation)
- `src/app/admin/blog/layout.tsx` - Blog tabs (all, create, categories, tags)
- `src/app/seller/products/layout.tsx` - Products tabs (all, create)
- `src/app/seller/auctions/layout.tsx` - Auctions tabs

**Features**:

- Route-based active state detection
- Horizontally scrollable on mobile
- Touch-friendly tap targets
- Dark mode support

---

## Related Epics

- E013: Category Management (featured categories)
- E002: Product Catalog (featured products)
- E003: Auction System (featured auctions)
- E036: Component Refactoring (TabNav, TabbedLayout)

---

## Test Documentation

- **API Specs**: `/TDD/resources/hero-slides/API-SPECS.md`
- **Test Cases**: `/TDD/resources/hero-slides/TEST-CASES.md`

### Test Coverage

- Unit tests for slide validation
- Unit tests for date range scheduling
- Integration tests for CRUD operations
- E2E tests for homepage configuration
- RBAC tests for admin-only operations
