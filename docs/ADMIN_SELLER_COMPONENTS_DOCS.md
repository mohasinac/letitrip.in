# Admin-Seller Component Library Documentation

**Created:** November 1, 2025  
**Status:** ✅ Phase 0 Complete  
**Location:** `src/components/ui/admin-seller/`

## 📦 Available Components

### 1. SmartCategorySelector ⭐

Advanced category selector with tree view, search, and intelligent selection features.

#### Features

- ✅ Tree view with expand/collapse
- ✅ Search with real-time filtering
- ✅ **Show Only Leaf Nodes** toggle
- ✅ **Show All Categories** toggle (includes inactive)
- ✅ **Auto-Include SEO** - Inherits parent SEO data
- ✅ **Auto-Select Parents** - Automatically selects parent chain
- ✅ Single and multi-select modes
- ✅ Breadcrumb path display
- ✅ Leaf node validation
- ✅ Visual indicators (badges for leaf, featured, inactive)

#### Usage

```tsx
import { SmartCategorySelector } from "@/components/ui/admin-seller";

<SmartCategorySelector
  mode="single"
  showOnlyLeafNodes={true}
  autoIncludeSeo={true}
  autoSelectParents={true}
  requireLeafNode={true}
  onSelect={(categories) => {
    console.log("Selected:", categories);
    // categories[0].seoData - inherited SEO data
    // categories[0].parentIds - parent IDs
    // categories[0].path - full path string
  }}
  initialSelected={[]}
/>;
```

#### Props

```typescript
interface SmartCategorySelectorProps {
  mode?: "single" | "multi";
  onSelect: (categories: SelectedCategory[]) => void;
  initialSelected?: SelectedCategory[];

  // Feature toggles
  showOnlyLeafNodes?: boolean; // Filter to leaf categories only
  showAllCategories?: boolean; // Include inactive categories
  autoIncludeSeo?: boolean; // Include SEO data in selection
  autoSelectParents?: boolean; // Auto-select parent chain

  requireLeafNode?: boolean; // Validation: only allow leaf selection
  placeholder?: string;
  className?: string;
}
```

---

### 2. ModernDataTable ⭐

Feature-rich data table with sorting, pagination, selection, and responsive design.

#### Features

- ✅ Sortable columns
- ✅ Pagination with page size selector
- ✅ Row selection with bulk actions
- ✅ Search functionality
- ✅ Row actions dropdown
- ✅ Loading states with skeleton
- ✅ Empty state
- ✅ Custom cell rendering
- ✅ Responsive (mobile card view planned)
- ✅ Hover effects and animations

#### Usage

```tsx
import { ModernDataTable, TableColumn } from "@/components/ui/admin-seller";
import { UnifiedBadge } from "@/components/ui/unified";

const columns: TableColumn<Product>[] = [
  {
    key: "name",
    label: "Product",
    sortable: true,
  },
  {
    key: "price",
    label: "Price",
    align: "right",
    render: (value) => `₹${value.toLocaleString()}`,
  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <UnifiedBadge variant={value === "active" ? "success" : "warning"}>
        {value}
      </UnifiedBadge>
    ),
  },
];

const bulkActions = [
  {
    label: "Delete",
    onClick: (ids) => handleBulkDelete(ids),
    variant: "destructive" as const,
  },
];

const rowActions = [
  { label: "Edit", onClick: (row) => handleEdit(row) },
  { label: "Delete", onClick: (row) => handleDelete(row) },
];

<ModernDataTable
  data={products}
  columns={columns}
  loading={loading}
  selectable
  bulkActions={bulkActions}
  rowActions={rowActions}
  searchable
  onSearch={handleSearch}
  currentPage={page}
  pageSize={20}
  totalItems={total}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>;
```

---

### 3. SeoFieldsGroup ⭐

Comprehensive SEO fields with character counters, preview, and score indicator.

#### Features

- ✅ Meta title with character counter (50-60 optimal)
- ✅ Meta description with counter (150-160 optimal)
- ✅ URL slug auto-generation
- ✅ Keywords with tag interface
- ✅ Google search preview
- ✅ SEO score indicator (0-100%)
- ✅ Real-time validation feedback

#### Usage

```tsx
import { SeoFieldsGroup } from "@/components/ui/admin-seller";

<SeoFieldsGroup
  initialData={{
    metaTitle: product.seo?.metaTitle,
    metaDescription: product.seo?.metaDescription,
    slug: product.slug,
    keywords: product.seo?.keywords,
  }}
  onChange={(seoData) => {
    setProduct({ ...product, seo: seoData });
  }}
  autoGenerateFromTitle={true}
  showPreview={true}
  baseUrl="https://justforview.in/products"
  titleSource={product.name}
/>;
```

---

### 4. PageHeader

Consistent page header with breadcrumbs, title, actions, and tabs.

#### Features

- ✅ Breadcrumb navigation
- ✅ Title with optional badge
- ✅ Description text
- ✅ Action buttons
- ✅ Search bar integration
- ✅ Tabs integration
- ✅ Responsive layout

#### Usage

```tsx
import { PageHeader } from "@/components/ui/admin-seller";
import { UnifiedButton } from "@/components/ui/unified";
import { Plus } from "lucide-react";

<PageHeader
  title="Products"
  description="Manage all products in your store"
  breadcrumbs={[{ label: "Seller", href: "/seller" }, { label: "Products" }]}
  badge={{ text: "127 items", variant: "primary" }}
  actions={
    <>
      <UnifiedButton variant="outline" size="sm">
        Export
      </UnifiedButton>
      <UnifiedButton variant="primary" size="sm" icon={<Plus />}>
        Add Product
      </UnifiedButton>
    </>
  }
  search={
    <input
      type="text"
      placeholder="Search products..."
      className="w-full md:w-96 px-4 py-2.5 bg-surface border border-border rounded-lg"
    />
  }
/>;
```

---

## 🎨 Design Principles

All components follow these principles:

1. **Theme Variables**: Use CSS variables from `tailwind.config.js`
2. **Dark Mode**: Full dark mode support out of the box
3. **Responsive**: Mobile-first responsive design
4. **Animations**: Use existing animation classes
5. **Accessibility**: ARIA labels, keyboard navigation
6. **Composable**: Work seamlessly with unified components

---

## 📦 Installation

Components are already available. Just import:

```tsx
import {
  SmartCategorySelector,
  ModernDataTable,
  SeoFieldsGroup,
  PageHeader,
} from "@/components/ui/admin-seller";
```

---

## 🔧 Next Steps

Now that Phase 0 is complete, you can start using these components in:

1. **Phase 1**: Seller pages migration

   - `/seller/shop` - Use `PageHeader`, `SeoFieldsGroup`
   - `/seller/products` - Use `ModernDataTable`, `PageHeader`
   - `/seller/orders` - Use `ModernDataTable`, `PageHeader`

2. **Phase 2**: Product forms

   - `/seller/products/new` - Use `SmartCategorySelector`, `SeoFieldsGroup`
   - `/seller/products/[id]/edit` - Same as above

3. **Phase 4**: Admin pages
   - `/admin/products` - Use all components
   - `/admin/orders` - Use `ModernDataTable`, `PageHeader`

---

## 💡 Tips

### SmartCategorySelector Best Practices

```tsx
// For product forms - require leaf node
<SmartCategorySelector
  mode="single"
  showOnlyLeafNodes={true}
  requireLeafNode={true}
  autoSelectParents={true}
  autoIncludeSeo={true}
/>

// For filtering/tags - allow any level
<SmartCategorySelector
  mode="multi"
  showOnlyLeafNodes={false}
  autoSelectParents={false}
/>
```

### ModernDataTable Best Practices

```tsx
// Add custom row styling based on data
<ModernDataTable
  rowClassName={(row) =>
    row.status === 'inactive' ? 'opacity-60' : ''
  }
/>

// Use custom renderers for complex cells
columns={[
  {
    key: 'user',
    label: 'User',
    render: (value, row) => (
      <div className="flex items-center gap-2">
        <img src={row.avatar} className="w-8 h-8 rounded-full" />
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-textSecondary">{row.email}</p>
        </div>
      </div>
    )
  }
]}
```

---

## 🐛 Troubleshooting

### SmartCategorySelector not fetching categories

Check that your API endpoint `/api/categories?includeSeo=true` exists and returns data in this format:

```typescript
{
  success: true,
  data: Category[]
}
```

### ModernDataTable pagination not working

Make sure you provide both `onPageChange` and `totalItems` props:

```tsx
<ModernDataTable
  totalItems={totalCount}
  currentPage={page}
  onPageChange={(newPage) => setPage(newPage)}
/>
```

---

**Last Updated:** November 1, 2025  
**Status:** ✅ All Phase 0 components complete and ready to use!
