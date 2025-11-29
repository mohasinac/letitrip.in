# Test-Driven Development (TDD) Documentation

## JustForView.in - India Auction Platform

This folder contains comprehensive TDD documentation including user stories, epics, features, and acceptance criteria organized by resources and RBAC roles.

## 📚 Documentation Structure

```
TDD/
├── README.md                    # This file - Overview & Checklist
├── PROGRESS.md                  # Session progress tracker
├── PENDING-ROUTES.md            # Missing routes documentation
│
├── epics/
│   ├── E001-user-management.md
│   ├── E002-product-catalog.md
│   ├── E003-auction-system.md
│   ├── E004-shopping-cart.md
│   ├── E005-order-management.md
│   ├── E006-shop-management.md
│   ├── E007-review-system.md
│   ├── E008-coupon-system.md
│   ├── E009-returns-refunds.md
│   ├── E010-support-tickets.md
│   ├── E011-payment-system.md
│   ├── E012-media-management.md
│   ├── E013-category-management.md
│   ├── E014-homepage-cms.md
│   ├── E015-search-discovery.md
│   ├── E016-notifications.md
│   ├── E017-analytics-reporting.md
│   ├── E018-payout-system.md
│   ├── E019-common-code-architecture.md
│   ├── E020-blog-system.md
│   ├── E021-system-configuration.md
│   ├── E022-wishlist-favorites.md
│   ├── E023-messaging-system.md
│   ├── E024-mobile-pwa-experience.md
│   ├── E025-mobile-component-integration.md
│   ├── E026-sieve-pagination-filtering.md
│   ├── E027-design-system-theming.md
│   ├── E028-riplimit-bidding-currency.md
│   ├── E029-smart-address-system.md
│   ├── E030-code-quality-sonarqube.md
│   ├── E031-searchable-dropdowns.md
│   ├── E032-content-type-search-filter.md
│   ├── E033-live-header-data.md
│   └── E034-flexible-link-fields.md
│
├── rbac/
│   ├── RBAC-OVERVIEW.md         # Role hierarchy & permissions matrix
│   ├── admin-features.md        # Admin-specific features (with mobile)
│   ├── seller-features.md       # Seller-specific features (with mobile)
│   ├── user-features.md         # User-specific features (with mobile)
│   └── guest-features.md        # Guest/Public features (with mobile)
│
├── resources/
│   ├── users/
│   │   ├── USER-STORIES.md
│   │   ├── API-SPECS.md
│   │   └── TEST-CASES.md
│   ├── products/
│   ├── auctions/
│   ├── carts/
│   ├── orders/
│   ├── shops/
│   ├── reviews/
│   ├── coupons/
│   ├── returns/
│   ├── tickets/
│   ├── payments/
│   ├── payouts/
│   ├── categories/
│   ├── media/
│   ├── hero-slides/
│   ├── favorites/
│   ├── blog/
│   ├── settings/
│   ├── messages/
│   ├── pagination/              # E026 Sieve pagination
│   ├── theming/                 # E027 Design system
│   ├── riplimit/                # E028 RipLimit currency
│   ├── addresses/               # E029 Smart addresses
│   ├── quality/                 # E030 Code quality
│   ├── dropdowns/               # E031 Searchable dropdowns
│   ├── header/                  # E033 Live header
│   ├── links/                   # E034 Flexible links
│   └── mobile/
│       ├── TEST-CASES.md        # E024 Mobile PWA test cases
│       └── E025-TEST-CASES.md   # E025 Mobile Integration test cases
│
└── acceptance/
    ├── ACCEPTANCE-CRITERIA.md
    └── E2E-SCENARIOS.md
```

## 🎯 Project Overview

**Domain**: E-commerce Auction Platform for India
**Tech Stack**: Next.js 14+, TypeScript, Tailwind CSS, Firebase
**Architecture**: App Router, Service Layer Pattern, FE/BE Type Separation

### User Roles (RBAC)

| Role   | Level | Description                                 |
| ------ | ----- | ------------------------------------------- |
| Admin  | 100   | Full system access, manage all resources    |
| Seller | 50    | Manage own shop, products, auctions, orders |
| User   | 10    | Browse, buy, bid, review, support           |
| Guest  | 0     | View public content only                    |

## ✅ Master Checklist

### Phase 1: Core Documentation (Session 1 - Complete ✅)

- [x] Create TDD folder structure
- [x] Create README.md with overview
- [x] Create PROGRESS.md for session tracking
- [x] Create RBAC-OVERVIEW.md
- [x] Create Epic files (E001-E018)
- [x] Create RBAC role feature docs
- [x] Create resource README files
- [x] Create Acceptance Criteria
- [x] Create E2E Test Scenarios

### Phase 2: Resource Documentation (Complete ✅)

- [x] Users resource documentation
- [x] Products resource documentation
- [x] Auctions resource documentation
- [x] Carts resource documentation
- [x] Orders resource documentation
- [x] Shops resource documentation
- [x] Reviews resource documentation
- [x] Coupons resource documentation
- [x] Returns resource documentation
- [x] Tickets resource documentation
- [x] Payments resource documentation
- [x] Payouts resource documentation
- [x] Categories resource documentation
- [x] Media resource documentation
- [x] Hero Slides resource documentation
- [x] Favorites resource documentation

### Phase 3: RBAC Feature Documentation (Complete ✅)

- [x] Admin features detailed
- [x] Seller features detailed
- [x] User features detailed
- [x] Guest features detailed

### Phase 4: Test Implementation (Complete ✅)

- [x] 237 test files written
- [x] 5,824+ tests passing
- [x] API route tests complete
- [x] Component tests complete
- [x] Page tests complete
- [x] Hook tests complete
- [x] Utility tests complete

### Phase 5: Documentation Sync (Complete ✅)

- [x] Sync acceptance criteria with tests
- [x] Update E2E scenarios status
- [x] Add placeholder tests for pending features
- [x] Tests organized in (tests) folders where needed
- [x] Verified all placeholder APIs documented

### Phase 6: Pending Implementations (Future)

- [ ] E016 Notifications API implementation
- [ ] E021 System Configuration API implementation
- [ ] E023 Messaging System API implementation
- [ ] `/forgot-password` route (password reset flow)
- [ ] `/user/notifications` page
- [ ] `/admin/analytics` pages
- [ ] `/admin/settings/*` individual settings pages
- [ ] Performance tests with k6
- [ ] E2E tests with Playwright

**See**: `TDD/PENDING-ROUTES.md` for full list of missing routes

### Phase 7: Mobile Component Integration (E025) ⬜

- [ ] Phase 1: Critical User Flows (Week 1-2)
- [ ] Phase 2: Browsing Experience (Week 2-3)
- [ ] Phase 3: User Dashboard (Week 3-4)
- [ ] Phase 4: Seller Dashboard (Week 4-5)
- [ ] Phase 5: Admin Dashboard (Week 5-6)
- [ ] Phase 6: Polish & Edge Cases (Week 6)
- [ ] Phase 7: Reusable Filter Sections (Week 6-7)
- [ ] Phase 8: Homepage & Carousels (Week 7)
- [ ] Phase 9: Search & Static Pages (Week 7-8)
- [ ] Phase 10: Cards & Catalog (Week 8-9)
- [ ] Phase 11: Horizontal Scrollers & Sliders (Week 9)
- [ ] Phase 12: Pagination & Infinite Scroll (Week 9-10)
- [ ] Phase 13: Catalog & List Views (Week 10)
- [ ] Phase 14: Media Upload & Preview (Week 10-11)
- [ ] Phase 15: Product Gallery & Zoom (Week 11)

**See**: `TDD/epics/E025-mobile-component-integration.md` for detailed implementation plan  
**See**: `TDD/resources/mobile/E025-TEST-CASES.md` for comprehensive test cases

### Phase 8: Platform Enhancements (E026-E034) ⬜

- [ ] E026: Sieve Pagination & Filtering - Backend API standardization
- [ ] E027: Design System & Theming - CSS variables, light/dark mode
- [ ] E028: RipLimit Bidding Currency - Virtual currency for auctions
- [ ] E029: Smart Address System - GPS, autocomplete, pincode lookup
- [ ] E030: Code Quality & SonarQube - Static analysis integration
- [ ] E031: Searchable Dropdowns - Unified select components
- [ ] E032: Content Type Search Filter - Filter by products/auctions/shops
- [ ] E033: Live Header Data - Real-time cart, notifications, RipLimit
- [ ] E034: Flexible Link Fields - Support relative URLs

**See**: `TDD/epics/E026-*.md` through `E034-*.md` for detailed implementation plans

## 🔄 How to Continue

1. Open `TDD/PROGRESS.md` to see current status
2. Find the next incomplete item in the checklist
3. Reference existing code in `/src` for accuracy
4. Update PROGRESS.md after each session

## 📖 Conventions

### User Story Format

```
As a [role]
I want to [action]
So that [benefit]

Acceptance Criteria:
- Given [context]
- When [action]
- Then [expected result]
```

### Epic Naming

- E001-E005: Core user/commerce features
- E006-E010: Extended features
- E011-E015: Infrastructure features
- E016-E018: Analytics & operations
- E019: Common code architecture
- E020-E023: Additional features (Blog, Settings, Wishlist, Messaging)
- E024: Mobile PWA Experience (component creation)
- E025: Mobile Component Integration (integration across app)
- E026: Sieve-Style Pagination & Filtering
- E027: Design System & Theming
- E028: RipLimit Bidding Currency
- E029: Smart Address System
- E030: Code Quality & SonarQube
- E031: Searchable Dropdowns
- E032: Content Type Search Filter
- E033: Live Header Data
- E034: Flexible Link Fields

### Status Indicators

- ⬜ Not started
- 🟡 In progress
- ✅ Complete
- ❌ Blocked
