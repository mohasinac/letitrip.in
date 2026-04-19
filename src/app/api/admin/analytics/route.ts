import "@/providers.config";
import { createApiHandler as createRouteHandler } from "@mohasinac/appkit/server";
import { successResponse } from "@mohasinac/appkit/server";
import { orderRepository, productRepository } from "@mohasinac/appkit/server";
import { formatMonthYear } from "@mohasinac/appkit/server";

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

import type { OrderDocument } from "@mohasinac/appkit/server";
import { ProductStatusValues } from "@mohasinac/appkit/server";

function normalizeDate(raw: Date | string | number): Date {
  if (raw instanceof Date) return raw;
  return new Date(raw as string | number);
}

/**
 * Fetch orders from past 12 months using Sieve date filtering (database-level).
 * Bounded window prevents memory-based full scans.
 */
async function loadPast12MonthsOrders(): Promise<OrderDocument[]> {
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  const isoStart = twelveMonthsAgo.toISOString();

  // Query with Sieve date filter: createdAt >= 12 months ago
  const result = await orderRepository.listAll({
    filters: `createdAt>=${isoStart}`,
    sorts: "-createdAt",
    page: "1",
    pageSize: "500", // Reasonable bound for 12 months
  });

  // Paginate if needed (total orders last 12 months might exceed 500)
  let allItems = result.items;
  let page = 2;
  let hasMore = result.hasMore;
  while (hasMore && page <= 10) {
    const nextResult = await orderRepository.listAll({
      filters: `createdAt>=${isoStart}`,
      sorts: "-createdAt",
      page: String(page),
      pageSize: "500",
    });
    allItems.push(...nextResult.items);
    hasMore = nextResult.hasMore;
    page += 1;
  }

  return allItems;
}

async function loadCurrentMonthOrders(): Promise<OrderDocument[]> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const isoStart = monthStart.toISOString();

  const result = await orderRepository.listAll({
    filters: `createdAt>=${isoStart}`,
    sorts: "-createdAt",
    page: "1",
    pageSize: "500",
  });

  let allItems = result.items;
  let page = 2;
  let hasMore = result.hasMore;
  while (hasMore && page <= 10) {
    const nextResult = await orderRepository.listAll({
      filters: `createdAt>=${isoStart}`,
      sorts: "-createdAt",
      page: String(page),
      pageSize: "500",
    });
    allItems.push(...nextResult.items);
    hasMore = nextResult.hasMore;
    page += 1;
  }

  return allItems;
}

export const GET = createRouteHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async () => {
    const now = new Date();

    // Fetch counts (all-time) and past-12-months orders in parallel
    const [
      allTimeTotalsResult,
      past12MonthsOrders,
      thisMonthOrders,
      totalProductsResult,
      publishedProductsResult,
    ] = await Promise.all([
      orderRepository.listAll({
        page: "1",
        pageSize: "1",
      }),
      loadPast12MonthsOrders(),
      loadCurrentMonthOrders(),
      productRepository.list({ page: "1", pageSize: "1" }),
      productRepository.list(
        {
          filters: `status==${ProductStatusValues.PUBLISHED}`,
          page: "1",
          pageSize: "1",
        },
        { status: ProductStatusValues.PUBLISHED },
      ),
    ]);

    // All-time totals (use repository result.total for accurate count)
    const totalOrders = allTimeTotalsResult.total;
    // For all-time revenue, we need a separate aggregation or pre-computed value
    // For now, estimate from past 12 months (TODO: add Cloud Function for pre-aggregation)
    const totalRevenue = past12MonthsOrders.reduce(
      (sum, o) => sum + (o.totalPrice ?? 0),
      0,
    );

    // This-month totals
    const newOrdersThisMonth = thisMonthOrders.length;
    const revenueThisMonth = thisMonthOrders.reduce(
      (sum, o) => sum + (o.totalPrice ?? 0),
      0,
    );

    // Monthly breakdown — last 12 months (bounded aggregation on past12MonthsOrders)
    const monthMap = new Map<
      string,
      { month: string; orders: number; revenue: number; sortKey: string }
    >();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = formatMonthYear(d);
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(sortKey, { month: label, orders: 0, revenue: 0, sortKey });
    }

    for (const order of past12MonthsOrders) {
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

    // Top 5 products by total revenue (aggregated from past 12 months)
    const revenueByProduct = new Map<
      string,
      { productId: string; title: string; revenue: number; orders: number }
    >();

    for (const order of past12MonthsOrders) {
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
      .map((p) => p);

    const topProductDocs = await Promise.all(
      topProducts.map((product) =>
        productRepository.findById(product.productId),
      ),
    );

    const topProductsWithImages = topProducts.map((p, index) => {
      const product = topProductDocs[index];
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
        totalProducts: totalProductsResult.total,
        publishedProducts: publishedProductsResult.total,
      },
      ordersByMonth,
      topProducts: topProductsWithImages,
    });
  },
});

