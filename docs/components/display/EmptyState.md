# EmptyState Component

## Overview

The `EmptyState` component provides beautiful, consistent UI for empty states, no results, errors, and other scenarios where content is absent. It encourages user action with clear CTAs.

## Location

`src/components/ui/display/EmptyState.tsx`

## Features

- 🎨 Five variants (no-data, no-results, error, no-permission, coming-soon)
- 🖼️ Support for icons or custom images
- 🎯 Primary and secondary action buttons
- 📱 Responsive design
- 🎭 Preset templates for common scenarios
- 🧩 Custom content support

## Basic Usage

```tsx
import { EmptyState } from "@/components/ui/display";
import { Package, Plus } from "lucide-react";

function ProductsList() {
  const { products, loading } = useProducts();

  if (!loading && products.length === 0) {
    return (
      <EmptyState
        icon={<Package />}
        title="No products found"
        description="Get started by adding your first product"
        action={{
          label: "Add Product",
          onClick: () => router.push("/products/new"),
          icon: <Plus />,
        }}
        secondaryAction={{
          label: "Import Products",
          onClick: handleImport,
        }}
      />
    );
  }

  return <ProductsGrid products={products} />;
}
```

## Props

| Prop              | Type                                                                       | Default     | Description                        |
| ----------------- | -------------------------------------------------------------------------- | ----------- | ---------------------------------- |
| `icon`            | `ReactNode`                                                                | -           | Icon or illustration to display    |
| `title`           | `string`                                                                   | Required    | Main title text                    |
| `description`     | `string`                                                                   | -           | Description text below title       |
| `action`          | `EmptyStateAction`                                                         | -           | Primary action button              |
| `secondaryAction` | `EmptyStateAction`                                                         | -           | Secondary action button            |
| `variant`         | `'no-data' \| 'no-results' \| 'error' \| 'no-permission' \| 'coming-soon'` | `'no-data'` | Visual variant                     |
| `image`           | `string`                                                                   | -           | Custom image URL (instead of icon) |
| `imageAlt`        | `string`                                                                   | -           | Alt text for image                 |
| `children`        | `ReactNode`                                                                | -           | Additional content below actions   |
| `className`       | `string`                                                                   | -           | Additional CSS classes             |

### EmptyStateAction

| Prop      | Type                                | Default                                          | Description          |
| --------- | ----------------------------------- | ------------------------------------------------ | -------------------- |
| `label`   | `string`                            | Required                                         | Button label         |
| `onClick` | `() => void`                        | Required                                         | Click handler        |
| `icon`    | `ReactNode`                         | -                                                | Optional button icon |
| `variant` | `'primary' \| 'outline' \| 'ghost'` | `'primary'` (primary) or `'outline'` (secondary) | Button variant       |
| `loading` | `boolean`                           | `false`                                          | Loading state        |

## Variants

### no-data

Default variant for when no data exists yet.

```tsx
<EmptyState
  variant="no-data"
  icon={<Package />}
  title="No products yet"
  description="Start building your catalog"
/>
```

### no-results

For search or filter results.

```tsx
<EmptyState
  variant="no-results"
  icon={<Search />}
  title="No results found"
  description="Try adjusting your filters"
/>
```

### error

For error states.

```tsx
<EmptyState
  variant="error"
  icon={<AlertTriangle />}
  title="Something went wrong"
  description="We couldn't load the data"
  action={{
    label: "Try Again",
    onClick: refetch,
  }}
/>
```

### no-permission

For access denied scenarios.

```tsx
<EmptyState
  variant="no-permission"
  icon={<Lock />}
  title="Access Denied"
  description="You don't have permission to view this"
/>
```

### coming-soon

For features under development.

```tsx
<EmptyState
  variant="coming-soon"
  icon={<Rocket />}
  title="Coming Soon"
  description="This feature is under development"
/>
```

## Preset Templates

The component includes ready-to-use presets:

```tsx
import { EmptyStatePresets } from '@/components/ui/display';

// No Products
<EmptyStatePresets.NoProducts
  action={{
    label: "Add Product",
    onClick: handleCreate
  }}
/>

// No Orders
<EmptyStatePresets.NoOrders />

// No Search Results
<EmptyStatePresets.NoSearchResults
  action={{
    label: "Clear Filters",
    onClick: clearFilters
  }}
/>

// Error
<EmptyStatePresets.Error
  action={{
    label: "Retry",
    onClick: refetch
  }}
/>

// No Permission
<EmptyStatePresets.NoPermission />

// Coming Soon
<EmptyStatePresets.ComingSoon />
```

## Examples

### With Custom Image

```tsx
<EmptyState
  image="/illustrations/no-data.svg"
  imageAlt="No data illustration"
  title="No data available"
  description="Import your data to get started"
  action={{
    label: "Import Data",
    onClick: handleImport,
    icon: <Upload />,
  }}
/>
```

### With Additional Content

```tsx
<EmptyState
  icon={<FileText />}
  title="No documents"
  description="Upload your first document"
  action={{
    label: "Upload",
    onClick: handleUpload,
  }}
>
  <div className="mt-4 text-sm text-textSecondary">
    <p>Supported formats: PDF, DOC, DOCX</p>
    <p>Maximum size: 10MB</p>
  </div>
</EmptyState>
```

### Loading Action

```tsx
<EmptyState
  icon={<AlertCircle />}
  title="Sync Required"
  description="Your data needs to be synchronized"
  action={{
    label: "Sync Now",
    onClick: handleSync,
    loading: syncing,
    icon: <RefreshCw />,
  }}
/>
```

## Accessibility

- Semantic HTML structure
- Icon has proper `aria-label` when needed
- Buttons are keyboard accessible
- Screen reader friendly

## Best Practices

1. **Clear Messaging**: Use simple, actionable language
2. **Relevant Icons**: Choose icons that match the context
3. **Actionable CTAs**: Always provide a way forward when possible
4. **Variant Selection**: Use appropriate variant for the context
5. **Avoid Overuse**: Don't show empty states for temporary loading

## Integration Patterns

### With Data Fetching

```tsx
function MyList() {
  const { data, loading, error } = useData();

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <EmptyState
        variant="error"
        icon={<AlertTriangle />}
        title="Failed to load"
        description={error.message}
        action={{
          label: "Retry",
          onClick: refetch,
        }}
      />
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<Inbox />}
        title="No items"
        description="Get started by creating your first item"
        action={{
          label: "Create Item",
          onClick: handleCreate,
        }}
      />
    );
  }

  return <ItemsList data={data} />;
}
```

### With Search/Filter

```tsx
function SearchResults({ query, filters, results }) {
  const hasFilters = Object.values(filters).some(Boolean);

  if (results.length === 0) {
    return (
      <EmptyState
        variant="no-results"
        icon={<Search />}
        title="No results found"
        description={
          hasFilters
            ? "Try adjusting your filters"
            : `No results for "${query}"`
        }
        action={
          hasFilters && {
            label: "Clear Filters",
            onClick: clearFilters,
          }
        }
      />
    );
  }

  return <ResultsList results={results} />;
}
```

## Related Components

- `StatsCard` - For displaying metrics
- `DataCard` - For structured data display
- `LoadingOverlay` - For loading states

## Created

Phase 7.2 - November 2, 2025
