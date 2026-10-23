const authored = {
  "checklist-buying-delivery-snapshot-invoice-keeps-the-original": {
    roles: ["buyer"],
    startPage: "/user/orders",
    steps: [
      "Place an order to a saved address, noting the exact address you picked.",
      "Open the order and use 'Change delivery address' to pick a DIFFERENT saved address.",
      "Open the order's invoice.",
      "Open the order's delivery/tracking panel."
    ],
    expectedBehaviour:
      "BEFORE: the order carried one free-text `shippingAddress` string that was editable, so a correction OVERWROTE what the buyer chose and the invoice silently restated itself — there was no record of the original at all. AFTER: the invoice shows the address agreed at purchase; the parcel follows the correction.",
    expectedUiState:
      "The invoice shows the FIRST address. The delivery panel shows the SECOND. Both being the second is the failure this split exists to prevent — it means the invoice was rewritten after the fact.",
    endResult: "One order with one amendment. Leave it; the amendment is the record."
  },

  "checklist-buying-delivery-snapshot-tax-does-not-move": {
    roles: ["buyer"],
    startPage: "/user/orders",
    steps: [
      "Place an order to an address in your own state and note the tax lines (CGST+SGST for an in-state supply, IGST otherwise).",
      "Change the delivery address to one in a DIFFERENT state.",
      "Re-open the invoice and read the tax lines again."
    ],
    expectedBehaviour:
      "Place of supply is fixed at the time of supply. An address correction afterwards must not re-decide CGST/SGST versus IGST on an invoice that has been issued and may already have been filed.",
    expectedUiState:
      "The tax lines are IDENTICAL to before the change — same split, same amounts. Any movement is the failure: it means a filed return and the invoice no longer agree.",
    endResult: "Read-only after the address change."
  },

  "checklist-buying-delivery-snapshot-refused-after-dispatch": {
    roles: ["buyer"],
    startPage: "/user/orders",
    steps: [
      "Find an order that has already shipped (it shows a tracking number).",
      "Try to change its delivery address."
    ],
    expectedBehaviour:
      "The parcel is with the courier, so a new address changes nothing we control. Accepting one would tell the buyer their correction took effect when it did not — worse than refusing, which at least routes them to support.",
    expectedUiState:
      "The control is absent or disabled, and the reason says the order has already been dispatched and to contact support. A form that accepts the change and reports success is the failure.",
    endResult: "Nothing changed."
  },

  "checklist-buying-delivery-snapshot-someone-elses-address-refused": {
    roles: ["buyer"],
    startPage: "/user/orders",
    steps: [
      "Open an order you own that has not shipped.",
      "Open the change-address control and read the list offered."
    ],
    expectedBehaviour:
      "A correction names an address ID, and an ID is guessable in a way an address is not — so the server resolves it against the ORDER'S BUYER. Without that check a parcel ships to a stranger's house at the buyer's expense, with nothing erroring.",
    expectedUiState:
      "Only the buyer's OWN saved addresses are offered. There is no free-text address entry anywhere in this flow — a box accepting a typed address is the failure, because nothing would record that the destination was ever theirs.",
    endResult: "Read-only; close without changing."
  },

  "checklist-buying-order-line-keeps-what-was-described": {
    roles: ["buyer"],
    startPage: "/user/orders",
    steps: [
      "Place an order for an item whose listing has a description and a spec table.",
      "Ask the seller (or use an admin account) to EDIT that listing's description afterwards.",
      "Re-open the order and read the item's details."
    ],
    expectedBehaviour:
      "BEFORE: an order line carried the title and image only, so 'it was described as sealed' resolved against the LIVE listing — which the seller can edit after the sale. AFTER: the order keeps the description and specs as they read at purchase.",
    expectedUiState:
      "The order shows the ORIGINAL description and spec rows, not the edited ones. The live product page shows the edit. Both showing the new text is the failure.",
    endResult: "Restore the listing text if you changed it on a seeded product."
  },

  "checklist-buying-long-description-is-marked-as-trimmed": {
    roles: ["admin"],
    startPage: "/admin/orders",
    steps: [
      "Find or create a listing whose description is well over 2,000 characters.",
      "Place an order for it.",
      "Open the order line and read the description shown."
    ],
    expectedBehaviour:
      "The description is capped so a long one cannot push the order document past Firestore's 1 MiB ceiling — an unbounded copy on a multi-line order is a rejected write AT CHECKOUT. Truncation is recorded, not silent: a short description and a cut one must not read alike, or a dispute argues over text nobody can tell was clipped.",
    expectedUiState:
      "The stored description stops at the cap and the line is marked as trimmed. A description that simply ends mid-sentence with no indication is the failure; so is a checkout that errors.",
    endResult: "Read-only."
  }
};

export default authored;
