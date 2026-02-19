/**
 * Search API Route
 *
 * GET /api/search?q=...&category=...&minPrice=...&maxPrice=...&sort=...&page=...&pageSize=...
 *
 * Performs in-memory full-text search across published products.
 * Phase 2 approach: fetch all published products, apply text + filter matching in-memory.
 * Phase 3: Replace with Algolia / Typesense for scalable full-text search.
 */

import { NextRequest, NextResponse } from "next/server";
import { productRepository } from "@/repositories";
import { ERROR_MESSAGES } from "@/constants";
import { applySieveToArray } from "@/helpers";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { serverLogger } from "@/lib/server-logger";
import { handleApiError } from "@/lib/errors/error-handler";

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

    serverLogger.info("Search completed", {
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
        },
      },
      { status: 200 },
    );
  } catch (error) {
    serverLogger.error("Search failed", { error });
    return handleApiError(error);
  }
}
