/*
 * D56 — self-serve ad bookings.
 *
 * 🛑 Three cases, and every one is a BEFORE → AFTER because all three
 * failures return HTTP 200 with a plausible-looking result:
 *
 *  1. a double-booked slot looks like a successful booking to both buyers
 *  2. an unreviewed creative rendering on the site looks like a live ad
 *  3. an approved creative edited afterwards looks like an approved ad
 *
 * None of them errors anywhere. A case reading "check booking works" passes
 * against all three.
 */
const authored = {
  "checklist-selling-ad-booking-slot-cannot-be-double-booked": {
    roles: ["seller"],
    startPage: "/advertise",
    steps: [
      "Sign in as an advertiser and book any enabled placement for next month.",
      "Note the confirmation and the month you booked.",
      "Sign in as a DIFFERENT account in a second browser profile.",
      "Book the SAME placement for the SAME month.",
      "Read exactly what the second attempt says.",
      "Return to the first account and confirm its booking is unchanged."
    ],
    expectedBehaviour:
      "A slot is one advertiser per month. The availability check is a document collision rather than a query, so there is no window in which two concurrent bookings can both be told the slot is free.",
    expectedUiState:
      "BEFORE this feature there was no booking at all. AFTER: the second attempt is REFUSED and says the slot is already booked for that month — not a validation error about the form, and not a silent success. The first account's booking still shows its own creative, its own price and its own month; nothing about it changed.",
    expectedData: { secondBookingRefused: true, firstBookingUnchanged: true },
    endResult: "One booking exists on that placement for that month, owned by the first advertiser."
  },

  "checklist-selling-ad-creative-does-not-render-before-review": {
    roles: ["guest"],
    startPage: "/",
    steps: [
      "Have an advertiser book a placement for the CURRENT month and submit a creative.",
      "Do not moderate it.",
      "Open the public site signed out and go to a page carrying that placement.",
      "Look for the advertiser's creative — its title, its image, its CTA.",
      "Open the page source and search for the creative's title text."
    ],
    expectedBehaviour:
      "A self-serve surface takes creatives from members of the public, so nothing reaches a page until a human has approved it. Paying for the slot and the month being current are not enough on their own.",
    expectedUiState:
      "The placement renders whatever it renders with no booking — house content or nothing. The advertiser's title, image and CTA appear NOWHERE on the page, including in the page source: it is withheld server-side, not hidden with CSS.",
    expectedData: { unreviewedCreativeVisible: false },
    endResult: "The booking is still awaiting review and nothing of it has been published."
  },

  "checklist-selling-ad-edit-after-approval-returns-to-review": {
    roles: ["seller"],
    startPage: "/advertise",
    steps: [
      "Have an admin approve an advertiser's creative so it is live.",
      "Confirm it renders on the public site.",
      "As the advertiser, edit the creative — change the title and the image.",
      "Save, then read the booking's own status on your bookings page.",
      "Open the public page that was showing the ad and reload."
    ],
    expectedBehaviour:
      "Approval is of a specific creative, not of an advertiser. Submit something bland, get approved, then swap the image is the whole attack and needs no cleverness — so an edit returns the booking to review in the same write that saves it.",
    expectedUiState:
      "BEFORE: a system where approval sticks to the booking would keep showing the slot as live and publish the new image immediately. AFTER: the booking reads as awaiting review again, and the public page stops showing the ad entirely — it does not show the OLD approved creative either, because the approved one no longer exists.",
    expectedData: { moderationResetOnEdit: true, newCreativeVisibleBeforeReview: false },
    endResult: "The edited creative is queued for review and nothing of it is public."
  }
};
export {
  authored
};
