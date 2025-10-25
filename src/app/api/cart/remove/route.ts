import { NextRequest, NextResponse } from "next/server";
import { createUserHandler } from "@/lib/auth/api-middleware";
import { FirebaseService } from "@/lib/database/services";

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
    const firebaseService = FirebaseService.getInstance();

    try {
      // Remove item from cart
      const success = await firebaseService.removeCartItem(itemId);
      
      if (!success) {
        return NextResponse.json(
          { error: "Failed to remove item from cart" },
          { status: 500 }
        );
      }

      // Get updated cart
      const cartItems = await firebaseService.getCartItems(user.userId);
      
      // Enrich with product details
      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await firebaseService.getProductById(item.productId);
          return {
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product?.price || 0,
            name: product?.name || "Unknown Product",
            image: product?.images?.[0]?.url || "/images/placeholder.jpg"
          };
        })
      );

      const subtotal = cartWithProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const updatedCart = {
        id: `cart_${user.userId}`,
        userId: user.userId,
        items: cartWithProducts,
        subtotal,
        total: subtotal,
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: updatedCart,
        message: "Item removed from cart successfully"
      });
    } catch (firebaseError) {
      console.error("Firebase remove cart item error:", firebaseError);
      return NextResponse.json(
        { error: "Failed to remove item from cart" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Remove from cart error:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}

export const DELETE = createUserHandler(handler);
