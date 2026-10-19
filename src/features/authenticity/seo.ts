/**
 * SEO wiring for the authenticity checker.
 *
 * 🛑 THE PAYWALL DECLARATION IS GONE BECAUSE THE PAYWALL IS GONE, and the two
 * had to move together.
 *
 * This file used to export `AUTHENTICITY_GATED_CLASS` and emit a `hasPart` node
 * with `isAccessibleForFree: false` naming it, because the interactive lookup
 * needed an account while the reference content did not. The lookup is now open
 * to everyone, so that node would be declaring a gate a crawler can see does
 * not exist — a structured-data claim contradicted by the page itself, which is
 * worse than making no claim. The class went with it rather than being left in
 * the DOM as a selector nothing names (Root Cause #93 is about exactly that
 * pair drifting apart).
 *
 * What stays true: the page is indexable, the content is identical for
 * crawlers and humans, and `noindex` was never the answer — "is my Beyblade
 * real" is a high-intent query nobody in the competitor crawl owns.
 */

type JsonLdValue = string | number | boolean | null | JsonLdValue[] | { [k: string]: JsonLdValue };

/** A `WebApplication` for the tool. Free, in full, to everyone. */
export function authenticityToolJsonLd(opts: {
  readonly siteUrl: string;
  readonly path: string;
  readonly name: string;
  readonly description: string;
}): Record<string, JsonLdValue> {
  const url = `${opts.siteUrl.replace(/\/$/, "")}${opts.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: opts.name,
    description: opts.description,
    url,
    applicationCategory: "UtilitiesApplication",
    /*
     * `browserRequirements` rather than a price: the tool costs nothing, and an
     * `offers` node with price 0 on a free utility invites a rich result that
     * reads like a product listing.
     */
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
  };
}
