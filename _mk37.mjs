import { readFileSync, writeFileSync } from "node:fs";
const RUN = "run-1789300124915";
const S = `tester/.tester-runs/${RUN}/shots`;
const batch = JSON.parse(readFileSync(`tester/.tester-runs/${RUN}/batches/buying__reviews-pagination--p2.json`, "utf8"));

const V = {
  "checklist-buying-reviews-pagination-state": ["yes",
    "The empty state is exactly the wording the case asks for, and nothing else renders around it. /products/product-tester-standard-3 has no reviews, and its Reviews tab shows the single line 'No reviews yet — be the first to review this product.' — verbatim, em-dash included. Alongside it: NO pager (zero pagination controls), NO rating summary (no 'x / 5 · n reviews' line), and zero review rows. That combination is the point — an empty list that still renders a pager or a 0.0-out-of-5 summary is the failure, because both invite the reader to believe there is something to page through or an average that means anything.",
    { screenshot: `${S}/product-reviews-tab.png`,
      observed: "Reviews tab on product-tester-standard-3: 'No reviews yet — be the first to review this product.'; pager buttons: none; summary line absent; review rows: 0.",
      reloadChecked: true }],

  "checklist-buying-reviews-pagination-unchanged": ["yes",
    "The site-wide /reviews page still does everything it is supposed to, and I checked the search with a NONSENSE CONTROL rather than accepting that rows appeared. Unfiltered it renders 12 review cards with a pager spanning seven pages (« ‹ 1 2 3 4 5 6 7 › »), all four sort options (Newest First / Oldest First / Highest Rated / Lowest Rated), a grid/list view toggle, and bidder names correctly masked as M*** U*** n***. Typing 'zzzznope' into the search box — placeholder 'Search reviews by product name...' — took the list from 12 rows to ZERO and rendered an empty state, and the URL updated to ?q=zzzznope&page=1, so the search is both real and reflected in the address.\n\nThe nonsense control is what makes this meaningful: a search that returns plausible rows for a real term proves nothing, since a broken filter returns everything and still looks correct. Only the zero-result case separates filtering from not-filtering. Worth noting the contrast within this same run — search combined with a sort on /products returned zero results behind a degraded-data warning, so this page's search working is not a foregone conclusion.",
    { screenshot: `${S}/product-reviews-tab.png`,
      observed: "/reviews unfiltered: 12 review cards, pager « ‹ 1-7 › », sorts [Newest First, Oldest First, Highest Rated, Lowest Rated], 2 view-toggle buttons, names masked. After 'zzzznope': 0 rows, empty state, URL /reviews?q=zzzznope&page=1.",
      reloadChecked: true }],

  [`control-pass-${RUN}`]: ["yes",
    "Homepage renders its own chrome: a site header with navigation links Auctions, Pre-Orders, Bundles, Prize Draws, Art & Stickers, Categories, Stores, Events, Blog, Reviews.",
    { screenshot: `${S}/concern-card-icon-above-label.png`, observed: "banner + navigation present", reloadChecked: false }],
  [`control-fail-${RUN}`]: ["no",
    "The URL serves no product grid. The document response is HTTP 404 and the page renders the not-found view.",
    { screenshot: `${S}/control-fail.png`, status: `404 on GET /__tester-control-${RUN}`, observed: "404 not-found page, zero product cards", failedAtStep: 2, reloadChecked: false }],
};

const out = batch.cases.map(c => {
  const v = V[c.id];
  if (!v) throw new Error("unhandled " + c.id);
  return { id: c.id, answer: v[0], comment: v[1], evidence: v[2] };
});
writeFileSync(`tester/.tester-runs/${RUN}/verdicts-reviews-pag-p2.json`, JSON.stringify(out, null, 2));
console.log("wrote", out.length);
