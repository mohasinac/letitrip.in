# Changelog

All notable changes to @letitrip/react-library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-01-14

### Initial Release

#### Added

**Components (31 total)**

- **Value Display Components (20)**:

  - `DateDisplay` - Display dates with flexible formatting
  - `Price` - Currency display with Indian format
  - `Rating` - Star rating display with half-star support
  - `StatusBadge` - Colored status indicators
  - `OrderStatusBadge` - Order-specific status badges
  - `PaymentStatusBadge` - Payment status indicators
  - `ShipmentStatusBadge` - Shipment tracking badges
  - `ReturnStatusBadge` - Return request status
  - `VerificationBadge` - Verification status badges
  - `AvailabilityBadge` - Stock availability indicators
  - `TrendBadge` - Trend indicators (up/down/stable)
  - `PriorityBadge` - Priority level badges
  - `ProductCard` - Product display card
  - `ShopCard` - Shop information card
  - `OrderCard` - Order summary card
  - `ReviewCard` - Review display card
  - `AddressCard` - Address display card
  - `CategoryCard` - Category display card
  - `NotificationCard` - Notification item card
  - `StatsCard` - Statistics display card

- **Form Components (9)**:

  - `FormInput` - Text input with validation
  - `FormSelect` - Dropdown select with search
  - `FormTextarea` - Multi-line text input
  - `FormCheckbox` - Checkbox with custom styling
  - `FormRadio` - Radio button groups
  - `FormPhoneInput` - Phone number with country code
  - `FormCurrencyInput` - Currency input with formatting
  - `FormDatePicker` - Date selection calendar
  - `FormFileUpload` - File upload with drag-and-drop

- **UI Components (2)**:
  - `Button` - Button with 5 variants
  - `Card` - Card container with sections

**Hooks (18 total)**

- **Debounce & Throttle (3)**:

  - `useDebounce` - Debounce value changes
  - `useDebouncedCallback` - Debounce function calls
  - `useThrottle` - Throttle value updates

- **Storage (1)**:

  - `useLocalStorage` - localStorage with React state sync

- **Responsive (7)**:

  - `useMediaQuery` - Match media queries
  - `useIsMobile` - Mobile device detection
  - `useIsTablet` - Tablet device detection
  - `useIsDesktop` - Desktop device detection
  - `useViewport` - Window dimensions tracking
  - `useBreakpoint` - Current breakpoint detection
  - `useOrientation` - Device orientation tracking

- **Utilities (7)**:
  - `useToggle` - Boolean state management
  - `usePrevious` - Track previous value
  - `useClipboard` - Copy to clipboard
  - `useCounter` - Counter state management
  - `useInterval` - setInterval with React
  - `useTimeout` - setTimeout with React
  - `useIsMounted` - Component mount status

**Utilities (60+ functions)**

- **Formatters (25+)**:

  - Currency formatting (INR with Indian format)
  - Date formatting (relative, absolute, range)
  - Number formatting (compact, Indian, filesize)
  - Name formatting (display names, initials)
  - Address formatting (Indian addresses)
  - Phone formatting (Indian numbers)
  - And more...

- **Validators (10+)**:

  - Email validation
  - Phone validation (Indian numbers)
  - Pincode validation (Indian)
  - GST validation
  - PAN card validation
  - Aadhaar validation
  - And more...

- **Date Utils (6)**:

  - Safe date parsing
  - Date comparison
  - Date range checking
  - ISO conversion
  - Date arithmetic

- **Price Utils (3)**:

  - Price formatting
  - Discount calculation
  - Price comparison

- **Sanitization (5)**:

  - HTML sanitization
  - XSS prevention
  - Input cleaning
  - URL sanitization
  - JSON sanitization

- **Accessibility (13)**:
  - ARIA attribute helpers
  - Keyboard navigation
  - Screen reader utilities
  - Focus management
  - And more...

**Design System**

- 200+ CSS custom properties (design tokens)
- Complete color palette (primary, secondary, neutral, semantic)
- Typography scale (9 text sizes)
- Spacing scale (3xl to 3xl)
- Shadow system (5 levels)
- Border radius tokens
- Animation tokens (durations, easings)
- Dark mode support
- Tailwind configuration

**Build & Development**

- Vite for fast builds
- TypeScript support
- ESM and CJS outputs
- Tree-shakeable exports
- Source maps
- Bundle size optimization
- Storybook documentation
- Vitest for testing

**Documentation**

- Comprehensive README
- Component API documentation
- Hook usage examples
- Utility function docs
- Design token reference
- Migration guides
- Contributing guidelines

### Changed

### Deprecated

### Removed

### Fixed

### Security

## Version History

- **1.0.0** (2026-01-14) - Initial release with 31 components, 18 hooks, 60+ utilities

---

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Commit changes: `git commit -m "chore: Release v1.0.0"`
4. Create tag: `git tag v1.0.0`
5. Push: `git push && git push --tags`
6. GitHub Actions will automatically publish to npm

## Migration Guides

### From Internal Library to Published Package

If migrating from the workspace library:

```typescript
// Before (workspace)
import { formatPrice } from "@/lib/price.utils";
import { FormInput } from "@/components/forms/FormInput";

// After (published package)
import { formatPrice } from "@letitrip/react-library/utils";
import { FormInput } from "@letitrip/react-library/components";
```

[Unreleased]: https://github.com/letitrip/react-library/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/letitrip/react-library/releases/tag/v1.0.0
