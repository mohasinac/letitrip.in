import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth/firebase-api-auth";
import { createPayPalOrder, convertToUSDWithFee } from "@/lib/payment/paypal-utils";

/**
 * POST /api/payment/paypal/create-order
 * Create a PayPal order with USD conversion and 7% fee
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amountINR } = body;

    // Validate amount
    if (!amountINR || amountINR <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Convert INR to USD with 7% fee
    const conversion = convertToUSDWithFee(amountINR);

    // Create PayPal order
    const paypalOrder = await createPayPalOrder(conversion.total, "USD");

    return NextResponse.json({
      success: true,
      orderId: paypalOrder.id,
      status: paypalOrder.status,
      amountINR,
      amountUSD: conversion.usdAmount,
      fee: conversion.fee,
      total: conversion.total,
      exchangeRate: conversion.exchangeRate,
    });
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    return NextResponse.json(
      {
        error: "Failed to create PayPal order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
