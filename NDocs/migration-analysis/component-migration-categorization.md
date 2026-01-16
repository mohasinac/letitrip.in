# Component Migration Categorization Analysis

**Analysis Date**: January 16, 2026  
**Total Directories Analyzed**: 28

## Executive Summary

This document categorizes all components in `src/components/` by their migration potential to the `react-library` package. Each component directory has been analyzed for:

- Next.js dependencies (Link, Image, useRouter, usePathname, useSearchParams, dynamic)
- Firebase/Auth dependencies (AuthContext, Firebase SDK)
- App-specific services and contexts

---

## 🟢 FULLY MIGRATABLE (Can Move Entirely)

These components are pure React with no framework or app-specific dependencies.

### 1. **admin/** - UI Components Only

**Sample Files**:

- `Toast.tsx` - Pure notification system
- `ToggleSwitch.tsx` - Reusable toggle component
- `LoadingSpinner.tsx` - Generic spinner

**Analysis**:

- ✅ No Next.js dependencies (except AdminSidebar.tsx which uses Link/usePathname)
- ✅ No Firebase dependencies
- ✅ Pure UI components with callbacks

**Migration Strategy**:

- Move `Toast.tsx`, `ToggleSwitch.tsx`, `LoadingSpinner.tsx` to `react-library/components/ui/`
- Keep `AdminSidebar.tsx`, `AdminPageHeader.tsx`, `AdminResourcePage.tsx` in main app (routing logic)

---

### 2. **auction/** - Display Components

**Sample Files**:

- `LiveCountdown.tsx` - Timer logic only
- `AuctionGallery.tsx` - Alias to ProductGallery
- `LiveBidHistory.tsx` - List display

**Analysis**:

- ✅ No Next.js dependencies in display components
- ⚠️ May use app-specific types but logic is pure
- ✅ No Firebase dependencies

**Migration Strategy**:

- Move `LiveCountdown.tsx` (pure countdown logic)
- Keep routing-heavy components like `SimilarAuctions.tsx` (uses navigation)

---

### 3. **mobile/** - Pure UI Patterns

**Sample Files**:

- `MobileBottomSheet.tsx` - Pure gesture handling
- `MobileSwipeActions.tsx` - Touch interaction logic
- `MobileSkeleton.tsx` - Loading states

**Analysis**:

- ✅ **100% Framework agnostic** - uses only React hooks
- ✅ No routing or auth dependencies
- ✅ Reusable across any React app

**Migration Strategy**:

- **PRIORITY**: Move entire directory to `react-library/components/mobile/`
- These are high-value reusable components

---

### 4. **skeletons/** - Loading States

**Sample Files**:

- `ProductCardSkeleton.tsx` - Pure UI
- `OrderCardSkeleton.tsx` - Pure UI
- `UserProfileSkeleton.tsx` - Pure UI

**Analysis**:

- ✅ Pure presentational components
- ✅ No dependencies
- ✅ Already exported from index.ts

**Migration Strategy**:

- Move all to `react-library/components/skeletons/`

---

### 5. **ui/** - Base Components

**Sample Files**:

- `BaseCard.tsx` - Uses Next.js Link/Image
- `BaseTable.tsx` - Pure table logic
- `Textarea.tsx` - Pure form input
- `Checkbox.tsx` - Pure form input

**Analysis**:

- ⚠️ `BaseCard.tsx` uses Next.js Link/Image (needs wrapper)
- ✅ `BaseTable.tsx`, `Textarea.tsx`, `Checkbox.tsx` are pure
- ✅ `FormActions.tsx`, `FormLayout.tsx`, `Heading.tsx`, `Text.tsx` are pure

**Migration Strategy**:

- Move pure components to react-library
- Create generic `BaseCard.tsx` version with render props for links/images

---

### 6. **navigation/** - Tab Components

**Sample Files**:

- `TabbedLayout.tsx` - Layout structure
- `TabNav.tsx` - Tab navigation

**Analysis**:

- ✅ Uses React Router-like patterns but not hardcoded to Next.js
- ✅ Can be made framework-agnostic with href props

**Migration Strategy**:

- Extract tab logic to react-library
- Keep route-specific implementations in main app

---

### 7. **media/** - Media Processing

**Sample Files**:

- `ImageEditor.tsx` - Pure canvas manipulation
- `MediaGallery.tsx` - Uses Next.js Image
- `VideoThumbnailGenerator.tsx` - Pure video processing

**Analysis**:

- ✅ Core logic is framework-agnostic
- ⚠️ Some components use Next.js Image
- ✅ Canvas/video processing is pure

**Migration Strategy**:

- Extract media processing logic to `react-library/utils/media/`
- Create generic image component wrappers

---

### 8. **legal/** - Simple Layout

**Sample Files**:

- `LegalPageLayout.tsx` - Basic layout wrapper

**Analysis**:

- ✅ No routing dependencies
- ✅ Pure presentational

**Migration Strategy**:

- Move to `react-library/components/layout/`

---

### 9. **faq/** - Accordion Components

**Sample Files**:

- `FAQItem.tsx` - Collapsible item
- `FAQSection.tsx` - FAQ list

**Analysis**:

- ✅ Pure React state management
- ⚠️ Uses app constants for data
- ✅ No framework dependencies

**Migration Strategy**:

- Extract accordion logic to react-library
- Pass data as props instead of importing constants

---

## 🟡 PARTIALLY MIGRATABLE (Split Logic from Wrappers)

These have extractable business logic but need framework-specific wrappers.

### 10. **auth/** - Authentication Guards

**Sample Files**:

- `AuthGuard.tsx` - Uses AuthContext + useRouter
- `GoogleSignInButton.tsx` - Uses Firebase SDK + useRouter
- `OTPInput.tsx` - Pure input component
- `MFAEnrollment.tsx` - Uses Firebase Auth

**Analysis**:

- ❌ Tightly coupled to Firebase Auth
- ❌ Uses Next.js router for redirects
- ✅ `OTPInput.tsx` is pure and can be migrated

**What Can Move**:

- `OTPInput.tsx` → Pure UI component
- Auth validation logic → Utility functions

**What Must Stay**:

- `AuthGuard.tsx` - Needs AuthContext and router
- `GoogleSignInButton.tsx` - Firebase initialization
- `MFAVerification.tsx`, `MFAEnrollment.tsx` - Firebase SDK calls

---

### 11. **cart/** - Cart Display

**Sample Files**:

- `CartItem.tsx` - Uses Next.js Link/Image
- `CartSummary.tsx` - Pure calculation logic

**Analysis**:

- ⚠️ Uses Next.js navigation components
- ⚠️ Imports from app-specific services
- ✅ Business logic (calculations) is extractable

**What Can Move**:

- Cart calculation logic → `react-library/utils/cart/`
- Pure UI components with render props

**What Must Stay**:

- Components that use `Link`, `Image`, or `toast`
- Service integrations

---

### 12. **checkout/** - Checkout Flow

**Sample Files**:

- `AddressForm.tsx` - Wrapper around SmartAddressForm
- `AddressSelector.tsx` - Uses app services
- `PaymentMethod.tsx` - Payment integration
- `ShippingMethodSelector.tsx` - Shipping logic

**Analysis**:

- ❌ Heavy service dependencies
- ⚠️ Form logic is reusable
- ❌ Payment/shipping integration is app-specific

**What Can Move**:

- Form validation logic
- UI components with callback props

**What Must Stay**:

- Service calls to backend
- Payment gateway integrations

---

### 13. **homepage/** - Section Components

**Sample Files**:

- `HeroSection.tsx` - Uses Next.js dynamic import
- `FeaturedAuctionsSection.tsx` - Data fetching
- `ValueProposition.tsx` - Pure content display

**Analysis**:

- ⚠️ Uses Next.js dynamic for code splitting
- ❌ Data fetching tied to app services
- ✅ Some pure presentational components

**What Can Move**:

- `ValueProposition.tsx` - Pure content component
- Section layout patterns

**What Must Stay**:

- Components with data fetching
- Dynamic imports for SSR optimization

---

### 14. **layout/** - Layout Components

**Sample Files**:

- `Header.tsx` - App-specific navigation
- `Footer.tsx` - App-specific links
- `Breadcrumb.tsx` - Uses usePathname
- `SearchBar.tsx` - Search integration

**Analysis**:

- ❌ Uses Next.js navigation hooks
- ❌ App-specific menu structures
- ✅ Layout patterns are reusable

**What Can Move**:

- Generic header/footer layout patterns
- Breadcrumb logic with custom resolvers

**What Must Stay**:

- App-specific navigation menus
- Route-dependent components

---

### 15. **product/** - Product Display

**Sample Files**:

- `ProductGallery.tsx` - Uses Next.js Image
- `ProductDescription.tsx` - Pure content display
- `ReviewForm.tsx` - Uses app services
- `ProductVariants.tsx` - Selection logic

**Analysis**:

- ⚠️ Gallery uses Next.js Image for optimization
- ✅ Variant selection logic is pure
- ❌ Review submission uses Firebase services

**What Can Move**:

- Gallery logic with generic image component
- Variant selection state management
- Display components

**What Must Stay**:

- `ReviewForm.tsx` - Firebase integration
- `SellerProducts.tsx` - Data fetching

---

### 16. **products/** - Product Features

**Sample Files**:

- `CompareButton.tsx` - Uses ComparisonContext
- `ComparisonBar.tsx` - Context-dependent
- `RecentlyViewedWidget.tsx` - LocalStorage logic

**Analysis**:

- ⚠️ Uses app-specific context
- ✅ Core logic (comparison, history) is extractable

**What Can Move**:

- Comparison logic → Utility functions
- Recently viewed tracking → Generic hook

**What Must Stay**:

- Context providers tied to app

---

### 17. **search/** - Search Components

**Sample Files**:

- `SearchFilters.tsx` - Pure filter logic
- `SearchResults.tsx` - Display component

**Analysis**:

- ✅ Filter logic is framework-agnostic
- ✅ No routing dependencies
- ⚠️ Uses app-specific types

**What Can Move**:

- Filter state management
- Search UI components

**What Must Stay**:

- Type-specific implementations

---

### 18. **seller/** - Seller Dashboard

**Sample Files**:

- `SellerSidebar.tsx` - Uses Next.js Link/usePathname
- `ShopSelector.tsx` - Uses shopsService
- `ProductTable.tsx` - Data management
- `AnalyticsOverview.tsx` - Chart display

**Analysis**:

- ❌ Heavy Next.js routing dependencies
- ❌ Firebase service integrations
- ✅ Chart/analytics display logic is reusable

**What Can Move**:

- Chart components
- Table display logic
- Form components

**What Must Stay**:

- Sidebar navigation
- Service calls
- Shop management

---

### 19. **shop/** - Shop Pages

**Sample Files**:

- `ShopHeader.tsx` - Uses shopsService
- `ShopTabs.tsx` - Tab navigation
- `ShopStats.tsx` - Pure display

**Analysis**:

- ❌ Service dependencies for follow/unfollow
- ✅ Display components are pure
- ⚠️ Tab logic is reusable

**What Can Move**:

- Stats display components
- Tab layout patterns

**What Must Stay**:

- Shop follow logic (Firebase)
- Data fetching

---

### 20. **category/** - Category Components

**Sample Files**:

- `CategoryTree.tsx` - Uses react-d3-tree
- `CategoryHeader.tsx` - Display component
- `CategoryProducts.tsx` - Product listing

**Analysis**:

- ✅ Tree visualization is reusable
- ⚠️ Data fetching is app-specific
- ✅ Display components are pure

**What Can Move**:

- `CategoryTree.tsx` - Generic tree component
- Layout components

**What Must Stay**:

- Data fetching components

---

### 21. **events/** - Event Components

**Sample Files**:

- `EventCard.tsx` - Uses Next.js Link
- `EventCountdown.tsx` - Pure timer logic
- `PollVoting.tsx` - Voting logic

**Analysis**:

- ⚠️ Uses Next.js Link
- ✅ Countdown logic is pure
- ❌ Voting tied to backend

**What Can Move**:

- Countdown component
- Event display logic

**What Must Stay**:

- Navigation links
- Voting integration

---

### 22. **cards/** - Card Components

**Sample Files**:

- `ProductCard.tsx` - Uses Link, FavoriteButton, CompareButton
- `AuctionCard.tsx` - Similar to ProductCard
- `ShopCard.tsx` - Shop display

**Analysis**:

- ⚠️ Uses Next.js Link for navigation
- ⚠️ Uses app-specific buttons (Favorite, Compare)
- ✅ Display logic is reusable

**What Can Move**:

- Card layout patterns with render props
- Status badge logic

**What Must Stay**:

- Integration with app contexts

---

### 23. **wizards/** - Multi-Step Forms

**Sample Files**:

- `CategorySelectionStep.tsx` - Uses CategorySelectorWithCreate
- `BusinessAddressStep.tsx` - Form step
- `ShopSelectionStep.tsx` - Shop selection

**Analysis**:

- ✅ Step logic is reusable
- ❌ Specific selectors use app services
- ✅ Form flow patterns are generic

**What Can Move**:

- Wizard state management
- Step navigation logic

**What Must Stay**:

- Specific form integrations

---

### 24. **user/** - User Components

**Sample Files**:

- `UserSidebar.tsx` - Uses Next.js Link/usePathname

**Analysis**:

- ❌ Tightly coupled to routing
- ✅ Sidebar layout pattern is reusable

**What Can Move**:

- Generic sidebar layout

**What Must Stay**:

- Route-specific navigation

---

## 🔴 MUST STAY (Tightly Coupled to App)

These are fundamentally tied to the app's architecture and cannot be meaningfully separated.

### 25. **providers/** - App Providers

**Sample Files**:

- `QueryProvider.tsx` - React Query setup
- `DynamicProviders.tsx` - Context providers

**Analysis**:

- ❌ App-specific provider configuration
- ❌ Imports app-specific contexts
- ❌ No value in extracting

**Reason to Stay**:

- Configures app-wide state management
- Imports from multiple app contexts

---

### 26. **admin/** - Admin Pages

**Sample Files**:

- `AdminSidebar.tsx` - Uses Next.js Link/usePathname
- `AdminResourcePage.tsx` - CRUD operations
- `AdminPageHeader.tsx` - Page header

**Analysis**:

- ❌ Heavy Next.js routing
- ❌ App-specific resource management
- ❌ Firebase admin operations

**Reason to Stay**:

- Admin panel is app-specific
- Routing and permissions are coupled

---

### 27. **common/** - Mixed Utilities

**Status**: Many already migrated to react-library

- `ErrorBoundary.tsx` - Needs error logging service
- Other common utilities already in react-library

**Analysis**:

- ✅ Many already migrated
- ⚠️ Some use app-specific services

---

### 28. **forms/** - Form Components

**Status**: Empty directory in workspace listing

---

## Migration Priority Recommendations

### Phase 1: High-Value, Low-Effort (Move Immediately)

1. ✅ **mobile/** - Complete directory (11 components)
2. ✅ **skeletons/** - All skeleton components
3. ✅ **ui/** - Pure components (Textarea, Checkbox, etc.)
4. ✅ **faq/** - FAQ accordion logic

**Estimated Impact**: ~20-30 components, 0 breaking changes

---

### Phase 2: Medium-Effort Refactoring

1. 🔧 **media/** - Extract image/video processing utilities
2. 🔧 **search/** - Filter logic and components
3. 🔧 **navigation/** - Generic tab components
4. 🔧 **auction/** - Pure display components

**Estimated Impact**: ~15-20 components, minor API changes

---

### Phase 3: Heavy Refactoring (Wrapper Pattern)

1. 🔧 **cards/** - Create generic card with render props
2. 🔧 **product/** - Separate display from data fetching
3. 🔧 **seller/** - Extract analytics/chart components
4. 🔧 **wizards/** - Generic wizard state management

**Estimated Impact**: ~25-35 components, significant refactoring

---

### Phase 4: Extract Business Logic Only

1. 🔧 **cart/** - Calculation utilities
2. 🔧 **checkout/** - Form validation logic
3. 🔧 **products/** - Comparison/history utilities

**Estimated Impact**: ~10-15 utility functions

---

### Not Recommended for Migration

- ❌ **auth/** - Tied to Firebase
- ❌ **providers/** - App-specific setup
- ❌ **admin/** - Admin-specific logic
- ❌ **layout/** - App navigation structure
- ❌ **homepage/** - App-specific sections

---

## Technical Patterns for Migration

### Pattern 1: Generic Card with Render Props

```typescript
// react-library/components/ui/Card.tsx
export function Card({ renderLink, renderImage, children }: CardProps) {
  return (
    <div className="card">
      {renderLink(renderImage(<img src={src} />))}
      {children}
    </div>
  );
}

// Main app wrapper
export function ProductCard(props) {
  return (
    <Card
      renderLink={(children) => <Link href={href}>{children}</Link>}
      renderImage={(img) => <Image {...imageProps} />}
    >
      {/* content */}
    </Card>
  );
}
```

### Pattern 2: Extract Business Logic

```typescript
// react-library/utils/cart/calculations.ts
export function calculateCartTotal(items: CartItem[]) {
  // Pure calculation logic
}

// Main app component
import { calculateCartTotal } from "@letitrip/react-library";

function CartSummary() {
  const total = calculateCartTotal(items);
  return <div>{total}</div>;
}
```

### Pattern 3: Generic Hooks

```typescript
// react-library/hooks/useRecentlyViewed.ts
export function useRecentlyViewed<T>(key: string, maxItems = 10) {
  // Generic localStorage tracking
}

// Main app
const { items, addItem } = useRecentlyViewed<Product>("products", 20);
```

---

## Summary Statistics

| Category                 | Count              | Percentage |
| ------------------------ | ------------------ | ---------- |
| **Fully Migratable**     | ~40-50 components  | 25-30%     |
| **Partially Migratable** | ~80-100 components | 45-50%     |
| **Must Stay**            | ~40-50 components  | 25-30%     |

**Total Components Analyzed**: ~160-200 files across 28 directories

---

## Next Steps

1. ✅ Start with Phase 1 (mobile/, skeletons/, ui/)
2. 📝 Create migration tasks for each phase
3. 🧪 Set up testing for migrated components
4. 📚 Document migration patterns
5. 🔄 Gradually refactor partially migratable components

---

## Notes

- Many "common" components already exist in react-library
- Focus on high-value, reusable components first
- Maintain backward compatibility during migration
- Use wrapper pattern for Next.js-specific features
- Extract business logic before UI components
