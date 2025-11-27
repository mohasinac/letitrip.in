import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../lib/session";

// GET /api/cart - Get user cart with summary
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const startAfter = searchParams.get("startAfter");
    const limit = parseInt(searchParams.get("limit") || "100");

    // Get cart items with cursor pagination
    let query = Collections.cart()
      .where("user_id", "==", user.id)
      .orderBy("added_at", "desc");

    // Apply cursor pagination
    if (startAfter) {
      const startDoc = await Collections.cart().doc(startAfter).get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    // Fetch limit + 1 to check if there's a next page
    query = query.limit(limit + 1);
    const cartSnapshot = await query.get();
    const docs = cartSnapshot.docs;

    // Check if there's a next page
    const hasNextPage = docs.length > limit;
    const resultDocs = hasNextPage ? docs.slice(0, limit) : docs;

    const items = await Promise.all(
      resultDocs.map(async (doc: any) => {
        const data = doc.data();

        // Get product details
        const productDoc = await Collections.products()
          .doc(data.product_id)
          .get();
        const product = productDoc.data();

        if (!product) {
          return null;
        }

        // Get shop details
        const shopDoc = await Collections.shops().doc(product.shop_id).get();
        const shop = shopDoc.data();

        return {
          id: doc.id,
          userId: data.user_id,
          productId: data.product_id,
          productName: product.name,
          productImage: product.images?.[0] || "",
          price: product.price,
          originalPrice: product.original_price,
          quantity: data.quantity,
          variant: data.variant,
          shopId: product.shop_id,
          shopName: shop?.name || "Unknown",
          stockCount: product.stock_count || 0,
          addedAt: data.added_at,
        };
      })
    );

    const validItems = items.filter((item: any) => item !== null);

    // Calculate totals
    const subtotal = validItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const shipping = subtotal > 5000 ? 0 : 100; // Free shipping above ₹5000
    const tax = subtotal * 0.18; // 18% GST
    const discount = 0; // Will be calculated if coupon applied
    const total = subtotal + shipping + tax - discount;

    // Get next cursor
    const nextCursor =
      hasNextPage && resultDocs.length > 0
        ? resultDocs[resultDocs.length - 1].id
        : null;

    const summary = {
      items: validItems,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      itemCount: validItems.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      ),
    };

    return NextResponse.json({
      success: true,
      data: summary,
      count: validItems.length,
      pagination: {
        limit,
        hasNextPage,
        nextCursor,
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, quantity = 1, variant } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Validate quantity
    if (quantity <= 0) {
      return NextResponse.json(
        { success: false, error: "Insufficient stock" },
        { status: 400 }
      );
    }

    // Check if product exists and has stock
    const productDoc = await Collections.products().doc(productId).get();
    if (!productDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const product = productDoc.data();
    if (product.stock_count < quantity) {
      return NextResponse.json(
        { success: false, error: "Insufficient stock" },
        { status: 400 }
      );
    }

    // Check if item already in cart
    const existingSnapshot = await Collections.cart()
      .where("user_id", "==", user.id)
      .where("product_id", "==", productId)
      .where("variant", "==", variant || null)
      .get();

    const now = new Date().toISOString();

    if (!existingSnapshot.empty) {
      // Update existing item
      const existingDoc = existingSnapshot.docs[0];
      const newQuantity = existingDoc.data().quantity + quantity;

      if (product.stock_count < newQuantity) {
        return NextResponse.json(
          { success: false, error: "Insufficient stock" },
          { status: 400 }
        );
      }

      await existingDoc.ref.update({
        quantity: newQuantity,
        updated_at: now,
      });

      return NextResponse.json({
        success: true,
        data: { id: existingDoc.id, quantity: newQuantity },
        message: "Cart updated",
      });
    } else {
      // Add new item
      const docRef = await Collections.cart().add({
        user_id: user.id,
        product_id: productId,
        quantity,
        variant: variant || null,
        added_at: now,
        updated_at: now,
      });

      return NextResponse.json(
        {
          success: true,
          data: { id: docRef.id, quantity },
          message: "Item added to cart",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const snapshot = await Collections.cart()
      .where("user_id", "==", user.id)
      .get();

    const batch = Collections.cart().firestore.batch();
    snapshot.docs.forEach((doc: any) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return NextResponse.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
