import { NextRequest, NextResponse } from 'next/server';
import {
  listAssets,
  updateAssetMetadata,
  deleteAsset,
} from '@/app/api/lib/static-assets-server.service';

// GET /api/admin/static-assets/[id] - Get single asset
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // List with no filters to get all, then find by id
    const assets = await listAssets({});
    const asset = assets.find((a) => a.id === id);

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      asset,
    });
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/static-assets/[id] - Update asset metadata
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updates: any = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.category !== undefined) updates.category = body.category;
    if (body.metadata !== undefined) updates.metadata = body.metadata;

    const asset = await updateAssetMetadata(id, updates);

    return NextResponse.json({
      success: true,
      asset,
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update asset' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/static-assets/[id] - Delete asset
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await deleteAsset(id);

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
