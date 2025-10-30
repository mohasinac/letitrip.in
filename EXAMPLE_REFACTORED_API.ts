/**
 * Example Refactored API Route
 * Beyblades API with new utilities
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiHandler, methodHandler } from '@/lib/api/middleware';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api/response';
import { parseQueryParams, commonSchemas } from '@/lib/api/validation';
import { beybladeStatsService } from '@/lib/database/beybladeStatsService';

/**
 * Query parameters schema
 */
const beybladeQuerySchema = z.object({
  type: z.enum(['attack', 'defense', 'stamina', 'balanced']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

/**
 * GET /api/beyblades
 * Fetch beyblades with optional filtering and pagination
 */
async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const params = parseQueryParams(request.url, beybladeQuerySchema);
    
    let beyblades;
    
    // Search by name
    if (params.search) {
      beyblades = await beybladeStatsService.searchBeybladesByName(params.search);
    }
    // Filter by type
    else if (params.type) {
      beyblades = await beybladeStatsService.getBeybladesByType(params.type);
    }
    // Get all
    else {
      beyblades = await beybladeStatsService.getAllBeybladeStats();
    }
    
    // Apply pagination
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedBeyblades = beyblades.slice(startIndex, endIndex);
    
    return successResponse(
      {
        items: paginatedBeyblades,
        pagination: {
          page: params.page,
          limit: params.limit,
          total: beyblades.length,
          totalPages: Math.ceil(beyblades.length / params.limit),
        },
      },
      'Beyblades fetched successfully',
      200,
      request
    );
  } catch (error) {
    console.error('Error fetching Beyblades:', error);
    return errorResponse(
      'Failed to fetch Beyblades',
      500,
      undefined,
      request
    );
  }
}

/**
 * Export handlers with middleware
 */
export const GET_HANDLER = createApiHandler(GET);
