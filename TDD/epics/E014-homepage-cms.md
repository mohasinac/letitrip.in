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

## Related Epics

- E013: Category Management (featured categories)
- E002: Product Catalog (featured products)
- E003: Auction System (featured auctions)

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
