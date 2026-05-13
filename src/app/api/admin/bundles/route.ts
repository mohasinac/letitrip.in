import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  categoriesRepository,
  serverLogger,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants/api-roles";

/**
 * Admin bundles API — S-SBUNI-4 2026-05-13.
 *
 * Bundles live as `categoryType:"bundle"` rows on the categories collection
 * (SB-UNI-D + V). These routes delegate to `categoriesRepository` with a
 * categoryType:"bundle" guard so admins can CRUD bundles without exposing the
 * generic /api/admin/categories surface.
 */

const bundleQueryRuleSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("static"),
    productIds: z.array(z.string().min(1)).min(0).max(64),
  }),
  z.object({
    type: z.literal("dynamic"),
    filter: z.object({
      categorySlug: z.string().optional(),
      brandSlug: z.string().optional(),
      tags: z.array(z.string()).optional(),
      listingType: z.enum(["standard", "pre-order"]).optional(),
    }),
    orderBy: z
      .enum(["price-asc", "price-desc", "createdAt-desc"])
      .optional(),
    limit: z.number().int().min(1).max(64),
  }),
]);

const createBundleSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).optional(),
  bundlePriceInPaise: z.number().int().min(100),
  bundleQueryRule: bundleQueryRuleSchema,
  bundleProductIds: z.array(z.string().min(1)).min(0).max(64),
  display: z
    .object({
      coverImage: z.string().url().optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
    })
    .optional(),
  isActive: z.boolean().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ request }) => {
      const url = new URL(request!.url);
      const activeOnlyParam = url.searchParams.get("activeOnly");
      const limit = Number(url.searchParams.get("limit") ?? "50");
      const items = await categoriesRepository.listByType("bundle", {
        activeOnly: activeOnlyParam !== "false",
        limit: Number.isFinite(limit) ? Math.min(limit, 200) : 50,
      });
      return successResponse({ items, total: items.length });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof createBundleSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    schema: createBundleSchema,
    handler: async ({ body, user }) => {
      if (!body) return ApiErrors.badRequest("Body required");

      const slug = (body.slug ?? body.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const id = slug.startsWith("bundle-") ? slug : `bundle-${slug}`;

      const existing = await categoriesRepository.findById(id);
      if (existing) {
        return ApiErrors.badRequest(`Bundle already exists: ${id}`);
      }

      await categoriesRepository.createWithId(id, {
        name: body.name,
        slug: slug.startsWith("bundle-") ? slug : `bundle-${slug}`,
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
