# Form UX Improvements

> **Status**: ✅ Phase 1, 2 & 3 Complete
> **Priority**: ✅ Complete
> **Last Updated**: January 2025
> **Related**: See [Doc 25 - Wizard Forms Mobile](./25-wizard-forms-mobile.md) for mobile-specific wizard improvements

## Current Issues

| Issue                          | Files Affected                                       | Impact                                 | Status                        |
| ------------------------------ | ---------------------------------------------------- | -------------------------------------- | ----------------------------- |
| **Errors via alert()**         | ProductInlineForm, CouponInlineForm, wizard pages    | Blocks user, poor UX                   | ✅ Fixed - uses inline errors |
| **Submit only on last step**   | `/seller/products/create`, `/seller/auctions/create` | User must complete all steps first     | ✅ Fixed - visible action bar |
| **Mandatory fields scattered** | 6-step product wizard, 5-step auction wizard         | User confusion, incomplete submissions | ✅ Fixed - 2 steps            |
| **Unnecessary flags in forms** | Status dropdowns, featured checkboxes                | Adds clutter, should default to draft  | ✅ Defaults to draft          |
| **Too many wizard steps**      | Product (6 steps), Auction (5 steps)                 | Slow task completion                   | ✅ Fixed - 2 steps            |

## Solution

Simplify to 2 steps (Required → Optional), always-visible submit button, inline errors below inputs.

### Wizard Simplification

**Current Product Wizard (6 steps):**

1. Basic Info
2. Pricing
3. Inventory
4. Images
5. SEO
6. Review

**Proposed Product Wizard (2 steps):**

1. **Required**: Name, Price, Category, At least 1 image
2. **Optional**: Description, SKU, Variants, SEO, etc.

**Current Auction Wizard (5 steps):**

1. Basic Info
2. Starting Price
3. Duration
4. Images
5. Review

**Proposed Auction Wizard (2 steps):**

1. **Required**: Title, Starting Price, Duration, At least 1 image
2. **Optional**: Description, Reserve Price, Buy Now Price, etc.

### Error Handling Pattern

Replace:

```tsx
// Bad - blocks user
if (error) {
  alert(error.message);
  return;
}
```

With:

```tsx
// Good - inline feedback
const [errors, setErrors] = useState<Record<string, string>>({});

// In JSX
<Input
  value={name}
  onChange={(e) => setName(e.target.value)}
  className={errors.name ? "border-red-500" : ""}
/>;
{
  errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>;
}
```

### Form Defaults

Forms should default to sensible values:

- **status**: "draft" (not shown to user, set automatically)
- **featured**: false (admin-only field, hidden from sellers)
- **published**: false (publish is a separate action)

## Fix Checklist

### Phase 1: Error Handling ✅ COMPLETE

- [x] Replace alert() with inline errors in ProductInlineForm (uses `errors` state + inline error messages)
- [x] Replace alert() with inline errors in CouponInlineForm (uses `errors` state + inline error messages)
- [x] Replace alert() with inline errors in wizard pages (forms use inline validation)

### Phase 2: Wizard Simplification ✅ COMPLETE

- [x] Simplify product creation to 2-step wizard
  - Created `src/components/seller/product-wizard/` with modular step components
  - RequiredInfoStep: name, slug, category, SKU, price, stock, images
  - OptionalDetailsStep: collapsible details, shipping, SEO sections
  - Reduced page from 898 to 297 lines
- [x] Simplify auction creation to 2-step wizard
  - Created `src/components/seller/auction-wizard/` with modular step components
  - RequiredInfoStep: title, slug, category, starting bid, type, images
  - OptionalDetailsStep: collapsible bidding, schedule, shipping sections
  - Reduced page from 1251 to 403 lines
- [x] Add always-visible submit button (WizardActionBar component)
- [x] Move optional fields to expandable sections (uses expandedSections state)

### Phase 3: Form Defaults ✅ COMPLETE

- [x] Set default status to "draft" in all forms (ProductInlineForm, CouponInlineForm default to "draft")
- [x] Hide "featured" field from seller forms (admin-only)
- [x] Add separate "Publish" button for draft items

## Form Validation Pattern

```tsx
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  price: z.number().positive("Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
});

function validateProduct(data: unknown) {
  const result = productSchema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join(".");
      errors[path] = err.message;
    });
    return { success: false, errors };
  }
  return { success: true, data: result.data };
}
```

## Testing Instructions

1. Try submitting forms with empty required fields
2. Verify inline error messages appear
3. Verify errors clear when field is corrected
4. Test keyboard navigation through forms
5. Test form submission on mobile
