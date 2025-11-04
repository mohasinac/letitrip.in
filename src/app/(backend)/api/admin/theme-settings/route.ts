/**
 * Admin Theme Settings API
 * GET /api/admin/theme-settings - Get theme settings
 * PUT /api/admin/theme-settings - Update theme settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { settingsController } from '../../_lib/controllers/settings.controller';
import { getAdminAuth } from '../../_lib/database/admin';
import { AuthorizationError, ValidationError } from '../../_lib/middleware/error-handler';

/**
 * Verify admin authentication
 */
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthorizationError('Authentication required');
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || 'user';

    if (role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    return {
      uid: decodedToken.uid,
      role: role as 'admin',
      email: decodedToken.email,
    };
  } catch (error: any) {
    throw new AuthorizationError('Invalid or expired token');
  }
}

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
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Parse request body
    const body = await request.json();

    // Update theme settings
    const data = await settingsController.updateThemeSettings(body, user);

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
