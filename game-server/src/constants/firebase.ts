/**
 * Firebase Collection and Bucket Names
 * Centralized constants for all Firebase references
 */

export const FIREBASE_COLLECTIONS = {
  BEYBLADE_STATS: "beyblade_stats",
  ARENAS: "arenas",
  MATCHES: "matches",
  PLAYER_STATS: "player_stats",
} as const;

export const FIREBASE_BUCKETS = {
  BEYBLADES: "beyblades",
  ARENAS: "arenas",
  AVATARS: "avatars",
  GENERAL: "general",
} as const;

// Type exports for TypeScript
export type FirebaseCollection = typeof FIREBASE_COLLECTIONS[keyof typeof FIREBASE_COLLECTIONS];
export type FirebaseBucket = typeof FIREBASE_BUCKETS[keyof typeof FIREBASE_BUCKETS];
