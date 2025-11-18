# Refactoring Checklist - November 2025

## 📋 Overview

This document tracks refactoring and improvement tasks identified during the November 2025 code review.

**Total Tasks**: 42
**Completed**: 0
**In Progress**: 0
**Priority Distribution**:

- 🔴 High: 15 tasks
- 🟡 Medium: 18 tasks
- 🟢 Low: 9 tasks

---

## 🔴 High Priority (Complete First)

### Security

- [ ] **SEC-1**: Remove `.env.local` from repository

  - Status: ❌ Not Started
  - Impact: Critical Security Issue
  - Files: `.env.local`, `.gitignore`
  - Estimate: 5 minutes
  - Notes: Contains sensitive Firebase private keys

- [ ] **SEC-2**: Rotate Firebase credentials after leak
  - Status: ❌ Not Started
  - Impact: Critical Security Issue
  - Action: Generate new Firebase service account keys
  - Estimate: 15 minutes

### Type Safety

- [ ] **TYPE-1**: Remove `any[]` from service bulk operations

  - Status: ❌ Not Started
  - Impact: Type Safety, Maintainability
  - Files:
    - `src/services/products.service.ts`
    - `src/services/auctions.service.ts`
    - `src/services/orders.service.ts`
    - `src/services/coupons.service.ts`
  - Estimate: 2 hours
  - Pattern: Replace with `BulkActionResult[]`

- [ ] **TYPE-2**: Type search service results

  - Status: ❌ Not Started
  - Impact: Type Safety
  - Files: `src/services/search.service.ts`
  - Estimate: 30 minutes
  - Pattern: Use proper SearchResultFE types

- [ ] **TYPE-3**: Type demo data service

  - Status: ❌ Not Started
  - Impact: Type Safety
  - Files: `src/services/demo-data.service.ts`
  - Estimate: 1 hour
  - Pattern: Create proper analytics types

- [ ] **TYPE-4**: Remove `any` from component state
  - Status: ❌ Not Started
  - Impact: Type Safety, Bug Prevention
  - Files:
    - `src/app/seller/returns/page.tsx`
    - `src/app/seller/orders/page.tsx`
    - `src/app/seller/revenue/page.tsx`
    - `src/app/checkout/page.tsx`
  - Estimate: 1.5 hours

### Error Handling

- [ ] **ERR-1**: Create centralized error logger

  - Status: ❌ Not Started
  - Impact: Debugging, Monitoring
  - Files: `src/lib/error-logger.ts` (new)
  - Estimate: 1 hour
  - Dependencies: None

- [ ] **ERR-2**: Replace console.error with ErrorLogger

  - Status: ❌ Not Started
  - Impact: Consistency, Monitoring
  - Files: All service files
  - Estimate: 2 hours
  - Dependencies: ERR-1

- [ ] **ERR-3**: Implement error boundaries for pages
  - Status: ❌ Not Started
  - Impact: User Experience
  - Files: Major page components
  - Estimate: 1 hour

### Performance

- [ ] **PERF-1**: Add React.memo to ProductCard

  - Status: ❌ Not Started
  - Impact: Rendering Performance
  - Files: `src/components/cards/ProductCard.tsx`
  - Estimate: 30 minutes

- [ ] **PERF-2**: Add React.memo to AuctionCard

  - Status: ❌ Not Started
  - Impact: Rendering Performance
  - Files: `src/components/auction/AuctionCard.tsx`
  - Estimate: 30 minutes

- [ ] **PERF-3**: Implement useCallback in list pages

  - Status: ❌ Not Started
  - Impact: Re-render Prevention
  - Files: Product/Auction list pages
  - Estimate: 1 hour

- [ ] **PERF-4**: Add composite Firestore indexes

  - Status: ❌ Not Started
  - Impact: Query Performance
  - Files: `firestore.indexes.json`
  - Estimate: 1 hour
  - Pattern: Products by status+category+price

- [ ] **PERF-5**: Implement query batching
  - Status: ❌ Not Started
  - Impact: N+1 Query Prevention
  - Files: Service layer
  - Estimate: 3 hours

### Caching

- [ ] **CACHE-1**: Implement stale-while-revalidate

  - Status: ❌ Not Started
  - Impact: User Experience, Performance
  - Files: `src/services/api.service.ts`
  - Estimate: 2 hours

- [ ] **CACHE-2**: Add per-endpoint cache TTL config
  - Status: ❌ Not Started
  - Impact: Cache Efficiency
  - Files: `src/services/api.service.ts`
  - Estimate: 1 hour
  - Dependencies: CACHE-1

---

## 🟡 Medium Priority

### Code Quality

- [ ] **QUAL-1**: Create BulkActionResult interface

  - Status: ❌ Not Started
  - Impact: Type Safety
  - Files: `src/types/shared/common.types.ts`
  - Estimate: 15 minutes

- [ ] **QUAL-2**: Create SearchResult types

  - Status: ❌ Not Started
  - Impact: Type Safety
  - Files: `src/types/frontend/search.types.ts` (new)
  - Estimate: 30 minutes

- [ ] **QUAL-3**: Create Analytics types

  - Status: ❌ Not Started
  - Impact: Type Safety
  - Files: `src/types/frontend/analytics.types.ts` (new)
  - Estimate: 45 minutes

- [ ] **QUAL-4**: Add ESLint rule for .toISOString()

  - Status: ❌ Not Started
  - Impact: Bug Prevention
  - Files: `.eslintrc.json`
  - Estimate: 10 minutes

- [ ] **QUAL-5**: Add ESLint rule for console statements

  - Status: ❌ Not Started
  - Impact: Code Quality
  - Files: `.eslintrc.json`
  - Estimate: 10 minutes

- [ ] **QUAL-6**: Create error tracking service
  - Status: ❌ Not Started
  - Impact: Monitoring
  - Files: `src/services/error-tracking.service.ts` (new)
  - Estimate: 1 hour

### Firebase

- [ ] **FB-1**: Add missing composite indexes

  - Status: ❌ Not Started
  - Impact: Query Performance
  - Files: `firestore.indexes.json`
  - Estimate: 1 hour
  - Queries to index:
    - Products: status + category_id + price
    - Products: shop_id + status + created_at
    - Auctions: status + end_time
    - Orders: user_id + status + created_at

- [ ] **FB-2**: Implement batch document fetching

  - Status: ❌ Not Started
  - Impact: Performance
  - Files: Service layer
  - Estimate: 2 hours
  - Pattern: `batchGetShops()`, `batchGetCategories()`

- [ ] **FB-3**: Add query pagination helpers
  - Status: ❌ Not Started
  - Impact: Performance, UX
  - Files: `src/lib/firebase/query-helpers.ts` (new)
  - Estimate: 1.5 hours

### Date Handling

- [ ] **DATE-1**: Add test for safeToISOString

  - Status: ❌ Not Started
  - Impact: Reliability
  - Files: `src/lib/date-utils.test.ts` (new)
  - Estimate: 30 minutes

- [ ] **DATE-2**: Audit all date conversions

  - Status: ❌ Not Started
  - Impact: Bug Prevention
  - Command: `grep -r "\.toISOString()" src/ --include="*.ts"`
  - Estimate: 1 hour

- [ ] **DATE-3**: Replace unsafe date conversions
  - Status: ❌ Not Started
  - Impact: Bug Prevention
  - Files: Multiple
  - Estimate: 2 hours
  - Dependencies: DATE-2

### Bundle Size

- [ ] **BUNDLE-1**: Add route-based code splitting

  - Status: ❌ Not Started
  - Impact: Initial Load Performance
  - Files: `next.config.js`
  - Estimate: 1 hour

- [ ] **BUNDLE-2**: Optimize chunk splitting

  - Status: ❌ Not Started
  - Impact: Caching, Performance
  - Files: `next.config.js`
  - Estimate: 1 hour

- [ ] **BUNDLE-3**: Add bundle size monitoring

  - Status: ❌ Not Started
  - Impact: Performance Tracking
  - Files: `.github/workflows/bundle-analysis.yml` (new)
  - Estimate: 30 minutes

- [ ] **BUNDLE-4**: Optimize @dnd-kit imports
  - Status: ❌ Not Started
  - Impact: Bundle Size
  - Files: `next.config.js`
  - Estimate: 15 minutes

### Tailwind CSS

- [ ] **TAIL-1**: Add design system colors

  - Status: ❌ Not Started
  - Impact: Consistency
  - Files: `tailwind.config.js`
  - Estimate: 30 minutes

- [ ] **TAIL-2**: Add custom spacing scale

  - Status: ❌ Not Started
  - Impact: Consistency
  - Files: `tailwind.config.js`
  - Estimate: 15 minutes

- [ ] **TAIL-3**: Add Tailwind plugins
  - Status: ❌ Not Started
  - Impact: Forms, Typography
  - Files: `tailwind.config.js`, `package.json`
  - Estimate: 20 minutes
  - Plugins: `@tailwindcss/forms`, `@tailwindcss/typography`

---

## 🟢 Low Priority (Polish)

### TypeScript Config

- [ ] **TS-1**: Enable noImplicitAny

  - Status: ❌ Not Started
  - Impact: Type Safety
  - Files: `tsconfig.json`
  - Estimate: 30 minutes

- [ ] **TS-2**: Enable strictNullChecks

  - Status: ❌ Not Started
  - Impact: Type Safety
  - Files: `tsconfig.json`
  - Estimate: 1 hour
  - Dependencies: TS-1

- [ ] **TS-3**: Enable noUnusedLocals

  - Status: ❌ Not Started
  - Impact: Code Quality
  - Files: `tsconfig.json`
  - Estimate: 15 minutes

- [ ] **TS-4**: Enable noUnusedParameters
  - Status: ❌ Not Started
  - Impact: Code Quality
  - Files: `tsconfig.json`
  - Estimate: 15 minutes

### Logging

- [ ] **LOG-1**: Add request/response logging middleware

  - Status: ❌ Not Started
  - Impact: Debugging
  - Files: `src/app/api/middleware/logger.ts`
  - Estimate: 1 hour

- [ ] **LOG-2**: Add performance monitoring

  - Status: ❌ Not Started
  - Impact: Performance Tracking
  - Files: `src/lib/performance.ts` (new)
  - Estimate: 1.5 hours

- [ ] **LOG-3**: Add user action tracking
  - Status: ❌ Not Started
  - Impact: Analytics
  - Files: Existing analytics setup
  - Estimate: 2 hours

### Documentation

- [ ] **DOC-1**: Create TODO tracking issues

  - Status: ❌ Not Started
  - Impact: Organization
  - Action: Create GitHub issues for all TODOs
  - Estimate: 30 minutes

- [ ] **DOC-2**: Document bulk action patterns

  - Status: ❌ Not Started
  - Impact: Developer Experience
  - Files: `docs/guides/BULK-ACTIONS-GUIDE.md` (new)
  - Estimate: 1 hour

- [ ] **DOC-3**: Document caching strategy
  - Status: ❌ Not Started
  - Impact: Developer Experience
  - Files: `docs/guides/CACHING-GUIDE.md` (new)
  - Estimate: 1 hour

---

## 📊 Progress Tracking

### Week 1 Goals (Nov 19-25, 2025)

- [ ] Complete all SEC tasks
- [ ] Complete TYPE-1 through TYPE-4
- [ ] Complete ERR-1 and ERR-2
- [ ] Complete QUAL-1 through QUAL-3

**Target**: 12 tasks

### Week 2 Goals (Nov 26 - Dec 2, 2025)

- [ ] Complete PERF-1 through PERF-5
- [ ] Complete CACHE-1 and CACHE-2
- [ ] Complete FB-1 and FB-2
- [ ] Complete DATE-1 through DATE-3

**Target**: 12 tasks

### Week 3 Goals (Dec 3-9, 2025)

- [ ] Complete BUNDLE-1 through BUNDLE-4
- [ ] Complete TAIL-1 through TAIL-3
- [ ] Complete ERR-3
- [ ] Complete FB-3

**Target**: 9 tasks

### Week 4 Goals (Dec 10-16, 2025)

- [ ] Complete all TS tasks
- [ ] Complete all LOG tasks
- [ ] Complete all DOC tasks
- [ ] Final testing and validation

**Target**: 9 tasks

---

## 🎯 Success Metrics

### Code Quality

- [ ] Zero `any` types in service layer
- [ ] All TypeScript strict checks passing
- [ ] ESLint warnings < 10

### Performance

- [ ] Page load time < 2s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse score > 90

### Type Safety

- [ ] 100% typed service methods
- [ ] All bulk operations properly typed
- [ ] No implicit any errors

### Error Handling

- [ ] All errors logged to centralized system
- [ ] Error boundaries on all major pages
- [ ] Proper error messages for users

---

## 📝 Notes

### Best Practices to Follow

1. Always create types before implementing features
2. Use ErrorLogger for all error handling
3. Implement React.memo for list items
4. Use useCallback for event handlers
5. Test after each major change

### Testing Strategy

- Unit tests for utilities
- Integration tests for services
- E2E tests for critical flows
- Performance tests for optimizations

### Rollback Plan

- Each task should be in its own commit
- Document breaking changes
- Keep backup of current working code
- Test thoroughly before merging

---

**Last Updated**: November 19, 2025
**Next Review**: November 26, 2025
**Status**: Active
