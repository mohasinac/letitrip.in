import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  reportsRepository,
} from "@mohasinac/appkit";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["user", "seller", "moderator", "admin"],
    handler: async ({ request, user }) => {
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      try {
        const doc = await reportsRepository.create({
          ...body,
          reporterId: user!.uid,
          reporterEmail: user!.email,
          status: "pending",
        });
        return successResponse(doc, "Report submitted", 201);
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Submit failed", 400);
      }
    },
  }),
);
