import * as admin from "firebase-admin";

// Initialize Firebase Admin (if not already initialized)
let db: admin.firestore.Firestore | null = null;

if (!admin.apps.length) {
  // Use environment variables for Firebase Admin credentials
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('⚠️  Firebase Admin credentials not found in environment variables.');
    console.warn('   Server will run but cannot access Firestore.');
    console.warn('   Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY');
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      db = admin.firestore();
      console.log('✅ Firebase Admin initialized');
    } catch (error) {
      console.error('❌ Firebase Admin initialization failed:', error);
    }
  }
}

/**
 * Beyblade stats interface
 */
export interface BeybladeStats {
  id: string;
  displayName: string;
  fileName: string;
  type: "attack" | "defense" | "stamina" | "balanced";
  spinDirection: "left" | "right";
  mass: number;
  radius: number;
  actualSize: number;
  typeDistribution: {
    attack: number;
    defense: number;
    stamina: number;
    total: number;
  };
  pointsOfContact: Array<{
    angle: number;
    damageMultiplier: number;
    width: number;
  }>;
}

/**
 * Arena interface
 */
export interface Arena {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  shape: "circle" | "square" | "hexagon" | "octagon";
  theme: string;
  gameMode: "player-vs-ai" | "player-vs-player" | "tournament";
  gravity: number;
  airResistance: number;
  surfaceFriction: number;
  difficulty: "easy" | "medium" | "hard" | "expert";
}

/**
 * Load beyblade data from Firestore
 */
export async function loadBeyblade(beybladeId: string): Promise<BeybladeStats | null> {
  if (!db) {
    console.error('Firebase not initialized');
    return null;
  }

  try {
    const doc = await db.collection("beybladeStats").doc(beybladeId).get();

    if (!doc.exists) {
      console.error(`Beyblade not found: ${beybladeId}`);
      return null;
    }

    return doc.data() as BeybladeStats;
  } catch (error) {
    console.error("Error loading beyblade:", error);
    return null;
  }
}

/**
 * Load arena data from Firestore
 */
export async function loadArena(arenaId: string): Promise<Arena | null> {
  if (!db) {
    console.error('Firebase not initialized');
    return null;
  }

  try {
    const doc = await db.collection("arenas").doc(arenaId).get();

    if (!doc.exists) {
      console.error(`Arena not found: ${arenaId}`);
      return null;
    }

    return doc.data() as Arena;
  } catch (error) {
    console.error("Error loading arena:", error);
    return null;
  }
}

/**
 * Save match result to Firestore
 */
export async function saveMatch(matchData: any): Promise<string | null> {
  if (!db) {
    console.error('Firebase not initialized');
    return null;
  }

  try {
    const docRef = await db.collection("matches").add({
      ...matchData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Match saved: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error("Error saving match:", error);
    return null;
  }
}

/**
 * Update player stats
 */
export async function updatePlayerStats(
  userId: string,
  updates: Partial<any>
): Promise<boolean> {
  if (!db) {
    console.error('Firebase not initialized');
    return false;
  }

  try {
    const docRef = db.collection("player_stats").doc(userId);
    await docRef.set(updates, { merge: true });

    console.log(`Player stats updated: ${userId}`);
    return true;
  } catch (error) {
    console.error("Error updating player stats:", error);
    return false;
  }
}

export { db };
