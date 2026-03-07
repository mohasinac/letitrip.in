/**
 * Homepage Sections API - Reorder Endpoint
 *
 * Handles reordering homepage sections
 */

import { homepageSectionsRepository } from "@/repositories";
import { homepageSectionsReorderSchema } from "@/lib/validation/schemas";
import { successResponse } from "@/lib/api-response";
import { serverLogger } from "@/lib/server-logger";
import { SUCCESS_MESSAGES } from "@/constants";
import { createApiHandler } from "@/lib/api/api-handler";

/**
 * POST /api/homepage-sections/reorder
 *
 * Reorder homepage sections
 *
 * Body:
 * - sectionIds: string[] (array of section IDs in desired order)
 *
 * Requires admin authentication
 */
export const POST = createApiHandler<
  (typeof homepageSectionsReorderSchema)["_output"]
>({
  auth: true,
  roles: ["admin"],
  schema: homepageSectionsReorderSchema,
  handler: async ({ body }) => {
    const { sectionIds } = body!;
    await Promise.all(
      sectionIds.map((sectionId, index) =>
        homepageSectionsRepository.update(sectionId, { order: index + 1 }),
      ),
    );
    const updatedSections = await homepageSectionsRepository.findAll();
    updatedSections.sort((a, b) => (a.order || 0) - (b.order || 0));
    serverLogger.info("Homepage sections reordered", {
      count: sectionIds.length,
    });
    return successResponse(updatedSections, SUCCESS_MESSAGES.SECTION.REORDERED);
  },
});
