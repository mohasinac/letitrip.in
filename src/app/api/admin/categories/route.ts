import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  categoriesRepository,
  sortBy,
  CATEGORY_FIELDS,
  COMMON_FIELDS,
} from "@mohasinac/appkit";
import { ROLES_ANY_STAFF, ROLES_STORE_WRITE } from "@/constants";

const DEFAULT_SORTS = [sortBy(COMMON_FIELDS.ORDER, "ASC"), sortBy(CATEGORY_FIELDS.NAME, "ASC")].join(",");

/*
 * The one bounded read a `q=` search scans before filtering in memory.
 *
 * 🛑 OBSOLETE as of 2026-10-10 — the push-down this comment asked for exists.
 *
 * It used to read: "100 is not a preference, it is the real ceiling —
 * `SIEVE_DEFAULTS.maxPageSize` is 100 and `sieveQuery` clamps to it … If the
 * taxonomy passes 100 rows this search silently stops seeing the tail, and the
 * fix then is a real push-down (a prefix range on `name`, or a search-token
 * array), NOT a bigger number here."
 *
 * `CategoryDocument.searchTxt` is that search-token array. The handler now
 * delegates to `categoriesRepository.list(model, { search })`, which pushes the
 * term down as an `array-contains` on `CATEGORY_FIELDS.SEARCH_TXT`, so there is
 * no scan to bound and the constant has no callers. Kept only as the record of
 * why the ceiling existed; delete it once nothing cites it.
 */

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().default(true),
  display: z
    .object({
      showInMenu: z.boolean().optional(),
      showInFooter: z.boolean().optional(),
    })
    .optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    // Sellers browse the same taxonomy admins do when picking/creating a
    // category inline on the product form — ROLES_ANY_STAFF = admin+mod+seller.
    // No `permission` gate: getServerPermissions() only resolves fine-grained
    // permissions for role "employee", so keeping it here would 403 every
    // moderator/seller regardless of roles[] (neither is "admin" or "employee").
    roles: [...ROLES_ANY_STAFF],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(
        50,
        Math.max(1, Number(url.searchParams.get("pageSize")) || 50),
      );
      const sorts = url.searchParams.get("sorts") || DEFAULT_SORTS;
      const filters = url.searchParams.get("filters") ?? undefined;
      const q = (url.searchParams.get("q") ?? "").trim();

      /*
       * 🛑 `q` IS READ. It was not, and `CategoryInlineSelect` has always sent it.
       *
       * `loadAdminCategoryOptions` builds `?q=<query>&page=…&pageSize=20&flat=true`,
       * and this handler read only page / pageSize / sorts / filters — so the
       * search box in every inline category picker returned the SAME unfiltered
       * first page for every term. Measured in the seller listing editor: typing
       * "Plastic" and then the control term "zzzznope" both returned the identical
       * alphabetical list, and "Plastic Generation" — a real category that renders
       * fine at /categories/category-original-plastic-gen — was unreachable except
       * by pressing Load more until it happened to appear. Root Cause #62's shape:
       * a parameter the client emits and the route never reads, failing silently.
       *
       * Filtered IN MEMORY over a bounded scan rather than pushed into the query,
       * because Firestore has no substring operator — a `name` equality would only
       * match someone typing a category's full name, which is not what a search box
       * is for. The bound is what makes it safe under Rule #6: this taxonomy is a
       * 47-node forest plus a handful of brand/bundle rows, so one capped read
       * covers all of it and there is no unbounded scan here to grow into one.
       */
      if (q) {
        /*
         * 🛑 NOW A REAL PUSH-DOWN — this block used to scan 100 rows and filter
         * `name.includes()` in memory, and the comment above
         * CATEGORY_SEARCH_SCAN_LIMIT asked for exactly this replacement: "the
         * fix then is a real push-down (a prefix range on `name`, or a
         * search-token array), NOT a bigger number here."
         *
         * `categoriesRepository.list(model, { search })` pushes the longest
         * term down as an `array-contains` on `CATEGORY_FIELDS.SEARCH_TXT` and
         * AND-refines the rest in memory. Three things change:
         *
         *   1. The 100-row ceiling is GONE. The old scan silently stopped
         *      seeing the tail past 100 rows, and the taxonomy is heading to
         *      ~330 — so this was a latent "the category exists but search
         *      cannot find it" bug with a known arrival date.
         *   2. Prefix + token matching replaces mid-word substring. "pla"
         *      finds "Plastic"; accents fold ("pokemon" finds "Pokémon").
         *      🛑 The honest trade: "eneration" NO LONGER matches "Plastic
         *      Generation", because `searchTxt` indexes word prefixes, not
         *      arbitrary infixes. Prefix is what a search box is expected to
         *      do, and it is what every other searchable collection here does.
         *   3. Lineage search works — `buildCategorySearchTxt` indexes
         *      `ancestors[].name`, so "burst" reaches a tier-4 model filed
         *      under Beyblade Burst without naming it.
         *
         * `truncated` is still emitted, and still for a real reason: a
         * MULTI-term query is AND-refined after the page was cut, so `total`
         * is this page's count rather than a global one (`refineSearchTxt`
         * documents that debt). A single-term query paginates exactly.
         */
        const result = await categoriesRepository.list(
          { filters, sorts, page: String(page), pageSize: String(pageSize) },
          { search: q },
        );
        const multiTerm = q.split(/\s+/).filter(Boolean).length > 1;
        return successResponse({
          data: result.items,
          total: result.total,
          truncated: multiTerm && result.items.length >= pageSize,
          page,
          pageSize,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
        });
      }

      const result = await categoriesRepository.list({
        filters,
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      });
      return successResponse({
        data: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof createCategorySchema)["_output"]>({
    auth: true,
    // Sellers can create categories inline from the product form — same
    // reasoning as GET above (ROLES_STORE_WRITE = seller+admin).
    roles: [...ROLES_STORE_WRITE],
    schema: createCategorySchema,
    handler: async ({ body, user }) => {
      const slug = body!.slug || slugify(body!.name);
      const existing = await categoriesRepository.getCategoryBySlug(slug);
      if (existing) {
        return errorResponse("A category with this slug already exists", 409);
      }

      const parentIds = body!.parentId ? [body!.parentId] : [];
      const category = await categoriesRepository.createWithHierarchy({
        name: body!.name,
        slug,
        description: body!.description,
        parentId: body!.parentId ?? null,
        parentIds,
        order: body!.order ?? 0,
        isActive: body!.isActive ?? true,
        display: {
          showInMenu: body!.display?.showInMenu ?? true,
          showInFooter: body!.display?.showInFooter ?? false,
        },
        isFeatured: false,
        isBrand: false,
        isSearchable: true,
        seo: { title: "", description: "", keywords: [] },
        createdBy: user!.uid,
        // Required structural fields — set by createWithHierarchy
        rootId: "",
        tier: 0,
        path: "",
        position: 0,
        subtreeSize: 1,
        ancestors: [],
      } as any);

      return successResponse(category, "Category created");
    },
  }),
);
