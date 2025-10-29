import { NextRequest, NextResponse } from 'next/server';

// Health check endpoint for monitoring services
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'beyblade-battle',
    version: '1.0.0',
  });
}
