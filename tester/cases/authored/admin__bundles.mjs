const authored = {
  "checklist-admin-bundles-bundle-create": {
    roles: ["admin", "guest"],
    startPage: "/admin/bundles",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/bundles/new and set Name to 'QA Bundle admin-create'.",
      "Leave the member-source select on its static option, add exactly TWO members \u2014 product-beyblade-burst-valkyrie and product-beyblade-x-wizard-arrow \u2014 set 'Bundle price (\u20B9)' to 1500, and try to save.",
      "Read the refusal: the minimum is three, and the field label states the range.",
      "Add product-beyblade-x-knife-shinobi (\u20B9949) as the third member and save.",
      "RELOAD the editor and read the members, the price and the original total.",
      "Open /bundles/bundle-qa-bundle-admin-create \u2014 the slug is the name slugified under a 'bundle-' prefix \u2014 and read the members, price and discount badge.",
      "Back in the editor add prizedraw-beyblade-mystery-box, which belongs to store-letitrip-official, as a fourth member, save, and read what happens.",
      "Remove that fourth member and save, leaving the bundle at its three arena members."
    ],
    inputs: {
      name: "QA Bundle admin-create",
      member1: "product-beyblade-burst-valkyrie",
      member2: "product-beyblade-x-wizard-arrow",
      member3: "product-beyblade-x-knife-shinobi",
      crossStoreMember: "prizedraw-beyblade-mystery-box",
      bundlePrice: 1500,
      memberTotal: 2847
    },
    expectedBehaviour: "A bundle holds at least three members, stores its locked price, and derives the members' undiscounted total SERVER-SIDE \u2014 the editor never sends that total, and it is what drives the discount badge, so a bundle without it shows a price and no saving. Members must come from one store: the store id is the order-splitting and payout key, so a cross-store bundle would produce an order belonging to one seller while holding another seller's products.",
    expectedUiState: "The two-member save is refused inline with 'Select at least 3 products (currently 2).' \u2014 not a silent no-op and not a generic banner. With the third added, the reload lists all three, a bundle price of \u20B91,500 against an original total of \u20B92,847, and the public page shows the three members with a discount badge of roughly 47% off. The cross-store save is refused with a message naming how many sellers the members span, not a 500.",
    expectedData: { memberCount: 3, bundlePrice: 1500, bundleOriginalTotal: 2847 },
    endResult: "The bundle survives with its three arena members \u2014 the next two cases read it. The cross-store member is NOT part of it."
  },
  "checklist-admin-bundles-bundle-stock-sync": {
    roles: ["admin", "seller", "guest"],
    startPage: "/admin/bundles",
    steps: [
      "Open /bundles/bundle-qa-bundle-admin-create signed out and note that it offers purchase.",
      "Sign in as tyson@beybladearena.in / TempPass123!, open /store/products, edit product-beyblade-x-wizard-arrow, and set its stock quantity from 12 to 0.",
      "Reload /bundles/bundle-qa-bundle-admin-create and read its availability.",
      "Sign in as admin@letitrip.in / TempPass123!, open /admin/bundles and read the bundle's row.",
      "Sign back in as tyson@beybladearena.in and set that product's stock back to 12.",
      "Reload /bundles/bundle-qa-bundle-admin-create and read its availability again."
    ],
    inputs: { member: "product-beyblade-x-wizard-arrow", stockBefore: 12, stockDuring: 0 },
    expectedBehaviour: "A bundle is all-or-nothing, so one member going out of stock makes the whole bundle unavailable. That is kept in sync by a hook on the member's stock change rather than computed per request \u2014 which is what makes the reverse direction worth testing too: restoring the stock must restore the bundle.",
    expectedUiState: "With the member at zero the bundle reads as unavailable and offers no purchase control. After the stock is restored it becomes purchasable again. A bundle still offering purchase with a zero-stock member is the failure; so is one that stays unavailable after the stock returns.",
    expectedData: { stockAfterRestore: 12 },
    endResult: "The member's stock is back at 12 and the bundle is purchasable. Both directions matter \u2014 a sync that only ever disables is half a sync, and leaving the stock at zero silently breaks the next case."
  },
  "checklist-admin-bundles-bundle-edit-delete": {
    roles: ["admin", "guest"],
    startPage: "/admin/bundles",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/bundles, open 'QA Bundle admin-create' for editing, and write down every field \u2014 name, description, price, the three members, cover image, brand and active.",
      "Change ONLY 'Bundle price (\u20B9)' to 1400 and save.",
      "RELOAD the editor and compare every field against what was written down.",
      "SWAP one member rather than dropping one: remove product-beyblade-x-knife-shinobi (\u20B9949), add product-beyblade-burst-regalia-genesis (\u20B91,399), keeping three. Save, RELOAD, and read the member list and the original total.",
      "Open /bundles/bundle-qa-bundle-admin-create and read the members and the discount badge.",
      "Back in the editor click the delete control, confirm, and check the bundle is gone from /admin/bundles and from /bundles."
    ],
    inputs: {
      priceBefore: 1500,
      priceAfter: 1400,
      memberRemoved: "product-beyblade-x-knife-shinobi",
      memberAdded: "product-beyblade-burst-regalia-genesis",
      totalBefore: 2847,
      totalAfter: 3297
    },
    expectedBehaviour: "An edit writes back only what changed, and changing the member list recomputes the undiscounted total server-side \u2014 a stale total makes the discount badge claim a saving that no longer exists. A SWAP rather than a bare removal is what makes this readable: the count stays at the legal minimum of three while the total must move, so a total that did not change cannot be excused as the member rule having been left alone.",
    expectedUiState: "After the price edit only the price differs \u2014 every other field matches what was written down. After the swap the list holds three members and the original total reads \u20B93,297 rather than \u20B92,847, so the badge's saving shrinks. After the delete the bundle is absent from /admin/bundles and /bundles, and its own URL no longer renders it.",
    expectedData: { memberCountAfterSwap: 3, bundleOriginalTotalAfterSwap: 3297 },
    endResult: "The bundle is deleted. A public page still rendering a deleted bundle is a cache or projection failure worth naming."
  },
  "checklist-admin-bundles-bundle-brand-picker": {
    roles: ["admin", "guest"],
    startPage: "/admin/bundles",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/bundles/new, set Name to 'QA Bundle brand-picker', and add THREE members from Beyblade Arena \u2014 product-beyblade-burst-valkyrie, product-beyblade-x-wizard-arrow and product-beyblade-x-knife-shinobi. Fewer than three is refused.",
      "Set 'Bundle price (\u20B9)' to 2000.",
      "Find the 'Brand' select and read what it offers.",
      "Select Beyblade and save.",
      "RELOAD the editor and read the brand.",
      "Open /brands/brand-beyblade signed out and find the bundle in its Bundles tab.",
      "Back in the editor set Brand to 'No specific brand', save, reload the brand page, and check the bundle has left that tab.",
      "Delete the bundle."
    ],
    inputs: {
      name: "QA Bundle brand-picker",
      brand: "Beyblade",
      clearedTo: "No specific brand",
      bundlePrice: 2e3
    },
    expectedBehaviour: "A bundle's own brand tag is a DIFFERENT field from any brand filter inside a dynamic member rule \u2014 the tag says which brand the bundle belongs to regardless of how its members were resolved, and it is what the brand page's Bundles tab filters on. Not every bundle needs one; a genuinely cross-brand bundle leaves it unset.",
    expectedUiState: "The select offers the real seeded brands plus a 'No specific brand' option \u2014 not a free-text box and not an empty list. With Beyblade set the bundle appears in that brand's Bundles tab; with it cleared it leaves. Worth watching: two of the three members are tagged Takara-Tomy rather than Beyblade, so a bundle still appearing under Beyblade after the tag is cleared means the tab is filtering on the MEMBERS instead of the tag.",
    expectedData: { brandAfterReload: "Beyblade" },
    endResult: "The bundle is deleted by the final step, so /brands/brand-beyblade's Bundles tab holds only the seeded bundles again."
  }
};
export {
  authored
};
