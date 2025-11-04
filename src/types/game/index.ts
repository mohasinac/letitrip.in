/**
 * Game Types Reference
 * 
 * Game types are maintained in @/lib/game/types/
 * This file provides convenient re-exports for type imports
 * 
 * Import from either location:
 * - import { GameState } from '@/types/game';
 * - import { GameState } from '@/lib/game/types';
 * 
 * Both import paths resolve to the same types.
 */

// Re-export all game types from lib/game/types
export * from "../../lib/game/types";

// TODO: Create lib/game/types/index.ts to export all game types
// For now, types are in individual files:
// - lib/game/types/game.ts
// - lib/game/types/multiplayer.ts
