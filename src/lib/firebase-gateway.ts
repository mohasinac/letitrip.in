/**
 * Shared helper for calling Firebase HTTPS functions via the gateway.
 *
 * Prefers the single gateway URL (FIREBASE_FUNCTION_GATEWAY_URL) which
 * dispatches via `{ action, ...params }`. Falls back to the per-function
 * URL env vars if the gateway is not set.
 *
 * Returns `null` when neither the gateway nor the specific function URL
 * is configured, so the caller can fall through to a local fallback.
 */

import { logError } from "@/lib/logger";

const GATEWAY_URL = () => process.env.FIREBASE_FUNCTION_GATEWAY_URL;
const SECRET = () => process.env.LETITRIP_INTERNAL_SECRET;

export type GatewayAction =
  | "listingProcessor"
  | "adminAnalytics"
  | "storeAnalytics"
  | "promotionsApi"
  | "triggerEventRaffle"
  | "assignSpinPrize";

const ACTION_FALLBACK_ENV: Record<GatewayAction, string> = {
  listingProcessor: "FIREBASE_FUNCTION_LISTING_URL",
  adminAnalytics: "FIREBASE_FUNCTION_ADMIN_ANALYTICS_URL",
  storeAnalytics: "FIREBASE_FUNCTION_STORE_ANALYTICS_URL",
  promotionsApi: "FIREBASE_FUNCTION_PROMOTIONS_URL",
  triggerEventRaffle: "FIREBASE_FUNCTION_GATEWAY_URL",
  assignSpinPrize: "FIREBASE_FUNCTION_GATEWAY_URL",
};

function resolveUrl(action: GatewayAction): { url: string; viaGateway: boolean } | null {
  const secret = SECRET();
  if (!secret) return null;

  const gw = GATEWAY_URL();
  if (gw) return { url: gw, viaGateway: true };

  const direct = process.env[ACTION_FALLBACK_ENV[action]];
  if (direct) return { url: direct, viaGateway: false };

  return null;
}

export async function callFirebaseFunction<T = unknown>(
  action: GatewayAction,
  params: Record<string, unknown> = {},
): Promise<T | null> {
  const resolved = resolveUrl(action);
  if (!resolved) return null;

  const secret = SECRET()!;
  const body = resolved.viaGateway
    ? { action, ...params }
    : params;

  const upstream = await fetch(resolved.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": secret,
    },
    body: JSON.stringify(body),
  });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    const err = new Error(`${action} returned ${upstream.status}: ${text}`);
    logError(`callFirebaseFunction:${action}`, err.message, err);
    throw err;
  }

  return (await upstream.json()) as T;
}
