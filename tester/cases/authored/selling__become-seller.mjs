const authored = {
  "checklist-selling-become-seller-sell-redirect": {
    roles: ["guest", "buyer"],
    startPage: "/sell",
    steps: [
      "Open /sell in a private window with no session and read where the browser lands.",
      "Read the HTTP status if the browser's network panel is open, and note whether the page rendered before moving.",
      "Sign in as karthik.new@gmail.com / TempPass123!, a buyer with no store.",
      "Open /sell and read where it lands.",
      "Sign out and sign in as admin@letitrip.in / TempPass123!, who already has a store.",
      "Open /sell and read where it lands."
    ],
    expectedBehaviour: "/sell is an entry point that routes by who is asking: a signed-out visitor to sign-in, a buyer without a store to the become-seller flow, an existing seller to their dashboard. It redirects rather than rendering, and a redirect fires before any document is produced \u2014 so a page that returns 200 with content here is not redirecting at all.",
    expectedUiState: "Each of the three identities ends somewhere different and appropriate. None sees a 404, and none is left on /sell showing an error. A 200 carrying an error page rather than a redirect is the failure worth naming \u2014 it is exactly what no monitoring flags.",
    endResult: "Read-only; nothing persists."
  },
  "checklist-selling-become-seller-apply-seller": {
    roles: ["buyer"],
    startPage: "/user/become-seller",
    steps: [
      "Sign in as karthik.new@gmail.com / TempPass123!.",
      "Open /user/become-seller and read the whole form before typing.",
      "Submit it with every field empty and read where the errors appear.",
      "Type 'QA Store apply-seller' as the store name and fill every other required field.",
      "Submit the form.",
      "Read what is shown immediately afterwards.",
      "Reload the page and read it again."
    ],
    inputs: { storeName: "QA Store apply-seller" },
    expectedBehaviour: "The application creates a store and records the applicant's seller status. This view is a slot shell \u2014 rendering it with no render props gives a layout skeleton with no content at all, which is a page that looks built and does nothing.",
    expectedUiState: "The form renders with real fields, not an empty shell. Empty submission marks the individual fields. After submitting, the page reports the application's state rather than returning to a blank form, and that state survives the reload.",
    endResult: "A store exists for karthik.new@gmail.com. Note its status \u2014 it feeds the next two cases."
  },
  "checklist-selling-become-seller-store-setup": {
    roles: ["seller"],
    startPage: "/store",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!, whose store-letitrip-official is approved and public.",
      "Open /store and read the dashboard.",
      "Open the store's own settings and read its name, description, logo and banner.",
      "Change the description to 'QA Store store-setup description' and save.",
      "RELOAD and read the description.",
      "Open the store's public page and read the description there.",
      "Restore the original description."
    ],
    inputs: { description: "QA Store store-setup description" },
    expectedBehaviour: "An approved store is approved on both documents at once \u2014 the user record's status AND the store's own status and public flag. Flipping only the user's leaves the seller with a working dashboard and a store invisible to the public, because every visibility check reads the store's own status. That is why this case reads the PUBLIC page and not only the dashboard.",
    expectedUiState: "The dashboard loads rather than showing a pending-approval gate. The edited description survives the reload AND appears on the public store page. A description that saves in the dashboard but never reaches the public page means the store is not actually public.",
    endResult: "The description is restored by the final step. The public page rendering at all is the real assertion here."
  },
  "checklist-selling-become-seller-store-address": {
    roles: ["seller"],
    startPage: "/store/addresses",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /store/addresses and read the existing pickup addresses.",
      "Add one: name 'QA Address store-address', street '10 Test Lane', city 'Indore', state 'Madhya Pradesh', pincode 452010, landmark 'Behind the arena'.",
      "Mark it as a pickup location and save.",
      "RELOAD the page and read every field of the new address, including the landmark.",
      "Delete it."
    ],
    inputs: {
      name: "QA Address store-address",
      street: "10 Test Lane",
      city: "Indore",
      state: "Madhya Pradesh",
      pincode: "452010",
      landmark: "Behind the arena"
    },
    expectedBehaviour: "A store address is written into the same top-level addresses collection as buyer addresses, discriminated by owner type rather than living in a subcollection of its own. Every field the form offers is stored, including the landmark \u2014 a form missing a field does not leave it alone, it sends undefined and overwrites.",
    expectedUiState: "After the reload every typed value is present, landmark included, and the pickup flag is still set. A blank landmark after the reload is the failure this case shares with the store-address edit case in page-wiring.",
    endResult: "The address is deleted by the final step so it does not accumulate across runs."
  },
  "checklist-selling-become-seller-create-storefront": {
    roles: ["buyer"],
    startPage: "/user/become-seller",
    steps: [
      "Sign in as karthik.new@gmail.com / TempPass123!, a buyer with no store.",
      "Open /user/become-seller and apply if the apply button is shown.",
      "Read the step that follows the application.",
      "Submit the store form with the name field empty and read where the error appears.",
      "Type 'QA Store create-storefront' as the store name, leave description and category untouched, and submit.",
      "Read where the browser lands.",
      "Open /stores in a private window with no session and search for 'QA Store create-storefront'."
    ],
    inputs: { storeName: "QA Store create-storefront" },
    expectedBehaviour: "Applying and owning a storefront are two separate steps, and the second one has to exist. BEFORE: applying flipped the account to seller and created NO store, there was no store-creation form anywhere in the product, and the page said 'head over to your Store Dashboard' — a dashboard with no store behind it. AFTER: the application is followed by a form that creates the store.",
    expectedUiState: "After applying, a form with a store-name field appears — not a 'you are already a seller' panel and not a bare link to the dashboard. Submitting it empty marks the name field rather than failing silently or showing a banner. Submitting it with a name lands on the store dashboard. The new store is NOT visible on /stores to a signed-out visitor, because it is pending review — a store that appears publicly straight away is the failure here, not a success.",
    endResult: "A pending, non-public store exists for karthik.new@gmail.com. It feeds the approve/reject case below."
  },
  "checklist-selling-become-seller-admin-approve-store": {
    roles: ["admin"],
    startPage: "/admin/stores",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/stores and filter to status 'pending'.",
      "Open the row actions for the pending 'QA Store create-storefront' and read every action offered.",
      "Choose Approve and confirm.",
      "Read the row's status after the list refreshes.",
      "Open /stores in a private window with no session and search for the store name.",
      "Back in /admin/stores, open the same row's actions and read whether Approve is still offered."
    ],
    expectedBehaviour: "A pending store needs an approve action that actually publishes it. BEFORE: this view offered only Verify and Suspend — there was no approve or reject anywhere in the admin UI, so a real applicant's store could never go live. AFTER: Approve moves status to active AND sets isPublic, because both go through the one writer that keeps them in step.",
    expectedUiState: "Approve and Reject both appear in the row menu, Approve carries a confirmation, and Reject is offered only while the store is pending. After approving, the row reads active AND the store is now findable on /stores by a signed-out visitor. A store that reads 'active' in admin but stays invisible on /stores is the exact failure this path was built to prevent — report it even though the admin list looks correct.",
    endResult: "The QA store is active and public. Leave it; the badge case below reads it."
  },
  "checklist-selling-become-seller-no-badge-below-bar": {
    roles: ["guest"],
    startPage: "/stores",
    steps: [
      "Open /stores with no session.",
      "Find 'QA Store create-storefront' — a store that has just been approved and has sold nothing.",
      "Read its card carefully for any badge or trust label.",
      "Open the store's own page and read the area beside the store name.",
      "Now find store-letitrip-official on /stores and read its card.",
      "Open store-letitrip-official's page and read the area beside its name.",
      "Click one of the badges on store-letitrip-official and read where it lands."
    ],
    expectedBehaviour: "Badges are shown only when earned, and they explain themselves. A brand-new store has neither. The platform's own store is pinned Verified and Trusted. BEFORE: NO badge rendered anywhere a buyer could see — isVerified was stripped from every public store payload — while the seller guide promised it 'appears on your store profile page and on every listing card'. AFTER: badges render, and clicking one opens an explanation.",
    expectedUiState: "The new store shows NO badge at all — not an 'unverified' chip, nothing. store-letitrip-official shows both Verified and Trusted Seller. Clicking a badge opens /help/seller-badges. A badge on the brand-new store is a failure; so is no badge on store-letitrip-official.",
    endResult: "Read-only; nothing persists."
  },
  "checklist-selling-become-seller-criteria-agree": {
    roles: ["guest"],
    startPage: "/help/seller-badges",
    steps: [
      "Open /help/seller-badges with no session and write down every criterion and its target number.",
      "Open /seller-guide and find the 'Growing your store' section. Write down its criteria and targets.",
      "Compare the two lists item by item, including the numbers.",
      "Read /help/seller-badges once more and look specifically for any mention of when the seller gets PAID."
    ],
    expectedBehaviour: "Every surface renders the criteria from one config, so the numbers cannot differ. BEFORE: three guides stated three DIFFERENT invented sets — '20 delivered, 4.0 rating, 3+ months' in one admin guide, '6 months, 4.5 rating, 50 delivered' in a seller guide — none of which any code read. AFTER: both pages show identical criteria and identical numbers.",
    expectedUiState: "The two lists match exactly, criterion for criterion and number for number. A single differing figure is the regression. Separately: the buyer-facing page must NOT say the platform pays trusted sellers before delivery — that is our private risk posture, and finding it stated to buyers is a reportable failure even though everything else on the page is right.",
    endResult: "Read-only; nothing persists."
  },
  "checklist-selling-become-seller-suspend-clears-trust": {
    roles: ["admin"],
    startPage: "/admin/stores",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/stores and open the row editor for store-letitrip-official. Read its Seller tier and Trusted seller controls and write both values down.",
      "Close the editor without saving. Open /stores signed out in another tab and confirm the store shows its Trusted Seller badge.",
      "Back in admin, suspend a DIFFERENT store you created for this run rather than the platform store — use 'QA Store create-storefront'. First set its Seller tier to 'trusted' and save, confirming the badge appears publicly.",
      "Now suspend that same store and confirm.",
      "Reopen its row editor and read Seller tier and Trusted seller.",
      "Open /stores signed out and look for the store."
    ],
    expectedBehaviour: "Leaving active revokes trust at once, not at the next monthly recalculation. The tier also carries early payout, so a suspended store that kept the flag would go on being paid before parcels land for up to 31 days on a decision the suspension just reversed. Setting a tier by hand also pins it against the monthly job.",
    expectedUiState: "Both the Seller tier and Trusted seller controls exist and show the stored values — a Trusted seller toggle that is missing, or that reads off on a store whose tier is trusted, is a failure. After suspending, Seller tier reads 'seller' and Trusted seller is off, and the store is gone from /stores. A suspended store still reading 'trusted' is the failure this case exists for.",
    endResult: "The QA store is suspended with no tier. store-letitrip-official is untouched."
  }
};
export {
  authored
};
