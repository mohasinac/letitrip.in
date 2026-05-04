/**
 * Firebase HTTPS Function â€” Promotions Data
 *
 * Fetches promoted products, featured products, and active coupons entirely
 * on Firebase servers â€” including the coupon start-date guard that cannot be
 * expressed as a single Firestore compound query. Eliminates Vercel compute
 * for public, high-traffic promotional data.
 *
 * Auth: x-internal-secret header (server-to-server, no user auth required).
 */

import { onRequest } from "firebase-functions/v2/https";
import type { Request, Response } from "express";
import {
  productRepository,
  couponsRepository,
  ProductStatusValues,
} from "../lib/appkit";
import { REGION } from "../config/constants";
import { logInfo, logError } from "../utils/logger";

const FN = "promotions";

function verifySecret(req: Request): boolean {
  const secret = process.env.LETITRIP_INTERNAL_SECRET;
  if (!secret) return false;
  const header = req.headers["x-internal-secret"];
  const value = Array.isArray(header) ? header[0] : header;
  return value === secret;
}

export const promotionsApi = onRequest(
  {
    region: REGION,
    timeoutSeconds: 30,
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

    try {
      logInfo(FN, "Promotions data requested");
      const now = new Date();
      const nowIso = now.toISOString();

      const [promotedResult, featuredResult, activeCouponsResult] =
        await Promise.all([
          productRepository.list(
            {
              filters: `status==${ProductStatusValues.PUBLISHED},isPromoted==true`,
              sorts: "-createdAt",
              page: "1",
              pageSize: "12",
            },
            { status: ProductStatusValues.PUBLISHED },
          ),
          productRepository.list(
            {
              filters: `status==${ProductStatusValues.PUBLISHED},featured==true`,
              sorts: "-createdAt",
              page: "1",
              pageSize: "8",
            },
            { status: ProductStatusValues.PUBLISHED },
          ),
          couponsRepository.list({
            filters: `validity.isActive==true,validity.endDate>=${nowIso}`,
            sorts: "validity.endDate",
            page: "1",
            pageSize: "50",
          }),
        ]);

      // Coupons without a startDate are always active; those with one must
      // have started. Firestore cannot express "null OR <= value" in one query,
      // so the guard runs here on Firebase servers (â‰¤50 items â€” trivial).
      const activeCoupons = activeCouponsResult.items.filter(
        (c) => !c.validity?.startDate || new Date(c.validity.startDate) <= now,
      );

      logInfo(FN, "Promotions loaded", {
        promoted: promotedResult.items.length,
        featured: featuredResult.items.length,
        coupons: activeCoupons.length,
      });

      res.status(200).json({
        promotedProducts: promotedResult.items,
        featuredProducts: featuredResult.items,
        activeCoupons,
      });
    } catch (error) {
      logError(FN, "Failed to load promotions data", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);
