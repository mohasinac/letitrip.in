# Test-Driven Development (TDD) Documentation

## JustForView.in - India Auction Platform

This folder contains comprehensive TDD documentation including user stories, epics, features, and acceptance criteria organized by resources and RBAC roles.

---

## ⚠️ MANDATORY: Follow Project Standards

**Before implementing ANY feature from this TDD documentation, you MUST read and follow:**

📖 **[AI Agent Development Guide](/docs/ai/AI-AGENT-GUIDE.md)** - Complete architecture standards

### Critical Standards Summary

| Standard                  | Description                                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Service Layer Pattern** | UI → Service → API → Database. Services call APIs via `apiService`, NEVER access database directly                    |
| **Database Access**       | Only API routes (`src/app/api/**`) can use `getFirestoreAdmin()`. Services NEVER access DB                            |
| **Backend Code Location** | Backend-only utilities go in `src/app/api/lib/`, NOT in `src/lib/`                                                    |
| **Collection Constants**  | Always use `COLLECTIONS.X` from `src/constants/database.ts`, never hardcode collection names                          |
| **FE/BE Type Separation** | Frontend types in `src/types/frontend/`, Backend types in `src/types/backend/`, transforms in `src/types/transforms/` |
| **No `any` Types**        | Explicit TypeScript types everywhere, zero `any` allowed                                                              |

### Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ UI Component                                                     │
│ (uses FE types, calls service)                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │ calls
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ Service (src/services/*.service.ts)                              │
│ - Uses apiService.get/post/put/delete                           │
│ - Transforms BE → FE types                                       │
│ - NEVER imports getFirestoreAdmin or accesses DB                │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP call
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ API Route (src/app/api/**/route.ts)                             │
│ - Can import from src/app/api/lib/                              │
│ - Can use getFirestoreAdmin()                                   │
│ - Uses COLLECTIONS constant                                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │ direct access
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ Database (Firestore)                                             │
└─────────────────────────────────────────────────────────────────┘
```

**⚠️ Violation of these standards will require complete rewrite!**

---

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
│   ├── E034-flexible-link-fields.md
│   ├── E035-theme-mobile-homepage-integration.md
│   ├── E036-component-refactoring.md
│   ├── E037-internationalization.md
│   └── E038-priority-checklist-completion.md  # 🎉 COMPLETE - 166/166 tasks
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
│   ├── components-e038.md       # E038 Component catalog (60 components)
│   ├── tests-e038.md            # E038 Test documentation (35 tests)
│   └── mobile/
│       ├── TEST-CASES.md        # E024 Mobile PWA test cases
│       └── E025-TEST-CASES.md   # E025 Mobile Integration test cases
│
└── acceptance/
    ├── ACCEPTANCE-CRITERIA.md
    ├── ACCEPTANCE-CRITERIA-E038.md  # E038 Acceptance criteria
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

### Phase 6: Pending Implementations (Completed - Sessions 13-15) ✅

- [x] E016 Notifications API implementation - **✅ VERIFIED** (Session 13)
- [x] E021 System Configuration API implementation - **✅ VERIFIED** (Session 13)
- [x] E023 Messaging System API implementation - **✅ IMPLEMENTED** (Session 13)
- [x] E030 Code Quality & SonarQube - **✅ IMPLEMENTED** (Session 15)
- [ ] `/forgot-password` route (password reset flow) - Future
- [ ] Performance tests with k6 - Future
- [ ] E2E tests with Playwright - Future

**See**: `TDD/PENDING-ROUTES.md` for full list of missing routes

### Phase 7: Mobile Component Integration (E025) ✅ Complete (Session 14)

- [x] Phase 1: Critical User Flows (Week 1-2)
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

### Phase 8: Platform Enhancements (E026-E034) ✅ Complete

- [x] E026: Sieve Pagination & Filtering - **✅ IMPLEMENTED** (Session 11)
- [x] E027: Design System & Theming - **✅ IMPLEMENTED** (Session 12)
- [x] E028: RipLimit Bidding Currency - **✅ IMPLEMENTED** (Session 11)
- [x] E029: Smart Address System - **✅ IMPLEMENTED** (Session 12)
- [x] E030: Code Quality & SonarQube - **✅ IMPLEMENTED** (Session 15)
- [x] E031: Searchable Dropdowns - **✅ IMPLEMENTED** (Session 12)
- [x] E032: Content Type Search Filter - **✅ IMPLEMENTED** (Session 12)
- [x] E033: Live Header Data - **✅ IMPLEMENTED** (Session 11)
- [x] E034: Flexible Link Fields - **✅ IMPLEMENTED** (Session 12)

**See**: `TDD/epics/E026-*.md` through `E034-*.md` for detailed implementation plans

### Phase 9: Component Refactoring (Sessions 14-17) ✅ Complete

- [x] E025: Mobile Component Integration - Mobile-optimized forms, pages
- [x] E035: Theme & Mobile Homepage - Dark mode, SubNavbar, homepage mobile
- [x] E036: Component Refactoring - Wizard forms, HTML tag wrappers, value components
- [x] Wizard Forms - Split into modular step components
  - Product/Auction wizards (Session 14)
  - Category/Blog wizards (Session 17)
  - Shop wizard (Session 17)
- [x] HTML Tag Wrappers - Migrated all raw HTML to Form components
  - Form components (Input, Select, Textarea, Checkbox)
  - Value components (Price, DateDisplay, Quantity)
  - All production pages migrated (Sessions 14-17)
- [x] Component Splitting - Large files split into smaller modules
  - Admin pages: Categories, Blog, Orders, Analytics
  - Seller pages: Products, Auctions, Shops
- [x] Dark Mode Fixes - Session 16
  - DataTable, MobileDataTable, ActionMenu
  - InlineEditor, TagInput, Footer

**See**:

- `docs/25-wizard-forms-mobile.md` - Wizard form specifications
- `docs/27-html-tag-wrappers.md` - HTML tag wrapper migration
- `docs/28-component-splitting.md` - Component splitting patterns
- `docs/32-common-value-components.md` - Value display components
- `TDD/REFACTORING-SUMMARY.md` - Complete refactoring summary

### ⚠️ Cleanup Required (Post-Implementation)

After implementing new features, review and potentially remove older components:

| New Feature           | Check For Duplicates/Conflicts                           |
| --------------------- | -------------------------------------------------------- |
| E026 Sieve Pagination | Legacy pagination in hooks/services                      |
| E028 RipLimit         | Existing bid blocking logic in auction hooks             |
| E033 Header Stats API | Existing cart/notification hooks that fetch individually |

**Files to Review**:

- `src/hooks/useCart.ts` - May duplicate `/api/cart/count` functionality
- `src/hooks/useNotifications.ts` - May duplicate `/api/notifications/unread-count`
- Any existing pagination implementations - Should migrate to Sieve

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
- E024-E025: Mobile PWA and integration
- E026-E034: Platform enhancements (Pagination, Theming, RipLimit, etc.)
- E035: Theme & Mobile Homepage Integration
- E036: Component Refactoring & Consolidation
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
- E035: Theme & Mobile Homepage Integration
- E036: Component Refactoring & Consolidation
- E037: Internationalization (i18n)
- E038: Priority Checklist Completion ✅ **COMPLETE** (166/166 tasks, ~17,147 lines saved)

### Phase 10: Priority Checklist Completion (E038) ✅ Complete (Session 18)

**Epic**: E038 - Priority Checklist Completion  
**Status**: ✅ COMPLETE (December 5, 2025)  
**Tasks**: 166/166 (100%)  
**Lines Saved**: ~17,147 lines of duplicate code  
**Components Created**: 60 reusable components  
**Features Added**: 8 major features  
**Tests Written**: 35 tests across 5 suites

#### Completed Phases:

1. **Component Creation (Tasks 01-62)**: ✅

   - 14 selector components with inline creation
   - 6 reusable wizard step components
   - 15 detail page section components
   - Centralized validation

2. **File Splitting (Tasks 63-79)**: ✅

   - AdminResourcePage wrapper (9 pages, ~6,000 lines saved)
   - SellerResourcePage wrapper (3 pages, ~2,540 lines saved)
   - Large file splitting (~907 lines saved)

3. **Navigation & UI (Tasks 80-106)**: ✅

   - Navigation cleanup and TabNav integration
   - Full dark mode support (11+ pages)
   - Mobile responsive layouts

4. **Advanced Features (Tasks 107-166)**: ✅
   - User verification system (email/phone OTP)
   - IP tracking & rate limiting
   - Events system (13 files, ticketing, booking)
   - Google Forms integration
   - URL-based filtering (SEO-friendly)
   - Category tree visualization (react-d3-tree)
   - 5 comprehensive test suites (35 tests)

**Key Achievements**:

- Eliminated 17,147 lines of duplicate code
- Created 60 reusable components
- Refactored 12 admin + 3 seller pages (600-900 lines → 150-300 lines)
- Full dark mode & mobile support
- 8 major features added (verification, IP tracking, events, URL filtering, etc.)

**See**: `TDD/epics/E038-priority-checklist-completion.md` for complete details

### Status Indicators

- ⬜ Not started
- 🟡 In progress
- ✅ Complete
- ❌ Blocked
