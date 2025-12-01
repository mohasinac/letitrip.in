# AI Agent Guide

> **Last Updated**: January 2025

## Quick Reference for AI Coding Agents

### Before Making Changes

1. Read existing code patterns before editing
2. Check `src/constants/routes.ts` for route constants
3. Check `src/constants/api-routes.ts` for API endpoints
4. Use existing services from `src/services/`
5. **Use wrapper components** - See "HTML Tag Wrappers" section below

### Code Style

#### URLs/Routes

- **Public URLs**: Use slugs for SEO (`/products/[slug]`, `/auctions/[slug]`)
- **Seller URLs**: Use slugs for resources (`/seller/auctions/[slug]/edit`)
- **API calls**: Use service methods (`auctionsService.getBySlug(slug)`)

#### Components

- Use `ContentTypeFilter` for content type selection (replaces category dropdown in SearchBar)
- Use `UnifiedFilterSidebar` for filtering
- Use components from `src/components/forms/` for forms

#### Services

```typescript
// ✅ Correct - use service with slug
const auction = await auctionsService.getBySlug(params.slug);

// ✅ Correct - use route constants for links
import { SELLER_ROUTES } from '@/constants/routes';
href={SELLER_ROUTES.AUCTION_EDIT(auction.slug)}
```

---

## HTML Tag Wrappers (IMPORTANT)

**Always use wrapper components instead of raw HTML tags** for consistency, dark mode support, accessibility, and easier maintenance.

### Image Wrapper

```tsx
// ❌ Bad - raw img tag
<img src="/product.jpg" alt="Product" className="w-full h-48 object-cover" />;

// ✅ Good - use OptimizedImage
import OptimizedImage from "@/components/common/OptimizedImage";

<OptimizedImage
  src="/product.jpg"
  alt="Product"
  width={400}
  height={300}
  objectFit="cover"
/>;
```

### Form Wrappers

**⚠️ CRITICAL: Use ONLY Doc 27 standardized form components (see Doc 30 for details)**

```tsx
// ❌ Bad - raw label and input
<label className="block text-sm font-medium">Name</label>
<input type="text" className="border rounded px-3 py-2" />

// ❌ Bad - using deprecated Input component
import { Input } from '@/components/ui/Input';
<Input label="Name" />

// ❌ Bad - using duplicate MobileFormInput
import { MobileFormInput } from '@/components/mobile';
<MobileFormInput label="Name" />

// ✅ Good - use Doc 27 standard FormField with FormInput
import { FormField, FormInput } from '@/components/forms';

<FormField label="Name" required error={errors.name}>
  <FormInput
    value={name}
    onChange={(e) => setName(e.target.value)}
  />
</FormField>
```

**DO NOT USE:**

- ❌ `Input` from `@/components/ui/Input` (DEPRECATED - being removed)
- ❌ `Select` from `@/components/ui/Select` (DEPRECATED - being removed)
- ❌ `MobileFormInput` from `@/components/mobile` (DUPLICATE - use FormInput instead)
- ❌ `MobileFormSelect` from `@/components/mobile` (DUPLICATE - use FormSelect instead)

**USE ONLY:**

- ✅ `FormField`, `FormInput`, `FormSelect`, `FormCheckbox`, `FormTextarea`, `FormRadio` from `@/components/forms`
- ✅ Specialized inputs: `MobileInput` (phone with country code), `PincodeInput` (postal lookup), `LinkInput` (URL validation), `SlugInput` (auto-slugify), `TagInput` (multi-value tags)

### Typography Wrappers

```tsx
// ❌ Bad - raw headings
<h1 className="text-3xl font-bold">Title</h1>;

// ✅ Good - use Heading component
import { Heading } from "@/components/ui/Heading";

<Heading level={1}>Title</Heading>;
```

### Available Wrappers

| Raw HTML                  | Wrapper Component | Location                                   |
| ------------------------- | ----------------- | ------------------------------------------ |
| `<img>`                   | `OptimizedImage`  | `src/components/common/OptimizedImage.tsx` |
| `<label>`                 | `FormLabel`       | `src/components/forms/FormLabel.tsx`       |
| `<input>`                 | `FormInput`       | `src/components/forms/FormInput.tsx`       |
| `<textarea>`              | `FormTextarea`    | `src/components/forms/FormTextarea.tsx`    |
| `<select>`                | `FormSelect`      | `src/components/forms/FormSelect.tsx`      |
| `<input type="checkbox">` | `FormCheckbox`    | `src/components/forms/FormCheckbox.tsx`    |
| `<input type="radio">`    | `FormRadio`       | `src/components/forms/FormRadio.tsx`       |
| Label + Input             | `FormField`       | `src/components/forms/FormField.tsx`       |
| `<h1>` - `<h6>`           | `Heading`         | `src/components/ui/Heading.tsx`            |
| `<p>`                     | `Text`            | `src/components/ui/Text.tsx`               |

---

## Common Problems & Solutions

### 1. Large File Syndrome

**Problem**: Files over 300+ lines become hard to maintain.

**Solution**: Split into modular components.

```
// Before: /seller/products/create/page.tsx (898 lines)

// After:
src/components/seller/product-wizard/
├── types.ts              # Form data interface
├── RequiredInfoStep.tsx  # Step 1 component
├── OptionalDetailsStep.tsx # Step 2 component
└── index.ts              # Barrel exports

/seller/products/create/page.tsx (297 lines)
```

### 2. Orphaned Code After Refactoring

**Problem**: Old code remains after simplifying wizard steps.

**Solution**: Don't try to find orphaned code. **Rewrite the entire file** - it's faster and cleaner.

```typescript
// ❌ Bad - trying to find and remove old step 3, 4, 5, 6 content
// Leads to partial removal and broken files

// ✅ Good - rewrite the file with only needed content
// Creates clean, minimal code
```

### 3. Dark Mode Missing

**Problem**: Components don't work in dark mode.

**Solution**: Always include dark mode variants:

```tsx
// ✅ Include dark mode classes
className =
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700";
```

### 4. No Legacy Support Policy

**Problem**: Old patterns need to coexist with new patterns.

**Solution**: **Don't maintain backward compatibility.** Delete old files and patterns entirely.

```typescript
// ❌ Bad - keeping old getById() alongside new getBySlug()
// ✅ Good - remove getById(), use only getBySlug()
```

---

### Key Files

| Purpose           | Location                                                   |
| ----------------- | ---------------------------------------------------------- |
| Page routes       | `src/constants/routes.ts`                                  |
| API routes        | `src/constants/api-routes.ts`                              |
| Form components   | `src/components/forms/`                                    |
| Services          | `src/services/`                                            |
| Types             | `src/types/frontend/`, `src/types/backend/`                |
| Wizard components | `src/components/seller/product-wizard/`, `auction-wizard/` |
| Image wrapper     | `src/components/common/OptimizedImage.tsx`                 |

### Recent Changes (January 2025)

1. **Wizard Simplification**: Product/Auction wizards reduced to 2 steps (Required → Optional)
2. **Modular Step Components**: Each wizard step is now a separate component
3. **WizardSteps/WizardActionBar**: Reusable form components for all wizards
4. **OptimizedImage**: Use instead of raw `<img>` tags for automatic optimization
5. **FormField/FormInput**: Use instead of raw `<label>` + `<input>` for consistency

### Don't Do

- ❌ Don't use mocks - APIs are ready
- ❌ Don't create documentation files unless asked
- ❌ Don't use `getById()` for public/seller URLs - use `getBySlug()`
- ❌ Don't hardcode API paths - use constants from `api-routes.ts`
- ❌ Don't use raw `<img>` tags - use `OptimizedImage` component
- ❌ Don't use raw `<label>` + `<input>` - use `FormField` + `FormInput`
- ❌ Don't maintain legacy code - delete old patterns entirely
- ❌ Don't try to find orphaned code - rewrite the file instead
