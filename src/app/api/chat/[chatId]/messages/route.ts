import { withProviders } from "@/providers.config";
import {
  sendChatMessage,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";
import { z } from "zod";

const messageSchema = z.object({
  message: z.string().min(1),
});

// GET messages are read directly from Firebase RTDB on the client via real-time subscription.
// This POST handler is the server-side entry point for sending a new message.
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    schema: messageSchema,
    handler: async ({ user, body, params }) => {
      const chatId = (params as { chatId: string }).chatId;
      const result = await sendChatMessage(user!.uid, chatId, body!.message);
      return successResponse(result, "Message sent", 201);
    },
  }),
);
