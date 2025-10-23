/**
 * Authentication API Routes
 * POST /api/auth/register - Register new user
 * POST /api/auth/login - Login user
 * POST /api/auth/logout - Logout user
 * GET /api/auth/me - Get current user
 */

import { NextRequest } from 'next/server';
import { ApiResponse, withAuth } from '@/lib/auth/middleware';
import { AuthService } from '@/lib/api/services/auth.service';
import { registerSchema, loginSchema } from '@/lib/validations/schemas';
import { setAuthCookie, clearAuthCookie } from '@/lib/auth/jwt';

/**
 * Register new user
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);

    // Register user
    const { user, token } = await AuthService.register(
      validatedData.email,
      validatedData.password,
      validatedData.name,
      validatedData.phone,
      validatedData.role
    );

    // Set authentication cookie
    await setAuthCookie(token);

    return ApiResponse.success(
      {
        user,
        token,
      },
      201
    );
  } catch (error: any) {
    console.error('Register error:', error);
    return ApiResponse.error(error.message || 'Failed to register user', 400);
  }
}
