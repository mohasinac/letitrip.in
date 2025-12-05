/**
 * @fileoverview TypeScript Module
 * @module src/app/api/cart/merge/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../lib/session";

/**
 * POST /api/cart/merge
 * Merge guest cart items into user cart after login
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { guestCartItems = [] } = body;

    if (!Array.isArray(guestCartItems) || guestCartItems.length === 0) {
      // No items to merge, return empty cart
      return NextResponse.json({
        /** Success */
        success: true,
        /** Data */
        data: {
          /** Items */
          items: [],
          /** Item Count */
          itemCount: 0,
          /** Subtotal */
          subtotal: 0,
          /** Discount */
          discount: 0,
          /** Tax */
          tax: 0,
          /** Total */
          total: 0,
        },
        /** Message */
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
            product.stock_count,
          );

          await existingDoc.ref.update({
            /** Quantity */
            quantity: newQuantity,
            updated_at: now,
          });
        } else {
          // Add new item to cart
          await Collections.cart().add({
            user_id: user.id,
            product_id: productId,
            /** Quantity */
            quantity: Math.min(quantity, product.stock_count),
            /** Variant */
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

    /**
 * Performs items operation
 *
 * @param {any} cartSnapshot.docs.map(async(doc - The cartsnapshot.docs.map(async(doc
 *
 * @returns {Promise<any>} The items result
 *
 */
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
          /** Id */
          id: doc.id,
          /** User Id */
          userId: data.user_id,
          /** Product Id */
          productId: data.product_id,
          /** Product Name */
          productName: product.name,
          /** Product Slug */
          productSlug: product.slug,
          /** Product Image */
          productImage: product.images?.[0] || "",
          /** Price */
          price: product.price,
          /** Quantity */
          quantity: data.quantity,
          /** Max Quantity */
          maxQuantity: product.stock_count || 0,
          /** Variant Id */
          variantId: data.variant,
          /** Shop Id */
          shopId: product.shop_id,
          /** Shop Name */
          shopName: shop?.name || "Unknown",
          /** Is /**
 * Performs valid items operation
 *
 * @param {any} (item - The (item
 *
 * @returns {any} The validitems result
 *
 */
Available */
          isAvailable: product.is_active && product.stock_count > 0,
          /** Added At */
          addedAt: data.added_at,
        };
      }),
    );

    const validItems = it/**
 * Performs total operation
 *
 * @param {object} {
      
      success - The {
      
      success
 *
 * @returns {any} The total result
 *
 */
ems.filter((item: any) => item !== null);

    // Calculate totals
    const subtotal = validItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );
    const shipping = subtotal > 5000 ? 0 : 100;
    const tax = subtotal * 0.18;
    const discount = 0;
    const total = subtotal + shipping + tax - discount;

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: {
        /** Items */
        items: validItems,
        /** Item Count */
        itemCount: validItems.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0,
        ),
        subtotal,
        discount,
        tax,
        total,
      },
      /** Message */
      message: `Merged ${mergedCount} item(s)${
        skippedCount > 0 ? `, skipped ${skippedCount}` : ""
      }`,
    });
  } catch (error) {
    console.error("Error merging cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to merge cart" },
      { status: 500 },
    );
  }
}
