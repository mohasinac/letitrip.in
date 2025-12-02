# Common Value Display Components

> **Status**: ✅ Complete
> **Priority**: High
> **Last Updated**: December 2025
> **Related**: [Doc 27 - HTML Tag Wrappers](./27-html-tag-wrappers.md)

## Overview

This document describes the common value display components available in `src/components/common/values/`. These components provide consistent formatting and display for common data types like prices, dates, phone numbers, etc.

**Use these components instead of:**

- Raw strings from the backend
- Inline formatting with template literals
- Manual Intl.NumberFormat or Intl.DateTimeFormat calls in JSX

## Components Available

| Component        | Purpose                      | Location                    |
| ---------------- | ---------------------------- | --------------------------- |
| `Price`          | Display prices in INR        | `values/Price.tsx`          |
| `CompactPrice`   | Compact price display (1.5L) | `values/Price.tsx`          |
| `DateDisplay`    | Formatted date display       | `values/DateDisplay.tsx`    |
| `RelativeDate`   | Relative time (2 hours ago)  | `values/DateDisplay.tsx`    |
| `DateRange`      | Date range display           | `values/DateDisplay.tsx`    |
| `PhoneNumber`    | Indian phone format          | `values/PhoneNumber.tsx`    |
| `Email`          | Email with optional masking  | `values/Email.tsx`          |
| `Currency`       | Multi-currency support       | `values/Currency.tsx`       |
| `ShippingStatus` | Shipping status badge        | `values/ShippingStatus.tsx` |
| `PaymentStatus`  | Payment status badge         | `values/PaymentStatus.tsx`  |
| `OrderId`        | Formatted order ID           | `values/OrderId.tsx`        |
| `Rating`         | Star rating display          | `values/Rating.tsx`         |
| `StockStatus`    | Stock availability badge     | `values/StockStatus.tsx`    |
| `Address`        | Address formatting           | `values/Address.tsx`        |

## Usage Examples

### Price Display

```tsx
import { Price, CompactPrice } from '@/components/common/values';

// Basic price
<Price amount={1499} />                           // ₹1,499

// With original price (shows discount)
<Price amount={1499} originalPrice={1999} />     // ₹1,499  ₹1,999  25% off

// Without discount badge
<Price amount={1499} originalPrice={1999} showDiscount={false} />

// With decimals
<Price amount={1499.99} showDecimals={true} />   // ₹1,499.99

// Different sizes
<Price amount={1499} size="xl" />                // Large text
<Price amount={1499} size="xs" />                // Small text

// Compact for large numbers
<CompactPrice amount={150000} />                  // ₹1.5L
<CompactPrice amount={10000000} />               // ₹1Cr
```

### Date Display

```tsx
import { DateDisplay, RelativeDate, DateRange } from '@/components/common/values';

// Basic date
<DateDisplay date={new Date()} />                 // Dec 2, 2025

// With time
<DateDisplay date="2025-12-02T10:30:00" includeTime />  // Dec 2, 2025, 10:30 AM

// Different formats
<DateDisplay date={date} format="short" />        // 12/2/25
<DateDisplay date={date} format="long" />         // December 2, 2025
<DateDisplay date={date} format="full" />         // Tuesday, December 2, 2025

// Relative time
<RelativeDate date={new Date()} />                // just now
<RelativeDate date={twoHoursAgo} />               // 2 hours ago

// Date range
<DateRange start={startDate} end={endDate} />     // Dec 1, 2025 - Dec 15, 2025
```

### Phone Number

```tsx
import { PhoneNumber } from '@/components/common/values';

// Basic display
<PhoneNumber value="9876543210" />                // +91 98765 43210

// Clickable (tel: link)
<PhoneNumber value="9876543210" clickable />      // Clickable link

// With icon
<PhoneNumber value="9876543210" showIcon />       // 📞 +91 98765 43210
```

### Email

```tsx
import { Email } from '@/components/common/values';

// Basic display
<Email value="user@example.com" />                // user@example.com

// Clickable (mailto: link)
<Email value="user@example.com" clickable />

// Masked for privacy
<Email value="user@example.com" masked />         // u***@example.com

// With icon
<Email value="user@example.com" showIcon />
```

### Status Badges

```tsx
import { ShippingStatus, PaymentStatus } from '@/components/common/values';

// Shipping status
<ShippingStatus status="pending" />               // ⏳ Pending
<ShippingStatus status="shipped" />               // 🚚 Shipped
<ShippingStatus status="delivered" />             // ✅ Delivered
<ShippingStatus status="returned" />              // ↩️ Returned

// Payment status
<PaymentStatus status="pending" />                // ⏳ Pending
<PaymentStatus status="paid" />                   // ✅ Paid
<PaymentStatus status="failed" />                 // ❌ Failed
<PaymentStatus status="refunded" />               // ↩️ Refunded

// Different sizes
<ShippingStatus status="shipped" size="sm" />
<PaymentStatus status="paid" size="lg" />
```

### Order ID

```tsx
import { OrderId } from '@/components/common/values';

// Basic display
<OrderId value="abc123xyz789" />                  // #ORD-ABC123XY

// With copy button
<OrderId value="abc123xyz789" copyable />

// Full ID (no formatting)
<OrderId value="abc123xyz789" format="full" />    // abc123xyz789
```

### Rating

```tsx
import { Rating } from '@/components/common/values';

// Basic rating
<Rating value={4.5} />                            // ★★★★½ 4.5

// With review count
<Rating value={4.5} reviewCount={123} />          // ★★★★½ 4.5 (123)

// Stars only
<Rating value={4.5} showNumber={false} />         // ★★★★½

// Different sizes
<Rating value={4.5} size="lg" />
```

### Stock Status

```tsx
import { StockStatus } from '@/components/common/values';

// In stock
<StockStatus count={50} />                        // ✅ 50 in stock

// Low stock
<StockStatus count={3} />                         // ⚠️ Only 3 left

// Out of stock
<StockStatus count={0} />                         // ❌ Out of Stock

// Custom threshold
<StockStatus count={10} lowStockThreshold={15} /> // ⚠️ Only 10 left
```

### Address

```tsx
import { Address } from '@/components/common/values';

const address = {
  line1: "123 Main Street",
  line2: "Apartment 4B",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400001"
};

// Multi-line (default)
<Address address={address} />
// 123 Main Street
// Apartment 4B
// Mumbai, Maharashtra 400001

// Single line
<Address address={address} format="single-line" />
// 123 Main Street, Apartment 4B, Mumbai, Maharashtra, 400001, India

// Compact
<Address address={address} format="compact" />
// Mumbai, Maharashtra 400001

// With icon
<Address address={address} showIcon />
```

## Dark Mode Support

All components include proper dark mode classes:

- Text colors adjust automatically (`text-gray-900 dark:text-white`)
- Background colors for badges (`bg-green-100 dark:bg-green-900/30`)
- Border colors when applicable

## Import Pattern

```tsx
// Import all components
import {
  Price,
  CompactPrice,
  DateDisplay,
  RelativeDate,
  DateRange,
  PhoneNumber,
  Email,
  Currency,
  ShippingStatus,
  PaymentStatus,
  OrderId,
  Rating,
  StockStatus,
  Address,
} from "@/components/common/values";

// Or import specific components
import { Price } from "@/components/common/values/Price";
```

## Migration from Raw Strings

### Before (Raw Strings)

```tsx
// ❌ Bad - manual formatting
<span>₹{product.price.toLocaleString('en-IN')}</span>

// ❌ Bad - hardcoded formatting
<span>{new Date(order.createdAt).toLocaleDateString()}</span>

// ❌ Bad - inline status logic
<span className={order.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
  {order.status}
</span>
```

### After (Components)

```tsx
// ✅ Good - consistent formatting
<Price amount={product.price} />

// ✅ Good - consistent dates
<DateDisplay date={order.createdAt} />

// ✅ Good - proper status badges
<PaymentStatus status={order.paymentStatus} />
```

## Benefits

| Benefit             | Description                                   |
| ------------------- | --------------------------------------------- |
| **Consistency**     | Same formatting across the entire app         |
| **Dark Mode**       | Built-in dark mode support                    |
| **Accessibility**   | Semantic HTML, proper ARIA attributes         |
| **Maintainability** | Change format in one place, update everywhere |
| **Type Safety**     | TypeScript props prevent invalid values       |
| **i18n Ready**      | Easy to add localization support              |

## Related Documents

- [Doc 27 - HTML Tag Wrappers](./27-html-tag-wrappers.md) - Form components
- [Doc 30 - Component Library Consolidation](./30-component-library-consolidation.md) - Component standards
