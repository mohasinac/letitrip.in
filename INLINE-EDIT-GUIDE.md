# Inline Edit & Quick Create - Implementation Guide

This guide explains how to use the inline edit and quick create components in admin and seller pages.

## Overview

The inline edit system provides Excel-like editing experience for table views, allowing users to quickly create and edit items without navigating to separate pages.

## Components

### 1. InlineEditRow

Converts a table row into an editable form with inline validation.

**Location**: `src/components/common/InlineEditRow.tsx`

**Usage**:

```tsx
import { InlineEditRow } from "@/components/common/InlineEditRow";
import { InlineField } from "@/types/inline-edit";

const fields: InlineField[] = [
  {
    key: "title",
    type: "text",
    label: "Title",
    required: true,
    placeholder: "Enter title",
  },
  {
    key: "price",
    type: "number",
    label: "Price",
    required: true,
    min: 0,
    step: 0.01,
  },
  {
    key: "image_url",
    type: "image",
    label: "Image",
    placeholder: "product", // context for upload
  },
];

// In your table body
{editingId === item.id ? (
  <InlineEditRow
    fields={fields}
    initialValues={item}
    onSave={async (values) => {
      await apiService.patch(`/products/${item.id}`, values);
      setEditingId(null);
      loadItems();
    }}
    onCancel={() => setEditingId(null)}
    loading={saving}
    resourceName="product"
  />
) : (
  <tr onClick={() => setEditingId(item.id)}>
    {/* Regular table cells */}
  </tr>
)}
```

**Features**:
- ✅ Inline validation
- ✅ Keyboard shortcuts (Enter to save, Esc to cancel)
- ✅ Loading states
- ✅ Error display
- ✅ All field types supported

### 2. QuickCreateRow

Adds a collapsible create row at the top of tables.

**Location**: `src/components/common/QuickCreateRow.tsx`

**Usage**:

```tsx
import { QuickCreateRow } from "@/components/common/QuickCreateRow";

// In your table body (first row)
<QuickCreateRow
  fields={fields}
  onSave={async (values) => {
    await apiService.post("/products", values);
    loadItems();
  }}
  loading={creating}
  resourceName="product"
  defaultValues={{ is_active: true }}
/>
```

**Features**:
- ✅ Expandable/collapsible
- ✅ Auto-reset after save
- ✅ Same validation as InlineEditRow
- ✅ Green highlight for visibility

### 3. BulkActionBar

Displays when items are selected, provides bulk operation buttons.

**Location**: `src/components/common/BulkActionBar.tsx`

**Usage**:

```tsx
import { BulkActionBar } from "@/components/common/BulkActionBar";
import { BulkAction } from "@/types/inline-edit";
import { Trash2, Check, Ban } from "lucide-react";

const bulkActions: BulkAction[] = [
  {
    id: "delete",
    label: "Delete",
    icon: Trash2,
    variant: "danger",
    confirm: true,
    confirmMessage: "This action cannot be undone.",
  },
  {
    id: "activate",
    label: "Activate",
    icon: Check,
    variant: "success",
  },
];

<BulkActionBar
  selectedCount={selectedIds.length}
  actions={bulkActions}
  onAction={async (actionId) => {
    if (actionId === "delete") {
      await apiService.post("/products/bulk", {
        action: "delete",
        ids: selectedIds,
      });
    }
    setSelectedIds([]);
    loadItems();
  }}
  onClearSelection={() => setSelectedIds([])}
  loading={processing}
  resourceName="product"
  totalCount={items.length}
/>
```

**Features**:
- ✅ Responsive (top bar desktop, bottom sticky mobile)
- ✅ Confirmation dialogs
- ✅ Loading states
- ✅ Multiple actions
- ✅ Color variants

### 4. InlineImageUpload

Small inline image uploader for table cells.

**Location**: `src/components/common/InlineImageUpload.tsx`

**Usage**:

```tsx
import { InlineImageUpload } from "@/components/common/InlineImageUpload";

<InlineImageUpload
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  size={64}
  context="product"
  disabled={loading}
/>
```

**Features**:
- ✅ 64x64 preview (customizable)
- ✅ Click to upload
- ✅ Loading spinner
- ✅ Remove button
- ✅ File validation

### 5. MobileFilterSidebar

Slide-in sidebar for filters on mobile.

**Location**: `src/components/common/MobileFilterSidebar.tsx`

**Usage**:

```tsx
import { MobileFilterSidebar } from "@/components/common/MobileFilterSidebar";

<MobileFilterSidebar
  isOpen={showFilters}
  onClose={() => setShowFilters(false)}
  onApply={() => {
    // Apply filter logic
    setShowFilters(false);
  }}
  onReset={() => {
    // Reset filters
  }}
  title="Filters"
>
  {/* Filter content */}
  <div className="space-y-4">
    <FilterGroup title="Category">
      {/* Category filters */}
    </FilterGroup>
    <FilterGroup title="Price">
      {/* Price filters */}
    </FilterGroup>
  </div>
</MobileFilterSidebar>
```

**Features**:
- ✅ Smooth slide animation
- ✅ Backdrop overlay
- ✅ Body scroll lock
- ✅ Apply/Reset buttons
- ✅ Auto-hide on desktop

### 6. TableCheckbox

Accessible checkbox for table selection.

**Location**: `src/components/common/TableCheckbox.tsx`

**Usage**:

```tsx
import { TableCheckbox } from "@/components/common/TableCheckbox";

// Header checkbox (select all)
<th>
  <TableCheckbox
    checked={selectedIds.length === items.length}
    indeterminate={selectedIds.length > 0 && selectedIds.length < items.length}
    onChange={(checked) => {
      if (checked) {
        setSelectedIds(items.map(i => i.id));
      } else {
        setSelectedIds([]);
      }
    }}
    label="Select all"
  />
</th>

// Row checkbox
<td>
  <TableCheckbox
    checked={selectedIds.includes(item.id)}
    onChange={(checked) => {
      if (checked) {
        setSelectedIds([...selectedIds, item.id]);
      } else {
        setSelectedIds(selectedIds.filter(id => id !== item.id));
      }
    }}
    label={`Select ${item.name}`}
  />
</td>
```

**Features**:
- ✅ Indeterminate state support
- ✅ 44px touch target
- ✅ Accessible labels
- ✅ Consistent styling

## Field Types

All field types supported in `InlineEditRow` and `QuickCreateRow`:

### text / email / url
```tsx
{
  key: "name",
  type: "text",
  label: "Name",
  required: true,
  placeholder: "Enter name",
}
```

### number
```tsx
{
  key: "price",
  type: "number",
  label: "Price",
  required: true,
  min: 0,
  max: 10000,
  step: 0.01,
}
```

### select
```tsx
{
  key: "status",
  type: "select",
  label: "Status",
  options: [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
  ],
}
```

### checkbox
```tsx
{
  key: "is_active",
  type: "checkbox",
  label: "Active",
}
```

### date
```tsx
{
  key: "start_date",
  type: "date",
  label: "Start Date",
  required: true,
}
```

### image
```tsx
{
  key: "image_url",
  type: "image",
  label: "Image",
  placeholder: "product", // upload context
}
```

### textarea
```tsx
{
  key: "description",
  type: "textarea",
  label: "Description",
  rows: 3,
  placeholder: "Enter description",
}
```

## Custom Validation

Add custom validation to any field:

```tsx
{
  key: "slug",
  type: "text",
  label: "Slug",
  required: true,
  validate: (value) => {
    if (!/^[a-z0-9-]+$/.test(value)) {
      return "Slug can only contain lowercase letters, numbers, and hyphens";
    }
    return null;
  },
}
```

## Complete Example: Hero Slides Page

```tsx
"use client";

import { useState, useEffect } from "react";
import { QuickCreateRow } from "@/components/common/QuickCreateRow";
import { InlineEditRow } from "@/components/common/InlineEditRow";
import { BulkActionBar } from "@/components/common/BulkActionBar";
import { TableCheckbox } from "@/components/common/TableCheckbox";
import { InlineField, BulkAction } from "@/types/inline-edit";
import { Power, PowerOff, Trash2 } from "lucide-react";
import { apiService } from "@/services/api.service";

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fields: InlineField[] = [
    { key: "title", type: "text", label: "Title", required: true },
    { key: "subtitle", type: "text", label: "Subtitle" },
    { key: "image_url", type: "image", label: "Image", required: true, placeholder: "shop" },
    { key: "link_url", type: "url", label: "Link" },
    { key: "is_active", type: "checkbox", label: "Active" },
  ];

  const bulkActions: BulkAction[] = [
    {
      id: "activate",
      label: "Activate",
      icon: Power,
      variant: "success",
    },
    {
      id: "deactivate",
      label: "Deactivate",
      icon: PowerOff,
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "danger",
      confirm: true,
    },
  ];

  const loadSlides = async () => {
    const response = await apiService.get("/admin/hero-slides");
    setSlides(response.slides);
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const handleBulkAction = async (actionId: string) => {
    setLoading(true);
    try {
      await apiService.post("/admin/hero-slides/bulk", {
        action: actionId,
        ids: selectedIds,
      });
      setSelectedIds([]);
      loadSlides();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Hero Slides</h1>

      <BulkActionBar
        selectedCount={selectedIds.length}
        actions={bulkActions}
        onAction={handleBulkAction}
        onClearSelection={() => setSelectedIds([])}
        loading={loading}
        resourceName="slide"
        totalCount={slides.length}
      />

      <table className="w-full border rounded-lg">
        <thead>
          <tr>
            <th>
              <TableCheckbox
                checked={selectedIds.length === slides.length}
                indeterminate={selectedIds.length > 0 && selectedIds.length < slides.length}
                onChange={(checked) => {
                  setSelectedIds(checked ? slides.map(s => s.id) : []);
                }}
              />
            </th>
            <th>Title</th>
            <th>Subtitle</th>
            <th>Image</th>
            <th>Link</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <QuickCreateRow
            fields={fields}
            onSave={async (values) => {
              await apiService.post("/admin/hero-slides", values);
              loadSlides();
            }}
            loading={loading}
            resourceName="slide"
            defaultValues={{ is_active: true }}
          />

          {slides.map((slide) =>
            editingId === slide.id ? (
              <InlineEditRow
                key={slide.id}
                fields={fields}
                initialValues={slide}
                onSave={async (values) => {
                  await apiService.patch(`/admin/hero-slides/${slide.id}`, values);
                  setEditingId(null);
                  loadSlides();
                }}
                onCancel={() => setEditingId(null)}
                loading={loading}
              />
            ) : (
              <tr
                key={slide.id}
                onDoubleClick={() => setEditingId(slide.id)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td>
                  <TableCheckbox
                    checked={selectedIds.includes(slide.id)}
                    onChange={(checked) => {
                      setSelectedIds(
                        checked
                          ? [...selectedIds, slide.id]
                          : selectedIds.filter(id => id !== slide.id)
                      );
                    }}
                  />
                </td>
                <td>{slide.title}</td>
                <td>{slide.subtitle}</td>
                <td>
                  <img src={slide.image_url} className="w-16 h-16 object-cover" />
                </td>
                <td>{slide.link_url}</td>
                <td>{slide.is_active ? "Active" : "Inactive"}</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
```

## Best Practices

1. **Always provide field labels** for accessibility
2. **Use required validation** for mandatory fields
3. **Provide placeholder text** to guide users
4. **Confirm dangerous actions** like bulk delete
5. **Show loading states** during async operations
6. **Reset forms** after successful creation
7. **Validate on blur** to provide immediate feedback
8. **Use appropriate field types** for better UX
9. **Keep quick create minimal** - only essential fields
10. **Link to detailed edit page** for advanced options

## API Requirements

### Partial Update (PATCH)
```typescript
PATCH /api/resource/:id
Body: { [field]: value, ... }
```

### Bulk Operations
```typescript
POST /api/resource/bulk
Body: {
  action: "delete" | "activate" | "deactivate" | ...,
  ids: string[]
}
```

Response:
```typescript
{
  success: boolean,
  successCount: number,
  failedCount: number,
  errors?: { id: string, error: string }[]
}
```

## Keyboard Shortcuts

- **Enter**: Save inline edit
- **Escape**: Cancel inline edit
- **Double-click row**: Start inline edit
- **Tab**: Navigate between fields

## Accessibility

- All checkboxes have 44px minimum touch target
- ARIA labels on all interactive elements
- Keyboard navigation fully supported
- Screen reader announcements for actions
- Focus visible on all elements

---

**Next Steps**: See `CHECKLIST/INLINE-EDIT-PROGRESS.md` for implementation progress.
