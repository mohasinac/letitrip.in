import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../_lib/database/admin';
import { verifyAdminSession } from '../../_lib/auth/admin-auth';
import { Timestamp } from 'firebase-admin/firestore';
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from '../../_lib/middleware/error-handler';
import { DATABASE_CONSTANTS } from '@/constants/app';
import { initializeWallConfig } from '@/types/arenaConfigNew';

/**
 * Migrate old arena data to v2 schema
 * Ensures wall.edges exists for compatibility with new editor
 */
function migrateArenaToV2(arenaData: any): any {
  // If wall exists but doesn't have edges, initialize proper structure
  if (arenaData.wall && !arenaData.wall.edges) {
    arenaData.wall = initializeWallConfig(arenaData.shape || 'circle');
  }
  // If wall doesn't exist at all, initialize it
  if (!arenaData.wall) {
    arenaData.wall = initializeWallConfig(arenaData.shape || 'circle');
  }
  return arenaData;
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

    const arenaDoc = await db.collection(DATABASE_CONSTANTS.COLLECTIONS.ARENAS).doc(id).get();

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

    // Migrate to v2 schema if needed
    return NextResponse.json({
      success: true,
      data: migrateArenaToV2(arena),
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
    await verifyAdminSession(request);
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

    // Ensure wall has proper v2 structure if it's being updated
    if (updates.wall && !updates.wall.edges) {
      updates.wall = initializeWallConfig(updates.shape || arenaDoc.data()?.shape || 'circle');
    }

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
    await verifyAdminSession(request);
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
