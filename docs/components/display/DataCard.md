# DataCard Component

## Overview

The `DataCard` component displays structured data in a beautiful, organized card layout. Perfect for detail pages, user profiles, order information, and any scenario requiring key-value data display.

## Location

`src/components/ui/display/DataCard.tsx`

## Features

- 📊 Flexible grid layout (1-3 columns)
- 📋 Copy-to-clipboard for specific fields
- 🔗 Clickable/linkable values
- 🎯 Action buttons in header
- 💫 Loading skeleton state
- 🔽 Collapsible sections
- 🎨 Multiple variants
- ✨ Custom value rendering

## Basic Usage

```tsx
import { DataCard } from "@/components/ui/display";
import { ShoppingCart, Edit, Trash } from "lucide-react";

function OrderDetails({ order }) {
  return (
    <DataCard
      title="Order Information"
      icon={<ShoppingCart />}
      subtitle="Order details and shipping info"
      data={[
        { label: "Order ID", value: order.id, copy: true },
        { label: "Status", value: <StatusBadge status={order.status} /> },
        { label: "Total", value: formatCurrency(order.total), highlight: true },
        {
          label: "Customer",
          value: order.customerName,
          link: `/customers/${order.customerId}`,
        },
        { label: "Created", value: formatDate(order.createdAt) },
        { label: "Updated", value: formatDate(order.updatedAt) },
      ]}
      columns={2}
      actions={[
        {
          label: "Edit",
          icon: <Edit />,
          onClick: handleEdit,
          variant: "outline",
        },
        {
          label: "Delete",
          icon: <Trash />,
          onClick: handleDelete,
          variant: "destructive",
        },
      ]}
    />
  );
}
```

## Props

### DataCardProps

| Prop               | Type                                                           | Default     | Description                   |
| ------------------ | -------------------------------------------------------------- | ----------- | ----------------------------- |
| `title`            | `string`                                                       | Required    | Card title                    |
| `icon`             | `ReactNode`                                                    | -           | Optional header icon          |
| `subtitle`         | `string`                                                       | -           | Optional subtitle/description |
| `data`             | `DataCardField[]`                                              | Required    | Array of data fields          |
| `columns`          | `1 \| 2 \| 3`                                                  | `2`         | Grid columns                  |
| `actions`          | `DataCardAction[]`                                             | -           | Action buttons                |
| `loading`          | `boolean`                                                      | `false`     | Loading state                 |
| `collapsible`      | `boolean`                                                      | `false`     | Enable collapse               |
| `defaultCollapsed` | `boolean`                                                      | `false`     | Initially collapsed           |
| `variant`          | `'default' \| 'elevated' \| 'outlined' \| 'filled' \| 'glass'` | `'default'` | Card variant                  |
| `className`        | `string`                                                       | -           | Additional CSS classes        |

### DataCardField

| Prop             | Type        | Default  | Description                         |
| ---------------- | ----------- | -------- | ----------------------------------- |
| `label`          | `string`    | Required | Field label                         |
| `value`          | `ReactNode` | Required | Field value (can be JSX)            |
| `copy`           | `boolean`   | `false`  | Enable copy-to-clipboard            |
| `highlight`      | `boolean`   | `false`  | Highlight this field (larger, bold) |
| `link`           | `string`    | -        | URL to navigate to                  |
| `linkExternal`   | `boolean`   | `false`  | Open link in new tab                |
| `valueClassName` | `string`    | -        | Custom class for value              |
| `hideOnMobile`   | `boolean`   | `false`  | Hide on mobile devices              |

### DataCardAction

| Prop       | Type                                                 | Default   | Description    |
| ---------- | ---------------------------------------------------- | --------- | -------------- |
| `label`    | `string`                                             | Required  | Action label   |
| `onClick`  | `() => void`                                         | Required  | Click handler  |
| `icon`     | `ReactNode`                                          | -         | Optional icon  |
| `variant`  | `'primary' \| 'outline' \| 'ghost' \| 'destructive'` | `'ghost'` | Button variant |
| `loading`  | `boolean`                                            | `false`   | Loading state  |
| `disabled` | `boolean`                                            | `false`   | Disabled state |

## Examples

### Simple 1-Column Layout

```tsx
<DataCard
  title="User Profile"
  icon={<User />}
  data={[
    { label: "Name", value: user.name },
    { label: "Email", value: user.email, copy: true },
    { label: "Role", value: user.role },
    { label: "Joined", value: formatDate(user.joinedAt) },
  ]}
  columns={1}
/>
```

### 3-Column Wide Layout

```tsx
<DataCard
  title="Product Specifications"
  icon={<Package />}
  data={[
    { label: "SKU", value: product.sku, copy: true },
    { label: "Category", value: product.category },
    { label: "Brand", value: product.brand },
    { label: "Weight", value: `${product.weight}g` },
    { label: "Dimensions", value: product.dimensions },
    { label: "Color", value: product.color },
  ]}
  columns={3}
/>
```

### With Custom Value Rendering

```tsx
<DataCard
  title="Order Status"
  data={[
    {
      label: "Status",
      value: (
        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
      ),
    },
    {
      label: "Progress",
      value: (
        <div className="flex items-center gap-2">
          <Progress value={order.progress} className="flex-1" />
          <span>{order.progress}%</span>
        </div>
      ),
    },
  ]}
  columns={1}
/>
```

### With External Links

```tsx
<DataCard
  title="Customer Information"
  data={[
    { label: "Name", value: customer.name },
    {
      label: "Website",
      value: customer.website,
      link: customer.websiteUrl,
      linkExternal: true,
    },
    {
      label: "Profile",
      value: "View Profile",
      link: `/customers/${customer.id}`,
    },
  ]}
  columns={2}
/>
```

### Collapsible Card

```tsx
<DataCard
  title="Advanced Settings"
  subtitle="Optional configuration"
  collapsible={true}
  defaultCollapsed={true}
  data={[
    { label: "API Key", value: settings.apiKey, copy: true },
    { label: "Webhook URL", value: settings.webhookUrl, copy: true },
    { label: "Timeout", value: `${settings.timeout}ms` },
  ]}
/>
```

### With Actions

```tsx
<DataCard
  title="Subscription Details"
  data={[
    { label: "Plan", value: subscription.plan, highlight: true },
    { label: "Status", value: <Badge>{subscription.status}</Badge> },
    { label: "Renews", value: formatDate(subscription.renewsAt) },
  ]}
  actions={[
    {
      label: "Upgrade",
      icon: <ArrowUp />,
      onClick: handleUpgrade,
      variant: "primary",
    },
    {
      label: "Cancel",
      icon: <X />,
      onClick: handleCancel,
      variant: "destructive",
    },
  ]}
/>
```

### Loading State

```tsx
<DataCard title="Loading data..." data={[]} loading={true} columns={2} />
```

## DataCardGroup

Group multiple related cards with consistent spacing:

```tsx
import { DataCardGroup } from "@/components/ui/display";

<DataCardGroup spacing="lg">
  <DataCard title="Personal Info" data={personalData} />
  <DataCard title="Contact Info" data={contactData} />
  <DataCard title="Preferences" data={preferencesData} />
</DataCardGroup>;
```

Spacing options: `'sm'` | `'md'` | `'lg'`

## Copy to Clipboard

Fields with `copy: true` show a copy button that copies the value to clipboard:

```tsx
<DataCard
  title="API Credentials"
  data={[
    {
      label: "API Key",
      value: "sk_live_abc123...",
      copy: true, // Shows copy button
    },
    {
      label: "Secret",
      value: "********",
      copy: true,
    },
  ]}
/>
```

## Accessibility

- Semantic HTML structure
- Keyboard accessible actions
- Copy button with visual feedback
- Screen reader friendly labels
- Proper link navigation

## Best Practices

1. **Logical Grouping**: Group related information together
2. **Column Count**: Use 1 column for mobile, 2-3 for desktop
3. **Highlight Important**: Use `highlight` for key metrics
4. **Enable Copy**: Add `copy: true` for IDs, keys, URLs
5. **Loading States**: Always show skeleton while fetching
6. **Actions**: Limit to 2-3 actions for clarity
7. **Collapsible**: Use for optional/advanced information

## Integration Example

```tsx
function OrderDetailsPage({ orderId }) {
  const { data: order, loading } = useOrder(orderId);
  const { mutate: updateOrder } = useUpdateOrder();
  const { mutate: deleteOrder } = useDeleteOrder();

  if (loading) {
    return <DataCard title="Loading..." data={[]} loading={true} columns={2} />;
  }

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
          { label: "Items", value: order.items.length },
          { label: "Created", value: formatDate(order.createdAt) },
          { label: "Updated", value: formatDate(order.updatedAt) },
        ]}
        columns={2}
        actions={[
          {
            label: "Edit",
            icon: <Edit />,
            onClick: () => updateOrder(order),
          },
          {
            label: "Delete",
            icon: <Trash />,
            onClick: () => deleteOrder(orderId),
            variant: "destructive",
          },
        ]}
      />

      <DataCard
        title="Customer Information"
        icon={<User />}
        data={[
          { label: "Name", value: order.customer.name },
          { label: "Email", value: order.customer.email, copy: true },
          { label: "Phone", value: order.customer.phone, copy: true },
          {
            label: "Profile",
            value: "View Profile",
            link: `/customers/${order.customer.id}`,
          },
        ]}
        columns={2}
      />

      <DataCard
        title="Shipping Address"
        icon={<MapPin />}
        data={[
          { label: "Street", value: order.shipping.street },
          { label: "City", value: order.shipping.city },
          { label: "State", value: order.shipping.state },
          { label: "ZIP", value: order.shipping.zip },
        ]}
        columns={2}
      />
    </DataCardGroup>
  );
}
```

## Related Components

- `StatsCard` - For metrics and statistics
- `EmptyState` - For no-data states
- `UnifiedCard` - Base card component
- `LoadingOverlay` - For loading states

## Created

Phase 7.2 - November 2, 2025
