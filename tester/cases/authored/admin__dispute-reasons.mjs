const authored = {
  "checklist-admin-dispute-reasons-list-and-scope-chips": {
    roles: ["admin"],
    startPage: "/admin/dispute-reasons",
    steps: [
      "Sign in as an admin and open /admin/dispute-reasons from the sidebar under Trust & Safety.",
      "Count the rows on the default view and note which scope chip is selected.",
      "Click the Retired chip, then the All chip, noting the row count each time.",
      "Read the kind line under two or three reasons."
    ],
    expectedBehaviour: "BEFORE: the eleven seeded reasons had no management surface at all - nothing could review them and nothing could RETIRE one, so the list could only ever grow and a typo'd row was permanent. AFTER: a list with Active / Retired / All scope chips.",
    expectedUiState: "The page opens on Active and shows the seeded reasons. Each row states its kind in words ('Item problem - it arrived wrong or damaged' or 'Never arrived - the parcel did not reach the buyer'), not a bare token. Retired shows fewer rows (none, on a fresh seed) and All shows at least as many as Active. There is NO search box, because the endpoint does not read a search term - a box that accepted typing and changed nothing would be the failure.",
    endResult: "Read-only."
  },

  "checklist-admin-dispute-reason-row-is-openable": {
    roles: ["admin"],
    startPage: "/admin/dispute-reasons",
    steps: [
      "Open /admin/dispute-reasons and click a row (not its buttons).",
      "Read every field in the panel that opens.",
      "Close it, then click the View button on a different row."
    ],
    expectedBehaviour: "A row can be READ, not only acted on. The kind is the only field with a consequence - it decides which gate a dispute raised under this reason inherits - so retiring a reason without being able to see its kind would mean narrowing the wrong form.",
    expectedUiState: "A detail panel showing the buyer-facing wording, the kind spelled out, the state (Active - buyers see it / Retired - hidden from the form), who added it, and the id. It also states that retiring is never a delete. A row offering only Retire with no way to open it is the failure.",
    endResult: "Read-only; close the panel."
  },

  "checklist-admin-dispute-reason-retire-and-reactivate": {
    roles: ["admin"],
    startPage: "/admin/dispute-reasons",
    steps: [
      "Open /admin/dispute-reasons on the Active chip and note the first reason's wording.",
      "Click Retire on it and READ the confirmation body before confirming.",
      "Confirm, then reload the page.",
      "Switch to the Retired chip and find it.",
      "Click Reactivate on it, then reload and confirm it is back under Active.",
      "Open /admin/audit-log and look for entries about this reason."
    ],
    expectedBehaviour: "Retire is a soft flag, never a delete - a past dispute names the row. The confirmation names what retiring does NOT do. Only the RETIRE is audit-logged: it removes an option buyers could pick, where putting one back restores the documented default.",
    expectedUiState: "The dialog says buyers stop seeing it, disputes already raised keep their wording, and it can be put back at any time - NOT a generic 'are you sure'. After confirming, the row leaves Active and appears under Retired with a 'Retired' badge. Reactivate returns it to Active with its ORIGINAL 'Added by' name intact. /admin/audit-log gains ONE entry (the retire) and not two.",
    endResult: "The reason is back to Active. Confirm with a reload before finishing."
  },

  "checklist-admin-dispute-reason-create-and-collision": {
    roles: ["admin"],
    startPage: "/admin/dispute-reasons",
    steps: [
      "Open /admin/dispute-reasons and click 'Add reason'.",
      "Confirm the Kind field offers exactly TWO options and read their wording.",
      "Enter a distinctive wording such as 'Tester courier left it at the wrong flat', pick a kind, and save.",
      "Reload and find the new row; note its 'Added by' name.",
      "Click 'Add reason' again and submit the SAME wording with the SAME kind.",
      "Reload and count how many rows carry that wording.",
      "Retire the row you created to leave the list as you found it."
    ],
    expectedBehaviour: "The id is derived from the wording (`dreason-<slug>`), so the same reason cannot be added twice. A colliding create returns the EXISTING row rather than overwriting it - that row has an author and may already be named on live disputes.",
    expectedUiState: "Two kind options only, each spelled out in words. The new row appears under Active with your display name as 'Added by'. The second submit does NOT create a duplicate - there is exactly ONE row with that wording afterwards. Two rows, or an error on the second submit, is the failure.",
    endResult: "Your test reason is Retired. Note its wording in the result so it can be cleaned up."
  },

  "checklist-buyer-dispute-form-is-reachable-from-the-order": {
    roles: ["buyer"],
    startPage: "/user/orders",
    steps: [
      "Sign in as a buyer with at least one order and open /user/orders.",
      "Open any order's detail page.",
      "Find a 'Report a problem' button among the order's actions.",
      "Click it and confirm the URL is /user/orders/<id>/dispute.",
      "Repeat from an order in a DIFFERENT status (one not delivered, if you have one)."
    ],
    expectedBehaviour: "BEFORE: RaiseDisputeForm was complete and had NO mount site anywhere - the model, gate, collection, seed and API all existed and nothing rendered the form (Root Cause #37). AFTER: a deep-linkable page plus a button on the order. The button is deliberately UNGATED by order status: the gate decides per kind, and gating on 'delivered' would hide the form from exactly the buyer whose parcel never came.",
    expectedUiState: "'Report a problem' is present on the order detail page regardless of status, beside Track / Return / Claim. It lands on the dispute page. A button that only appears on delivered orders is the failure.",
    endResult: "Read-only - do not submit. Leave the form without filing."
  },

  "checklist-buyer-dispute-kind-gate-explains-rather-than-hides": {
    roles: ["buyer"],
    startPage: "/user/orders",
    steps: [
      "Open an order's detail page and click 'Report a problem'.",
      "Look at the two kind choices and note which are selectable.",
      "For any kind that is NOT selectable, read the text beside it.",
      "Pick a selectable kind and open the reason picker.",
      "Note which reasons are offered.",
      "Switch to the other kind if it is selectable, and re-open the reason picker."
    ],
    expectedBehaviour: "Both kinds are always SHOWN; one that this order cannot support is disabled with the reason stated. A silently missing option looks like a bug, and 'why can't I report this?' is a question the form should answer. The reason list is scoped to the chosen kind - a buyer reporting a damaged item must never be offered 'it never arrived', because that reason belongs to the other gate and the server would refuse it.",
    expectedUiState: "Two kinds listed. An unavailable one is greyed WITH an explanation (for example that the order has not been delivered yet, or a date from which it can be reported). The reason picker's contents CHANGE when the kind changes - showing the previous kind's reasons after switching is the failure, because the server refuses a mismatched reason.",
    endResult: "Read-only - do not submit."
  },

  "checklist-buyer-dispute-reason-list-failure-is-visible": {
    roles: ["buyer"],
    startPage: "/user/orders",
    steps: [
      "Open an order and click 'Report a problem'.",
      "Pick a kind so the reason picker loads.",
      "Confirm reasons appear rather than an empty list.",
      "Type a few letters into the reason picker's search and confirm the list narrows."
    ],
    expectedBehaviour: "A failed reason fetch SURFACES rather than resolving to an empty list: an empty picker is indistinguishable from 'there are no reasons', and the buyer would sit on a required field with nothing in it (Root Cause #59). The picker searches the label, which is allowlisted for filtering - an unallowlisted searched field is silently dropped and the picker returns the whole list while looking as though it filtered (Root Cause #62).",
    expectedUiState: "Real reasons appear for the chosen kind. Typing narrows them. An empty picker with no message, or a picker that ignores what you type while appearing to search, are both failures.",
    endResult: "Read-only - do not submit."
  },

  "checklist-buyer-dispute-deep-link-without-the-order": {
    roles: ["buyer"],
    startPage: "/user/orders",
    steps: [
      "Note one of your real order ids from /user/orders.",
      "Open /user/orders/<that-id>/dispute directly by URL and confirm the form renders.",
      "Now open /user/orders/not-a-real-order-id/dispute.",
      "Note what is shown."
    ],
    expectedBehaviour: "The page is deep-linkable because a notification's actionUrl lands on the order and the button is one click away. A failed order fetch renders an ERROR rather than an empty-but-usable form: the gate reads four dates off the order, so a form built from no dates would offer BOTH kinds unconditionally and the submit would then be refused.",
    expectedUiState: "The real id renders the form. The bogus id shows a clear 'couldn't load this order' message and NO usable kind choices. A form that renders both kinds as selectable for an order that could not be loaded is the failure.",
    endResult: "Read-only - do not submit."
  }
};
export {
  authored
};
