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

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      /*
       * 🛑 READ THE DOCUMENT THE PUT BELOW WRITES, NOT THE SESSION.
       *
       * `notificationPreferences` lives on the user DOCUMENT — the PUT handler
       * writes it with `userRepository.update(uid, { notificationPreferences })`.
       * It is never minted into the session cookie, so `user.notificationPreferences`
       * was always `undefined` and this handler always fell through to the
       * all-true defaults.
       *
       * The save worked perfectly the whole time; the read never saw it. Every
       * toggle the user turned OFF came back ON after a reload, which reads as
       * "the save button does nothing" — and was reported that way.
       *
       * Same shape as GET /api/user/profile one route over: a session read
       * standing in for a document read. Costs one document fetch on an endpoint
       * that returns a single user, well inside Rule #6.
       */
      const profile = await userRepository.findById(user!.uid);
      const prefs = (profile as Record<string, JsonValue> | null)?.notificationPreferences
        ?? (user as Record<string, JsonValue>).notificationPreferences
        ?? {
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