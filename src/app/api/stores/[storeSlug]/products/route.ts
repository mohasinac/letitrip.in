import "@/providers.config";
/**
 * GET /api/stores/[storeSlug]/products
 *
 * Local override of @mohasinac/feat-stores storeProductsGET.
 * The package handler requires status==active,isPublic==true on the store
 * lookup which rejects stores that are pending admin approval.
 * This handler looks up the store by slug directly (doc ID = storeSlug)
 * and returns its published non-auction products regardless of store status.
 */

import { NextResponse } from "next/server";
import { handleApiError } from "@mohasinac/appkit/errors";
import { storeRepository, productRepository } from "@/repositories";

type RouteContext = { params: Promise<{ storeSlug: string }> };

function numParam(url: URL, key: string, fallback: number): number {
  const v = url.searchParams.get(key);
  const n = v !== null ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  try {
    const { storeSlug } = await context.params;
    const url = new URL(request.url);

    // Direct doc-ID lookup — no status/isPublic filter applied.
    const store = await storeRepository.findBySlug(storeSlug);
    if (!store) {
      return NextResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 },
      );
    }

    const sort = url.searchParams.get("sorts") ?? "-createdAt";
    const page = numParam(url, "page", 1);
    const pageSize = numParam(url, "pageSize", 24);

    // Base filter: published, non-auction products owned by this seller.
    let filters = `isAuction==false`;
    const extra = url.searchParams.get("filters");
    if (extra) filters += `,${extra}`;

    const result = await productRepository.list(
      { filters, sorts: sort, page, pageSize },
      { sellerId: store.ownerId, status: "published" },
    );

    return NextResponse.json({
      success: true,
      data: {
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
