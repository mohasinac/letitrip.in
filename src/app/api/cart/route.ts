import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";

async function getHandler(request: NextRequest) {
  try {
    const user = (request as any).user;

    // Mock cart data - replace with database query
    const mockCart = {
      id: `cart_${user.id}`,
      userId: user.id,
      items: [
        {
          id: "1",
          productId: "prod_1",
          quantity: 1,
          price: 2999,
          name: "Premium Beyblade Stadium",
          image: "/images/product-1.jpg",
          slug: "premium-stadium"
        },
        {
          id: "2", 
          productId: "prod_2",
          quantity: 2,
          price: 1499,
          name: "Metal Fusion Set",
          image: "/images/product-2.jpg",
          slug: "metal-fusion-set"
        }
      ],
      subtotal: 5997,
      shipping: 0,
      tax: 1079,
      total: 7076,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: mockCart
    });

  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { error: "Failed to get cart" },
      { status: 500 }
    );
  }
}

async function putHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || quantity < 0) {
      return NextResponse.json(
        { error: "Invalid item ID or quantity" },
        { status: 400 }
      );
    }

    const user = (request as any).user;

    // Mock update logic - replace with database operations
    const updatedCart = {
      id: `cart_${user.id}`,
      userId: user.id,
      items: [
        {
          id: itemId,
          productId: "prod_1",
          quantity,
          price: 2999,
          name: "Premium Beyblade Stadium",
          image: "/images/product-1.jpg"
        }
      ],
      subtotal: 2999 * quantity,
      total: 2999 * quantity,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: updatedCart,
      message: "Cart updated successfully"
    });

  } catch (error) {
    console.error("Update cart error:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

async function deleteHandler(request: NextRequest) {
  try {
    const user = (request as any).user;
    
    // Mock clear cart logic - replace with database operations
    const emptyCart = {
      id: `cart_${user.id}`,
      userId: user.id,
      items: [],
      subtotal: 0,
      total: 0,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: emptyCart,
      message: "Cart cleared successfully"
    });

  } catch (error) {
    console.error("Clear cart error:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}

async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const user = (request as any).user;

    // Mock add to cart logic - replace with database operations
    const cartItem = {
      id: `item_${productId}_${Date.now()}`,
      productId,
      quantity,
      price: 1499, // This would come from product lookup
      name: "Product Name", // This would come from product lookup
      image: "/images/product-placeholder.jpg",
      addedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: cartItem,
      message: "Item added to cart successfully"
    });

  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);
