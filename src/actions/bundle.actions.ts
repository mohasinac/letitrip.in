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

export async function buyBundleAction(input: { bundleSlug: string }): Promise<void> {
  const user = await requireAuthUser();
  await rateLimitByIdentifier(`bundle:buy:${user.uid}`, RateLimitPresets.STRICT);
  await addBundleToCartAction(user.uid, input.bundleSlug);
  redirect(`${String(ROUTES.USER.CHECKOUT)}?directItem=${encodeURIComponent(input.bundleSlug)}&type=bundle`);
}
