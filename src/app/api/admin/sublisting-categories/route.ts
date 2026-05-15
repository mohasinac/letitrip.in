import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  categoriesRepository,
  sortBy,
  CATEGORY_FIELDS,
} from "@mohasinac/appkit";

const DEFAULT_SORTS = sortBy(CATEGORY_FIELDS.NAME, "ASC");

const createSchema = z.object({
  name: z.string().min(1).max(120),
  itemCode: z.string().max(40).optional(),
  description: z.string().max(2000).optional(),
  coverImage: z.string().optional(),
  parentId: z.string().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator", "seller"],
    permission: "admin:categories:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get("pageSize")) || 50));
      const sorts = url.searchParams.get("sorts") || DEFAULT_SORTS;
      const filters = url.searchParams.get("filters") ?? undefined;

      // Constrain to sublisting rows.
      const filterStr = filters
        ? `${filters},categoryType==sublisting`
        : "categoryType==sublisting";

      const result = await categoriesRepository.list({
        filters: filterStr,
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      });
      return successResponse({
        items: result.items,
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
  createRouteHandler<(typeof createSchema)["_output"]>({
    auth: true,
    roles: ["admin"],
    permission: "admin:categories:write",
    schema: createSchema,
    handler: async ({ body, user }) => {
      const id = categoriesRepository.generateSublistingId(body!.name);
      const existing = await categoriesRepository.findBySlugAndType(id, "sublisting");
      if (existing) return errorResponse("A sub-listing category with this name already exists", 409);

      const doc = await categoriesRepository.createWithHierarchy({
        name: body!.name,
        slug: id,
        categoryType: "sublisting",
        itemCode: body!.itemCode,
        description: body!.description,
        display: body!.coverImage
          ? { coverImage: body!.coverImage, showInMenu: false, showInFooter: false }
          : { showInMenu: false, showInFooter: false },
        parentId: body!.parentId ?? null,
        parentIds: body!.parentId ? [body!.parentId] : [],
        rootId: body!.parentId ?? id,
        childrenIds: [],
        tier: 1,
        path: id,
        position: 0,
        subtreeSize: 1,
        order: 0,
        isFeatured: false,
        isActive: true,
        isSearchable: true,
        createdBy: user!.uid,
        seo: { title: body!.name, description: body!.description ?? "", keywords: [] },
      } as Parameters<typeof categoriesRepository.createWithHierarchy>[0]);
      return successResponse(doc, "Sub-listing category created");
    },
  }),
);
