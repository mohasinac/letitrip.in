/**
 * Admin Orders API Route
 *
 * GET /api/admin/orders - List all orders
 */

import { NextRequest, NextResponse } from "next/server";
import { orderRepository } from "@/repositories";
import { requireAuth, requireRole } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors";
import type { OrderStatus } from "@/db/schema/orders";

/**
 * GET /api/admin/orders
 * List all orders with optional filtering (admin/moderator only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication and role
    const user = await requireAuth();
    await requireRole(["admin", "moderator"]);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as OrderStatus | null;
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");

    // Fetch orders based on filters
    let orders;
    if (status) {
      orders = await orderRepository.findByStatus(status);
    } else if (userId) {
      orders = await orderRepository.findByUser(userId);
    } else if (productId) {
      orders = await orderRepository.findByProduct(productId);
    } else {
      orders = await orderRepository.findAll();
    }

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
