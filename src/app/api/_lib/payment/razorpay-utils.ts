import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Initialize Razorpay instance
 */
export function getRazorpayInstance(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Create a Razorpay order
 */
export async function createRazorpayOrder(
  amount: number,
  currency: string = "INR",
  receipt: string
): Promise<any> {
  try {
    const razorpay = getRazorpayInstance();

    // Amount should be in smallest currency unit (paise for INR)
    const amountInSmallestUnit = Math.round(amount * 100);

    const orderOptions = {
      amount: amountInSmallestUnit,
      currency: currency.toUpperCase(),
      receipt,
      payment_capture: 1, // Auto-capture payment
    };

    const order = await razorpay.orders.create(orderOptions);
    return order;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw new Error("Failed to create Razorpay order");
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      throw new Error("Razorpay key secret not configured");
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return generatedSignature === signature;
  } catch (error) {
    console.error("Error verifying Razorpay signature:", error);
    return false;
  }
}

/**
 * Fetch payment details from Razorpay
 */
export async function fetchRazorpayPayment(paymentId: string): Promise<any> {
  try {
    const razorpay = getRazorpayInstance();
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error("Error fetching Razorpay payment:", error);
    throw new Error("Failed to fetch payment details");
  }
}

/**
 * Refund a Razorpay payment
 */
export async function refundRazorpayPayment(
  paymentId: string,
  amount?: number
): Promise<any> {
  try {
    const razorpay = getRazorpayInstance();

    const refundOptions: any = {};
    if (amount) {
      refundOptions.amount = Math.round(amount * 100); // Convert to paise
    }

    const refund = await razorpay.payments.refund(paymentId, refundOptions);
    return refund;
  } catch (error) {
    console.error("Error refunding Razorpay payment:", error);
    throw new Error("Failed to refund payment");
  }
}

/**
 * Load Razorpay script on client side
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
