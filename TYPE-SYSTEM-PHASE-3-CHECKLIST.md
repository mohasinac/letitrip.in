# Type System Migration - Phase 3 Service Layer Checklist

**Last Updated:** November 14, 2025  
**Current Status:** Phase 3 - Service Layer Updates (30% Complete)

---

## ✅ Completed Services (5/11)

### 1. ✅ cart.service.ts - COMPLETE

- **Status:** Zero TypeScript errors
- **Changes Applied:**
  - Imports: `CartBE`, `CartFE`, `CartItemFE`, `AddToCartFormFE`, `CartSummaryFE`
  - Transforms: `toFECart`, `toFECartSummary`, `toBEAddToCartRequest`, `createEmptyCart`
  - All methods return `CartFE`
  - Guest cart helpers use `CartItemFE`
- **Validation:** ✅ Compiled successfully

### 2. ✅ users.service.ts - COMPLETE

- **Status:** Zero TypeScript errors
- **Changes Applied:**
  - Imports: `UserBE`, `UserFE`, `UserProfileFormFE`, `ChangePasswordFormFE`, `OTPVerificationFormFE`
  - Transforms: `toFEUser`, `toFEUsers`, `toBEUpdateUserRequest`, `toBEBanUserRequest`, `toBEChangeRoleRequest`
  - Paginated responses use `PaginatedResponseFE<UserFE>`
  - All form submissions accept FE form types
- **Validation:** ✅ Compiled successfully

### 3. ✅ orders.service.ts - COMPLETE

- **Status:** Zero TypeScript errors
- **Changes Applied:**
  - Imports: `OrderBE`, `OrderFE`, `OrderCardFE`, `CreateOrderFormFE`, `OrderStatsFE`
  - Transforms: `toFEOrder`, `toFEOrderCard`, `toBECreateOrderRequest`, `toBEUpdateOrderStatusRequest`, `toBECreateShipmentRequest`
  - List methods return `PaginatedResponseFE<OrderCardFE>`
  - Detail methods return `OrderFE`
- **Validation:** ✅ Compiled successfully

### 4. ⚠️ products.service.ts - NEEDS API ALIGNMENT

- **Status:** 3 minor TypeScript errors
- **Issues:**
  1. Filter type mapping between FE and BE needs refinement
  2. API response structure mismatch (expects `ProductListResponseBE` but uses `PaginatedResponse`)
  3. Category filter handling needs adjustment
- **Action Required:**
  - Verify actual API response structure
  - Update filter transformation logic
  - Test with real API responses
- **Estimated Time:** 20-30 minutes

### 5. ⚠️ auctions.service.ts - USER EDITED

- **Status:** Unknown (user made manual edits)
- **Action Required:**
  - Check current state
  - Verify compilation errors
  - Complete any remaining transformations
- **Estimated Time:** 30-45 minutes

---

## 🚧 Pending Services (6/11)

### 6. ❌ categories.service.ts - NOT STARTED

**Priority:** HIGH  
**Complexity:** Medium  
**Estimated Time:** 30 minutes

**Required Changes:**

```typescript
// Import structure
import {
  CategoryBE,
  CategoryFiltersBE,
  CreateCategoryRequestBE,
  UpdateCategoryRequestBE,
} from "@/types/backend/category.types";
import {
  CategoryFE,
  CategoryTreeNodeFE,
  CategoryFormFE,
  CategoryCardFE,
} from "@/types/frontend/category.types";
import {
  toFECategory,
  toFECategories,
  toFECategoryTreeNode,
  toBECreateCategoryRequest,
  toBEUpdateCategoryRequest,
} from "@/types/transforms/category.transforms";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "@/types/shared/common.types";
```

**Methods to Update:**

- `list(filters?)` → Return `PaginatedResponseFE<CategoryFE>`
- `getById(id)` → Return `CategoryFE`
- `getBySlug(slug)` → Return `CategoryFE`
- `getTree()` → Return `CategoryTreeNodeFE[]`
- `create(formData: CategoryFormFE)` → Return `CategoryFE`
- `update(id, formData: CategoryFormFE)` → Return `CategoryFE`
- `delete(id)` → Keep as is

**Special Considerations:**

- Category tree structure with multi-parent support
- Breadcrumb generation
- Hierarchy level handling

---

### 7. ❌ shops.service.ts - NOT STARTED

**Priority:** HIGH  
**Complexity:** Medium  
**Estimated Time:** 25 minutes

**Required Changes:**

```typescript
// Import structure
import {
  ShopBE,
  ShopFiltersBE,
  CreateShopRequestBE,
  UpdateShopRequestBE,
} from "@/types/backend/shop.types";
import {
  ShopFE,
  ShopCardFE,
  ShopFormFE,
  ShopStatsFE,
} from "@/types/frontend/shop.types";
import {
  toFEShop,
  toFEShops,
  toFEShopCard,
  toBECreateShopRequest,
  toBEUpdateShopRequest,
} from "@/types/transforms/shop.transforms";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "@/types/shared/common.types";
```

**Methods to Update:**

- `list(filters?)` → Return `PaginatedResponseFE<ShopCardFE>`
- `getById(id)` → Return `ShopFE`
- `getBySlug(slug)` → Return `ShopFE`
- `create(formData: ShopFormFE)` → Return `ShopFE`
- `update(id, formData: ShopFormFE)` → Return `ShopFE`
- `getStats(shopId)` → Return `ShopStatsFE`
- `getFeatured()` → Return `ShopCardFE[]`

**Special Considerations:**

- Shop badge generation (Verified, Top Rated, Large Catalog)
- Stats formatting (totalSales, rating)
- Settings (minOrderAmount, shippingCharge)

---

### 8. ❌ reviews.service.ts - NOT STARTED

**Priority:** MEDIUM  
**Complexity:** Medium  
**Estimated Time:** 25 minutes

**Required Changes:**

```typescript
// Import structure
import {
  ReviewBE,
  ReviewFiltersBE,
  CreateReviewRequestBE,
  UpdateReviewRequestBE,
} from "@/types/backend/review.types";
import {
  ReviewFE,
  ReviewCardFE,
  ReviewFormFE,
  ReviewStatsFE,
} from "@/types/frontend/review.types";
import {
  toFEReview,
  toFEReviews,
  toBECreateReviewRequest,
  toFEReviewStats,
} from "@/types/transforms/review.transforms";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "@/types/shared/common.types";
```

**Methods to Update:**

- `list(filters?)` → Return `PaginatedResponseFE<ReviewFE>`
- `getById(id)` → Return `ReviewFE`
- `getByProduct(productId)` → Return `PaginatedResponseFE<ReviewFE>`
- `getByShop(shopId)` → Return `PaginatedResponseFE<ReviewFE>`
- `create(formData: ReviewFormFE)` → Return `ReviewFE`
- `update(id, formData: ReviewFormFE)` → Return `ReviewFE`
- `getStats(productId)` → Return `ReviewStatsFE`
- `markHelpful(id)` → Return `ReviewFE`
- `reply(id, reply)` → Return `ReviewFE`

**Special Considerations:**

- Rating distribution percentages
- Helpfulness score calculation
- Time ago formatting
- Reply handling

---

### 9. ❌ addresses.service.ts - NOT STARTED

**Priority:** MEDIUM  
**Complexity:** Low  
**Estimated Time:** 20 minutes

**Required Changes:**

```typescript
// Import structure
import {
  AddressBE,
  CreateAddressRequestBE,
  UpdateAddressRequestBE,
} from "@/types/backend/address.types";
import { AddressFE, AddressFormFE } from "@/types/frontend/address.types";
import {
  toFEAddress,
  toFEAddresses,
  toBECreateAddressRequest,
  toBEUpdateAddressRequest,
} from "@/types/transforms/address.transforms";
```

**Methods to Update:**

- `list()` → Return `AddressFE[]`
- `getById(id)` → Return `AddressFE`
- `create(formData: AddressFormFE)` → Return `AddressFE`
- `update(id, formData: AddressFormFE)` → Return `AddressFE`
- `delete(id)` → Keep as is
- `setDefault(id)` → Return `AddressFE`

**Special Considerations:**

- Address formatting (full, short)
- Type labels (home, work, other)
- Default address handling

---

### 10. ❌ support.service.ts - NOT STARTED OR MISSING

**Priority:** LOW  
**Complexity:** Medium  
**Estimated Time:** 30 minutes

**File Status:** May not exist - needs verification

**If File Exists - Required Changes:**

```typescript
// Import structure
import {
  TicketBE,
  TicketMessageBE,
  CreateTicketRequestBE,
} from "@/types/backend/support.types";
import {
  TicketFE,
  TicketMessageFE,
  TicketFormFE,
} from "@/types/frontend/support.types";
import {
  toFETicket,
  toFETickets,
  toFETicketMessage,
  toBECreateTicketRequest,
} from "@/types/transforms/support.transforms";
import { TicketStatus, TicketPriority } from "@/types/shared/common.types";
```

**If File Doesn't Exist:**

- Create new service following established patterns
- Implement ticket CRUD operations
- Add message thread handling

**Special Considerations:**

- Status tracking (open, in-progress, resolved, closed)
- Priority levels (low, medium, high, urgent)
- Message threading
- Attachment handling

---

### 11. ⚠️ api.service.ts - SPECIAL CASE

**Priority:** LOW  
**Complexity:** Low  
**Estimated Time:** 15 minutes

**Status:** Core infrastructure - minimal changes needed

**Possible Updates:**

- Add type guards for response validation
- Improve error handling with typed errors
- Add request/response interceptors for timestamp conversion
- No major structural changes required

**Action Items:**

1. Review current error handling
2. Add typed error responses if needed
3. Consider adding automatic Timestamp → Date conversion
4. Test with all updated services

---

## 📋 Common Patterns for All Services

### Standard Import Pattern

```typescript
import { apiService } from "./api.service";
import {
  EntityBE,
  EntityFiltersBE,
  CreateEntityRequestBE,
  UpdateEntityRequestBE,
} from "@/types/backend/entity.types";
import {
  EntityFE,
  EntityCardFE,
  EntityFormFE,
} from "@/types/frontend/entity.types";
import {
  toFEEntity,
  toFEEntities,
  toBECreateEntityRequest,
  toBEUpdateEntityRequest,
} from "@/types/transforms/entity.transforms";
import type {
  PaginatedResponseBE,
  PaginatedResponseFE,
} from "@/types/shared/common.types";
```

### List Method Pattern

```typescript
async list(filters?: Partial<EntityFiltersBE>): Promise<PaginatedResponseFE<EntityCardFE>> {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/entities?${queryString}` : "/entities";

  const response = await apiService.get<PaginatedResponseBE<EntityBE>>(endpoint);

  return {
    data: response.data.map(toFEEntityCard),
    total: response.total,
    page: response.page,
    limit: response.limit,
    totalPages: response.totalPages,
    hasMore: response.hasMore,
  };
}
```

### Get By ID Pattern

```typescript
async getById(id: string): Promise<EntityFE> {
  const entityBE = await apiService.get<EntityBE>(`/entities/${id}`);
  return toFEEntity(entityBE);
}
```

### Create Pattern

```typescript
async create(formData: EntityFormFE): Promise<EntityFE> {
  const request = toBECreateEntityRequest(formData);
  const entityBE = await apiService.post<EntityBE>("/entities", request);
  return toFEEntity(entityBE);
}
```

### Update Pattern

```typescript
async update(id: string, formData: Partial<EntityFormFE>): Promise<EntityFE> {
  const request = toBEUpdateEntityRequest(formData);
  const entityBE = await apiService.patch<EntityBE>(`/entities/${id}`, request);
  return toFEEntity(entityBE);
}
```

### Delete Pattern (No Changes Usually)

```typescript
async delete(id: string): Promise<{ message: string }> {
  return apiService.delete<{ message: string }>(`/entities/${id}`);
}
```

---

## 🔍 Verification Steps for Each Service

1. **Check Imports**

   - All BE types imported from `@/types/backend/`
   - All FE types imported from `@/types/frontend/`
   - All transforms imported from `@/types/transforms/`
   - No imports from old `@/types` barrel export

2. **Check Return Types**

   - List methods return `PaginatedResponseFE<EntityCardFE>` or `EntityCardFE[]`
   - Detail methods return `EntityFE`
   - Create/Update methods return `EntityFE`
   - No `any` types in return signatures

3. **Check Parameters**

   - Form submissions accept FE form types (`EntityFormFE`)
   - Filters use BE filter types (`EntityFiltersBE`)
   - No inline type definitions

4. **Check Transformations**

   - All BE responses transformed to FE with `toFEEntity()`
   - All FE forms transformed to BE requests with `toBECreateEntityRequest()`
   - Proper handling of arrays with `.map(toFEEntity)`

5. **Run TypeScript Check**

   ```powershell
   npx tsc --noEmit
   ```

6. **Check for Errors**
   - Zero compilation errors
   - No unused imports
   - No type assertions (`as any`)

---

## 🎯 Next Steps - Immediate Actions

### Step 1: Check User Edits (5 minutes)

Files edited by user - verify current state:

- auctions.service.ts
- All type files (backend, frontend, transforms)
- Check for compilation errors
- Identify any remaining issues

### Step 2: Complete Auctions Service (30 minutes)

- Fix any remaining type issues
- Test transformations
- Verify all methods return correct types
- Run compilation check

### Step 3: Categories Service (30 minutes)

- Read existing file
- Apply transformation pattern
- Handle tree structure properly
- Test compilation

### Step 4: Shops Service (25 minutes)

- Read existing file
- Apply transformation pattern
- Handle badge generation
- Test compilation

### Step 5: Reviews Service (25 minutes)

- Read existing file
- Apply transformation pattern
- Handle rating stats
- Test compilation

### Step 6: Addresses Service (20 minutes)

- Read existing file
- Apply transformation pattern
- Handle formatting
- Test compilation

### Step 7: Support Service (30 minutes)

- Check if file exists
- Create or update as needed
- Test compilation

### Step 8: Final Validation (15 minutes)

- Run full TypeScript compilation
- Check all services for errors
- Update TYPE-SYSTEM-STATUS.md
- Create summary report

**Total Estimated Time:** 3-4 hours

---

## 📊 Success Criteria

- [ ] All 11 services compile with zero TypeScript errors
- [ ] All services use FE/BE type separation
- [ ] All services use transformation functions
- [ ] No `any` types in service layer
- [ ] No inline type definitions
- [ ] All methods have explicit return types
- [ ] Paginated responses use `PaginatedResponseFE`
- [ ] TYPE-SYSTEM-STATUS.md updated to Phase 3: 100%

---

## 🚀 After Phase 3 Completion

### Phase 4: Contexts & Hooks (2-3 hours)

- Update AuthContext to use UserFE
- Update CartContext to use CartFE
- Add explicit return types to all hooks
- Remove any types from contexts

### Phase 5: Component Props (4-6 hours)

- Update all component props to use FE types
- Remove any types from components
- Add proper TypeScript interfaces for props

### Phase 6: Pages (6-8 hours)

- Update all page components
- Verify service integration
- Test data flow

### Phase 7: Field-Level Validation (3-4 hours)

- Implement Zod/Yup schemas
- Add real-time validation
- Persistent action buttons

### Phase 8: Folder Reorganization (2-3 hours)

- Remove barrel exports
- Direct imports throughout
- Clean up documentation

---

## 📝 Notes for AI Agent

**Context Preservation:**

- User has made manual edits to services and type files
- Always read current file state before editing
- Check compilation status before and after changes
- Use `get_errors` tool to verify changes

**Common Pitfalls:**

- Timestamp handling (Firestore → Date)
- Array transformations need `.map()`
- Paginated responses need manual construction
- Filter parameters should be `Partial<FiltersBE>`

**Best Practices:**

- Read file first
- Make focused changes
- Verify compilation
- Move to next file
- Don't attempt to fix multiple files in parallel

**Testing Strategy:**

- Compile after each service update
- Fix errors immediately
- Don't proceed if errors exist
- Document any API mismatches

---

**Document Version:** 1.0  
**Last Updated:** November 14, 2025, 17:30 IST
