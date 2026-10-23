const authored = {
  "checklist-selling-listing-edit-roundtrip-edit-opens-populated": {
    roles: ["seller"],
    startPage: "/store/products",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /store/products and find a listing whose status reads Published.",
      "Write down its title, its price and its stock quantity from the row.",
      "Open that listing's Edit action.",
      "Wait for the form to finish loading.",
      "Read the Title, Price and Stock fields."
    ],
    expectedBehaviour: "The editor is seeded from the listing's stored document. A blank form means the page received something other than a product \u2014 an ActionResult envelope spreads to all-undefined and renders exactly this way, with no error.",
    expectedUiState: "Title, Price and Stock each hold the values written down from the row. No field that had a value on the row is empty here.",
    expectedData: { emptyRequiredFieldCount: 0 },
    endResult: "Nothing is saved; the form was only opened. Leaving without saving must not change the listing."
  },
  "checklist-selling-listing-edit-roundtrip-edit-category-preselected": {
    roles: ["seller"],
    startPage: "/store/products",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /store/products and pick any published listing.",
      "Open its public page in a second tab and read which category it is filed under.",
      "Return to the first tab and open the listing's Edit action.",
      "Find the Category selector and read what it currently shows."
    ],
    expectedBehaviour: "The selector is seeded from the listing's stored category. The stored field is `categorySlugs[]` and its FIRST entry is the leaf; a form reading a singular `categorySlug` gets undefined and opens blank \u2014 and then saving that blank submits it.",
    expectedUiState: "The Category selector shows the same category name the public page showed \u2014 for example Original Plastic Gen. It is not empty and is not sitting on its unchosen placeholder.",
    endResult: "Nothing is saved. If this case fails, do NOT press Save \u2014 saving a blank category is the damage it is warning about."
  },
  "checklist-selling-listing-edit-roundtrip-edit-save-keeps-published": {
    roles: ["seller"],
    startPage: "/store/products",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /store/products and find a listing whose status reads Published. Write down its title.",
      "Open its Edit action.",
      "Change only the Description \u2014 append the word roundtrip to it.",
      "Press Save.",
      "Return to /store/products and reload the page.",
      "Find the same listing and read its status.",
      "Open its public detail page."
    ],
    inputs: { descriptionSuffix: "roundtrip" },
    expectedBehaviour: "Editing one field changes that field and nothing else. The status must survive the round trip: an editor that read the status as undefined will coerce it to draft on save, which silently unpublishes a live listing.",
    expectedUiState: "After the reload the row still reads Published, and the public detail page still loads rather than 404ing.",
    expectedData: { statusAfterSave: "published" },
    endResult: "The description keeps the appended word after a reload, and the listing is still published and still publicly reachable."
  },
  "checklist-selling-listing-edit-roundtrip-edit-missing-id-404s": {
    roles: ["seller"],
    startPage: "/store/products",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Navigate directly to /store/products/zzzznope-not-a-listing-42/edit \u2014 a deliberately invented id, not a fixture.",
      "Read what the page shows."
    ],
    inputs: { listingId: "zzzznope-not-a-listing-42" },
    expectedBehaviour: "An id that resolves to no listing must 404. A blank editor here is the tell that the page never checked: an always-truthy envelope makes the not-found branch unreachable, and the empty form it renders is indistinguishable from a real listing with no data.",
    expectedUiState: "A not-found page. NOT an empty product form, and not a form with a Save button on it.",
    expectedData: { showsEditForm: false },
    endResult: "Nothing is created or saved."
  },
  "checklist-selling-listing-edit-roundtrip-edit-other-sellers-listing-404s": {
    roles: ["seller"],
    startPage: "/store/products",
    steps: [
      /*
       * 🛑 NOT THE ADMIN. `getSellerProductAction` reads
       * `if (!isAdminUser(profile))` before comparing stores, so an admin is
       * EXEMPT by design and will open LetItRip Official's listing successfully.
       * Signing in as admin@letitrip.in and expecting a 404 tested the
       * exemption while claiming to test the gate — it would have reported a
       * working ownership check as broken.
       *
       * 🛑 AND THE CONFOUND IS REAL: store-blader-bazaar is PENDING, because
       * there is no second ACTIVE non-admin seller in the seed (LetItRip Official
       * is the only one; Vintage Vault Co. is suspended). So a refusal here may
       * come from the store's status rather than from ownership, and the step
       * below says how to tell them apart rather than pretending the fixture is
       * cleaner than it is.
       */
      "Sign in as meera.blader@gmail.com / TempPass123!, who owns store-blader-bazaar \u2014 a different store from LetItRip Official.",
      "Open /store/products first \u2014 if meera's own dashboard is itself blocked, her store's PENDING status is the cause and this case is a null with that reason, not a verdict about ownership.",
      "In a second tab open /products and copy the slug of any listing belonging to LetItRip Official, e.g. product-beyblade-burst-valkyrie.",
      "Back in the first tab, navigate to /store/products/<that slug>/edit.",
      "Read what the page shows, and whether the refusal is about OWNERSHIP or about the store being pending."
    ],
    expectedBehaviour: "Ownership is checked against the caller's STORE, and a product's `storeId` is the store SLUG rather than the owner's Auth uid. A check comparing `storeId` to a uid compares two different namespaces and can never pass \u2014 which returns null for every legitimate seller too, so a page that 404s here must be verified to still open the seller's OWN listing.",
    expectedUiState: "A not-found page, with no editable fields.",
    expectedData: { showsEditForm: false },
    endResult: "Nothing is changed on the other seller's listing. Then re-open one of your own listings to confirm the guard has not locked everyone out.",
    needsReview: true,
    reviewNote: "UNSATISFIABLE — needs a store that is not ACTIVE. The 2026-10-21 prune left store-letitrip-official as the only store and its status is active, so the pending/suspended behaviour this case turns on cannot be produced. Deliberately NOT repointed at the active store: the case would then assert the ordinary path and pass while checking nothing."
  },
  "checklist-selling-listing-edit-roundtrip-edit-ancestor-pages-after-recategorise": {
    roles: ["seller"],
    startPage: "/store/products",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      /*
       * 🛑 The `category-` PREFIX is load-bearing in all three URLs below.
       *
       * These steps named /categories/original-plastic-gen, original-tops and
       * spinning-tops, and every one of them 404s — a category's document id IS
       * its prefixed slug (§ Slug Prefix System), so the real routes are
       * /categories/category-original-plastic-gen and so on. Verified 200 on all
       * three prefixed forms. `audit-tester-checklist-hrefs` did not catch it
       * because it validates `href` and `startPage`, and these are URLs written
       * inside step PROSE, which nothing checks.
       */
      "Open /categories/category-original-plastic-gen \u2014 its parent is category-original-tops and its root is category-spinning-tops.",
      "Open /store/products, pick a published listing, and open its Edit action.",
      "Change its Category to Plastic Generation (that is the display name; the id is category-original-plastic-gen) and press Save.",
      "Open /categories/category-original-plastic-gen and look for the listing.",
      "Open /categories/category-original-tops and look for the same listing.",
      "Open /categories/category-spinning-tops and look for it again."
    ],
    expectedBehaviour: "A product stores the FULL ancestor chain, so it is reachable from its own category and from every ancestor with one query. If only the leaf is stored, the ancestor pages match nothing \u2014 and the leaf page can fail too, because the stored field and the field the form sends are not the same one.",
    expectedUiState: "The listing's card appears on all three pages: the deep category, its parent, and its root.",
    expectedData: { visibleOnLeaf: true, visibleOnParent: true, visibleOnRoot: true },
    endResult: "After a reload the listing is still filed under the deep category and still appears on all three pages."
  }
};
export {
  authored
};
