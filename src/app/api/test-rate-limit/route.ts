/**
 * Test Rate Limit API
 * Simple endpoint to test rate limiting behavior
 */

import { NextRequest } from 'next/server';
import { ApiResponse, withRateLimit } from '@/lib/auth/middleware';

/**
 * Test rate limiting
 * GET /api/test-rate-limit
 */
export const GET = withRateLimit(async (request: NextRequest) => {
  return ApiResponse.success({
    message: 'Rate limit test passed',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});
