import { withProviders } from "@/providers.config";
/**
 * Admin Homepage Sections Detail API Route
 * PATCH /api/admin/sections/[id] — Update a section
 * DELETE /api/admin/sections/[id] — Delete a section
 */

import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import { successResponse, errorResponse } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { homepageSectionsRepository } from "@mohasinac/appkit";
import type { HomepageSectionUpdateInput } from "@mohasinac/appkit";
import { validateRequestBody, formatZodErrors } from "@/validation/request-schemas";
import { z } from "zod";
import { ERROR_MESSAGES } from "@mohasinac/appkit";

const sectionUpdateSchema = z.object({
  order: z.number().optional(),
  enabled: z.boolean().optional(),
  config: z.object({}).passthrough().optional(),
});

/**
 * PATCH /api/admin/sections/[id]
 *
 * Update a homepage section (order, enabled status, or config)
 */
export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    handler: async ({ request, params, user }) => {
      const id = params?.id as string | undefined;

      if (!id) {
        return errorResponse(ERROR_MESSAGES.VALIDATION.FAILED, 400, {
          id: ["ID is required"],
        });
      }

      const body = await request.json();
      const validation = validateRequestBody(sectionUpdateSchema, body);

      if (!validation.success) {
        return errorResponse(
          ERROR_MESSAGES.VALIDATION.FAILED,
          400,
          formatZodErrors(validation.errors),
        );
      }

      const input: HomepageSectionUpdateInput = {
        ...validation.data,
        config: (validation.data.config as any) || undefined,
      };

      try {
        await homepageSectionsRepository.update(id, input);

        serverLogger.info("Homepage section updated", {
          id,
          updatedBy: user?.uid,
          changes: Object.keys(input),
        });

        // Fetch updated section for response
        const section = await homepageSectionsRepository.findById(id);

        if (!section) {
          return errorResponse(ERROR_MESSAGES.SECTION.NOT_FOUND, 404);
        }

        return successResponse(section);
      } catch (error) {
        serverLogger.error("Failed to update section", {
          id,
          error: error instanceof Error ? error.message : String(error),
        });
        return errorResponse(
          "Failed to update section",
          500,
        );
      }
    },
  }),
);

/**
 * DELETE /api/admin/sections/[id]
 *
 * Delete a homepage section
 */
export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    handler: async ({ params, user }) => {
      const id = params?.id as string | undefined;

      if (!id) {
        return errorResponse(ERROR_MESSAGES.VALIDATION.FAILED, 400, {
          id: ["ID is required"],
        });
      }

      try {
        await homepageSectionsRepository.delete(id);

        serverLogger.info("Homepage section deleted", {
          id,
          deletedBy: user?.uid,
        });

        return successResponse({ success: true });
      } catch (error) {
        serverLogger.error("Failed to delete section", {
          id,
          error: error instanceof Error ? error.message : String(error),
        });
        return errorResponse(
          "Failed to delete section",
          500,
        );
      }
    },
  }),
);
