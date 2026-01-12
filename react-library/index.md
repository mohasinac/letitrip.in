# React Library Index

**Package**: @letitrip/react-library
**Version**: 1.0.0
**Status**: In Development
**Last Updated**: January 12, 2026

## Overview

Reusable React components and utilities extracted from the main Letitrip application. This library provides a comprehensive set of tools for building consistent and accessible user interfaces.

## Structure

```
react-library/
├── src/
│   ├── index.ts           # Main entry point
│   ├── utils/             # Utility functions (Task 14.2)
│   ├── components/        # React components (Task 15.1-15.3)
│   ├── hooks/             # React hooks (Task 15.4)
│   ├── styles/            # Styles and theme (Task 16.1)
│   └── types/             # TypeScript types (Task 16.3)
├── stories/               # Storybook stories (Task 14.4)
├── .storybook/            # Storybook configuration
├── dist/                  # Build output (generated)
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Build configuration
```

## Build System

- **Bundler**: Vite 5.x
- **TypeScript**: 5.3+
- **Output Formats**: ESM and CommonJS
- **Type Definitions**: Generated via vite-plugin-dts

## Exports

The library provides multiple entry points for tree-shaking:

```typescript
// Main entry point
import { X } from "@letitrip/react-library";

// Specific imports (better tree-shaking)
import { X } from "@letitrip/react-library/utils";
import { Y } from "@letitrip/react-library/components";
import { Z } from "@letitrip/react-library/hooks";
```

## Package Exports

```json
{
  ".": "./dist/index.js",
  "./utils": "./dist/utils/index.js",
  "./components": "./dist/components/index.js",
  "./hooks": "./dist/hooks/index.js",
  "./styles": "./dist/styles/index.js"
}
```

## Development

### Scripts

- `npm run dev` - Watch mode for development
- `npm run build` - Build library
- `npm run build:full` - Build with TypeScript compilation
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run storybook` - Start Storybook dev server
- `npm run build-storybook` - Build Storybook static site

### Building

```bash
cd react-library
npm run build
```

Output:

- `dist/index.js` - ESM bundle
- `dist/index.cjs` - CommonJS bundle
- `dist/index.d.ts` - Type definitions
- `dist/utils/`, `dist/components/`, etc. - Split chunks

## Dependencies

### Peer Dependencies

- react: ^18.0.0 || ^19.0.0
- react-dom: ^18.0.0 || ^19.0.0

### Direct Dependencies

- clsx: ^2.1.0 - Conditional class names
- tailwind-merge: ^2.2.0 - Tailwind class merging
- date-fns: ^3.0.0 - Date manipulation
- libphonenumber-js: ^1.10.0 - Phone validation

### Dev Dependencies

- vite: ^5.0.0 - Build tool
- typescript: ^5.3.0 - Type checking
- @storybook/react: ^7.6.0 - Component documentation
- vitest: ^1.0.0 - Testing framework

## Workspace Integration

The library is integrated into the main monorepo as a workspace:

**Root package.json:**

```json
{
  "workspaces": ["react-library"]
}
```

**Root tsconfig.json:**

```json
{
  "compilerOptions": {
    "paths": {
      "@letitrip/react-library": ["./react-library/src"],
      "@letitrip/react-library/*": ["./react-library/src/*"]
    }
  }
}
```

## Migration Status

### Completed

**Task 14.1: Library Structure** ✅

- ✅ Library structure created
- ✅ Package configuration
- ✅ TypeScript setup
- ✅ Vite build configuration
- ✅ Storybook setup
- ✅ Workspace integration
- ✅ Build verification

**Task 14.2: Core Utilities** ✅

- ✅ cn function (Tailwind class merging)
- ✅ formatters.ts (20+ formatting functions)
- ✅ date-utils.ts (date manipulation)
- ✅ validators.ts (validation functions)
- ✅ sanitize.ts (input sanitization)
- ✅ price.utils.ts (price formatting)
- ✅ Build successful (103KB utils bundle)

**Task 14.3: Value Display Components** ✅

- ✅ Migrated 20 value display components
- ✅ DateDisplay (3 variants), Price, Status components
- ✅ All imports updated to library paths
- ✅ Build successful (35KB components bundle)
- ✅ Fixed Currency/formatDiscount conflicts

**Task 14.4: Storybook Documentation** ✅

- ✅ Created comprehensive utility stories
- ✅ Formatters stories (8 variants with live examples)
- ✅ Validators stories (6 validation types)
- ✅ Date utils stories (4 utility categories)
- ✅ Component stories for DateDisplay, Price, Status
- ✅ Updated Introduction with library overview
- ✅ Storybook builds successfully (18s build time)

**Task 14.5: Accessibility Utilities** ✅

- ✅ Migrated accessibility.ts (13 functions)
- ✅ ARIA helpers for form fields
- ✅ Keyboard navigation utilities (KeyCodes, trapFocus)
- ✅ Screen reader announcements
- ✅ Focus management utilities
- ✅ Build successful (43KB utils bundle)

**Task 14.6: Week 14 Integration & Testing** ✅

- ✅ Final build verification successful (7s build time)
- ✅ Total bundle size: 147KB raw, 35KB gzipped
- ✅ Utils: 43KB (13.6KB gzipped)
- ✅ Components: 35KB (8KB gzipped)
- ✅ Updated README with complete feature documentation
- ✅ Week 14 complete: 6/6 tasks (100%)

## Week 14 Complete! 🎉

All utilities and setup tasks completed:
- Library infrastructure (Vite, TypeScript, Storybook)
- 60+ utility functions across 6 modules
- 20 value display components
- 27+ Storybook examples
- 13 accessibility helpers
- Full documentation and build verification

### Pending

**Week 15 - Component Migration**
- ⏳ Task 14.5: Migrate accessibility utilities
- ⏳ Task 14.6: Week 14 integration & testing

**Week 15**

- ⏳ Task 15.1-15.6: Component migration

**Week 16**

- ⏳ Task 16.1-16.6: Styles & finalization

## Contents

### Utilities ✅ (Task 14.2 Complete)

**cn.ts** - Tailwind class merging

- `cn(...inputs)` - Merge Tailwind classes intelligently

**formatters.ts** - Formatting functions (20+ functions)

- `formatCompactCurrency(amount)` - Indian numbering (K, L, Cr)
- `formatDate(date, options)` - Localized date formatting
- `formatRelativeTime(date, options)` - "2 hours ago" style
- `formatNumber(num, options)` - Indian numbering system
- `formatCompactNumber(num)` - 1K, 1M, 1B notation
- `formatPercentage(value, options)` - Percentage formatting
- `formatPhoneNumber(phone)` - Indian phone format
- `formatPincode(pincode)` - 6-digit pincode
- `formatFileSize(bytes)` - KB, MB, GB
- `formatDuration(seconds)` - Human-readable duration
- `formatOrderId(id)` - #ORD-XXXXX
- `formatShopId(id)` - SHP-XXXXX
- `formatSKU(sku)` - Uppercase SKU
- `truncateText(text, maxLength)` - Text with ellipsis
- `slugToTitle(slug)` - Convert slug to title
- `formatDiscount(original, current)` - Discount percentage
- `formatRating(rating, max)` - Rating display
- `formatReviewCount(count)` - Review count
- `formatStockStatus(stock)` - Stock status
- `formatTimeRemaining(endTime)` - Auction countdown
- `formatAddress(address)` - Multi-line address
- `formatCardNumber(card)` - Masked card number
- `formatUPI(upiId)` - UPI ID formatting
- `formatBankAccount(account)` - Masked account
- `formatDateRange(start, end)` - Date range
- `formatBoolean(value)` - Yes/No
- `formatList(items, locale)` - List with "and"

**date-utils.ts** - Date manipulation

- `safeToISOString(date)` - Safe date to ISO conversion
- `toISOStringOrDefault(date, fallback)` - With fallback
- `isValidDate(date)` - Date validation
- `toDateInputValue(date)` - YYYY-MM-DD format
- `getTodayDateInputValue()` - Today's date input
- `safeToDate(value)` - Safe date conversion

**validators.ts** - Validation functions

- Email, phone, pincode, URL validation
- Form field validation
- Input validation rules

**sanitize.ts** - Input sanitization

- HTML sanitization
- XSS prevention
- Input cleaning

**price.utils.ts** - Price formatting

- `formatPrice(amount, options)` - Null-safe price formatting
- `formatDiscount(original, current)` - Discount calculation
- `PriceCurrency` type - INR, USD, EUR, GBP

**accessibility.ts** - Accessibility helpers (Task 14.5)

- `generateId(prefix)` - Unique ID generation
- `getFormFieldAriaProps(props)` - ARIA attributes for forms
- `announceToScreenReader(message, priority)` - Screen reader announcements
- `KeyCodes` - Keyboard key code constants
- `isKey(event, ...keys)` - Keyboard event checker
- `trapFocus(element, event)` - Focus trap for modals
- `getLabelText(label, required, helperText)` - Formatted labels
- `formatErrorMessage(error, fieldLabel)` - Accessible errors
- `getValidationAriaProps(state)` - Validation ARIA attributes
- `focusElement(elementOrId)` - Programmatic focus
- `getNextFocusableElement(current, reverse)` - Focus navigation
- `srOnlyClassName` - Screen reader only CSS class
- `createSROnlyElement(text)` - Create SR-only element

### Components ✅ (Task 14.3 Complete - 20 Components)

**Value Display Components**

- `DateDisplay` - Formatted date display with time options
- `RelativeDate` - "2 hours ago" style dates
- `DateRange` - Display date ranges
- `Price` - Price with currency symbol and discount
- `Address` - Formatted multi-line address
- `AuctionStatus` - Auction status badge
- `BidCount` - Bid count display
- `Currency` - Currency amounts with localization
- `Dimensions` - Product dimensions (LxWxH)
- `Email` - Email display with link
- `OrderId` - Formatted order ID
- `PaymentStatus` - Payment status badge
- `Percentage` - Percentage display
- `PhoneNumber` - Formatted phone number with link
- `Quantity` - Quantity display with unit
- `Rating` - Star rating with count
- `ShippingStatus` - Shipping status badge
- `SKU` - SKU code display
- `StockStatus` - Stock availability badge
- `TimeRemaining` - Countdown timer for auctions
- `TruncatedText` - Text with "Show more" expansion
- `Weight` - Weight display with unit conversion

### Form Components (Task 15.1)

- Form components (21 components) - Pending
- UI components (Button, Card, Modal, etc.) - Pending
- Pickers (DateTimePicker, State, Pincode) - Pending

### Hooks (Task 15.4)

- useMediaQuery
- useDebounce
- useLocalStorage
- useClipboard
- usePrevious
- useToggle
- And more...

### Styles (Task 16.1)

- Tailwind configuration
- Theme tokens
- CSS variables
- Design system

### Types (Task 16.3)

- Common types
- Component prop types
- Utility function types
- Hook types

## Documentation

### Storybook

Access component documentation at: http://localhost:6006

```bash
cd react-library
npm run storybook
```

### README

Main documentation: [react-library/README.md](../react-library/README.md)

### API Documentation

Will be generated in Task 16.2.

## Testing

### Unit Tests

```bash
cd react-library
npm test
```

### Integration Tests

Tests will be added in Tasks 14.6, 15.6, and 16.5.

## Build Verification

✅ Initial build successful (Task 14.1)

```
dist/
├── index.js (ESM)
├── index.cjs (CommonJS)
├── index.d.ts (Types)
├── utils/index.js
├── components/index.js
├── hooks/index.js
└── styles/index.js
```

## Next Steps

1. **Task 14.2**: Migrate core utilities

   - formatters.ts
   - validators.ts
   - date-utils.ts
   - utils.ts (cn function)
   - sanitize.ts

2. **Task 14.3**: Migrate value display components

   - DateDisplay
   - Price
   - Status badges

3. **Task 14.4**: Create Storybook stories
   - Setup story infrastructure
   - Add utility examples

## Related Files

- [IMPLEMENTATION-TRACKER.md](../../refactor/IMPLEMENTATION-TRACKER.md) - Task tracking
- [LIBRARY-SETUP-GUIDE.md](../../refactor/LIBRARY-SETUP-GUIDE.md) - Setup guide
- [LIBRARY-FILE-INVENTORY.md](../../refactor/LIBRARY-FILE-INVENTORY.md) - File inventory

---

**Created**: January 12, 2026
**Task**: 14.1 - Create React Library Submodule
**Status**: ✅ Complete
