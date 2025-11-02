import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";
import { verifyFirebaseToken } from "@/lib/auth/firebase-api-auth";
import { CreateOrderInput, Order, OrderStatus, PaymentStatus } from "@/types/order";
import {
  generateOrderNumber,
  calculateOrderTotals,
  validateOrderItems,
} from "@/lib/order/order-utils";
import { FieldValue } from "firebase-admin/firestore";

const ORDERS_COLLECTION = "orders";
const PRODUCTS_COLLECTION = "products";

/**
 * POST /api/orders/create - Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateOrderInput = await request.json();
    console.log("Order creation request body:", JSON.stringify(body, null, 2));
    
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      currency,
      exchangeRate,
      customerNotes,
      couponCode,
    } = body;

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    // Validate items
    const validation = validateOrderItems(items);
    if (!validation.valid) {
      console.error("Order validation failed:", validation.errors);
      return NextResponse.json(
        { error: "Invalid order items", details: validation.errors },
        { status: 400 }
      );
    }

    // Validate addresses
    if (!shippingAddress.fullName || !shippingAddress.city) {
      return NextResponse.json(
        { error: "Invalid shipping address - fullName and city are required" },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Check stock availability
    for (const item of items) {
      const productDoc = await db
        .collection(PRODUCTS_COLLECTION)
        .doc(item.productId)
        .get();

      if (!productDoc.exists) {
        return NextResponse.json(
          { error: `Product not found: ${item.name}` },
          { status: 404 }
        );
      }

      const product = productDoc.data();
      // Check stock using the same helper pattern as products API
      const currentStock = product?.inventory?.quantity ?? product?.stock ?? product?.quantity ?? 0;
      
      console.log(`Stock check for ${item.name}:`, {
        inventoryQuantity: product?.inventory?.quantity,
        stock: product?.stock,
        quantity: product?.quantity,
        currentStock,
        requestedQuantity: item.quantity
      });
      
      if (currentStock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${item.name}. Available: ${currentStock}`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate totals with coupon discount
    let couponDiscount = 0;
    let appliedCoupon: any = null;
    
    if (couponCode) {
      try {
        // Validate coupon
        const couponsRef = db.collection("coupons");
        const couponSnapshot = await couponsRef
          .where("code", "==", couponCode.toUpperCase())
          .where("status", "==", "active")
          .limit(1)
          .get();

        if (!couponSnapshot.empty) {
          const couponDoc = couponSnapshot.docs[0];
          const couponData: any = couponDoc.data();
          const coupon = { id: couponDoc.id, ...couponData };
          
          // Basic validation - check expiry
          if (!couponData.isPermanent && couponData.endDate) {
            const endDate = new Date(couponData.endDate);
            if (endDate < new Date()) {
              console.log("Coupon expired, skipping");
            } else {
              // Calculate discount based on coupon type
              const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
              
              if (couponData.type === "percentage") {
                couponDiscount = Math.round((subtotal * couponData.value) / 100);
                if (couponData.maximumAmount > 0) {
                  couponDiscount = Math.min(couponDiscount, couponData.maximumAmount);
                }
              } else if (couponData.type === "fixed") {
                couponDiscount = Math.min(couponData.value, subtotal);
              }
              
              appliedCoupon = {
                code: couponData.code,
                name: couponData.name,
                type: couponData.type,
                value: couponData.value,
              };
              
              // Increment usage count
              await couponDoc.ref.update({
                usedCount: FieldValue.increment(1),
                updatedAt: new Date(),
              });
            }
          } else if (couponData.isPermanent) {
            // Permanent coupon
            const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            
            if (couponData.type === "percentage") {
              couponDiscount = Math.round((subtotal * couponData.value) / 100);
              if (couponData.maximumAmount > 0) {
                couponDiscount = Math.min(couponDiscount, couponData.maximumAmount);
              }
            } else if (couponData.type === "fixed") {
              couponDiscount = Math.min(couponData.value, subtotal);
            }
            
            appliedCoupon = {
              code: couponData.code,
              name: couponData.name,
              type: couponData.type,
              value: couponData.value,
            };
            
            // Increment usage count
            await couponDoc.ref.update({
              usedCount: FieldValue.increment(1),
              updatedAt: new Date(),
            });
          }
        }
      } catch (error) {
        console.error("Error applying coupon:", error);
        // Continue without coupon
      }
    }
    
    const totals = calculateOrderTotals(items, couponDiscount);

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Determine initial status based on payment method
    let initialStatus: OrderStatus = "pending_payment";
    let initialPaymentStatus: PaymentStatus = "pending";

    if (paymentMethod === "cod") {
      initialStatus = "pending_approval";
      initialPaymentStatus = "pending";
    }

    // Create order object
    const order: Omit<Order, "id"> = {
      orderNumber,
      userId: user.uid,
      userName: user.userData?.name || "Unknown",
      userEmail: user.email || "",

      items,

      subtotal: totals.subtotal,
      couponDiscount: totals.discount,
      saleDiscount: 0,
      shippingCharges: totals.shipping,
      platformFee: 0,
      tax: totals.tax,
      total: totals.total,

      currency,
      exchangeRate,
      originalAmount: totals.total,

      paymentMethod,
      paymentStatus: initialPaymentStatus,

      shippingAddress,
      billingAddress: billingAddress || shippingAddress,

      status: initialStatus,

      customerNotes: customerNotes || "",
      
      // Add coupon snapshot if applied
      ...(appliedCoupon && { couponSnapshot: appliedCoupon }),
      
      // Add sellerId from first item (for single-seller orders)
      // For multi-seller orders, this would need to be split into separate orders
      sellerId: items[0]?.sellerId || "default-seller",
      sellerName: items[0]?.sellerName || "JustForView",

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save order to database
    const orderRef = await db.collection(ORDERS_COLLECTION).add({
      ...order,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Reduce product stock (in a transaction for safety)
    const batch = db.batch();
    for (const item of items) {
      const productRef = db.collection(PRODUCTS_COLLECTION).doc(item.productId);
      const productDoc = await productRef.get();
      const productData = productDoc.data();
      
      // Update both stock and quantity fields for compatibility
      const updates: any = {
        updatedAt: new Date(),
      };
      
      if (productData?.stock !== undefined) {
        updates.stock = FieldValue.increment(-item.quantity);
      }
      
      if (productData?.quantity !== undefined) {
        updates.quantity = FieldValue.increment(-item.quantity);
      }
      
      batch.update(productRef, updates);
    }
    await batch.commit();

    // TODO: Send order confirmation email
    // TODO: Send notification to seller

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      orderNumber,
      order: {
        ...order,
        id: orderRef.id,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
