"use server";

/**
 * Bundle server actions — consumer entrypoint.
 *
 * Thin wrapper: authenticates, rate-limits, then delegates to
 * addBundleToCartAction in appkit. The caller (page server action) is
 * responsible for redirecting to checkout after this resolves.
 */

import { redirect } from "@/i18n/navigation";
import { requireAuthUser, rateLimitByIdentifier, RateLimitPresets } from "@mohasinac/appkit";
import { addBundleToCartAction } from "@mohasinac/appkit/server";
import { ROUTES } from "@mohasinac/appkit";

export async function buyBundleAction(input: {
  bundleSlug: string;
  /** Copies of the whole bundle. Bundles are all-or-nothing. */
  quantity?: number;
}): Promise<void> {
  const user = await requireAuthUser();
  await rateLimitByIdentifier(`bundle:buy:${user.uid}`, RateLimitPresets.STRICT);
  await addBundleToCartAction(user.uid, input.bundleSlug, input.quantity ?? 1);
  redirect(`${String(ROUTES.USER.CHECKOUT)}?directItem=${encodeURIComponent(input.bundleSlug)}&type=bundle`);
}

/**
 * Same add, no redirect — the buyer stays on the bundle page.
 *
 * Without this there is no way to get a bundle INTO the cart and leave it
 * there, so "editable in the cart" had nothing to edit: the only bundle CTA
 * added the line and immediately pushed the buyer past the cart to checkout.
 */
export async function addBundleToCartOnlyAction(input: {
  bundleSlug: string;
  quantity?: number;
}): Promise<void> {
  const user = await requireAuthUser();
  await rateLimitByIdentifier(`bundle:add:${user.uid}`, RateLimitPresets.STRICT);
  await addBundleToCartAction(user.uid, input.bundleSlug, input.quantity ?? 1);
}
