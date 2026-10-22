const authored = {
  "checklist-addresses-address-filters-filters-actually-filter": {
    roles: ["buyer"],
    startPage: "/user/addresses",
    steps: [
      "Sign in as rehan.sheikh@gmail.com / TempPass123!.",
      "Open /user/addresses. No address is seeded for this buyer, so create two \u2014 one labelled 'Home' at '7 Test Lane', Indore, Madhya Pradesh, 452010, and one labelled 'Office' at '8 Test Lane', Bengaluru, Karnataka, 560001.",
      "Back on /user/addresses, read the controls above the list: a Search input and a Label select. There is no filter drawer and no filter badge.",
      "Type Indore in Search and read which addresses remain.",
      "Clear Search, type zzzznope, and read the count.",
      "Clear Search. Choose Office in the Label select and read which addresses remain.",
      "Set the Label select back to 'All labels' and confirm both return.",
      "Finally type Office into Search, with the Label select on All labels, and read the result."
    ],
    inputs: {
      firstLabel: "Home",
      secondLabel: "Office",
      searchHit: "Indore",
      searchMiss: "zzzznope"
    },
    expectedBehaviour: "Both controls narrow the list they sit above, and both are in-memory over the already-fetched addresses rather than a refetch. Search matches the name, street, city, state and postal code; the Label select matches the label, which Search deliberately does not cover. A control that changes nothing is the failure this case exists for.",
    expectedUiState: "Searching Indore leaves the Indore address and hides the Bengaluru one. 'zzzznope' leaves NONE \u2014 that is the control that separates filtering from returning everything. Choosing Office in the Label select leaves only the Office address, and 'All labels' restores both.\n\n\u{1F6D1} Typing Office into SEARCH returns nothing, and that is CORRECT: search covers name, street, city, state and postal code, not the label. Do not record it as broken search. The Label select does not appear at all until at least one address has a label.",
    expectedData: { searchMissCount: 0, labelFilteredCount: 1 },
    endResult: "Both controls are cleared. Delete the two addresses afterwards \u2014 the addresses collection is PRESERVE tier and is never wiped between runs, so anything left here accumulates forever."
  }
};
export {
  authored
};
