/*
 * audit-homepage-config-coverage — every homepage section config field must
 * reach the renderer.
 *
 * THE BUG THIS EXISTS FOR: `lib/section-renderer.tsx` silently dropped most of
 * what the admin section builder writes. The ENTIRE `CarouselSectionConfig`
 * (height, autoplay delay, dots, arrows, pause-on-hover) was ignored — the
 * renderer emitted `<HeroCarousel initialSlides={slides} />` and nothing else.
 * The banner read only `content.title`, discarding its buttons, background,
 * height, subtitle and description. `trust-indicators` and `features` ignored
 * their configured lists and always rendered a hardcoded fallback. Eight
 * section types accepted a `subtitle` that was never passed on, several
 * `maxItems` caps went nowhere, and the products builder wrote `maxProducts`
 * while the renderer read `maxItems`.
 *
 * None of it errored. An admin edited a field, saved, got a 200, reloaded, and
 * the page looked exactly the same — which reads as "the value was already
 * that" rather than as a defect.
 *
 * Strict-zero. A field that genuinely cannot be rendered yet is triaged with a
 * `// NO-RENDERER: <reason>` marker ON ITS DECLARATION LINE, so the decision is
 * recorded next to the field instead of being inferred from silence.
 *
 * The heuristic is name-presence in the renderer, not dataflow — it cannot
 * prove a field is USED correctly, only that the renderer mentions it. That is
 * deliberately cheap; it catches the whole class above without a TS compiler in
 * the loop, matching audit-filter-tab-enums' precedent.
 */
import fs from "node:fs";

const schema = fs.readFileSync(
  "appkit/src/features/homepage/schemas/firestore.ts",
  "utf8"
);
const renderer = fs.readFileSync(
  "appkit/src/features/homepage/lib/section-renderer.tsx",
  "utf8"
);

// Fields resolved inside their own component rather than named in the renderer,
// or handled by a nested/whole-object pass-through.
const INDIRECT = new Set([
  // whole-config pass-throughs: <PrizeDrawsSection config={cfg} /> etc.
  "storeId", "revealStatus", "showCountdown", "showEntriesRemaining",
  "raffleType", "showEntryCount",
  "collections", "layout", "itemsPerRow", "showCollectionTabs",
  // banner content.* / buttons[] are destructured via cfg.content / cfg.buttons
  "text", "link", "variant",
  // stats rows are mapped as objects
  "key", "label", "value", "metric", "collectionQuery", "suffix",
  "type", "collection", "filterField", "filterValue",
  // trust indicator / feature item row fields
  "id", "icon", "description",
  // google-reviews + social-feed + custom-cards whole-config pass-throughs
  "minRating", "showRating", "showDate", "linkToGoogleMaps", "googleMapsUrl",
  "posts", "videoId", "channelName", "caption",
  "cards", "columns", "scrollIntervalMs",
  "gradientFrom", "gradientTo", "gradientAngle", "color", "url", "mobileUrl",
  "thumbnail", "dimOverlay", "enabled", "opacity",
]);

const blockRe = /export interface (\w*SectionConfig) \{([\s\S]*?)\n\}/g;
let m;
const missing = [];
let checked = 0;

while ((m = blockRe.exec(schema)) !== null) {
  const [, name, body] = m;
  const fieldRe = /^\s{2}(\w+)\??:/gm;
  let f;
  while ((f = fieldRe.exec(body)) !== null) {
    const field = f[1];
    if (INDIRECT.has(field)) continue;
    // Explicitly triaged as having no renderer path, with a stated reason.
    // Skip comment lines — a prose mention of the field name is not its
    // declaration, and matching one hides the real line's marker.
    const declLine =
      body
        .split("\n")
        .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
        .find((l) => new RegExp("\\b" + field + "\\??:").test(l)) || "";
    if (declLine.includes("NO-RENDERER")) continue;
    checked++;
    if (!new RegExp("\\b" + field + "\\b").test(renderer)) {
      missing.push(`${name}.${field}`);
    }
  }
}

console.log(`checked ${checked} config fields across *SectionConfig interfaces`);
if (missing.length) {
  console.log(`\nNOT REFERENCED BY THE RENDERER (${missing.length}):`);
  for (const x of missing) console.log("  •", x);
  process.exit(1);
}
console.log("every field reaches section-renderer.tsx ✓");
