/**
 * FAQs [id] API Routes
 *
 * Individual FAQ operations — GET (public), PATCH/DELETE (admin).
 */

import { faqsRepository, siteSettingsRepository } from "@/repositories";
import { createRouteHandler } from "@mohasinac/next";
import { successResponse } from "@/lib/api-response";
import { faqUpdateSchema } from "@/lib/validation/schemas";
import { NotFoundError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import type { FAQDocument } from "@/db/schema";

type IdParams = { id: string };

/**
 * GET /api/faqs/[id]
 * Public — returns interpolated FAQ with site-setting variable substitution.
 */
export const GET = createRouteHandler<never, IdParams>({
  handler: async ({ params }) => {
    const { id } = params!;

    const faq = await faqsRepository.findById(id);
    if (!faq) throw new NotFoundError(ERROR_MESSAGES.FAQ.NOT_FOUND);

    const siteSettings = await siteSettingsRepository.getSingleton();

    const interpolate = (
      text: string,
      vars: Record<string, string | undefined>,
    ) => {
      let result = text;
      Object.entries(vars).forEach(([key, value]) => {
        if (value)
          result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
      });
      return result;
    };

    const interpolatedFAQ: FAQDocument = {
      ...faq,
      answer: {
        ...faq.answer,
        text: interpolate(faq.answer.text, {
          companyName: siteSettings.siteName,
          supportEmail: siteSettings.contact.email,
          supportPhone: siteSettings.contact.phone,
          websiteUrl: `https://${siteSettings.siteName}`,
          companyAddress: siteSettings.contact.address,
        }),
      },
    };

    // Increment view count — fire-and-forget, non-blocking
    const currentStats = faq.stats || { views: 0, helpful: 0, notHelpful: 0 };
    faqsRepository
      .update(id, {
        stats: {
          ...currentStats,
          views: (currentStats.views || 0) + 1,
          lastViewed: new Date(),
        },
      })
      .catch((err) =>
        serverLogger.error("FAQ view count update failed", { error: err }),
      );

    return successResponse(interpolatedFAQ);
  },
});

/**
 * PATCH /api/faqs/[id]
 * Admin only — update FAQ fields.
 */
export const PATCH = createRouteHandler<
  Partial<(typeof faqUpdateSchema)["_output"]>,
  IdParams
>({
  roles: ["admin"],
  schema: faqUpdateSchema,
  handler: async ({ params, body }) => {
    const { id } = params!;
    const faq = await faqsRepository.findById(id);
    if (!faq) throw new NotFoundError(ERROR_MESSAGES.FAQ.NOT_FOUND);
    const updatedFAQ = await faqsRepository.update(id, body as any);
    return successResponse(updatedFAQ, SUCCESS_MESSAGES.FAQ.UPDATED);
  },
});

/**
 * DELETE /api/faqs/[id]
 * Admin only — hard delete FAQ.
 */
export const DELETE = createRouteHandler<never, IdParams>({
  roles: ["admin"],
  handler: async ({ params }) => {
    const { id } = params!;
    const faq = await faqsRepository.findById(id);
    if (!faq) throw new NotFoundError(ERROR_MESSAGES.FAQ.NOT_FOUND);
    await faqsRepository.delete(id);
    return successResponse(undefined, SUCCESS_MESSAGES.FAQ.DELETED);
  },
});
