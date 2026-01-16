# Component Migration Implementation Tracker

**Goal**: Migrate 70-75% of main app components to react-library  
**Status**: 🟡 In Progress  
**Started**: January 16, 2026  
**Current Phase**: Phase 1 - Quick Wins

---

## Overall Progress

- [ ] **Phase 1**: Quick Wins - Fully Migratable Components (0/35 complete)
- [ ] **Phase 2**: Pure UI Components with Injection (0/20 complete)
- [ ] **Phase 3**: Business Logic Extraction (0/35 complete)
- [ ] **Phase 4**: Complex Refactoring (0/25 complete)

**Total**: 0/115 components migrated (0%)

---

## Phase 1: Quick Wins (Immediate Priority)

**Effort**: Low | **Risk**: None | **Dependencies**: Zero

### 1.1 Mobile Components ✅ Ready

**Directory**: `src/components/mobile/` → `react-library/src/components/mobile/`  
**Files**: 11 components + tests

- [ ] MobileActionSheet.tsx
- [ ] MobileAdminSidebar.tsx (⚠️ Check: Uses Link, usePathname - may need injection)
- [ ] MobileBottomSheet.tsx
- [ ] MobileDataTable.tsx
- [ ] MobileInstallPrompt.tsx
- [ ] MobileOfflineIndicator.tsx
- [ ] MobilePullToRefresh.tsx
- [ ] MobileQuickActions.tsx
- [ ] MobileSellerSidebar.tsx (⚠️ Check: Uses Link, usePathname - may need injection)
- [ ] MobileSkeleton.tsx
- [ ] MobileSwipeActions.tsx
- [ ] Copy **tests**/ directory

**Actions**:

1. Check MobileAdminSidebar & MobileSellerSidebar for Next.js dependencies
2. If dependencies found, apply injection pattern or defer to Phase 2
3. Copy remaining pure components to library
4. Update imports in main app
5. Delete migrated files
6. Test mobile views

---

### 1.2 Skeleton Components ✅ Ready

**Directory**: `src/components/skeletons/` → `react-library/src/components/skeletons/`  
**Files**: 5 components (pure presentational)

- [ ] index.ts
- [ ] OrderCardSkeleton.tsx
- [ ] ProductCardSkeleton.tsx
- [ ] ProductListSkeleton.tsx
- [ ] UserProfileSkeleton.tsx

**Actions**:

1. Copy entire directory to library
2. Update imports in main app (search for imports from `@/components/skeletons`)
3. Delete main app directory
4. Verify no broken imports

---

### 1.3 UI Components ✅ Ready

**Directory**: `src/components/ui/` → `react-library/src/components/ui/`  
**Files**: 9 components (BaseCard may need review)

- [ ] BaseCard.tsx (⚠️ Check: May use Next.js Link)
- [ ] BaseTable.tsx
- [ ] Checkbox.tsx
- [ ] FormActions.tsx
- [ ] FormLayout.tsx
- [ ] Heading.tsx
- [ ] Text.tsx
- [ ] Textarea.tsx
- [ ] Copy **tests**/ if exists

**Actions**:

1. Check BaseCard.tsx for Link usage (found in earlier search)
2. If uses Link, apply injection pattern or defer
3. Copy remaining components to library
4. Update imports in main app
5. Delete migrated files

---

### 1.4 FAQ Components ✅ Ready

**Directory**: `src/components/faq/` → `react-library/src/components/faq/`  
**Files**: 2 components (accordion logic)

- [ ] FAQItem.tsx
- [ ] FAQSection.tsx

**Actions**:

1. Copy directory to library
2. Update imports in main app
3. Delete main app directory
4. Test FAQ pages

---

### 1.5 Legal Components ✅ Ready

**Directory**: `src/components/legal/` → `react-library/src/components/legal/`  
**Files**: 1 component (layout wrapper)

- [ ] LegalPageLayout.tsx

**Actions**:

1. Copy to library
2. Update imports in legal pages
3. Delete main app file
4. Test legal pages (terms, privacy, etc.)

---

### 1.6 Phase 1 Cleanup

- [ ] Run grep search to find all imports: `@/components/(mobile|skeletons|ui|faq|legal)`
- [ ] Update all imports to use `@letitrip/react-library`
- [ ] Run build: `npm run build`
- [ ] Fix any TypeScript errors
- [ ] Run tests: `npm test`
- [ ] Commit changes: "refactor: migrate Phase 1 components to react-library"

**Expected Outcome**: ~27-35 components migrated, 0 breaking changes

---

## Phase 2: Pure UI with Injection (Short-term Priority)

**Effort**: Low-Medium | **Risk**: Low | **Dependencies**: Wrapper pattern

### 2.1 Navigation Components (High Value)

**TabNav.tsx** - Critical component used throughout app

**Current Dependencies**:

- `Link` from next/link
- `usePathname` from next/navigation

**Migration Steps**:

- [ ] Create library version accepting `LinkComponent`, `currentPath` props
- [ ] Create Next.js wrapper in main app
- [ ] Update all usages to use wrapper
- [ ] Test navigation throughout app
- [ ] Delete old implementation

**Code Pattern**:

```typescript
// Library: react-library/src/components/navigation/TabNav.tsx
export interface TabNavProps {
  items: TabItem[];
  currentPath: string;
  LinkComponent: React.ComponentType<{ href: string; children: ReactNode }>;
  className?: string;
}

// Main app: src/components/navigation/TabNav.tsx
import { TabNav as LibTabNav } from "@letitrip/react-library";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function TabNav(
  props: Omit<TabNavProps, "currentPath" | "LinkComponent">
) {
  return (
    <LibTabNav {...props} currentPath={usePathname()} LinkComponent={Link} />
  );
}
```

**Other Navigation**:

- [ ] TabbedLayout.tsx (inject TabNav)
- [ ] Breadcrumbs.tsx (similar pattern)

---

### 2.2 Media Components

**Files**:

- [ ] ProductGallery.tsx (inject Image component)
- [ ] Other image display components

**Pattern**: Accept `ImageComponent` prop for Next.js Image or standard img

---

### 2.3 Search Components

**Files**:

- [ ] SearchFilters.tsx (UI only, already have filter components in library)

---

### 2.4 Phase 2 Cleanup

- [ ] Update all component imports
- [ ] Test routing and navigation
- [ ] Test image optimization
- [ ] Commit: "refactor: migrate Phase 2 UI components with injection"

**Expected Outcome**: ~20 components migrated

---

## Phase 3: Business Logic Extraction (Medium-term Priority)

**Effort**: Medium-High | **Risk**: Medium | **Dependencies**: Callback injection

### 3.1 Cart Components

**CartSummary.tsx**:

- [ ] Extract calculation logic to library utils
- [ ] Create CartSummary UI component accepting totals as props
- [ ] Create wrapper that fetches cart data and calculates
- [ ] Test cart calculations
- [ ] Test discount application

**Other Cart**:

- [ ] CartItem display
- [ ] Cart actions (accept callbacks)

---

### 3.2 Checkout Components

**CheckoutSteps.tsx**:

- [ ] Extract step UI to library
- [ ] Accept step validation callbacks
- [ ] Keep orchestration in main app
- [ ] Test checkout flow

**Other Checkout**:

- [ ] AddressSelector (already have AddressSelectorWithCreate in library)
- [ ] PaymentMethodSelector UI
- [ ] OrderSummary display

---

### 3.3 Product Components

**ProductCard** (High value - used everywhere):

- [ ] Extract display logic to library
- [ ] Accept `LinkComponent`, `onFavorite`, `onAddToCart` callbacks
- [ ] Create Next.js wrapper with Firebase actions
- [ ] Update all usages (product lists, search results, etc.)
- [ ] Test add to cart
- [ ] Test favorites

**ProductGallery**:

- [ ] Extract gallery UI (accept Image component)
- [ ] Keep in Phase 2 or here depending on complexity

**Other Product**:

- [ ] ProductDescription (formatting)
- [ ] ProductInfo (display)
- [ ] ReviewList (display - accept reviews as props)
- [ ] ReviewForm (form UI - accept submit callback)

---

### 3.4 Shop Components

**Files**:

- [ ] ShopHeader (layout, accept shop data)
- [ ] ShopAbout (display)
- [ ] ShopStats (stats display)
- [ ] ShopReviews (use library ReviewList)
- [ ] ShopTabs (use Phase 2 TabNav)
- [ ] ShopProducts (product grid, use Phase 3 ProductCard)
- [ ] ShopAuctions (auction grid)

---

### 3.5 Seller/Admin Components

**Analytics**:

- [ ] SalesChart (chart component, accept data)
- [ ] AnalyticsOverview (dashboard, accept stats)

**Forms**:

- [ ] AuctionForm (form UI, accept submit callback)
- [ ] ProductImageManager (use library ImageUploadWithCrop)

---

### 3.6 Phase 3 Cleanup

- [ ] Test all data flows (props → callbacks)
- [ ] Test Firebase integrations in wrappers
- [ ] Test routing in wrapped components
- [ ] Commit: "refactor: extract Phase 3 business logic to library"

**Expected Outcome**: ~35 components migrated

---

## Phase 4: Complex Refactoring (Long-term Priority)

**Effort**: High | **Risk**: High | **Dependencies**: Multiple patterns

### 4.1 Wizard Step Components

**Files**:

- [ ] ShopSelectionStep (form UI, accept shops, onSelect)
- [ ] CategorySelectionStep (form UI)
- [ ] BusinessAddressStep (use library SmartAddressForm)
- [ ] ContactInfoStep (form UI)
- [ ] RequiredInfoStep (form UI, inject Image)

**Pattern**: Extract step UI, keep wizard orchestration in main app

---

### 4.2 Complex Admin Components

**Files**:

- [ ] Admin resource lists (extract table logic)
- [ ] Admin bulk actions (extract UI, keep Firebase logic)
- [ ] Admin forms (extract field sets)

---

### 4.3 Complex Seller Components

**Files**:

- [ ] Seller dashboard complex widgets
- [ ] Seller advanced forms
- [ ] Seller analytics with interactivity

---

### 4.4 Phase 4 Cleanup

- [ ] Comprehensive integration testing
- [ ] Test all wizard flows
- [ ] Test admin operations
- [ ] Commit: "refactor: complete Phase 4 complex component migration"

**Expected Outcome**: ~25 components migrated

---

## Components That Must Stay

**Do NOT migrate** - Too app-specific or framework-dependent:

### Providers

- ❌ QueryProvider.tsx (app setup)
- ❌ DynamicProviders.tsx (uses next/dynamic)
- ❌ AuthProvider, CartProvider (Firebase context)

### Layout

- ❌ Header.tsx (app navigation)
- ❌ Footer.tsx (app links)
- ❌ MainNavBar.tsx (uses useAuth)
- ❌ Sidebar.tsx (app routing)
- ❌ BottomNav.tsx (uses useAuth)
- ❌ MobileSidebar.tsx (uses useAuth)

### Homepage

- ❌ Hero sections (app content)
- ❌ Feature sections (app copy)
- ❌ Category showcase (Firebase data)

### Auth Guards

- ❌ AuthGuard.tsx (uses useAuth, Next.js routing)
- ❌ VerificationGate.tsx (uses useAuth)
- ❌ GoogleSignInButton.tsx (Firebase auth)

---

## Testing Checklist

After each phase, verify:

### Build & Tests

- [ ] `npm run build` succeeds
- [ ] `npm test` passes
- [ ] No TypeScript errors
- [ ] No ESLint errors

### Functionality

- [ ] All pages load correctly
- [ ] Navigation works (links, tabs, routing)
- [ ] Forms submit correctly
- [ ] Images load and display
- [ ] Authentication flows work
- [ ] Cart operations work
- [ ] Checkout flow completes
- [ ] Admin operations work
- [ ] Seller operations work

### Performance

- [ ] No performance regression
- [ ] Bundle size acceptable
- [ ] No unnecessary re-renders

---

## Git Commit Strategy

### Phase 1

```bash
git add .
git commit -m "refactor(phase-1): migrate fully portable components to library

- Migrate mobile/ components (11 files)
- Migrate skeletons/ components (5 files)
- Migrate ui/ components (9 files)
- Migrate faq/ components (2 files)
- Migrate legal/ components (1 file)
- Update all imports to use @letitrip/react-library
- Delete migrated files from main app

Total: ~28 components migrated
Risk: None (zero dependencies)
Tests: All passing"
```

### Phase 2

```bash
git commit -m "refactor(phase-2): migrate UI components with dependency injection

- Migrate navigation components (TabNav, TabbedLayout, Breadcrumbs)
- Apply dependency injection pattern (LinkComponent, currentPath)
- Create Next.js wrappers in main app
- Migrate media components with Image injection
- Update all imports and usages

Total: ~20 components migrated
Pattern: Dependency injection for framework features
Tests: Navigation and routing verified"
```

### Phase 3

```bash
git commit -m "refactor(phase-3): extract business logic to library

- Extract cart calculation logic and UI
- Extract checkout step components
- Extract product display logic (ProductCard, ProductInfo)
- Extract shop components (ShopHeader, ShopStats, etc.)
- Extract analytics components (charts, dashboards)
- Apply callback injection for Firebase operations
- Create wrappers with data fetching and actions

Total: ~35 components migrated
Pattern: Presentational components + callback injection
Tests: All data flows and Firebase integrations verified"
```

### Phase 4

```bash
git commit -m "refactor(phase-4): complete complex component migration

- Extract wizard step UI components
- Extract complex admin components
- Extract complex seller components
- Keep orchestration logic in main app
- Comprehensive integration testing

Total: ~25 components migrated
Pattern: Complex refactoring with multiple patterns
Tests: All workflows end-to-end tested"
```

---

## Continuation Prompt

When you need to continue this migration work, use this prompt:

```
Continue the component migration from main app to react-library.

Current status: Check refactor/IMPLEMENTATION-TRACKER-V2.md for current phase and completed tasks.

Next steps:
1. Review the implementation tracker
2. Complete the current phase checklist items
3. Update the tracker with completed tasks
4. Test the changes
5. Commit with the appropriate commit message
6. Move to next phase or next task in current phase

Maintain the patterns established:
- Phase 1: Direct migration (no dependencies)
- Phase 2: Dependency injection (LinkComponent, ImageComponent, currentPath)
- Phase 3: Callback injection (onSubmit, onFavorite, onAddToCart)
- Phase 4: Complex refactoring (multiple patterns)

Update the tracker as you complete each task. Mark items as complete with ✅.
```

---

## Notes

### Key Decisions

1. **Wrapper Pattern**: All Next.js-specific features injected via props
2. **Thin Wrappers**: Main app wrappers < 20 lines of code
3. **Library Purity**: No Firebase, no Next.js imports in library
4. **Testing**: Library tests pure React, integration tests in main app

### Patterns Reference

- **Dependency Injection**: `LinkComponent`, `ImageComponent`, `currentPath` props
- **Callback Injection**: `onSubmit`, `onFavorite`, `onNavigate` props
- **Render Props**: `renderLink`, `renderImage` for custom rendering
- **Adapter Interface**: Full routing/image adapter objects for complex needs

### Common Issues

- **Import errors**: Update all `@/components/` to `@letitrip/react-library`
- **Type errors**: Ensure all injected props are properly typed
- **Build errors**: Check for missing dependencies in library package.json
- **Runtime errors**: Verify wrappers provide all required props

---

## Success Metrics

### Code Metrics

- **Library Growth**: 82 → ~190 components (+132%)
- **Main App Reduction**: ~470 → ~280 files (-40%)
- **Code Reusability**: 75% of components framework-agnostic

### Quality Metrics

- **Test Coverage**: Maintain >80% in both library and main app
- **Build Time**: No significant increase
- **Bundle Size**: No significant increase (tree-shaking helps)
- **TypeScript Strictness**: 100% strict mode compliance

### Maintenance Metrics

- **Wrapper Size**: Average < 15 lines per wrapper
- **Documentation**: All injection patterns documented
- **Developer Experience**: Clear patterns for adding new components

---

**Last Updated**: January 16, 2026  
**Next Review**: After Phase 1 completion
