/**
 * Firebase HTTPS Function â€” Admin Analytics
 *
 * Handles all Firestore querying and aggregation on Firebase servers,
 * eliminating Vercel compute for analytics. Called by the thin-proxy
 * Next.js route at /api/admin/analytics.
 *
 * Auth: x-internal-secret header (server-to-server, set in both Vercel and Firebase env).
 */

import { onRequest } from "firebase-functions/v2/https";
import type { Request, Response } from "express";
import {
  orderRepository,
  productRepository,
  formatMonthYear,
  ProductStatusValues,
} from "../lib/appkit";
import { REGION } from "../config/constants";
import { logInfo, logError } from "../utils/logger";
import type { OrderDocument } from "@mohasinac/appkit";

const FN = "adminAnalytics";

function verifySecret(req: Request): boolean {
  const secret = process.env.LETITRIP_INTERNAL_SECRET;
  if (!secret) return false;
  const header = req.headers["x-internal-secret"];
  const value = Array.isArray(header) ? header[0] : header;
  return value === secret;
}

function normalizeDate(raw: Date | string | number): Date {
  if (raw instanceof Date) return raw;
  return new Date(raw as string | number);
}

async function loadPast12MonthsOrders(): Promise<OrderDocument[]> {
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  const isoStart = twelveMonthsAgo.toISOString();

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
    const next = await orderRepository.listAll({
      filters: `createdAt>=${isoStart}`,
      sorts: "-createdAt",
      page: String(page),
      pageSize: "500",
    });
    allItems.push(...next.items);
    hasMore = next.hasMore;
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
    const next = await orderRepository.listAll({
      filters: `createdAt>=${isoStart}`,
      sorts: "-createdAt",
      page: String(page),
      pageSize: "500",
    });
    allItems.push(...next.items);
    hasMore = next.hasMore;
    page += 1;
  }

  return allItems;
}

export const adminAnalytics = onRequest(
  {
    region: REGION,
    timeoutSeconds: 120,
    memory: "512MiB",
    maxInstances: 10,
    cors: false,
  },
  async (req: Request, res: Response) => {
    if (!verifySecret(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      logInfo(FN, "Admin analytics requested");
      const now = new Date();

      const [
        allTimeTotalsResult,
        past12MonthsOrders,
        thisMonthOrders,
        totalProductsResult,
        publishedProductsResult,
      ] = await Promise.all([
        orderRepository.listAll({ page: "1", pageSize: "1" }),
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

      const totalOrders = allTimeTotalsResult.total;
      const totalRevenue = past12MonthsOrders.reduce(
        (sum, o) => sum + (o.totalPrice ?? 0),
        0,
      );
      const newOrdersThisMonth = thisMonthOrders.length;
      const revenueThisMonth = thisMonthOrders.reduce(
        (sum, o) => sum + (o.totalPrice ?? 0),
        0,
      );

      // Monthly breakdown â€” last 12 months
      const monthMap = new Map<
        string,
        { month: string; orders: number; revenue: number }
      >();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = formatMonthYear(d);
        const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthMap.set(sortKey, { month: label, orders: 0, revenue: 0 });
      }

      for (const order of past12MonthsOrders) {
        const d = normalizeDate(order.createdAt);
        const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const entry = monthMap.get(sortKey);
        if (entry) {
          entry.orders += 1;
          entry.revenue += order.totalPrice ?? 0;
        }
      }

      const ordersByMonth = Array.from(monthMap.values());

      // Top 5 products by revenue (aggregated from past 12 months)
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
        .slice(0, 5);

      const topProductDocs = await Promise.all(
        topProducts.map((p) => productRepository.findById(p.productId)),
      );

      const topProductsWithImages = topProducts.map((p, i) => ({
        ...p,
        mainImage: topProductDocs[i]?.mainImage ?? "",
      }));

      logInfo(FN, "Admin analytics computed", {
        totalOrders,
        monthsComputed: ordersByMonth.length,
        topProductCount: topProductsWithImages.length,
      });

      res.status(200).json({
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
    } catch (error) {
      logError(FN, "Failed to compute admin analytics", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);
