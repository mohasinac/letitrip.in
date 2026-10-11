import { withProviders } from "@/providers.config";
import { categoriesRepository } from "@mohasinac/appkit/features/categories/repository/categories.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";

export const GET = withProviders(
  createRouteHandler({
    auth: false,
    handler: async ({ params }) => {
      const slug = (params as { slug: string }).slug;
      const category = await categoriesRepository.findBySlugAndType(slug, "sublisting");
      if (!category) return errorResponse("Sub-listing category not found", 404);

      const listings = await categoriesRepository.getSublistingListings(category.id, 20);

      return successResponse({ category, listings });
    },
  }),
);