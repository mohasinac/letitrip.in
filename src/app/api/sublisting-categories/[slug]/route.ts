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
    handler: async ({ params }) => {
      const slug = (params as { slug: string }).slug;
      const category = await categoriesRepository.findBySlugAndType(slug, "sublisting");
      if (!category) return errorResponse("Sub-listing category not found", 404);

      const listings = await categoriesRepository.getSublistingListings(category.id, 20);

      return successResponse({ category, listings });
    },
  }),
);
