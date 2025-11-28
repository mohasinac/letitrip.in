# Test-Driven Development (TDD) Documentation

## JustForView.in - India Auction Platform

This folder contains comprehensive TDD documentation including user stories, epics, features, and acceptance criteria organized by resources and RBAC roles.

## 📚 Documentation Structure

```
TDD/
├── README.md                    # This file - Overview & Checklist
├── PROGRESS.md                  # Session progress tracker
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
│   └── E023-messaging-system.md
│
├── rbac/
│   ├── RBAC-OVERVIEW.md         # Role hierarchy & permissions matrix
│   ├── admin-features.md        # Admin-specific features
│   ├── seller-features.md       # Seller-specific features
│   ├── user-features.md         # User-specific features
│   └── guest-features.md        # Guest/Public features
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
│   └── messages/
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

- [x] 231 test files written
- [x] 5,824+ tests passing
- [x] API route tests complete
- [x] Component tests complete
- [x] Page tests complete
- [x] Hook tests complete
- [x] Utility tests complete

### Phase 5: Documentation Sync (In Progress 🔄)

- [x] Sync acceptance criteria with tests
- [x] Update E2E scenarios status
- [x] Add placeholder tests for pending features
- [ ] Organize tests into (tests) folders
- [ ] Create missing API tests for new epics

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

### Status Indicators

- ⬜ Not started
- 🟡 In progress
- ✅ Complete
- ❌ Blocked
