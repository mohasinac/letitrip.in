import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  userRepository,
} from "@mohasinac/appkit";
import { sendNotification } from "@mohasinac/appkit/server";
import type { BannedAction } from "@mohasinac/appkit/server";

const BANNED_ACTIONS = [
  "write_reviews",
  "write_blog_comments",
  "join_events",
  "place_bids",
  "create_listings",
  "send_messages",
  "create_support_tickets",
  "report_scammers",
] as const;

const schema = z.object({
  action: z.enum(BANNED_ACTIONS),
  reason: z.string().min(1, "Reason is required"),
  expiresAt: z.string().datetime().optional(),
});

export const POST = withProviders(
  createRouteHandler<(typeof schema)["_output"]>({
    auth: true,
    roles: ["admin", "employee"],
    permission: "admin:user-bans:write",
    schema,
    handler: async ({ params, body, user }) => {
      const uid = (params as { uid: string }).uid;
      const target = await userRepository.findById(uid);
      if (!target) return errorResponse("User not found", 404);

      const ban = {
        action: body!.action as BannedAction,
        reason: body!.reason,
        bannedBy: user!.uid,
        bannedAt: new Date(),
        expiresAt: body!.expiresAt ? new Date(body!.expiresAt) : null,
      };

      const existingBans = (target.softBans ?? []).filter((b) => b.action !== ban.action);
      await userRepository.update(uid, {
        softBans: [...existingBans, ban],
      } as any);

      const expiryText = ban.expiresAt
        ? `Expires: ${ban.expiresAt.toDateString()}`
        : "This restriction has no expiry date.";

      try {
        await sendNotification({
          userId: uid,
          type: "account_action",
          priority: "normal",
          title: `Account restriction applied: ${body!.action.replace(/_/g, " ")}`,
          message: `Your account has been restricted from ${body!.action.replace(/_/g, " ")}. Reason: ${body!.reason}. ${expiryText}`,
          relatedId: uid,
          relatedType: "user",
        });
      } catch { /* non-fatal */ }

      return successResponse({ uid, action: body!.action }, "Soft ban applied");
    },
  }),
);
