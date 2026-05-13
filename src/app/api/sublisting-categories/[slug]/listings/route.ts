import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  categoriesRepository,
} from "@mohasinac/appkit";

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
