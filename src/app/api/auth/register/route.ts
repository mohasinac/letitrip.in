/**
 * Auth Register API Route - POST
 * 
 * POST: Register new user with email/password
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerWithEmail } from '../../_lib/controllers/auth.controller';
import {
  ValidationError,
  ConflictError,
} from '../../_lib/middleware/error-handler';

/**
 * POST /api/auth/register
 * Public endpoint - Register new user
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();

    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    // Register user using controller
    const result = await registerWithEmail({
      email: body.email,
      password: body.password,
      name: body.name,
      phone: body.phone,
      role: 'user', // Force role to user for public registration
      provider: 'email',
    });

    return NextResponse.json({
      success: true,
      data: {
        user: result.user,
      },
      message: result.message,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/auth/register:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof ConflictError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
