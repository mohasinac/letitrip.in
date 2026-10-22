const ADMIN_SIGNIN = "Sign in as admin@letitrip.in / TempPass123!.";
const authored = {
  "checklist-tools-sticker-promote-to-listings-promote-creates-one-group": {
    roles: ["admin"],
    startPage: "/tools/sticker-tracer",
    steps: [
      ADMIN_SIGNIN,
      "Open a sheet whose active run has already been accepted and rendered to full resolution, with at least one part marked a duplicate of another.",
      'Click "Promote to listings". Pick "Beyblade Arena" as the store, enter 499 for the sheet price and 99 for the flat part price, then confirm.',
      `Open the newly created parent listing's product page and view its group/"Pick what you want" section.`
    ],
    expectedBehaviour: "The promoter creates one parent (the whole sheet) plus one child per UNIQUE part only \u2014 a part marked `duplicateOf` another must NOT get its own listing. All children are linked into ONE group via `linkChildrenToGroup`, a single batch call rather than N separate `linkChildToGroup` calls in a loop.",
    expectedUiState: "The group picker on the parent's page shows every UNIQUE child \u2014 if the sheet had, say, 8 parts with 3 confirmed duplicates, the picker shows 5 members, not 1 and not 8. This is exactly the `linkChildToGroup` stale-append bug this phase fixed first: looping that call used to leave only the LAST child linked, so the picker showed just one member no matter how many parts existed.",
    endResult: "BEFORE the fix, promoting an 8-part sheet silently produced a group whose parent claimed only 1 child, even though all 8 children individually had the correct `groupId` set. AFTER: the group's member list and the children's own `groupId`s agree."
  },
  "checklist-tools-sticker-promote-to-listings-promoted-part-image-watermarked": {
    roles: ["admin"],
    startPage: "/tools/sticker-tracer",
    steps: [
      ADMIN_SIGNIN,
      "After promoting a sheet, open one of the new CHILD listings' public product page and inspect its main image.",
      "Separately, from the tracer's own sheet-review UI, download that same part's original full-resolution file (via the signed URL, not the public page)."
    ],
    expectedBehaviour: "The marketplace copy is served through `/media/{shortId}`, which the proxy watermarks on read because the `mediaAssets` row for it was written with `watermarkedAt` deliberately absent. The admin's own download goes through a signed GCS URL pointing at the SAME `assetPath` \u2014 the clean original \u2014 with zero bytes duplicated between the two.",
    expectedUiState: "The public listing's image carries a visible watermark. The admin's direct download of the same part is clean \u2014 no watermark at all. Both are visibly the same artwork at the same crop.",
    endResult: "BEFORE this phase, there was no public listing for a traced part at all. AFTER: the same pixels serve two audiences two different ways from one stored object \u2014 if the public copy is clean, or the admin's download is watermarked, the `watermarkedAt` wiring has inverted."
  },
  "checklist-tools-sticker-promote-to-listings-promote-refuses-before-full-res-render": {
    roles: ["admin"],
    startPage: "/tools/sticker-tracer",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      'Open a sheet that has been traced but whose run has NOT had "Accept & render" run on it (a fresh trace, or one accepted but not yet rendered to full resolution).',
      "Attempt to promote it to listings."
    ],
    expectedBehaviour: "`promoteStickerSheetToListings` checks every precondition UP FRONT \u2014 an active run, at least one unique part, and every unique part actually carrying an `assetPath` \u2014 and refuses the WHOLE action if any is missing, rather than creating a handful of listings and silently skipping the rest.",
    expectedUiState: `The action is refused with a message naming the missing step (e.g. "accept and render the run before promoting it to listings"). NO parent or child listing is created \u2014 checking the store's product list afterward shows nothing new.`,
    endResult: "BEFORE this check existed, promoting too early would have been the exact 'wrong data, no error' failure this whole phase exists to avoid: some parts listed, others silently missing, with nothing anywhere saying so. AFTER: the refusal happens before any write, so a half-promoted sheet cannot exist."
  }
};
export {
  authored
};
