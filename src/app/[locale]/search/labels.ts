/**
 * Group headings for `/search`, keyed by the artifact's `typeKey`.
 *
 * ## 🛑 Why these live in the consumer and NOT in the artifact
 *
 * `SearchIndexType` deliberately carries no `label`. A human-readable
 * heading baked into one shared, immutable, CDN-cached artifact is
 * untranslatable — this app is `[locale]`-routed and every other UI string
 * goes through the label system. The artifact ships stable keys; the
 * rendering layer names them.
 *
 * ## 🛑 A plain object, because it crosses the RSC boundary
 *
 * `page.tsx` is a Server Component and `SearchResultsClient` is a Client
 * Component. A `(key) => string` prop is not serialisable across that
 * boundary and fails at render rather than at compile, so the map travels as
 * data and the client closes over it.
 *
 * ## An unknown key is NOT a bug here
 *
 * `SearchResultsClient` falls back to the key itself. Adding a type to the
 * index is a one-line change in `sources.ts`, and it should not be able to
 * make a whole group of real results vanish from the page because nobody
 * remembered this file. A heading reading `scammer` is a prompt to add an
 * entry; a missing group is a silent hole.
 */
export const SEARCH_GROUP_LABELS: Readonly<Record<string, string>> = {
  // The nine listing types, named as a shopper would say them.
  standard: "Products",
  auction: "Auctions",
  "pre-order": "Pre-orders",
  "prize-draw": "Prize draws",
  classified: "Classifieds",
  "digital-code": "Digital codes",
  live: "Live items",
  art: "Art prints",
  stickers: "Sticker sheets",

  // Taxonomy.
  category: "Categories",
  brand: "Brands",
  franchise: "Franchises",
  bundle: "Bundles",
  model: "Models",
  part: "Parts",

  // Everything else with a public page.
  store: "Stores",
  blog: "Articles",
  event: "Events",
  faq: "Help",
  review: "Reviews",
  scammer: "Scam reports",
  group: "Collections",
  coupon: "Offers",
};
