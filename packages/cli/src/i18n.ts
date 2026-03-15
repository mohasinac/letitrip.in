/**
 * @mohasinac/cli/i18n
 *
 * Server-side i18n helper that deep-merges message fragments from all
 * enabled @mohasinac/feat-* packages into the project's own message files.
 *
 * Local project messages always win over package defaults.
 *
 * Usage in src/i18n/request.ts:
 *
 *   import { mergeFeatureMessages } from "@mohasinac/cli/i18n";
 *   import features from "../../features.config";
 *
 *   const messages = await mergeFeatureMessages(locale, features);
 *   return { locale, messages };
 */

import type { FeaturesConfig } from "@mohasinac/contracts";

type Messages = Record<string, unknown>;

/** Maps feature key → i18n namespace used by that feature package */
const FEATURE_NAMESPACE_MAP: Record<string, string> = {
  layout: "layout",
  forms: "forms",
  auth: "auth",
  account: "account",
  products: "products",
  categories: "categories",
  cart: "cart",
  wishlist: "wishlist",
  checkout: "checkout",
  orders: "orders",
  payments: "payments",
  blog: "blog",
  reviews: "reviews",
  faq: "faq",
  search: "search",
  homepage: "home",
  admin: "admin",
  events: "events",
  auctions: "auctions",
  promotions: "promotions",
  seller: "seller",
  stores: "stores",
  "pre-orders": "preOrders",
  consultation: "consultation",
  concern: "concern",
  corporate: "corporate",
  "before-after": "beforeAfter",
  loyalty: "loyalty",
  collections: "collections",
  preorders: "preorders",
};

/**
 * Deep-merges two plain objects. `b` values win on conflict.
 */
function deepMerge(a: Messages, b: Messages): Messages {
  const result: Messages = { ...a };
  for (const key of Object.keys(b)) {
    const av = a[key];
    const bv = b[key];
    if (
      bv !== null &&
      typeof bv === "object" &&
      !Array.isArray(bv) &&
      av !== null &&
      typeof av === "object" &&
      !Array.isArray(av)
    ) {
      result[key] = deepMerge(av as Messages, bv as Messages);
    } else {
      result[key] = bv;
    }
  }
  return result;
}

/**
 * Attempts to load a feature package's message fragment for the given locale.
 * Returns an empty object if the package or locale file is not found — so
 * missing packages never cause a runtime error during development.
 */
async function tryLoadFeatureMessages(
  featureKey: string,
  locale: string,
): Promise<Messages> {
  try {
    const pkg = `@mohasinac/feat-${featureKey}`;
    const mod = await import(`${pkg}/messages/${locale}.json`);
    return (mod.default ?? mod) as Messages;
  } catch {
    // Package not installed or locale file missing — safe to ignore
    return {};
  }
}

/**
 * Loads the project's own message file for the locale, then deep-merges
 * message fragments from all enabled feature packages on top.
 * Project-local messages always win on conflict.
 *
 * @param locale  BCP 47 locale tag, e.g. "en"
 * @param features  The project's features.config.ts default export
 * @param messagesGlob  Optional path to the project messages dir (default: "messages")
 *
 * @example
 * ```ts
 * // src/i18n/request.ts
 * import { mergeFeatureMessages } from "@mohasinac/cli/i18n";
 * import features from "../../features.config";
 *
 * return getRequestConfig(async ({ requestLocale }) => {
 *   const locale = resolveLocale(await requestLocale);
 *   const messages = await mergeFeatureMessages(locale, features);
 *   return { locale, messages };
 * });
 * ```
 */
export async function mergeFeatureMessages(
  locale: string,
  features: FeaturesConfig,
): Promise<Messages> {
  // Load the project's own message file — this is always the authority
  let projectMessages: Messages = {};
  try {
    const mod = await import(`../../messages/${locale}.json`);
    projectMessages = (mod.default ?? mod) as Messages;
  } catch {
    // Tolerate missing file in edge cases (e.g. test environments)
  }

  // Collect enabled feature keys that have a known namespace
  const enabledKeys = Object.entries(features)
    .filter(([key, enabled]) => enabled && key in FEATURE_NAMESPACE_MAP)
    .map(([key]) => key);

  // Load all feature fragments in parallel
  const fragments = await Promise.all(
    enabledKeys.map((key) => tryLoadFeatureMessages(key, locale)),
  );

  // Build base from feature fragments (later features win over earlier ones)
  let base: Messages = {};
  for (const fragment of fragments) {
    base = deepMerge(base, fragment);
  }

  // Project messages override everything
  return deepMerge(base, projectMessages);
}
