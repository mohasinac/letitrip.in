/**
 * Admin Single Order API Route
 *
 * GET /api/admin/orders/[id] - Get order details
 * PATCH /api/admin/orders/[id] - Update order
 * DELETE /api/admin/orders/[id] - Delete order
 */

import { NextRequest, NextResponse } from "next/server";
import { orderRepository } from "@/repositories";
import { requireAuth, requireRole } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants/messages";
import type { OrderStatus, PaymentStatus } from "@/db/schema/orders";

/**
 * GET /api/admin/orders/[id]
 * Get order details (admin/moderator only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    await requireRole(["admin", "moderator"]);

    const { id } = await params;
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError(ERROR_MESSAGES.GENERIC.NOT_FOUND);
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Update order status or details (admin/moderator only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    await requireRole(["admin", "moderator"]);

    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, ...otherData } = body;

    // Validate status if provided
    if (
      status &&
      ![
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ].includes(status)
    ) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_INPUT);
    }

    if (
      paymentStatus &&
      !["pending", "paid", "failed", "refunded"].includes(paymentStatus)
    ) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.INVALID_INPUT);
    }

    // Check if order exists
    const existing = await orderRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(ERROR_MESSAGES.GENERIC.NOT_FOUND);
    }

    // Update order
    const updated = await orderRepository.update(id, {
      ...(status && { status: status as OrderStatus }),
      ...(paymentStatus && { paymentStatus: paymentStatus as PaymentStatus }),
      ...otherData,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/orders/[id]
 * Delete order (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    await requireRole(["admin"]); // Only admin can delete

    const { id } = await params;
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError(ERROR_MESSAGES.GENERIC.NOT_FOUND);
    }

    await orderRepository.delete(id);

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
