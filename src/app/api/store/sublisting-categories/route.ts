import { withProviders } from "@/providers.config";
import { z } from "zod";
import { createRouteHandler, successResponse, ApiErrors } from "@mohasinac/appkit";
import { sublistingCategoriesRepository, storeRepository } from "@mohasinac/appkit";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  itemCode: z.string().max(40).optional(),
  description: z.string().max(500).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
});

export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: ["seller", "admin", "moderator"],
  handler: async ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get("pageSize")) || 50));
    const sorts = url.searchParams.get("sorts") ?? "name";

    const result = await sublistingCategoriesRepository.list({ sorts, page, pageSize });
    return successResponse({ items: result.items, total: result.total, page, pageSize });
  },
}));

export const POST = withProviders(createRouteHandler<(typeof createSchema)["_output"]>({
  auth: true,
  roles: ["seller", "admin"],
  schema: createSchema,
  handler: async ({ body, user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const { name, itemCode, description, coverImage } = body!;
    const category = await sublistingCategoriesRepository.create({
      name,
      itemCode: itemCode || undefined,
      description: description || undefined,
      coverImage: coverImage || undefined,
      slug: "",    // generateId sets this
      createdBy: store.id,
    });

    return successResponse({ category }, undefined, 201);
  },
}));
