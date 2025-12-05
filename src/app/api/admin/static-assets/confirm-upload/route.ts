/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/static-assets/confirm-upload/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import {
  saveAssetMetadata,
  getDownloadUrl,
} from "@/app/api/lib/static-assets-server.service";

// POST /admin/static-assets/confirm-upload - Confirm upload completion
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
      assetId,
      name,
      type,
      storagePath,
      category,
      uploadedBy,
      size,
      contentType,
      metadata,
    } = body;

    if (!assetId || !name || !type || !storagePath) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get public CDN URL
    const url = await getDownloadUrl(storagePath);

    // Save metadata to Firestore
    const assetData = {
      /** Id */
      id: assetId,
      name,
      /** Type */
      type: type as "payment-logo" | "icon" | "image" | "video" | "document",
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
    };

    const asset = await saveAssetMetadata(assetData);

    return NextResponse.json({
      /** Success */
      success: true,
      asset,
    });
  } catch (error) {
    console.error("Error confirming upload:", error);
    return NextResponse.json(
      { success: false, error: "Failed to confirm upload" },
      { status: 500 },
    );
  }
}
