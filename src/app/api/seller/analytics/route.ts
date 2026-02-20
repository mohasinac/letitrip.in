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

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import { orderRepository, productRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse } from "@/lib/api-response";
import { serverLogger } from "@/lib/server-logger";
import type { OrderDocument } from "@/db/schema";

function normalizeDate(raw: Date | string | number): Date {
  if (raw instanceof Date) return raw;
  return new Date(raw as string | number);
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth();
    const sellerId = user.uid;

    // 1. Fetch seller's products
    const products = await productRepository.findBySeller(sellerId);
    const productIds = products.map((p) => p.id);

    // 2. Fetch orders for each product in parallel (capped at 20 products)
    let allOrders: OrderDocument[] = [];
    if (productIds.length > 0) {
      const orderBatches = await Promise.all(
        productIds
          .slice(0, 20)
          .map((id) => orderRepository.findByProduct(id).catch(() => [])),
      );
      allOrders = orderBatches.flat();
    }

    // 3. Aggregate summary
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce(
      (sum, o) => sum + (o.totalPrice ?? 0),
      0,
    );
    const totalProducts = products.length;
    const publishedProducts = products.filter(
      (p) => p.status === "published",
    ).length;

    // 4. Monthly revenue for last 6 months
    const now = new Date();
    const monthMap = new Map<
      string,
      { month: string; orders: number; revenue: number; sortKey: string }
    >();

    for (let i = 5; i >= 0; i--) {
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
        const product = products.find((p) => p.id === order.productId);
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
  } catch (error) {
    return handleApiError(error);
  }
}
