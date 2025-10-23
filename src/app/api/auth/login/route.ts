/**
 * Login API Route
 * POST /api/auth/login
 */

import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/auth/middleware';
import { AuthService } from '@/lib/api/services/auth.service';
import { loginSchema } from '@/lib/validations/schemas';
import { setAuthCookie } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);

    // Login user
    const { user, token } = await AuthService.login(
      validatedData.email,
      validatedData.password
    );

    // Set authentication cookie
    await setAuthCookie(token);

    return ApiResponse.success({
      user,
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return ApiResponse.error(error.message || 'Invalid credentials', 401);
  }
}
