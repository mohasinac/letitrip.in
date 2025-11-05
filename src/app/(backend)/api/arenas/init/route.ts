import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../_lib/database/admin';
import { Timestamp } from 'firebase-admin/firestore';

// Default arena configuration for initialization
const DEFAULT_ARENA = {
  name: 'Classic Stadium',
  description: 'The standard battle arena - perfect for beginners and competitive play',
  width: 50,
  height: 50,
  shape: 'circle',
  theme: 'metrocity',
  gameMode: 'player-vs-ai',
  aiDifficulty: 'medium',
  loops: [
    {
      radius: 15,
      shape: 'circle',
      speedBoost: 1.2,
      spinBoost: 2,
      frictionMultiplier: 0.9,
      color: '#3b82f6',
    },
    {
      radius: 20,
      shape: 'circle',
      speedBoost: 1.0,
      frictionMultiplier: 1.0,
      color: '#10b981',
    },
  ],
  exits: [],
  wall: {
    enabled: true,
    baseDamage: 5,
    recoilDistance: 2,
    hasSpikes: false,
    spikeDamageMultiplier: 1.0,
    hasSprings: false,
    springRecoilMultiplier: 1.0,
    thickness: 0.5,
  },
  obstacles: [],
  pits: [],
  laserGuns: [],
  goalObjects: [],
  requireAllGoalsDestroyed: false,
  backgroundLayers: [],
  gravity: 0,
  airResistance: 0.01,
  surfaceFriction: 0.02,
  difficulty: 'easy',
};

/**
 * POST /api/arenas/init
 * Initialize default arena (public access for setup)
 */
export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();

    // Check if already exists
    const existingSnap = await db
      .collection('arenas')
      .where('name', '==', 'Classic Stadium')
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      const doc = existingSnap.docs[0];
      return NextResponse.json({
        success: true,
        data: {
          id: doc.id,
          ...doc.data(),
        },
        message: 'Default arena already exists',
      });
    }

    // Create new default arena
    const arenaData = {
      ...DEFAULT_ARENA,
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
      message: 'Default arena created successfully',
    });
  } catch (error: any) {
    console.error('Error initializing default arena:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize default arena' },
      { status: 500 }
    );
  }
}
