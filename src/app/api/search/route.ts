/**
 * Search API Route
 *
 * GET /api/search?q=...&category=...&minPrice=...&maxPrice=...&sort=...&page=...&pageSize=...
 *
 * When Algolia env vars are configured (ALGOLIA_APP_ID + ALGOLIA_ADMIN_API_KEY),
 * delegates to Algolia for scalable full-text search.
 * Falls back to Firestore-native Sieve-based search otherwise (title starts-with; full-text requires Algolia).
 *
 * Response meta includes `backend: "algolia" | "in-memory"` so callers can
 * detect which engine served the request.
 */

import { NextRequest } from "next/server";
import { productRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { serverLogger } from "@/lib/server-logger";
import { createApiHandler } from "@/lib/api/api-handler";
import { isAlgoliaConfigured, algoliaSearch } from "@/lib/search/algolia";

export const GET = createApiHandler({
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);
    const q = getStringParam(searchParams, "q") ?? "";
    const category = getStringParam(searchParams, "category");
    const subcategory = getStringParam(searchParams, "subcategory");
    const minPrice = getNumberParam(searchParams, "minPrice", 0, { min: 0 });
    const maxPrice = getNumberParam(searchParams, "maxPrice", 0, { min: 0 });
    const condition = getStringParam(searchParams, "condition");
    const isAuctionRaw = getStringParam(searchParams, "isAuction");
    const isAuction =
      isAuctionRaw === "true" ? true : isAuctionRaw === "false" ? false : null;
    const isPreOrderRaw = getStringParam(searchParams, "isPreOrder");
    const isPreOrder =
      isPreOrderRaw === "true"
        ? true
        : isPreOrderRaw === "false"
          ? false
          : null;
    const inStock =
      getStringParam(searchParams, "inStock") === "true" ? true : null;
    const minRating = getNumberParam(searchParams, "minRating", 0, {
      min: 0,
      max: 5,
    });
    const sort = getStringParam(searchParams, "sort") || "-createdAt";
    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 20, {
      min: 1,
      max: 100,
    });

    if (isAlgoliaConfigured()) {
      const algoliaResult = await algoliaSearch({
        q,
        category,
        subcategory,
        minPrice,
        maxPrice,
        condition,
        isAuction,
        isPreOrder,
        inStock,
        minRating,
        sort,
        page,
        pageSize,
      });
      serverLogger.info("Search completed (Algolia)", {
        q: q || "(empty)",
        category: category || "(all)",
        total: algoliaResult.total,
        page: algoliaResult.page,
      });
      return successResponse({
        items: algoliaResult.items,
        q,
        page: algoliaResult.page,
        pageSize: algoliaResult.pageSize,
        total: algoliaResult.total,
        totalPages: algoliaResult.totalPages,
        hasMore: algoliaResult.hasMore,
        backend: "algolia" as const,
      });
    }

    const filterParts: string[] = ["status==published"];
    if (category) filterParts.push(`category==${category}`);
    if (subcategory) filterParts.push(`subcategory==${subcategory}`);
    if (minPrice > 0) filterParts.push(`price>=${minPrice}`);
    if (maxPrice > 0 && maxPrice >= minPrice)
      filterParts.push(`price<=${maxPrice}`);
    if (condition) filterParts.push(`condition==${condition}`);
    if (isAuction === true) filterParts.push("isAuction==true");
    if (isPreOrder === true) filterParts.push("isPreOrder==true");
    if (q.trim()) filterParts.push(`title_=${q.trim()}`);

    const sieveResult = await productRepository.list({
      filters: filterParts.join(","),
      sorts: sort,
      page: String(page),
      pageSize: String(pageSize),
    });

    serverLogger.info("Search completed (Firestore-native)", {
      q: q || "(empty)",
      category: category || "(all)",
      minPrice,
      maxPrice,
      total: sieveResult.total,
      page: sieveResult.page,
    });

    return successResponse({
      items: sieveResult.items,
      q,
      page: sieveResult.page,
      pageSize: sieveResult.pageSize,
      total: sieveResult.total,
      totalPages: sieveResult.totalPages,
      hasMore: sieveResult.hasMore,
      backend: "in-memory" as const,
    });
  },
});
