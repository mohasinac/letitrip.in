/**
 * User Profile API (Example with New Patterns)
 * 
 * Demonstrates usage of:
 * - Repository pattern
 * - New error handling
 * - Rate limiting
 * - Authorization utilities
 * 
 * This is an EXAMPLE showing the recommended patterns.
 * Copy this approach to other API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { userRepository } from '@/repositories';
import { handleApiError, ValidationError, AuthenticationError } from '@/lib/errors';
import { rateLimit, RateLimitPresets, requireAuth } from '@/lib/security';
import { updateProfileSchema } from '@/lib/validation';

/**
 * GET /api/user/profile-new
 * Get current user's profile (Example with new patterns)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Rate limiting
    const rateLimitResult = await rateLimit(request, RateLimitPresets.API);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: rateLimitResult.error },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      );
    }

    // 2. Authentication
    const user = await requireAuth();
    if (!user?.id) {
      throw new AuthenticationError('User ID not found in session');
    }

    // 3. Use repository
    const userData = await userRepository.findByIdOrFail(user.id);

    // 4. Return success response
    return NextResponse.json({
      success: true,
      data: {
        user: {
          uid: userData.uid,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          role: userData.role,
          emailVerified: userData.emailVerified,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
      },
    });
  } catch (error) {
    // 5. Centralized error handling
    return handleApiError(error);
  }
}

/**
 * PUT /api/user/profile-new
 * Update current user's profile (Example with new patterns)
 */
export async function PUT(request: NextRequest) {
  try {
    // 1. Rate limiting
    const rateLimitResult = await rateLimit(request, RateLimitPresets.API);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: rateLimitResult.error },
        { status: 429 }
      );
    }

    // 2. Authentication
    const user = await requireAuth();
    if (!user?.id) {
      throw new AuthenticationError('User ID not found in session');
    }

    // 3. Validate request body
    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      const fieldErrors = Object.entries(validation.error.flatten().fieldErrors)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value?.join(', ') || '' }), {});
      throw new ValidationError('Invalid input', fieldErrors);
    }

    const { displayName, photoURL } = validation.data;

    // 4. Update using repository
    const updatedUser = await userRepository.updateProfile(user.id, {
      displayName,
      photoURL,
    });

    // 5. Return success response
    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    // 6. Centralized error handling
    return handleApiError(error);
  }
}

/**
 * MIGRATION GUIDE:
 * 
 * To migrate existing API routes to these patterns:
 * 
 * 1. Add rate limiting at the start:
 *    const rateLimitResult = await rateLimit(request, RateLimitPresets.API);
 * 
 * 2. Use requireAuth() instead of withAuth():
 *    const user = await requireAuth();
 * 
 * 3. Replace direct DB calls with repositories:
 *    OLD: adminDb.collection('users').doc(id).get()
 *    NEW: userRepository.findById(id)
 * 
 * 4. Use new error classes:
 *    OLD: return ApiErrors.notFound('User')
 *    NEW: throw new NotFoundError('User not found')
 * 
 * 5. Wrap in try-catch with handleApiError:
 *    catch (error) {
 *      return handleApiError(error);
 *    }
 * 
 * 6. Use authorization utilities:
 *    await requireRole(user.id, 'admin');
 *    await requireOwnership(user.id, resourceOwnerId);
 */
