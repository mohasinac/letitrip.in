import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../lib/session";

/**
 * POST /api/cart/merge
 * Merge guest cart items into user cart after login
 */
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
    const { guestCartItems = [] } = body;

    if (!Array.isArray(guestCartItems) || guestCartItems.length === 0) {
      // No items to merge, return empty cart
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          itemCount: 0,
          subtotal: 0,
          discount: 0,
          tax: 0,
          total: 0,
        },
        message: "No items to merge",
      });
    }

    const now = new Date().toISOString();
    let mergedCount = 0;
    let skippedCount = 0;

    // Process each guest cart item
    for (const guestItem of guestCartItems) {
      const { productId, quantity = 1, variantId } = guestItem;

      if (!productId) {
        skippedCount++;
        continue;
      }

      try {
        // Check if product exists and has stock
        const productDoc = await Collections.products().doc(productId).get();
        if (!productDoc.exists) {
          skippedCount++;
          continue;
        }

        const product = productDoc.data();
        if (!product.is_active || product.stock_count < quantity) {
          skippedCount++;
          continue;
        }

        // Check if item already exists in user's cart
        const existingSnapshot = await Collections.cart()
          .where("user_id", "==", user.id)
          .where("product_id", "==", productId)
          .where("variant", "==", variantId || null)
          .get();

        if (!existingSnapshot.empty) {
          // Update quantity of existing item
          const existingDoc = existingSnapshot.docs[0];
          const currentQuantity = existingDoc.data().quantity;
          const newQuantity = Math.min(
            currentQuantity + quantity,
            product.stock_count
          );

          await existingDoc.ref.update({
            quantity: newQuantity,
            updated_at: now,
          });
        } else {
          // Add new item to cart
          await Collections.cart().add({
            user_id: user.id,
            product_id: productId,
            quantity: Math.min(quantity, product.stock_count),
            variant: variantId || null,
            added_at: now,
            updated_at: now,
          });
        }

        mergedCount++;
      } catch (itemError) {
        console.error(`Error merging item ${productId}:`, itemError);
        skippedCount++;
      }
    }

    // Fetch updated cart
    const cartSnapshot = await Collections.cart()
      .where("user_id", "==", user.id)
      .get();

    const items = await Promise.all(
      cartSnapshot.docs.map(async (doc: any) => {
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
          productSlug: product.slug,
          productImage: product.images?.[0] || "",
          price: product.price,
          quantity: data.quantity,
          maxQuantity: product.stock_count || 0,
          variantId: data.variant,
          shopId: product.shop_id,
          shopName: shop?.name || "Unknown",
          isAvailable: product.is_active && product.stock_count > 0,
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
    const shipping = subtotal > 5000 ? 0 : 100;
    const tax = subtotal * 0.18;
    const discount = 0;
    const total = subtotal + shipping + tax - discount;

    return NextResponse.json({
      success: true,
      data: {
        items: validItems,
        itemCount: validItems.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        ),
        subtotal,
        discount,
        tax,
        total,
      },
      message: `Merged ${mergedCount} item(s)${
        skippedCount > 0 ? `, skipped ${skippedCount}` : ""
      }`,
    });
  } catch (error) {
    console.error("Error merging cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to merge cart" },
      { status: 500 }
    );
  }
}
