/**
 * API Route: Get specific Beyblade stats by ID
 * GET /api/beyblades/[id]
 * PUT /api/beyblades/[id]
 * DELETE /api/beyblades/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { beybladeStatsService } from '@/lib/database/beybladeStatsService';
import { BeybladeStats } from '@/types/beybladeStats';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.text();

    // Check if body is empty
    if (!body || body.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Request body is empty',
        },
        { status: 400 }
      );
    }

    let beybladeData: Partial<BeybladeStats>;

    try {
      beybladeData = JSON.parse(body);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    // Get existing beyblade
    const existingBeyblade = await beybladeStatsService.getBeybladeStats(id);

    if (!existingBeyblade) {
      return NextResponse.json(
        {
          success: false,
          error: 'Beyblade not found',
        },
        { status: 404 }
      );
    }

    // Merge with existing data
    const updatedBeyblade: BeybladeStats = {
      ...existingBeyblade,
      ...beybladeData,
      id, // Ensure ID doesn't change
    };

    // Save to database
    await beybladeStatsService.saveBeybladeStats(updatedBeyblade, 'admin');

    return NextResponse.json({
      success: true,
      data: updatedBeyblade,
    });
  } catch (error) {
    console.error('Error updating Beyblade:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update Beyblade',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if beyblade exists
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

    // Delete from database
    await beybladeStatsService.deleteBeybladeStats(id);

    return NextResponse.json({
      success: true,
      message: 'Beyblade deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting Beyblade:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete Beyblade',
      },
      { status: 500 }
    );
  }
}
