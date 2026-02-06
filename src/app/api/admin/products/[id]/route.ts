/**
 * Admin Single Product API Route
 *
 * GET /api/admin/products/[id] - Get product by ID
 * PATCH /api/admin/products/[id] - Update product
 * DELETE /api/admin/products/[id] - Delete product
 */

import { NextRequest, NextResponse } from "next/server";
import { productRepository, orderRepository } from "@/repositories";
import { requireAuth, requireRole } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors";
import { NotFoundError } from "@/lib/errors/not-found-error";
import { ERROR_MESSAGES } from "@/constants/messages";
import type { ProductUpdateInput } from "@/db/schema/products";

/**
 * GET /api/admin/products/[id]
 * Get product details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    await requireRole(["admin", "moderator", "seller"]);

    const { id } = await params;
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/admin/products/[id]
 * Update product
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();

    const { id } = await params;
    // Check product exists
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Check permissions (admin or product owner)
    if (user.role !== "admin" && product.sellerId !== user.uid) {
      return NextResponse.json(
        {
          success: false,
          error: ERROR_MESSAGES.USER.INSUFFICIENT_ROLE_PERMISSION,
        },
        { status: 403 },
      );
    }

    // Parse update data
    const body = await request.json();
    const updateData: ProductUpdateInput = {};

    // Only allow updating specific fields
    const allowedFields = [
      "title",
      "description",
      "category",
      "subcategory",
      "brand",
      "price",
      "stockQuantity",
      "images",
      "status",
      "tags",
      "specifications",
      "features",
      "shippingInfo",
      "returnPolicy",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field as keyof ProductUpdateInput] = body[field];
      }
    });

    // Update product
    const updatedProduct = await productRepository.updateProduct(
      id,
      updateData,
    );

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Delete product
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();

    const { id } = await params;
    // Check product exists
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Only admin or product owner can delete
    if (user.role !== "admin" && product.sellerId !== user.uid) {
      return NextResponse.json(
        {
          success: false,
          error: ERROR_MESSAGES.USER.INSUFFICIENT_ROLE_PERMISSION,
        },
        { status: 403 },
      );
    }

    // Cancel all pending orders
    const orders = await orderRepository.findByProduct(id);
    for (const order of orders) {
      if (order.status === "pending" || order.status === "confirmed") {
        await orderRepository.cancelOrder(
          order.id,
          "Product has been discontinued by the seller",
        );
      }
    }

    // Delete product
    await productRepository.delete(id);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
