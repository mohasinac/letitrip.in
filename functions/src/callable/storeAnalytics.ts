/**
 * Firebase HTTPS Function â€” Store (Seller) Analytics
 *
 * Handles all Firestore querying and aggregation on Firebase servers,
 * eliminating Vercel compute for seller analytics. Called by the thin-proxy
 * Next.js route at /api/store/analytics.
 *
 * Auth: x-internal-secret header (server-to-server) + sellerId in POST body.
 * The Vercel route verifies Firebase session and passes the verified uid as sellerId.
 */

import { onRequest } from "firebase-functions/v2/https";
import type { Request, Response } from "express";
import {
  orderRepository,
  productRepository,
  storeRepository,
  formatMonthYear,
  ProductStatusValues,
} from "../lib/appkit";
import { REGION } from "../config/constants";
import { logInfo, logError } from "../utils/logger";
import type { OrderDocument } from "@mohasinac/appkit";

const FN = "storeAnalytics";

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

async function loadStore6MonthOrders(
  storeId: string,
): Promise<OrderDocument[]> {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const isoStart = sixMonthsAgo.toISOString();

  const result = await orderRepository.listAll({
    filters: `storeId==${storeId},createdAt>=${isoStart}`,
    sorts: "-createdAt",
    page: "1",
    pageSize: "300",
  });

  let allItems = result.items;
  let page = 2;
  let hasMore = result.hasMore;
  while (hasMore && page <= 5) {
    const next = await orderRepository.listAll({
      filters: `storeId==${storeId},createdAt>=${isoStart}`,
      sorts: "-createdAt",
      page: String(page),
      pageSize: "300",
    });
    allItems.push(...next.items);
    hasMore = next.hasMore;
    page += 1;
  }

  return allItems;
}

export const storeAnalytics = onRequest(
  {
    region: REGION,
    timeoutSeconds: 120,
    memory: "256MiB",
    maxInstances: 20,
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

    const sellerId = req.body?.sellerId as string | undefined;
    if (!sellerId || typeof sellerId !== "string") {
      res.status(400).json({ error: "sellerId is required" });
      return;
    }

    try {
      logInfo(FN, "Store analytics requested", { sellerId });

      // Resolve storeId (slug) from ownerId (Firebase Auth UID)
      const store = await storeRepository.findByOwnerId(sellerId);
      if (!store) {
        res.status(404).json({ error: "Store not found for this seller" });
        return;
      }
      const storeId = store.id;

      const [past6MonthOrders, totalProductsResult, publishedProductsResult] =
        await Promise.all([
          loadStore6MonthOrders(storeId),
          productRepository.list({ page: "1", pageSize: "1" }, { storeId }),
          productRepository.list(
            {
              filters: `status==${ProductStatusValues.PUBLISHED}`,
              page: "1",
              pageSize: "1",
            },
            { storeId, status: ProductStatusValues.PUBLISHED },
          ),
        ]);

      // Resolve product docs for mainImage (only unique productIds)
      const productIds = Array.from(
        new Set(past6MonthOrders.map((o) => o.productId)),
      );
      const products = await Promise.all(
        productIds.map((id) => productRepository.findById(id)),
      );
      const productMap = new Map(
        products.filter(Boolean).map((p) => [p!.id, p!]),
      );

      const totalOrders = past6MonthOrders.length;
      const totalRevenue = past6MonthOrders.reduce(
        (sum, o) => sum + (o.totalPrice ?? 0),
        0,
      );

      // Monthly breakdown â€” last 6 months
      const now = new Date();
      const monthMap = new Map<
        string,
        { month: string; orders: number; revenue: number }
      >();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = formatMonthYear(d);
        const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthMap.set(sortKey, { month: label, orders: 0, revenue: 0 });
      }

      for (const order of past6MonthOrders) {
        const d = normalizeDate(order.createdAt);
        const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const entry = monthMap.get(sortKey);
        if (entry) {
          entry.orders += 1;
          entry.revenue += order.totalPrice ?? 0;
        }
      }

      const revenueByMonth = Array.from(monthMap.values());

      // Top 5 products by revenue
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

      logInfo(FN, "Store analytics computed", {
        sellerId,
        totalOrders,
        topProductCount: topProducts.length,
      });

      res.status(200).json({
        summary: {
          totalOrders,
          totalRevenue,
          totalProducts: totalProductsResult.total,
          publishedProducts: publishedProductsResult.total,
        },
        revenueByMonth,
        topProducts,
      });
    } catch (error) {
      logError(FN, "Failed to compute store analytics", error, { sellerId });
      res.status(500).json({ error: "Internal server error" });
    }
  },
);
