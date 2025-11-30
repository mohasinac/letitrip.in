import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { nanoid } from "nanoid";

const DEMO_PREFIX = "DEMO_";

const INDIAN_CITIES = [
  { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  { city: "Delhi", state: "Delhi", pincode: "110001" },
  { city: "Bangalore", state: "Karnataka", pincode: "560001" },
  { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  { city: "Kolkata", state: "West Bengal", pincode: "700001" },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shops, buyers, productsByShop } = body;

    if (!shops || !Array.isArray(shops) || shops.length === 0) {
      return NextResponse.json({ success: false, error: "Shops data required" }, { status: 400 });
    }

    if (!buyers || !Array.isArray(buyers) || buyers.length === 0) {
      return NextResponse.json({ success: false, error: "Buyers data required" }, { status: 400 });
    }

    if (!productsByShop || Object.keys(productsByShop).length === 0) {
      return NextResponse.json({ success: false, error: "Products by shop data required" }, { status: 400 });
    }

    const db = getFirestoreAdmin();
    const timestamp = new Date();
    let orderCount = 0;
    let paymentCount = 0;
    let shipmentCount = 0;

    for (const buyer of buyers) {
      const numOrders = 2 + Math.floor(Math.random() * 4);
      
      for (let o = 0; o < numOrders; o++) {
        const shop = shops[(buyers.indexOf(buyer) + o) % shops.length];
        const shopProducts = productsByShop[shop.id] || [];
        if (shopProducts.length === 0) continue;

        const orderRef = db.collection(COLLECTIONS.ORDERS).doc();
        const numItems = 1 + Math.floor(Math.random() * 3);
        let subtotal = 0;
        const items: any[] = [];

        for (let item = 0; item < numItems; item++) {
          const price = 500 + Math.random() * 10000;
          items.push({
            productId: shopProducts[(o + item) % shopProducts.length],
            quantity: 1,
            price: Math.round(price),
          });
          subtotal += price;
        }

        const shippingFee = 50 + Math.floor(Math.random() * 100);
        const total = subtotal + shippingFee + subtotal * 0.18;
        const status = ["pending", "confirmed", "shipped", "delivered"][Math.floor(Math.random() * 4)];
        const paymentMethod = ["card", "upi", "cod"][Math.floor(Math.random() * 3)];
        const city = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];

        await orderRef.set({
          orderNumber: `${DEMO_PREFIX}ORD-${String(orderCount + 1).padStart(6, "0")}`,
          buyerId: buyer.id,
          buyerName: buyer.name,
          shopId: shop.id,
          sellerId: shop.ownerId,
          items,
          subtotal: Math.round(subtotal),
          shippingFee,
          tax: Math.round(subtotal * 0.18),
          total: Math.round(total),
          status,
          paymentMethod,
          paymentStatus: paymentMethod === "cod" ? "pending" : "completed",
          shippingAddress: { city: city.city, state: city.state, pincode: city.pincode },
          createdAt: timestamp,
          updatedAt: timestamp,
        });

        if (paymentMethod !== "cod") {
          await db.collection(COLLECTIONS.PAYMENTS).doc().set({
            orderId: orderRef.id,
            amount: Math.round(total),
            method: paymentMethod,
            status: "completed",
            transactionId: `${DEMO_PREFIX}TXN-${nanoid(16)}`,
            createdAt: timestamp,
          });
          paymentCount++;
        }

        if (["shipped", "delivered"].includes(status)) {
          await db.collection(COLLECTIONS.SHIPMENTS).doc().set({
            orderId: orderRef.id,
            trackingNumber: `${DEMO_PREFIX}TRACK-${nanoid(12)}`,
            courier: ["Delhivery", "Blue Dart", "DTDC"][Math.floor(Math.random() * 3)],
            status: status === "delivered" ? "delivered" : "in_transit",
            createdAt: timestamp,
          });
          shipmentCount++;
        }

        orderCount++;
      }
    }

    return NextResponse.json({
      success: true,
      step: "orders",
      data: {
        orders: orderCount,
        payments: paymentCount,
        shipments: shipmentCount,
      },
    });
  } catch (error: unknown) {
    console.error("Demo orders error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate orders";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
