import "@/providers.config";
/**
 * Seller Analytics API Route
 *
 * GET /api/seller/analytics
 *
 * Returns analytics for the authenticated seller's products and orders.
 * Strategy:
 *  1. Get seller's products via productRepository.findBySeller
 *  2. Gather orders for each product in parallel
 *  3. Aggregate totals, monthly breakdown (last 6 months), and top products
 */

import { orderRepository, productRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
import { serverLogger } from "@/lib/server-logger";
import { formatMonthYear } from "@/utils";
import type { OrderDocument } from "@/db/schema";

/**
 * Fetch seller orders from past 6 months using Sieve date filtering (database-level).
 * Bounded window prevents memory-based full scans.
 */
async function loadSeller6MonthOrders(
  sellerId: string,
): Promise<OrderDocument[]> {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const isoStart = sixMonthsAgo.toISOString();

  // Query with Sieve filters: sellerId AND createdAt >= 6 months ago
  const result = await orderRepository.listAll({
    filters: `sellerId==${sellerId},createdAt>=${isoStart}`,
    sorts: "-createdAt",
    page: "1",
    pageSize: "300",
  });

  // Paginate if needed
  let allItems = result.items;
  let page = 2;
  while (result.hasMore && page <= 5) {
    const nextResult = await orderRepository.listAll({
      filters: `sellerId==${sellerId},createdAt>=${isoStart}`,
      sorts: "-createdAt",
      page: String(page),
      pageSize: "300",
    });
    allItems.push(...nextResult.items);
    if (!nextResult.hasMore) break;
    page += 1;
  }

  return allItems;
}

function normalizeDate(raw: Date | string | number): Date {
  if (raw instanceof Date) return raw;
  return new Date(raw as string | number);
}

export const GET = createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const sellerId = user!.uid;

    const [past6MonthOrders, totalProductsResult, publishedProductsResult] =
      await Promise.all([
        loadSeller6MonthOrders(sellerId),
        productRepository.list(
          {
            page: "1",
            pageSize: "1",
          },
          { sellerId },
        ),
        productRepository.list(
          {
            filters: "status==published",
            page: "1",
            pageSize: "1",
          },
          { sellerId, status: "published" },
        ),
      ]);

    const productIds = Array.from(
      new Set(past6MonthOrders.map((order) => order.productId)),
    );
    const products = await Promise.all(
      productIds.map((productId) => productRepository.findById(productId)),
    );
    const productMap = new Map(
      products.filter(Boolean).map((product) => [product!.id, product!]),
    );

    const totalOrders = past6MonthOrders.length;
    const totalRevenue = past6MonthOrders.reduce(
      (sum, o) => sum + (o.totalPrice ?? 0),
      0,
    );
    const totalProducts = totalProductsResult.total;
    const publishedProducts = publishedProductsResult.total;

    // 4. Monthly revenue for last 6 months (bounded aggregation)
    const now = new Date();
    const monthMap = new Map<
      string,
      { month: string; orders: number; revenue: number; sortKey: string }
    >();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = formatMonthYear(d);
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(sortKey, { month: label, orders: 0, revenue: 0, sortKey });
    }

    for (const order of past6MonthOrders) {
      const d = normalizeDate(order.createdAt);
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthMap.has(sortKey)) {
        const entry = monthMap.get(sortKey)!;
        entry.orders += 1;
        entry.revenue += order.totalPrice ?? 0;
      }
    }

    const revenueByMonth = Array.from(monthMap.values()).map(
      ({ month, orders, revenue }) => ({ month, orders, revenue }),
    );

    // 5. Top 5 products by revenue
    const revenueByProduct = new Map<
      string,
      {
        productId: string;
        title: string;
        revenue: number;
        orders: number;
        mainImage: string;
      }
    >();

    for (const order of past6MonthOrders) {
      const existing = revenueByProduct.get(order.productId);
      if (existing) {
        existing.revenue += order.totalPrice ?? 0;
        existing.orders += 1;
      } else {
        const product = productMap.get(order.productId);
        revenueByProduct.set(order.productId, {
          productId: order.productId,
          title: order.productTitle,
          revenue: order.totalPrice ?? 0,
          orders: 1,
          mainImage: product?.mainImage ?? "",
        });
      }
    }

    const topProducts = Array.from(revenueByProduct.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    serverLogger.info("Seller analytics loaded", {
      sellerId,
      productCount: totalProducts,
      orderCount: totalOrders,
    });

    return successResponse({
      summary: {
        totalOrders,
        totalRevenue,
        totalProducts,
        publishedProducts,
      },
      revenueByMonth,
      topProducts,
    });
  },
});
