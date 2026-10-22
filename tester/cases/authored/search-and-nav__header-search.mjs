const authored = {
  "checklist-search-and-nav-header-search-search-finds-maintenance-toggle": {
    roles: ["admin"],
    startPage: "/admin",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin and click into the sidebar search box.",
      "Type maintenance.",
      "Read the results.",
      "Read whether BOTH the Maintenance nav group and the Site Settings entry are returned, then click the Site Settings entry.",
      "Read which tab of Site Settings opens and whether the Maintenance mode toggle is on screen."
    ],
    inputs: { query: "maintenance" },
    expectedBehaviour: "Search reaches individual SETTINGS, not just screens. There IS a nav group called Maintenance, so the word finds those pages on its label alone \u2014 the harder half is the Site Settings entry, which matches only through its keywords, and whose Maintenance mode toggle sits on tab two of twenty with no way to find it but hunting.",
    expectedUiState: "The results include the Maintenance nav group AND the Site Settings entry. Opening Site Settings lands on the Branding tab with the Maintenance mode toggle on screen. Landing on the About tab, which is the first of twenty, with the toggle somewhere below is a FAIL rather than a partial pass. Returning only the Maintenance pages and not Site Settings means keyword matching is not running \u2014 that is the finding this case exists for.",
    expectedData: { siteSettingsReturned: true, maintenanceGroupReturned: true },
    endResult: "Read-only; do not flip the toggle. Turning on maintenance mode would take the site down for every other case in the run."
  },
  "checklist-search-and-nav-header-search-search-finds-by-what-it-does": {
    roles: ["admin"],
    startPage: "/admin",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin and click into the sidebar search box.",
      "Type refund and read the results.",
      "Clear the box, type postcode and read the results.",
      "Clear the box, type cod and read the results.",
      "Clear the box, type zzzznope and read the results."
    ],
    inputs: { query1: "refund", query2: "postcode", query3: "cod", nonsenseQuery: "zzzznope" },
    expectedBehaviour: "Entries carry a description and keywords, so a user who knows what they want to DO finds the screen without knowing what it is called. None of these three words appears in the label of what it finds.",
    expectedUiState: "'refund' returns Payouts. 'postcode' returns Addresses. 'cod' returns the Cash on delivery toggle. 'zzzznope' returns an empty state \u2014 the control that proves the box is matching rather than listing everything.",
    expectedData: { nonsenseResultCount: 0 },
    endResult: "Read-only; nothing persists."
  },
  "checklist-search-and-nav-header-search-search-ranks-exact-first": {
    roles: ["admin"],
    startPage: "/admin",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin and click into the sidebar search box.",
      "Type orders.",
      "Read the results in order from the top."
    ],
    inputs: { query: "orders" },
    expectedBehaviour: "An exact label match outranks a keyword hit, which outranks a description hit. With no ranking the results fall into declaration order and the thing actually called Orders can land well down the list. Ranking is WITHIN each group \u2014 groups keep their declared order on purpose, so that the sidebar does not rearrange itself under the reader while they type.",
    expectedUiState: "Within its own group, the entry named Orders is first. Guides and settings whose descriptions merely mention orders rank below it, inside their own groups. Orders appearing below a description-only match IN THE SAME GROUP is the failure, even though it is present. Do not expect one flat list \u2014 groups are not reordered by score.",
    expectedData: { exactMatchPosition: 1 },
    endResult: "Read-only; nothing persists."
  },
  "checklist-search-and-nav-header-search-search-never-shows-what-you-cannot-reach": {
    roles: ["buyer"],
    startPage: "/user",
    steps: [
      "Sign in as rehan.sheikh@gmail.com / TempPass123!, an ordinary buyer.",
      "Open /user and click into the sidebar search box \u2014 a buyer has a user sidebar, not an admin one.",
      "Type users and read every result.",
      "Clear the box, type payouts and read every result.",
      "Clear the box, type maintenance and read every result.",
      "Clear the box, type orders and read every result."
    ],
    inputs: { query1: "users", query2: "payouts", query3: "maintenance", query4: "orders" },
    expectedBehaviour: "A buyer can never surface an admin entry, and the reason is stronger than filtering: each portal builds its sidebar from its OWN nav groups, so there are no admin items in a buyer's list to match against. The labels alone would be a site map of the admin panel, so absence by construction is the right answer \u2014 hiding the destination behind a 403 would not be.",
    expectedUiState: "'users', 'payouts' and 'maintenance' return no admin entries at all \u2014 not greyed out, not present-but-unclickable, absent. 'orders' still returns the buyer's OWN orders page, which is the control: a search returning nothing for everything would pass the first three for the wrong reason.",
    expectedData: { adminResultsForBuyer: 0 },
    endResult: "Read-only; nothing persists. The fourth query is the control \u2014 a search that returned nothing for everything would pass the first three for the wrong reason."
  }
};
const authoredIndexEra = {
  "checklist-search-and-nav-header-search-header-search-submit-lands-on-search": {
    roles: ["guest"],
    startPage: "/",
    steps: [
      "Open / in a private window.",
      "Click the header search and type dranzer.",
      "Press Enter.",
      "Read the URL in the address bar.",
      "Count the section headings on the page.",
      "Find the 'See all \u2026 \u2192' link on one group and read where it points."
    ],
    inputs: { query: "dranzer" },
    expectedBehaviour: "Submitting goes to the cross-resource page. The nine per-type browse routes are not lost \u2014 each is its own group's 'See all' link, which is where a per-type destination belongs once results are grouped.",
    expectedUiState: "The URL is /search?q=dranzer. Results appear under several headings. Any URL of the form /products?q=\u2026 or /stores?q=\u2026 means the old redirect is still in place.",
    endResult: "Read-only; nothing persists."
  },
  "checklist-search-and-nav-header-search-header-search-type-is-a-filter": {
    roles: ["guest"],
    startPage: "/",
    steps: [
      "Open / in a private window.",
      "Open the header search and set the type dropdown to Stores.",
      "Type beyblade and press Enter.",
      "Read the URL and the sections shown.",
      "Find the Stores group and click its 'See all stores \u2192' link.",
      "Go back, clear the query completely, and press Enter with an EMPTY box.",
      "Note whether the page navigated anywhere."
    ],
    inputs: { type: "Stores", query: "beyblade" },
    expectedBehaviour: "The dropdown narrows the result set; it no longer decides the destination. An empty query does nothing, because landing on a browse page you did not ask for is worse than staying put.",
    expectedUiState: "You land on /search, not /stores. The Stores group's 'See all' link is what goes to /stores. Submitting an empty box leaves you exactly where you were.",
    endResult: "Read-only; nothing persists."
  },
  "checklist-search-and-nav-header-search-header-search-no-price-for-guest": {
    roles: ["guest"],
    startPage: "/",
    steps: [
      "Open / in a private window with no session.",
      "Click the header search and type dranzer.",
      "Read every suggestion row, including the small grey second line.",
      "Look specifically for a \u20B9 figure anywhere in the dropdown."
    ],
    inputs: { query: "dranzer" },
    expectedBehaviour: "The suggestion subtitle used to be the product's price, from an unauthenticated route cached publicly for 60 seconds \u2014 so every signed-out visitor saw prices in the header on every page of the site.",
    expectedUiState: "Subtitles read as brand and category, e.g. 'Takara-Tomy \xB7 Attack Rings'. Any \u20B9 in the dropdown while signed out is a FAIL.",
    endResult: "Read-only; nothing persists."
  }
};
export {
  authored,
  authoredIndexEra
};
