const authored = {
  "checklist-public-pages-store-tabs-default-tab-lists-products": {
    roles: ["guest"],
    startPage: "/stores",
    steps: [
      "Open /stores and click through to LetItRip Official. The store URL /stores/store-letitrip-official redirects to /stores/store-letitrip-official/products \u2014 that redirect IS the default-tab behaviour this case is checking, so landing on a /products URL is the pass condition rather than a surprise.",
      "Note which tab is selected on arrival.",
      "Count the listings shown and read the total the pager reports.",
      "Open two of the cards and read which store each says it belongs to."
    ],
    inputs: { store: "store-letitrip-official" },
    expectedBehaviour: "A store opens on its Products tab with that store's listings. A listing carries its store as a denormalised field, so a card showing no seller \u2014 or the wrong one \u2014 means the listing was written without a store rather than that the tab filtered wrongly.",
    expectedUiState: "Products is the selected tab on arrival, cards are listed, and each card names LetItRip Official.",
    expectedData: { defaultTab: "products" },
    endResult: "Nothing is changed; this case only reads."
  },
  "checklist-public-pages-store-tabs-each-tab-lists-only-its-type": {
    roles: ["guest"],
    startPage: "/stores/store-letitrip-official",
    steps: [
      "Open LetItRip Official and open the Auctions tab.",
      "Read the badge on each card shown.",
      "Open the Pre-orders tab and read its badges.",
      "Open the Digital Codes tab and read its badges.",
      "Open the Art tab and read its badges."
    ],
    inputs: { store: "store-letitrip-official" },
    expectedBehaviour: "Each tab is a type filter over that one store. Tabs key on a slug that is a DIFFERENT id space from the listing type, so conflating the two either breaks the URL or silently returns nothing \u2014 and nothing looks exactly like an empty tab.",
    expectedUiState: "Every card under a tab carries that tab's badge. No card of another type appears under any tab.",
    expectedData: { mismatchedBadges: 0 },
    endResult: "Nothing is changed; this case only reads."
  },
  "checklist-public-pages-store-tabs-empty-tab-says-empty": {
    roles: ["guest"],
    startPage: "/stores/store-letitrip-official",
    steps: [
      "Open /stores/store-letitrip-official and work through all twelve tabs in turn: Products, Auctions, Pre-orders, Prize Draws, Classified, Digital Codes, Live, Art, Bundles, Coupons, Reviews, About. \u{1F6D1} USE THIS STORE, NOT LetItRip Official: the official store carries SIX listings and every one is a prize draw, so eleven of its twelve tabs are genuinely empty. LetItRip Official has stock in every single type, so it has no empty tab to find and the case cannot be performed there at all.",
      "Find one that lists nothing.",
      "Wait for it to finish loading before judging it.",
      "Read what it shows."
    ],
    inputs: { store: "store-letitrip-official" },
    expectedBehaviour: "An empty tab says it is empty. A spinner that never resolves and a blank panel both read as a failure, and an empty state is also how a genuinely broken query presents \u2014 so the wording should say what is absent rather than merely showing nothing.",
    expectedUiState: "A worded empty state. Not a permanent skeleton and not a blank area below the tab bar.",
    expectedData: { blankPanelFound: false },
    endResult: "Nothing is changed; this case only reads."
  },
  "checklist-public-pages-store-tabs-tab-survives-a-reload": {
    roles: ["guest"],
    startPage: "/stores/store-letitrip-official",
    steps: [
      "Open LetItRip Official and switch to the Auctions tab.",
      "Copy the URL from the address bar.",
      "Reload the page.",
      "Note which tab is selected.",
      "Open the copied URL in a new tab and note which is selected there."
    ],
    inputs: { store: "store-letitrip-official" },
    expectedBehaviour: "The tab is in the URL, so a reload and a shared link both land on it. A tab held only in component state bounces to the default on reload, which makes the URL unshareable without any visible error.",
    expectedUiState: "Both the reload and the fresh tab land on Auctions.",
    expectedData: { tabAfterReload: "auctions" },
    endResult: "Nothing is changed; this case only reads."
  },
  "checklist-public-pages-store-tabs-store-tabs-hide-other-stores-items": {
    roles: ["guest"],
    startPage: "/stores/store-letitrip-official",
    steps: [
      "Open /stores/store-letitrip-official \u2014 SIX listings, all of them prize draws, which is what makes a leak obvious: any card on any other tab belongs to someone else, and the Prize Draws tab should hold exactly six.",
      "Work through all twelve tabs and read the store name on each card: Products, Auctions, Pre-orders, Prize Draws, Classified, Digital Codes, Live, Art, Bundles, Coupons, Reviews, About.",
      "Note any card naming a different store.",
      "Open one card and confirm on its detail page which store it belongs to."
    ],
    inputs: { store: "store-letitrip-official" },
    expectedBehaviour: "A store page is scoped to one store on every tab. A small catalogue is chosen on purpose: on a store with sixty listings a handful of foreign cards is easy to miss.",
    expectedUiState: "Every card on every tab names LetItRip Official.",
    expectedData: { foreignStoreCards: 0 },
    endResult: "Nothing is changed; this case only reads."
  },
  "checklist-public-pages-store-tabs-coupons-tab-shows-this-stores-coupons": {
    roles: ["guest"],
    startPage: "/stores/store-letitrip-official",
    steps: [
      "Open LetItRip Official and open its Coupons tab.",
      "Write down every coupon code shown.",
      "Open /stores/store-letitrip-official and open its Coupons tab.",
      "Write down those codes.",
      "Compare the two lists."
    ],
    inputs: { sellerCoupon: "ARENA25", otherStoreCoupon: "OFFICIAL10" },
    expectedBehaviour: "A store's coupons tab shows that store's own coupons. A seller coupon is scoped to one storeId and a platform coupon has none, so a tab that does not filter shows every seller's codes to every other seller's customers.",
    expectedUiState: "ARENA25 appears under LetItRip Official and not under LetItRip Official. OFFICIAL10 appears under LetItRip Official and not under LetItRip Official.",
    expectedData: { crossStoreCouponShown: false },
    endResult: "Nothing is changed; this case only reads."
  }
};
export {
  authored
};
