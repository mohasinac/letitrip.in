/**
 * Search API Route
 *
 * GET /api/search?q=...&category=...&minPrice=...&maxPrice=...&sort=...&page=...&pageSize=...
 *
 * When Algolia env vars are configured (ALGOLIA_APP_ID + ALGOLIA_ADMIN_API_KEY),
 * delegates to Algolia for scalable full-text search.
 * Falls back to in-memory Sieve-based search otherwise (Phase 2 approach).
 *
 * Response meta includes `backend: "algolia" | "in-memory"` so callers can
 * detect which engine served the request.
 */

import { NextRequest, NextResponse } from "next/server";
import { productRepository } from "@/repositories";
import { ERROR_MESSAGES } from "@/constants";
import { applySieveToArray } from "@/helpers/data/sieve.helper";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { serverLogger } from "@/lib/server-logger";
import { handleApiError } from "@/lib/errors/error-handler";
import { isAlgoliaConfigured, algoliaSearch } from "@/lib/search/algolia";

export async function GET(request: NextRequest) {
  try {
    const searchParams = getSearchParams(request);
    const q = getStringParam(searchParams, "q") ?? "";
    const category = getStringParam(searchParams, "category");
    const minPrice = getNumberParam(searchParams, "minPrice", 0, { min: 0 });
    const maxPrice = getNumberParam(searchParams, "maxPrice", 0, { min: 0 });
    const sort = getStringParam(searchParams, "sort") || "-createdAt";
    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 20, {
      min: 1,
      max: 100,
    });

    // ── Algolia path ─────────────────────────────────────────────────────────
    if (isAlgoliaConfigured()) {
      const algoliaResult = await algoliaSearch({
        q,
        category,
        minPrice,
        maxPrice,
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

      return NextResponse.json(
        {
          success: true,
          data: algoliaResult.items,
          meta: {
            q,
            page: algoliaResult.page,
            limit: algoliaResult.pageSize,
            total: algoliaResult.total,
            totalPages: algoliaResult.totalPages,
            hasMore: algoliaResult.hasMore,
            backend: "algolia" as const,
          },
        },
        { status: 200 },
      );
    }

    // ── In-memory fallback path ───────────────────────────────────────────────

    // Fetch all products from repository
    const allProducts = await productRepository.findAll();

    // Step 1: filter to published products only
    let results = allProducts.filter((p) => p.status === "published");

    // Step 2: apply text search in-memory across title, description, and tags
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      results = results.filter((p) => {
        const inTitle = p.title?.toLowerCase().includes(needle) ?? false;
        const inDescription =
          p.description?.toLowerCase().includes(needle) ?? false;
        const inTags =
          (p.tags ?? []).some((tag) => tag.toLowerCase().includes(needle)) ??
          false;
        const inBrand = p.brand?.toLowerCase().includes(needle) ?? false;
        return inTitle || inDescription || inTags || inBrand;
      });
    }

    // Step 3: build Sieve filters for structured filters (category, price)
    const sieveFilterParts: string[] = [];
    if (category) {
      sieveFilterParts.push(`category==${category}`);
    }
    if (minPrice > 0) {
      sieveFilterParts.push(`price>=${minPrice}`);
    }
    if (maxPrice > 0 && maxPrice >= minPrice) {
      sieveFilterParts.push(`price<=${maxPrice}`);
    }

    const sieveFilters =
      sieveFilterParts.length > 0 ? sieveFilterParts.join(",") : undefined;

    // Step 4: apply Sieve for structured filtering, sorting, and pagination
    const sieveResult = await applySieveToArray({
      items: results,
      model: {
        filters: sieveFilters,
        sorts: sort,
        page,
        pageSize,
      },
      fields: {
        category: { canFilter: true, canSort: false },
        price: {
          canFilter: true,
          canSort: true,
          parseValue: (value: string) => Number(value),
        },
        title: { canFilter: false, canSort: true },
        createdAt: {
          canFilter: false,
          canSort: true,
          parseValue: (value: string) => new Date(value),
        },
        featured: {
          canFilter: false,
          canSort: true,
          parseValue: (value: string) => value === "true",
        },
      },
      options: {
        defaultPageSize: 20,
        maxPageSize: 100,
        throwExceptions: false,
      },
    });

    serverLogger.info("Search completed (in-memory)", {
      q: q || "(empty)",
      category: category || "(all)",
      minPrice,
      maxPrice,
      total: sieveResult.total,
      page: sieveResult.page,
    });

    return NextResponse.json(
      {
        success: true,
        data: sieveResult.items,
        meta: {
          q,
          page: sieveResult.page,
          limit: sieveResult.pageSize,
          total: sieveResult.total,
          totalPages: sieveResult.totalPages,
          hasMore: sieveResult.hasMore,
          backend: "in-memory" as const,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    serverLogger.error("Search failed", { error });
    return handleApiError(error);
  }
}
