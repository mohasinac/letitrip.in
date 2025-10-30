/**
 * API Route: Individual Arena - GET, PUT, DELETE
 */

import { createApiHandler, successResponse } from '@/lib/api';
import { arenaService } from '@/lib/database/arenaService';
import { ArenaConfig } from "@/types/arenaConfig";

export const GET = createApiHandler(async (request, { params }) => {
  const { id } = params;
  const arena = await arenaService.getArenaById(id);

  if (!arena) {
    throw new Error('Arena not found');
  }

  return successResponse(arena);
});

export const PUT = createApiHandler(async (request, { params }) => {
  const { id } = params;
  const updates: Partial<ArenaConfig> = await request.json();

  const updated = await arenaService.updateArena(id, updates);
  return successResponse(updated, "Arena updated successfully");
});

export const DELETE = createApiHandler(async (request, { params }) => {
  const { id } = params;
  await arenaService.deleteArena(id);
  return successResponse({ id }, "Arena deleted successfully");
});
