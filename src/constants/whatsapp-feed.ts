/**
 * WHY: Meta Commerce Manager syncs a catalogue by fetching a flat product file
 *      from a URL on a schedule. A seller pastes their own feed URL into their
 *      own Commerce Manager and connects their own WhatsApp Business Account —
 *      so LetItRip never holds a seller's Meta access token.
 *
 *      That is the whole point of the URL-feed shape over the Graph API push
 *      that was removed in 910e68a4e: the old design stored a per-store
 *      `whatsappConfig.accessToken`, encrypted, decrypted on every read of the
 *      store document. A public feed needs no credential on either side.
 *
 * 🛑 Why these paths live here and not in appkit's `ROUTES`:
 *      the consumer is pinned to a published appkit version, so a path added to
 *      appkit's route map does not exist for this app until appkit is rebuilt,
 *      published and the pin moved — a separately-requested step (Rule #10).
 *      Same reasoning, and the same follow-up, as `authenticity-routes.ts`:
 *      move these into `ROUTES` at the next publish and delete the file.
 *
 * EXPORTS: WHATSAPP_FEED_PATH, STORE_WHATSAPP_PATH, FEED_LISTING_TYPES,
 *          WHATSAPP_CATALOGUE_LINK_BASE, metaFeedCondition
 *
 * @tag domain:whatsapp
 * @tag layer:constants
 * @tag access:shared
 */

/**
 * The per-store feed. Must match `src/app/whatsapp/[storeSlug]/feed.csv/route.ts`.
 *
 * 🛑 The `.csv` suffix is LOAD-BEARING, not cosmetic. `src/proxy.ts`'s matcher
 * excludes `.*\\..*` — any path containing a dot — so a dotted path skips the
 * next-intl middleware and is never locale-prefixed. An extensionless
 * `/whatsapp/{slug}/feed` would be rewritten to `/en/whatsapp/{slug}/feed`,
 * which no file backs, and Meta would record a 404 on every scheduled fetch.
 * That is exactly how `/media/<slug>` and `/opengraph-image` broke before they
 * were added to the exclusion list by name (see the comments on that matcher).
 */
export const WHATSAPP_FEED_PATH = (storeSlug: string): string =>
  `/whatsapp/${storeSlug}/feed.csv`;

/** The seller-facing instructions page. Must match `src/app/[locale]/store/whatsapp/page.tsx`. */
export const STORE_WHATSAPP_PATH = "/store/whatsapp" as const;

/**
 * WhatsApp's own public "browse my catalogue" link, as shown in the Business
 * app under Catalogue → Share.
 *
 * 🛑 It is keyed on the PHONE NUMBER even when the account has a username —
 * verified against a live account whose username is set and whose share link is
 * still `wa.me/c/<number>`. So a username does not keep the number out of this
 * link, and nothing here should imply otherwise.
 */
export const WHATSAPP_CATALOGUE_LINK_BASE = "https://wa.me/c/" as const;

/*
 * 🛑 THE FEED'S LISTING TYPES ARE NOT DEFINED HERE, DELIBERATELY.
 *
 * The first draft of this file carried a hardcoded
 * `["standard","art","stickers","digital-code"]`, and it was already wrong on
 * the day it was written: the union has since gained `spares`, which is
 * `canAddToCart: true` and would have been silently absent from every seller's
 * catalogue forever. That is Root Cause #61 — a hand-written enumeration of a
 * union that grows without it — and #58, where a type added to the union but
 * not to an allowlist simply vanishes with no error anywhere.
 *
 * The live set is derived in the route from
 * `enabledListingTypes(settings)` ∩ `LISTING_TYPE_CAPABILITIES[t].canAddToCart`,
 * so a tenth listing type joins automatically and an admin disabling a type
 * removes it from every feed on the next fetch.
 *
 * It lives in the route rather than in this file because this module is
 * imported by the seller panel (a Client Component) and by the nav config.
 * Importing the appkit barrel here to reach those helpers would pull a
 * server-reaching import chain into the client bundle — Root Cause #6, and the
 * exact trap `navigation.tsx`'s own header documents paying for.
 */

/**
 * Meta accepts exactly three condition values. `ProductDocument.condition`
 * carries nine.
 *
 * 🛑 An unmapped value is not dropped by Meta, it REJECTS the row — so the
 * default must be a real value, not a pass-through. Everything that is neither
 * factory-new nor vendor-refurbished is `used`, which is true of `like_new`,
 * `good`, `fair`, `poor`, `broken` and `graded` alike.
 */
export function metaFeedCondition(condition: string | undefined): "new" | "refurbished" | "used" {
  if (condition === "new") return "new";
  if (condition === "refurbished") return "refurbished";
  return "used";
}
