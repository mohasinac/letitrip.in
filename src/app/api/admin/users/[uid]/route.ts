/**
 * API Route: Update User Role/Status (Admin Only)
 * PATCH /api/admin/users/[uid]
 * 
 * Allows admins to:
 * - Change user roles
 * - Enable/disable accounts
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/firebase/auth-server';
import { requireRole } from '@/lib/security/authorization';
import { userRepository } from '@/repositories';
import {
  ValidationError,
  handleApiError,
  NotFoundError,
} from '@/lib/errors';

// Validation schema
const updateUserSchema = z.object({
  role: z.enum(['user', 'moderator', 'admin']).optional(),
  disabled: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    // Authenticate and authorize
    const user = await getAuthenticatedUser(request);
    requireRole(user, ['admin']);

    const { uid } = params;

    // Get target user
    const targetUser = await userRepository.findById(uid);
    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateUserSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid input',
        validationResult.error.flatten().fieldErrors
      );
    }

    const updates = validationResult.data;

    // Prevent self-demotion
    if (updates.role && user.uid === uid && updates.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot change your own admin role',
        },
        { status: 400 }
      );
    }

    // Prevent self-disabling
    if (updates.disabled === true && user.uid === uid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot disable your own account',
        },
        { status: 400 }
      );
    }

    // Update user
    await userRepository.update(uid, {
      ...updates,
      updatedAt: new Date(),
    });

    const updatedUser = await userRepository.findById(uid);

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
