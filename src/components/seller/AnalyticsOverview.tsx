"use client";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Package,
  Users,
} from "lucide-react";
import { StatsCard } from "@/components/common/StatsCard";

interface AnalyticsData {
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
}

interface Props {
  data: AnalyticsData;
}

export default function AnalyticsOverview({ data }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Revenue"
        value={formatCurrency(data.revenue.total)}
        icon={<DollarSign className="w-6 h-6" />}
        trend={
          data.revenue.trend !== 0
            ? {
                value: Math.abs(data.revenue.trend),
                isPositive: data.revenue.trend > 0,
              }
            : undefined
        }
      />

      <StatsCard
        title="Total Orders"
        value={data.orders.total.toString()}
        icon={<ShoppingBag className="w-6 h-6" />}
        description={`${data.orders.completed} completed, ${data.orders.pending} pending`}
      />

      <StatsCard
        title="Active Products"
        value={data.products.active.toString()}
        icon={<Package className="w-6 h-6" />}
        description={`${data.products.outOfStock} out of stock`}
      />

      <StatsCard
        title="Total Customers"
        value={data.customers.total.toString()}
        icon={<Users className="w-6 h-6" />}
        description={`${data.conversionRate.toFixed(1)}% conversion rate`}
      />
    </div>
  );
}
