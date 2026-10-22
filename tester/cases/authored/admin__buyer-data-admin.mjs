const authored = {
  "checklist-admin-buyer-data-admin-carts-admin-view": {
    roles: ["admin"],
    startPage: "/admin/carts",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/carts and read every column.",
      "Check each row identifies whose cart it is and how many items it holds.",
      "Read whether guest carts are distinguishable from signed-in ones.",
      "Use every filter and sort offered, confirming each changes the rows.",
      "Search zzzznope and read the count."
    ],
    inputs: { nonsenseQuery: "zzzznope" },
    expectedBehaviour: "The list identifies each cart and its size. A cart document is keyed on the user id for signed-in buyers and on a session id for guests, so both kinds appear and the row has to say which it is \u2014 an unattributed row is a cart nobody can act on.",
    expectedUiState: "Rows show an owner and an item count. Guest carts are marked as such rather than showing a blank owner. Filters and sorts change the rows and 'zzzznope' returns none.",
    expectedData: { nonsenseResultCount: 0 },
    endResult: "Read-only; nothing persists beyond the URL."
  },
  "checklist-admin-buyer-data-admin-carts-admin-row-opens-items": {
    roles: ["admin"],
    startPage: "/admin/carts",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/carts and find a row whose item count is greater than one.",
      "Click the row and read what opens \u2014 it should be a 'Cart Details' modal.",
      "Read its badge: a guest cart reads 'Guest' and a signed-in one reads 'Authenticated'.",
      "Read its fields \u2014 Session or User, Last updated, Cart ID.",
      "Read the 'Items in cart' section and check each item carries a title, a quantity and a price.",
      "Close and open a different row the same way."
    ],
    inputs: { modalTitle: "Cart Details", itemsHeading: "Items in cart" },
    expectedBehaviour: "A row opens to show the cart's items. The list already computes the item count from the items array and then discards it, so the data needed to render the detail is present at list time \u2014 this is a UI wiring gap rather than a missing query, and the fix is a detail view rather than a wider payload.",
    expectedUiState: "Clicking a row opens the 'Cart Details' modal showing each item with its title, quantity and price under 'Items in cart'. A row that does nothing on click, or opens a modal whose items section is empty for a cart the list counted as non-empty, is the dead-end failure this page family exists to close.",
    endResult: "Read-only; close without acting."
  },
  "checklist-admin-buyer-data-admin-wishlists-admin-view": {
    roles: ["admin"],
    startPage: "/admin/wishlists",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/wishlists and read every column.",
      "Check each row names the owning user and the number of items.",
      "Read whether the item titles themselves are shown in the list.",
      "Use every filter and sort offered.",
      "Search zzzznope and read the count."
    ],
    inputs: { nonsenseQuery: "zzzznope" },
    expectedBehaviour: "One wishlist exists per user, so the list is one row per owner with a count. The list query deliberately returns a per-user SUMMARY rather than every item \u2014 widening it to carry each wishlist's contents would load unbounded data on a page that only needs counts.",
    expectedUiState: "Rows name the owner and the item count. Item titles are not expected in the list itself. Filters change the rows and 'zzzznope' returns none.",
    endResult: "Read-only; nothing persists beyond the URL."
  },
  "checklist-admin-buyer-data-admin-wishlists-history-admin-row-opens-user": {
    roles: ["admin"],
    startPage: "/admin/wishlists",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/wishlists and click a row.",
      "Read the URL it lands on \u2014 it should be that row's owner under /admin/users/{userId}, not a wishlist detail.",
      "Go back, open /admin/history, and click a row there.",
      "Read the URL that lands on.",
      "From the user page reached, check the wishlist or history is readable in context."
    ],
    inputs: { expectedDestination: "/admin/users/{userId}" },
    expectedBehaviour: "These two rows route to the owning user rather than to a per-record detail, and that is the correct answer rather than a shortcut: their list queries return only a per-user summary, so a detail view would have to fetch separately, and the user page is where the rest of that person's data already is.",
    expectedUiState: "Both rows navigate to /admin/users/{userId} for that row's owner. Neither is inert. From there the wishlist or history contents are reachable. A row that does nothing at all is the failure; a row routing to the user is a pass. A row whose owner id is missing, so the click does nothing, is also a failure \u2014 the navigation is guarded on it.",
    endResult: "Read-only; close without acting."
  },
  "checklist-admin-buyer-data-admin-history-admin-view": {
    roles: ["admin"],
    startPage: "/admin/history",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/history and read every column.",
      "Check each row names the owning user and the number of entries.",
      "Read the highest entry count in the list.",
      "Use every filter and sort offered.",
      "Search zzzznope and read the count."
    ],
    inputs: { nonsenseQuery: "zzzznope", historyCap: 50 },
    expectedBehaviour: "History is one document per user, capped at fifty entries with the oldest silently evicted. So no row should report more than fifty \u2014 a higher count means the cap is not being applied on write and the document grows without bound.",
    expectedUiState: "Rows name the owner and an entry count, and no count exceeds fifty. Filters change the rows and 'zzzznope' returns none.",
    expectedData: { maxEntryCount: 50 },
    endResult: "Read-only; nothing persists beyond the URL."
  },
  "checklist-admin-buyer-data-admin-notifications-admin-view": {
    roles: ["admin"],
    startPage: "/admin/notifications",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/notifications and read every column.",
      "Read every type filter offered and select each, noting any that returns nothing.",
      "For each empty filter, check the unfiltered list for rows of that type.",
      "Open a row menu's 'View details' action and read the full body and payload in the modal it opens.",
      "Read whether the recipient is identified.",
      "Search zzzznope and read the count."
    ],
    inputs: { nonsenseQuery: "zzzznope" },
    expectedBehaviour: "Every type chip names a value notifications actually carry, and the union has THIRTY values today. The type union is a single runtime list, and for a long time the filters were built from a nine-value copy \u2014 most types were unfilterable and two could not be allow-listed for any channel at all. Count the chips against thirty rather than against the seeded data, which covers only ten of them.",
    expectedUiState: "Every type filter returns its own rows or is empty with none unfiltered either. A row opens to show the full body and payload rather than only the title. 'zzzznope' returns none. A chip MISSING for a real type is as much a finding as a chip that matches nothing \u2014 record the count you saw.",
    expectedData: { nonsenseResultCount: 0, typeChipCount: 30 },
    endResult: "Read-only. A chip empty while matching rows sit unfiltered is the finding, named by type."
  },
  "checklist-admin-buyer-data-admin-reviews-admin-view": {
    roles: ["admin"],
    startPage: "/admin/reviews",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/reviews and read every column, including any review images. Roughly 15-20% of the 79 seeded reviews carry one.",
      "Check each image tile renders rather than showing a placeholder icon.",
      "Read the search box's placeholder for how it matches.",
      "Type a reviewer's FULL name and read the results.",
      "Type only the first half and read the results.",
      "Search zzzznope and read the count.",
      "Open a review and read its full body, rating and any seller response."
    ],
    inputs: { nonsenseQuery: "zzzznope" },
    expectedBehaviour: "Reviewer names are PII-encrypted at rest, so they match exactly through a blind index and a partial cannot match \u2014 by design rather than omission, which is why the box must SAY so. Review images are stored as plain URL strings; a renderer expecting objects reads undefined off each and falls back to a placeholder, which makes every review photo vanish at once.",
    expectedUiState: "Image tiles render real photos rather than placeholder icons. The full name returns rows, the partial returns none, and the box states that matching is exact. 'zzzznope' returns none.",
    expectedData: { partialMatchCount: 0 },
    endResult: "Read-only; nothing persists beyond the URL."
  },
  "checklist-admin-buyer-data-admin-store-addresses-admin": {
    roles: ["admin"],
    startPage: "/admin/addresses",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/addresses and read what the page offers before any input \u2014 an 'Owner type' select, an 'Owner ID' field and a Search button.",
      "Read whether anything is listed before a search is run.",
      "Leave Owner type on 'user', enter user-admin-letitrip, and click Search.",
      "Read every field shown for each address returned, and record exactly how much of the name and phone number is displayed.",
      "Switch Owner type to 'store', enter store-beyblade-arena, and Search.",
      "Enter zzzznope as the Owner ID and Search."
    ],
    inputs: {
      userOwner: "user-admin-letitrip",
      storeOwner: "store-beyblade-arena",
      nonsenseOwner: "zzzznope"
    },
    expectedBehaviour: "Both buyer delivery and store pickup addresses live in one collection discriminated by owner type, and this page reaches them one OWNER at a time rather than as a browsable list \u2014 which is why the owner type is an input rather than a filter. Names, phones and street lines are PII-encrypted at rest, so how much this page decrypts and displays is worth recording rather than assuming.",
    expectedUiState: "Before a search the page lists nothing, which is correct here rather than an empty-state bug. A searched owner returns their addresses; a nonsense owner id returns 'No addresses found for this owner.' rather than an error or the full collection. Record exactly how much of each name and phone is shown.\n\nNote what this page is NOT: there are no columns, no sort dropdown, no filter drawer and no free-text address search. A case expecting those is describing the Banned Addresses queue, which is a different route.",
    expectedData: { listedBeforeSearch: 0, nonsenseOwnerResultCount: 0 },
    endResult: "Read-only; nothing persists beyond the URL."
  },
  "checklist-admin-buyer-data-admin-store-addresses-admin-row-opens-detail": {
    roles: ["admin"],
    startPage: "/admin/addresses",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/addresses, search Owner type 'store' with store-beyblade-arena, and read the card rendered for each address.",
      "Record which fields the card shows \u2014 label, full name, street, city, state, postal code, phone \u2014 and specifically whether the LANDMARK appears.",
      "Check whether the card is openable at all: a link, a click target or an edit affordance leading to /admin/addresses/{id}/edit.",
      "Search Owner type 'user' with user-admin-letitrip and read the same for a buyer-owned address.",
      "Open /admin/addresses/{one of those ids}/edit directly and compare the fields there against what the card showed."
    ],
    inputs: { storeOwner: "store-beyblade-arena", userOwner: "user-admin-letitrip" },
    expectedBehaviour: "An admin can read every stored field of an address, for both owner types. The landmark is the field worth naming: a form that cannot express it sends undefined and overwrites, so a surface that never shows it hides whether the value survived.",
    expectedUiState: "Both owner types render cards carrying the stored fields. The editor at /admin/addresses/{id}/edit shows every field including the landmark. Record any field the editor has and the card does not \u2014 a card that omits the landmark while the editor can write it is the gap this case is for.",
    endResult: "Read-only; close the editor without saving."
  },
  "checklist-admin-buyer-data-admin-addresses-crud-admin": {
    roles: ["admin"],
    startPage: "/admin/addresses",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/addresses/new and create one for Owner type 'user', Owner ID user-admin-letitrip: label 'QA Address admin-crud', '13 Test Lane', Indore, Madhya Pradesh, 452010, landmark 'Beside the arena'.",
      "Save, then find it again via /admin/addresses searching that owner, open /admin/addresses/{its id}/edit, and read every field including the landmark.",
      "Edit ONLY the street to '14 Test Lane', save, REOPEN the editor, and read every field again.",
      "Type abcdef into the postal code field and attempt to save.",
      "Read where the error appears \u2014 on the field, or as a banner, or not at all.",
      "Restore the postal code, then delete the address and search that owner again to confirm it is gone."
    ],
    inputs: {
      name: "QA Address admin-crud",
      streetBefore: "13 Test Lane",
      streetAfter: "14 Test Lane",
      landmark: "Beside the arena",
      badPostcode: "abcdef"
    },
    expectedBehaviour: "Create, edit and delete persist and an edit to one field leaves the rest alone. The postal code is validated by FORMAT rather than by length: a length-only rule accepts 'abcdef' as a valid six-character Indian PIN code, and one admin route did exactly that.",
    expectedUiState: "After each reopen every value holds, including the landmark after the street edit \u2014 a landmark that vanishes when only the street changed is the overwrite this case is for. 'abcdef' is rejected ON THE POSTAL CODE FIELD before any request is sent, not returned as a server error with nothing marked. This half is expected to PASS: the form validates per country by schema now, where it once checked only that the value was six characters long \u2014 which 'abcdef' satisfies.",
    endResult: "The address is deleted by the final step."
  },
  "checklist-admin-buyer-data-admin-stores-admin-view": {
    roles: ["admin"],
    startPage: "/admin/stores",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/stores and read every column and status chip.",
      "Select each status chip in turn and read the rows returned \u2014 the seed carries store-blader-bazaar as pending and store-vintage-vault-co as suspended, so neither chip should be empty.",
      "Open store-letitrip-official \u2014 verified and featured \u2014 for editing and write down its verified flag, its featured flag, its capabilities and its admin notes.",
      "Change ONLY its description and save.",
      "RELOAD and read all four of those back.",
      "Restore the description."
    ],
    inputs: {
      store: "store-letitrip-official",
      pendingStore: "store-blader-bazaar",
      suspendedStore: "store-vintage-vault-co"
    },
    expectedBehaviour: "\u{1F6D1} This is the highest-severity case on the page. The list serializer once omitted the verified, featured, capabilities and notes fields, so the editor seeded them as undefined and the save handler sent those defaults back unconditionally \u2014 saving ANY unrelated field silently un-verified the store and reset its capabilities. The seed carries a pending and a suspended store precisely so those chips are not permanently empty.",
    expectedUiState: "Every status chip returns rows; the pending and suspended chips have a seeded store each. After the description save and reload the store is STILL verified, still featured, its capabilities are unchanged and its admin notes are intact. A store that quietly lost its verified badge is the failure, and the save reported success. This is expected to PASS \u2014 the list serializer now carries all five of those fields \u2014 but it is the case worth re-running after any change to that route, because the failure is silent and destructive.",
    expectedData: { verifiedPreserved: true, featuredPreserved: true, capabilitiesPreserved: true },
    endResult: "The description is restored and the store's flags are as they were. Re-read every flag after the reload, not just the one that was edited."
  },
  "checklist-admin-buyer-data-admin-admin-store-detail-page": {
    roles: ["admin"],
    startPage: "/admin/stores",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/stores and open store-beyblade-arena's detail panel from the list.",
      "Write down every field label it shows, then close the panel.",
      "Open /admin/stores/store-beyblade-arena/view directly.",
      "Write down every field label there and compare the two lists.",
      "Reload that page and confirm it loads the same store rather than 404ing or resetting.",
      "Search both surfaces, and the page source of the standalone one, for a WhatsApp access token."
    ],
    inputs: { store: "store-beyblade-arena", standalonePage: "/admin/stores/{id}/view" },
    expectedBehaviour: "The panel and the page render from one shared content component, so their fields match by construction. The store document's WhatsApp token is decrypted on every read, so any surface that does not deliberately project it is handling plaintext \u2014 an admin page is allowed to show more than a public one, but not the raw credential.",
    expectedUiState: "Both surfaces show the same fields and the standalone page survives a reload. The access token is masked or absent on both. A field in one and not the other means a second copy of the content component has appeared.",
    expectedData: { rawTokenShown: 0 },
    endResult: "Read-only; nothing persists."
  }
};
export {
  authored
};
