# StatsCard Component

## Overview

The `StatsCard` component displays key metrics and statistics with optional trend indicators, icons, and loading states. It's perfect for dashboard widgets and analytics displays.

## Location

`src/components/ui/display/StatsCard.tsx`

## Features

- 📊 Display numeric statistics with formatting
- 📈 Trend indicators (up/down/neutral) with percentage
- 🎨 Five color themes (primary, success, warning, error, info)
- 💫 Loading skeleton state
- 🖱️ Optional click handler
- 🎯 Icon support with themed backgrounds
- 📱 Responsive grid layout helper

## Basic Usage

```tsx
import { StatsCard, StatsCardGrid } from "@/components/ui/display";
import { ShoppingCart } from "lucide-react";

function Dashboard() {
  return (
    <StatsCardGrid columns={4}>
      <StatsCard
        title="Total Orders"
        value={1234}
        icon={<ShoppingCart />}
        trend={{ value: 12, direction: "up", label: "from last month" }}
        color="primary"
      />

      <StatsCard
        title="Revenue"
        value="$45,678"
        icon={<DollarSign />}
        trend={{ value: 8, direction: "up", label: "vs last week" }}
        color="success"
      />

      <StatsCard
        title="Conversion Rate"
        value="3.24%"
        icon={<TrendingUp />}
        trend={{ value: 0.5, direction: "down", label: "vs last month" }}
        color="warning"
      />
    </StatsCardGrid>
  );
}
```

## Props

### StatsCardProps

| Prop          | Type                                                       | Default     | Description                            |
| ------------- | ---------------------------------------------------------- | ----------- | -------------------------------------- |
| `title`       | `string`                                                   | Required    | The title/label of the stat            |
| `value`       | `string \| number`                                         | Required    | The main value to display              |
| `icon`        | `ReactNode`                                                | -           | Optional icon to display               |
| `trend`       | `StatsCardTrend`                                           | -           | Trend information with direction       |
| `color`       | `'primary' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'primary'` | Icon background color theme            |
| `loading`     | `boolean`                                                  | `false`     | Show loading skeleton                  |
| `description` | `string`                                                   | -           | Alternative to trend, shows plain text |
| `onClick`     | `() => void`                                               | -           | Click handler (makes card clickable)   |
| `formatValue` | `(value) => string`                                        | -           | Custom value formatter                 |
| `tooltip`     | `string`                                                   | -           | Tooltip text on hover                  |
| `className`   | `string`                                                   | -           | Additional CSS classes                 |

### StatsCardTrend

| Prop             | Type                          | Default  | Description                          |
| ---------------- | ----------------------------- | -------- | ------------------------------------ |
| `value`          | `number`                      | Required | Trend value (e.g., 12 for 12%)       |
| `direction`      | `'up' \| 'down' \| 'neutral'` | Required | Trend direction                      |
| `label`          | `string`                      | -        | Label text (e.g., "from last month") |
| `showPercentage` | `boolean`                     | `true`   | Show % sign after value              |

## Examples

### With Custom Formatting

```tsx
<StatsCard
  title="Total Users"
  value={1234567}
  formatValue={(value) => value.toLocaleString()}
  icon={<Users />}
  color="info"
/>
```

### Loading State

```tsx
<StatsCard title="Loading..." value={0} loading={true} />
```

### Clickable Card

```tsx
<StatsCard
  title="New Messages"
  value={42}
  icon={<MessageSquare />}
  onClick={() => router.push("/messages")}
  tooltip="Click to view messages"
/>
```

### With Description Instead of Trend

```tsx
<StatsCard
  title="Active Users"
  value={892}
  description="Currently online"
  icon={<Users />}
  color="success"
/>
```

### Custom Colors with className

```tsx
<StatsCard
  title="Critical Alerts"
  value={3}
  icon={<AlertTriangle />}
  color="error"
  className="border-2 border-error"
/>
```

## Grid Layout

The `StatsCardGrid` component provides responsive grid layouts:

```tsx
<StatsCardGrid columns={4}>
  {/* Cards will be:
    - 1 column on mobile
    - 2 columns on tablets
    - 4 columns on desktop
  */}
</StatsCardGrid>

<StatsCardGrid columns={3}>
  {/* 1 col mobile, 2 col tablet, 3 col desktop */}
</StatsCardGrid>

<StatsCardGrid columns={2}>
  {/* 1 col mobile, 2 col tablet and up */}
</StatsCardGrid>
```

## Accessibility

- Uses semantic HTML
- Color is not the only indicator (icons + text)
- Keyboard accessible when clickable
- Supports screen readers

## Best Practices

1. **Consistent Metrics**: Use the same card size and layout for related metrics
2. **Meaningful Trends**: Always provide context with trend labels
3. **Appropriate Colors**: Match colors to metric meaning (success = green, etc.)
4. **Value Formatting**: Always format large numbers with commas or abbreviations
5. **Loading States**: Show skeleton while fetching data

## Integration Example

```tsx
// Dashboard with real data
function DashboardStats() {
  const { data, loading } = useQuery("dashboard-stats");

  return (
    <StatsCardGrid columns={4}>
      <StatsCard
        title="Total Sales"
        value={data?.totalSales || 0}
        formatValue={(v) => `$${Number(v).toLocaleString()}`}
        icon={<DollarSign />}
        trend={{
          value: data?.salesTrend || 0,
          direction: data?.salesTrend > 0 ? "up" : "down",
          label: "vs last month",
        }}
        color="success"
        loading={loading}
      />
      {/* More cards... */}
    </StatsCardGrid>
  );
}
```

## Related Components

- `DataCard` - For detailed data display
- `EmptyState` - For no-data states
- `UnifiedCard` - Base card component

## Created

Phase 7.2 - November 2, 2025
