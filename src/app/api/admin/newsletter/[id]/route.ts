/**
 * Admin Newsletter Subscriber by ID API Route
 * PATCH  /api/admin/newsletter/[id] — Update subscriber (status, adminNote)
 * DELETE /api/admin/newsletter/[id] — Permanently delete subscriber record
 */

import { z } from "zod";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { newsletterRepository } from "@/repositories";
import { NotFoundError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { NEWSLETTER_SUBSCRIBER_FIELDS } from "@/db/schema";

type RouteContext = { params: Promise<{ id: string }> };

const updateSubscriberSchema = z.object({
  status: z
    .enum([
      NEWSLETTER_SUBSCRIBER_FIELDS.STATUS_VALUES.ACTIVE,
      NEWSLETTER_SUBSCRIBER_FIELDS.STATUS_VALUES.UNSUBSCRIBED,
    ])
    .optional(),
  adminNote: z.string().max(500).optional(),
});

/**
 * PATCH /api/admin/newsletter/[id]
 */
export const PATCH = createApiHandler({
  auth: true,
  roles: ["admin"],
  schema: updateSubscriberSchema,
  handler: async ({ body }, ctx?: RouteContext) => {
    const { id } = await ctx!.params;

    const existing = await newsletterRepository.findById(id);
    if (!existing) throw new NotFoundError(ERROR_MESSAGES.NEWSLETTER.NOT_FOUND);

    serverLogger.info("Updating newsletter subscriber", {
      id,
      status: body?.status,
    });

    const updated = await newsletterRepository.updateSubscriber(id, body!);
    return successResponse(updated, SUCCESS_MESSAGES.NEWSLETTER.UPDATED);
  },
});

/**
 * DELETE /api/admin/newsletter/[id]
 */
export const DELETE = createApiHandler({
  auth: true,
  roles: ["admin"],
  handler: async (_req, ctx?: RouteContext) => {
    const { id } = await ctx!.params;

    const existing = await newsletterRepository.findById(id);
    if (!existing) throw new NotFoundError(ERROR_MESSAGES.NEWSLETTER.NOT_FOUND);

    serverLogger.info("Deleting newsletter subscriber", { id });

    await newsletterRepository.deleteById(id);
    return successResponse(
      { deleted: true },
      SUCCESS_MESSAGES.NEWSLETTER.DELETED,
    );
  },
});
