import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { toApiIssues } from "@mohasinac/appkit/errors/error-envelope";
import { withProviders } from "@/providers.config";
/**
 * Admin Homepage Sections Detail API Route
 * PATCH /api/admin/sections/[id] — Update a section
 * DELETE /api/admin/sections/[id] — Delete a section
 */

import { revalidatePath } from "next/cache";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { homepageSectionsRepository } from "@mohasinac/appkit/features/homepage/repository/homepage-sections.repository";
import type { HomepageSectionUpdateInput } from "@mohasinac/appkit/features/homepage/schemas/firestore";
import { SECTION_SURFACE_VALUES } from "@mohasinac/appkit/features/homepage/schemas/firestore";
import { validateRequestBody, formatZodErrors } from "@/validation/request-schemas";
import { z } from "zod";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { ROLES_ADMIN_ONLY } from "@/constants";

const sectionUpdateSchema = z.object({
  order: z.number().optional(),
  enabled: z.boolean().optional(),
  config: z.object({}).passthrough().optional(),
  /*
   * 🛑 Only the INNER `config` is `.passthrough()` — the outer object is a
   * plain `z.object()`, which strips unknown keys silently. So a top-level
   * `surface` was dropped here with no error even though nested config
   * additions survived. It must also appear in `HomepageSectionUpdateInput`'s
   * `Pick<>`, or the spread below discards it one layer further on
   * (Root Cause #76).
   */
  surface: z.enum(SECTION_SURFACE_VALUES).optional(),
});

/**
 * PATCH /api/admin/sections/[id]
 *
 * Update a homepage section (order, enabled status, or config)
 */
export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:sections:write",
    handler: async ({ request, params, user }) => {
      const id = params?.id as string | undefined;

      if (!id) {
        return errorResponse(ERROR_MESSAGES.VALIDATION.FAILED, 400, {
          issues: [{ path: ["id"], message: "ID is required" }],
        });
      }

      const body = await request.json();
      const validation = validateRequestBody(sectionUpdateSchema, body);

      if (!validation.success) {
        return errorResponse(
          ERROR_MESSAGES.VALIDATION.FAILED,
          400,
          { issues: toApiIssues(validation.errors.issues) },
        );
      }

      // `config` is MERGED, not replaced — see HomepageSectionsRepository.update.
      // A key omitted here is preserved; clearing one needs an explicit value.
      // Do not "optimise" this into a direct Firestore write: that is what
      // silently erased every config field the admin builder has no input for
      // (Root Cause #76).
      const input: HomepageSectionUpdateInput = {
        ...validation.data,
        config: (validation.data.config as HomepageSectionUpdateInput["config"]) || undefined,
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

        // Homepage is ISR-cached (revalidate=120) — bust it instead of waiting.
        revalidatePath("/");

        return successResponse(section);
      } catch (error) {
        void normalizeError(error);
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
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:sections:write",
    handler: async ({ params, user }) => {
      const id = params?.id as string | undefined;

      if (!id) {
        return errorResponse(ERROR_MESSAGES.VALIDATION.FAILED, 400, {
          issues: [{ path: ["id"], message: "ID is required" }],
        });
      }

      try {
        await homepageSectionsRepository.delete(id);

        serverLogger.info("Homepage section deleted", {
          id,
          deletedBy: user?.uid,
        });

        // Homepage is ISR-cached (revalidate=120) — bust it instead of waiting.
        revalidatePath("/");

        return successResponse({ success: true });
      } catch (error) {
        void normalizeError(error);
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
