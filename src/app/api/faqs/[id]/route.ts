import { withProviders } from "@/providers.config";
import { faqsRepository } from "@mohasinac/appkit/features/faq/repository/faqs.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";

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