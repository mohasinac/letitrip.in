/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/static-assets/[id]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import {
  listAssets,
  updateAssetMetadata,
  deleteAsset,
} from "@/app/api/lib/static-assets-server.service";

// GET /admin/static-assets/[id] - Get single asset
/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} _req - The _req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(_req, {});
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} _req - The _req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(_req, {});
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // List with no filters to get all, then find by id
    const assets = await listAssets({});
    const asset = assets.find((a) => a.id === id);

    if (!asset) {
      return NextResponse.json(
        { success: false, error: "Asset not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      /** Success */
      success: true,
      asset,
    });
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch asset" },
      { status: 500 },
    );
  }
}

// PATCH /admin/static-assets/[id] - Update asset metadata
/**
 * Function: P A T C H
 */
/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} req - The req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(req, {});
 */

/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} /** Req */
  req - The /**  req */
  req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(/** Req */
  req, {});
 */

export async function PATCH(
  /** Req */
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
      /** Success */
      success: true,
      asset,
    });
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update asset" },
      { status: 500 },
    );
  }
}

// DELETE /admin/static-assets/[id] - Delete asset
/**
 * Function: D E L E T E
 */
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} _req - The _req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(_req, {});
 */

/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} _req - The _req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(_req, {});
 */

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await deleteAsset(id);

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Asset deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete asset" },
      { status: 500 },
    );
  }
}
