/**
 * Admin Hero Settings API
 * GET /api/admin/hero-settings - Get hero settings
 * POST /api/admin/hero-settings - Update hero settings
 * PATCH /api/admin/hero-settings - Modify hero settings item
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
 * GET /api/admin/hero-settings
 * Get hero product and carousel settings
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Get hero settings
    const data = await settingsController.getHeroSettings(user);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/hero-settings:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/hero-settings
 * Create or update hero product settings
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Parse request body
    const body = await request.json();
    const { type, data } = body;

    // Update hero settings
    const updatedData = await settingsController.updateHeroSettings(type, data, user);

    return NextResponse.json({
      success: true,
      data: updatedData,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/hero-settings:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/hero-settings
 * Update specific hero setting item
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Parse request body
    const body = await request.json();
    const { type, item, itemId, action } = body;

    // Modify hero settings item
    const updatedItems = await settingsController.modifyHeroSettingsItem(
      type,
      action,
      item,
      itemId,
      user
    );

    return NextResponse.json({
      success: true,
      data: updatedItems,
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/hero-settings:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
