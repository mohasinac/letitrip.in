# Admin Pages Migration Guide

## Quick Reference: Before & After

### Import Statements

```tsx
// ❌ Before
import { useState, useEffect } from "react";

// ✅ After
import { useState, useEffect } from "react";
import {
  AdminPageHeader,
  LoadingSpinner,
  ToggleSwitch,
  toast,
} from "@/components/admin";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
```

### Page Header

```tsx
// ❌ Before
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">Hero Slides</h1>
    <p className="text-sm text-gray-500 mt-1">Manage homepage carousel slides</p>
  </div>
  <div className="flex gap-3">
    <button>Add New</button>
  </div>
</div>

// ✅ After
<AdminPageHeader
  title="Hero Slides"
  description="Manage homepage carousel slides"
  actions={
    <button>Add New</button>
  }
/>
```

### Loading State

```tsx
// ❌ Before
{
  loading && (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}

// ✅ After
{
  loading && <LoadingSpinner fullScreen message="Loading slides..." />;
}
```

### Toggle Switches

```tsx
// ❌ Before
<button
  onClick={toggleActive}
  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
    isActive ? "bg-blue-600" : "bg-gray-200"
  }`}
>
  <span className={`inline-block h-4 w-4 transform rounded-full bg-white ${
    isActive ? "translate-x-6" : "translate-x-1"
  }`} />
</button>

// ✅ After
<ToggleSwitch
  enabled={isActive}
  onToggle={toggleActive}
  label="Active"
  description="Show on homepage"
/>
```

### Notifications

```tsx
// ❌ Before
try {
  await saveSlide(data);
  alert("Slide saved successfully!");
} catch (error) {
  alert("Failed to save slide");
}

// ✅ After
try {
  await saveSlide(data);
  toast.success("Slide saved successfully!");
} catch (error) {
  toast.error("Failed to save slide");
}
```

### Confirmation Dialogs

```tsx
// ❌ Before
const handleDelete = async (id: string) => {
  if (!confirm("Are you sure you want to delete this slide?")) return;
  // delete logic
};

// ✅ After
const [deleteId, setDeleteId] = useState<string | null>(null);

const handleDelete = async () => {
  if (!deleteId) return;
  // delete logic
  setDeleteId(null);
};

// In JSX:
<ConfirmDialog
  isOpen={!!deleteId}
  onClose={() => setDeleteId(null)}
  onConfirm={handleDelete}
  title="Delete Slide"
  description="Are you sure you want to delete this slide? This action cannot be undone."
  variant="danger"
/>;
```

## Step-by-Step Migration Process

### 1. Update Imports

Add new component imports at the top of the file.

### 2. Add State for Dialogs

```tsx
const [showDeleteDialog, setShowDeleteDialog] = useState(false);
const [deleteId, setDeleteId] = useState<string | null>(null);
```

### 3. Replace Page Header

Find the page header section and replace with `AdminPageHeader`.

### 4. Replace Loading States

Search for `animate-spin` and replace with `LoadingSpinner`.

### 5. Replace Toggle Buttons

Search for toggle button patterns and replace with `ToggleSwitch`.

### 6. Replace Alerts

Search for `alert(` and replace with appropriate `toast.*` calls.

### 7. Replace Confirms

Search for `confirm(` and replace with `ConfirmDialog` component.

### 8. Test Everything

- [ ] Page loads correctly
- [ ] Loading states show
- [ ] Toggles work
- [ ] Toast notifications appear
- [ ] Dialogs open/close
- [ ] All CRUD operations work

## Common Patterns

### Full Page Template

```tsx
"use client";

import { useState, useEffect } from "react";
import {
  AdminPageHeader,
  LoadingSpinner,
  ToggleSwitch,
  toast,
} from "@/components/admin";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await fetchItems();
      setItems(data);
    } catch (error) {
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteItem(deleteId);
      toast.success("Item deleted successfully");
      setDeleteId(null);
      loadItems();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleToggle = async (id: string, value: boolean) => {
    try {
      await toggleItem(id, value);
      toast.success("Status updated");
      loadItems();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return (
    <>
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Confirm Delete"
        description="Are you sure you want to delete this item?"
        variant="danger"
      />

      <div className="space-y-6">
        <AdminPageHeader
          title="Page Title"
          description="Page description"
          actions={<button className="btn-primary">Add New</button>}
        />

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card">
              <div className="flex items-center justify-between">
                <div>{item.title}</div>
                <div className="flex gap-2">
                  <ToggleSwitch
                    enabled={item.active}
                    onToggle={() => handleToggle(item.id, !item.active)}
                  />
                  <button onClick={() => setDeleteId(item.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
```

## Priority Order for Migration

1. **High Priority** (User-facing, frequently used):

   - ✅ `/admin/homepage` - DONE
   - `/admin/hero-slides`
   - `/admin/featured-sections`
   - `/admin/products`

2. **Medium Priority** (Admin tools):

   - `/admin/categories`
   - `/admin/shops`
   - `/admin/auctions`
   - `/admin/coupons`

3. **Low Priority** (Less frequently accessed):
   - `/admin/analytics`
   - `/admin/settings`
   - `/admin/logs`

## Benefits Checklist

After migrating each page, verify:

- [ ] Code is more readable
- [ ] Lines of code reduced
- [ ] Consistent UI/UX
- [ ] Better error handling
- [ ] Improved user feedback
- [ ] Accessible components
- [ ] Mobile responsive
- [ ] TypeScript type-safe

## Troubleshooting

### Toast not showing

- Ensure `ToastContainer` is in `layout.tsx`
- Check browser console for errors

### ToggleSwitch not working

- Verify `enabled` prop is boolean
- Check `onToggle` is being called

### ConfirmDialog not appearing

- Check `isOpen` prop is true
- Verify state management

### LoadingSpinner placement issues

- Use `fullScreen` prop for centered loading
- Use inline for small loading indicators

## Additional Resources

- Component docs: `/CHECKLIST/admin-components-refactoring.md`
- API reference: JSDoc comments in each component
- Examples: `/src/app/admin/homepage/page.tsx`
