const authored = {
  "checklist-search-and-nav-sidebar-search-sidebar-search-matches-description": {
    roles: ["admin"],
    startPage: "/admin",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin and read the sidebar's group headings in order.",
      "Type fraud in the sidebar search box.",
      "Read which entries remain, count them, and note which group heading each sits under.",
      "Clear the box and type zzzznope.",
      "Read the sidebar.",
      "Clear the box and read the group order again."
    ],
    inputs: {
      query: "fraud",
      nonsenseQuery: "zzzznope",
      expectedMatches: 5,
      expectedGroups: 2
    },
    expectedBehaviour: "The filter matches a screen's description and keywords, not only its label. Matching on the label alone means only a screen with 'fraud' in its name survives the query \u2014 and none is named that.",
    expectedUiState: "'fraud' leaves FIVE entries across TWO groups: Banned Addresses, Address Clusters, Payment Clusters and Scam Registry under Trust & Safety, and Trust & Safety Guide under Guides. The guide is a legitimate hit \u2014 it matches on description and keywords, which is the behaviour under test, not over-matching. Payment Methods must NOT appear; only Payment Clusters carries the keyword, and the two sit next to each other. Groups keep their normal order and only their contents narrow. 'zzzznope' empties the sidebar rather than leaving it unfiltered. Clearing the box restores every group in the original order.",
    expectedData: { nonsenseVisibleCount: 0, fraudMatchCount: 5, fraudGroupCount: 2 },
    endResult: "Nothing persists; the filter is local to the sidebar and resets on reload."
  }
};
export {
  authored
};
