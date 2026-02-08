/**
 * Site Settings API Routes
 *
 * Handles global site configuration (singleton document)
 *
 * TODO - Phase 2 Refactoring:
 * - Implement settings caching (Redis/memory)
 * - Add settings versioning/history
 * - Implement settings validation rules
 * - Add settings change notifications
 * - Implement settings import/export
 * - Add settings backup/restore
 * - Implement feature flag management
 */

import { NextRequest, NextResponse } from "next/server";
import { siteSettingsRepository } from "@/repositories";
import { ERROR_MESSAGES } from "@/constants";
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

/**
 * GET /api/site-settings
 *
 * Get global site settings
 *
 * TODO: Implement settings fetching
 * TODO: Return public fields only for non-admin users
 * TODO: Add aggressive caching (CDN + Redis)
 * TODO: Support ETag for conditional requests
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

    return NextResponse.json(
      { success: true, data: responseData },
      {
        headers: {
          // Add cache headers for performance
          "Cache-Control": isAdmin
            ? "private, no-cache" // Admin: no cache
            : "public, max-age=300, s-maxage=600, stale-while-revalidate=120", // Public: 5-10 min cache + SWR
        },
      },
    );
  } catch (error) {
    console.error(ERROR_MESSAGES.API.SITE_SETTINGS_GET_ERROR, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch site settings" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/site-settings
 *
 * Update site settings (admin only)
 *
 * Body: Partial<SiteSettingsDocument>
 *
 * TODO: Implement settings update
 * TODO: Require admin authentication
 * TODO: Validate update data with Zod schema
 * TODO: Track changes in audit log
 * TODO: Invalidate all caches
 * TODO: Send notification to all admins
 * TODO: Return updated settings
 */
export async function PATCH(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireRoleFromRequest(request, ["admin"]);

    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(siteSettingsUpdateSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors: formatZodErrors(validation.errors),
        },
        { status: 400 },
      );
    }

    // Update settings in repository (singleton pattern)
    const updatedSettings = await siteSettingsRepository.updateSingleton(
      validation.data,
    );

    // TODO (Future): Invalidate caches
    // await cacheManager.invalidate('site-settings');

    // TODO (Future): Log change in audit trail
    // await auditLog.log({
    //   action: 'SETTINGS_UPDATED',
    //   userId: user.uid,
    //   changes: validation.data,
    // });

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: "Site settings updated successfully",
    });
  } catch (error) {
    console.error(ERROR_MESSAGES.API.SITE_SETTINGS_PATCH_ERROR, error);

    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 },
      );
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
