import { withProviders } from "@/providers.config";
import {
  faqsRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const faq = await faqsRepository.findById(id);
      if (!faq) return errorResponse("FAQ not found", 404);
      return successResponse(faq);
    },
  }),
);
