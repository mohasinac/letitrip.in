/**
 * @fileoverview TypeScript Module
 * @module src/app/api/returns/[id]/resolve/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "@/app/api/lib/session";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req, {});
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} /** Req */
  req - The /**  req */
  req
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(/** Req */
  req, {});
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 * @param {{ params: Promise<{ id: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The post result
 *
 * @example
 * POST(req, {});
 */
export async function POST(
  /** Req */
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let id: string | undefined;
  try {
    const user = await getCurrentUser(req);
    if (!user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    const role = user.role;
    if (role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const awaitedParams = await params;
    id = awaitedParams.id;
    const ref = Collections.returns().doc(id);
    const snap = await ref.get();
    if (!snap.exists)
      return NextResponse.json(
        { success: false, error: "Not found" },
        { status: 404 },
      );

    const { resolution, refundAmount, notes } = await req.json();
    const payload: any = {
      /** Status */
      status: "resolved",
      /** Resolution */
      resolution: resolution || "resolved",
      admin_notes: notes || "",
      updated_at: new Date().toISOString(),
    };
    if (typeof refundAmount === "number" && refundAmount > 0) {
      payload.refund = {
        refund_amount: refundAmount,
        refund_method: "admin_adjustment",
        processed_at: new Date().toISOString(),
        processed_by: user.id,
      };
    }

    await ref.update(payload);
    const updated = await ref.get();
    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: { id: updated.id, ...updated.data() },
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.returns.resolve",
      /** Metadata */
      metadata: { returnId: id },
    });
    return NextResponse.json(
      { success: false, error: "Failed to resolve return" },
      { status: 500 },
    );
  }
}
