import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  categoriesRepository,
  serverLogger,
  bundleCreateSchema,
} from "@mohasinac/appkit";
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
const MAX_PAGE_SIZE = 100;

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
    permission: "admin:categories:read",
    handler: async ({ request }) => {
      const url = new URL(request!.url);

      const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
      const pageSize = Math.min(
        MAX_PAGE_SIZE,
        Math.max(1, parseInt(url.searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10)),
      );
      const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
      const sorts = url.searchParams.get("sorts") ?? "name";
      const filters = url.searchParams.get("filters") ?? "";

      // Bundles are low cardinality — load all and process in memory
      let items = await categoriesRepository.listByType("bundle", {
        activeOnly: false,
        limit: MAX_LIST_LIMIT,
      });

      if (q) {
        items = items.filter(
          (b) =>
            b.name?.toLowerCase().includes(q) ||
            b.slug?.toLowerCase().includes(q),
        );
      }

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
        if (sortKey === "bundlePriceInPaise" || sortKey === "price") {
          va = a.bundlePriceInPaise ?? 0;
          vb = b.bundlePriceInPaise ?? 0;
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

export const POST = withProviders(
  createRouteHandler<(typeof bundleCreateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:categories:write",
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
