/**
 * SEO wiring for the authenticity checker.
 *
 * 🛑 The problem this file solves: the interactive checker needs a signed-in
 * account, and a page whose only content is "please sign in" is thin content to
 * a crawler and useless to a visitor who arrived from search. Two wrong answers
 * were available and both are rejected here:
 *
 *   - `noindex` the page. Throws away the one surface on this site that answers
 *     "is my Beyblade real", which is a high-intent query nobody in the
 *     competitor crawl owns an answer to.
 *   - Serve the reference content to crawler user-agents only. That is cloaking.
 *
 * So the page serves the SAME reference content to everyone — the generation
 * table, the universal checks, the disputed-decoding explanation, the licensed
 * marques — and gates only the interactive lookup. Then it DECLARES the gate in
 * structured data instead of hiding it, exactly as `gatedPriceWebPageJsonLd`
 * does for guest-gated prices.
 */

/**
 * Marks the gated interactive region in the DOM.
 *
 * 🛑 This constant and the `cssSelector` below are ONE contract, and the project
 * has already been bitten by splitting it: Root Cause #93 records
 * `GATED_PRICE_CLASS` and `GATED_PRICE_SELECTOR` as two literals in two files
 * that must agree, where a rename on one side points the crawler at a selector
 * matching nothing — indistinguishable from making no declaration at all.
 *
 * Here they cannot drift, because the selector is DERIVED from the class below.
 * Keep it that way: never hand-write the dotted form.
 */
export const AUTHENTICITY_GATED_CLASS = "authenticity-gated-tool" as const;

const GATED_SELECTOR = `.${AUTHENTICITY_GATED_CLASS}`;

type JsonLdValue = string | number | boolean | null | JsonLdValue[] | { [k: string]: JsonLdValue };

/**
 * A `WebApplication` for the tool, plus an explicit declaration that one region
 * of the page needs an account.
 *
 * `isAccessibleForFree: true` at the page level is the honest value — the
 * reference content genuinely is free, and that is most of the page.
 * `hasPart` then carves out the lookup as the part that is not.
 */
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
    browserRequirements: "Requires JavaScript and a LetItRip account",
    isAccessibleForFree: true,
    hasPart: {
      "@type": "WebPageElement",
      name: "Authenticity lookup",
      isAccessibleForFree: false,
      cssSelector: GATED_SELECTOR,
    },
  };
}
