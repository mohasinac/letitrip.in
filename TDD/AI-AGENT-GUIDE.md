# AI Agent Guide

> **Last Updated**: December 4, 2025
> **Build Status**: ✅ PASSING - Ready for Release

## 🚀 Quick Start Checklist

**Before writing ANY code, check these:**

1. ✅ **Use existing hooks**: `useLoadingState`, `useDebounce`, `useFilters`, `useAdminLoad`
2. ✅ **Use existing components**: `AdminResourcePage`, `StatsCardGrid`, `UnifiedFilterSidebar`
3. ✅ **Use value components**: `<Price />`, `<DateDisplay />`, `<StatusBadge />`
4. ✅ **Use constants**: `COLLECTIONS.*`, `ROUTES.*`, `QUERY_LIMITS.*`, `VALIDATION_RULES.*`, `VALIDATION_MESSAGES.*`
5. ✅ **Use validation helpers**: `isValidEmail()`, `isValidPhone()`, `isValidPassword()`
6. ✅ **Include dark mode**: Add `dark:*` variants to all colors
7. ✅ **Use services**: Call `productsService.getBySlug()` not `fetch()`
8. ✅ **Debounce searches**: Use `useDebounce(searchTerm, 300)`
9. ✅ **Check file size**: Split if >350 lines (use `AdminResourcePage` for lists)

## 🎯 Priority Rules

**When you see this pattern → Use this instead:**

| ❌ Don't Do This                          | ✅ Do This Instead                            |
| ----------------------------------------- | --------------------------------------------- |
| Manual `loading`, `error`, `data` states  | `useLoadingState()` hook                      |
| Hardcoded `"users"`, `"products"` strings | `COLLECTIONS.USERS`, `COLLECTIONS.PRODUCTS`   |
| Hardcoded Zod: `.min(2, "Too short")`     | `VALIDATION_RULES.*`, `VALIDATION_MESSAGES.*` |
| Manual `₹{price.toLocaleString()}`        | `<Price amount={price} />`                    |
| Manual `new Date().toLocaleDateString()`  | `<DateDisplay date={date} />`                 |
| Raw `<img>` tag                           | `<OptimizedImage />`                          |
| Raw `<label>` + `<input>`                 | `<FormField>` + `<FormInput>`                 |
| Custom pagination logic (200+ lines)      | Sieve middleware                              |
| No debounce on search                     | `useDebounce(searchTerm, 300)`                |
| `bg-white` without dark mode              | `bg-white dark:bg-gray-800`                   |
| Admin list page with 600-900 lines        | `<AdminResourcePage />` wrapper               |
| `console.log()` for errors                | `logError()` from error logger                |

---

## Quick Reference for AI Coding Agents

### Before Making Changes

1. Read existing code patterns before editing
2. Check `src/constants/routes.ts` for route constants
3. Check `src/constants/api-routes.ts` for API endpoints
4. Use existing services from `src/services/`
5. **Use wrapper components** - See "HTML Tag Wrappers" and "Value Display Components" sections below
6. **Use loading state hooks** - Use `useLoadingState` from `src/hooks/useLoadingState.ts` for data fetching
7. **Use constants over hardcoded strings** - Use `COLLECTIONS` and `FIELDS` from `src/constants/database.ts`
8. **Check for reusable components** - Before creating new components, check if similar ones exist
9. **Split large files** - Files over 350 lines should be split into smaller, focused components
10. **Use Sieve pagination** - For all list endpoints, use Sieve middleware from `src/app/api/lib/sieve/`

### Migration Status

✅ **Price Component Migration Complete** - All inline `₹{amount.toLocaleString()}` patterns have been migrated to use `<Price amount={} />` or `<CompactPrice amount={} />` components. See [Doc 32](../../docs/32-common-value-components.md) for full migration details.

✅ **Dark Mode Support** - All major pages now have dark mode support. Always include `dark:` variants for background, text, and border colors.

✅ **COLLECTIONS Migration (95% Complete)** - Most API routes now use `COLLECTIONS` constant instead of hardcoded collection names.

✅ **useLoadingState Migration (45+ pages)** - Admin, seller, and user pages migrated to use `useLoadingState` hook.

✅ **StatsCard Dark Mode** - All dashboard stats cards now support dark mode via `StatsCardGrid` component.

✅ **Validation Constants Created** - `VALIDATION_RULES` and `VALIDATION_MESSAGES` constants available. Migration to use in Zod schemas and API routes is in progress (Task 25).

### Code Style & Standards

### File Size Guidelines

**CRITICAL**: Keep files manageable by following these limits:

| File Type      | Lines   | Action Required                   |
| -------------- | ------- | --------------------------------- |
| Page Component | >500    | Use reusable component or split   |
| Page Component | 350-500 | Review and consider splitting     |
| Component      | >300    | Split into smaller sub-components |
| Service        | >400    | Split by feature/responsibility   |
| Utility        | >200    | Split into separate modules       |

**Before creating a new component**:

1. Check if `AdminResourcePage` or `SellerResourcePage` can be used
2. Check for existing similar components in `src/components/common/`
3. Check for existing hooks in `src/hooks/`

### URLs/Routes

- **Public URLs**: Use slugs for SEO (`/products/[slug]`, `/auctions/[slug]`)
- **Seller URLs**: Use slugs for resources (`/seller/auctions/[slug]/edit`)
- **Admin URLs**: Use IDs for resources (`/admin/users/[id]`)
- **API calls**: Use service methods (`auctionsService.getBySlug(slug)`)

### Component Selection

**Use these components instead of creating new ones**:

| Task                       | Component to Use                  |
| -------------------------- | --------------------------------- |
| Admin list page            | `AdminResourcePage`               |
| Seller list page           | `SellerResourcePage`              |
| Content type filter        | `ContentTypeFilter`               |
| Filtering sidebar          | `UnifiedFilterSidebar`            |
| Form fields                | `FormField` + `FormInput`         |
| Value display              | `Price`, `DateDisplay`, etc.      |
| Dashboard stats            | `StatsCard`, `StatsCardGrid`      |
| Settings sections          | `SettingsSection`                 |
| Analytics period selection | `PeriodSelector`                  |
| Pagination                 | `SimplePagination`                |
| Status badges              | `StatusBadge`                     |
| Confirmation dialogs       | `ConfirmDialog`                   |
| Loading states             | `LoadingSpinner`                  |
| Empty states               | `EmptyState`                      |
| Table actions              | `InlineEditRow`, `QuickCreateRow` |

### Service Pattern

```typescript
// ✅ Correct - use service with slug
const auction = await auctionsService.getBySlug(params.slug);

// ✅ Correct - use route constants for links
import { SELLER_ROUTES } from '@/constants/routes';
href={SELLER_ROUTES.AUCTION_EDIT(auction.slug)}

// ✅ Correct - use collection constants
import { COLLECTIONS } from '@/constants/database';
db.collection(COLLECTIONS.PRODUCTS)
```

### Naming Conventions

```typescript
// Components: PascalCase
ProductCard.tsx;
UserProfile.tsx;

// Hooks: camelCase with 'use' prefix
useLoadingState.ts;
useDebounce.ts;

// Services: camelCase with '.service' suffix
products.service.ts;
auth.service.ts;

// Utils: camelCase with '.ts' suffix
formatters.ts;
validators.ts;

// Constants: UPPER_SNAKE_CASE
COLLECTIONS.PRODUCTS;
QUERY_LIMITS.DEFAULT;
```

### Import Order

```typescript
// 1. React & Next.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party libraries
import { TrendingUp, ShoppingCart } from "lucide-react";

// 3. Project imports (absolute paths with @/)
import { useAuth } from "@/contexts/AuthContext";
import { productsService } from "@/services/products.service";
import { COLLECTIONS } from "@/constants/database";

// 4. Components
import ProductCard from "@/components/cards/ProductCard";
import { Price, DateDisplay } from "@/components/common/values";

// 5. Types
import type { Product } from "@/types/frontend/product";

// 6. Relative imports (avoid when possible)
import { helper } from "./utils";
```

---

## Reusable Hooks (CRITICAL - USE THESE!)

**Always use the existing hooks for common patterns**. These eliminate 60-80% of boilerplate code:

### Data Fetching & Loading States

```tsx
// ✅ For loading/error/data state management (MOST IMPORTANT)
import { useLoadingState } from "@/hooks/useLoadingState";
const { data, isLoading, error, execute } = useLoadingState<DataType>({
  initialData: [], // optional default
});

// Use in useEffect
useEffect(() => {
  execute(() => service.getData());
}, []);

// ✅ For multiple parallel loading states
import { useMultiLoadingState } from "@/hooks/useLoadingState";
const { states, execute } = useMultiLoadingState();
```

### Search & Filtering

```tsx
// ✅ For debounced values (search, filters)
import {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
} from "@/hooks/useDebounce";
const debouncedSearch = useDebounce(searchTerm, 300);
const debouncedFn = useDebouncedCallback(handleSearch, 300);
const throttledValue = useThrottle(value, 1000);

// ✅ For filter state with URL sync
import { useFilters } from "@/hooks/useFilters";
const { filters, appliedFilters, applyFilters, resetFilters } = useFilters(
  { status: "", sort: "-createdAt" },
  { syncWithUrl: true }
);
```

### Admin & Seller Data Loading

```tsx
// ✅ For admin-specific data loading with role check
import { useAdminLoad } from "@/hooks/useSafeLoad";
useAdminLoad(loadData, {
  user: currentUser,
  requiredRole: "admin",
  deps: [filter1, filter2],
});

// ✅ For safe data loading with dependencies
import { useSafeLoad } from "@/hooks/useSafeLoad";
useSafeLoad(loadData, {
  user: currentUser,
  deps: [dependency1],
});
```

### Form & Validation

```tsx
// ✅ For slug validation with availability check
import { useSlugValidation } from "@/hooks/useSlugValidation";
const { slug, isChecking, isAvailable, error } = useSlugValidation(
  name,
  "products"
);

// ✅ For unsaved changes protection
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
const { isDirty, confirmNavigation } = useNavigationGuard(hasChanges);
```

### Media & Upload

```tsx
// ✅ For image/file upload handling
import { useMediaUpload } from "@/hooks/useMediaUpload";
const { upload, uploading, progress } = useMediaUpload();
```

### UI & Responsive

```tsx
// ✅ For mobile detection
import { useMobile } from "@/hooks/useMobile";
const isMobile = useMobile();

// ✅ For cart operations
import { useCart } from "@/hooks/useCart";
const { cart, addToCart, removeFromCart } = useCart();

// ✅ For header stats (cart count, notifications)
import { useHeaderStats } from "@/hooks/useHeaderStats";
const { cartCount, notificationCount } = useHeaderStats();
```

### Available Hooks Summary

| Hook                   | Location                          | Purpose                             | Status           |
| ---------------------- | --------------------------------- | ----------------------------------- | ---------------- |
| `useLoadingState`      | `src/hooks/useLoadingState.ts`    | Loading/error/data state management | ✅ USE THIS      |
| `useMultiLoadingState` | `src/hooks/useLoadingState.ts`    | Multiple parallel loading states    | ✅ USE THIS      |
| `useDebounce`          | `src/hooks/useDebounce.ts`        | Debounce values (search, filters)   | ✅ USE THIS      |
| `useDebouncedCallback` | `src/hooks/useDebounce.ts`        | Debounce function calls             | ✅ USE THIS      |
| `useThrottle`          | `src/hooks/useDebounce.ts`        | Throttle rapid updates              | ✅ USE THIS      |
| `useApi`               | `src/hooks/useDebounce.ts`        | API calls with retry & debounce     | ⚠️ Use with care |
| `useFilters`           | `src/hooks/useFilters.ts`         | Filter state with URL sync          | ✅ USE THIS      |
| `useSafeLoad`          | `src/hooks/useSafeLoad.ts`        | Safe data loading with dependencies | ✅ USE THIS      |
| `useAdminLoad`         | `src/hooks/useSafeLoad.ts`        | Admin-specific data loading         | ✅ USE THIS      |
| `useMobile`            | `src/hooks/useMobile.ts`          | Mobile detection                    | ✅ USE THIS      |
| `useMediaUpload`       | `src/hooks/useMediaUpload.ts`     | Image/file upload handling          | ✅ USE THIS      |
| `useSlugValidation`    | `src/hooks/useSlugValidation.ts`  | Slug uniqueness checking            | ✅ USE THIS      |
| `useNavigationGuard`   | `src/hooks/useNavigationGuard.ts` | Unsaved changes protection          | ✅ USE THIS      |
| `useCart`              | `src/hooks/useCart.ts`            | Cart operations                     | ✅ USE THIS      |
| `useHeaderStats`       | `src/hooks/useHeaderStats.ts`     | Header counts (cart, notifications) | ✅ USE THIS      |

### Anti-Pattern Examples

```tsx
// ❌ BAD - Manual loading state (30+ lines of boilerplate)
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<T | null>(null);

const loadData = async () => {
  setLoading(true);
  setError(null);
  try {
    const result = await service.getData();
    setData(result);
  } catch (e) {
    setError(e.message);
  } finally {
    setLoading(false);
  }
};

// ✅ GOOD - Use hook (3 lines)
const { data, isLoading, error, execute } = useLoadingState<T>();
useEffect(() => {
  execute(() => service.getData());
}, []);
```

```tsx
// ❌ BAD - Manual debounce (15+ lines)
const [searchTerm, setSearchTerm] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm);
  }, 300);
  return () => clearTimeout(timer);
}, [searchTerm]);

// ✅ GOOD - Use hook (1 line)
const debouncedSearch = useDebounce(searchTerm, 300);
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

## Database Constants (CRITICAL - USE THESE!)

**Always use constants instead of hardcoded strings** for collection and field names:

```typescript
// ❌ BAD - Hardcoded collection names
const docRef = await db.collection("users").doc(userId).get();
const products = await db
  .collection("products")
  .where("status", "==", "published")
  .get();

// ✅ GOOD - Use COLLECTIONS constant
import { COLLECTIONS } from "@/constants/database";
const docRef = await db.collection(COLLECTIONS.USERS).doc(userId).get();
const products = await db
  .collection(COLLECTIONS.PRODUCTS)
  .where("status", "==", "published")
  .get();
```

### Available Collections

```typescript
// Main Collections
COLLECTIONS.USERS;
COLLECTIONS.PRODUCTS;
COLLECTIONS.AUCTIONS;
COLLECTIONS.ORDERS;
COLLECTIONS.SHOPS;
COLLECTIONS.CATEGORIES;
COLLECTIONS.REVIEWS;
COLLECTIONS.SUPPORT_TICKETS;
COLLECTIONS.COUPONS;
COLLECTIONS.ADDRESSES;
COLLECTIONS.PAYMENTS;
COLLECTIONS.PAYOUTS;
COLLECTIONS.RETURNS;
COLLECTIONS.REFUNDS;
COLLECTIONS.BIDS;
COLLECTIONS.NOTIFICATIONS;
COLLECTIONS.CONVERSATIONS;
COLLECTIONS.MESSAGES;
COLLECTIONS.SESSIONS;

// Settings Collections
COLLECTIONS.SITE_SETTINGS;
COLLECTIONS.PAYMENT_SETTINGS;
COLLECTIONS.SHIPPING_ZONES;
COLLECTIONS.SHIPPING_CARRIERS;
COLLECTIONS.EMAIL_TEMPLATES;
COLLECTIONS.EMAIL_SETTINGS;
COLLECTIONS.NOTIFICATION_SETTINGS;
COLLECTIONS.FEATURE_FLAGS;
COLLECTIONS.BUSINESS_RULES;
COLLECTIONS.RIPLIMIT_SETTINGS;
COLLECTIONS.ANALYTICS_SETTINGS;
COLLECTIONS.HOMEPAGE_SETTINGS;

// Subcollections
SUBCOLLECTIONS.SHOP_FOLLOWING;
SUBCOLLECTIONS.SHOP_SETTINGS;
SUBCOLLECTIONS.REVIEW_HELPFUL_VOTES;
SUBCOLLECTIONS.TICKET_MESSAGES;
```

### Query Limits

```typescript
// ✅ Use query limits for pagination
import { QUERY_LIMITS } from "@/constants/database";

const query = db.collection(COLLECTIONS.PRODUCTS).limit(QUERY_LIMITS.DEFAULT); // 20 items

// Available limits
QUERY_LIMITS.DEFAULT = 20;
QUERY_LIMITS.SMALL = 10;
QUERY_LIMITS.LARGE = 50;
QUERY_LIMITS.MAX = 100;
```

---

## Reusable Components (CHECK BEFORE CREATING!)

**Before creating a new component, check if a reusable one exists**. These components are designed to work across multiple pages:

### Admin & Seller List Pages

```tsx
// ✅ Use for admin/seller list pages (reduces 600-900 lines to 150 lines!)
import AdminResourcePage from "@/components/admin/AdminResourcePage";

<AdminResourcePage
  resourceName="products"
  service={productsService}
  fields={PRODUCT_FIELDS}
  bulkActions={getProductBulkActions}
  filters={PRODUCT_FILTERS}
  renderRow={(item, editing) => <ProductRow item={item} editing={editing} />}
  renderCard={(item) => <ProductCard item={item} />}
/>;
```

### Table Components

```tsx
// ✅ For inline editing in tables
import InlineEditRow from "@/components/common/InlineEditRow";

// ✅ For quick create in tables
import QuickCreateRow from "@/components/common/QuickCreateRow";

// ✅ For bulk actions
import BulkActionBar from "@/components/common/BulkActionBar";

// ✅ For table checkboxes
import TableCheckbox from "@/components/common/TableCheckbox";
```

### Filtering & Navigation

```tsx
// ✅ For filtering with sidebar
import UnifiedFilterSidebar from "@/components/common/UnifiedFilterSidebar";

// ✅ For view toggle (grid/table)
import ViewToggle from "@/components/seller/ViewToggle";

// ✅ For pagination
import SimplePagination from "@/components/common/SimplePagination";
import CursorPagination from "@/components/common/CursorPagination";
```

### Dashboard & Stats

```tsx
// ✅ For statistics cards
import { StatsCard, StatsCardGrid } from "@/components/common/StatsCard";

<StatsCardGrid>
  <StatsCard
    title="Total Sales"
    value="₹1.5L"
    trend={{ value: 12, isPositive: true }}
  />
  <StatsCard title="Orders" value="150" icon={ShoppingCart} />
</StatsCardGrid>;
```

### Settings Pages

```tsx
// ✅ For settings sections
import SettingsSection from "@/components/settings/SettingsSection";

<SettingsSection
  title="Payment Settings"
  description="Configure payment providers"
>
  {/* Form fields */}
</SettingsSection>;
```

### Dialogs & Modals

```tsx
// ✅ For confirmation dialogs
import ConfirmDialog from "@/components/common/ConfirmDialog";

// ✅ For status badges
import StatusBadge from "@/components/common/StatusBadge";
```

### Available Reusable Components

| Component              | Location                                         | Used For                    |
| ---------------------- | ------------------------------------------------ | --------------------------- |
| `AdminResourcePage`    | `src/components/admin/AdminResourcePage.tsx`     | All admin list pages        |
| `SellerResourcePage`   | `src/components/seller/SellerResourcePage.tsx`   | All seller list pages       |
| `InlineEditRow`        | `src/components/common/InlineEditRow.tsx`        | Table inline editing        |
| `QuickCreateRow`       | `src/components/common/QuickCreateRow.tsx`       | Table quick create          |
| `BulkActionBar`        | `src/components/common/BulkActionBar.tsx`        | Bulk actions                |
| `TableCheckbox`        | `src/components/common/TableCheckbox.tsx`        | Table row selection         |
| `UnifiedFilterSidebar` | `src/components/common/UnifiedFilterSidebar.tsx` | Filtering                   |
| `ViewToggle`           | `src/components/seller/ViewToggle.tsx`           | Grid/table view switch      |
| `StatusBadge`          | `src/components/common/StatusBadge.tsx`          | Status indicators           |
| `ConfirmDialog`        | `src/components/common/ConfirmDialog.tsx`        | Delete/action confirmations |
| `StatsCard`            | `src/components/common/StatsCard.tsx`            | Dashboard stats             |
| `StatsCardGrid`        | `src/components/common/StatsCard.tsx`            | Dashboard stats grid        |
| `SimplePagination`     | `src/components/common/SimplePagination.tsx`     | Simple page navigation      |
| `SettingsSection`      | `src/components/settings/SettingsSection.tsx`    | Settings page sections      |
| `PeriodSelector`       | `src/components/common/PeriodSelector.tsx`       | Analytics period selection  |
| `ResourcePageHeader`   | `src/components/common/ResourcePageHeader.tsx`   | Page headers with actions   |
| `PolicyPage`           | `src/components/common/PolicyPage.tsx`           | Legal/policy pages          |
| `TransactionList`      | `src/components/common/TransactionList.tsx`      | Transaction history         |
| `AdminPageHeader`      | `src/components/admin/AdminPageHeader.tsx`       | Admin page headers          |
| `LoadingSpinner`       | `src/components/admin/LoadingSpinner.tsx`        | Loading states              |

---

## Common Problems & Solutions

### 1. Large File Syndrome

**Problem**: Files over 350+ lines become hard to maintain.

**Solution**: Check for reusable components FIRST, then split into modular components.

```
// Step 1: Check if AdminResourcePage or SellerResourcePage can be used
// These reduce 600-900 line files to 150 lines!

// Step 2: If unique functionality needed, split into components
// Before: /seller/products/create/page.tsx (898 lines)

// After:
src/components/seller/product-wizard/
├── types.ts              # Form data interface
├── RequiredInfoStep.tsx  # Step 1 component
├── OptionalDetailsStep.tsx # Step 2 component
└── index.ts              # Barrel exports

/seller/products/create/page.tsx (297 lines)
```

**Files Requiring Immediate Splitting** (>500 lines):

| File                                   | Lines | Solution                                      |
| -------------------------------------- | ----- | --------------------------------------------- |
| `src/app/admin/users/page.tsx`         | 976   | Use `AdminResourcePage` wrapper               |
| `src/app/admin/homepage/page.tsx`      | 839   | Split into SectionManager components          |
| `src/app/admin/riplimit/page.tsx`      | 828   | Split into Stats, Transactions, Accounts      |
| `src/app/admin/auctions/page.tsx`      | 777   | Use `AdminResourcePage` wrapper               |
| `src/app/admin/shops/page.tsx`         | 730   | Use `AdminResourcePage` wrapper               |
| `src/app/seller/settings/page.tsx`     | 712   | Split into ProfileSettings, PaymentSettings   |
| `src/app/admin/categories/page.tsx`    | 686   | Use `AdminResourcePage` wrapper               |
| `src/app/admin/products/page.tsx`      | 679   | Use `AdminResourcePage` wrapper               |
| `src/app/seller/products/page.tsx`     | 652   | Use `SellerResourcePage` wrapper              |
| `src/components/media/ImageEditor.tsx` | 655   | Split into CropTool, FilterPanel, Adjustments |

### 2. Hardcoded Collection Names

**Problem**: API routes using hardcoded collection names instead of constants.

**Solution**: Always use `COLLECTIONS` constant.

```typescript
// ❌ BAD - Hardcoded (found in 20+ files)
const users = await db.collection("users").get();
const products = await db
  .collection("products")
  .where("status", "==", "published")
  .get();

// ✅ GOOD - Use constants
import { COLLECTIONS } from "@/constants/database";
const users = await db.collection(COLLECTIONS.USERS).get();
const products = await db
  .collection(COLLECTIONS.PRODUCTS)
  .where("status", "==", "published")
  .get();
```

### 3. Manual Pagination Instead of Sieve

**Problem**: Each list endpoint has custom pagination logic (200+ lines of repeated code).

**Solution**: Use Sieve middleware for all list endpoints.

```typescript
// ❌ BAD - Custom pagination (200+ lines per endpoint)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  // ... 150+ lines of query logic
}

// ✅ GOOD - Use Sieve middleware (10 lines per endpoint)
import { withSieve } from "@/app/api/lib/sieve-middleware";
import { productsSieveConfig } from "@/app/api/lib/sieve/config";

export const GET = withSieve(productsSieveConfig, {
  collection: "products",
  mandatoryFilters: [sieveFilters.published()],
  transform: transformProductToFrontend,
});
```

### 4. Missing Debouncing on API Calls

**Problem**: Search inputs and filters trigger API calls on every keystroke.

**Solution**: Use `useDebounce` hook for all search/filter inputs.

```tsx
// ❌ BAD - No debounce (dozens of unnecessary API calls)
<input
  value={searchTerm}
  onChange={(e) => {
    setSearchTerm(e.target.value);
    searchAPI(e.target.value); // Called on EVERY keystroke!
  }}
/>;

// ✅ GOOD - Use debounce hook
import { useDebounce } from "@/hooks/useDebounce";

const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 300);

useEffect(() => {
  if (debouncedSearch) {
    searchAPI(debouncedSearch); // Called only after user stops typing
  }
}, [debouncedSearch]);
```

### 5. Orphaned Code After Refactoring

**Problem**: Old code remains after simplifying wizard steps.

**Solution**: Don't try to find orphaned code. **Rewrite the entire file** - it's faster and cleaner.

```typescript
// ❌ Bad - trying to find and remove old step 3, 4, 5, 6 content
// Leads to partial removal and broken files

// ✅ Good - rewrite the file with only needed content
// Creates clean, minimal code
```

### 6. Dark Mode Missing

**Problem**: Components don't work in dark mode (50+ instances found).

**Solution**: Always include dark mode variants:

```tsx
// ❌ BAD - No dark mode
className = "bg-white text-gray-900 border-gray-200";

// ✅ GOOD - Include dark mode classes
className =
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700";
```

**Common Dark Mode Patterns**:

```tsx
// Backgrounds
"bg-white dark:bg-gray-800";
"bg-gray-50 dark:bg-gray-900";
"bg-gray-100 dark:bg-gray-800";

// Text
"text-gray-900 dark:text-white";
"text-gray-600 dark:text-gray-300";
"text-gray-500 dark:text-gray-400";

// Borders
"border-gray-200 dark:border-gray-700";
"border-gray-300 dark:border-gray-600";

// Hover states
"hover:bg-gray-100 dark:hover:bg-gray-700";
```

### 7. No Legacy Support Policy

**Problem**: Old patterns need to coexist with new patterns.

**Solution**: **Don't maintain backward compatibility.** Delete old files and patterns entirely.

```typescript
// ❌ Bad - keeping old getById() alongside new getBySlug()
// ✅ Good - remove getById(), use only getBySlug()
```

### 8. Console Logs in Production

**Problem**: Debug console.log statements left in production code (20+ instances).

**Solution**: Remove all console.log or use proper error logging.

```typescript
// ❌ BAD - Console logs in production
console.log("Loading products...");
console.error("Failed to load:", error);

// ✅ GOOD - Use error logger
import { logError } from "@/lib/firebase-error-logger";
logError(error, { context: "products", userId });

// ✅ GOOD - Remove debug logs entirely
// (Just delete them)
```

### 9. Inline Date/Price Formatting

**Problem**: Manual formatting scattered across 100+ files.

**Solution**: Use value display components.

```tsx
// ❌ BAD - Manual formatting
<span>₹{price.toLocaleString("en-IN")}</span>
<span>{new Date(createdAt).toLocaleDateString()}</span>

// ✅ GOOD - Use components
import { Price, DateDisplay } from "@/components/common/values";
<Price amount={price} />
<DateDisplay date={createdAt} />
```

### 10. Type Safety Issues

**Problem**: Unsafe `as unknown as` casts (16+ instances).

**Solution**: Use proper type definitions or type guards.

```typescript
// ❌ BAD - Unsafe cast
const data = result as unknown as MyType;

// ✅ GOOD - Proper type guard
function isMyType(obj: any): obj is MyType {
  return obj && typeof obj.id === "string";
}

const data = isMyType(result) ? result : null;
```

---

## Implementation Priority Guidelines

When working on tasks, follow this priority order:

### Phase 1: Use Existing Reusable Components (HIGHEST PRIORITY)

- Check if `AdminResourcePage`, `SellerResourcePage`, or other reusable components exist
- Use existing hooks (`useLoadingState`, `useDebounce`, `useFilters`)
- Use existing value components (`Price`, `DateDisplay`, `StatusBadge`)
- **Impact**: Reduces code by 60-80%

### Phase 2: Database & API Consistency

- Replace hardcoded collection names with `COLLECTIONS` constant
- Use Sieve middleware for pagination
- Add debouncing to search/filter inputs
- **Impact**: Prevents bugs, improves performance

### Phase 3: Dark Mode & Mobile Support

- Add `dark:` variants to all background, text, and border colors
- Test on mobile devices
- Ensure touch targets are 44px minimum
- **Impact**: Better UX across devices

### Phase 4: Split Large Files

- Files >500 lines: Use reusable components or split immediately
- Files 350-500 lines: Review and consider splitting
- Extract shared patterns into components
- **Impact**: Better maintainability

### Phase 5: Performance Optimization

- Remove console.log statements
- Add proper error logging
- Implement caching where appropriate
- Use query limits for pagination
- **Impact**: Production-ready code

---

## Key Files Reference

| Purpose              | Location                                                        |
| -------------------- | --------------------------------------------------------------- |
| Page routes          | `src/constants/routes.ts`                                       |
| API routes           | `src/constants/api-routes.ts`                                   |
| Database constants   | `src/constants/database.ts`                                     |
| Validation constants | `src/constants/validation-messages.ts` ⭐ **USE THIS**          |
| Filter definitions   | `src/constants/filters.ts`                                      |
| Form field configs   | `src/constants/form-fields.ts`, `inline-fields.ts`              |
| Bulk actions         | `src/constants/bulk-actions.ts`                                 |
| Zod schemas          | `src/lib/validations/*.schema.ts` (⚠️ Migrate to use constants) |
| Form components      | `src/components/forms/`                                         |
| Value components     | `src/components/common/values/`                                 |
| Reusable components  | `src/components/common/`, `src/components/admin/`               |
| Hooks                | `src/hooks/`                                                    |
| Services             | `src/services/`                                                 |
| Types                | `src/types/frontend/`, `src/types/backend/`                     |
| Sieve middleware     | `src/app/api/lib/sieve/`                                        |
| Error logging        | `src/lib/firebase-error-logger.ts`                              |
| Wizard components    | `src/components/seller/product-wizard/`, `auction-wizard/`      |
| Image wrapper        | `src/components/common/OptimizedImage.tsx`                      |

## Utility Functions (USE THESE!)

**Always use utility functions** instead of reimplementing common logic:

### Formatting Utilities

```typescript
// Import from lib/formatters.ts
import {
  formatCurrency, // ₹1,499
  formatCompactCurrency, // ₹1.5L
  formatDate, // Dec 2, 2025
  formatRelativeTime, // 2 hours ago
  formatNumber, // 1,499
  formatCompactNumber, // 1.5K
  formatPercentage, // 25%
  formatPhoneNumber, // +91 98765 43210
  formatFileSize, // 1.5 MB
  formatDuration, // 2h 30m
  formatOrderId, // #ORD-ABC123
  formatTimeRemaining, // 2d 5h 30m
  formatAddress, // Full address formatting
  truncateText, // Text with ellipsis
  slugToTitle, // slug-text → Slug Text
} from "@/lib/formatters";

// Example usage
const price = formatCurrency(1499); // ₹1,499
const compactPrice = formatCompactCurrency(150000); // ₹1.5L
const date = formatDate(new Date()); // Dec 2, 2025
const relative = formatRelativeTime(createdAt); // 2 hours ago
```

### Class Name Utility

```typescript
// Import from lib/utils.ts
import { cn } from "@/lib/utils";

// Merge Tailwind classes with conditional logic
const buttonClass = cn(
  "px-4 py-2 rounded",
  isPrimary && "bg-blue-600 text-white",
  isDisabled && "opacity-50 cursor-not-allowed",
  className // Allow override
);
```

### Validation Utilities (CRITICAL - USE THESE!)

**Always use centralized validation** instead of hardcoded Zod schemas or inline validation:

```typescript
// Import from constants/validation-messages.ts
import {
  VALIDATION_RULES, // Min/max lengths, patterns, ranges
  VALIDATION_MESSAGES, // Consistent error messages
  isValidEmail, // Email validation helper
  isValidPhone, // Phone validation helper
  isValidGST, // GST validation helper
  isValidPAN, // PAN validation helper
  isValidPassword, // Password strength checker
  validateFile, // File upload validator
} from "@/constants/validation-messages";

// ❌ BAD - Hardcoded Zod schema
const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
});

// ✅ GOOD - Use validation constants
const schema = z.object({
  name: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH, VALIDATION_MESSAGES.NAME.TOO_SHORT)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH, VALIDATION_MESSAGES.NAME.TOO_LONG),
  email: z
    .string()
    .regex(VALIDATION_RULES.EMAIL.PATTERN, VALIDATION_MESSAGES.EMAIL.INVALID),
  phone: z
    .string()
    .regex(VALIDATION_RULES.PHONE.PATTERN, VALIDATION_MESSAGES.PHONE.INVALID),
});

// ✅ GOOD - Use validation helpers
if (!isValidEmail(email)) {
  setError(VALIDATION_MESSAGES.EMAIL.INVALID);
}

const passwordCheck = isValidPassword(password);
if (!passwordCheck.valid) {
  setErrors(passwordCheck.errors); // Array of specific error messages
}
```

### Available Validation Constants

| Constant                | Purpose                       | Examples                                   |
| ----------------------- | ----------------------------- | ------------------------------------------ |
| `VALIDATION_RULES`      | Min/max, patterns, ranges     | `NAME.MIN_LENGTH`, `PHONE.PATTERN`         |
| `VALIDATION_MESSAGES`   | All error messages            | `EMAIL.INVALID`, `PRODUCT.NAME_TOO_SHORT`  |
| `isValidEmail()`        | Email validation              | Returns boolean                            |
| `isValidPhone()`        | Indian phone validation       | Returns boolean                            |
| `isValidGST()`          | GST number validation         | Returns boolean                            |
| `isValidPAN()`          | PAN validation                | Returns boolean                            |
| `isValidIFSC()`         | IFSC code validation          | Returns boolean                            |
| `isValidSlug()`         | URL slug validation           | Returns boolean                            |
| `isValidPassword()`     | Password strength check       | Returns `{valid: boolean, errors: []}`     |
| `validateFile()`        | File upload validation        | Returns `{valid: boolean, error?: string}` |
| `getPasswordStrength()` | Password strength score (0-4) | Returns number                             |

### Available Formatting Utilities

| Function                  | Location                | Purpose                  | Example Output      |
| ------------------------- | ----------------------- | ------------------------ | ------------------- |
| `cn()`                    | `src/lib/utils.ts`      | Tailwind class merging   | -                   |
| `formatCurrency()`        | `src/lib/formatters.ts` | Price formatting         | ₹1,499              |
| `formatCompactCurrency()` | `src/lib/formatters.ts` | Compact price            | ₹1.5L               |
| `formatDate()`            | `src/lib/formatters.ts` | Date formatting          | Dec 2, 2025         |
| `formatRelativeTime()`    | `src/lib/formatters.ts` | "2 hours ago"            | 2 hours ago         |
| `formatNumber()`          | `src/lib/formatters.ts` | Number formatting        | 1,499               |
| `formatCompactNumber()`   | `src/lib/formatters.ts` | 1.5K, 2.3M               | 1.5K                |
| `formatPercentage()`      | `src/lib/formatters.ts` | Percentage display       | 25%                 |
| `formatPhoneNumber()`     | `src/lib/formatters.ts` | Phone formatting         | +91 98765 43210     |
| `formatFileSize()`        | `src/lib/formatters.ts` | 1.5 MB                   | 1.5 MB              |
| `formatDuration()`        | `src/lib/formatters.ts` | 2h 30m                   | 2h 30m              |
| `formatOrderId()`         | `src/lib/formatters.ts` | #ORD-ABC123              | #ORD-ABC123         |
| `formatTimeRemaining()`   | `src/lib/formatters.ts` | Countdown display        | 2d 5h 30m           |
| `formatAddress()`         | `src/lib/formatters.ts` | Address formatting       | Full address string |
| `truncateText()`          | `src/lib/formatters.ts` | Text truncation          | Long text...        |
| `slugToTitle()`           | `src/lib/formatters.ts` | Slug to title conversion | Slug Text           |

---

## Context Providers (USE THESE!)

**Use existing contexts** instead of prop drilling or creating new state management:

### Available Contexts

```typescript
// Authentication & User
import { useAuth } from "@/contexts/AuthContext";
const { user, isAdmin, isSeller, isLoading, login, logout } = useAuth();

// Theme (Dark/Light Mode)
import { useTheme } from "@/contexts/ThemeContext";
const { theme, toggleTheme, isDark } = useTheme();

// Product Comparison
import { useComparison } from "@/contexts/ComparisonContext";
const { items, addToComparison, removeFromComparison } = useComparison();

// File Upload Progress
import { useUpload } from "@/contexts/UploadContext";
const { uploadFile, progress, isUploading } = useUpload();

// Viewing History
import { useViewingHistory } from "@/contexts/ViewingHistoryContext";
const { history, addToHistory, clearHistory } = useViewingHistory();
```

| Context                 | Location                                 | Purpose                    | Hydration Safe |
| ----------------------- | ---------------------------------------- | -------------------------- | -------------- |
| `AuthContext`           | `src/contexts/AuthContext.tsx`           | User authentication & role | ✅ Yes         |
| `ThemeContext`          | `src/contexts/ThemeContext.tsx`          | Dark/light theme           | ✅ Yes         |
| `ComparisonContext`     | `src/contexts/ComparisonContext.tsx`     | Product comparison         | ⚠️ Check       |
| `UploadContext`         | `src/contexts/UploadContext.tsx`         | File upload state          | ⚠️ Check       |
| `ViewingHistoryContext` | `src/contexts/ViewingHistoryContext.tsx` | Recently viewed items      | ⚠️ Check       |

---

## Services Pattern (USE THESE!)

**Always use service layer** for API calls instead of direct fetch:

```typescript
// ✅ GOOD - Use service
import { productsService } from "@/services/products.service";
const product = await productsService.getBySlug(slug);

// ❌ BAD - Direct fetch
const response = await fetch(`/api/products/${id}`);
const product = await response.json();
```

### Available Services

| Service             | Location                             | Key Methods                               |
| ------------------- | ------------------------------------ | ----------------------------------------- |
| `productsService`   | `src/services/products.service.ts`   | `getBySlug()`, `getAll()`, `create()`     |
| `auctionsService`   | `src/services/auctions.service.ts`   | `getBySlug()`, `getAll()`, `placeBid()`   |
| `categoriesService` | `src/services/categories.service.ts` | `getAll()`, `getBySlug()`                 |
| `shopsService`      | `src/services/shops.service.ts`      | `getBySlug()`, `follow()`, `unfollow()`   |
| `ordersService`     | `src/services/orders.service.ts`     | `create()`, `getById()`, `updateStatus()` |
| `authService`       | `src/services/auth.service.ts`       | `login()`, `register()`, `logout()`       |
| `reviewsService`    | `src/services/reviews.service.ts`    | `create()`, `getAll()`, `markHelpful()`   |
| `emailService`      | `src/services/email.service.ts`      | `send()`, `sendTemplate()`                |
| `locationService`   | `src/services/location.service.ts`   | `getByPincode()`, `getCities()`           |
| `riplimitService`   | `src/services/riplimit.service.ts`   | `getBalance()`, `addFunds()`              |

---

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
18. **Major Label Migration (Jan 2025)**: All raw `<label>` elements migrated with dark mode (`dark:text-gray-300`)
19. **useLoadingState Migration (Dec 2025)**: 45+ pages migrated to use `useLoadingState` hook
20. **StatsCard Dark Mode (Dec 2025)**: All dashboard stats cards now support dark mode
21. **COLLECTIONS Migration (Dec 2025)**: 95%+ of API routes now use `COLLECTIONS` constant

## Coding Best Practices

### Data Fetching Patterns

```tsx
// ✅ ALWAYS use useLoadingState for data fetching
import { useLoadingState } from "@/hooks/useLoadingState";

const { data, isLoading, error, execute } = useLoadingState<Product[]>({
  initialData: [],
});

useEffect(() => {
  execute(() => productsService.getAll());
}, []);

// ✅ For admin pages, use useAdminLoad
import { useAdminLoad } from "@/hooks/useSafeLoad";

useAdminLoad(loadData, {
  user: currentUser,
  requiredRole: "admin",
  deps: [filter, sort],
});
```

### Pagination Patterns

```tsx
// ✅ For API endpoints, use Sieve middleware
import { withSieve } from "@/app/api/lib/sieve-middleware";

export const GET = withSieve(productsSieveConfig, {
  collection: COLLECTIONS.PRODUCTS,
  mandatoryFilters: [sieveFilters.published()],
});

// ✅ For frontend, use SimplePagination component
import SimplePagination from "@/components/common/SimplePagination";

<SimplePagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>;
```

### Filter Patterns

```tsx
// ✅ Use UnifiedFilterSidebar for list pages
import UnifiedFilterSidebar from "@/components/common/UnifiedFilterSidebar";
import { PRODUCT_FILTERS } from "@/constants/filters";

<UnifiedFilterSidebar
  filters={PRODUCT_FILTERS}
  onFilterChange={handleFilterChange}
/>;

// ✅ Use useFilters hook for URL sync
import { useFilters } from "@/hooks/useFilters";

const { filters, applyFilters, resetFilters } = useFilters(
  { status: "", sort: "-createdAt" },
  { syncWithUrl: true }
);
```

### Dashboard Patterns

```tsx
// ✅ Use StatsCardGrid for dashboard statistics
import { StatsCardGrid, StatsCard } from "@/components/common/StatsCard";

<StatsCardGrid>
  <StatsCard
    title="Total Sales"
    value="₹1.5L"
    trend={{ value: 12, isPositive: true }}
    icon={TrendingUp}
  />
  <StatsCard title="Orders" value="150" icon={ShoppingCart} />
</StatsCardGrid>;
```

### Performance Best Practices

```tsx
// ✅ Debounce search inputs
const debouncedSearch = useDebounce(searchTerm, 300);

// ✅ Use query limits
import { QUERY_LIMITS } from "@/constants/database";
query.limit(QUERY_LIMITS.DEFAULT);

// ✅ Cache API responses
import useSWR from "swr";
const { data } = useSWR("/api/products", fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 60000,
});

// ✅ Use AbortController for cleanup
useEffect(() => {
  const controller = new AbortController();
  fetchData(controller.signal);
  return () => controller.abort();
}, []);
```

### Accessibility Best Practices

```tsx
// ✅ Use ARIA labels
<button aria-label="Close dialog" aria-expanded={isOpen}>

// ✅ Use alt text for images
<OptimizedImage src={image} alt="Product: Red T-Shirt" />

// ✅ Keyboard navigation
<div role="button" tabIndex={0} onKeyDown={handleKeyDown}>

// ✅ Form errors
<input aria-invalid={!!error} aria-describedby="error-message" />
<span id="error-message" role="alert">{error}</span>
```

### Error Handling

```tsx
// ✅ Use error logging service
import { logError } from "@/lib/firebase-error-logger";

try {
  await someOperation();
} catch (error) {
  logError(error, {
    context: "product-creation",
    userId: user?.uid,
  });
}

// ✅ Show user-friendly error messages
import { ERROR_MESSAGES } from "@/constants/messages";
setError(ERROR_MESSAGES.SERVER_ERROR);
```

---

## Critical Don'ts

### Don't Do

- ❌ Don't use mocks - APIs are ready
- ❌ Don't create documentation files unless asked
- ❌ Don't use `getById()` for public/seller URLs - use `getBySlug()`
- ❌ Don't hardcode collection names - use `COLLECTIONS` constant
- ❌ Don't hardcode API paths - use constants from `api-routes.ts`
- ❌ Don't hardcode validation rules - use `VALIDATION_RULES` constant
- ❌ Don't hardcode error messages - use `VALIDATION_MESSAGES` constant
- ❌ Don't create inline Zod schemas with hardcoded values
- ❌ Don't use raw `<img>` tags - use `OptimizedImage` component
- ❌ Don't use raw `<label>` + `<input>` - use `FormField` + `FormInput`
- ❌ Don't manually format prices - use `Price` or `CompactPrice` components
- ❌ Don't manually format dates - use `DateDisplay` or `RelativeDate` components
- ❌ Don't inline status badge styles - use `PaymentStatus`, `ShippingStatus`, `StockStatus`
- ❌ Don't create manual loading states - use `useLoadingState` hook
- ❌ Don't create manual pagination logic - use Sieve middleware
- ❌ Don't skip debouncing on search inputs - use `useDebounce`
- ❌ Don't leave console.log in production code
- ❌ Don't maintain legacy code - delete old patterns entirely
- ❌ Don't try to find orphaned code - rewrite the file instead
- ❌ Don't create large files (>350 lines) - split or use reusable components
- ❌ Don't skip dark mode support - always include `dark:` variants

### Always Do

- ✅ Check for existing reusable components before creating new ones
- ✅ Use hooks: `useLoadingState`, `useDebounce`, `useFilters`, `useAdminLoad`
- ✅ Use constants: `COLLECTIONS`, `QUERY_LIMITS`, `ROUTES`, `API_ROUTES`, `VALIDATION_RULES`, `VALIDATION_MESSAGES`
- ✅ Use validation helpers: `isValidEmail()`, `isValidPhone()`, `isValidPassword()`
- ✅ Use wrapper components: `FormInput`, `OptimizedImage`, `Price`, `DateDisplay`
- ✅ Use Sieve middleware for all list API endpoints
- ✅ Include dark mode variants on all components
- ✅ Split large files into smaller, focused components
- ✅ Remove all console.log statements before committing
- ✅ Use proper error logging with `logError()`
- ✅ Add accessibility attributes (ARIA, alt text, keyboard nav)
- ✅ Debounce search inputs and API calls
- ✅ Test on mobile and dark mode
- ✅ Ensure API and frontend use same validation constants
