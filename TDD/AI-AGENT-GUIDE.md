# AI Agent Guide

> **Last Updated**: December 2, 2025

## Quick Reference for AI Coding Agents

### Before Making Changes

1. Read existing code patterns before editing
2. Check `src/constants/routes.ts` for route constants
3. Check `src/constants/api-routes.ts` for API endpoints
4. Use existing services from `src/services/`
5. **Use wrapper components** - See "HTML Tag Wrappers" and "Value Display Components" sections below

### Migration Status

✅ **Price Component Migration Complete** - All inline `₹{amount.toLocaleString()}` patterns have been migrated to use `<Price amount={} />` or `<CompactPrice amount={} />` components. See [Doc 32](../../docs/32-common-value-components.md) for full migration details.

### Code Style

#### URLs/Routes

- **Public URLs**: Use slugs for SEO (`/products/[slug]`, `/auctions/[slug]`)
- **Seller URLs**: Use slugs for resources (`/seller/auctions/[slug]/edit`)
- **API calls**: Use service methods (`auctionsService.getBySlug(slug)`)

#### Components

- Use `ContentTypeFilter` for content type selection (replaces category dropdown in SearchBar)
- Use `UnifiedFilterSidebar` for filtering
- Use components from `src/components/forms/` for forms
- Use components from `src/components/common/values/` for value display

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

### Available HTML Wrappers

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

## Value Display Components (IMPORTANT)

**Always use value display components instead of raw strings or inline formatting** for consistent formatting, dark mode support, and maintainability.

### Price Display

```tsx
// ❌ Bad - manual formatting
<span>₹{product.price.toLocaleString('en-IN')}</span>

// ✅ Good - use Price component
import { Price, CompactPrice } from '@/components/common/values';

<Price amount={1499} />                           // ₹1,499
<Price amount={1499} originalPrice={1999} />     // ₹1,499  ₹1,999  25% off
<CompactPrice amount={150000} />                  // ₹1.5L
```

### Date Display

```tsx
// ❌ Bad - inline formatting
<span>{new Date(order.createdAt).toLocaleDateString()}</span>

// ✅ Good - use DateDisplay component
import { DateDisplay, RelativeDate, DateRange } from '@/components/common/values';

<DateDisplay date={order.createdAt} />            // Dec 2, 2025
<DateDisplay date={date} includeTime />           // Dec 2, 2025, 10:30 AM
<RelativeDate date={createdAt} />                 // 2 hours ago
<DateRange start={startDate} end={endDate} />     // Dec 1 - Dec 15, 2025
```

### Status Badges

```tsx
// ❌ Bad - inline status styling
<span className={order.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
  {order.status}
</span>

// ✅ Good - use status components
import { ShippingStatus, PaymentStatus, StockStatus } from '@/components/common/values';

<ShippingStatus status="shipped" />               // 🚚 Shipped
<PaymentStatus status="paid" />                   // ✅ Paid
<StockStatus count={3} />                         // ⚠️ Only 3 left
```

### Contact Info

```tsx
// ❌ Bad - raw text
<span>+91 9876543210</span>
<span>user@example.com</span>

// ✅ Good - use contact components
import { PhoneNumber, Email } from '@/components/common/values';

<PhoneNumber value="9876543210" clickable />      // +91 98765 43210 (tel: link)
<Email value="user@example.com" clickable />      // user@example.com (mailto: link)
```

### Rating and Order ID

```tsx
// ✅ Good - use Rating and OrderId components
import { Rating, OrderId } from '@/components/common/values';

<Rating value={4.5} reviewCount={123} />          // ★★★★½ 4.5 (123)
<OrderId value="abc123xyz789" copyable />         // #ORD-ABC123XY (with copy button)
```

### Address

```tsx
// ✅ Good - use Address component
import { Address } from '@/components/common/values';

<Address address={addressObj} />                  // Multi-line formatted address
<Address address={addressObj} format="compact" /> // City, State Pincode
```

### Available Value Components

| Data Type      | Component        | Example Output       |
| -------------- | ---------------- | -------------------- |
| Price          | `Price`          | ₹1,499               |
| Large Price    | `CompactPrice`   | ₹1.5L                |
| Date           | `DateDisplay`    | Dec 2, 2025          |
| Relative Time  | `RelativeDate`   | 2 hours ago          |
| Date Range     | `DateRange`      | Dec 1 - Dec 15, 2025 |
| Countdown      | `TimeRemaining`  | 2d 5h 30m            |
| Phone          | `PhoneNumber`    | +91 98765 43210      |
| Email          | `Email`          | user@example.com     |
| Currency       | `Currency`       | ₹1,499 / $99         |
| Shipping       | `ShippingStatus` | 🚚 Shipped           |
| Payment        | `PaymentStatus`  | ✅ Paid              |
| Order ID       | `OrderId`        | #ORD-ABC123XY        |
| Rating         | `Rating`         | ★★★★½ 4.5 (123)      |
| Stock          | `StockStatus`    | ⚠️ Only 3 left       |
| Address        | `Address`        | City, State Pincode  |
| Quantity       | `Quantity`       | 1.5K items           |
| Weight         | `Weight`         | 1.5 kg               |
| Dimensions     | `Dimensions`     | 10 × 20 × 5 cm       |
| SKU            | `SKU`            | SKU-12345 (copy btn) |
| Bid Count      | `BidCount`       | 🔨 15 bids           |
| Percentage     | `Percentage`     | +25% / -10%          |
| Truncated Text | `TruncatedText`  | Long text... [more]  |
| Auction Status | `AuctionStatus`  | 🟢 Live / 🔴 Ended   |

### Import Pattern

```tsx
// Import from barrel export
import {
  Price,
  DateDisplay,
  PaymentStatus,
  Rating,
} from "@/components/common/values";
```

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
| Value components  | `src/components/common/values/`                            |
| Services          | `src/services/`                                            |
| Types             | `src/types/frontend/`, `src/types/backend/`                |
| Wizard components | `src/components/seller/product-wizard/`, `auction-wizard/` |
| Image wrapper     | `src/components/common/OptimizedImage.tsx`                 |

### Recent Changes (December 2025 - January 2025)

1. **Wizard Simplification**: Product/Auction wizards reduced to 2 steps (Required → Optional)
2. **Modular Step Components**: Each wizard step is now a separate component
3. **WizardSteps/WizardActionBar**: Reusable form components for all wizards
4. **OptimizedImage**: Use instead of raw `<img>` tags for automatic optimization
5. **FormField/FormInput**: Use instead of raw `<label>` + `<input>` for consistency
6. **Value Display Components**: Use `Price`, `DateDisplay`, `Rating`, `PaymentStatus`, etc. from `@/components/common/values/`
7. **MainNavBar Light Mode**: White background in light mode, dark in dark mode
8. **Messages/Notifications**: Separate icons with badges in navbar
9. **New Value Components (Dec 2025)**: Added `Quantity`, `Weight`, `Dimensions`, `SKU`, `BidCount`, `TimeRemaining`, `Percentage`, `TruncatedText`, `AuctionStatus`
10. **AuctionCard Fix**: Fixed badge confusion - now properly shows Live/Ended/Upcoming states
11. **Products Page Filters**: Sort and view toggles now sync with URL searchParams
12. **Form Component Migrations**: Seller product edit, orders shipping form, CategorySelectorWithCreate, ShopSelector, ShopInlineForm migrated to FormInput/FormSelect
13. **Dark Mode Additions**: User reviews page, seller products edit page now have full dark mode support
14. **Admin Form Migrations (Dec 2025)**: Admin shops edit (20+ fields), admin support tickets (4 fields), admin products edit (remaining fields)
15. **Component Form Migrations (Dec 2025)**: MediaMetadataForm (5 fields), InlineCategorySelectorWithCreate (3 fields)
16. **Public Page Form Migrations (Dec 2025)**: Auctions detail page bid form now uses FormInput
17. **Seller Shop Create Wizard (Dec 2025)**: All 5 steps migrated to FormInput/FormTextarea with dark mode
18. **Major Label Migration (Jan 2025)**: All raw `<label>` elements migrated with dark mode (`dark:text-gray-300`):
    - User pages: `riplimit`, `reviews`
    - Seller pages: `analytics`, `my-shops/create`
    - Seller components: `AuctionForm`, `ShopForm`
    - Product components: `ReviewForm`, `ProductInfo`, `CartSummary`, `AutoBidSetup`
    - Admin components: `CategoryForm`, `coupons/create`, `coupons/edit`, `blog/create`, `blog/edit`, `homepage`, `products/edit`, `categories/create`, `hero-slides/edit`

### Don't Do

- ❌ Don't use mocks - APIs are ready
- ❌ Don't create documentation files unless asked
- ❌ Don't use `getById()` for public/seller URLs - use `getBySlug()`
- ❌ Don't hardcode API paths - use constants from `api-routes.ts`
- ❌ Don't use raw `<img>` tags - use `OptimizedImage` component
- ❌ Don't use raw `<label>` + `<input>` - use `FormField` + `FormInput`
- ❌ Don't manually format prices - use `Price` or `CompactPrice` components
- ❌ Don't manually format dates - use `DateDisplay` or `RelativeDate` components
- ❌ Don't inline status badge styles - use `PaymentStatus`, `ShippingStatus`, `StockStatus`
- ❌ Don't maintain legacy code - delete old patterns entirely
- ❌ Don't try to find orphaned code - rewrite the file instead
