import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import {
  chatRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

// rbac-scope-enforced-in-handler: auth and ownership enforced within handler
const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const chatId = (params as { chatId: string }).chatId;
      const room = await chatRepository.findById(chatId);
      if (!room) return errorResponse("Chat room not found", 404);
      if (!room.participantIds?.includes(user!.uid)) {
        return errorResponse("Forbidden", 403);
      }
      return successResponse(room);
    },
  }),
);

// rbac-scope-enforced-in-handler: auth and ownership enforced within handler
const __DELETE__g = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const chatId = (params as { chatId: string }).chatId;
      await chatRepository.softDeleteForUser(chatId, user!.uid);
      return successResponse(null, "Chat room removed");
    },
  }),
);

// rbac-scope-enforced-in-handler: feature-guarded — returns 404 when FEATURE_* disabled
export const GET = withFeatureGuard("CHAT", __GET__g);
// rbac-scope-enforced-in-handler: feature-guarded — returns 404 when FEATURE_* disabled
export const DELETE = withFeatureGuard("CHAT", __DELETE__g);
