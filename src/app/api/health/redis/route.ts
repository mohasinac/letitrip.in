import { NextResponse } from 'next/server';
import { checkRedisHealth } from '@/app/api/lib/rate-limiter-redis';

/**
 * Redis health check endpoint
 * GET /api/health/redis
 */
export async function GET() {
  try {
    const health = await checkRedisHealth();
    
    if (health.connected) {
      return NextResponse.json({
        status: 'healthy',
        redis: 'connected',
        latency: health.latency,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          status: 'degraded',
          redis: 'disconnected',
          error: health.error,
          fallback: 'using in-memory rate limiter',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
