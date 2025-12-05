/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/static-assets/upload-url/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { generateUploadUrl } from "@/app/api/lib/static-assets-server.service";

// POST /admin/static-assets/upload-url - Request signed upload URL
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
    const { fileName, contentType, type, category } = body;

    if (!fileName || !contentType || !type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { uploadUrl, assetId, storagePath } = await generateUploadUrl(
      fileName,
      contentType,
      type,
      category,
    );

    return NextResponse.json({
      /** Success */
      success: true,
      uploadUrl,
      assetId,
      storagePath,
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate upload URL" },
      { status: 500 },
    );
  }
}
