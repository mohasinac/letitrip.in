/**
 * Meta (Facebook / Instagram) Graph API — Platform Integration
 *
 * Used for platform-level product catalog sync and ads management.
 * An admin connects the platform Facebook Page once via the Meta App Review
 * process; the resulting long-lived page access token is stored encrypted in
 * siteSettings.credentials.metaPageAccessToken.
 *
 * Credential resolution order:
 *   1. Firestore siteSettings.credentials (admin-configurable via Admin › Site Settings)
 *   2. Environment variables META_APP_ID / META_APP_SECRET / META_PAGE_ACCESS_TOKEN / META_PAGE_ID
 *
 * This module is server-side only.
 */

import { AppError } from "@/lib/errors";
import { siteSettingsRepository } from "@/repositories";

const GRAPH_BASE = "https://graph.facebook.com/v20.0";

// ─── Credential Resolution ────────────────────────────────────────────────────

export interface MetaCredentials {
  appId: string;
  appSecret: string;
  pageAccessToken: string;
  pageId: string;
}

async function resolveCredentials(): Promise<MetaCredentials> {
  let appId = "";
  let appSecret = "";
  let pageAccessToken = "";
  let pageId = "";
  try {
    const creds = await siteSettingsRepository.getDecryptedCredentials();
    appId = creds.metaAppId || "";
    appSecret = creds.metaAppSecret || "";
    pageAccessToken = creds.metaPageAccessToken || "";
    pageId = creds.metaPageId || "";
  } catch {
    // DB unavailable — fall through to env vars
  }
  return {
    appId: appId || process.env.META_APP_ID || "",
    appSecret: appSecret || process.env.META_APP_SECRET || "",
    pageAccessToken:
      pageAccessToken || process.env.META_PAGE_ACCESS_TOKEN || "",
    pageId: pageId || process.env.META_PAGE_ID || "",
  };
}

function requireCredentials(creds: MetaCredentials): void {
  if (!creds.appId || !creds.appSecret) {
    throw new AppError(
      500,
      "Meta App ID and Secret are not configured. Set them in Admin › Site Settings › Credentials.",
      "META_CONFIG_ERROR",
    );
  }
  if (!creds.pageAccessToken) {
    throw new AppError(
      500,
      "Meta page access token is not configured. Generate one via Admin › Site Settings › Credentials.",
      "META_CONFIG_ERROR",
    );
  }
}

// ─── Generic Graph API call ───────────────────────────────────────────────────

async function graphFetch<T>(
  path: string,
  options: RequestInit & { accessToken: string },
): Promise<T> {
  const { accessToken, ...rest } = options;
  const url = `${GRAPH_BASE}${path}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(rest.headers as Record<string, string>),
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const json = (await res.json()) as Record<string, unknown>;
  if (json["error"]) {
    const err = json["error"] as Record<string, unknown>;
    throw new AppError(
      res.status,
      (err["message"] as string) ?? "Meta Graph API error",
      "META_API_ERROR",
    );
  }
  return json as T;
}

// ─── Long-lived Token Exchange ────────────────────────────────────────────────

export interface MetaLongLivedTokenResponse {
  access_token: string;
  token_type: string;
}

/**
 * Exchange a short-lived user access token for a 60-day long-lived token.
 * The admin pastes the short-lived token from Meta Developers; the server
 * exchanges it and stores the result in siteSettings.credentials.metaPageAccessToken.
 *
 * @param shortLivedToken  Token from Meta Login (typically valid 1–2 hours)
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string,
): Promise<MetaLongLivedTokenResponse> {
  const { appId, appSecret } = await resolveCredentials();
  if (!appId || !appSecret) {
    throw new AppError(
      500,
      "Meta App ID and Secret are not configured",
      "META_CONFIG_ERROR",
    );
  }
  const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("fb_exchange_token", shortLivedToken);

  const res = await fetch(url.toString());
  const json = (await res.json()) as Record<string, unknown>;
  if (json["error"]) {
    const err = json["error"] as Record<string, unknown>;
    throw new AppError(
      res.status,
      (err["message"] as string) ?? "Meta token exchange failed",
      "META_TOKEN_EXCHANGE_ERROR",
    );
  }
  return json as unknown as MetaLongLivedTokenResponse;
}

// ─── Token Debug / Validation ─────────────────────────────────────────────────

export interface MetaTokenDebugInfo {
  app_id: string;
  is_valid: boolean;
  expires_at: number;
  scopes: string[];
}

/**
 * Call the /debug_token endpoint to verify the stored page access token is valid.
 * Useful for the admin UI to surface token expiry warnings.
 */
export async function debugMetaToken(): Promise<MetaTokenDebugInfo> {
  const creds = await resolveCredentials();
  requireCredentials(creds);

  const appToken = `${creds.appId}|${creds.appSecret}`;
  const url = new URL(`${GRAPH_BASE}/debug_token`);
  url.searchParams.set("input_token", creds.pageAccessToken);
  url.searchParams.set("access_token", appToken);

  const res = await fetch(url.toString());
  const json = (await res.json()) as {
    data?: MetaTokenDebugInfo;
    error?: Record<string, unknown>;
  };
  if (json.error) {
    throw new AppError(
      res.status,
      (json.error["message"] as string) ?? "Meta debug_token failed",
      "META_API_ERROR",
    );
  }
  return json.data!;
}

// ─── Product Catalog Sync ─────────────────────────────────────────────────────

export interface MetaCatalogItem {
  id: string;
  retailer_id: string;
  name: string;
  description?: string;
  price: string; // "1000 INR"
  currency?: string;
  image_url?: string;
  url?: string;
  availability?: "in stock" | "out of stock";
  condition?: "new" | "used" | "refurbished";
  brand?: string;
}

/**
 * Upsert a batch of products into the connected Meta product catalog.
 * Uses the Batch Catalog Update API (POST /<catalog_id>/items_batch).
 *
 * @param catalogId  Meta catalog ID (from the Business Manager)
 * @param items      Products to upsert (max 1000 per call)
 */
export async function syncProductsToCatalog(
  catalogId: string,
  items: MetaCatalogItem[],
): Promise<{ handles: string[] }> {
  const creds = await resolveCredentials();
  requireCredentials(creds);

  return graphFetch<{ handles: string[] }>(`/${catalogId}/items_batch`, {
    method: "POST",
    accessToken: creds.pageAccessToken,
    body: JSON.stringify({
      allow_upsert: true,
      requests: items.map((item) => ({
        method: "UPDATE",
        retailer_id: item.retailer_id,
        data: {
          name: item.name,
          description: item.description,
          price: item.price,
          currency: item.currency ?? "INR",
          image_url: item.image_url,
          url: item.url,
          availability: item.availability ?? "in stock",
          condition: item.condition ?? "new",
          brand: item.brand,
        },
      })),
    }),
  });
}

/**
 * Delete a product from the Meta catalog by retailer ID.
 */
export async function deleteFromCatalog(
  catalogId: string,
  retailerId: string,
): Promise<void> {
  const creds = await resolveCredentials();
  requireCredentials(creds);

  await graphFetch<unknown>(`/${catalogId}/items_batch`, {
    method: "POST",
    accessToken: creds.pageAccessToken,
    body: JSON.stringify({
      requests: [{ method: "DELETE", retailer_id: retailerId }],
    }),
  });
}
