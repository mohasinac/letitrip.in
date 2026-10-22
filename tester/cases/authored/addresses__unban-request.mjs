const authored = {
  "checklist-addresses-unban-request-empty-note-says-why": {
    roles: ["buyer"],
    startPage: "/user/addresses",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123! and open the Banned Addresses queue.",
      "Select the All chip and read how many rows are listed, then try the Banned, Unban Requested and Suspicious chips in turn.",
      "Record whether ANY route in the product lets an admin ban a single address on an otherwise-active account \u2014 if none does, this case cannot be set up, and that is the finding.",
      "If a banned address belonging to rehan.sheikh@gmail.com does exist, continue. Otherwise stop here and answer no, quoting what each chip returned.",
      "Sign in as rehan.sheikh@gmail.com / TempPass123! and open /user/addresses.",
      "Find the banned address and click 'Request Unban'.",
      "Leave 'Reason for unban request' completely empty and click 'Submit request'. The button must be clickable, not greyed out.",
      "Read where the message appears.",
      "Type 'Too short' and click 'Submit request' again.",
      "Type 'This address was banned in error; it is my registered home address.' and submit."
    ],
    inputs: {
      shortNote: "Too short",
      validNote: "This address was banned in error; it is my registered home address.",
      minimumLength: 20,
      trigger: "Request Unban",
      field: "Reason for unban request",
      submit: "Submit request"
    },
    expectedBehaviour: "Submitting with an empty or too-short note fails loudly ON THE FIELD and names the 20-character minimum. The note is the entire case a reviewer reads, so a request without one is not a request \u2014 but a greyed-out button with a bare return in its handler tells the user nothing about why, which is what this replaced.",
    expectedUiState: "The submit button is enabled even with the box empty. Pressing it puts an error on the note field naming the minimum length; the schema message reads 'Explain what happened \u2014 at least 20 characters. This is all the reviewer sees.' 'Too short' produces the same error. The full sentence is accepted and a confirmation appears.\n\n\u{1F6D1} If no banned address exists, answer NO for the precondition rather than null: there is no UI path to ban one, which is a product gap and not a missing test channel.",
    expectedData: { minimumNoteLength: 20, submitEnabledWhenEmpty: true },
    endResult: "If the request was submitted, the address reads as unban-requested and carries the full note. A silently disabled button that does nothing when pressed is the failure \u2014 the user cannot tell it from a broken page.",
    needsReview: true,
    reviewNote: "The assertions are verified correct against the drawer and its schema. What is unsettled is whether an admin should be able to ban a single address on an otherwise-active account at all; today they cannot, so this case has no reachable setup."
  }
};
export {
  authored
};
