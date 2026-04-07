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

async function loadSellerOrders(sellerId: string): Promise<OrderDocument[]> {
  const items: OrderDocument[] = [];
  let page = 1;

  while (true) {
    const result = await orderRepository.listAll({
      filters: `sellerId==${sellerId}`,
      sorts: "-createdAt",
      page: String(page),
      pageSize: "200",
    });
    items.push(...result.items);
    if (!result.hasMore) {
      return items;
    }
    page += 1;
  }
}

function normalizeDate(raw: Date | string | number): Date {
  if (raw instanceof Date) return raw;
  return new Date(raw as string | number);
}

export const GET = createRouteHandler({
  auth: true,
  handler: async ({ user }) => {
    const sellerId = user!.uid;

    const [allOrders, totalProductsResult, publishedProductsResult] =
      await Promise.all([
        loadSellerOrders(sellerId),
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
      new Set(allOrders.map((order) => order.productId)),
    );
    const products = await Promise.all(
      productIds.map((productId) => productRepository.findById(productId)),
    );
    const productMap = new Map(
      products.filter(Boolean).map((product) => [product!.id, product!]),
    );

    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce(
      (sum, o) => sum + (o.totalPrice ?? 0),
      0,
    );
    const totalProducts = totalProductsResult.total;
    const publishedProducts = publishedProductsResult.total;

    // 4. Monthly revenue for last 6 months
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

    for (const order of allOrders) {
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

    for (const order of allOrders) {
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
