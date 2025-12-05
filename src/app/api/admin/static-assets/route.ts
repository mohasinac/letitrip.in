/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/static-assets/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import {
  listAssets,
  saveAssetMetadata,
} from "@/app/api/lib/static-assets-server.service";

// GET /admin/static-assets - List all static assets
/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(req);
 */

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
      /** Success */
      success: true,
      assets,
      /** Count */
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

// POST /admin/static-assets - Create asset metadata (legacy endpoint, use /upload-url + /confirm-upload instead)
/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

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
      /** Category */
      category: category || null,
      uploadedBy,
      /** Uploaded At */
      uploadedAt: new Date().toISOString(),
      /** Size */
      size: size || 0,
      /** Content Type */
      contentType: contentType || "application/octet-stream",
      /** Metadata */
      metadata: metadata || {},
    });

    return NextResponse.json({
      /** Success */
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
