import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  categoriesRepository,
} from "@mohasinac/appkit";

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
    roles: ["admin", "moderator"],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(
        200,
        Math.max(1, Number(url.searchParams.get("pageSize")) || 50),
      );
      const sorts = url.searchParams.get("sorts") || "order,name";
      const filters = url.searchParams.get("filters") ?? undefined;

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
    roles: ["admin"],
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
