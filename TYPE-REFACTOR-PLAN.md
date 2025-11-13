# Type System Reorganization - Implementation Plan

## Overview

Complete separation of Frontend (FE) and Backend (BE) types with strict type checking across all components, pages, hooks, and contexts.

## Phase 1: Core Type Infrastructure (Priority: CRITICAL)

### 1.1 Create Directory Structure

```
src/types/
├── README.md                 ✅ Created
├── frontend/
│   ├── product.types.ts
│   ├── auction.types.ts
│   ├── user.types.ts
│   ├── order.types.ts
│   ├── cart.types.ts
│   ├── category.types.ts
│   ├── shop.types.ts
│   ├── review.types.ts
│   ├── support.types.ts
│   ├── coupon.types.ts
│   ├── address.types.ts
│   └── index.ts
├── backend/
│   ├── product.types.ts
│   ├── auction.types.ts
│   ├── user.types.ts
│   ├── order.types.ts
│   ├── cart.types.ts
│   ├── category.types.ts
│   ├── shop.types.ts
│   ├── review.types.ts
│   ├── support.types.ts
│   ├── coupon.types.ts
│   ├── address.types.ts
│   └── index.ts
├── shared/
│   ├── common.types.ts       # Status, Role, Currency, etc.
│   ├── pagination.types.ts   # Pagination, Filters
│   ├── api.types.ts          # API Response, Error types
│   ├── form.types.ts         # Form validation types
│   └── index.ts
└── transforms/
    ├── product.transforms.ts
    ├── auction.transforms.ts
    ├── user.transforms.ts
    ├── order.transforms.ts
    ├── cart.transforms.ts
    ├── category.transforms.ts
    ├── shop.transforms.ts
    ├── review.transforms.ts
    ├── support.transforms.ts
    ├── coupon.transforms.ts
    ├── address.transforms.ts
    └── index.ts
```

### 1.2 Shared Types (Foundation)

- [ ] Create common.types.ts with enums and base types
- [ ] Create pagination.types.ts for list responses
- [ ] Create api.types.ts for API contracts
- [ ] Create form.types.ts for form handling

### 1.3 Core Entity Types (Product, User, Order)

- [ ] Define ProductFE and ProductBE types
- [ ] Define UserFE and UserBE types
- [ ] Define OrderFE and OrderBE types
- [ ] Create transformation functions for each

## Phase 2: Service Layer Update (Priority: HIGH)

### 2.1 Update Base API Service

- [ ] Type apiService.get<T>() to return typed responses
- [ ] Type apiService.post<T, U>() with request and response types
- [ ] Add transformation middleware

### 2.2 Update Individual Services

- [ ] products.service.ts - Use ProductFE/ProductBE
- [ ] auctions.service.ts - Use AuctionFE/AuctionBE
- [ ] users.service.ts - Use UserFE/UserBE
- [ ] orders.service.ts - Use OrderFE/OrderBE
- [ ] cart.service.ts - Use CartFE/CartBE
- [ ] categories.service.ts - Use CategoryFE/CategoryBE
- [ ] shops.service.ts - Use ShopFE/ShopBE
- [ ] reviews.service.ts - Use ReviewFE/ReviewBE
- [ ] support.service.ts - Use SupportFE/SupportBE
- [ ] coupons.service.ts - Use CouponFE/CouponBE
- [ ] addresses.service.ts - Use AddressFE/AddressBE

## Phase 3: Context & State Management (Priority: HIGH)

### 3.1 Update Contexts

- [ ] AuthContext - Type with UserFE
- [ ] CartContext - Type with CartFE
- [ ] UploadContext - Type with MediaFE
- [ ] Create proper context types

### 3.2 Update Custom Hooks

- [ ] useAuth - Return UserFE
- [ ] useCart - Return CartFE
- [ ] useProducts - Return ProductFE[]
- [ ] useAuctions - Return AuctionFE[]
- [ ] useOrders - Return OrderFE[]
- [ ] Remove all 'any' types

## Phase 4: Component Props (Priority: HIGH)

### 4.1 Product Components

- [ ] ProductCard - Props use ProductFE
- [ ] ProductGrid - Props use ProductFE[]
- [ ] ProductDetails - Props use ProductFE
- [ ] ProductForm - Props use ProductFE

### 4.2 Auction Components

- [ ] AuctionCard - Props use AuctionFE
- [ ] AuctionTimer - Props use AuctionFE
- [ ] BiddingPanel - Props use AuctionFE
- [ ] BidHistory - Props use BidFE[]

### 4.3 Cart & Checkout Components

- [ ] CartItem - Props use CartItemFE
- [ ] CartSummary - Props use CartFE
- [ ] CheckoutForm - Props use OrderFE
- [ ] OrderSummary - Props use OrderFE

### 4.4 User & Shop Components

- [ ] UserProfile - Props use UserFE
- [ ] ShopCard - Props use ShopFE
- [ ] ShopDetails - Props use ShopFE
- [ ] ReviewCard - Props use ReviewFE

### 4.5 Admin Components

- [ ] All admin components
- [ ] Dashboard stats components
- [ ] Management list components

## Phase 5: Pages & Routes (Priority: MEDIUM)

### 5.1 Product Pages

- [ ] /products/[slug]/page.tsx
- [ ] /products/page.tsx
- [ ] /seller/products/create/page.tsx
- [ ] /seller/products/[slug]/edit/page.tsx
- [ ] /seller/products/page.tsx

### 5.2 Auction Pages

- [ ] /auctions/[slug]/page.tsx
- [ ] /auctions/page.tsx
- [ ] /seller/auctions/create/page.tsx
- [ ] /seller/auctions/[slug]/edit/page.tsx

### 5.3 User Pages

- [ ] /user/profile/page.tsx
- [ ] /user/orders/page.tsx
- [ ] /user/orders/[id]/page.tsx
- [ ] /user/settings/page.tsx
- [ ] /user/addresses/page.tsx

### 5.4 Cart & Checkout

- [ ] /cart/page.tsx
- [ ] /checkout/page.tsx
- [ ] /checkout/success/page.tsx
- [ ] /checkout/cancel/page.tsx

### 5.5 Admin Pages

- [ ] /admin/products/page.tsx
- [ ] /admin/categories/page.tsx
- [ ] /admin/users/page.tsx
- [ ] /admin/orders/page.tsx
- [ ] /admin/shops/page.tsx
- [ ] /admin/settings/page.tsx

### 5.6 Seller Pages

- [ ] /seller/dashboard/page.tsx
- [ ] /seller/orders/page.tsx
- [ ] /seller/products/page.tsx
- [ ] /seller/auctions/page.tsx
- [ ] /seller/shops/page.tsx

### 5.7 Test Workflow Pages

- [ ] /test-workflow/page.tsx
- [ ] All test workflow components

## Phase 6: Form Validation (Priority: MEDIUM)

### 6.1 Add Field-Level Validation

- [ ] Product forms - Add real-time validation below fields
- [ ] Auction forms - Add real-time validation below fields
- [ ] User profile forms - Add real-time validation below fields
- [ ] Checkout forms - Add real-time validation below fields
- [ ] Category forms - Add real-time validation below fields

### 6.2 Persistent Action Buttons

- [ ] Product creation wizard - Show Save/Create button at all steps
- [ ] Auction creation wizard - Show Save/Create button at all steps
- [ ] Checkout flow - Show Finish button at all steps
- [ ] Keep buttons always visible (sticky/fixed positioning)

### 6.3 Validation Libraries

- [ ] Create validation schemas with Zod or Yup
- [ ] Add field-level validators
- [ ] Add form-level validators
- [ ] Add async validators (e.g., slug uniqueness)

## Phase 7: Folder Reorganization (Priority: LOW)

### 7.1 Component Organization

```
src/components/
├── product/
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── ProductDetails.tsx
│   └── ProductForm.tsx
├── auction/
│   ├── AuctionCard.tsx
│   ├── AuctionTimer.tsx
│   ├── BiddingPanel.tsx
│   └── BidHistory.tsx
├── cart/
│   ├── CartItem.tsx
│   ├── CartSummary.tsx
│   └── CartButton.tsx
└── ... (continue pattern)
```

### 7.2 Remove Re-exports

- [ ] Remove index.ts barrel files
- [ ] Use direct imports everywhere
- [ ] Update import statements

### 7.3 Clean Documentation

- [ ] Remove excessive inline docs
- [ ] Keep only critical comments
- [ ] Update README files to be concise

## Phase 8: Testing & Validation (Priority: HIGH)

### 8.1 Type Checking

- [ ] Run `npm run type-check` - Fix all errors
- [ ] Ensure zero 'any' types
- [ ] Ensure all props are typed
- [ ] Ensure all hooks return typed values

### 8.2 Runtime Testing

- [ ] Test all product flows
- [ ] Test all auction flows
- [ ] Test all cart/checkout flows
- [ ] Test all admin operations
- [ ] Test all seller operations
- [ ] Test all user profile operations
- [ ] Run test workflows

### 8.3 Performance Testing

- [ ] Verify no performance regression
- [ ] Check bundle size
- [ ] Check render performance

## Estimated Timeline

- **Phase 1**: 2-3 hours (Core infrastructure)
- **Phase 2**: 3-4 hours (Service layer)
- **Phase 3**: 2-3 hours (Contexts & hooks)
- **Phase 4**: 4-6 hours (Components)
- **Phase 5**: 6-8 hours (Pages)
- **Phase 6**: 3-4 hours (Validation)
- **Phase 7**: 2-3 hours (Reorganization)
- **Phase 8**: 2-3 hours (Testing)

**Total**: 24-36 hours of focused work

## Breaking Changes

This refactoring will introduce breaking changes:

1. All service methods now return FE types
2. All component props now expect FE types
3. All hooks now return FE types
4. API responses are transformed automatically
5. Form submissions use BE types

## Migration Strategy

1. Create new type system in parallel
2. Update services one by one
3. Update contexts and hooks
4. Update components gradually
5. Update pages last
6. Remove old types after migration complete

## Success Criteria

- [ ] Zero TypeScript errors
- [ ] Zero 'any' types in codebase
- [ ] All components properly typed
- [ ] All hooks properly typed
- [ ] All services properly typed
- [ ] All pages properly typed
- [ ] All test workflows pass
- [ ] Documentation updated
- [ ] AI-AGENT-GUIDE.md updated
- [ ] README.md updated
