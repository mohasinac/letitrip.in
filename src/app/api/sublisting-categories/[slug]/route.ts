import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  sublistingCategoriesRepository,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: false,
    handler: async ({ params }) => {
      const slug = (params as { slug: string }).slug;
      const category = await sublistingCategoriesRepository.findBySlug(slug);
      if (!category) return errorResponse("Sub-listing category not found", 404);

      const listings = await sublistingCategoriesRepository.getListingsByCategoryId(
        category.id,
        20,
      );

      return successResponse({ category, listings });
    },
  }),
);
