# Display Components - Quick Reference

## Import

```tsx
import {
  StatsCard,
  StatsCardGrid,
  EmptyState,
  EmptyStatePresets,
  DataCard,
  DataCardGroup,
} from "@/components/ui/display";
```

---

## StatsCard

### Basic

```tsx
<StatsCard title="Total Orders" value={1234} icon={<ShoppingCart />} />
```

### With Trend

```tsx
<StatsCard
  title="Revenue"
  value="$45,678"
  icon={<DollarSign />}
  trend={{
    value: 12,
    direction: "up",
    label: "from last month",
  }}
  color="success"
/>
```

### Clickable

```tsx
<StatsCard
  title="Messages"
  value={42}
  onClick={() => router.push("/messages")}
/>
```

### Grid

```tsx
<StatsCardGrid columns={4}>
  <StatsCard ... />
  <StatsCard ... />
</StatsCardGrid>
```

---

## EmptyState

### Basic

```tsx
<EmptyState
  icon={<Package />}
  title="No products"
  description="Add your first product"
/>
```

### With Action

```tsx
<EmptyState
  icon={<Package />}
  title="No products"
  action={{
    label: "Add Product",
    onClick: handleAdd,
    icon: <Plus />,
  }}
/>
```

### With Two Actions

```tsx
<EmptyState
  icon={<Package />}
  title="No products"
  action={{
    label: "Add Product",
    onClick: handleAdd,
  }}
  secondaryAction={{
    label: "Import",
    onClick: handleImport,
  }}
/>
```

### Variants

```tsx
// No data
<EmptyState variant="no-data" ... />

// No results
<EmptyState variant="no-results" ... />

// Error
<EmptyState variant="error" ... />

// No permission
<EmptyState variant="no-permission" ... />

// Coming soon
<EmptyState variant="coming-soon" ... />
```

### Presets

```tsx
<EmptyStatePresets.NoProducts
  action={{ label: "Add", onClick: handleAdd }}
/>

<EmptyStatePresets.NoOrders />
<EmptyStatePresets.NoSearchResults />
<EmptyStatePresets.Error />
<EmptyStatePresets.NoPermission />
<EmptyStatePresets.ComingSoon />
```

---

## DataCard

### Basic

```tsx
<DataCard
  title="Order Info"
  data={[
    { label: "Order ID", value: "12345" },
    { label: "Status", value: "Pending" },
    { label: "Total", value: "$299" },
  ]}
/>
```

### With Icon

```tsx
<DataCard
  title="Order Info"
  icon={<ShoppingCart />}
  subtitle="Order details"
  data={...}
/>
```

### Copy to Clipboard

```tsx
<DataCard
  data={[
    {
      label: "API Key",
      value: "sk_live_abc123",
      copy: true, // Shows copy button
    },
  ]}
/>
```

### Highlight Field

```tsx
<DataCard
  data={[
    {
      label: "Total",
      value: "$299.99",
      highlight: true, // Larger, bold
    },
  ]}
/>
```

### With Link

```tsx
<DataCard
  data={[
    {
      label: "Customer",
      value: "John Doe",
      link: "/customers/1",
    },
    {
      label: "Website",
      value: "example.com",
      link: "https://example.com",
      linkExternal: true, // Opens in new tab
    },
  ]}
/>
```

### Custom Value

```tsx
<DataCard
  data={[
    {
      label: "Status",
      value: <Badge variant="success">Active</Badge>,
    },
    {
      label: "Progress",
      value: <Progress value={75} />,
    },
  ]}
/>
```

### With Actions

```tsx
<DataCard
  title="Order Info"
  data={...}
  actions={[
    {
      label: "Edit",
      icon: <Edit />,
      onClick: handleEdit,
      variant: "outline"
    },
    {
      label: "Delete",
      icon: <Trash />,
      onClick: handleDelete,
      variant: "destructive"
    }
  ]}
/>
```

### Columns

```tsx
// 1 column (mobile friendly)
<DataCard columns={1} data={...} />

// 2 columns
<DataCard columns={2} data={...} />

// 3 columns
<DataCard columns={3} data={...} />
```

### Collapsible

```tsx
<DataCard
  title="Advanced Settings"
  collapsible={true}
  defaultCollapsed={true}
  data={...}
/>
```

### Multiple Cards

```tsx
<DataCardGroup spacing="lg">
  <DataCard title="Personal Info" data={...} />
  <DataCard title="Contact Info" data={...} />
  <DataCard title="Preferences" data={...} />
</DataCardGroup>
```

---

## Common Patterns

### Dashboard

```tsx
function Dashboard() {
  const { stats, loading } = useStats();

  return (
    <>
      <StatsCardGrid columns={4}>
        <StatsCard
          title="Revenue"
          value={stats.revenue}
          icon={<DollarSign />}
          trend={{ value: 12, direction: "up" }}
          loading={loading}
        />
        {/* More stats... */}
      </StatsCardGrid>

      {/* More dashboard content... */}
    </>
  );
}
```

### List Page with Empty State

```tsx
function ProductsList() {
  const { products, loading } = useProducts();

  if (loading) return <LoadingSpinner />;

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Package />}
        title="No products"
        description="Add your first product"
        action={{
          label: "Add Product",
          onClick: () => router.push("/products/new"),
        }}
      />
    );
  }

  return <ProductsGrid products={products} />;
}
```

### Detail Page

```tsx
function OrderDetails({ orderId }) {
  const { order, loading } = useOrder(orderId);

  return (
    <DataCardGroup spacing="md">
      <DataCard
        title="Order Information"
        icon={<ShoppingCart />}
        data={[
          { label: "Order ID", value: order.id, copy: true },
          { label: "Status", value: <StatusBadge status={order.status} /> },
          {
            label: "Total",
            value: formatCurrency(order.total),
            highlight: true,
          },
        ]}
        columns={2}
        loading={loading}
        actions={[
          { label: "Edit", onClick: handleEdit },
          { label: "Cancel", onClick: handleCancel, variant: "destructive" },
        ]}
      />

      <DataCard
        title="Customer"
        icon={<User />}
        data={[
          { label: "Name", value: order.customer.name },
          { label: "Email", value: order.customer.email, copy: true },
        ]}
        columns={2}
        loading={loading}
      />
    </DataCardGroup>
  );
}
```

---

## Props Cheatsheet

### StatsCard

- `title` (required)
- `value` (required)
- `icon`
- `trend` - `{ value, direction, label }`
- `color` - `primary | success | warning | error | info`
- `loading`
- `onClick`

### EmptyState

- `title` (required)
- `icon` or `image`
- `description`
- `action` - `{ label, onClick, icon }`
- `secondaryAction`
- `variant` - `no-data | no-results | error | no-permission | coming-soon`

### DataCard

- `title` (required)
- `data` (required) - Array of `{ label, value, copy?, highlight?, link? }`
- `icon`
- `subtitle`
- `columns` - `1 | 2 | 3`
- `actions` - Array of `{ label, onClick, icon?, variant? }`
- `loading`
- `collapsible`

---

## Tips

✅ Use `StatsCardGrid` for responsive dashboard layouts  
✅ Always show loading skeletons with `loading={true}`  
✅ Use `EmptyStatePresets` for quick implementations  
✅ Enable `copy={true}` for IDs, keys, and important values  
✅ Use `highlight={true}` for key metrics in DataCard  
✅ Group related DataCards with `DataCardGroup`  
✅ Provide actions in empty states to guide users  
✅ Use appropriate variants for different contexts

---

**Created:** Phase 7.2 - November 2, 2025  
**Components:** StatsCard, EmptyState, DataCard  
**Location:** `src/components/ui/display/`
