const authored = {
  "checklist-admin-pricing-tiers-and-units": {
    roles: ["admin"],
    startPage: "/admin/pricing",
    steps: [
      "Sign in as an admin and open /admin/pricing from the sidebar under Finance.",
      "Read the three tier headings and the sentence under each.",
      "Find the Platform commission row and the Platform fee cap row and read the value shown on each.",
      "Find the Payout hold row and read its value."
    ],
    expectedBehaviour:
      "BEFORE: every rate was a field on a settings tab, and nothing said what KIND of number it was - a GST percentage, an owner's ceiling and a back-office commission all looked identical, so the only thing between an agent and a statutory rate was that nobody had tried. AFTER: one table, grouped by tier, each value formatted by its own unit.",
    expectedUiState:
      "Three sections: Statutory, Policy ceiling, Operational. Values carry their unit - Platform commission reads as a percentage (e.g. '2%'), Platform fee cap as rupees (e.g. '₹10'), Payout hold in days (e.g. '7 days'). A bare number on all three, so the cap and the percentage read as the same kind of thing, is the failure.",
    endResult: "Read-only."
  },

  "checklist-admin-pricing-statutory-section-is-empty-on-purpose": {
    roles: ["admin"],
    startPage: "/admin/pricing",
    steps: [
      "Open /admin/pricing and look at the Statutory section.",
      "Count the rows under it.",
      "Read the sentence under the heading."
    ],
    expectedBehaviour:
      "A statutory rate is not ours to choose. It is sourced per HSN code on the Tax codes page, and a read-only copy here would be a SECOND place GST appears - on the day the two disagree, this page is the one an operator believes. So the section exists and is empty, which tells a reader the tier is real and where it is set.",
    expectedUiState:
      "The Statutory heading is present with NO rate rows beneath it, and the sentence under it says the rates are set per HSN code in Tax codes. Either of two things is a failure: the section missing entirely (statutory rates then look like something this platform does not have), or a greyed-out GST row appearing here (a second place the number lives).",
    endResult: "Read-only."
  },

  "checklist-admin-pricing-change-a-rate-and-see-the-history-line": {
    roles: ["admin"],
    startPage: "/admin/pricing",
    steps: [
      "Open /admin/pricing and note the current value of Gift wrap, and the small line under its description.",
      "Click Change on that row, enter a value one rupee different from the current one, and confirm.",
      "Read the row again once the table reloads.",
      "Reload the whole page and read the row a third time."
    ],
    expectedBehaviour:
      "A change is recorded, not just applied. Before any change the row says so in words; after one it shows what moved, to what, when and by whom - and that survives a reload, because it is stored rather than held in the page.",
    expectedUiState:
      "Before: the small line reads that there is no recorded change and this is the value it was configured with. After: the line reads as the old value, an arrow, the new value, a date and the admin's name. The new amount is shown in the value column. A row that updates its number but keeps saying 'no recorded change' is the failure - so is one where the history line disappears after a reload.",
    endResult:
      "The rate is left at the changed value. Set it back with a second Change if the original matters; the second change is itself recorded, which is the intended behaviour and not a mess to clean up."
  },

  "checklist-admin-pricing-change-is-forward-only": {
    roles: ["admin"],
    startPage: "/admin/pricing",
    steps: [
      "Open /admin/pricing and click Change on any operational rate.",
      "Read the sentence directly above the buttons.",
      "Confirm the change, then open /admin/orders and open any delivered order.",
      "Read the fee lines on that order."
    ],
    expectedBehaviour:
      "A rate answers 'what do we charge from now on' and never 'what did we charge'. Every historical read uses the order's own snapshot, so changing a rate must leave an already-recorded order showing exactly the figures it was charged at. If it did not, lowering a commission would silently restate every past payout and an invoice reprinted after a change would state a tax that was never collected - and invoices are filed.",
    expectedUiState:
      "The modal says in plain words that the change takes effect now and that orders, invoices and payouts already recorded keep the rate they were charged at. The delivered order opened afterwards shows the SAME fee amounts it showed before the change. Any figure on that order moving is the failure.",
    endResult: "One rate changed; the order is read-only."
  },

  "checklist-admin-pricing-change-is-in-the-audit-log": {
    roles: ["admin"],
    startPage: "/admin/pricing",
    steps: [
      "Open /admin/pricing, change any operational rate, and give a reason in the box.",
      "Open /admin/audit-log.",
      "Find the newest entry and read its action, target and reason."
    ],
    expectedBehaviour:
      "The rate page's own history answers 'when did THIS rate last move'. The audit log answers 'what have admins done lately' across every privileged act, and that is the one that has to survive - the rate log is capped and can lose its oldest entries.",
    expectedUiState:
      "A new audit-log row whose action is a pricing update, naming the rate that changed as its target and carrying the reason typed into the modal. No new row - meaning the change was recorded in only one of the two places - is the failure.",
    endResult: "One rate changed; the log is read-only."
  },

  "checklist-admin-pricing-rejects-an-unchanged-value": {
    roles: ["admin"],
    startPage: "/admin/pricing",
    steps: [
      "Open /admin/pricing and note the current value of any operational rate.",
      "Click Change on it and type that SAME value.",
      "Confirm."
    ],
    expectedBehaviour:
      "A change that changes nothing is refused rather than recorded. Writing it would add a history line and an audit row describing an event that did not happen, which makes both logs harder to read for no gain.",
    expectedUiState:
      "The modal stays open and says the value is already the current one. The message names the specific problem - a bare 'could not save' would leave the admin re-typing the same number. No new history line appears under the row.",
    endResult: "Nothing changed."
  }
};

export default authored;
