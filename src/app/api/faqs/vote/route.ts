import { withProviders } from "@/providers.config";
import {
  voteFaq,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";
import { z } from "zod";

const voteSchema = z.object({
  faqId: z.string().min(1),
  vote: z.enum(["helpful", "not-helpful"]),
});

export const POST = withProviders(
  createRouteHandler({
    schema: voteSchema,
    handler: async ({ body }) => {
      const result = await voteFaq(body!);
      return successResponse({
        helpfulCount: result.helpful,
        notHelpfulCount: result.notHelpful,
      });
    },
  }),
);
