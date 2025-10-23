/**
 * Logout API Route
 * POST /api/auth/logout
 */

import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/auth/middleware';
import { clearAuthCookie } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    // Clear authentication cookie
    await clearAuthCookie();

    return ApiResponse.success({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return ApiResponse.error('Failed to logout', 500);
  }
}
