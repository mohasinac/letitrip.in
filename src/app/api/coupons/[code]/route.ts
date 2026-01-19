/**
 * Coupon Management API Route
 * 
 * Handles updating coupon details by code.
 * 
 * @route PUT /api/coupons/[code] - Update coupon (Admin/Seller)
 * @route DELETE /api/coupons/[code] - Delete/disable coupon
 * 
 * @example
 * ```tsx
 * // Update coupon
 * const response = await fetch('/api/coupons/SAVE20', {
 *   method: 'PUT',
 *   body: JSON.stringify({
 *     status: 'disabled',
 *     usageLimit: 1000,
 *     ...
 *   })
 * });
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

interface RouteContext {
  params: Promise<{
    code: string;
  }>;
}

interface UpdateCouponRequest {
  status?: "active" | "disabled" | "expired";
  usageLimit?: number;
  userLimit?: number;
  validUntil?: string;
  description?: string;
  minOrderValue?: number;
  maxDiscount?: number;
}

/**
 * PUT /api/coupons/[code]
 * 
 * Update coupon details (Admin/Seller).
 * 
 * Request Body:
 * - status: Coupon status (active/disabled/expired)
 * - usageLimit: Total usage limit
 * - userLimit: Per-user usage limit
 * - validUntil: End date (ISO string)
 * - description: Coupon description
 * - minOrderValue: Minimum order value
 * - maxDiscount: Maximum discount amount
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { code } = await params;
    const body: UpdateCouponRequest = await request.json();

    // Normalize code
    const normalizedCode = code.toUpperCase();

    // Query coupon by code
    const couponQuery = query(
      collection(db, "coupons"),
      where("code", "==", normalizedCode)
    );

    const querySnapshot = await getDocs(couponQuery);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const couponDoc = querySnapshot.docs[0];

    // Build update object
    const updates: any = {
      updatedAt: serverTimestamp(),
    };

    if (body.status) updates.status = body.status;
    if (body.usageLimit !== undefined) updates.usageLimit = body.usageLimit;
    if (body.userLimit !== undefined) updates.userLimit = body.userLimit;
    if (body.description !== undefined) updates.description = body.description;
    if (body.minOrderValue !== undefined)
      updates.minOrderValue = body.minOrderValue;
    if (body.maxDiscount !== undefined) updates.maxDiscount = body.maxDiscount;

    if (body.validUntil) {
      updates.validUntil = Timestamp.fromDate(new Date(body.validUntil));
    }

    // Update coupon
    await updateDoc(couponDoc.ref, updates);

    // Get updated data
    const updatedSnapshot = await getDocs(couponQuery);
    const updatedData = {
      id: updatedSnapshot.docs[0].id,
      ...updatedSnapshot.docs[0].data(),
    };

    return NextResponse.json(
      {
        success: true,
        data: updatedData,
        message: "Coupon updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating coupon:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to update coupon" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update coupon", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/coupons/[code]
 * 
 * Delete coupon by code (Admin/Seller).
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { code } = await params;

    // Normalize code
    const normalizedCode = code.toUpperCase();

    // Query coupon by code
    const couponQuery = query(
      collection(db, "coupons"),
      where("code", "==", normalizedCode)
    );

    const querySnapshot = await getDocs(couponQuery);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const couponDoc = querySnapshot.docs[0];

    // Delete coupon
    await deleteDoc(couponDoc.ref);

    return NextResponse.json(
      {
        success: true,
        message: "Coupon deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting coupon:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to delete coupon" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete coupon", details: error.message },
      { status: 500 }
    );
  }
}
