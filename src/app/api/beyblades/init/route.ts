/**
 * API Route: Initialize default Beyblade stats in database
 * POST /api/beyblades/init
 */

import { NextRequest, NextResponse } from 'next/server';
import { beybladeStatsService } from '@/lib/database/beybladeStatsService';

export async function POST(request: NextRequest) {
  try {
    await beybladeStatsService.initializeDefaultBeyblades();

    return NextResponse.json({
      success: true,
      message: 'Default Beyblade stats initialized successfully',
    });
  } catch (error) {
    console.error('Error initializing Beyblades:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize Beyblades',
      },
      { status: 500 }
    );
  }
}
