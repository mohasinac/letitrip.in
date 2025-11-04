# Shared Types Reorganization Plan

## Overview

Create a unified type system that can be used by both UI (frontend) and Backend (API) with clear separation of concerns.

## New Structure

```
src/types/
├── index.ts                 # Main export (re-exports all)
├── shared/                  # Shared between UI and Backend
│   ├── index.ts
│   ├── user.ts             # User, Address, Auth types
│   ├── product.ts          # Product, ProductImage, ProductVideo
│   ├── category.ts         # Category, CategoryTree
│   ├── order.ts            # Order, OrderItem, OrderStatus
│   ├── cart.ts             # Cart, CartItem
│   ├── auction.ts          # Auction, Bid
│   ├── review.ts           # Review types
│   ├── payment.ts          # Payment types (Razorpay, etc.)
│   ├── shipping.ts         # Shipping types (Shiprocket, etc.)
│   ├── seller.ts           # Seller, SellerProfile, SellerShop
│   ├── coupon.ts           # Coupon, CouponUsage
│   ├── analytics.ts        # Analytics types
│   └── common.ts           # ApiResponse, PaginatedResponse, Filters
├── api/                     # Backend-specific types
│   ├── index.ts
│   ├── controllers.ts      # UserContext, Controller inputs
│   ├── models.ts           # Model-specific types
│   ├── middleware.ts       # Middleware types
│   └── services.ts         # Service-specific types
├── ui/                      # Frontend-specific types
│   ├── index.ts
│   ├── components.ts       # Component prop types
│   ├── hooks.ts            # Hook return types
│   └── contexts.ts         # Context types
└── game/                    # Game-specific types (already in lib/game/types)
    ├── index.ts            # Re-export from @/lib/game/types
    └── ...                 # (reference only, actual files in lib/game/types)
```

## Benefits

1. **Clear Separation**: Shared vs UI vs Backend vs Game types
2. **No Duplication**: Single source of truth for shared types
3. **Easy Imports**: Import from appropriate category
4. **Type Safety**: Both frontend and backend use same types
5. **Maintainability**: Changes in one place affect both sides
6. **Scalability**: Easy to add new type categories

## Import Examples

### Shared Types (Used by both UI and Backend)

```typescript
// Single imports
import { User, Address } from "@/types/shared/user";
import { Product, ProductImage } from "@/types/shared/product";
import { Order, OrderStatus } from "@/types/shared/order";

// Grouped imports
import { User, Product, Order } from "@/types/shared";
```

### Backend-Only Types

```typescript
import { UserContext } from "@/types/api/controllers";
import { CreateProductInput } from "@/types/api/models";
```

### Frontend-Only Types

```typescript
import { ButtonProps } from "@/types/ui/components";
import { UseProductsReturn } from "@/types/ui/hooks";
```

### Game Types (from lib/game)

```typescript
import { GameState, PlayerData } from "@/lib/game/types";
// Or re-export convenience
import { GameState } from "@/types/game";
```

## Migration Plan

1. **Create directory structure**
2. **Split existing `types/index.ts` into categorized files**
3. **Move backend-specific types from controllers to `types/api/`**
4. **Create frontend-specific types in `types/ui/`**
5. **Update all imports throughout codebase**
6. **Keep game types reference in `types/game/index.ts`**

## Rules

1. **Shared types**: Common data structures used by both UI and API
2. **API types**: Request/Response shapes, Controller inputs, Middleware types
3. **UI types**: Component props, Hook returns, Context values
4. **Game types**: Stay in `lib/game/types/` (not duplicated)

## Type Categories

### Shared (Both UI & Backend)

- Domain models: User, Product, Order, Category, etc.
- Enums: OrderStatus, PaymentStatus, etc.
- Common interfaces: ApiResponse, PaginatedResponse
- Filter types: ProductFilters, OrderFilters

### API-Only (Backend)

- Controller contexts: UserContext
- Input DTOs: RegisterInput, LoginInput, CreateProductInput
- Service interfaces: Internal service contracts
- Middleware types: Request handlers, Guards

### UI-Only (Frontend)

- Component props: ButtonProps, ModalProps
- Hook returns: UseProductsReturn, UseAuthReturn
- Context values: AuthContextValue, CartContextValue
- Form types: ProductFormData, UserFormData

---

**Status**: Plan Created
**Next**: Implement the structure and migrate types
