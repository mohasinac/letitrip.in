# Quick Reference Guide - Refactored Codebase

> **Last Updated:** October 29, 2025  
> **Status:** ✅ Complete - All refactoring phases finished

## 🎯 New Developer Onboarding

### Shared Components Quick Access

**Form Components:**

```tsx
import { FormSection, FormActions } from "@/components/shared/form";

// Use in your forms
<FormSection title="User Info">
  <TextField label="Name" />
</FormSection>

<FormActions
  onCancel={handleCancel}
  onSubmit={handleSubmit}
  isLoading={loading}
/>
```

**Preview Components:**

```tsx
import { IconPreview, ImagePreview, getMuiIcon } from "@/components/shared/preview";

// Display icon preview
<IconPreview iconName="Home" />

// Display image preview with caching
<ImagePreview imageUrl={imageUrl} useCache={true} />

// Get Material UI icon
const HomeIcon = getMuiIcon("Home");
```

### API Services

**Category Operations:**

```tsx
import { CategoryService } from "@/lib/api/services";

// Get all categories
const categories = await CategoryService.getCategories("list", 1, 10);

// Create category
const newCategory = await CategoryService.createCategory(formData);

// Update category
await CategoryService.updateCategory(categoryId, updatedData);

// Delete category
await CategoryService.deleteCategory(categoryId);

// Validate slug
const { available } = await CategoryService.validateSlug("my-slug");
```

**Storage Operations:**

```tsx
import { StorageService } from "@/lib/api/services";

// Upload image with progress
const response = await StorageService.uploadImage({
  file: imageFile,
  folder: "categories",
  slug: "my-category",
  onProgress: (percent) => console.log(`${percent}% uploaded`),
});

// Get cached image URL
const cachedUrl = StorageService.getImageUrl("categories/my-image.jpg");

// Get direct Firebase URL
const directUrl = StorageService.getPublicUrl("categories/my-image.jpg");

// Download file
const blob = await StorageService.downloadFile("categories/my-image.jpg");
```

### Theme System

**Colors:**

```tsx
import { colors } from "@/styles/theme";

sx={{
  color: colors.primary.main,
  backgroundColor: colors.neutral[100],
  borderColor: colors.error.light,
}}
```

**Typography:**

```tsx
import { typography } from "@/styles/theme";

sx={{
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  lineHeight: typography.lineHeight.relaxed,
}}
```

**Spacing:**

```tsx
import { spacing } from "@/styles/theme";

sx={{
  padding: spacing[4],
  marginBottom: spacing[6],
  gap: spacing[2],
}}
```

### SEO Utilities

**Page Metadata:**

```tsx
import { generateMetadata, generateCategorySchema } from "@/lib/seo";

// Generate metadata for page
const metadata = generateMetadata({
  title: "Buy Electronics",
  description: "Browse our electronics collection",
  path: "/categories/electronics",
  keywords: ["electronics", "gadgets"],
});

// Generate schema for category
const schema = generateCategorySchema({
  id: "cat_123",
  name: "Electronics",
  url: "https://justforview.in/categories/electronics",
});
```

## 📁 File Structure Guide

### Finding Components

**Need a form field?**
→ Check `src/components/shared/form/`

**Need a preview component?**
→ Check `src/components/shared/preview/`

**Need admin components?**
→ Check `src/components/admin/categories/`

### Finding Services

**Need to fetch/save data?**
→ Use `CategoryService` from `src/lib/api/services/category.service.ts`

**Need to upload images?**
→ Use `StorageService` from `src/lib/api/services/storage.service.ts`

### Finding Styles

**Need colors?**
→ Import from `src/styles/theme/colors.ts`

**Need typography?**
→ Import from `src/styles/theme/typography.ts`

**Need spacing?**
→ Import from `src/styles/theme/spacing.ts`

### Finding SEO

**Need metadata?**
→ Use `generateMetadata()` from `src/lib/seo/metadata.ts`

**Need structured data?**
→ Use `generateCategorySchema()`, `generateProductSchema()`, etc. from `src/lib/seo/metadata.ts`

## ✅ Best Practices

### When Creating Forms

✅ DO:

```tsx
<FormSection title="Personal Info">
  <TextField label="Name" />
  <TextField label="Email" />
</FormSection>

<FormActions
  onCancel={handleCancel}
  onSubmit={handleSubmit}
/>
```

❌ DON'T:

```tsx
<Box>
  <Typography>Personal Info</Typography>
  <TextField />
  {/* manually style buttons */}
</Box>
```

### When Making API Calls

✅ DO:

```tsx
try {
  const result = await CategoryService.createCategory(data);
} catch (error) {
  // Unified error handling
  console.error(error.message);
}
```

❌ DON'T:

```tsx
const response = await fetch("/api/admin/categories", {
  // manual request setup
});
```

### When Styling

✅ DO:

```tsx
import { colors, spacing, typography } from "@/styles/theme";

sx={{
  color: colors.primary.main,
  padding: spacing[4],
  fontSize: typography.fontSize.lg,
}}
```

❌ DON'T:

```tsx
sx={{
  color: "#4f46e5",
  padding: "16px",
  fontSize: "18px",
}}
```

### When Adding SEO

✅ DO:

```tsx
import { generateMetadata, generateCategorySchema } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Electronics",
  description: "Browse electronics",
});

const schema = generateCategorySchema({...});
```

❌ DON'T:

```tsx
// No metadata, no schema
export default function Page() {
  return <div>Electronics</div>;
}
```

## 🔍 Common Patterns

### Creating a New Feature

1. **Create component** in appropriate directory
2. **Use shared components** if applicable
3. **Create service** for API calls if needed
4. **Add styling** using theme system
5. **Add metadata** using SEO utilities

### Updating Multiple Categories (Example)

```tsx
import { CategoryService } from "@/lib/api/services";

// Bulk update
const updates = [
  { id: "cat_1", data: { isActive: true } },
  { id: "cat_2", data: { featured: true } },
];

const results = await CategoryService.bulkUpdateCategories(updates);
```

### Uploading with Progress Tracking

```tsx
import { StorageService } from "@/lib/api/services";

const response = await StorageService.uploadImage({
  file: selectedFile,
  folder: "categories",
  slug: category.slug,
  onProgress: (percent) => {
    setUploadProgress(percent);
  },
});

console.log(response.data.url); // Use the returned URL
```

### Handling Errors Consistently

```tsx
try {
  const result = await CategoryService.deleteCategory(id);
  showSuccessMessage("Deleted successfully");
} catch (error) {
  const errorMessage =
    error instanceof Error ? error.message : "Unknown error occurred";
  showErrorMessage(errorMessage);
}
```

## 📚 Documentation References

For more detailed information, see:

- **Component API:** `docs/ROUTES_AND_COMPONENTS.md`
- **API Endpoints:** `docs/API_ENDPOINTS.md`
- **Image Caching:** `docs/IMAGE_CACHING.md`
- **Refactoring Details:** `docs/REFACTORING_COMPLETE.md`
- **Refactoring Plan:** `REFACTORING_PLAN.md`

## 🚀 Useful Commands

```bash
# Type check
npm run type-check

# Build
npm run build

# Start dev server
npm run dev

# Run linter
npm run lint
```

## 💡 Tips & Tricks

**Quickly find a component:**

```bash
# Search for component name
grep -r "FormSection" src/

# Find all usages of a service
grep -r "CategoryService" src/
```

**Check what's exported from shared:**

```bash
# See what components are available
cat src/components/shared/form/index.ts
cat src/components/shared/preview/index.ts
```

**Test a service:**

```tsx
// Quick test in console
const categories = await CategoryService.getCategories();
console.log(categories);
```

## 🤔 FAQ

**Q: Where should I add a new shared component?**
A: If it's form-related → `src/components/shared/form/`
If it's preview/display → `src/components/shared/preview/`
Otherwise → Create new directory under `src/components/shared/`

**Q: How do I use the caching service?**
A: All CategoryService methods automatically use caching. For custom cache, extend BaseService.

**Q: Can I customize theme colors?**
A: Yes! Edit `src/styles/theme/colors.ts` and all components will automatically use the new colors.

**Q: How do I add SEO to a new page?**
A: Use `generateMetadata()` for basic SEO and `generateCategorySchema()` for structured data.

**Q: What if I need a new service?**
A: Extend `BaseService` and implement your service following the pattern in `CategoryService`.

---

For questions or to report issues, refer to the main documentation files.
