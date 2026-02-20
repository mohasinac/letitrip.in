/**
 * Site Settings API Routes
 *
 * Handles global site configuration (singleton document)
 *
 * TODO (Future) - Phase 2:
 * - Implement settings caching (Redis/memory)
 * - Add settings versioning/history
 * - Implement settings validation rules
 * - Add settings change notifications
 * - Implement settings import/export
 * - Add settings backup/restore
 * - Implement feature flag management
 */

import { NextRequest } from "next/server";
import { siteSettingsRepository } from "@/repositories";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { errorResponse, successResponse } from "@/lib/api-response";
import {
  getUserFromRequest,
  requireRoleFromRequest,
} from "@/lib/security/authorization";
import {
  validateRequestBody,
  formatZodErrors,
  siteSettingsUpdateSchema,
} from "@/lib/validation/schemas";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { handleApiError } from "@/lib/errors/error-handler";
import { serverLogger } from "@/lib/server-logger";

/**
 * GET /api/site-settings
 *
 * Get global site settings
 *
 * Ã¢Å“â€¦ Fetches settings via siteSettingsRepository.getSingleton()
 * Ã¢Å“â€¦ Returns public fields only for non-admin users (strips emailSettings, legalPages)
 * Ã¢Å“â€¦ Cache-Control headers set (5 min public / no-cache admin)
 * TODO (Future): Support ETag for conditional requests
 * TODO (Future): Integrate Redis for distributed caching
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch site settings (singleton pattern)
    const settings = await siteSettingsRepository.getSingleton();

    // Check if user is authenticated and is admin
    const user = await getUserFromRequest(request);
    const isAdmin = user?.role === "admin";

    // Filter sensitive fields for non-admin users
    let responseData: any = { ...settings };

    if (!isAdmin) {
      // Public fields only - remove sensitive admin-only fields
      const {
        emailSettings, // Hide SMTP config (contains fromEmail, replyTo)
        legalPages, // Hide legal page content (can be large)
        ...publicFields
      } = settings;

      responseData = {
        ...publicFields,
        // Include only necessary contact info
        contact: {
          email: settings.contact.email,
          phone: settings.contact.phone,
          // Hide full address
        },
      };
    }

    const cacheControl = isAdmin
      ? "private, no-cache"
      : "public, max-age=300, s-maxage=600, stale-while-revalidate=120";
    const response = successResponse(responseData);
    response.headers.set("Cache-Control", cacheControl);
    return response;
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.SITE_SETTINGS_GET_ERROR, { error });
    return errorResponse(ERROR_MESSAGES.ADMIN.LOAD_SETTINGS_FAILED, 500);
  }
}

/**
 * PATCH /api/site-settings
 *
 * Update site settings (admin only)
 *
 * Body: Partial<SiteSettingsDocument>
 *
 * Ã¢Å“â€¦ Requires admin authentication via requireRoleFromRequest
 * Ã¢Å“â€¦ Validates body with siteSettingsUpdateSchema (Zod)
 * Ã¢Å“â€¦ Updates via siteSettingsRepository.updateSingleton()
 * Ã¢Å„â¦ Writes audit log entry via serverLogger with changed fields and admin identity
 * Ã¢Å„â¦ Returns updated settings
 * TODO (Future): Invalidate distributed caches (Redis)
 * TODO (Future): Send notification to all admins on settings change
 */
export async function PATCH(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(siteSettingsUpdateSchema, body);

    if (!validation.success) {
      return errorResponse(
        ERROR_MESSAGES.VALIDATION.FAILED,
        400,
        formatZodErrors(validation.errors),
      );
    }

    // Update settings in repository (singleton pattern)
    const updatedSettings = await siteSettingsRepository.updateSingleton(
      validation.data,
    );

    // Audit log — record which admin changed what fields
    serverLogger.info(ERROR_MESSAGES.API.SITE_SETTINGS_AUDIT_LOG, {
      adminId: user.uid,
      adminEmail: user.email,
      changedFields: Object.keys(validation.data),
      changes: validation.data,
      timestamp: new Date().toISOString(),
    });

    return successResponse(
      updatedSettings,
      SUCCESS_MESSAGES.ADMIN.SETTINGS_SAVED,
    );
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.SITE_SETTINGS_PATCH_ERROR, { error });
    return handleApiError(error);
  }
}
