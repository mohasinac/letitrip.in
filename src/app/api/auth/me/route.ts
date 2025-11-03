/**
 * Auth Me API Route - GET
 * 
 * GET: Get current authenticated user's information
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../_lib/controllers/auth.controller';
import { AuthorizationError } from '../../_lib/middleware/error-handler';

/**
 * GET /api/auth/me
 * Protected endpoint - Get current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Get user using controller
    const user = await getCurrentUser(token);

    return NextResponse.json({
      success: true,
      data: user,
    });

  } catch (error: any) {
    console.error('Error in GET /api/auth/me:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get user information' },
      { status: 500 }
    );
  }
}
