import { withProviders } from "@/providers.config";
import { listingProcessorFirstExecutor } from "@/lib/listing-processor";
import type { JsonValue } from "@mohasinac/appkit";
import { toApiIssues } from "@mohasinac/appkit";
/**
 * Admin Products API Route
 * GET  /api/admin/products â€” Delegated to @mohasinac/feat-admin
 * POST /api/admin/products â€” Create a new product (admin, local)
 */


import { createApiHandler } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { productRepository } from "@mohasinac/appkit";
import {
  listPublicProducts,
  parsePublicProductParams,
  ANY_STATUS,
} from "@mohasinac/appkit/server";
import { serverLogger } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import {
  finalizeStagedMediaUrl,
  finalizeStagedMediaField,
  finalizeStagedMediaArray,
} from "@mohasinac/appkit";
import {
  validateRequestBody,
  formatZodErrors,
  productCreateSchema,
} from "@/validation/request-schemas";
import { ROLES_ADMIN_MOD } from "@/constants";
import { sortBy, PRODUCT_FIELDS } from "@mohasinac/appkit";

const DEFAULT_SORT = sortBy(PRODUCT_FIELDS.CREATED_AT, "DESC");

/**
 * GET /api/admin/products
 */
export const GET = withProviders(createApiHandler({
  roles: [...ROLES_ADMIN_MOD],
  permission: "admin:products:read",
  handler: async ({ request, user }) => {
    const url = new URL(request.url);

    // Same listing query as every public surface — see the seller route for
    // the reasoning. `ANY_STATUS` is what makes this legitimate here: an admin
    // list exists to surface drafts and in-review rows.
    const result = await listPublicProducts({
      ...parsePublicProductParams(url.searchParams, {
        pageSize: Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 50)),
        sorts: url.searchParams.get("sorts") ?? url.searchParams.get("sort") ?? DEFAULT_SORT,
      }),
      status: ANY_STATUS,
      rawFilters: url.searchParams.get("filters") || null,
    }, {
      // An admin sees everything, tester fixtures included — that is what the
      // dashboard is for, and `ANY_STATUS` above already says so for drafts.
      viewer: user,
      // Was calling listPublicProducts with no options at all, so it fell
      // through to the in-Vercel default executor — an ANY_STATUS query, one of
      // the two heaviest endpoints in the app, running against the 10s ceiling
      // while /api/products delegated the identical query to the Function.
      executor: listingProcessorFirstExecutor,
    });

    if (!result) {
      return errorResponse("Product search is temporarily unavailable.", 500);
    }

    return successResponse({
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
      truncated: result.truncated,
    });
  },
}));

/**
 * POST /api/admin/products
 *
 * Create a new product as admin (can set any status, sellerId etc.)
 */
export const POST = withProviders(createApiHandler({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
  permission: "admin:products:write",
    handler: async ({ request }) => {
    const body = await request.json();
    const validation = validateRequestBody(productCreateSchema, body);

    if (!validation.success) {
      return errorResponse(
        ERROR_MESSAGES.VALIDATION.FAILED,
        400,
        { issues: toApiIssues(validation.errors.issues) },
      );
    }

    const data = validation.data as Record<string, JsonValue> & {
      mainImage?: string;
      images?: string[];
      video?: { url?: string; thumbnailUrl?: string };
    };
    if (typeof data.mainImage === "string" && data.mainImage) {
      data.mainImage = await finalizeStagedMediaUrl(data.mainImage);
    }
    if (Array.isArray(data.images) && data.images.length > 0) {
      data.images = await finalizeStagedMediaArray(data.images);
    }
    if (data.video?.url) {
      data.video = {
        ...data.video,
        url: await finalizeStagedMediaUrl(data.video.url),
        thumbnailUrl: await finalizeStagedMediaField(data.video.thumbnailUrl),
      };
    }

    const product = await productRepository.create({
      ...data,
      storeId: body.storeId,
      storeName: body.storeName || "Admin",
    } as any);

    serverLogger.info("Admin created product", { productId: product.id });

    return successResponse(product, SUCCESS_MESSAGES.PRODUCT.CREATED, 201);
  },
}));
