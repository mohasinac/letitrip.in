import { withProviders } from "@/providers.config";
import { categoriesRepository } from "@mohasinac/appkit/features/categories/repository/categories.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";

export const GET = withProviders(
  createRouteHandler({
    auth: false,
    handler: async ({ request, params }) => {
      const slug = (params as { slug: string }).slug;
      const url = new URL(request.url);
      const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 20));

      const category = await categoriesRepository.findBySlugAndType(slug, "sublisting");
      if (!category) return errorResponse("Sub-listing category not found", 404);

      const listings = await categoriesRepository.getSublistingListings(category.id, limit);

      return successResponse({ listings, total: listings.length });
    },
  }),
);