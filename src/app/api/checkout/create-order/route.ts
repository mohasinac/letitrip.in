/**
 * @fileoverview TypeScript Module
 * @module src/app/api/checkout/create-order/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { batchGetProducts } from "@/app/api/lib/batch-fetch";
import { withIPTracking } from "@/app/api/middleware/ip-tracker";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Collections } from "../../lib/firebase/collections";
import { getCurrentUser } from "../../lib/session";

const ShopOrderSchema = z.object({
  /** Shop Id */
  shopId: z.string(),
  /** Shop Name */
  shopName: z.string(),
  /** Items */
  items: z.array(z.any()),
  /** Coupon Code */
  couponCode: z.string().optional(),
});

const CreateOrderSchema = z.object({
  /** Shipping Address Id */
  shippingAddressId: z.string().min(1, "Shipping address is required"),
  /** Billing Address Id */
  billingAddressId: z.string().optional(),
  /** Payment Method */
  paymentMethod: z.enum(["razorpay", "cod"]),
  /** Shop Orders */
  shopOrders: z.array(ShopOrderSchema),
  /** Notes */
  notes: z.string().optional(),
});

/**
 * Creates order handler
 */
/**
 * Creates a new order handler
 *
 * @param {Request} request - The request
 *
 * @returns {Promise<any>} Promise resolving to orderhandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Creates a new order handler
 *
 * @param {Request} request - The request
 *
 * @returns {Promise<any>} Promise resolving to orderhandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function createOrderHandler(request: Request) {
  try {
    const user = await getCurrentUser(request as NextRequest);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = CreateOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      shippingAddressId,
      billingAddressId,
      paymentMethod,
      shopOrders,
      notes,
    } = validation.data;

    if (!shopOrders || shopOrders.length === 0) {
      return NextResponse.json(
        { error: "No shop orders provided" },
        { status: 400 }
      );
    }

    // Fetch and validate addresses
    const shippingAddressDoc = await Collections.addresses()
      .doc(shippingAddressId)
      .get();
    if (!shippingAddressDoc.exists) {
      return NextResponse.json(
        { error: "Shipping address not found" },
        { status: 400 }
      );
    }

    const shippingAddress = shippingAddressDoc.data();
    if (shippingAddress?.user_id !== user.id) {
      return NextResponse.json(
        { error: "Invalid shipping address" },
        { status: 403 }
      );
    }

    let billingAddress = shippingAddress;
    if (billingAddressId && billingAddressId !== shippingAddressId) {
      const billingAddressDoc = await Collections.addresses()
        .doc(billingAddressId)
        .get();
      if (!billingAddressDoc.exists) {
        return NextResponse.json(
          { error: "Billing address not found" },
          { status: 400 }
        );
      }

      const billingData = billingAddressDoc.data();
      if (billingData?.user_id !== user.id) {
        return NextResponse.json(
          { error: "Invalid billing address" },
          { status: 403 }
        );
      }
      billingAddress = billingData;
    }

    // Process each shop order separately
    const orderRefs: any[] = [];
    let grandTotal = 0;
    const batch = Collections.products().firestore.batch();
    const usedCoupons: any[] = [];

    for (const shopOrder of shopOrders) {
      const { shopId, shopName, items, couponCode } = shopOrder;

      // Validate products using batch fetch
      /**
 * Performs product ids operation
 *
 * @param {any} (item - The (item
 *
 * @returns {any} The productids result
 *
 */
const productIds = items.map((item: any) => item.productId);
      const productsMap = await batchGetProducts(productIds);

      const products = productIds
        .map((id: string) => productsMap.g/**
 * Performs product operation
 *
 * @param {any} (p - The (p
 *
 * @returns {any} The product result
 *
 */
et(id))
        .filter(Boolean);

      // Validate stock and product status
      for (const item of items) {
        const product = products.find((p: any) => p.id === item.productId);
        if (!product) {
          return NextResponse.json(
            { error: `Product ${item.productName} not found` },
            { status: 400 }
          );
        }

        if (product.stock_count < item.quantity) {
          return NextResponse.json(
            {
              /** Error */
              error: `Insufficient stock for ${product.name}. Only ${product.stock_count} available`,
            },
            { status: 400 }
          );
        }

        if (product.status !== "active") {
        /**
 * Performs order items operation
 *
 * @param {any} (item - The (item
 *
 * @returns {any} The orderitems result
 *
 */
  return NextResponse.json(
            { error: `Product ${product.name} is no longer available` },
            { status: 400 }
          );
        }
      }

      // Calculate shop subtotal
      let shopSubtotal = 0;
      const orderItems = items.map((item: any) => {
        const product = products.find((p: any) => p.id === item.productId);
        const itemSubtotal = product.price * item.quantity;
        shopSubtotal += itemSubtotal;

        return {
          product_id: item.productId,
          product_name: product.name,
          product_image: product.images?.[0] || null,
          /** Variant */
          variant: item.variant || null,
          /** Quantity */
          quantity: item.quantity,
          /** Price */
          price: product.price,
          /** Subtotal */
          subtotal: itemSubtotal,
        };
      });

      // Apply shop coupon if provided
      let discount = 0;
      let couponData = null;

      if (couponCode) {
        const couponSnapshot = await Collections.coupons()
          .where("code", "==", couponCode.toUpperCase())
          .where("shop_id", "==", shopId)
          .limit(1)
          .get();

        if (!couponSnapshot.empty) {
          const coupon: any = {
            /** Id */
            id: couponSnapshot.docs[0].id,
            ...couponSnapshot.docs[0].data(),
          };

          // Validate coupon
          const now = new Date();
          const validFrom = coupon.valid_from?.toDate();
          const validUntil = coupon.valid_until?.toDate();

          if (
            coupon.status === "active" &&
            (!validFrom || now >= validFrom) &&
            (!validUntil || now <= validUntil) &&
            shopSubtotal >= (coupon.min_purchase || 0) &&
            (coupon.usage_limit === null ||
              coupon.used_count < coupon.usage_limit)
          ) {
            // Calculate discount
            if (coupon.discount_type === "percentage") {
              discount = Math.round(
                (shopSubtotal * coupon.discount_value) / 100
              );
              if (coupon.max_discount) {
                discount = Math.min(discount, coupon.max_discount);
              }
            } else if (coupon.discount_type === "flat") {
              discount = Math.min(coupon.discount_value, shopSubtotal);
            }

            couponData = {
              /** Code */
              code: coupon.code,
              discount_type: coupon.discount_type,
              discount_value: coupon.discount_value,
              discount_amount: discount,
            };

            // Track for usage update
            usedCoupons.push({
              /** Ref */
              ref: couponSnapshot.docs[0].ref,
              /** Used Count */
              usedCount: coupon.used_count || 0,
            });
          }
        }
      }

      const shipping = shopSubtotal >= 5000 ? 0 : 100;
      const tax = Math.round(shopSubtotal * 0.18); // 18% GST
      const shopTotal = shopSubtotal + shipping + tax - discount;

      grandTotal += shopTotal;

      // Create order for this shop
      const orderId = `ORD-${Date.now()}-${crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase()}`;

      const orderData = {
        order_id: orderId,
        user_id: user.id,
        user_email: user.email,
        user_name: user.name || user.email,
        shop_id: shopId,
        shop_name: shopName,
        /** Items */
        items: orderItems,
        /** Subtotal */
        subtotal: shopSubtotal,
        discount,
        shipping,
        tax,
        /** Total */
        total: shopTotal,
        /** Coupon */
        coupon: couponData,
        shipping_address: {
          /** Id */
          id: shippingAddressId,
          /** Name */
          name: shippingAddress?.name,
          /** Phone */
          phone: shippingAddress?.phone,
          /** Line1 */
          line1: shippingAddress?.line1,
          /** Line2 */
          line2: shippingAddress?.line2,
          /** City */
          city: shippingAddress?.city,
          /** State */
          state: shippingAddress?.state,
          postal_code: shippingAddress?.pincode,
          /** Country */
          country: shippingAddress?.country || "India",
        },
        billing_address: {
          /** Id */
          id: billingAddressId || shippingAddressId,
          /** Name */
          name: billingAddress?.name,
          /** Phone */
          phone: billingAddress?.phone,
          /** Line1 */
          line1: billingAddress?.line1,
          /** Line2 */
          line2: billingAddress?.line2,
          /** City */
          city: billingAddress?.city,
          /** State */
          state: billingAddress?.state,
          postal_code: billingAddress?.pincode,
          /** Country */
          country: billingAddress?.country || "India",
        },
        payment_method: paymentMethod,
        payment_status: paymentMethod === "cod" ? "pending" : "awaiting",
        order_status: "pending",
        /** Notes */
        notes: notes || null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const orde/**
 * Performs product operation
 *
 * @param {any} (p - The (p
 *
 * @returns {any} The product result
 *
 */
rRef = await Collections.orders().add(orderData);
      orderRefs.push({
        /** Id */
        id: orderRef.id,
        orderId,
        shopId,
        shopName,
        /** Total */
        total: shopTotal,
      });

      // If COD, update stock immediately
      if (paymentMethod === "cod") {
        for (const item of items) {
          const product = products.find((p: any) => p.id === item.productId);
          const productRef = Collections.products().doc(item.productId);
          batch.update(productRef, {
            stock_count: product.stock_count - item.quantity,
            updated_at: new Date(),
          });
        }
      }
    }

    // If COD, commit batch (stock updates + coupon updates + cart clear)
    if (paymentMethod === "cod") {
      // Update coupon usage
      for (const coupon of usedCoupons) {
        batch.update(coupon.ref, {
          used_count: coupon.usedCount + 1,
          updated_at: new Date(),
        });
      }

      // Delete cart items
      const cartSnapshot = await Collections.cart()
        .where("user_id", "==", user.id)
        .get();

      cartSnapshot.docs.forEach((doc: any) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    }

    // Generate Razorpay order if not COD
    let razorpayOrderId = null;
    if (paymentMethod === "razorpay") {
      // In production, integrate with Razorpay SDK
      razorpayOrderId = `razorpay_order_${crypto
        .randomBytes(8)
        .toString("hex")}`;

      // Update all orders with Razorpay order ID
      const razorpayBatch = Collections.orders().firestore.batch();
      for (const order of orderRefs) {
        const orderRef = Collections.orders().doc(order.id);
        razorpayBatch.update(orderRef, { razorpay_order_id: razorpayOrderId });
      }
      await razorpayBatch.commit();
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Orders */
      orders: orderRefs,
      razorpay_order_id: razorpayOrderId,
      amount: Math.round(grandTotal * 100), // Amount in paise for Razorpay
      /** Currency */
      currency: "INR",
      /** Total */
      total: grandTotal,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

// Export with IP tracking and rate limiting (max 10 attempts per 15 minutes for payment operations)
/**
 * Post
 * @constant
 */
export const POST = withIPTracking(createOrderHandler, {
  /** Action */
  action: "order_placed",
  /** Check Rate Limit */
  checkRateLimit: true,
  /** Max Attempts */
  maxAttempts: 10,
  /** Window Minutes */
  windowMinutes: 15,
});
