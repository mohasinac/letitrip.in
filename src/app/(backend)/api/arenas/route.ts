import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../_lib/database/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { AuthorizationError, ValidationError } from '../_lib/middleware/error-handler';

/**
 * Helper function to verify authentication
 */
async function verifyAuth(request: NextRequest, requireAdmin: boolean = false) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthorizationError('Authentication required');
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || 'user';

    if (requireAdmin && role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    return {
      uid: decodedToken.uid,
      role: role as 'admin' | 'seller' | 'user',
      email: decodedToken.email,
    };
  } catch (error: any) {
    throw new AuthorizationError('Invalid or expired token');
  }
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
      .collection('arenas')
      .orderBy('createdAt', 'desc')
      .get();

    const arenas = arenaSnap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate
        ? doc.data().createdAt.toDate().toISOString()
        : doc.data().createdAt,
    }));

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
 * Create new arena (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAuth(request, true);
    const db = getAdminDb();

    // Parse body
    const body = await request.json();
    const {
      name,
      description,
      width,
      height,
      shape,
      theme,
      gameMode,
      aiDifficulty,
      loops = [],
      exits = [],
      wall,
      obstacles = [],
      pits = [],
      laserGuns = [],
      goalObjects = [],
      requireAllGoalsDestroyed = false,
      backgroundLayers = [],
      gravity = 0,
      airResistance = 0.01,
      surfaceFriction = 0.02,
      difficulty = 'medium',
    } = body;

    // Validate required fields
    if (!name || !description || !width || !height || !shape) {
      throw new ValidationError('Missing required fields: name, description, width, height, shape');
    }

    // Create arena document
    const arenaData = {
      name,
      description,
      width,
      height,
      shape,
      theme: theme || 'metrocity',
      gameMode: gameMode || 'player-vs-ai',
      aiDifficulty: aiDifficulty || 'medium',
      loops,
      exits,
      wall: wall || {
        enabled: true,
        baseDamage: 5,
        recoilDistance: 2,
        hasSpikes: false,
        spikeDamageMultiplier: 1.0,
        hasSprings: false,
        springRecoilMultiplier: 1.0,
        thickness: 0.5,
      },
      obstacles,
      pits,
      laserGuns,
      goalObjects,
      requireAllGoalsDestroyed,
      backgroundLayers,
      gravity,
      airResistance,
      surfaceFriction,
      difficulty,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

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
