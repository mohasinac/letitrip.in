/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/demo/generate/orders/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { nanoid } from "nanoid";

/**
 * DEMO_PREFIX constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for demo prefix
 */
const DEMO_PREFIX = "DEMO_";

const INDIAN_CITIES = [
  { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  { city: "Delhi", state: "Delhi", pincode: "110001" },
  { city: "Bangalore", state: "Karnataka", pincode: "560001" },
  { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  { city: "Kolkata", state: "West Bengal", pincode: "700001" },
  { city: "Pune", state: "Maharashtra", pincode: "411001" },
  { city: "Hyde/**
 * COURIER_COMPANIES constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for courier companies
 */
rabad", state: "Telangana", pincode: "500001" },
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
  { method: "card", type: "debit", network/**
 * STREETS constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for streets
 */
: "Mastercard", last4: "5556" },
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

/**
 * Function: P O S T
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
            /** Product Id */
            productId: shopProducts[(o + item) % shopProducts.length],
            /** Quantity */
            quantity: 1,
            /** Price */
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
          /** Order Number */
          orderNumber: `${DEMO_PREFIX}ORD-${String(orderCount + 1).padStart(6, "0")}`,
          /** Buyer Id */
          buyerId: buyer.id,
          /** Buyer Name */
          buyerName: `${DEMO_PREFIX}${buyer.name}`,
          /** Buyer Email */
          buyerEmail: `${buyer.name.toLowerCase().replace(/\s/g, ".")}@demo.letitrip.in`,
          /** Buyer Phone */
          buyerPhone: `+91-${9000000000 + orderCount}`,
          /** Shop Id */
          shopId: shop.id,
          /** Seller Id */
          sellerId: shop.ownerId,
          items,
          /** Subtotal */
          subtotal: Math.round(subtotal),
          shippingFee,
          /** Tax */
          tax: Math.round(subtotal * 0.18),
          /** Discount */
          discount: Math.random() > 0.7 ? Math.round(subtotal * 0.1) : 0,
          /** Total */
          total: Math.round(total),
          status,
          /** Payment Method */
          paymentMethod: paymentMethodData.method,
          /** Payment Status */
          paymentStatus:
            paymentMethodData.method === "cod" ? "pending" : "completed",
          /** Shipping Address */
          shippingAddress: {
            /** Name */
            name: buyer.name,
            /** Phone */
            phone: `+91-${9000000000 + orderCount}`,
            /** Street */
            street: `${100 + orderCount} ${STREETS[orderCount % STREETS.length]}`,
            /** City */
            city: city.city,
            /** State */
            state: city.state,
            /** Pincode */
            pincode: city.pincode,
            /** Country */
            country: "India",
            /** Landmark */
            landmark: "Near Main Market",
          },
          /** Billing Address */
          billingAddress: {
            /** Name */
            name: buyer.name,
            /** Phone */
            phone: `+91-${9000000000 + orderCount}`,
            /** Street */
            street: `${100 + orderCount} ${STREETS[orderCount % STREETS.length]}`,
            /** City */
            city: city.city,
            /** State */
            state: city.state,
            /** Pincode */
            pincode: city.pincode,
            /** Country */
            country: "India",
          },
          /** Notes */
          notes:
            Math.random() > 0.7
              ? "Please handle with care - fragile items"
              : "",
          /** Gift Wrap */
          giftWrap: Math.random() > 0.8,
          /** Estimated Delivery */
          estimatedDelivery: new Date(
            timestamp.getTime() +
              (3 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000,
          ),
          /** Created At */
          createdAt: timestamp,
          /** Updated At */
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
              /** Order Id */
              orderId: orderRef.id,
              /** Transaction Id */
              transactionId: `${DEMO_PREFIX}pay_${nanoid(14)}`,
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: razorpayPaymentId,
              razorpay_signature: `sig_${nanoid(32)}`,
              amount: Math.round(total * 100), // in paise
              /** Currency */
              currency: "INR",
              ...paymentMethodData,
              /** Status */
              status: "captured",
              fee: Math.round(total * 0.02 * 100), // 2% fee in paise
              tax: Math.round(total * 0.02 * 0.18 * 100), // GST on fee
              /** Email */
              email: `${buyer.name.toLowerCase().replace(/\s/g, ".")}@demo.letitrip.in`,
              /** Contact */
              contact: `+91-${9000000000 + orderCount}`,
              /** Notes */
              notes: { order_id: orderRef.id, shop_id: shop.id },
              /** Receipt */
              receipt: `${DEMO_PREFIX}RCPT-${String(paymentCount + 1).padStart(6, "0")}`,
              invoice_id: `${DEMO_PREFIX}INV-${String(paymentCount + 1).padStart(6, "0")}`,
              /** International */
              international: false,
              captured_at: timestamp,
              /** Created At */
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
              /** Status */
              status: "pickup_scheduled",
              /** Location */
              location: city.city,
              /** Timestamp */
              timestamp: new Date(
                timestamp.getTime() - 4 * 24 * 60 * 60 * 1000,
              ),
            },
            {
              /** Status */
              status: "picked_up",
              /** Location */
              location: city.city,
              /** Timestamp */
              timestamp: new Date(
                timestamp.getTime() - 3 * 24 * 60 * 60 * 1000,
              ),
            },
            {
              /** Status */
              status: "in_transit",
              /** Location */
              location: "Sorting Hub",
              /** Timestamp */
              timestamp: new Date(
                timestamp.getTime() - 2 * 24 * 60 * 60 * 1000,
              ),
            },
          ];

          if (status === "out_for_delivery" || status === "delivered") {
            trackingEvents.push({
              /** Status */
              status: "out_for_delivery",
              /** Location */
              location: city.city,
              /** Timestamp */
              timestamp: new Date(
                timestamp.getTime() - 1 * 24 * 60 * 60 * 1000,
              ),
            });
          }
          if (status === "delivered") {
            trackingEvents.push({
              /** Status */
              status: "delivered",
              /** Location */
              location: city.city,
              timestamp,
            });
          }

          await db
            .collection(COLLECTIONS.SHIPMENTS)
            .doc()
            .set({
              /** Order Id */
              orderId: orderRef.id,
              shiprocket_order_id: shiprocketOrderId,
              shiprocket_shipment_id: `SHP${200000 + shipmentCount}`,
              awb_code: awbCode,
              /** Tracking Number */
              trackingNumber: `${DEMO_PREFIX}${awbCode}`,
              courier_name: courier.name,
              courier_code: courier.code,
              courier_company_id: Math.floor(Math.random() * 50) + 1,
              /** Status */
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
              /** Weight */
              weight: 0.5 + Math.random() * 2,
              /** Dimensions */
              dimensions: { length: 20, width: 15, height: 10 },
              tracking_url: `https://shiprocket.co/tracking/${awbCode}`,
              tracking_events: trackingEvents,
              label_url: `https://demo.shiprocket.in/labels/${shiprocketOrderId}.pdf`,
              manifest_url: `https://demo.shiprocket.in/manifests/${shiprocketOrderId}.pdf`,
              invoice_url: `https://demo.shiprocket.in/invoices/${shiprocketOrderId}.pdf`,
              /** Created At */
              createdAt: timestamp,
            });
          shipmentCount++;
        }

        orderCount++;
      }
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Step */
      step: "orders",
      /** Data */
      data: {
        /** Orders */
        orders: orderCount,
        /** Payments */
        payments: paymentCount,
        /** Shipments */
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
