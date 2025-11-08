# Phase 3.6: Shop Analytics - QUICK REFERENCE

**Status:** ✅ COMPLETE  
**Date:** November 8, 2025

---

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   └── analytics/
│   │       └── route.ts                 # Analytics API endpoint
│   └── seller/
│       └── analytics/
│           └── page.tsx                 # Analytics dashboard page
│
└── components/
    └── seller/
        ├── AnalyticsOverview.tsx        # Stats cards grid
        ├── SalesChart.tsx               # Line chart component
        └── TopProducts.tsx              # Bar chart + table
```

---

## 🔌 API Endpoint

### GET /api/analytics

**Auth:** Seller or Admin required

**Query Params:**

```typescript
{
  shop_id?: string;      // Required for sellers, optional for admins
  start_date?: string;   // ISO date (default: 30 days ago)
  end_date?: string;     // ISO date (default: now)
}
```

**Response:**

```typescript
{
  success: boolean;
  data: {
    revenue: { total: number; average: number; trend: number };
    orders: { total: number; pending: number; completed: number; cancelled: number };
    products: { total: number; active: number; outOfStock: number };
    customers: { total: number; new: number; returning: number };
    conversionRate: number;
    averageOrderValue: number;
    salesOverTime: Array<{ date: string; revenue: number }>;
    topProducts: Array<{ id: string; name: string; revenue: number; quantity: number }>;
    revenueByCategory: Array<{ category: string; revenue: number }>;
  }
}
```

---

## 🧩 Component Usage

### AnalyticsOverview

```tsx
import AnalyticsOverview from "@/components/seller/AnalyticsOverview";

<AnalyticsOverview data={analytics} />;
```

**Props:**

```typescript
interface Props {
  data: {
    revenue: { total: number; average: number; trend: number };
    orders: {
      total: number;
      pending: number;
      completed: number;
      cancelled: number;
    };
    products: { total: number; active: number; outOfStock: number };
    customers: { total: number; new: number; returning: number };
    conversionRate: number;
    averageOrderValue: number;
  };
}
```

**Display:** 4 StatsCard components in responsive grid (1 col → 4 cols)

---

### SalesChart

```tsx
import SalesChart from "@/components/seller/SalesChart";

<SalesChart data={analytics.salesOverTime} />;
```

**Props:**

```typescript
interface Props {
  data: Array<{
    date: string; // YYYY-MM-DD format
    revenue: number;
  }>;
}
```

**Display:** Line chart with date X-axis and revenue Y-axis

---

### TopProducts

```tsx
import TopProducts from "@/components/seller/TopProducts";

<TopProducts data={analytics.topProducts} />;
```

**Props:**

```typescript
interface Props {
  data: Array<{
    id: string;
    name: string;
    revenue: number;
    quantity: number;
  }>;
}
```

**Display:** Bar chart (top 5) + table (all products)

---

## 📊 Metrics Explained

### Revenue

- **Total:** Sum of all completed orders
- **Average:** Total revenue / total orders (AOV)
- **Trend:** % change vs previous period (not yet implemented)

### Orders

- **Total:** All orders in date range
- **Pending:** Orders with status `pending` or `confirmed`
- **Completed:** Orders with status `delivered`
- **Cancelled:** Orders with status `cancelled`

### Products

- **Total:** All products in shop
- **Active:** Products with status `published`
- **Out of Stock:** Products with `stock_count` = 0

### Customers

- **Total:** Unique customer IDs from orders
- **New:** First-time buyers in period (not yet implemented)
- **Returning:** Repeat buyers in period (not yet implemented)

### Conversion Rate

- Formula: `(completed orders / total customers) * 100`
- Simplified calculation (no page view tracking yet)
- Future: `(purchases / unique visitors) * 100`

### Average Order Value (AOV)

- Formula: `total revenue / total orders`
- Industry benchmark: ₹1,500 - ₹3,000 for Indian ecommerce

---

## 🎨 Quick Date Filters

**Buttons:**

- Last 7 Days
- Last 30 Days (default)
- Last 90 Days
- Year to Date (YTD)

**Implementation:**

```tsx
// Last 7 Days
const date = new Date();
date.setDate(date.getDate() - 7);
setStartDate(date);
setEndDate(new Date());

// Last 30 Days
const date = new Date();
date.setDate(date.getDate() - 30);
setStartDate(date);
setEndDate(new Date());

// Last 90 Days
const date = new Date();
date.setDate(date.getDate() - 90);
setStartDate(date);
setEndDate(new Date());

// Year to Date
const date = new Date();
date.setMonth(0, 1); // January 1st
setStartDate(date);
setEndDate(new Date());
```

---

## 🔄 Data Flow

```
User visits /seller/analytics
         ↓
Auth guard checks role (seller/admin)
         ↓
Page loads with default filters
  - shop_id: seller's shop (or all for admin)
  - start_date: 30 days ago
  - end_date: now
         ↓
Fetch /api/analytics?shop_id=...&start_date=...&end_date=...
         ↓
API queries Firestore:
  1. Get order_items by shop_id
  2. Extract order IDs (batch if > 10)
  3. Get orders by IDs + date range
  4. Get products by shop_id
  5. Aggregate metrics
         ↓
Return JSON response
         ↓
Page displays:
  - AnalyticsOverview (stats cards)
  - SalesChart (line chart)
  - TopProducts (bar chart + table)
  - Order Status breakdown
  - Key Metrics summary
         ↓
User changes filters → Refetch data
```

---

## 🧮 Calculation Formulas

### Revenue Calculations

```typescript
// Total Revenue
const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

// Average Order Value
const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
```

### Order Status Breakdown

```typescript
const pending = orders.filter(
  (o) => o.status === "pending" || o.status === "confirmed"
).length;
const completed = orders.filter((o) => o.status === "delivered").length;
const cancelled = orders.filter((o) => o.status === "cancelled").length;
```

### Sales Over Time

```typescript
const salesByDay = new Map<string, number>();

orders.forEach((order) => {
  const date = new Date(order.created_at).toISOString().split("T")[0];
  const currentRevenue = salesByDay.get(date) || 0;
  salesByDay.set(date, currentRevenue + (order.total || 0));
});

const salesOverTime = Array.from(salesByDay.entries())
  .map(([date, revenue]) => ({ date, revenue }))
  .sort((a, b) => a.date.localeCompare(b.date));
```

### Top Products

```typescript
const productSales = new Map<
  string,
  { name: string; revenue: number; quantity: number }
>();

orderItems.forEach((item) => {
  const productId = item.product_id;
  const existing = productSales.get(productId) || {
    name: item.product_name || "Unknown",
    revenue: 0,
    quantity: 0,
  };

  existing.revenue += (item.price || 0) * (item.quantity || 0);
  existing.quantity += item.quantity || 0;

  productSales.set(productId, existing);
});

const topProducts = Array.from(productSales.entries())
  .map(([id, data]) => ({ id, ...data }))
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 10);
```

### Unique Customers

```typescript
const customerIds = [...new Set(orders.map((o) => o.customer_id))];
const totalCustomers = customerIds.length;
```

### Conversion Rate

```typescript
const conversionRate =
  totalCustomers > 0 ? (completedOrders / totalCustomers) * 100 : 0;
```

---

## 🎨 UI Components

### StatsCard Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatsCard
    title="Total Revenue"
    value={formatCurrency(data.revenue.total)}
    icon={<DollarSign className="w-6 h-6" />}
    trend={{ value: 5.2, isPositive: true }} // Optional
  />
  <StatsCard
    title="Total Orders"
    value={data.orders.total.toString()}
    icon={<ShoppingBag className="w-6 h-6" />}
    description={`${data.orders.completed} completed`}
  />
  // ... more cards
</div>
```

### Recharts Line Chart

```tsx
<ResponsiveContainer width="100%" height={320}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis dataKey="date" tickFormatter={formatDate} stroke="#6b7280" />
    <YAxis tickFormatter={formatCurrency} stroke="#6b7280" />
    <Tooltip
      formatter={(value: number) => formatCurrency(value)}
      labelFormatter={formatDate}
    />
    <Line
      type="monotone"
      dataKey="revenue"
      stroke="#3b82f6"
      strokeWidth={2}
      dot={{ fill: "#3b82f6", r: 4 }}
    />
  </LineChart>
</ResponsiveContainer>
```

### Recharts Bar Chart

```tsx
<ResponsiveContainer width="100%" height={320}>
  <BarChart data={data.slice(0, 5)} layout="vertical">
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    <XAxis type="number" tickFormatter={formatCurrency} stroke="#6b7280" />
    <YAxis type="category" dataKey="name" width={150} stroke="#6b7280" />
    <Tooltip formatter={(value: number) => formatCurrency(value)} />
    <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
  </BarChart>
</ResponsiveContainer>
```

---

## 🚀 Usage Examples

### Fetch Analytics Data

```typescript
const fetchAnalytics = async () => {
  const params = new URLSearchParams();
  if (shopId) params.append("shop_id", shopId);
  params.append("start_date", startDate.toISOString());
  params.append("end_date", endDate.toISOString());

  const response = await fetch(`/api/analytics?${params.toString()}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error);
  }

  setAnalytics(result.data);
};
```

### Format Currency

```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Usage
formatCurrency(125000); // "₹1,25,000"
```

### Format Date

```typescript
import { format } from "date-fns";

const formatDate = (dateString: string) => {
  return format(new Date(dateString), "MMM dd");
};

// Usage
formatDate("2025-11-08"); // "Nov 08"
```

---

## 🔧 Common Tasks

### Add New Metric

1. **Update API Response:**

```typescript
// In /api/analytics/route.ts
analytics.newMetric = calculateNewMetric(orders, products);
```

2. **Update Component:**

```tsx
// In AnalyticsOverview.tsx
<StatsCard
  title="New Metric"
  value={data.newMetric.toString()}
  icon={<Icon className="w-6 h-6" />}
/>
```

3. **Update TypeScript Interface:**

```typescript
// In page.tsx
interface AnalyticsData {
  // ...existing fields
  newMetric: number;
}
```

### Add New Chart

1. **Create Component:**

```tsx
// /components/seller/NewChart.tsx
"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function NewChart({ data }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Title</h3>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

2. **Add to Dashboard:**

```tsx
// In /seller/analytics/page.tsx
import NewChart from "@/components/seller/NewChart";

<NewChart data={analytics.newChartData} />;
```

### Change Date Range Default

```typescript
// In page.tsx
const [startDate, setStartDate] = useState<Date>(() => {
  const date = new Date();
  date.setDate(date.getDate() - 7); // Change from 30 to 7
  return date;
});
```

---

## 🐛 Troubleshooting

### Issue: No data showing

**Check:**

1. Shop has orders in date range
2. Date range is correct (start < end)
3. Shop ID is valid
4. User has permissions (seller/admin)

**Solution:**

```typescript
console.log("Filters:", { shopId, startDate, endDate });
console.log("API Response:", result);
```

### Issue: Charts not rendering

**Check:**

1. Recharts installed: `npm list recharts`
2. Data format is correct
3. ResponsiveContainer has parent with defined height

**Solution:**

```tsx
// Wrap in div with height
<div className="h-80">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>{/* ... */}</LineChart>
  </ResponsiveContainer>
</div>
```

### Issue: Slow API response

**Check:**

1. Number of orders in date range
2. Number of shops (if admin viewing all)
3. Firestore indexes created

**Solution:**

```typescript
// Add console logs to measure time
console.time('Analytics API');
// ... API logic
console.timeEnd('Analytics API');

// Add limits to queries
.limit(1000)
```

### Issue: Incorrect calculations

**Check:**

1. Order status values match expectations
2. Date filtering is correct
3. Shop ID filtering is correct

**Solution:**

```typescript
// Log intermediate values
console.log("Total Orders:", orders.length);
console.log("Completed:", completed.length);
console.log("Revenue:", totalRevenue);
```

---

## 📚 Resources

- **Recharts Docs:** https://recharts.org/
- **Firestore Queries:** https://firebase.google.com/docs/firestore/query-data
- **date-fns:** https://date-fns.org/
- **Phase 3.6 Completion:** PHASE_3.6_COMPLETION.md

---

## ✅ Quick Checklist

When working with analytics:

- [ ] User is authenticated (seller/admin)
- [ ] Shop ID is provided (sellers) or optional (admins)
- [ ] Date range is valid (start ≤ end)
- [ ] API returns success response
- [ ] Data structure matches TypeScript interfaces
- [ ] Charts render without errors
- [ ] Empty states show when no data
- [ ] Loading states show during fetch
- [ ] Error messages are user-friendly
- [ ] Currency formatted as INR
- [ ] Dates formatted consistently

---

**Last Updated:** November 8, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
