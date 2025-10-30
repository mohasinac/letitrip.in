/**
 * API Route: Arenas - GET all arenas or POST new arena
 */

import { createApiHandler, successResponse } from '@/lib/api';
import { arenaService } from '@/lib/database/arenaService';
import { ArenaConfig } from "@/types/arenaConfig";

export const GET = createApiHandler(async (request) => {
  const arenas = await arenaService.getAllArenas();
  return successResponse(arenas);
});

export const POST = createApiHandler(async (request) => {
  const arena: Omit<ArenaConfig, 'id'> = await request.json();
  const newArena = await arenaService.createArena(arena);
  return successResponse(newArena, "Arena created successfully");
});
