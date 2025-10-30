/**
 * API Route: Initialize default arena
 */

import { createApiHandler, successResponse } from '@/lib/api';
import { arenaService } from '@/lib/database/arenaService';
import { ArenaConfig } from "@/types/arenaConfig";

const DEFAULT_ARENA: Omit<ArenaConfig, 'id'> = {
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
  
  difficulty: 'easy', // Mark as default
};

export const POST = createApiHandler(async (request) => {
  // Check if already exists
  const existing = await arenaService.getArenaById('classic_stadium');
  
  if (existing) {
    return successResponse(existing, "Default arena already exists");
  }
  
  // Create new default arena
  const arena = await arenaService.createArena(DEFAULT_ARENA);
  return successResponse(arena, "Default arena created successfully");
});
