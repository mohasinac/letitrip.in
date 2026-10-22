const authored = {
  "checklist-admin-integrations-rows-state-and-consequence": {
    roles: ["admin"],
    startPage: "/admin/integrations",
    steps: [
      "Sign in as an admin and open /admin/integrations from the sidebar under Site.",
      "Confirm four rows are listed, payments first.",
      "Read each row's state badge and its 'Off means:' sentence.",
      "Read the authoritative settings field printed under each row."
    ],
    expectedBehaviour: "Every row's state is derived from readIntegrationStates, the SAME expression the API route guards resolve through, so the page cannot claim a state the enforcing code disagrees with.",
    expectedUiState: "Four rows: Online payments, Email sending, Courier booking, Support & tickets. Payments / email / support read On or Off; the SHIPPING row reads 'We book couriers' or 'Sellers self-ship' and NOT Disabled - off there selects a working manual path rather than stopping anything. Each row prints the settings field it writes, and the payments row prints BOTH gateway flags because the guard is an OR across them. A standing warning above the rows says payments must only be switched off when nobody is checking out.",
    endResult: "Read-only. A shipping row reading 'Disabled', or a payments row naming only razorpayEnabled, is the failure."
  },
  "checklist-admin-integrations-disable-confirm-states-consequence": {
    roles: ["admin"],
    startPage: "/admin/integrations",
    steps: [
      "Open /admin/integrations.",
      "Click Disable on the Support & tickets row and READ the dialog body before confirming.",
      "Cancel.",
      "Click Disable on the Courier booking row and read that dialog body too.",
      "Cancel."
    ],
    expectedBehaviour: "The confirmation body is the integration's OWN off-consequence, composed from the descriptor rather than a generic prompt.",
    expectedUiState: "The support dialog says the ticket surface disappears for buyers while staff keep access and the Help Centre stays up. The shipping dialog says sellers ship themselves and claim postage back, and that nothing stops moving. The two bodies are DIFFERENT. A generic 'Are you sure?' on both is the failure - it flattens the distinction the page exists to make.",
    endResult: "Both cancelled; nothing was written. Reload and confirm both rows are unchanged."
  },
  "checklist-admin-integrations-support-off-gates-the-right-side": {
    roles: ["admin"],
    startPage: "/admin/integrations",
    steps: [
      "Open /admin/integrations and switch Support & tickets OFF, confirming the dialog.",
      "Reload the page and confirm the row now reads Off.",
      "In a second tab as a BUYER, open /user/support.",
      "As the buyer, attempt to create a ticket.",
      "As a SELLER, open /store/support.",
      "As the admin, open /admin/support-tickets.",
      "Return to /admin/integrations and switch Support back ON."
    ],
    expectedBehaviour: "The gate is on RAISING a ticket, not ANSWERING one. Buyer-side creation and history close; staff and seller surfaces stay open so tickets already open are still workable.",
    expectedUiState: "The buyer's /user/support is not available and ticket creation is refused. /store/support and /admin/support-tickets BOTH still work. A seller or admin locked out alongside the buyer is the failure, because open tickets would then be unworkable.",
    endResult: "Support switched back ON and the row reads On after a reload. Any ticket created during the test is left for staff to close."
  },
  "checklist-admin-integrations-unban-request-stays-open": {
    roles: ["admin"],
    startPage: "/admin/integrations",
    steps: [
      "With Support & tickets switched OFF from the previous case, stay signed in as admin.",
      "Send a POST to /api/support/tickets with an ordinary ticket payload and note the status.",
      "Send a POST to /api/support/tickets with category unban_request and note the status.",
      "Switch Support back ON."
    ],
    expectedBehaviour: "unban_request is EXEMPT from the integration gate. It is the formal appeal channel, already exempt from the soft-ban guard and the ticket cap, and an integration toggle must not be able to close a channel a soft ban is explicitly forbidden from closing.",
    expectedUiState: "The ordinary ticket POST is refused with a 404. The unban_request POST SUCCEEDS. Both being refused is the failure - it would leave a banned user with no way to appeal.",
    endResult: "Support switched back ON. Delete or close any test ticket created."
  },
  "checklist-admin-integrations-disable-all-is-one-write": {
    roles: ["admin"],
    startPage: "/admin/integrations",
    steps: [
      "Open /admin/integrations with all four integrations in a known state.",
      "Note the newest entry in /admin/audit-log.",
      "Return to /admin/integrations and click 'Disable all', reading the dialog before confirming.",
      "Reload and confirm every row's state.",
      "Open /admin/audit-log and count the new entries.",
      "Click 'Enable all' to restore, then check the shipping row specifically."
    ],
    expectedBehaviour: "allIntegrationsPatch merges every per-integration patch into one object, so the write is atomic and the audit log records ONE action rather than four.",
    expectedUiState: "The dialog names the consequence including the in-flight payment warning. After confirming, all four rows show their off state - payments Off, email Off, support Off, shipping 'Sellers self-ship'. /admin/audit-log gains exactly ONE new entry, not four. Four entries means the page is writing per row and the four switches could end up half applied.",
    endResult: "After 'Enable all', payments / email / support read On and shipping reads 'We book couriers'. Leave the site in the state it started in - re-check /admin/site Payment if the gateway choice matters, since enabling payments re-enables Razorpay only by design."
  }
};
export {
  authored
};
