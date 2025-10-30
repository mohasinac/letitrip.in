/**
 * API Route: Set arena as default
 */

import { createApiHandler, successResponse } from '@/lib/api';
import { arenaService } from '@/lib/database/arenaService';

export const POST = createApiHandler(async (request, { params }) => {
  const { id } = params;
  await arenaService.setDefaultArena(id);
  return successResponse({ id }, "Default arena updated successfully");
});
