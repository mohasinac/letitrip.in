import checkoutNodeJssdk from "@paypal/checkout-server-sdk";

/**
 * Get PayPal environment
 */
function getPayPalEnvironment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || "sandbox";

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  if (mode === "production") {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
  }
}

/**
 * Get PayPal client
 */
export function getPayPalClient(): checkoutNodeJssdk.core.PayPalHttpClient {
  const environment = getPayPalEnvironment();
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment);
}

/**
 * Convert INR to USD with 7% fee
 */
export function convertToUSDWithFee(amountInINR: number): {
  usdAmount: number;
  fee: number;
  total: number;
  exchangeRate: number;
} {
  // Use a default exchange rate or fetch from API
  const exchangeRate = 83; // 1 USD = 83 INR (approximate)
  const usdAmount = amountInINR / exchangeRate;
  const fee = usdAmount * 0.07; // 7% fee
  const total = usdAmount + fee;

  return {
    usdAmount: Math.round(usdAmount * 100) / 100,
    fee: Math.round(fee * 100) / 100,
    total: Math.round(total * 100) / 100,
    exchangeRate,
  };
}

/**
 * Create PayPal order
 */
export async function createPayPalOrder(
  amountUSD: number,
  currency: string = "USD"
): Promise<any> {
  try {
    const client = getPayPalClient();

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amountUSD.toFixed(2),
          },
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
      },
    });

    const response = await client.execute(request);
    return response.result;
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    throw new Error("Failed to create PayPal order");
  }
}

/**
 * Capture PayPal payment
 */
export async function capturePayPalPayment(orderId: string): Promise<any> {
  try {
    const client = getPayPalClient();

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await client.execute(request);
    return response.result;
  } catch (error) {
    console.error("Error capturing PayPal payment:", error);
    throw new Error("Failed to capture PayPal payment");
  }
}

/**
 * Fetch PayPal order details
 */
export async function fetchPayPalOrder(orderId: string): Promise<any> {
  try {
    const client = getPayPalClient();

    const request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderId);
    const response = await client.execute(request);
    return response.result;
  } catch (error) {
    console.error("Error fetching PayPal order:", error);
    throw new Error("Failed to fetch PayPal order");
  }
}

/**
 * Refund PayPal payment
 */
export async function refundPayPalPayment(
  captureId: string,
  amount?: number,
  currency: string = "USD"
): Promise<any> {
  try {
    const client = getPayPalClient();

    const request = new checkoutNodeJssdk.payments.CapturesRefundRequest(captureId);
    request.requestBody({
      amount: amount
        ? {
            value: amount.toFixed(2),
            currency_code: currency,
          }
        : undefined,
    });

    const response = await client.execute(request);
    return response.result;
  } catch (error) {
    console.error("Error refunding PayPal payment:", error);
    throw new Error("Failed to refund PayPal payment");
  }
}
