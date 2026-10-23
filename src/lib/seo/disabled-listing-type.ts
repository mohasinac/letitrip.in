import type { Metadata } from "next";
import { getSiteSettingsGlobal, safeRead } from "@mohasinac/appkit/server";
// The main barrel, matching every other consumer call site (admin.actions,
// seller.actions, /api/products). `_internal/**` has no package export and is
// blocked by `audit-violations`; this is a SERVER module, so the bare entry is
// also the correct one — `/client` here would be Root Cause #76.
import { isListingTypeEnabled } from "@mohasinac/appkit";
import type { ListingType } from "@mohasinac/appkit";

/**
 * `robots: { index: false }` for a listing type the site has switched OFF.
 *
 * ## Why this exists
 *
 * `siteSettings.listings.listingTypes` is a real kill switch, and five of the
 * ten types are off in production right now — `auction`, `classified`,
 * `digital-code`, `live` and `prize-draw`. Nothing connected that switch to
 * SEO, so each of those index pages kept advertising itself to search engines:
 * an indexable title, a description, a canonical, and a sitemap entry, for a
 * feature the operator had deliberately turned off.
 *
 * That is worse than an unlisted page. A crawler that indexes `/auctions`
 * sends real visitors to a feature the site does not currently offer, and the
 * ranking signal persists long after the switch flips. The switch and the
 * advertising have to move together.
 *
 * ## Why `noindex` and not a 404
 *
 * Deliberately the lightest correct action. The page still renders for anyone
 * holding a link, the route keeps working for an operator testing before they
 * flip the switch back on, and nothing about the listing data changes — the
 * same "don't show it, don't delete it" rule the feature badges follow. A hard
 * 404 would also discard the page's accumulated ranking the moment someone
 * toggles the feature off for an afternoon.
 *
 * ## Fails OPEN
 *
 * A settings read that fails returns `undefined` here, which leaves the page's
 * existing robots directive untouched. Hiding a working page from search
 * because Firestore blinked is a far worse outcome than briefly advertising a
 * disabled one — the same reasoning as `src/proxy.ts`'s `disabledRoutes` gate,
 * which also fails open.
 */
export async function noindexWhenListingTypeDisabled(
  type: ListingType,
  route: string,
): Promise<Pick<Metadata, "robots"> | undefined> {
  const settings = await safeRead(() => getSiteSettingsGlobal(), {
    route,
    key: "siteSettings.getSiteSettingsGlobal",
    fallback: null,
  });
  if (!settings) return undefined;
  // 🛑 Argument order is (type, settings) — every other call site spells it
  // that way (`isListingTypeEnabled("prize-draw", await …getSingleton())`).
  // Reversed, it reads `settings` as the type, matches nothing, and quietly
  // noindexes every page this is applied to.
  return isListingTypeEnabled(type, settings)
    ? undefined
    : { robots: { index: false, follow: true } };
}
