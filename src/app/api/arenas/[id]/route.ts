import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../_lib/database/admin';
import { Timestamp } from 'firebase-admin/firestore';
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from '../../_lib/middleware/error-handler';

/**
 * Helper function to verify admin authentication
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
      role: 'admin' as const,
      email: decodedToken.email,
    };
  } catch (error: any) {
    throw new AuthorizationError('Invalid or expired token');
  }
}

/**
 * GET /api/arenas/[id]
 * Get specific arena (public)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = getAdminDb();

    const arenaDoc = await db.collection('arenas').doc(id).get();

    if (!arenaDoc.exists) {
      throw new NotFoundError('Arena not found');
    }

    const arena = {
      id: arenaDoc.id,
      ...arenaDoc.data(),
      createdAt: arenaDoc.data()?.createdAt?.toDate
        ? arenaDoc.data()?.createdAt.toDate().toISOString()
        : arenaDoc.data()?.createdAt,
      updatedAt: arenaDoc.data()?.updatedAt?.toDate
        ? arenaDoc.data()?.updatedAt.toDate().toISOString()
        : arenaDoc.data()?.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: arena,
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error fetching arena:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch arena' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/arenas/[id]
 * Update arena (admin only)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request);
    const { id } = await context.params;
    const db = getAdminDb();

    // Check if arena exists
    const arenaDoc = await db.collection('arenas').doc(id).get();

    if (!arenaDoc.exists) {
      throw new NotFoundError('Arena not found');
    }

    // Parse body
    const updates = await request.json();

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.createdAt;

    // Add updatedAt timestamp
    updates.updatedAt = Timestamp.now();

    // Update arena
    await db.collection('arenas').doc(id).update(updates);

    // Get updated arena
    const updatedDoc = await db.collection('arenas').doc(id).get();

    const updatedArena = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data()?.createdAt?.toDate
        ? updatedDoc.data()?.createdAt.toDate().toISOString()
        : updatedDoc.data()?.createdAt,
      updatedAt: updatedDoc.data()?.updatedAt?.toDate
        ? updatedDoc.data()?.updatedAt.toDate().toISOString()
        : updatedDoc.data()?.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: updatedArena,
      message: 'Arena updated successfully',
    });
  } catch (error: any) {
    if (error instanceof AuthorizationError || error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error updating arena:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update arena' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/arenas/[id]
 * Delete arena (admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request);
    const { id } = await context.params;
    const db = getAdminDb();

    // Check if arena exists
    const arenaDoc = await db.collection('arenas').doc(id).get();

    if (!arenaDoc.exists) {
      throw new NotFoundError('Arena not found');
    }

    // Delete arena
    await db.collection('arenas').doc(id).delete();

    return NextResponse.json({
      success: true,
      data: { id },
      message: 'Arena deleted successfully',
    });
  } catch (error: any) {
    if (error instanceof AuthorizationError || error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error deleting arena:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete arena' },
      { status: 500 }
    );
  }
}
