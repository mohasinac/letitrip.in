import { NextRequest, NextResponse } from "next/server";
import { createUserHandler } from "@/lib/auth/api-middleware";
import { FirebaseService } from "@/lib/firebase/services";

async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get user from auth middleware
    const user = (request as any).user;
    const firebaseService = FirebaseService.getInstance();

    try {
      // Validate product exists and has stock
      const product = await firebaseService.getProductById(productId);
      
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      if (product.quantity < quantity) {
        return NextResponse.json(
          { error: "Insufficient stock" },
          { status: 400 }
        );
      }

      // Add to cart using Firebase
      const cartItem = await firebaseService.addToCart(user.userId, productId, quantity);
      
      if (!cartItem) {
        throw new Error("Failed to add to cart");
      }

      // Get updated cart items
      const cartItems = await firebaseService.getCartItems(user.userId);
      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const itemProduct = await firebaseService.getProductById(item.productId);
          return {
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: itemProduct?.price || 0,
            name: itemProduct?.name || "Unknown Product",
            image: itemProduct?.images[0]?.url || "/images/placeholder.jpg"
          };
        })
      );

      const subtotal = cartWithProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const cart = {
        id: `cart_${user.userId}`,
        userId: user.userId,
        items: cartWithProducts,
        subtotal,
        total: subtotal,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: cart,
        message: "Item added to cart successfully"
      });

    } catch (firebaseError) {
      console.error("Firebase cart error:", firebaseError);
      return NextResponse.json(
        { error: "Failed to add item to cart" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

export const POST = createUserHandler(handler);
