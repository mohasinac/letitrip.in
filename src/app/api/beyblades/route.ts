/**
 * API Route: Get all Beyblade stats
 * GET /api/beyblades
 * REFACTORED: Uses standardized API utilities
 */

import { createApiHandler, successResponse } from '@/lib/api';
import { beybladeStatsService } from '@/lib/database/beybladeStatsService';

export const GET = createApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const search = searchParams.get('search');

  let beyblades;

  if (search) {
    beyblades = await beybladeStatsService.searchBeybladesByName(search);
  } else if (type && ['attack', 'defense', 'stamina', 'balanced'].includes(type)) {
    beyblades = await beybladeStatsService.getBeybladesByType(type as any);
  } else {
    beyblades = await beybladeStatsService.getAllBeybladeStats();
  }

  return successResponse(beyblades);
});
