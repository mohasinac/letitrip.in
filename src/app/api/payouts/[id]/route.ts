/**
 * @fileoverview TypeScript Module
 * @module src/app/api/payouts/[id]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { requireAuth } from "@/app/api/middleware/rbac-auth";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * Individual Payout Operations
 * GET: Retrieve payout (owner/admin)
 * PATCH: Update payout (admin only for status changes, seller for details)
 * DELETE: Delete payout (admin only)
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request, {});
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(/** Request */
  request, {});
 */

export async function GET(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let id: string | undefined;
  try {
    const awaitedParams = await params;
    id = awaitedParams.id;

    const authResult = await requireAuth(request);
    if (authResult.error) return authResult.error;

    const { user } = authResult;

    // Fetch payout
    const payoutDoc = await Collections.payouts().doc(id).get();

    if (!payoutDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Payout not found" },
        { status: 404 },
      );
    }

    const payout: any = { id: payoutDoc.id, ...payoutDoc.data() };

    // Access control: seller can only see own payouts
    if (user.role === "seller" && payout.seller_id !== user.uid) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 },
      );
    }
    // Admin can see all

    return NextResponse.json({
      /** Success */
      success: true,
      payout,
    });
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "API.payouts.id.GET",
      /** Metadata */
      metadata: { payoutId: id },
    });
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to fetch payout",
      },
      { status: 500 },
    );
  }
}

/**
 * Function: P A T C H
 */
/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(request, {});
 */

/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(/** Request */
  request, {});
 */

export async function PATCH(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let id: string | undefined;
  let data: any;
  try {
    const awaitedParams = await params;
    id = awaitedParams.id;

    const authResult = await requireAuth(request);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const body = await request.json();
    data = body;

    // Fetch payout
    const payoutDoc = await Collections.payouts().doc(id).get();

    if (!payoutDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Payout not found" },
        { status: 404 },
      );
    }

    const payout: any = { id: payoutDoc.id, ...payoutDoc.data() };

    const isOwner = payout.seller_id === user.uid;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 },
      );
    }

    // Admin can update status and all fields
    // Seller can only update details on pending payouts
    const updates: Record<string, any> = {};

    if (isAdmin) {
      // Admin can update everything
      if ("status" in body) updates.status = body.status;
      if ("transaction_id" in body)
        updates.transaction_id = body.transaction_id;
      if ("processed_by" in body) updates.processed_by = body.processed_by;
      if ("failure_reason" in body)
        updates.failure_reason = body.failure_reason;
      if ("notes" in body) updates.notes = body.notes;
      if ("processed_at" in body) updates.processed_at = body.processed_at;
    } else if (isOwner && payout.status === "pending") {
      // Seller can only update payment details on pending payouts
      if ("payment_method" in body)
        updates.payment_method = body.payment_method;
      if ("bank_details" in body) updates.bank_details = body.bank_details;
      if ("upi_id" in body) updates.upi_id = body.upi_id;
      if ("notes" in body) updates.notes = body.notes;
    } else {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error:
            "Cannot update payout. Only pending payouts can be modified by seller.",
        },
        { status: 403 },
      );
    }

    updates.updated_at = new Date();

    await Collections.payouts().doc(id).update(updates);

    const updatedDoc = await Collections.payouts().doc(id).get();

    return NextResponse.json({
      /** Success */
      success: true,
      /** Payout */
      payout: { id: updatedDoc.id, ...updatedDoc.data() },
      /** Message */
      message: "Payout updated successfully",
    });
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "API.payouts.id.PATCH",
      /** Metadata */
      metadata: { payoutId: id, updates: data },
    });
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to update payout",
      },
      { status: 500 },
    );
  }
}

/**
 * Function: D E L E T E
 */
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(request, {});
 */

/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(/** Request */
  request, {});
 */

export async function DELETE(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let id: string | undefined;
  try {
    const awaitedParams = await params;
    id = awaitedParams.id;

    const authResult = await requireAuth(request);
    if (authResult.error) return authResult.error;

    const { user } = authResult;

    // Only admin can delete payouts
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Only admins can delete payouts" },
        { status: 403 },
      );
    }

    const payoutDoc = await Collections.payouts().doc(id).get();

    if (!payoutDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Payout not found" },
        { status: 404 },
      );
    }

    await Collections.payouts().doc(id).delete();

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "Payout deleted successfully",
    });
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "API.payouts.id.DELETE",
      /** Metadata */
      metadata: { payoutId: id },
    });
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to delete payout",
      },
      { status: 500 },
    );
  }
}
