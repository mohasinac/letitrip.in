import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  itemRequestsRepository,
} from "@mohasinac/appkit";
import { ROLES_AUTHENTICATED } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: false,
    handler: async () => {
      const result = await itemRequestsRepository.listOpen({ limit: 50 });
      return successResponse({ items: result.items, total: result.items.length });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    handler: async ({ request, user }) => {
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      try {
        const doc = await itemRequestsRepository.create({
          ...body,
          opUserId: user!.uid,
          opDisplayName: user!.name ?? "Anonymous",
          status: "pending-approval",
          replies: [],
          replyCount: 0,
        });
        return successResponse(doc, "Request submitted for review", 201);
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Submit failed", 400);
      }
    },
  }),
);
