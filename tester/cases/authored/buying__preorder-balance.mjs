/*
 * D55 — the pre-order balance collector.
 *
 * 🛑 Every case here is written as an explicit BEFORE → AFTER, because the
 * defect this feature fixes returned HTTP 200 the whole time: the balance was
 * computed, printed on the order page, and nothing in the product could
 * accept it. A case reading "check the balance works" would have passed
 * against that for months.
 *
 * The four it covers are the four that cannot be read off the code:
 *  1. nothing is advertised before the seller opens collection
 *  2. opening twice does not move the buyer's deadline
 *  3. a rejection says WHY and lets the buyer try again
 *  4. the seller never sees the buyer's bank screenshot
 */
const authored = {
  "checklist-buying-preorder-balance-not-payable-before-stock-lands": {
    roles: ["buyer"],
    startPage: "/pre-orders",
    steps: [
      "Sign in as karthik.new@gmail.com / TempPass123!.",
      "Open /pre-orders, pick an in-stock pre-order and complete checkout — this pays the DEPOSIT only.",
      "Open /user/orders and open the order you just placed.",
      "Read the provenance card, which states the deposit paid and the balance due.",
      "Now look for any control that would let you pay that balance.",
      "Open /user/pre-orders and read the row for the same order."
    ],
    expectedBehaviour:
      "A pre-order's premise is that the item does not exist yet, so the balance is not collectable until the seller says stock arrived. Offering payment earlier would be asking the buyer to fund the seller's inventory.",
    expectedUiState:
      "BEFORE this feature the order page printed 'Balance due ₹X' with no control anywhere, which reads as a broken site. AFTER: the figure is still stated as part of the provenance, and there is NO payment form, NO 'Pay balance' button and NO balance row on /user/pre-orders — because the seller has not opened collection. An empty or disabled payment card is also wrong: there should be nothing at all.",
    expectedData: { balancePaymentFormVisible: false },
    endResult: "The order is unchanged and still shows the deposit as the only payment."
  },

  "checklist-selling-preorder-balance-open-is-idempotent": {
    roles: ["seller"],
    startPage: "/store/orders",
    steps: [
      "Sign in as the seller who owns the pre-order placed in the case above.",
      "Open /store/orders and open that order.",
      "Find the 'Pre-order balance' block and read the amount and the wording on the button.",
      "Press 'Stock has arrived — open balance'.",
      "Read the block again and write down the due date it now shows the buyer.",
      "Reload the page and press any control the block still offers.",
      "Read the due date again."
    ],
    expectedBehaviour:
      "Opening is an EVENT, not a toggle: it starts the buyer's payment window. A second open that restarted that window would silently extend the deadline every time anyone touched the control, and the server is idempotent precisely so it cannot.",
    expectedUiState:
      "BEFORE the press: a button labelled around stock arriving, plus the amount owed. AFTER the press: the block is read-only and states the balance is open and awaiting the buyer — the button is GONE, not greyed. On reload the due date is the SAME date, not a week later.",
    expectedData: { dueDateUnchangedOnSecondOpen: true },
    endResult: "The order carries one open balance with one due date, and the buyer has been notified once."
  },

  "checklist-buying-preorder-balance-rejection-says-why-and-allows-retry": {
    roles: ["buyer"],
    startPage: "/user/orders",
    steps: [
      "Sign in as the buyer whose pre-order balance the seller opened.",
      "Open the order and find the balance payment form.",
      "Upload any image as the proof, enter a transaction reference, and submit.",
      "Read what the panel says immediately afterwards.",
      "Have an admin open the same order at /admin/orders, reject the balance proof, and write a reason in the note box.",
      "Return to the buyer's order page and reload."
    ],
    expectedBehaviour:
      "A rejection without a reason guarantees the next attempt is the same proof again, so the note is required server-side, not merely encouraged. And rejecting a BALANCE must not do what rejecting a deposit does — the goods are already made and allocated to this buyer, so there is no cancellation, no stock change and no account ban.",
    expectedUiState:
      "After submitting: 'Balance under review' and NO form. After the rejection: the form is back, and the admin's actual words are shown above it. The order is still open, its status unchanged, and nothing says the account is suspended.",
    expectedData: { formReturnsAfterRejection: true, orderCancelledByRejection: false },
    endResult: "The buyer can submit a second proof against the same order and the same amount."
  },

  "checklist-selling-preorder-balance-seller-never-sees-the-screenshot": {
    roles: ["seller"],
    startPage: "/store/orders",
    steps: [
      "Sign in as the seller who owns a pre-order whose buyer has submitted a balance proof.",
      "Open /store/orders and open that order.",
      "Read the 'Pre-order balance' block closely.",
      "Open your browser's network tab, reload, and read the JSON the order endpoint returned.",
      "Search that JSON for a proof image URL."
    ],
    expectedBehaviour:
      "The same split the deposit already uses: a seller sees the reference and the state, an admin sees the bank screenshot. A seller approving payment to themselves is not a review, so the screenshot and the verify controls are both admin-only.",
    expectedUiState:
      "The block states the amount, that a proof is under review, and the reference. There is NO image, and NO accept/reject control. The JSON carries no proof URL at all — it is stripped server-side rather than merely hidden by the page.",
    expectedData: { proofUrlInSellerPayload: false, sellerCanApproveBalance: false },
    endResult: "The balance stays awaiting staff review; nothing the seller did changed it."
  }
};
export {
  authored
};
