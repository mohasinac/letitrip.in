import { withProviders } from "@/providers.config";
import { z } from "zod";
import { mediaUrlSchema } from "@/validation/request-schemas";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  categoriesRepository,
  storeRepository,
  sortBy,
  CATEGORY_FIELDS,
  sieveFilter,
  SIEVE_OP,
} from "@mohasinac/appkit";
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
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();

    const result = await categoriesRepository.list({
      filters: sieveFilter("categoryType", SIEVE_OP.EQ, "sublisting"),
      sorts,
      page: String(page),
      pageSize: String(pageSize),
    });
    let items = result.items;
    let total = result.total;
    if (q) {
      items = items.filter((c) =>
        (c.name ?? "").toLowerCase().includes(q) || (c.itemCode ?? "").toLowerCase().includes(q),
      );
      total = items.length;
    }
    return successResponse({ items, total, page, pageSize });
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
