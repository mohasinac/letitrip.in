/**
 * API Route: Get specific Beyblade stats by ID
 * GET /api/beyblades/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { beybladeStatsService } from '@/lib/database/beybladeStatsService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const beyblade = await beybladeStatsService.getBeybladeStats(id);

    if (!beyblade) {
      return NextResponse.json(
        {
          success: false,
          error: 'Beyblade not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: beyblade,
    });
  } catch (error) {
    console.error('Error fetching Beyblade:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Beyblade',
      },
      { status: 500 }
    );
  }
}
