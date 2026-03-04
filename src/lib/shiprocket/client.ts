/**
 * Shiprocket API Client
 *
 * Server-side only. All functions require a valid Shiprocket JWT token.
 * Token acquisition and caching is handled by the caller (see sellerShippingService).
 *
 * API base: https://apiv2.shiprocket.in/v1/external
 */

import { serverLogger } from "@/lib/server-logger";
import type {
  ShiprocketAuthRequest,
  ShiprocketAuthResponse,
  ShiprocketPickupLocationsResponse,
  ShiprocketAddPickupRequest,
  ShiprocketAddPickupResponse,
  ShiprocketVerifyPickupOTPRequest,
  ShiprocketVerifyPickupOTPResponse,
  ShiprocketCreateOrderRequest,
  ShiprocketCreateOrderResponse,
  ShiprocketGenerateAWBRequest,
  ShiprocketAWBResponse,
  ShiprocketGeneratePickupRequest,
  ShiprocketPickupResponse,
  ShiprocketTrackingResponse,
  ShiprocketCourierServiceabilityResponse,
} from "./types";

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

// ─── Internal Fetch Helper ────────────────────────────────────────────────────

async function shiprocketFetch<T>(
  endpoint: string,
  options: Omit<RequestInit, "headers"> & {
    token?: string;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const { token, headers = {}, ...rest } = options;

  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (token) reqHeaders["Authorization"] = `Bearer ${token}`;

  const url = `${BASE_URL}${endpoint}`;

  serverLogger.info("Shiprocket API request", {
    endpoint,
    method: rest.method ?? "GET",
  });

  const response = await fetch(url, {
    ...rest,
    headers: reqHeaders,
  });

  const text = await response.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      `Shiprocket API non-JSON response ${response.status}: ${text.slice(0, 200)}`,
    );
  }

  if (!response.ok) {
    const message =
      (json as { message?: string })?.message ??
      `Shiprocket API error ${response.status}`;
    serverLogger.error("Shiprocket API error response", {
      endpoint,
      status: response.status,
      message,
    });
    throw new Error(message);
  }

  return json as T;
}

// ─── Authentication ───────────────────────────────────────────────────────────

/**
 * Authenticate with Shiprocket using seller credentials.
 * Returns a JWT token valid for ~10 days.
 */
export async function shiprocketAuthenticate(
  credentials: ShiprocketAuthRequest,
): Promise<ShiprocketAuthResponse> {
  return shiprocketFetch<ShiprocketAuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

// ─── Pickup Addresses ─────────────────────────────────────────────────────────

/**
 * Fetch all pickup locations registered for the Shiprocket account.
 */
export async function shiprocketGetPickupLocations(
  token: string,
): Promise<ShiprocketPickupLocationsResponse> {
  return shiprocketFetch<ShiprocketPickupLocationsResponse>(
    "/settings/company/pickup",
    { token },
  );
}

/**
 * Add a new pickup address to the Shiprocket account.
 * Shiprocket will send an OTP to the phone number for verification.
 */
export async function shiprocketAddPickupLocation(
  token: string,
  data: ShiprocketAddPickupRequest,
): Promise<ShiprocketAddPickupResponse> {
  return shiprocketFetch<ShiprocketAddPickupResponse>(
    "/settings/company/addpickup",
    {
      method: "POST",
      token,
      body: JSON.stringify(data),
    },
  );
}

/**
 * Verify pickup address OTP sent by Shiprocket to the registered phone.
 */
export async function shiprocketVerifyPickupOTP(
  token: string,
  data: ShiprocketVerifyPickupOTPRequest,
): Promise<ShiprocketVerifyPickupOTPResponse> {
  return shiprocketFetch<ShiprocketVerifyPickupOTPResponse>(
    "/settings/company/verifyOtpForPickup",
    {
      method: "POST",
      token,
      body: JSON.stringify(data),
    },
  );
}

// ─── Order Creation ───────────────────────────────────────────────────────────

/**
 * Create a forward shipment order in Shiprocket.
 * Returns Shiprocket's order_id, shipment_id, and optionally an AWB.
 */
export async function shiprocketCreateOrder(
  token: string,
  order: ShiprocketCreateOrderRequest,
): Promise<ShiprocketCreateOrderResponse> {
  return shiprocketFetch<ShiprocketCreateOrderResponse>(
    "/orders/create/adhoc",
    {
      method: "POST",
      token,
      body: JSON.stringify(order),
    },
  );
}

// ─── AWB Assignment ──────────────────────────────────────────────────────────

/**
 * Assign an AWB (Air Waybill) to a shipment.
 * If courier_id is omitted, Shiprocket auto-selects the best courier.
 */
export async function shiprocketGenerateAWB(
  token: string,
  params: ShiprocketGenerateAWBRequest,
): Promise<ShiprocketAWBResponse> {
  return shiprocketFetch<ShiprocketAWBResponse>("/courier/assign/awb", {
    method: "POST",
    token,
    body: JSON.stringify(params),
  });
}

// ─── Pickup Scheduling ───────────────────────────────────────────────────────

/**
 * Schedule a pickup for one or more Shiprocket shipments.
 */
export async function shiprocketGeneratePickup(
  token: string,
  params: ShiprocketGeneratePickupRequest,
): Promise<ShiprocketPickupResponse> {
  return shiprocketFetch<ShiprocketPickupResponse>(
    "/courier/generate/pickup",
    {
      method: "POST",
      token,
      body: JSON.stringify(params),
    },
  );
}

// ─── Tracking ────────────────────────────────────────────────────────────────

/**
 * Track a shipment by AWB number.
 */
export async function shiprocketTrackByAWB(
  token: string,
  awb: string,
): Promise<ShiprocketTrackingResponse> {
  return shiprocketFetch<ShiprocketTrackingResponse>(
    `/courier/track/awb/${awb}`,
    { token },
  );
}

// ─── Serviceability ──────────────────────────────────────────────────────────

/**
 * Check courier serviceability and rates between two pincodes.
 */
export async function shiprocketCheckCourierServiceability(
  token: string,
  pickupPostcode: string,
  deliveryPostcode: string,
  weight: number,
  cod = false,
): Promise<ShiprocketCourierServiceabilityResponse> {
  const params = new URLSearchParams({
    pickup_postcode: pickupPostcode,
    delivery_postcode: deliveryPostcode,
    weight: String(weight),
    cod: cod ? "1" : "0",
  });
  return shiprocketFetch<ShiprocketCourierServiceabilityResponse>(
    `/courier/serviceability/?${params}`,
    { token },
  );
}

// ─── Token Expiry Helper ─────────────────────────────────────────────────────

/** Shiprocket tokens are valid for approx. 10 days */
export const SHIPROCKET_TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000; // 9 days

export function isShiprocketTokenExpired(expiry: Date | undefined): boolean {
  if (!expiry) return true;
  return new Date() >= new Date(expiry);
}
