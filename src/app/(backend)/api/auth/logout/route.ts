/**
 * Auth Logout API Route - POST
 * Destroy session and clear HTTP-only cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '../../_lib/auth/session';

/**
 * POST /api/auth/logout
 * Authenticated endpoint - Logout user
 */
export async function POST(request: NextRequest) {
  try {
    // Destroy session
    await destroySession();

    return NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Logout failed' },
      { status: 500 }
    );
  }
}
