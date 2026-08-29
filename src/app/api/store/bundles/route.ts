import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  categoriesRepository,
  storeRepository,
  serverLogger,
  bundleCreateSchema,
  sortBy,
} from "@mohasinac/appkit";
import { resolveBundleOriginalTotal, findBundleMemberStores } from "@mohasinac/appkit/server";
import { ROLES_STORE_WRITE } from "@/constants";

/**
 * Seller bundles API — mirrors /api/admin/bundles but scoped to the caller's
 * own store via `createdByStoreId`. Bundles live as `categoryType:"bundle"`
 * rows on the categories collection (SB-UNI-D + V); this route delegates to
 * `categoriesRepository` with the same `bundleCreateSchema`/`bundleUpdateSchema`
 * validators the admin route uses.
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
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ request, user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");

      const url = new URL(request!.url);
      const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
      const pageSize = Math.min(
        MAX_PAGE_SIZE,
        Math.max(1, parseInt(url.searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10)),
      );
      const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
      const sorts = url.searchParams.get("sorts") ?? sortBy("name", "ASC");
      // SellerBundlesView renders Active/Inactive and Sold-out chips and emits
      // them in `filters`; this handler ignored the param entirely, so all three
      // chips were inert. The admin sibling already refines in memory the same
      // way (src/app/api/admin/bundles/route.ts) — keep the pair symmetric.
      const filters = url.searchParams.get("filters") ?? "";

      let items = (
        await categoriesRepository.listByType("bundle", {
          activeOnly: false,
          limit: MAX_LIST_LIMIT,
        })
      ).filter((b) => b.createdByStoreId === store.id);

      if (filters.includes("isActive==true")) {
        items = items.filter((b) => b.isActive === true);
      } else if (filters.includes("isActive==false")) {
        items = items.filter((b) => b.isActive === false);
      }
      if (filters.includes("bundleStockStatus==out_of_stock")) {
        items = items.filter((b) => b.bundleStockStatus === "out_of_stock");
      }

      if (q) {
        items = items.filter(
          (b) =>
            b.name?.toLowerCase().includes(q) ||
            b.slug?.toLowerCase().includes(q),
        );
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
    roles: [...ROLES_STORE_WRITE],
    schema: bundleCreateSchema,
    handler: async ({ body, user }) => {
      if (!body) return ApiErrors.badRequest("Body required");
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");

      const rawSlug = slugify(body.slug ?? body.name);
      const slug = rawSlug.startsWith("bundle-") ? rawSlug : `bundle-${rawSlug}`;
      const id = slug;

      const existing = await categoriesRepository.findById(id);
      if (existing) {
        return ApiErrors.badRequest(`Bundle already exists: ${id}`);
      }

      // Single-seller rule — see findBundleMemberStores. A seller can only
      // bundle their own stock anyway, but the check is explicit so the rule
      // lives in one place rather than being implied by ownership.
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
        createdBy: user?.uid ?? "store",
        createdByType: "store",
        createdByStoreId: store.id,
        createdByStoreName: store.storeName,
      } as never);

      serverLogger.info("Seller bundle created", { id, storeId: store.id, by: user?.uid });
      const created = await categoriesRepository.findById(id);
      return successResponse(created, "Bundle created", 201);
    },
  }),
);

export const GET = __GET__g;
export const POST = __POST__g;
