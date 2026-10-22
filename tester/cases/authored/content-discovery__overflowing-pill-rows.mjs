const CATEGORY = "/categories/category-original-attack-rings";
const SMALL_CATEGORY = "/categories/category-spinning-tops";
const authored = {
  "checklist-content-discovery-overflowing-pill-rows-wide-row-stays-pills": {
    roles: ["guest"],
    startPage: SMALL_CATEGORY,
    steps: [
      "Set the browser window to 1440x900.",
      `Open ${SMALL_CATEGORY}.`,
      "Find the 'Subcategories' label and look at the row directly beneath it.",
      "Count the pills and check whether any is cut off at the right edge."
    ],
    expectedBehaviour: "The row is measured against its container, not counted. When the pills fit, they stay pills \u2014 collapsing a row that had room would hide items behind an extra click for no reason.",
    expectedUiState: "A horizontal row of rounded pills under 'Subcategories', each reading a name and a number. Every pill is fully visible: none is clipped by the right edge and there is no horizontal scrollbar. There is NO single dropdown trigger.",
    endResult: "Nothing persists; this is a read-only page. Reloading at the same width shows the same pill row."
  },
  "checklist-content-discovery-overflowing-pill-rows-narrow-row-collapses": {
    roles: ["guest"],
    startPage: SMALL_CATEGORY,
    steps: [
      "Set the browser window to 390x844 (a phone width).",
      `Open ${SMALL_CATEGORY}.`,
      "Find the 'Subcategories' label and look at the control directly beneath it.",
      "\u{1F6D1} This is the SAME page as the previous case at a different width \u2014 that is the point. If it renders a dropdown here and pills there, the control is tracking width."
    ],
    expectedBehaviour: "BEFORE: the pills simply ran past the right edge. There was no scrollbar, no arrow and no indication the row continued, so the subcategories beyond the fold were unreachable \u2014 the page looked complete while hiding items. AFTER: the row measures wider than the container and collapses to one trigger.",
    expectedUiState: "A single bordered control reading 'Browse subcategories' followed by the total count and a chevron. The pill row is NOT present. Nothing is clipped at the right edge.",
    endResult: "Nothing persists. Reloading at 390px wide shows the collapsed trigger again."
  },
  "checklist-content-discovery-overflowing-pill-rows-collapsed-dropdown-is-searchable": {
    roles: ["guest"],
    startPage: CATEGORY,
    steps: [
      "Set the browser window to 390x844.",
      `Open ${CATEGORY}.`,
      "Click the 'Browse subcategories' trigger.",
      "Read the full list of rows offered.",
      "Type drag into the search box.",
      "Read the list again.",
      "Clear the search box."
    ],
    inputs: { search: "drag" },
    expectedBehaviour: "BEFORE: the collapsed control was a native <select>, which cannot be typed at \u2014 a 12-row picker had to be scrolled. AFTER: the dropdown opens with a focused search box that filters the list on every keystroke, case-insensitively, matching anywhere in the name rather than only the start.",
    expectedUiState: "A panel containing a search field and a scrollable list. With 'drag' typed, only rows whose name contains 'drag' remain (e.g. 'Dragoon F', 'Dragoon Storm') and non-matching rows such as 'Draciel F' are gone. Clearing the box restores the full list.",
    endResult: "Nothing persists. Closing and reopening the dropdown shows an empty search box and the full list."
  },
  "checklist-content-discovery-overflowing-pill-rows-collapsed-dropdown-keyboard": {
    roles: ["guest"],
    startPage: CATEGORY,
    steps: [
      "Set the browser window to 390x844.",
      `Open ${CATEGORY}.`,
      "Click the 'Browse subcategories' trigger.",
      "Press ArrowDown three times without touching the mouse.",
      "Note which row is highlighted.",
      "Press Enter."
    ],
    expectedBehaviour: "The search box keeps focus and the arrow keys move a highlight through the filtered list, wrapping at the ends. Enter opens the highlighted subcategory. Escape closes the panel and returns focus to the trigger. The highlight is the same one the mouse sets, so there are never two cursors in the list.",
    expectedUiState: "After three ArrowDowns the third row is visibly highlighted and no other row is. After Enter the browser is on that subcategory's own page, whose heading matches the row that was highlighted.",
    endResult: "The navigation is real: the URL is the chosen subcategory's and reloading stays there."
  },
  "checklist-content-discovery-overflowing-pill-rows-every-item-reachable-when-collapsed": {
    roles: ["guest"],
    startPage: SMALL_CATEGORY,
    steps: [
      "Set the browser window to 1440x900.",
      `Open ${SMALL_CATEGORY}.`,
      "Write down the name of the LAST pill visible in the Subcategories row.",
      "Resize the window to 390x844.",
      "Click 'Browse subcategories' and scroll the list to the bottom.",
      "Compare the list against the names seen at the wide width."
    ],
    expectedBehaviour: "BEFORE: items past the right edge existed in the DOM but had no affordance \u2014 no scrollbar, no arrow \u2014 so they could not be reached at all at a narrow width. AFTER: the collapsed list contains EVERY direct child, including the ones that used to be cut off.",
    expectedUiState: "The dropdown list is scrollable and its row count equals the number shown on the trigger. Every pill name seen at 1440px appears as a row, and so do the ones that were clipped.",
    endResult: "Nothing persists. The list contents are the same on every open."
  },
  "checklist-content-discovery-overflowing-pill-rows-pills-carry-a-leading-image": {
    roles: ["guest"],
    startPage: SMALL_CATEGORY,
    steps: [
      "Set the browser window to 1440x900.",
      `Open ${SMALL_CATEGORY}.`,
      "Look at the left-hand side of each pill in the Subcategories row.",
      "Resize to 390x844 and open 'Browse subcategories'.",
      "Look at the left-hand side of each row in the list."
    ],
    expectedBehaviour: "A subcategory's cover image is shown as a small leading thumbnail so the row can be scanned by sight rather than by reading every label. The SAME visual appears in both states \u2014 a pill and its dropdown row are the same item and must not look like different things.",
    expectedUiState: "Each pill shows a small square image immediately left of its name, at roughly text height, without making the pill taller than it was. The dropdown rows show the same images. No image is stretched or letterboxed.",
    endResult: "Nothing persists. The same images appear on reload."
  },
  "checklist-content-discovery-overflowing-pill-rows-missing-image-falls-back-to-initial": {
    roles: ["guest"],
    startPage: "/categories/category-spinning-tops",
    steps: [
      "Set the browser window to 1440x900.",
      "Open /categories/category-spinning-tops.",
      "Look at the Subcategories row for any entry whose category has no cover image.",
      "Check what is drawn where the thumbnail would be."
    ],
    expectedBehaviour: "Roughly 650 of the intermediate branch categories have neither an icon nor a cover image, so the fallback is the common case rather than an edge case. It must be a drawn initial, never an empty reserved box and never a broken-image glyph \u2014 a blank square reads as a failed load and invites a bug report against working code.",
    expectedUiState: "A pill with no cover shows a small circle containing the first letter of its name. There is no broken-image icon anywhere in the row, and the pills all sit on the same baseline with equal height whether or not they have an image.",
    endResult: "Nothing persists."
  },
  "checklist-content-discovery-overflowing-pill-rows-widening-restores-the-pills": {
    roles: ["guest"],
    startPage: CATEGORY,
    steps: [
      "Set the browser window to 390x844.",
      `Open ${SMALL_CATEGORY} and confirm the Subcategories control is a single dropdown trigger.`,
      "Without reloading, resize the window back to 1440x900.",
      "Look at the Subcategories area again.",
      "Resize back down to 390 and up to 1440 twice more, watching for flicker."
    ],
    expectedBehaviour: "\u{1F6D1} This is the case most likely to fail. Collapsing REMOVES the row, so there is nothing left to measure and a naive implementation can never expand again \u2014 a one-way door that looks correct until someone widens the window. The row's natural width is cached while it is still rendered, and expanding requires a clear margin above that width rather than an exact fit, so the two states cannot oscillate at the boundary.",
    expectedUiState: "At 1440px the pill row is back and the dropdown trigger is gone. During the resize the control does not flicker, alternate, or rapidly toggle between the two states at any intermediate width.",
    endResult: "Nothing persists. The state always matches the current width, not the width the page loaded at."
  },
  "checklist-content-discovery-overflowing-pill-rows-subcategory-click-is-client-side": {
    roles: ["guest"],
    startPage: SMALL_CATEGORY,
    steps: [
      "Set the browser window to 1440x900.",
      `Open ${SMALL_CATEGORY}.`,
      "Open the browser devtools Network tab and clear it.",
      "Click any subcategory pill.",
      "Look at whether the page performed a full document navigation."
    ],
    expectedBehaviour: "Subcategory pills are client-side links, not plain anchors. A plain <a> would make every click re-download the whole document \u2014 a silent performance regression that looks identical to working navigation apart from the flash.",
    expectedUiState: "The destination category page renders. The page does not white-flash, and the Network tab shows an RSC payload fetch rather than a full document request for the destination HTML.",
    endResult: "The URL is the clicked subcategory's; going Back returns to the previous category with its row intact."
  },
  "checklist-content-discovery-overflowing-pill-rows-tabs-collapse-by-width-not-count": {
    roles: ["guest"],
    startPage: SMALL_CATEGORY,
    steps: [
      "Set the browser window to 1440x900.",
      `Open ${SMALL_CATEGORY} and scroll to the Products / Auctions / Pre-Orders tab bar.`,
      "Count the tabs and check whether they render as a row or a dropdown.",
      "Resize to 390x844 and look at the same tab bar."
    ],
    expectedBehaviour: "BEFORE: the tab bar collapsed whenever it had more than five tabs, regardless of width \u2014 so six short tabs became a dropdown on a 1440px desktop with room to spare, while four long ones stayed a row on a phone and overflowed. AFTER: the decision is the measured width of the rendered row against its container, so the same bar can be a row on desktop and a dropdown on a phone.",
    expectedUiState: "At 1440px the tabs render as a horizontal row with the underline rail on the active one, even when there are six or more. At 390px the same bar is a single dropdown trigger. The resting appearance of the expanded row is unchanged from before \u2014 still an underline rail, not pills.",
    endResult: "Nothing persists. The tab bar's form follows the current width on every render."
  },
  "checklist-content-discovery-overflowing-pill-rows-event-tabs-do-not-jump-to-top": {
    roles: ["guest"],
    startPage: "/events",
    steps: [
      "Set the browser window to 1440x900.",
      "Open /events and click into any event with an Overview / Participate / Leaderboard tab bar.",
      "Scroll down until the tab bar is near the top of the viewport.",
      "Click a different tab.",
      "Note the scroll position immediately after the panel swaps."
    ],
    expectedBehaviour: "The app mounts a global ScrollToTop keyed on pathname, so a tab that navigates must opt out explicitly or every switch yanks the page to the top. The tab bar passes that opt-out through to its links.",
    expectedUiState: "After clicking, the newly selected tab is active and its panel is shown, while the page stays at roughly the scroll position it was at \u2014 the tab bar does not leap back down the screen.",
    endResult: "The URL is the new tab's; reloading lands on that tab."
  }
};
export {
  authored
};
