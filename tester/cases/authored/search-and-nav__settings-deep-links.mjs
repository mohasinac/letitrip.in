const authored = {
  "checklist-search-and-nav-settings-deep-links-tab-query-param-opens-that-tab": {
    roles: ["admin"],
    startPage: "/admin/site",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/site?tab=fees directly in the address bar.",
      "Read which tab is selected, waiting for hydration before judging \u2014 the first paint is always Branding.",
      "Open /admin/site?tab=themes directly.",
      "Read which tab is selected.",
      "Open /admin/site with no query parameter.",
      "Read which tab is selected."
    ],
    inputs: { tab1: "fees", tab2: "themes" },
    expectedBehaviour: "The open tab is read from the URL, so a deep link \u2014 from search, from a guide, from a colleague's message \u2014 lands where it says it will. A page that hard-codes its default ignores the URL entirely and every such link arrives on tab one.",
    expectedUiState: "?tab=fees opens the Fees tab with its fields on screen. ?tab=themes opens Themes. With no parameter the page opens on Branding. Two different parameters producing the same tab means the URL is not being read \u2014 but a MOMENT of Branding before the requested tab is hydration, not a failure: the server-rendered default is always Branding because the initialiser cannot read the URL without a window.",
    expectedData: { defaultTab: "branding", validTabCount: 20 },
    endResult: "Read-only; do not save anything. Nothing persists from opening a tab."
  },
  "checklist-search-and-nav-settings-deep-links-unknown-tab-falls-back-quietly": {
    roles: ["admin"],
    startPage: "/admin/site",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/site?tab=nonsense directly in the address bar.",
      "Read which tab is selected and look for any error.",
      "Open /admin/site?tab= with an empty value.",
      "Read which tab is selected."
    ],
    inputs: { unknownTab: "nonsense" },
    expectedBehaviour: "An unrecognised tab value falls back to the default without complaint, because the id is validated against the 20-value union rather than trusted. The realistic cause is a stale bookmark from a tab that has since been renamed, and that is not an error condition \u2014 it is a page whose shape changed.",
    expectedUiState: "Both URLs open Branding. No error banner, no toast, no empty tab strip and no blank panel. A rejected value must not look like a broken page. Worth trying one more: ?tab=Fees with a capital F, since the guard is an exact match against the union and so should also fall back rather than open Fees.",
    expectedData: { fallbackTab: "branding" },
    endResult: "Read-only; nothing persists."
  }
};
export {
  authored
};
