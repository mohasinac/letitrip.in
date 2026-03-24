/**
 * Homepage Sections API Routes
 *
 * GET delegated to @mohasinac/feat-homepage (supports ?includeDisabled=true with admin auth).
 * POST stays local (admin auth, order auto-assignment).
 */

export { GET } from "@mohasinac/feat-homepage";

import { homepageSectionsRepository } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { homepageSectionCreateSchema } from "@/lib/validation/schemas";
import { SUCCESS_MESSAGES } from "@/constants";
import { createApiHandler } from "@/lib/api/api-handler";

/**
 * POST /api/homepage-sections
 *
 * Create new homepage section (admin only)
 *
 * Body:
 * - type: SectionType (required)
 * - config: object (section-specific configuration, required)
 * - order: number (optional, auto-assigned if not provided)
 * - enabled: boolean (optional, defaults to true)
 *
 * ✅ Requires admin authentication via requireRoleFromRequest
 * ✅ Validates body with homepageSectionCreateSchema (Zod)
 * ✅ Auto-assigns order (max existing + 1) when not provided
 * ✅ Creates section via homepageSectionsRepository.create()
 * ✅ Returns created section with 201 status
 * TODO (Future): Validate section-specific config structure per type
 */
export const POST = createApiHandler<
  (typeof homepageSectionCreateSchema)["_output"]
>({
  auth: true,
  roles: ["admin"],
  schema: homepageSectionCreateSchema,
  handler: async ({ body }) => {
    const allSections = await homepageSectionsRepository.findAll();
    const maxOrder = allSections.reduce(
      (max, section) => Math.max(max, section.order || 0),
      0,
    );
    const order = body!.order !== undefined ? body!.order : maxOrder + 1;
    const section = await homepageSectionsRepository.create({
      ...body!,
      order,
    } as any);
    return successResponse(section, SUCCESS_MESSAGES.SECTION.CREATED, 201);
  },
});
