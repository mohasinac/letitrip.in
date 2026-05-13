import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  categoriesRepository,
  serverLogger,
  bundleCreateSchema,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants/api-roles";

/**
 * Admin bundles API — S-SBUNI-4 2026-05-13.
 *
 * Bundles live as `categoryType:"bundle"` rows on the categories collection
 * (SB-UNI-D + V). These routes delegate to `categoriesRepository` with a
 * `categoryType:"bundle"` guard so admins can CRUD bundles without exposing
 * the generic /api/admin/categories surface.
 *
 * Zod schemas live in appkit's `bundleCreateSchema` so the POST + PUT
 * routes share one validator (S-SBUNI-4 follow-up).
 */

const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 200;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ request }) => {
      const url = new URL(request!.url);
      const activeOnlyParam = url.searchParams.get("activeOnly");
      const requested = Number(url.searchParams.get("limit") ?? DEFAULT_LIST_LIMIT);
      const limit = Number.isFinite(requested)
        ? Math.min(Math.max(1, requested), MAX_LIST_LIMIT)
        : DEFAULT_LIST_LIMIT;
      const items = await categoriesRepository.listByType("bundle", {
        activeOnly: activeOnlyParam !== "false",
        limit,
      });
      return successResponse({ items, total: items.length });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof bundleCreateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    schema: bundleCreateSchema,
    handler: async ({ body, user }) => {
      if (!body) return ApiErrors.badRequest("Body required");

      const rawSlug = slugify(body.slug ?? body.name);
      const slug = rawSlug.startsWith("bundle-") ? rawSlug : `bundle-${rawSlug}`;
      const id = slug;

      const existing = await categoriesRepository.findById(id);
      if (existing) {
        return ApiErrors.badRequest(`Bundle already exists: ${id}`);
      }

      await categoriesRepository.createWithId(id, {
        name: body.name,
        slug,
        description: body.description,
        categoryType: "bundle",
        bundlePriceInPaise: body.bundlePriceInPaise,
        bundleQueryRule: body.bundleQueryRule,
        bundleProductIds: body.bundleProductIds,
        bundleStockStatus: "in_stock",
        display: body.display,
        isActive: body.isActive ?? true,
        isSearchable: true,
        isFeatured: false,
        order: 0,
        rootId: id,
        parentIds: [],
        childrenIds: [],
        tier: 0,
        path: id,
        position: 0,
        subtreeSize: 1,
        metrics: {
          productCount: 0,
          productIds: [],
          auctionCount: 0,
          auctionIds: [],
          totalProductCount: 0,
          totalAuctionCount: 0,
          totalItemCount: 0,
          lastUpdated: new Date(),
        },
        createdBy: user?.uid ?? "admin",
      } as never);

      serverLogger.info("Admin bundle created", { id, by: user?.uid });
      const created = await categoriesRepository.findById(id);
      return successResponse(created, "Bundle created", 201);
    },
  }),
);
