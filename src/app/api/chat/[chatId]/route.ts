import { withProviders } from "@/providers.config";
import {
  chatRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

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

export const GET = __GET__g;
export const DELETE = __DELETE__g;
