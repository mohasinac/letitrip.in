/**
 * Admin Newsletter Subscriber by ID API Route
 * PATCH  /api/admin/newsletter/[id] — Update subscriber status (unsubscribe/resubscribe)
 * DELETE /api/admin/newsletter/[id] — Hard-delete subscriber record
 */

import { z } from "zod";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { newsletterRepository } from "@/repositories";
import { NotFoundError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

type RouteContext = { params: Promise<{ id: string }> };

const updateSubscriberSchema = z.object({
  status: z.enum(["active", "unsubscribed"]),
});

/**
 * PATCH /api/admin/newsletter/[id]
 *
 * Updates a subscriber's status to "active" or "unsubscribed".
 */
export const PATCH = createApiHandler({
  auth: true,
  roles: ["admin"],
  schema: updateSubscriberSchema,
  handler: async ({ body }, ctx?: RouteContext) => {
    const { id } = await ctx!.params;

    const existing = await newsletterRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(ERROR_MESSAGES.NEWSLETTER.NOT_FOUND);
    }

    if (body!.status === "unsubscribed") {
      await newsletterRepository.unsubscribeById(id);
      serverLogger.info("Admin unsubscribed newsletter subscriber", { id });
      return successResponse(
        { id, status: "unsubscribed" },
        SUCCESS_MESSAGES.NEWSLETTER.UNSUBSCRIBED,
      );
    } else {
      await newsletterRepository.resubscribeById(id);
      serverLogger.info("Admin resubscribed newsletter subscriber", { id });
      return successResponse(
        { id, status: "active" },
        SUCCESS_MESSAGES.NEWSLETTER.RESUBSCRIBED,
      );
    }
  },
});

/**
 * DELETE /api/admin/newsletter/[id]
 *
 * Permanently removes a subscriber record.
 */
export const DELETE = createApiHandler({
  auth: true,
  roles: ["admin"],
  handler: async (_ctx, ctx?: RouteContext) => {
    const { id } = await ctx!.params;

    const existing = await newsletterRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(ERROR_MESSAGES.NEWSLETTER.NOT_FOUND);
    }

    await newsletterRepository.delete(id);

    serverLogger.info("Admin deleted newsletter subscriber", {
      id,
      email: existing.email,
    });

    return successResponse({ id }, SUCCESS_MESSAGES.NEWSLETTER.DELETED);
  },
});
