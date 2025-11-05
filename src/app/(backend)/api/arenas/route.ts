import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../_lib/database/admin';
import { verifyAdminSession } from '../_lib/auth/admin-auth';
import { Timestamp } from 'firebase-admin/firestore';
import { AuthorizationError, ValidationError } from '../_lib/middleware/error-handler';
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
 * GET /api/arenas
 * Get all arenas
 */
export async function GET(request: NextRequest) {
  try {
    // Anyone can view arenas (no auth required for GET)
    const db = getAdminDb();

    const arenaSnap = await db
      .collection(DATABASE_CONSTANTS.COLLECTIONS.ARENAS)
      .orderBy('createdAt', 'desc')
      .get();

    const arenas = arenaSnap.docs.map((doc: any) => {
      const arenaData = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate
          ? doc.data().createdAt.toDate().toISOString()
          : doc.data().createdAt,
      };
      // Migrate to v2 schema if needed
      return migrateArenaToV2(arenaData);
    });

    return NextResponse.json({
      success: true,
      data: arenas,
    });
  } catch (error: any) {
    console.error('Error fetching arenas:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch arenas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/arenas
 * Create new arena (admin only) - Now using v2 schema
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminSession(request);
    const db = getAdminDb();

    // Parse body (v2 schema)
    const body = await request.json();
    const {
      name,
      description,
      width,
      height,
      shape,
      theme,
      backgroundColor,
      floorColor,
      floorTexture,
      autoRotate,
      rotationSpeed,
      rotationDirection,
      wall,
      speedPaths = [],
      portals = [],
      waterBodies = [],
      pits = [],
      difficulty = 'medium',
    } = body;

    // Validate required fields (v2 schema)
    if (!name || !width || !height || !shape || !theme) {
      throw new ValidationError('Missing required fields: name, width, height, shape, theme');
    }

    // Ensure wall has proper v2 structure
    const wallConfig = wall && wall.edges 
      ? wall 
      : initializeWallConfig(shape);

    // Create arena document with v2 schema
    const arenaData: any = {
      name,
      description: description || '',
      width,
      height,
      shape,
      theme,
      autoRotate: autoRotate || false,
      rotationSpeed: rotationSpeed || 6,
      rotationDirection: rotationDirection || 'clockwise',
      wall: wallConfig,
      speedPaths,
      portals,
      waterBodies,
      pits,
      difficulty,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Add optional fields only if they're defined (Firestore doesn't accept undefined)
    if (backgroundColor !== undefined) arenaData.backgroundColor = backgroundColor;
    if (floorColor !== undefined) arenaData.floorColor = floorColor;
    if (floorTexture !== undefined) arenaData.floorTexture = floorTexture;

    const arenaRef = await db.collection('arenas').add(arenaData);
    const arenaSnap = await arenaRef.get();

    const newArena = {
      id: arenaRef.id,
      ...arenaSnap.data(),
      createdAt: arenaSnap.data()?.createdAt?.toDate
        ? arenaSnap.data()?.createdAt.toDate().toISOString()
        : arenaSnap.data()?.createdAt,
      updatedAt: arenaSnap.data()?.updatedAt?.toDate
        ? arenaSnap.data()?.updatedAt.toDate().toISOString()
        : arenaSnap.data()?.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: newArena,
      message: 'Arena created successfully',
    });
  } catch (error: any) {
    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error creating arena:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create arena' },
      { status: 500 }
    );
  }
}
