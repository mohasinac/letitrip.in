import { withProviders } from "@/providers.config";
import { z } from "zod";
import { mediaUrlSchema } from "@/validation/request-schemas";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { categoriesRepository } from "@mohasinac/appkit/features/categories/repository/categories.repository";
import { CATEGORY_FIELDS } from "@mohasinac/appkit/features/categories/schemas/firestore";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse, ApiErrors } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { sieveFilter, SIEVE_OP } from "@mohasinac/appkit/utils/sieve-builder";
import { ROLES_STORE_READ, ROLES_STORE_WRITE } from "@/constants";

const DEFAULT_SORTS = sortBy(CATEGORY_FIELDS.NAME, "ASC");

const createSchema = z.object({
  name: z.string().min(1).max(120),
  itemCode: z.string().max(40).optional(),
  description: z.string().max(500).optional(),
  coverImage: mediaUrlSchema.optional().or(z.literal("")),
});

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_STORE_READ],
  handler: async ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 50));
    const sorts = url.searchParams.get("sorts") ?? DEFAULT_SORTS;
    /*
     * 🛑 This filtered the PAGE, not the collection.
     *
     * It read one page of 50 and then ran `.includes(q)` over those 50 rows,
     * setting `total = items.length` afterwards. So a sublisting whose name
     * matched but which sorted onto page 2 was unreachable by search, and the
     * total then asserted that the filtered page WAS the whole result set —
     * a pager that confidently reports one page of results for a collection it
     * never looked at. Searching for an `itemCode` that existed returned
     * nothing, with a 200 and an empty state.
     *
     * The pushdown runs the clause inside the query, so paging and `total`
     * describe the matched set. `itemCode` is in `buildCategorySearchTxt`'s
     * source list, so the code lookup this was reaching for still works —
     * case-insensitively now, which `.includes` on a lowercased haystack only
     * managed because it lowercased the needle too.
     */
    const q = (url.searchParams.get("q") || "").trim();

    const result = await categoriesRepository.list(
      {
        filters: sieveFilter("categoryType", SIEVE_OP.EQ, "sublisting"),
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      },
      q ? { search: q } : undefined,
    );
    return successResponse({
      items: result.items,
      total: result.total,
      page,
      pageSize,
    });
  },
}));

export const POST = withProviders(createRouteHandler<(typeof createSchema)["_output"]>({
  auth: true,
  roles: [...ROLES_STORE_WRITE],
  schema: createSchema,
  handler: async ({ body, user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const { name, itemCode, description, coverImage } = body!;
    const id = categoriesRepository.generateSublistingId(name);
    const category = await categoriesRepository.createWithHierarchy({
      name,
      slug: id,
      categoryType: "sublisting",
      itemCode: itemCode || undefined,
      description: description || undefined,
      display: coverImage
        ? { coverImage, showInMenu: false, showInFooter: false }
        : { showInMenu: false, showInFooter: false },
      parentId: null,
      parentIds: [],
      rootId: id,
      childrenIds: [],
      tier: 1,
      path: id,
      position: 0,
      subtreeSize: 1,
      order: 0,
      isFeatured: false,
      isActive: true,
      isSearchable: true,
      createdBy: store.id,
      seo: { title: name, description: description ?? "", keywords: [] },
    } as Parameters<typeof categoriesRepository.createWithHierarchy>[0]);

    return successResponse({ category }, undefined, 201);
  },
}));
