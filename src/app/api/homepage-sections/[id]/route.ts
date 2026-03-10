/**
 * Homepage Sections API - Individual Section Routes
 *
 * Handles individual homepage section operations
 */

import { homepageSectionsRepository } from "@/repositories";
import { homepageSectionUpdateSchema } from "@/lib/validation/schemas";
import { NotFoundError } from "@/lib/errors";
import { successResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

type IdParams = { id: string };

/**
 * GET /api/homepage-sections/[id] — Get homepage section by ID (public)
 */
export const GET = createApiHandler<never, IdParams>({
  rateLimit: RateLimitPresets.API,
  handler: async ({ params }) => {
    const { id } = params!;
    const section = await homepageSectionsRepository.findById(id);
    if (!section) throw new NotFoundError(ERROR_MESSAGES.SECTION.NOT_FOUND);
    return successResponse(section);
  },
});

/**
 * PATCH /api/homepage-sections/[id] — Update homepage section (admin)
 */
export const PATCH = createApiHandler<
  (typeof homepageSectionUpdateSchema)["_output"],
  IdParams
>({
  roles: ["admin"],
  rateLimit: RateLimitPresets.API,
  schema: homepageSectionUpdateSchema,
  handler: async ({ body, params }) => {
    const { id } = params!;
    const section = await homepageSectionsRepository.findById(id);
    if (!section) throw new NotFoundError(ERROR_MESSAGES.SECTION.NOT_FOUND);

    const updated = await homepageSectionsRepository.update(id, body as any);
    return successResponse(updated);
  },
});

/**
 * DELETE /api/homepage-sections/[id] — Delete homepage section (admin)
 */
export const DELETE = createApiHandler<never, IdParams>({
  roles: ["admin"],
  rateLimit: RateLimitPresets.API,
  handler: async ({ params }) => {
    const { id } = params!;
    const section = await homepageSectionsRepository.findById(id);
    if (!section) throw new NotFoundError(ERROR_MESSAGES.SECTION.NOT_FOUND);

    await homepageSectionsRepository.delete(id);
    return successResponse(undefined, SUCCESS_MESSAGES.SECTION.DELETED);
  },
});
