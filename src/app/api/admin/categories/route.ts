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
 * 🛑 100 is not a preference, it is the real ceiling: `SIEVE_DEFAULTS.maxPageSize`
 * is 100 and `sieveQuery` clamps to it, so asking for more returns 100 anyway and
 * the constant would simply be a number that never happens. Measured today the
 * taxonomy is ~58 seeded rows (47 listing categories + 2 sublisting + 4 brand +
 * 5 bundle) plus whatever has been created since, so one scan still covers all of
 * it — but that headroom is thin. If the taxonomy passes 100 rows this search
 * silently stops seeing the tail, and the fix then is a real push-down (a prefix
 * range on `name`, or a search-token array), NOT a bigger number here.
 */
const CATEGORY_SEARCH_SCAN_LIMIT = 100;

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
        const scan = await categoriesRepository.list({
          filters,
          sorts,
          page: "1",
          pageSize: String(CATEGORY_SEARCH_SCAN_LIMIT),
        });
        const needle = q.toLowerCase();
        const matched = scan.items.filter((c) => {
          const name = typeof c.name === "string" ? c.name.toLowerCase() : "";
          const slug = typeof c.slug === "string" ? c.slug.toLowerCase() : "";
          return name.includes(needle) || slug.includes(needle);
        });
        const start = (page - 1) * pageSize;
        const pageItems = matched.slice(start, start + pageSize);
        /*
         * `truncated` is not optional (CLAUDE.md, Availability & Order-Scope Tabs).
         * If the scan SATURATED then rows beyond it were never examined, so
         * `matched.length` is a FLOOR and not a total — say so rather than
         * asserting a count that quietly depends on the taxonomy having stayed
         * under the scan limit. `hasMore` stays true in that case so a caller
         * paging through is never told it has reached a last page it has not.
         */
        const truncated = scan.items.length >= CATEGORY_SEARCH_SCAN_LIMIT;
        const exhausted = start + pageItems.length >= matched.length;
        return successResponse({
          data: pageItems,
          total: matched.length,
          truncated,
          page,
          pageSize,
          totalPages: truncated
            ? page + 1
            : Math.max(1, Math.ceil(matched.length / pageSize)),
          hasMore: truncated ? true : !exhausted,
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
