/**
 * Admin Hero Slides API
 * GET /api/admin/hero-slides - Get all hero slides (admin view)
 * POST /api/admin/hero-slides - Create new hero slide
 * PUT /api/admin/hero-slides - Update hero slide
 * DELETE /api/admin/hero-slides - Delete hero slide
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
 * GET /api/admin/hero-slides
 * Get all hero slides (admin view - includes inactive)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Get all slides (admin can see inactive)
    const data = await settingsController.getAllHeroSlides(user);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/hero-slides:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch slides' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/hero-slides
 * Create new hero slide
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Parse request body
    const body = await request.json();

    // Create hero slide
    const data = await settingsController.createHeroSlide(body, user);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/hero-slides:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create slide' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/hero-slides
 * Update existing hero slide
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Parse request body
    const body = await request.json();
    const { id, ...slideData } = body;

    if (!id) {
      throw new ValidationError('Slide ID is required');
    }

    // Update hero slide
    const data = await settingsController.updateHeroSlide(id, slideData, user);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/hero-slides:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update slide' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/hero-slides
 * Delete hero slide
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Get ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new ValidationError('Slide ID is required');
    }

    // Delete hero slide
    await settingsController.deleteHeroSlide(id, user);

    return NextResponse.json({
      success: true,
      message: 'Slide deleted successfully',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/hero-slides:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete slide' },
      { status: 500 }
    );
  }
}
