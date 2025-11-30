# Component Consolidation Plan

> **Status**: 🟢 Form, Skeleton, Filter & Utility Components Complete
> **Priority**: Medium
> **Last Updated**: January 2025

## ✅ Form Components (COMPLETE)

All form components consolidated into `/src/components/forms/`:

| Unified Component | Replaces                     | Status      |
| ----------------- | ---------------------------- | ----------- |
| `FormInput`       | `Input`, `MobileFormInput`   | ✅ Complete |
| `FormTextarea`    | `Textarea`, `MobileTextarea` | ✅ Complete |
| `FormSelect`      | `Select`, `MobileFormSelect` | ✅ Complete |

**See**: [Form Component Migration](./10-form-component-migration.md)

## ✅ Skeleton Components (COMPLETE)

All skeleton components consolidated into `/src/components/cards/`:

| Unified Component         | Replaces                                | Status      |
| ------------------------- | --------------------------------------- | ----------- |
| `ProductCardSkeleton`     | `/common/skeletons/ProductCardSkeleton` | ✅ Complete |
| `ProductCardSkeletonGrid` | Grid wrapper added to same file         | ✅ Complete |
| `AuctionCardSkeleton`     | `/common/skeletons/AuctionCardSkeleton` | ✅ Complete |
| `AuctionCardSkeletonGrid` | Grid wrapper added to same file         | ✅ Complete |

Deleted duplicates:

- `/src/components/common/skeletons/` folder (removed entirely)
- `/src/components/common/LoadingSkeleton.tsx`
- `/src/components/common/ErrorState.tsx`

Mobile-specific skeletons renamed to avoid conflicts:

- `ProductCardSkeleton` → `MobileProductCardSkeleton` in `/components/mobile/MobileSkeleton.tsx`

## ✅ Filter Components (COMPLETE)

| Unified Component      | Replaces              | Status      |
| ---------------------- | --------------------- | ----------- |
| `UnifiedFilterSidebar` | `FilterSidebar`       | ✅ Complete |
| `UnifiedFilterSidebar` | `MobileFilterSidebar` | ✅ Complete |
| `UnifiedFilterSidebar` | `MobileFilterDrawer`  | ✅ Complete |

Deleted:

- `/src/components/common/FilterSidebar.tsx` - Types moved to UnifiedFilterSidebar
- `/src/components/common/MobileFilterSidebar.tsx` - Unused
- `/src/components/common/MobileFilterDrawer.tsx` - Unused

## ✅ Utility Components (COMPLETE)

| Unified Component | Replaces                   | Status      |
| ----------------- | -------------------------- | ----------- |
| `toast` (admin)   | `Toast` (common)           | ✅ Complete |
| `LoadingSpinner`  | Moved to `/common/`        | ✅ Complete |
| `PhoneInput`      | Renamed from `MobileInput` | ✅ Complete |
| `ErrorMessage`    | `ErrorState`               | ✅ Complete |

Deleted:

- `/src/components/common/Toast.tsx` - Using admin Toast global system
- Renamed `/common/MobileInput.tsx` → `/common/PhoneInput.tsx` (clearer naming)
- Moved `/admin/LoadingSpinner.tsx` → `/common/LoadingSpinner.tsx`

## Remaining Components to Review

### UI Components

| Keep        | Remove/Merge                   | Reason                        | Status     |
| ----------- | ------------------------------ | ----------------------------- | ---------- |
| `BaseCard`  | `Card`                         | Both serve different purposes | ⬜ Review  |
| `DataTable` | `ResponsiveTable`, `BaseTable` | Similar table implementations | ⬜ Pending |

### Notes on Non-Duplicates

These were reviewed and determined NOT to be duplicates:

- `SearchBar` (layout) vs `SearchBar` (common) - Different purposes (header search vs autocomplete)
- `ProductQuickView` vs `AuctionQuickView` - Domain-specific functionality
- `Card` vs `BaseCard` - Card is container, BaseCard is interactive link card

## Card Components Hierarchy

Create a proper inheritance pattern:

```
BaseCard (base styles, dark mode, responsive)
  ├── ProductCard (extends with product-specific UI)
  ├── AuctionCard (extends with auction-specific UI)
  ├── ShopCard (extends with shop-specific UI)
  ├── CategoryCard (extends with category-specific UI)
  ├── BlogCard (extends with blog-specific UI)
  └── ReviewCard (extends with review-specific UI)
```

### BaseCard Props

```tsx
interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "compact" | "horizontal";
  skeleton?: boolean;
}
```

## Fix Checklist

### Phase 1: Form Components ✅ COMPLETE

- [x] Merge Input + MobileFormInput → `FormInput`
- [x] Merge Textarea + MobileTextarea → `FormTextarea`
- [x] Merge Select + MobileFormSelect → `FormSelect`
- [x] Update all usages
- [x] Add responsive sizing (touch-optimized on mobile)
- [x] Add error icons
- [x] Add inputMode auto-detection

### Phase 2: Card Components

- [ ] Create unified BaseCard with variants
- [ ] Update ProductCard to extend BaseCard
- [ ] Update AuctionCard to extend BaseCard
- [ ] Update ShopCard to extend BaseCard
- [ ] Update CategoryCard to extend BaseCard
- [ ] Update BlogCard to extend BaseCard
- [ ] Update ReviewCard to extend BaseCard

### Phase 3: Table Components

- [ ] Add responsive support to DataTable
- [ ] Remove ResponsiveTable (duplicate)
- [ ] Update all usages

### Phase 4: Utility Components

- [x] Consolidate LoadingSkeleton + Skeleton → All now in `/cards/`
- [x] Consolidate ErrorState + ErrorMessage → Kept ErrorMessage only
- [ ] Consolidate Toast components
- [ ] Merge ProductQuickView + AuctionQuickView

## Component Organization

```
src/components/
├── ui/                    # Base UI primitives
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Textarea.tsx
│   ├── Checkbox.tsx
│   └── ...
├── cards/                 # Card components
│   ├── BaseCard.tsx
│   ├── ProductCard.tsx
│   ├── ProductCardSkeleton.tsx   # Includes ProductCardSkeletonGrid
│   ├── AuctionCard.tsx
│   ├── AuctionCardSkeleton.tsx   # Includes AuctionCardSkeletonGrid
│   ├── ShopCard.tsx
│   ├── ShopCardSkeleton.tsx
│   ├── CategoryCard.tsx
│   ├── CategoryCardSkeleton.tsx
│   ├── BlogCard.tsx
│   ├── ReviewCard.tsx
│   ├── CardGrid.tsx
│   └── index.ts              # Exports all cards and skeletons
├── common/                # Shared components
│   ├── DataTable.tsx
│   ├── FilterSidebar.tsx
│   ├── SearchBar.tsx
│   ├── Pagination.tsx
│   ├── StatusBadge.tsx
│   ├── ConfirmDialog.tsx
│   └── ...
├── forms/                 # Form components
│   ├── FormLayout.tsx
│   ├── FormActions.tsx
│   ├── DateTimePicker.tsx
│   ├── RichTextEditor.tsx
│   └── ...
├── layout/                # Layout components
│   ├── MainNavBar.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   └── ...
└── features/              # Feature-specific components
    ├── auth/
    ├── checkout/
    ├── auction/
    └── ...
```

## Testing After Consolidation

1. Run full test suite
2. Visual regression testing on key pages
3. Check component storybook (if exists)
4. Test on mobile devices
5. Test dark mode on all components
