# Component Splitting - Large Files into Modular Components

> **Status**: 🔄 In Progress
> **Priority**: 🔴 High
> **Last Updated**: January 2025

## Overview

Split large wizard forms, tabbed pages, and complex components into smaller, reusable modular components for easier maintainability, testing, and code reuse.

---

## Guiding Principles

1. **No Legacy Support**: Delete old files, don't maintain backward compatibility
2. **Easier to Rewrite**: Rewrite entire files rather than finding orphaned code
3. **Step Components**: Extract each wizard step into its own component
4. **Section Components**: Extract collapsible sections into reusable components
5. **Type Files**: Keep types in separate `types.ts` files per folder

---

## Completed ✅

### Seller Wizard Forms

| Component      | Original File                      | New Location                            | Lines Reduced |
| -------------- | ---------------------------------- | --------------------------------------- | ------------- |
| Product Wizard | `/seller/products/create/page.tsx` | `src/components/seller/product-wizard/` | 898 → 297     |
| Auction Wizard | `/seller/auctions/create/page.tsx` | `src/components/seller/auction-wizard/` | 1251 → 403    |

### Component Structure Created

```
src/components/seller/product-wizard/
├── types.ts              # ProductFormData interface
├── RequiredInfoStep.tsx  # Step 1: Name, slug, category, price, images
├── OptionalDetailsStep.tsx # Step 2: Description, shipping, SEO
└── index.ts              # Barrel exports

src/components/seller/auction-wizard/
├── types.ts              # AuctionFormData interface
├── RequiredInfoStep.tsx  # Step 1: Title, slug, category, bid, images
├── OptionalDetailsStep.tsx # Step 2: Description, schedule, shipping
└── index.ts              # Barrel exports
```

---

## Pending - Seller Pages

### Shop Creation/Edit

| File                                    | Est. Lines | Priority  |
| --------------------------------------- | ---------- | --------- |
| `/seller/my-shops/create/page.tsx`      | ~400       | 🟡 Medium |
| `/seller/my-shops/[slug]/edit/page.tsx` | ~500       | 🟡 Medium |

**Proposed Structure:**

```
src/components/seller/shop-wizard/
├── types.ts
├── BasicInfoStep.tsx    # Name, slug, description, logo
├── ContactStep.tsx      # Address, phone, email
├── BankingStep.tsx      # Bank details for payouts
└── index.ts
```

### Product/Auction Edit Pages

| File                                    | Est. Lines | Priority  |
| --------------------------------------- | ---------- | --------- |
| `/seller/products/[slug]/edit/page.tsx` | ~600       | 🟡 Medium |
| `/seller/auctions/[slug]/edit/page.tsx` | ~500       | 🟡 Medium |

---

## Pending - Admin Pages

### Category Create/Edit

| File                                     | Est. Lines | Priority |
| ---------------------------------------- | ---------- | -------- |
| `/admin/categories/create/page.tsx`      | ~350       | 🟢 Low   |
| `/admin/categories/[slug]/edit/page.tsx` | ~400       | 🟢 Low   |

**Proposed Structure:**

```
src/components/admin/category-wizard/
├── types.ts
├── BasicInfoStep.tsx    # Name, slug, parent, image
├── SEOStep.tsx          # Meta title, description
└── index.ts
```

### Blog Create/Edit

| File                               | Est. Lines | Priority |
| ---------------------------------- | ---------- | -------- |
| `/admin/blog/create/page.tsx`      | ~400       | 🟢 Low   |
| `/admin/blog/[slug]/edit/page.tsx` | ~450       | 🟢 Low   |

**Proposed Structure:**

```
src/components/admin/blog-wizard/
├── types.ts
├── ContentStep.tsx      # Title, slug, content, featured image
├── SettingsStep.tsx     # Category, tags, publish settings
└── index.ts
```

### Hero Slides Management

| File                          | Est. Lines | Priority  |
| ----------------------------- | ---------- | --------- |
| `/admin/hero-slides/page.tsx` | ~600       | 🟡 Medium |

---

## Pending - User Pages

### User Settings (Tabbed)

| File                      | Est. Lines | Priority  |
| ------------------------- | ---------- | --------- |
| `/user/settings/page.tsx` | ~450       | 🟡 Medium |

**Proposed Structure:**

```
src/components/user/settings/
├── types.ts
├── ProfileTab.tsx       # Display name, avatar, bio
├── SecurityTab.tsx      # Password change, 2FA
├── NotificationsTab.tsx # Email preferences
├── AddressesTab.tsx     # Saved addresses
└── index.ts
```

---

## Pending - Complex Components

### Filter Sidebars

| Component            | File                                             | Priority |
| -------------------- | ------------------------------------------------ | -------- |
| UnifiedFilterSidebar | `src/components/common/UnifiedFilterSidebar.tsx` | 🟢 Low   |

### Data Tables with Inline Editing

| Component    | File                                     | Priority  |
| ------------ | ---------------------------------------- | --------- |
| ProductTable | `src/components/seller/ProductTable.tsx` | 🟡 Medium |
| OrderTable   | `src/components/seller/OrderTable.tsx`   | 🟡 Medium |

---

## Pattern for Splitting

### Step 1: Create Types File

```typescript
// src/components/seller/product-wizard/types.ts
export interface ProductFormData {
  name: string;
  slug: string;
  categoryId: string;
  // ... all form fields
}

export interface StepProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  errors: Record<string, string>;
  // ... common props
}
```

### Step 2: Extract Step Component

```typescript
// src/components/seller/product-wizard/RequiredInfoStep.tsx
import { StepProps } from "./types";

export function RequiredInfoStep({ formData, setFormData, errors }: StepProps) {
  return <div className="space-y-6">{/* Step content */}</div>;
}
```

### Step 3: Create Barrel Export

```typescript
// src/components/seller/product-wizard/index.ts
export * from "./types";
export * from "./RequiredInfoStep";
export * from "./OptionalDetailsStep";
```

### Step 4: Simplify Parent Page

```typescript
// /seller/products/create/page.tsx
import { ProductFormData, RequiredInfoStep, OptionalDetailsStep } from '@/components/seller/product-wizard';

export default function CreateProductPage() {
  const [formData, setFormData] = useState<ProductFormData>({...});
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <WizardForm>
      {currentStep === 0 && <RequiredInfoStep {...props} />}
      {currentStep === 1 && <OptionalDetailsStep {...props} />}
    </WizardForm>
  );
}
```

---

## Implementation Checklist

### Phase 1: Seller Wizards ✅ COMPLETE

- [x] Extract product wizard into modular components
- [x] Extract auction wizard into modular components

### Phase 2: Seller Edit Pages

- [ ] Extract product edit into modular components (reuse wizard components)
- [ ] Extract auction edit into modular components (reuse wizard components)
- [ ] Extract shop wizard into modular components

### Phase 3: Admin Wizards

- [ ] Extract category wizard into modular components
- [ ] Extract blog wizard into modular components
- [ ] Extract hero slides into modular components

### Phase 4: User Pages

- [ ] Extract user settings tabs into modular components

### Phase 5: Complex Components

- [ ] Split large data tables into modular components
- [ ] Split filter sidebar into modular components

---

## Benefits

| Benefit             | Impact                                           |
| ------------------- | ------------------------------------------------ |
| Smaller files       | Easier to read, review, and maintain             |
| Reusable components | Share between create/edit pages                  |
| Better testing      | Test each step independently                     |
| Faster development  | Modify one step without touching others          |
| Clearer ownership   | Assign different team members to different steps |
