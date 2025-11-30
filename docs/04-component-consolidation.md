# Component Consolidation Plan

> **Status**: 🟡 Ready for Implementation
> **Priority**: Medium
> **Last Updated**: November 30, 2025

## Duplicate Components to Merge

### UI Components

| Keep               | Remove/Merge       | Reason                          |
| ------------------ | ------------------ | ------------------------------- |
| `Input`            | `MobileInput`      | Use responsive design instead   |
| `Textarea`         | `MobileTextarea`   | Use responsive design instead   |
| `Select`           | `MobileFormSelect` | Use responsive design instead   |
| `BaseCard`         | `Card`             | Consolidate to single component |
| `DataTable`        | `ResponsiveTable`  | Keep DataTable, add responsive  |
| `LoadingSkeleton`  | `Skeleton`         | Keep one skeleton component     |
| `ErrorState`       | `ErrorMessage`     | Consolidate error display       |
| `Toast`            | `Admin/Toast`      | Use single toast system         |
| `SearchBar`        | `Layout/SearchBar` | Consolidate search components   |
| `ProductQuickView` | `AuctionQuickView` | Create generic QuickView        |

### Filter Components

| Keep                   | Remove/Merge          | Reason                      |
| ---------------------- | --------------------- | --------------------------- |
| `UnifiedFilterSidebar` | `FilterSidebar`       | Already unified             |
| `UnifiedFilterSidebar` | `MobileFilterSidebar` | Already handles mobile      |
| `UnifiedFilterSidebar` | `MobileFilterDrawer`  | Already handles drawer mode |

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

### Phase 1: Form Components

- [ ] Merge Input + MobileInput
- [ ] Merge Textarea + MobileTextarea
- [ ] Merge Select + MobileFormSelect
- [ ] Update all usages

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

- [ ] Consolidate LoadingSkeleton + Skeleton
- [ ] Consolidate ErrorState + ErrorMessage
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
│   ├── AuctionCard.tsx
│   ├── ShopCard.tsx
│   ├── CategoryCard.tsx
│   ├── BlogCard.tsx
│   ├── ReviewCard.tsx
│   ├── CardGrid.tsx
│   └── skeletons/
│       ├── ProductCardSkeleton.tsx
│       └── ...
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
