/**
 * API Route: Get all Beyblade stats
 * GET /api/beyblades
 */

import { NextRequest, NextResponse } from 'next/server';
import { beybladeStatsService } from '@/lib/database/beybladeStatsService';

export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json({
      success: true,
      data: beyblades,
    });
  } catch (error) {
    console.error('Error fetching Beyblades:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Beyblades',
      },
      { status: 500 }
    );
  }
}
