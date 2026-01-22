/**
 * Checkout API Route
 *
 * Process cart checkout, create order, and clear cart.
 *
 * @route POST /api/checkout - Process checkout (requires auth)
 */

import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST - Process checkout
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.userId;
    const userEmail = session.email || "";
    const userName = session.name || session.email || "Anonymous";

    const body = await request.json();
    const { addressId, paymentMethod, shippingMethod } = body;

    // Validate required fields
    if (!addressId || !paymentMethod || !shippingMethod) {
      return NextResponse.json(
        { error: "Address, payment method, and shipping method are required" },
        { status: 400 },
      );
    }

    // Get user's cart items
    const cartQuery = query(
      collection(db, "cart"),
      where("userId", "==", userId),
    );

    const cartSnapshot = await getDocs(cartQuery);

    if (cartSnapshot.empty) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Verify address exists and belongs to user
    const addressRef = doc(db, "addresses", addressId);
    const addressDoc = await getDoc(addressRef);

    if (!addressDoc.exists()) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const addressData = addressDoc.data();
    if (addressData.userId !== userId) {
      return NextResponse.json(
        { error: "Address does not belong to user" },
        { status: 403 },
      );
    }

    // Calculate totals
    let subtotal = 0;
    const items = [];

    for (const cartDoc of cartSnapshot.docs) {
      const cartItem = cartDoc.data();

      // Get product details
      const productQuery = query(
        collection(db, "products"),
        where("slug", "==", cartItem.productSlug),
      );
      const productSnapshot = await getDocs(productQuery);

      if (productSnapshot.empty) {
        return NextResponse.json(
          { error: `Product ${cartItem.productSlug} not found` },
          { status: 404 },
        );
      }

      const product = productSnapshot.docs[0].data();

      // Verify stock
      if (cartItem.quantity > product.stock) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.title}`,
            available: product.stock,
            requested: cartItem.quantity,
          },
          { status: 400 },
        );
      }

      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;

      items.push({
        productSlug: cartItem.productSlug,
        productName: product.title,
        quantity: cartItem.quantity,
        price: product.price,
        total: itemTotal,
      });
    }

    // Calculate shipping and tax
    const shippingCost = shippingMethod === "express" ? 100 : 50;
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shippingCost + tax;

    // Generate order slug
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const orderSlug = `order-${timestamp}-${randomStr}`;

    // Create order
    const orderData = {
      slug: orderSlug,
      userId,
      userEmail,
      userName,
      items,
      subtotal,
      shippingCost,
      tax,
      total,
      paymentMethod,
      shippingMethod,
      shippingAddress: {
        name: addressData.name,
        phone: addressData.phone,
        addressLine1: addressData.addressLine1,
        addressLine2: addressData.addressLine2,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        country: addressData.country,
      },
      status: "pending",
      paymentStatus: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const orderRef = await addDoc(collection(db, "orders"), orderData);

    // Clear cart after successful order
    const deletePromises = cartSnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        data: {
          orderId: orderRef.id,
          orderSlug,
          total,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error processing checkout:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to process checkout",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
