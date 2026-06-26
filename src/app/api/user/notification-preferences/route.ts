import { withProviders } from "@/providers.config";
import type { JsonValue } from "@mohasinac/appkit";
import { z } from "zod";
import { userRepository, createRouteHandler, successResponse } from "@mohasinac/appkit";

const channelPrefsSchema = z.object({
  email: z.boolean().optional(),
  whatsapp: z.boolean().optional(),
  sms: z.boolean().optional(),
});

const typePrefsSchema = z.object({
  orderUpdates: z.boolean().optional(),
  bids: z.boolean().optional(),
  promotions: z.boolean().optional(),
  system: z.boolean().optional(),
  reviews: z.boolean().optional(),
  messages: z.boolean().optional(),
  offers: z.boolean().optional(),
});

const schema = z.object({
  channels: channelPrefsSchema.optional(),
  types: typePrefsSchema.optional(),
});

// rbac-scope-enforced-in-handler: createRouteHandler with auth:true — any authenticated user
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const prefs = (user as Record<string, JsonValue>).notificationPreferences ?? {
        channels: { email: true, whatsapp: true, sms: true },
        types: {
          orderUpdates: true,
          bids: true,
          promotions: true,
          system: true,
          reviews: true,
          messages: true,
          offers: true,
        },
      };
      return successResponse({ notificationPreferences: prefs });
    },
  }),
);

// rbac-scope-enforced-in-handler: createRouteHandler with auth:true — any authenticated user
export const PUT = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request }) => {
      const body = schema.parse(await request.json());
      await userRepository.update(user!.uid, {
        notificationPreferences: body,
      } as never);
      return successResponse({ notificationPreferences: body });
    },
  }),
);