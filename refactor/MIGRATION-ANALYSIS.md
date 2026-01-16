# Component Migration Analysis - Main App to React Library

## Executive Summary

**Total Remaining Components**: ~470 files  
**Migration Potential**: 70-75% can be fully or partially migrated  
**Estimated New Library Components**: +60-90 components

---

## Migration Categories

### 🟢 FULLY MIGRATABLE (~25-30%)

Components with zero framework dependencies - can be moved entirely to library.

#### **mobile/** (100% migratable)

- Pure React gesture handling, no Next.js/Firebase deps
- Components: MobileHeader, MobileMenu, MobileNav, Swipeable drawer components
- **Action**: Direct migration to `react-library/src/components/mobile/`

#### **skeletons/** (100% migratable)

- Loading states, pure presentational
- Components: ProductListSkeleton, ProductCardSkeleton, OrderCardSkeleton, UserProfileSkeleton
- **Action**: Move to `react-library/src/components/skeletons/`

#### **ui/** (90% migratable)

- Base UI components
- Migratable: Textarea, Checkbox, Text, Heading, FormLayout, FormActions
- Already migrated: Button, Card
- **Action**: Move remaining to `react-library/src/components/ui/`

#### **faq/** (100% migratable)

- Accordion logic, pure React
- Components: FAQAccordion, FAQItem, FAQCategory
- **Action**: Move to `react-library/src/components/faq/`

#### **legal/** (100% migratable)

- Layout wrappers for legal content
- Components: LegalLayout, LegalSidebar
- **Action**: Move to `react-library/src/components/legal/`

---

### 🟡 PARTIALLY MIGRATABLE (~45-50%)

Components with extractable business logic - split into library component + Next.js wrapper.

#### **auth/** (60% migratable)

**Fully Migratable**:

- `OTPInput.tsx` - Pure input component
- `PhoneVerificationModal.tsx` - UI only (pass auth callbacks as props)
- `EmailVerificationModal.tsx` - UI only
- `MFAEnrollment.tsx` - Form UI (pass enrollment callbacks)

**Must Stay** (Framework-dependent):

- `AuthGuard.tsx` - Uses `useAuth` context, Next.js navigation
- `VerificationGate.tsx` - Uses `useAuth` context
- `GoogleSignInButton.tsx` - Firebase Google auth

**Pattern**: Extract UI → Accept auth state/callbacks as props

```typescript
// Library version
export function PhoneVerificationModal({
  isOpen,
  onClose,
  onVerify: (code: string) => Promise<void>,
  phoneNumber
}) { ... }

// Main app wrapper
import { PhoneVerificationModal as LibModal } from '@letitrip/react-library'
export function PhoneVerificationModal({ isOpen, onClose }) {
  const { verifyPhone } = useAuth()
  return <LibModal isOpen={isOpen} onClose={onClose} onVerify={verifyPhone} />
}
```

---

#### **cart/** & **checkout/** (70% migratable)

**Extractable Logic**:

- Cart calculations (totals, discounts, shipping)
- Checkout step validation
- Order summary displays
- Payment method selection UI
- Address selection UI

**Must Stay**:

- Firebase cart persistence
- Checkout flow orchestration (API calls)
- Payment gateway integrations
- Navigation between steps

**Components**:

- `CartSummary.tsx` - Calculation logic → Library (accept items, discounts as props)
- `CheckoutSteps.tsx` - Step UI → Library (pass current step, validation)
- `OrderSummary.tsx` - Display → Library
- `AddressSelector.tsx` - UI → Library (already have AddressSelectorWithCreate)
- `PaymentMethodSelector.tsx` - UI → Library (pass methods as props)

**Pattern**: Extract presentational components with calculation logic, inject data/callbacks

---

#### **product/** & **cards/** (65% migratable)

**Extractable**:

- Product display layouts
- Gallery components (accept custom Image component)
- Review rendering
- Variant selector UI
- Product info formatting

**Must Stay**:

- Data fetching hooks
- Add to cart actions (Firebase)
- Favorite button (Firebase)
- Routing to product pages

**Key Components**:

**ProductGallery.tsx** (Next.js Image):

```typescript
// Library version
export function ProductGallery<TImage>({
  images,
  ImageComponent, // Inject Next.js Image or standard img
  alt
}) { ... }

// Main app wrapper
import { ProductGallery as LibGallery } from '@letitrip/react-library'
import Image from 'next/image'
export function ProductGallery(props) {
  return <LibGallery {...props} ImageComponent={Image} />
}
```

**ProductCard** (Link navigation):

```typescript
// Library version
export function ProductCard({
  product,
  LinkComponent, // Inject Next.js Link
  onFavorite, // Inject Firebase action
  ...props
}) { ... }

// Main app wrapper
import { ProductCard as LibCard } from '@letitrip/react-library'
import Link from 'next/link'
export function ProductCard(props) {
  const { addToFavorites } = useFavorites() // Firebase
  return <LibCard {...props} LinkComponent={Link} onFavorite={addToFavorites} />
}
```

**Migratable Files**:

- ProductGallery.tsx (with Image injection)
- ProductDescription.tsx (formatting)
- ProductInfo.tsx (display)
- ProductVariants.tsx (selector UI - already have ProductVariantSelector)
- ReviewList.tsx (display only, pass reviews as props)
- ReviewForm.tsx (form UI, pass submit callback)

---

#### **seller/** & **admin/** (50% migratable)

**Extractable**:

- Dashboard stat cards
- Analytics chart components
- Resource list displays (products, orders, etc.)
- Form UIs (product form, auction form)
- Inline editing components

**Must Stay**:

- Dashboard navigation/sidebar (routing)
- Data fetching logic
- Firebase update operations
- Admin auth guards

**Key Components**:

**AnalyticsOverview.tsx**:

- Extract chart rendering → Library (accept data as props)
- Keep data fetching in main app

**AuctionForm.tsx**:

- Extract form fields → Library
- Keep Firebase submission in main app

**ProductImageManager.tsx**:

- Image upload UI → Library (already have ImageUploadWithCrop)
- Firebase storage calls → Main app

**SalesChart.tsx**:

- Chart component → Library (accept data, config)
- Data aggregation → Main app

**Pattern**: Presentational components in library, data layer in main app

---

#### **shop/** (60% migratable)

**Extractable**:

- Shop display components (header, about, stats)
- Review rendering
- Product grid layouts
- Tab navigation UI (with routing injection)

**Must Stay**:

- Shop data fetching
- Follow/unfollow (Firebase)
- Shop routing

**Components**:

- ShopHeader.tsx - Layout → Library (pass shop data as props)
- ShopAbout.tsx - Display → Library
- ShopStats.tsx - Stats display → Library
- ShopReviews.tsx - Review list → Library (already have reviews in library)
- ShopTabs.tsx - Tab UI → Library (inject Link, usePathname)
- ShopProducts.tsx - Product grid → Library (pass products, use extracted ProductCard)
- ShopAuctions.tsx - Auction grid → Library

---

#### **navigation/** (80% migratable)

**TabNav.tsx** - High value!

```typescript
// Library version
export function TabNav({
  items,
  currentPath, // Inject from usePathname
  LinkComponent, // Inject Next.js Link
  onNavigate // Optional callback
}) { ... }

// Main app wrapper
import { TabNav as LibTabNav } from '@letitrip/react-library'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function TabNav(props) {
  const pathname = usePathname()
  return <LibTabNav {...props} currentPath={pathname} LinkComponent={Link} />
}
```

**Other navigation**:

- Breadcrumbs.tsx - Similar pattern
- Pagination components - Already in library
- TabbedLayout.tsx - Layout wrapper (inject tabs)

---

#### **search/** (70% migratable)

**Extractable**:

- Filter UI components
- Search bar UI
- Filter state management

**Must Stay**:

- Search API calls
- URL param synchronization (useUrlFilters - already in library!)

**Components**:

- SearchFilters.tsx - UI → Library (already have multiple filter components)
- Search bar components - Already migrated (SearchBar, SearchInput)

---

#### **media/** (80% migratable)

**Components**:

- Image gallery displays
- Video players
- Image lightbox
- Already have: ImageUploadWithCrop, VideoUploadWithThumbnail

**Extractable**: Display components (inject custom Image component)  
**Must Stay**: Upload to Firebase Storage

---

#### **wizards/** (60% migratable)

**Wizard Components Already in Library**:

- WizardForm
- WizardSteps
- WizardActionBar

**Step Components** (Main app):

- ShopSelectionStep.tsx - Form UI → Library (pass shops, onSelect)
- CategorySelectionStep.tsx - Form UI → Library
- BusinessAddressStep.tsx - Form UI → Library (use SmartAddressForm from library)
- ContactInfoStep.tsx - Form UI → Library
- RequiredInfoStep.tsx - Form UI → Library (uses Next.js Image - inject it)

**Pattern**: Extract step UI, pass data/callbacks from main app wizard orchestrator

---

### 🔴 MUST STAY (~25-30%)

Components too tightly coupled to Next.js/Firebase/app architecture.

#### **providers/**

- QueryProvider.tsx - App-specific setup
- DynamicProviders.tsx - Uses next/dynamic
- AuthProvider, CartProvider, etc. - Firebase context

#### **layout/**

- Header.tsx - App navigation structure
- Footer.tsx - App-specific links
- MainNavBar.tsx - Uses useAuth, app routing
- Sidebar.tsx - App navigation
- BottomNav.tsx - Uses useAuth
- MobileSidebar.tsx - Uses useAuth, app routing

#### **homepage/**

- Hero sections - App-specific content
- Feature sections - App copy
- Category showcase - Data fetching from Firebase

**Note**: Some layout components could have UI extracted, but value is low (highly app-specific)

---

## Migration Priority

### Phase 1: Quick Wins (Immediate) - 0 Breaking Changes

**Directories**: mobile/, skeletons/, ui/, faq/, legal/  
**Estimated**: 25-35 components  
**Effort**: Low (direct copy)  
**Risk**: None (no dependencies)

**Steps**:

1. Copy directories to react-library
2. Update imports in main app
3. Delete duplicates
4. Commit

---

### Phase 2: Pure UI Components (Short-term) - Minimal Changes

**Components**: media/ displays, navigation/ (with injection), parts of search/  
**Estimated**: 15-25 components  
**Effort**: Low-Medium (add props for injection)  
**Risk**: Low (wrapper pattern)

**Steps**:

1. Add injection props (LinkComponent, ImageComponent, currentPath)
2. Move to library
3. Create Next.js wrappers in main app
4. Test routing/navigation

---

### Phase 3: Business Logic Extraction (Medium-term) - Moderate Refactoring

**Components**: cart/, checkout/, product/, cards/, shop/, seller/ analytics  
**Estimated**: 30-45 components  
**Effort**: Medium-High (split logic from services)  
**Risk**: Medium (ensure all callbacks work)

**Pattern**:

1. Extract presentational component → Library
2. Accept data + callbacks as props
3. Create wrapper that fetches data, provides callbacks
4. Move Firebase/API calls to services
5. Test data flow

**Example - CartSummary**:

```typescript
// Library: CartCalculations + CartSummary UI
export function calculateCartTotals(items, discounts, shipping) { ... }
export function CartSummary({ totals, discounts, onApplyDiscount }) { ... }

// Main app: Data + callbacks
import { CartSummary as LibSummary, calculateCartTotals } from '@letitrip/react-library'
export function CartSummary() {
  const { cartItems } = useCart() // Firebase
  const totals = calculateCartTotals(cartItems, ...)
  const handleApplyDiscount = async (code) => { /* Firebase */ }
  return <LibSummary totals={totals} onApplyDiscount={handleApplyDiscount} />
}
```

---

### Phase 4: Complex Refactoring (Long-term) - Heavy Lifting

**Components**: wizards/ steps, seller/ forms, admin/ complex components  
**Estimated**: 20-30 components  
**Effort**: High (significant restructuring)  
**Risk**: High (complex integrations)

**Approach**:

1. Design clear interfaces for step data/validation
2. Extract step UI components
3. Keep orchestration in main app
4. Thorough integration testing

---

## Technical Patterns

### 1. **Dependency Injection Pattern**

For components needing framework-specific features:

```typescript
// Library component
export interface NavigationProps {
  LinkComponent: React.ComponentType<{
    href: string;
    children: React.ReactNode;
  }>;
  currentPath?: string;
  onNavigate?: (href: string) => void;
}

export function LibraryComponent({
  LinkComponent,
  currentPath,
  ...props
}: NavigationProps) {
  return (
    <LinkComponent href="/path">
      <span className={currentPath === "/path" ? "active" : ""}>Link</span>
    </LinkComponent>
  );
}
```

```typescript
// Main app wrapper
import { LibraryComponent } from "@letitrip/react-library";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppComponent(props) {
  const pathname = usePathname();
  return (
    <LibraryComponent {...props} LinkComponent={Link} currentPath={pathname} />
  );
}
```

### 2. **Render Props Pattern**

For custom rendering of nested elements:

```typescript
// Library
export function ProductCard({ product, renderLink, renderImage }) {
  return (
    <div>
      {renderLink(product.slug, renderImage(product.image, product.title))}
    </div>
  );
}
```

```typescript
// Main app
import Link from "next/link";
import Image from "next/image";
import { ProductCard as LibCard } from "@letitrip/react-library";

export function ProductCard({ product }) {
  return (
    <LibCard
      product={product}
      renderLink={(href, children) => <Link href={href}>{children}</Link>}
      renderImage={(src, alt) => (
        <Image src={src} alt={alt} width={300} height={300} />
      )}
    />
  );
}
```

### 3. **Callback Injection Pattern**

For components with side effects:

```typescript
// Library - Pure UI + local state
export function ReviewForm({ onSubmit, productId, userId }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    onSubmit({ productId, userId, rating, comment });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

```typescript
// Main app - Firebase integration
import { ReviewForm as LibForm } from "@letitrip/react-library";
import { addReview } from "@/services/reviewService";

export function ReviewForm({ productId }) {
  const { user } = useAuth();

  const handleSubmit = async (reviewData) => {
    await addReview(reviewData); // Firebase call
  };

  return (
    <LibForm productId={productId} userId={user?.uid} onSubmit={handleSubmit} />
  );
}
```

### 4. **Adapter Interface Pattern**

For complex framework integrations:

```typescript
// Library - Define interface
export interface RoutingAdapter {
  Link: React.ComponentType<LinkProps>;
  usePathname: () => string;
  navigate: (href: string) => void;
}

export function TabNavigation({
  items,
  routing,
}: {
  items: Tab[];
  routing: RoutingAdapter;
}) {
  const { Link, usePathname, navigate } = routing;
  const currentPath = usePathname();
  // Use routing throughout component
}
```

```typescript
// Main app - Provide Next.js adapter
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  TabNavigation as LibTabNav,
  RoutingAdapter,
} from "@letitrip/react-library";

const nextRoutingAdapter: RoutingAdapter = {
  Link,
  usePathname,
  navigate: (href) => useRouter().push(href),
};

export function TabNavigation(props) {
  return <LibTabNav {...props} routing={nextRoutingAdapter} />;
}
```

---

## Expected Outcomes

### Library Growth

- **Current**: ~82 components
- **Phase 1**: +30 = 112 components
- **Phase 2**: +20 = 132 components
- **Phase 3**: +35 = 167 components
- **Phase 4**: +25 = **~190 components**

### Main App Reduction

- **Current**: ~470 files
- **After Migration**: ~280 files (40% reduction)
- **Remaining**: Thin wrappers, providers, layouts, app-specific pages

### Code Reusability

- **Framework Independence**: Library usable in Next.js, Remix, Vite apps
- **Testing**: Easier unit testing of library components (no mocking Next.js)
- **Maintenance**: Centralized component logic, app-specific wrappers minimal

### Architecture Benefits

- Clear separation: Library = presentation/logic, Main app = integration/routing
- Consistent patterns: All framework dependencies injected via props
- Better TypeScript: Explicit interfaces for framework adapters
- Easier migration: Future framework changes only affect thin wrapper layer

---

## Recommendations

### Immediate Actions

1. **Start with Phase 1**: Low risk, high value
2. **Create adapter interfaces**: Define routing, image, auth adapter types in library
3. **Document patterns**: Add examples to library docs

### Best Practices

- Always inject framework dependencies (Link, Image, routing hooks)
- Keep wrappers thin (< 20 lines of code)
- Extract business logic first, then UI
- Test library components in isolation (no Next.js mocks)
- Document injection requirements in component props

### Avoid

- Tight coupling to Firebase in library components
- Next.js-specific features in library (middleware, server components initially)
- App-specific content in library (copy, images, hardcoded data)
- Over-abstracting (don't add injection if component never needs it)

---

## Next Steps

1. **Review this analysis** - Confirm migration priorities
2. **Create tracking document** - List all components with migration status
3. **Begin Phase 1** - Migrate mobile/, skeletons/, ui/ directories
4. **Design adapters** - Create routing, image adapter interfaces
5. **Test patterns** - Validate injection patterns with 2-3 Phase 2 components
6. **Scale migration** - Continue through phases based on priority

---

## Questions for Consideration

1. **Server Components**: How to handle React Server Components in library?

   - Keep library client-side only initially
   - Add server component support later with "use client" directives

2. **State Management**: Should library components use internal state or expect external state?

   - Use internal state for UI-only (dropdowns, modals)
   - Expect external state for data (products, cart)

3. **Styling**: Continue with Tailwind in library?

   - Yes, library already uses Tailwind
   - Apps can customize with Tailwind config

4. **TypeScript**: How strict should library types be?

   - Very strict (helps consumers)
   - Export all interfaces used in props

5. **Testing**: Test library components with Next.js wrappers or separately?
   - Separately (library tests = pure React)
   - Integration tests in main app (test wrappers)
