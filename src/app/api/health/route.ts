import { createApiHandler, successResponse } from '@/lib/api';

/**
 * Health Check Endpoint
 * Refactored to use standardized API utilities
 * Path: /api/health
 */
export const GET = createApiHandler(async (request) => {
  return successResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'beyblade-battle',
    version: '1.0.0',
  });
});
