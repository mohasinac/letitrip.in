/**
 * Admin Create User Document API
 * POST /api/admin/users/[userId]/create-document - Create or update user Firestore document
 */

import { NextRequest, NextResponse } from 'next/server';
import { userController } from '../../../../_lib/controllers/user.controller';
import { getAdminAuth } from '../../../../_lib/database/admin';
import { AuthorizationError, NotFoundError, ValidationError } from '../../../../_lib/middleware/error-handler';

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
 * POST /api/admin/users/[userId]/create-document
 * Create or update user Firestore document
 * Useful when Firebase Auth user exists but no Firestore document
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify admin authentication
    const user = await verifyAdminAuth(request);

    // Get user ID from params
    const { userId } = await context.params;

    // Parse request body
    const body = await request.json();
    const { email, name, phone, role } = body;

    // Create user document using controller
    const userDoc = await userController.createUserDocumentAdmin(
      userId,
      { email, name, phone, role },
      user
    );

    return NextResponse.json({
      success: true,
      message: 'User document created/updated successfully',
      data: userDoc,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/users/[userId]/create-document:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user document' },
      { status: 500 }
    );
  }
}

