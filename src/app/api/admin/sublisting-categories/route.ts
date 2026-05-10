import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  sublistingCategoriesRepository,
} from "@mohasinac/appkit";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  itemCode: z.string().max(40).optional(),
  description: z.string().max(2000).optional(),
  coverImage: z.string().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator", "seller"],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get("pageSize")) || 50));
      const sorts = url.searchParams.get("sorts") || "name";
      const filters = url.searchParams.get("filters") ?? undefined;

      const result = await sublistingCategoriesRepository.list({
        filters,
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
    schema: createSchema,
    handler: async ({ body, user }) => {
      const existing = await sublistingCategoriesRepository.findBySlug(
        sublistingCategoriesRepository.generateId(body!.name),
      );
      if (existing) return errorResponse("A sub-listing category with this name already exists", 409);
      const slug = sublistingCategoriesRepository.generateId(body!.name);
      const doc = await sublistingCategoriesRepository.create({
        ...body!,
        slug,
        createdBy: user!.uid,
      });
      return successResponse(doc, "Sub-listing category created");
    },
  }),
);
