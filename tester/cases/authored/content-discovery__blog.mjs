const authored = {
  "checklist-content-discovery-blog-blog-listing": {
    roles: ["guest"],
    startPage: "/blog",
    steps: [
      "Open /blog in a private window with no session.",
      "Read every card \u2014 title, excerpt, cover image, category and read time.",
      "Note whether any card names a draft or archived post.",
      "Use the category filter, selecting each value in turn, and read the results.",
      "Page to the end of the list."
    ],
    expectedBehaviour: "The listing shows published posts only. The seed holds 17 published, 2 draft and 1 archived, so a listing showing 20 is not filtering by status at all \u2014 and status filtering is the kind of guard that gets dropped when a route stops sending a parameter the query only applied when asked.",
    expectedUiState: "Every card carries a title, an excerpt, a rendered cover image and a category. No draft or archived post appears. Each category filter value returns rows or a named empty state.",
    expectedData: { draftPostsVisible: 0 },
    endResult: "Read-only; nothing persists beyond the URL."
  },
  "checklist-content-discovery-blog-read-post": {
    roles: ["guest"],
    startPage: "/blog",
    steps: [
      "Open /blog in a private window and click the first post.",
      "Read the title, author, publish date and read time.",
      "Read the whole article body, checking the paragraphs and any inline images render.",
      "Read the address bar and note whether the URL uses the post's slug.",
      "Reload the page."
    ],
    expectedBehaviour: "A post renders its stored HTML content, including the images embedded inline within it. The route is keyed on slug, so the URL is stable and shareable.",
    expectedUiState: "Title, author, date and read time are shown. The body renders as formatted prose with its inline images displayed \u2014 not as raw HTML tags shown as visible text, and not as a wall of markup. The URL carries the post's slug.",
    endResult: "Read-only; nothing persists. The reload shows the same article."
  },
  "checklist-content-discovery-blog-blog-cover-image-display": {
    roles: ["guest"],
    startPage: "/blog",
    steps: [
      "Open /blog in a private window and look at every card's cover image.",
      "Hard-reload with Ctrl+Shift+R and look again.",
      "Open one post and look at its cover image at the top of the article.",
      "Note whether the same image appears on the card and on the post.",
      "Look for any broken-image glyph or grey placeholder tile."
    ],
    expectedBehaviour: "Cover images are served through the media proxy, which is what applies the watermark and keeps the storage bucket private. An image stored as a raw bucket URL bypasses that entirely and is the pattern to watch for.",
    expectedUiState: "Every card shows its cover image, on both loads. The post's hero image matches its card's. No broken-image glyph and no grey placeholder square anywhere.",
    endResult: "Read-only; nothing persists."
  },
  "checklist-content-discovery-blog-blog-youtube-embed": {
    roles: ["guest"],
    startPage: "/blog",
    steps: [
      "Open /blog/selling-tips-letitrip in a private window \u2014 '10 Tips to Sell Faster on LetItRip' is the ONLY seeded post carrying a youtubeId, so searching the listing for a video indicator finds nothing and a tester would answer null on a path that works.",
      "Scroll to the embedded video.",
      "Click play and watch for a few seconds.",
      "Read any error text shown in or near the player."
    ],
    expectedBehaviour: "A YouTube id on a post renders as a privacy-preserving embed. The failure worth naming is the one the product-detail pages had: a YouTube URL handed to a native video element, which cannot play a watch-page URL and says so in the player's own words.",
    expectedUiState: "The embedded player renders and plays on click. What must not appear is 'No video with supported format and MIME type found', an empty black box, or a bare link where a player should be.",
    endResult: "Read-only; nothing persists."
  },
  "checklist-content-discovery-blog-blog-related-posts-sections": {
    roles: ["guest"],
    startPage: "/blog",
    steps: [
      "Open /blog in a private window and open any post.",
      "Scroll below the article body.",
      "Read the heading of each related section and the cards inside it.",
      "Check whether the post currently open appears in any of them.",
      "Click a card in each section and confirm it opens that post."
    ],
    expectedBehaviour: "Three separate signals are rendered below the article \u2014 same category, shared tags, and same author \u2014 each as its own section. A section with a heading and an empty rail should not render at all; showing the heading anyway advertises content that is not there.",
    expectedUiState: "Three headed sections appear: Related Posts, 'You might also like', and a same-author section. Each holds at least one card with a real title and image. The current post appears in none of them, and every card opens the post it names.",
    expectedData: { selfLinkCount: 0 },
    endResult: "Read-only; nothing persists."
  },
  "checklist-content-discovery-blog-blog-search-filters-the-list": {
    roles: ["guest"],
    startPage: "/blog",
    steps: [
      "Open /blog in a private window with no session and count the posts listed.",
      "Type beyblade into the search box ('Search posts...') and commit the search.",
      "Read the count and confirm it is SMALLER than the unfiltered count, and that every remaining card is relevant.",
      "Clear the box, type zzzznope, and commit.",
      "Read the result \u2014 an empty state, not the full list.",
      "RELOAD the page while zzzznope is still in the URL and read the FIRST PAINT, before anything settles.",
      "Clear the search and confirm the original count returns."
    ],
    inputs: { realQuery: "beyblade", nonsenseQuery: "zzzznope" },
    expectedBehaviour: "The blog listing filters server-side and the filtered result survives a reload. The nonsense control is the whole case: a real term returns plausible cards whether or not the query reached the server, so only zzzznope distinguishes filtering from returning everything. The reload matters separately \u2014 the SSR view and the API are two implementations of one query, and when the view ignored `q` the client hook's initialData froze the UNFILTERED list permanently, because a public listing hook sets staleTime Infinity once it is given SSR data. A page that shows the right rows only after a moment is that bug, not a slow render.",
    expectedUiState: "'beyblade' returns fewer cards than the unfiltered list. 'zzzznope' returns a named empty state and zero cards, on first paint as well as after hydration. Clearing restores the original count.",
    expectedData: { nonsenseResultCount: 0 },
    endResult: "Read-only; nothing persists beyond the URL. A full list under zzzznope is the failure, and it is the same shape whether the query never left the browser or the SSR view dropped it."
  },
  "checklist-content-discovery-blog-attached-coupons": {
    roles: ["guest"],
    startPage: "/blog/top-10-most-valuable-vintage-beyblades",
    steps: [
      "Open /blog/top-10-most-valuable-vintage-beyblades in a private window with no session — it is the ONLY seeded post carrying couponIds (FREESHIP2000 and CASHBACK5), so looking for a coupon strip on any other post finds nothing and a tester would answer null on a path that works.",
      "Scroll past the end of the article body, below the related-posts rails.",
      "Count the coupon cards and read the CODE on each.",
      "Read each card's discount summary and its conditions line.",
      "Click 'Copy code' on the first card and read the button's label immediately afterwards.",
      "Paste into the search box at the top of the page to see what was actually copied, then clear it.",
      "Open /blog/authenticating-beyblades — a post with NO attached coupons — and scroll to the same place."
    ],
    expectedBehaviour: "A post may attach promotional coupons, rendered as copyable code cards. Two things are being separated here. First, the grid must lay out SEVERAL — one card rendering correctly proves nothing about a list, which is why the fixture carries two. Second, a post with no coupons must render NOTHING: an empty 'Coupons you can use' heading over a blank area advertises something that is not there, and it would appear on all 20 other seeded posts.",
    expectedUiState: "Two coupon cards appear below the article, showing FREESHIP2000 and CASHBACK5. Each card shows a discount summary ('Free shipping', '5% back in points' or similar) and its own code. 'Copy code' changes to 'Copied!' and the pasted text is exactly the code shown on that card — not the coupon's name, not the card's whole text. On /blog/authenticating-beyblades there is no coupon section and no heading at all.",
    expectedData: { couponCardCount: 2, emptyPostCouponSectionCount: 0 },
    endResult: "Read-only; nothing persists. The clipboard holds the copied code. A heading with no cards under it on the second post is the failure, and so is one card where two were seeded."
  },
  "checklist-content-discovery-blog-expired-coupon-hidden": {
    roles: ["guest"],
    startPage: "/blog/top-10-most-valuable-vintage-beyblades",
    steps: [
      "Open /blog/top-10-most-valuable-vintage-beyblades in a private window and read the coupon cards.",
      "Open /admin/coupons in an admin session, find FREESHIP2000 and read its validity window and active flag.",
      "Deactivate FREESHIP2000.",
      "Return to the post in the private window and HARD-reload it (Ctrl+Shift+R).",
      "Count the coupon cards again and read the remaining code.",
      "Reactivate FREESHIP2000 and hard-reload once more."
    ],
    expectedBehaviour: "An attached coupon is resolved through the same validity predicate checkout applies — active, inside its window, under its total limit — and a coupon failing it is dropped before the page renders. This matters more than it looks: an article published months ago keeps advertising whatever was attached to it, and a reader who copies a dead code does the work of getting to checkout only to be refused. The page must not promise what the till will decline.",
    expectedUiState: "BEFORE: two cards, FREESHIP2000 and CASHBACK5. AFTER deactivating: ONE card, CASHBACK5 only, with no gap, no placeholder tile and no 'expired' card where the other was. After reactivating: two cards again.",
    expectedData: { cardCountAfterDeactivate: 1 },
    endResult: "FREESHIP2000 is left ACTIVE — reactivating it in the last step is part of the case, not cleanup to skip. Two cards still showing after the hard reload is the failure; so is zero cards, which would mean the whole section was dropped rather than the one dead coupon."
  }
};
export {
  authored
};
