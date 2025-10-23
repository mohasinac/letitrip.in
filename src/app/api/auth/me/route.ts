/**
 * Get Current User API Route
 * GET /api/auth/me
 */

import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/auth/middleware';
import { AuthService } from '@/lib/api/services/auth.service';

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const userData = await AuthService.getUserById(user.userId);

    if (!userData) {
      return ApiResponse.error('User not found', 404);
    }

    return ApiResponse.success(userData);
  } catch (error: any) {
    console.error('Get user error:', error);
    return ApiResponse.error('Failed to get user data', 500);
  }
});
