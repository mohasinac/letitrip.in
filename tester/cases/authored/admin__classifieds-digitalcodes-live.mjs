const authored = {
  "checklist-admin-classifieds-digitalcodes-live-classified-create-moderate": {
    roles: ["admin", "seller", "guest"],
    startPage: "/admin/products",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!, open /store/classified/new, and create a listing titled 'QA Classified admin-moderate' at 900 with City 'Pune' under Meetup Details. Publish it and note the slug on its public URL.",
      "Sign in as admin@letitrip.in / TempPass123! and open /admin/products.",
      "Open the filter drawer, tick Classified in its multi-select Type chip group, apply, and find the listing.",
      "In that same filter drawer read the Status chip group \u2014 All, Pending, Published, Draft, Archived \u2014 and select each in turn, noting which one returns this listing.",
      "Open the row menu, choose 'Quick edit', set Status to Archived, and save.",
      "Open the listing's public URL and read what is shown.",
      "Quick-edit it back to Published, then sign in as admin@letitrip.in and delete it from /store/classified."
    ],
    inputs: { title: "QA Classified admin-moderate", price: 900, city: "Pune", archivedVia: "Quick edit" },
    expectedBehaviour: "An admin status change reaches the public read path. Every status chip must also name a value the documents actually hold \u2014 a chip whose id is a display label rather than the stored value matches nothing forever and returns an empty list with no error.",
    expectedUiState: "While published the listing is returned by the Published chip and by no other. After the archive the public URL no longer renders it as a live listing, and the Archived chip returns it \u2014 the admin row will look correct either way, so the public page is the oracle. A chip returning nothing while All holds rows of that status is a separate finding worth naming.",
    expectedData: { statusAfterArchive: "archived", chipReturningIt: "Archived" },
    endResult: "The listing is Published again and then deleted. Re-open the public URL after the delete: a page still rendering it is a cache or projection failure."
  },
  "checklist-admin-classifieds-digitalcodes-live-digitalcode-create-moderate": {
    roles: ["admin", "seller", "guest"],
    startPage: "/admin/products",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!, open /store/digital-codes/new, and create a listing titled 'QA Digital Code admin-moderate' at 350. Publish it.",
      "REOPEN it from /store/digital-codes for editing \u2014 the code pool is only mounted in edit mode \u2014 and add three codes QA-CODE-1, QA-CODE-2, QA-CODE-3. Note the slug on its public URL.",
      "Sign in as admin@letitrip.in / TempPass123!, open /admin/products, open the filter drawer, tick Digital Code in its Type chip group, apply, and find the listing.",
      "Read the row and every column: are the actual CODE STRINGS visible anywhere in the list?",
      "Open the row menu, choose 'Quick edit', set Status to Archived, and save.",
      "Open the listing's public URL and read what is shown.",
      "Quick-edit it back to Published, then sign in as admin@letitrip.in and delete it from /store/digital-codes."
    ],
    inputs: {
      title: "QA Digital Code admin-moderate",
      price: 350,
      codeCount: 3,
      codes: "QA-CODE-1, QA-CODE-2, QA-CODE-3"
    },
    expectedBehaviour: "Moderation works the same for this type, and the code pool is the thing worth watching: an unsold code is inventory a buyer will pay for, so it must not be readable from a list view. Availability for this type reads the nested pool count rather than a stock figure, which is why the pool has to exist before the listing can be judged available at all.",
    expectedUiState: "The listing is findable under the Digital Code chip and its archive takes effect publicly. NO unredeemed code string appears in the admin list \u2014 not in a column, not in a tooltip, not in the quick-edit drawer. If any is visible, quote it and say exactly where; that is a finding, not a pass.",
    expectedData: { codesVisibleInAdminList: false, statusAfterArchive: "archived" },
    endResult: "The listing is Published again and then deleted. Record whether an admin can read an unredeemed code anywhere in the product \u2014 a 'no' here is a leak of paid inventory."
  },
  "checklist-admin-classifieds-digitalcodes-live-live-create-moderate": {
    roles: ["admin", "seller", "guest"],
    startPage: "/admin/products",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!, open /store/live/new, and create a listing titled 'QA Live Item admin-moderate' at 3000 with 'Species / Common Name' set to Dog and 'Jurisdictions where sale is permitted' set to Maharashtra only.",
      "Attach /test-media/sample-video.mp4 as its video and publish it. Note the slug on its public URL.",
      "Sign in as admin@letitrip.in / TempPass123!, open /admin/products, open the filter drawer, tick Live Item in its Type chip group, apply, and find the listing.",
      "Open the row menu and then the editor at /admin/products/{its id}/edit. Read every section and record whether the species, the jurisdiction list and the video appear ANYWHERE.",
      "Return to /admin/products, open the row menu, choose 'Quick edit', set Status to Archived, and save.",
      "Open the listing's public URL and read what is shown.",
      "Quick-edit it back to Published, then sign in as admin@letitrip.in and delete it from /store/live."
    ],
    inputs: {
      title: "QA Live Item admin-moderate",
      price: 3e3,
      species: "Dog",
      jurisdictions: "Maharashtra",
      video: "/test-media/sample-video.mp4"
    },
    expectedBehaviour: "A live listing is the one type where moderation has a duty beyond commerce \u2014 the jurisdiction list decides who may lawfully receive the animal or plant, and the video is what the moderator judges the listing on. Both must be visible to the admin, or the moderator is approving and rejecting blind.",
    expectedUiState: "\u{1F6D1} EXPECT THIS TO FAIL ON THE ADMIN HALF, AND RECORD IT AS A FAILURE. The admin editor has three sections \u2014 Listing type, Details, Inventory \u2014 and its listing-type tabs render EMPTY content, so no species, no jurisdiction list and no video is shown. Confirm that by reading the sections and say so, naming the three sections you found. The archive half does hold: it takes effect on the public page. Keep the two apart in the comment \u2014 the moderation mechanics work and the information the moderator needs is absent.",
    expectedData: { adminSectionsSeen: 3, speciesShownToAdmin: false, videoShownToAdmin: false },
    endResult: "The listing is Published again and then deleted. Record specifically whether the video was viewable from any admin surface \u2014 that is the finding, not the status change."
  },
  /*
   * 🛑 ADDED 2026-09-29. The three cases above all archive; none of them used
   * the 'Reject' action, and it is the one that writes a value the rest of the
   * product cannot represent.
   *
   * `ProductStatus` is draft | published | in_review | archived — four values,
   * no 'rejected'. `ADMIN_PRODUCT_STATUS_TABS` mirrors those four plus All.
   * But AdminProductsView's Reject row action writes `{ status: "rejected" }`,
   * and the PATCH schema types status as a bare `z.string().optional()`, so it
   * is persisted verbatim with no validation.
   *
   * The effect looks right — every public query filters `status == published`,
   * so the listing does disappear — which is exactly why nobody noticed. The
   * cost is on the way back: the row now matches no status chip, so an admin
   * can only reach it under All, and the seller's own status filters cannot
   * isolate it either. Root Cause #33's shape on the WRITE side.
   *
   * Written as a case rather than fixed: choosing between adding 'rejected' to
   * the union and making Reject write 'archived' is a product decision.
   */
  "checklist-admin-classifieds-digitalcodes-live-reject-status-has-no-chip": {
    roles: ["admin", "seller"],
    startPage: "/admin/products",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!, open /store/classified/new, and create a listing titled 'QA Classified reject-status' at 700 with City 'Pune'. Publish it.",
      "Sign in as admin@letitrip.in / TempPass123! and open /admin/products.",
      "Open the filter drawer, tick Classified in its Type chip group, apply, then find the listing, open its row menu and click 'Reject'.",
      "Read the status shown on the row.",
      "In the filter drawer select each Status chip in turn \u2014 Pending, Published, Draft, Archived \u2014 and record whether ANY of them returns the listing.",
      "Select the All status chip and confirm it is still there.",
      "Open the listing's public URL and read what is shown.",
      "Quick-edit it back to Published, then sign in as admin@letitrip.in and delete it from /store/classified."
    ],
    inputs: { title: "QA Classified reject-status", price: 700, city: "Pune", action: "Reject" },
    expectedBehaviour: "A rejected listing must stay reachable by the admin who rejected it. Hiding it from buyers is only half the job \u2014 a moderator needs to find it again to explain, reverse or escalate the decision, and the status filters are the only tool for that.",
    expectedUiState: "\u{1F6D1} EXPECT THE FILTER HALF TO FAIL. The row reads 'rejected', a value ProductStatus does not have, so none of the four status chips returns it and it is reachable only under All. Record which chips you tried and that each came back without it. The public half should hold \u2014 the listing is gone from its public URL, because every public query filters on published.",
    expectedData: { statusOnRow: "rejected", chipsReturningIt: 0 },
    endResult: "The listing is Published again and then deleted. Two findings to keep separate: a status no chip matches, and \u2014 if the public page still renders it \u2014 a far worse one."
  }
};
export {
  authored
};
