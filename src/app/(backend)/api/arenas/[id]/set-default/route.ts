import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../_lib/database/admin';
import {
  AuthorizationError,
  NotFoundError,
} from '../../../_lib/middleware/error-handler';

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
 * POST /api/arenas/[id]/set-default
 * Set arena as default (admin only)
 */
export async function POST(
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

    // Remove default flag from all other arenas
    const allArenasSnap = await db
      .collection('arenas')
      .where('difficulty', '==', 'easy')
      .get();

    const batch = db.batch();

    // Set all existing default arenas to medium difficulty
    allArenasSnap.docs.forEach((doc: any) => {
      if (doc.id !== id) {
        batch.update(doc.ref, { difficulty: 'medium' });
      }
    });

    // Set the selected arena as default (easy difficulty)
    batch.update(db.collection('arenas').doc(id), { difficulty: 'easy' });

    // Commit batch
    await batch.commit();

    return NextResponse.json({
      success: true,
      data: { id },
      message: 'Default arena updated successfully',
    });
  } catch (error: any) {
    if (error instanceof AuthorizationError || error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error setting default arena:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set default arena' },
      { status: 500 }
    );
  }
}
