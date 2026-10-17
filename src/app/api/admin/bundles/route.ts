import { withProviders } from "@/providers.config";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { categoriesRepository } from "@mohasinac/appkit/features/categories/repository/categories.repository";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { successResponse, ApiErrors } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { bundleCreateSchema } from "@mohasinac/appkit";
import { resolveBundleOriginalTotal, findBundleMemberStores } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_MOD } from "@/constants";

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

const MAX_LIST_LIMIT = 200;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 50;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ request }) => {
      const url = new URL(request!.url);

      const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
      const pageSize = Math.min(
        MAX_PAGE_SIZE,
        Math.max(1, parseInt(url.searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10)),
      );
      /*
       * NOT lowercased: `planSearchTxt` owns normalisation. Pre-folding the
       * needle here is how two half-implementations of one rule drift apart,
       * and the repository's plan already case-folds, strips punctuation and
       * drops a query that normalises to no usable token.
       */
      const q = url.searchParams.get("q")?.trim() ?? "";
      const sorts = url.searchParams.get("sorts") ?? sortBy("name", "ASC");
      const filters = url.searchParams.get("filters") ?? "";

      /*
        * Bundles are low cardinality, so the non-search filters below still
        * refine in memory — but the SEARCH is a query clause now.
        *
        * `.includes()` over the whole collection was substring-only, so it
        * could not reach an alias or a generated misspelling variant, which is
        * most of what `buildCategorySearchTxt` indexes ("dragon g" finds
        * "Dragoon G"; no substring test can). It also read every bundle row on
        * every search. A bundle is a `categories` row and carries the same
        * `searchTxt` as every other row in that collection.
        */
      let items = await categoriesRepository.listByType("bundle", {
        activeOnly: false,
        limit: MAX_LIST_LIMIT,
        search: q || undefined,
      });

      if (filters.includes("isActive==true")) {
        items = items.filter((b) => b.isActive === true);
      } else if (filters.includes("isActive==false")) {
        items = items.filter((b) => b.isActive === false);
      }
      if (filters.includes("bundleStockStatus==out_of_stock")) {
        items = items.filter((b) => b.bundleStockStatus === "out_of_stock");
      }

      const sortDesc = sorts.startsWith("-");
      const sortKey = sortDesc ? sorts.slice(1) : sorts;
      items = [...items].sort((a, b) => {
        let va: string | number, vb: string | number;
        if (sortKey === "bundlePrice" || sortKey === "price") {
          va = a.bundlePrice ?? 0;
          vb = b.bundlePrice ?? 0;
        } else if (sortKey === "createdAt") {
          va = String(a.createdAt ?? "");
          vb = String(b.createdAt ?? "");
        } else {
          va = a.name ?? "";
          vb = b.name ?? "";
        }
        const cmp =
          typeof va === "number" && typeof vb === "number"
            ? va - vb
            : String(va).localeCompare(String(vb), "en-IN");
        return sortDesc ? -cmp : cmp;
      });

      const total = items.length;
      const start = (page - 1) * pageSize;
      return successResponse({ items: items.slice(start, start + pageSize), total });
    },
  }),
);

const __POST__g = withProviders(
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

      // A bundle's members must all belong to ONE seller — see
      // findBundleMemberStores for why (storeId is a scalar on the cart line
      // and is the order-splitting/payout key). Grouped lines refuse this at
      // the picker and again at add-to-cart; bundles had no equivalent guard.
      const memberStores = await findBundleMemberStores(body.bundleProductIds);
      if (memberStores.length > 1) {
        return ApiErrors.badRequest(
          `A bundle's items must all come from one seller — these span ${memberStores.length} (${memberStores.join(", ")}).`,
        );
      }

      const bundleOriginalTotal = await resolveBundleOriginalTotal(body.bundleProductIds);

      await categoriesRepository.createWithId(id, {
        name: body.name,
        slug,
        description: body.description,
        categoryType: "bundle",
        bundleKind: body.bundleKind,
        bundlePrice: body.bundlePrice,
        bundleQueryRule: body.bundleQueryRule,
        bundleProductIds: body.bundleProductIds,
        bundleOriginalTotal,
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

export const GET = __GET__g;
export const POST = __POST__g;
