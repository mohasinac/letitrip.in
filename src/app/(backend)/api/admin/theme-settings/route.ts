/**
 * Admin Theme Settings API
 * GET /api/admin/theme-settings - Get theme settings
 * PUT /api/admin/theme-settings - Update theme settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { settingsController } from '../../_lib/controllers/settings.controller';
import { verifyAdminSession } from '../../_lib/auth/admin-auth';
import { AuthorizationError, ValidationError } from '../../_lib/middleware/error-handler';

/**
 * GET /api/admin/theme-settings
 * Get theme settings (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    // Get theme settings (no auth required for GET)
    const data = await settingsController.getThemeSettings();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/theme-settings:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to fetch theme settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/theme-settings
 * Update theme settings
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication using session
    const session = await verifyAdminSession(request);

    // Parse request body
    const body = await request.json();

    // Update theme settings
    const data = await settingsController.updateThemeSettings(body, {
      uid: session.userId,
      role: session.role,
      email: session.email,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/theme-settings:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update theme settings' },
      { status: 500 }
    );
  }
}
