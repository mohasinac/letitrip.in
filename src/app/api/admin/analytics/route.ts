/**
 * Admin Analytics API Route
 *
 * GET /api/admin/analytics
 *
 * Returns platform-wide revenue and order statistics for admin charts.
 * Computes:
 *  - Total orders + revenue (all-time)
 *  - New orders + revenue this month
 *  - Monthly breakdown for the last 12 months
 *  - Top 5 products by total revenue
 */

import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { orderRepository, productRepository } from "@/repositories";

/** Month label in "Mon YYYY" format */
function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function normalizeDate(raw: Date | string | number): Date {
  if (raw instanceof Date) return raw;
  return new Date(raw as string | number);
}

export const GET = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async () => {
    const [allOrders, allProducts] = await Promise.all([
      orderRepository.findAll(),
      productRepository.findAll(),
    ]);

    // All-time totals
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce(
      (sum, o) => sum + (o.totalPrice ?? 0),
      0,
    );

    // This-month totals
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthOrders = allOrders.filter(
      (o) => normalizeDate(o.createdAt) >= monthStart,
    );
    const newOrdersThisMonth = thisMonthOrders.length;
    const revenueThisMonth = thisMonthOrders.reduce(
      (sum, o) => sum + (o.totalPrice ?? 0),
      0,
    );

    // Monthly breakdown — last 12 months
    const monthMap = new Map<
      string,
      { month: string; orders: number; revenue: number; sortKey: string }
    >();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = getMonthLabel(d);
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(sortKey, { month: label, orders: 0, revenue: 0, sortKey });
    }

    for (const order of allOrders) {
      const d = normalizeDate(order.createdAt);
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthMap.has(sortKey)) {
        const entry = monthMap.get(sortKey)!;
        entry.orders += 1;
        entry.revenue += order.totalPrice ?? 0;
      }
    }

    const ordersByMonth = Array.from(monthMap.values()).map(
      ({ month, orders, revenue }) => ({ month, orders, revenue }),
    );

    // Top 5 products by total revenue
    const revenueByProduct = new Map<
      string,
      { productId: string; title: string; revenue: number; orders: number }
    >();

    for (const order of allOrders) {
      const existing = revenueByProduct.get(order.productId);
      if (existing) {
        existing.revenue += order.totalPrice ?? 0;
        existing.orders += 1;
      } else {
        revenueByProduct.set(order.productId, {
          productId: order.productId,
          title: order.productTitle,
          revenue: order.totalPrice ?? 0,
          orders: 1,
        });
      }
    }

    const topProducts = Array.from(revenueByProduct.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((p) => {
        const product = allProducts.find((prod) => prod.id === p.productId);
        return {
          ...p,
          mainImage: product?.mainImage ?? "",
        };
      });

    return successResponse({
      summary: {
        totalOrders,
        totalRevenue,
        newOrdersThisMonth,
        revenueThisMonth,
        totalProducts: allProducts.length,
        publishedProducts: allProducts.filter((p) => p.status === "published")
          .length,
      },
      ordersByMonth,
      topProducts,
    });
  },
});
