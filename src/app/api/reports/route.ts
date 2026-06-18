import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  errorResponse,
  parseJsonBody,
  type JsonValue,
  reportsRepository,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_AUTHENTICATED } from "@/constants";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    handler: async ({ request, user }) => {
      const body = await parseJsonBody<Record<string, JsonValue>>(request);
      try {
        const doc = await reportsRepository.create({
          ...body,
          reporterId: user!.uid,
          reporterEmail: user!.email,
          status: "pending",
        });
        return successResponse(doc, "Report submitted", 201);
      } catch (err) {
        void normalizeError(err);
        return errorResponse(err instanceof Error ? err.message : "Submit failed", 400);
      }
    },
  }),
);
