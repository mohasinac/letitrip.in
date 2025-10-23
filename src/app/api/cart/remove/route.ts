import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";

async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const user = (request as any).user;

    // Mock remove item logic - replace with database operations
    const updatedCart = {
      id: `cart_${user.id}`,
      userId: user.id,
      items: [], // Item removed
      subtotal: 0,
      total: 0,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: updatedCart,
      message: "Item removed from cart successfully"
    });

  } catch (error) {
    console.error("Remove from cart error:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}

export const DELETE = withAuth(handler);
