import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  categoriesRepository,
  createBrandAction,
} from "@mohasinac/appkit";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const createBrandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  logoURL: z.string().optional(),
  bannerURL: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  country: z.string().optional(),
  founded: z.number().int().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    permission: "admin:brands:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get("pageSize")) || 50));
      const sorts = url.searchParams.get("sorts") || "order,name";
      const filters = url.searchParams.get("filters");
      const combinedFilters = filters
        ? `${filters},categoryType==brand`
        : "categoryType==brand";

      const result = await categoriesRepository.list({
        filters: combinedFilters,
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
  createRouteHandler<(typeof createBrandSchema)["_output"]>({
    auth: true,
    roles: ["admin"],
    permission: "admin:brands:write",
    schema: createBrandSchema,
    handler: async ({ body }) => {
      const slug = body!.slug || `brand-${slugify(body!.name)}`;
      const existing = await categoriesRepository.findBySlugAndType(slug, "brand");
      if (existing) return errorResponse("A brand with this slug already exists", 409);
      const brand = await createBrandAction({ ...body!, slug });
      return successResponse(brand, "Brand created");
    },
  }),
);
