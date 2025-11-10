import { NextRequest, NextResponse } from "next/server";
import {
  listAssets,
  generateUploadUrl,
  saveAssetMetadata,
  getDownloadUrl,
} from "@/app/api/lib/static-assets-server.service";

// GET /api/admin/static-assets - List all static assets
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");

    const filters: any = {};
    if (type) filters.type = type;
    if (category) filters.category = category;

    const assets = await listAssets(filters);

    return NextResponse.json({
      success: true,
      assets,
      count: assets.length,
    });
  } catch (error) {
    console.error("Error fetching static assets:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assets" },
      { status: 500 },
    );
  }
}

// POST /api/admin/static-assets - Create asset metadata (legacy endpoint, use /upload-url + /confirm-upload instead)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      type,
      url,
      storagePath,
      category,
      uploadedBy,
      size,
      contentType,
      metadata,
    } = body;

    if (!id || !name || !type || !url || !storagePath) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const asset = await saveAssetMetadata({
      id,
      name,
      type,
      url,
      storagePath,
      category: category || null,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      size: size || 0,
      contentType: contentType || "application/octet-stream",
      metadata: metadata || {},
    });

    return NextResponse.json({
      success: true,
      asset,
    });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create asset" },
      { status: 500 },
    );
  }
}
