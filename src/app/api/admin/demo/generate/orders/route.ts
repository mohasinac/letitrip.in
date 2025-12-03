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
  { city: "Pune", state: "Maharashtra", pincode: "411001" },
  { city: "Hyderabad", state: "Telangana", pincode: "500001" },
  { city: "Ahmedabad", state: "Gujarat", pincode: "380001" },
];

const COURIER_COMPANIES = [
  { name: "Delhivery", code: "DELHIVERY" },
  { name: "Blue Dart", code: "BLUEDART" },
  { name: "DTDC", code: "DTDC" },
  { name: "Ecom Express", code: "ECOM" },
  { name: "XpressBees", code: "XPRESSBEES" },
  { name: "Shadowfax", code: "SHADOWFAX" },
];

const RAZORPAY_METHODS = [
  { method: "card", type: "credit", network: "Visa", last4: "4242" },
  { method: "card", type: "debit", network: "Mastercard", last4: "5556" },
  { method: "upi", vpa: "user@paytm" },
  { method: "upi", vpa: "user@gpay" },
  { method: "netbanking", bank: "HDFC" },
  { method: "netbanking", bank: "ICICI" },
  { method: "wallet", wallet: "paytm" },
];

const STREETS = [
  "Marine Drive",
  "MG Road",
  "Park Street",
  "Anna Salai",
  "FC Road",
  "Brigade Road",
  "Linking Road",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shops, buyers, productsByShop, scale = 10 } = body;

    if (!shops || !Array.isArray(shops) || shops.length === 0) {
      return NextResponse.json(
        { success: false, error: "Shops data required" },
        { status: 400 },
      );
    }

    if (!buyers || !Array.isArray(buyers) || buyers.length === 0) {
      return NextResponse.json(
        { success: false, error: "Buyers data required" },
        { status: 400 },
      );
    }

    if (!productsByShop || Object.keys(productsByShop).length === 0) {
      return NextResponse.json(
        { success: false, error: "Products by shop data required" },
        { status: 400 },
      );
    }

    const db = getFirestoreAdmin();
    const timestamp = new Date();
    let orderCount = 0;
    let paymentCount = 0;
    let shipmentCount = 0;

    for (const buyer of buyers) {
      // Number of orders per buyer scales with scale (2-6 orders at scale 10)
      const numOrders = Math.max(
        1,
        Math.ceil((scale / 10) * (2 + Math.floor(Math.random() * 4))),
      );

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
        const status = [
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "out_for_delivery",
          "delivered",
        ][Math.floor(Math.random() * 6)];
        const paymentMethodData =
          RAZORPAY_METHODS[Math.floor(Math.random() * RAZORPAY_METHODS.length)];
        const city =
          INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
        const courier =
          COURIER_COMPANIES[
            Math.floor(Math.random() * COURIER_COMPANIES.length)
          ];

        await orderRef.set({
          orderNumber: `${DEMO_PREFIX}ORD-${String(orderCount + 1).padStart(6, "0")}`,
          buyerId: buyer.id,
          buyerName: `${DEMO_PREFIX}${buyer.name}`,
          buyerEmail: `${buyer.name.toLowerCase().replace(/\s/g, ".")}@demo.letitrip.in`,
          buyerPhone: `+91-${9000000000 + orderCount}`,
          shopId: shop.id,
          sellerId: shop.ownerId,
          items,
          subtotal: Math.round(subtotal),
          shippingFee,
          tax: Math.round(subtotal * 0.18),
          discount: Math.random() > 0.7 ? Math.round(subtotal * 0.1) : 0,
          total: Math.round(total),
          status,
          paymentMethod: paymentMethodData.method,
          paymentStatus:
            paymentMethodData.method === "cod" ? "pending" : "completed",
          shippingAddress: {
            name: buyer.name,
            phone: `+91-${9000000000 + orderCount}`,
            street: `${100 + orderCount} ${STREETS[orderCount % STREETS.length]}`,
            city: city.city,
            state: city.state,
            pincode: city.pincode,
            country: "India",
            landmark: "Near Main Market",
          },
          billingAddress: {
            name: buyer.name,
            phone: `+91-${9000000000 + orderCount}`,
            street: `${100 + orderCount} ${STREETS[orderCount % STREETS.length]}`,
            city: city.city,
            state: city.state,
            pincode: city.pincode,
            country: "India",
          },
          notes:
            Math.random() > 0.7
              ? "Please handle with care - fragile items"
              : "",
          giftWrap: Math.random() > 0.8,
          estimatedDelivery: new Date(
            timestamp.getTime() +
              (3 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000,
          ),
          createdAt: timestamp,
          updatedAt: timestamp,
        });

        // Create Razorpay-style payment record
        if (paymentMethodData.method !== "cod") {
          const razorpayOrderId = `order_${nanoid(14)}`;
          const razorpayPaymentId = `pay_${nanoid(14)}`;

          await db
            .collection(COLLECTIONS.PAYMENTS)
            .doc()
            .set({
              orderId: orderRef.id,
              transactionId: `${DEMO_PREFIX}pay_${nanoid(14)}`,
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: razorpayPaymentId,
              razorpay_signature: `sig_${nanoid(32)}`,
              amount: Math.round(total * 100), // in paise
              currency: "INR",
              ...paymentMethodData,
              status: "captured",
              fee: Math.round(total * 0.02 * 100), // 2% fee in paise
              tax: Math.round(total * 0.02 * 0.18 * 100), // GST on fee
              email: `${buyer.name.toLowerCase().replace(/\s/g, ".")}@demo.letitrip.in`,
              contact: `+91-${9000000000 + orderCount}`,
              notes: { order_id: orderRef.id, shop_id: shop.id },
              receipt: `${DEMO_PREFIX}RCPT-${String(paymentCount + 1).padStart(6, "0")}`,
              invoice_id: `${DEMO_PREFIX}INV-${String(paymentCount + 1).padStart(6, "0")}`,
              international: false,
              captured_at: timestamp,
              createdAt: timestamp,
            });
          paymentCount++;
        }

        // Create Shiprocket-style shipment record
        if (["shipped", "out_for_delivery", "delivered"].includes(status)) {
          const shiprocketOrderId = `SR${100000 + shipmentCount}`;
          const awbCode = `${courier.code}${String(Math.floor(Math.random() * 1000000000)).padStart(10, "0")}`;

          const trackingEvents = [
            {
              status: "pickup_scheduled",
              location: city.city,
              timestamp: new Date(
                timestamp.getTime() - 4 * 24 * 60 * 60 * 1000,
              ),
            },
            {
              status: "picked_up",
              location: city.city,
              timestamp: new Date(
                timestamp.getTime() - 3 * 24 * 60 * 60 * 1000,
              ),
            },
            {
              status: "in_transit",
              location: "Sorting Hub",
              timestamp: new Date(
                timestamp.getTime() - 2 * 24 * 60 * 60 * 1000,
              ),
            },
          ];

          if (status === "out_for_delivery" || status === "delivered") {
            trackingEvents.push({
              status: "out_for_delivery",
              location: city.city,
              timestamp: new Date(
                timestamp.getTime() - 1 * 24 * 60 * 60 * 1000,
              ),
            });
          }
          if (status === "delivered") {
            trackingEvents.push({
              status: "delivered",
              location: city.city,
              timestamp,
            });
          }

          await db
            .collection(COLLECTIONS.SHIPMENTS)
            .doc()
            .set({
              orderId: orderRef.id,
              shiprocket_order_id: shiprocketOrderId,
              shiprocket_shipment_id: `SHP${200000 + shipmentCount}`,
              awb_code: awbCode,
              trackingNumber: `${DEMO_PREFIX}${awbCode}`,
              courier_name: courier.name,
              courier_code: courier.code,
              courier_company_id: Math.floor(Math.random() * 50) + 1,
              status:
                status === "delivered"
                  ? "delivered"
                  : status === "out_for_delivery"
                    ? "out_for_delivery"
                    : "in_transit",
              pickup_scheduled_date: new Date(
                timestamp.getTime() - 4 * 24 * 60 * 60 * 1000,
              ),
              pickup_date: new Date(
                timestamp.getTime() - 3 * 24 * 60 * 60 * 1000,
              ),
              delivered_date: status === "delivered" ? timestamp : null,
              pod_image:
                status === "delivered"
                  ? `https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop`
                  : null,
              weight: 0.5 + Math.random() * 2,
              dimensions: { length: 20, width: 15, height: 10 },
              tracking_url: `https://shiprocket.co/tracking/${awbCode}`,
              tracking_events: trackingEvents,
              label_url: `https://demo.shiprocket.in/labels/${shiprocketOrderId}.pdf`,
              manifest_url: `https://demo.shiprocket.in/manifests/${shiprocketOrderId}.pdf`,
              invoice_url: `https://demo.shiprocket.in/invoices/${shiprocketOrderId}.pdf`,
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
    const message =
      error instanceof Error ? error.message : "Failed to generate orders";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
