const authored = {
  "checklist-admin-home-lists-every-section": {
    roles: ["admin"],
    startPage: "/admin",
    steps: [
      "Sign in as an admin and open /admin directly (type the URL, do not click Dashboard).",
      "Confirm the page RENDERS rather than redirecting to /admin/dashboard.",
      "Count the section cards.",
      "Compare the card titles against the sidebar's group headers, in order.",
      "Read the 'N screens' line on two or three cards."
    ],
    expectedBehaviour: "BEFORE: /admin was a six-line redirect() to /admin/dashboard, so the URL anyone types first was a hop and nothing in the product answered 'what is in the admin panel'. AFTER: /admin is the sectioned index, derived from ADMIN_NAV_GROUPS.",
    expectedUiState: "TWELVE section cards: Management, Finance, Procurement, Catalog, Content, Testing, Site, Events, Trust & Safety, System, Maintenance, Guides - in that order, matching the sidebar's group headers exactly because both read the same constant. Each card shows a screen count. A redirect to /admin/dashboard, or a card title the sidebar does not have, is the failure.",
    endResult: "Read-only. /admin/dashboard is still reachable from the sidebar's own Dashboard entry and still shows metrics - confirm that separately."
  },

  "checklist-admin-section-hub-screens-carry-descriptions": {
    roles: ["admin"],
    startPage: "/admin",
    steps: [
      "Open /admin and click the Finance section card.",
      "Confirm the URL is /admin/sections/finance.",
      "Read the heading and then each card's second line.",
      "Click any card and confirm it opens that screen.",
      "Go back and repeat with the 'Trust & Safety' card from /admin."
    ],
    expectedBehaviour: "A hub lists the screens of one nav group, and the sentence on each card is that nav item's own `description` - no copy is authored for the hub. The slug is derived from the group title, so 'Trust & Safety' becomes trust-safety.",
    expectedUiState: "On /admin/sections/finance the heading reads 'Finance' and each card carries a label plus a full sentence about what the screen is for (for example Payouts reads about refunding a buyer or checking why a payout is late) - NOT a bare label. The Trust & Safety card lands on /admin/sections/trust-safety, not a 404 and not a 500. A hub showing labels with no sentences means the descriptions are not being read.",
    endResult: "Read-only."
  },

  "checklist-admin-section-hub-unknown-slug-404s": {
    roles: ["admin"],
    startPage: "/admin/sections/finance",
    steps: [
      "Open /admin/sections/finance and confirm it renders.",
      "Change the URL to /admin/sections/financeee and load it.",
      "Change it to /admin/sections/nope and load that too."
    ],
    expectedBehaviour: "An unrecognised slug is a 404. It must NOT fall back to the first section, which would render a real page of Management screens under a heading nobody asked for - indistinguishable from a working link.",
    expectedUiState: "Both misspelled URLs show the not-found page. Neither shows a section's cards, and neither shows an empty page with a real heading.",
    endResult: "Read-only."
  },

  "checklist-admin-hub-counts-absent-not-zero": {
    roles: ["admin"],
    startPage: "/admin",
    steps: [
      "Open /admin and look for number badges on the section cards.",
      "Note which sections carry one.",
      "Open /admin/sections/finance and look for a badge on the Payouts card.",
      "Open /admin/orders in another tab and compare the badge against the count of orders awaiting a manual-payment decision (status pending AND payment pending).",
      "Open /admin/sections/content, a section with no counted screens, and confirm what its cards show."
    ],
    expectedBehaviour: "Five admin screens carry an attention count (orders awaiting manual payment, pending payouts, open tickets, unread admin notifications, catalogue items pending approval). A section card shows the SUM of its own screens' counts. A count that is zero, or whose read failed, renders NO badge - never a '0'.",
    expectedUiState: "A badge appears only where something is genuinely waiting, and its number matches what the linked screen lists. Cards in Content and Guides carry no badge at all. A '0' badge anywhere is the failure: zero and 'the read broke' must both render as absent, because a visible 0 reads as 'nothing needs attention' and stops the operator looking.",
    endResult: "Read-only. If a badge's number disagrees with its screen, record both numbers."
  },

  "checklist-admin-hub-agrees-with-sidebar-for-employee": {
    roles: ["admin"],
    startPage: "/admin/users",
    steps: [
      "As an admin, open /admin/users and find a user whose role is employee (not admin).",
      "Note which permissions that employee holds.",
      "Sign in as that employee in a second browser profile.",
      "As the employee, open /admin and list the section cards.",
      "Compare that list against the employee's own sidebar groups.",
      "Open one section hub and compare its cards against the same group in the sidebar."
    ],
    expectedBehaviour: "The hub and the sidebar resolve through ONE function (filterNavGroups), so they cannot disagree. A section with no screens this employee may see is dropped entirely rather than rendered as a card claiming '0 screens'.",
    expectedUiState: "The employee's section cards are exactly their sidebar's groups - no extra card, no missing one. Inside a hub, the cards are exactly that group's sidebar entries. A card for a screen the sidebar hides is the failure, because a hub card is a promise the page will open: clicking it would land on /unauthorized.",
    endResult: "Read-only. Sign the employee out afterwards."
  },

  "checklist-store-landing-sections-replace-tile-wall": {
    roles: ["seller"],
    startPage: "/store",
    steps: [
      "Sign in as a seller and open /store.",
      "Confirm the stat tiles across the top are still present and still show live figures.",
      "Find the section headed 'Browse by section' and count the cards.",
      "Click one and confirm it lands on /store/sections/<slug>.",
      "Confirm the Top Products panel is still present."
    ],
    expectedBehaviour: "BEFORE: a 19-tile 'Quick Actions' wall built from a hand-written href map kept beside the sidebar's own groups - a second list of the same destinations with the explanations stripped off. AFTER: the six sidebar sections, each a card to its own hub. The stat tiles and Top Products are untouched: those are live data, not a tile wall.",
    expectedUiState: "Six section cards (Overview, Listings, Orders & Reviews, Finance, Store, Guides). The stat tiles above them still render real numbers, and Top Products still renders. 19 small icon tiles still being present means the swap did not land; missing stat tiles means working panels were deleted with the wall.",
    endResult: "Read-only."
  },

  "checklist-store-hub-respects-listing-entitlements": {
    roles: ["seller"],
    startPage: "/store/sections/listings",
    steps: [
      "As a seller whose store does NOT have every listing-type capability, open /store/sections/listings.",
      "List the cards shown.",
      "Compare them against the Listings group in the sidebar.",
      "Confirm whether a Bundles card appears.",
      "Note whether the section cards on /store show a 'N screens' line."
    ],
    expectedBehaviour: "The hub applies the same entitlement filter as the sidebar (filterStoreNavGroups), so it cannot offer a listing type this store may not create - the page would open and then refuse the seller at save time. Bundles is hidden unconditionally (P-1 scope). The /store landing deliberately shows NO screen count, because it does not hold the store document and a count from there would over-promise.",
    expectedUiState: "The hub's cards match the sidebar's Listings group exactly. No Bundles card. On /store, section cards show a title only - no 'N screens' line. A card for an un-entitled listing type is the failure, and so is a screen count on the /store landing.",
    endResult: "Read-only."
  },

  "checklist-user-landing-keeps-public-profile-link": {
    roles: ["buyer"],
    startPage: "/user",
    steps: [
      "Sign in as a buyer and open /user.",
      "Confirm the stat tiles (Orders, Total spent, Wishlist, Unread alerts) still render.",
      "Find the section cards and count them.",
      "Look for a link to your own public profile.",
      "Click a section card and confirm it lands on /user/sections/<slug>."
    ],
    expectedBehaviour: "BEFORE: an 18-entry hand-written NAV_LINKS tile wall duplicating USER_NAV_GROUPS with the descriptions stripped. AFTER: the four sections as cards. 'View my public profile' is kept as its own link because it is ROUTES.PUBLIC.PROFILE(uid) - a public route parameterised by the viewer, which no nav group can carry.",
    expectedUiState: "Four section cards (Account, Shopping, Selling, Help). The stat tiles still render. A 'View my public profile' link is present and opens your public profile page. 18 small tiles still present means the swap did not land; a missing public-profile link means it was dropped along with its neighbours.",
    endResult: "Read-only."
  },

  "checklist-user-hub-renders-without-a-session": {
    roles: ["guest"],
    startPage: "/user/sections/shopping",
    steps: [
      "Signed OUT, open /user/sections/shopping directly.",
      "Note what happens - a sign-in prompt, a redirect, or the cards.",
      "Open /user/sections/zzznope and note what happens there."
    ],
    expectedBehaviour: "The buyer dashboard's layout guards access client-side (RoleGuard), so /user/* prerenders. This hub reads no session on purpose: no user nav item carries a permission and no count applies, so there is nothing about it that varies by viewer. An unknown slug is still a 404.",
    expectedUiState: "The signed-out visitor is handled by the same guard as every other /user page - whatever /user/orders does when signed out, this does too. /user/sections/zzznope is a not-found page, not an empty section.",
    endResult: "Read-only. Record what the guard actually does rather than assuming a redirect."
  }
};
export {
  authored
};
