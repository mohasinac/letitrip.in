# Common Value Display Components

> **Status**: ✅ Complete - All inline prices and dates migrated
> **Priority**: High
> **Last Updated**: December 2, 2025
> **Related**: [Doc 27 - HTML Tag Wrappers](./27-html-tag-wrappers.md)

## Overview

This document describes the common value display components available in `src/components/common/values/`. These components provide consistent formatting and display for common data types like prices, dates, phone numbers, etc.

**Use these components instead of:**

- Raw strings from the backend
- Inline formatting with template literals
- Manual Intl.NumberFormat or Intl.DateTimeFormat calls in JSX

## Migration Status ✅

### Price Migration (Complete)

All inline `₹{amount.toLocaleString()}` patterns have been migrated to use `<Price amount={} />`:

### DateDisplay Migration (Complete - December 2025)

All inline `new Date().toLocaleDateString()` patterns have been migrated to use `<DateDisplay date={} />`:

**User Pages:**

- `src/app/user/page.tsx` - Order dates
- `src/app/user/orders/page.tsx` - Order list dates
- `src/app/user/orders/[id]/page.tsx` - Order detail dates
- `src/app/user/tickets/page.tsx` - Ticket dates
- `src/app/user/tickets/[id]/page.tsx` - Ticket detail dates
- `src/app/user/reviews/page.tsx` - Review dates
- `src/app/user/history/page.tsx` - Viewing history dates (RelativeDate)

**Seller Pages:**

- `src/app/seller/revenue/page.tsx` - Chart dates and stats
- `src/app/seller/coupons/page.tsx` - Coupon expiry dates
- `src/app/seller/auctions/page.tsx` - Auction end dates
- `src/app/seller/returns/page.tsx` - Return request dates
- `src/app/seller/orders/[id]/page.tsx` - Order placed date (Dec 2, 2025) ✅

**Public Pages:**

- `src/app/auctions/[slug]/page.tsx` - Auction end time (Dec 2, 2025) ✅

**Admin Pages:**

- `src/app/admin/payouts/page.tsx` - Payout dates
- `src/app/admin/users/page.tsx` - User creation dates
- `src/app/admin/tickets/page.tsx` - Ticket dates
- `src/app/admin/tickets/[id]/page.tsx` - Message timestamps + metadata dates (Dec 2, 2025) ✅
- `src/app/admin/returns/page.tsx` - Return dates

### Price Migration Updates (December 2, 2025)

**Seller Pages:**

- `src/app/seller/settings/page.tsx` - Payout minimum amount (Dec 2, 2025) ✅
- `src/app/admin/shops/[id]/edit/page.tsx` - Shop dates
- `src/app/admin/coupons/page.tsx` - Coupon expiry dates
- `src/app/admin/blog/page.tsx` - Post dates
- `src/app/admin/blog/[id]/edit/page.tsx` - Post dates

**Components:**

- `src/components/shop/ShopHeader.tsx` - Shop joined date
- `src/components/product/ReviewList.tsx` - Review dates

### Migrated Files (December 2025)

**User Pages:**

- `src/app/user/page.tsx` - Order totals
- `src/app/user/orders/page.tsx` - Order list prices
- `src/app/user/orders/[id]/page.tsx` - Order detail prices
- `src/app/user/favorites/page.tsx` - Favorite item prices
- `src/app/user/riplimit/page.tsx` - RipLimit amounts

**Seller Pages:**

- `src/app/seller/page.tsx` - Dashboard revenue stats
- `src/app/seller/my-shops/[slug]/page.tsx` - Shop revenue
- `src/app/seller/products/page.tsx` - Product prices (grid/table)
- `src/app/seller/products/[slug]/edit/page.tsx` - Product preview price
- `src/app/seller/coupons/page.tsx` - Coupon discount values

**Admin Pages:**

- `src/app/admin/shops/[id]/edit/page.tsx` - Shop stats and products
- `src/app/admin/orders/page.tsx` - Order totals and revenue stats
- `src/app/admin/analytics/page.tsx` - Overview metrics
- `src/app/admin/analytics/sales/page.tsx` - Sales charts and tables
- `src/app/admin/analytics/users/page.tsx` - Customer spending
- `src/app/admin/analytics/auctions/page.tsx` - Auction bids

**Public Pages:**

- `src/app/products/page.tsx` - Product table prices
- `src/app/shops/[slug]/page.tsx` - Shop product prices
- `src/app/categories/[slug]/page.tsx` - Category product prices
- `src/app/checkout/page.tsx` - Checkout summary prices
- `src/app/auctions/[slug]/page.tsx` - Bid amounts

**Components:**

- `src/components/common/SearchBar.tsx` - Search result prices
- `src/components/common/MobileStickyBar.tsx` - Mobile price display
- `src/components/product/ProductInfo.tsx` - Product detail price
- `src/components/cart/CartItem.tsx` - Cart item prices
- `src/components/cart/CartSummary.tsx` - Cart totals
- `src/components/checkout/ShopOrderSummary.tsx` - Shop order prices
- `src/components/cards/ProductQuickView.tsx` - Quick view prices
- `src/components/seller/ProductTable.tsx` - Seller product table
- `src/components/seller/product-wizard/OptionalDetailsStep.tsx` - Wizard preview

## Components Available

| Component        | Purpose                       | Location                    |
| ---------------- | ----------------------------- | --------------------------- |
| `Price`          | Display prices in INR         | `values/Price.tsx`          |
| `CompactPrice`   | Compact price display (1.5L)  | `values/Price.tsx`          |
| `DateDisplay`    | Formatted date display        | `values/DateDisplay.tsx`    |
| `RelativeDate`   | Relative time (2 hours ago)   | `values/DateDisplay.tsx`    |
| `DateRange`      | Date range display            | `values/DateRange.tsx`      |
| `TimeRemaining`  | Countdown timer               | `values/TimeRemaining.tsx`  |
| `PhoneNumber`    | Indian phone format           | `values/PhoneNumber.tsx`    |
| `Email`          | Email with optional masking   | `values/Email.tsx`          |
| `Currency`       | Multi-currency support        | `values/Currency.tsx`       |
| `ShippingStatus` | Shipping status badge         | `values/ShippingStatus.tsx` |
| `PaymentStatus`  | Payment status badge          | `values/PaymentStatus.tsx`  |
| `OrderId`        | Formatted order ID            | `values/OrderId.tsx`        |
| `Rating`         | Star rating display           | `values/Rating.tsx`         |
| `StockStatus`    | Stock availability badge      | `values/StockStatus.tsx`    |
| `Address`        | Address formatting            | `values/Address.tsx`        |
| `Quantity`       | Compact quantity display      | `values/Quantity.tsx`       |
| `Weight`         | Weight with auto g/kg convert | `values/Weight.tsx`         |
| `Dimensions`     | L×W×H dimension display       | `values/Dimensions.tsx`     |
| `SKU`            | SKU with copy button          | `values/SKU.tsx`            |
| `BidCount`       | Auction bid count display     | `values/BidCount.tsx`       |
| `Percentage`     | Percentage with color coding  | `values/Percentage.tsx`     |
| `TruncatedText`  | Text with show more/less      | `values/TruncatedText.tsx`  |
| `AuctionStatus`  | Auction status badge          | `values/AuctionStatus.tsx`  |

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
  TimeRemaining,
  PhoneNumber,
  Email,
  Currency,
  ShippingStatus,
  PaymentStatus,
  OrderId,
  Rating,
  StockStatus,
  Address,
  Quantity,
  Weight,
  Dimensions,
  SKU,
  BidCount,
  Percentage,
  TruncatedText,
  AuctionStatus,
} from "@/components/common/values";

// Or import specific components
import { Price } from "@/components/common/values/Price";
```

## New Components (December 2025)

### Quantity

```tsx
import { Quantity } from '@/components/common/values';

<Quantity value={50} />                    // 50
<Quantity value={1500} />                  // 1.5K
<Quantity value={150000} />                // 1.5L
<Quantity value={10000000} />              // 1Cr
<Quantity value={50} suffix="items" />     // 50 items
```

### Weight

```tsx
import { Weight } from '@/components/common/values';

<Weight value={500} />                     // 500 g
<Weight value={1500} />                    // 1.5 kg (auto converts at 1000g)
<Weight value={1.5} unit="kg" />           // 1.5 kg
```

### Dimensions

```tsx
import { Dimensions } from '@/components/common/values';

<Dimensions length={10} width={20} height={5} />        // 10 × 20 × 5 cm
<Dimensions length={10} width={20} height={5} unit="in" /> // 10 × 20 × 5 in
```

### SKU

```tsx
import { SKU } from '@/components/common/values';

<SKU value="PROD-12345" />                 // SKU: PROD-12345
<SKU value="PROD-12345" copyable />        // With copy button
<SKU value="PROD-12345" showLabel={false} /> // PROD-12345 (no label)
```

### BidCount

```tsx
import { BidCount } from '@/components/common/values';

<BidCount count={0} />                     // No bids yet
<BidCount count={1} />                     // 1 bid
<BidCount count={15} />                    // 15 bids
<BidCount count={15} showIcon />           // 🔨 15 bids
```

### TimeRemaining

```tsx
import { TimeRemaining } from '@/components/common/values';

<TimeRemaining endTime={futureDate} />     // 2d 5h 30m (live countdown)
<TimeRemaining endTime={futureDate} showSeconds /> // 2d 5h 30m 45s
// Automatically shows urgency colors when < 1 hour remaining
```

### Percentage

```tsx
import { Percentage } from '@/components/common/values';

<Percentage value={25} />                  // 25%
<Percentage value={25} showSign />         // +25%
<Percentage value={-10} showSign />        // -10%
<Percentage value={25} type="discount" />  // 25% off (green)
<Percentage value={15} type="increase" showIcon /> // ↑ +15% (red)
<Percentage value={-10} type="decrease" showIcon /> // ↓ -10% (green)
```

### TruncatedText

```tsx
import { TruncatedText } from "@/components/common/values";

<TruncatedText text={longDescription} maxLength={100} />;
// Shows first 100 chars + "Show more" button
// Expands to full text when clicked
```

### AuctionStatus

```tsx
import { AuctionStatus } from '@/components/common/values';

<AuctionStatus status="active" />          // 🟢 Live
<AuctionStatus status="live" />            // 🟢 Live
<AuctionStatus status="pending" />         // ⏳ Upcoming
<AuctionStatus status="ended" />           // 🔴 Ended
<AuctionStatus status="cancelled" />       // ❌ Cancelled
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
