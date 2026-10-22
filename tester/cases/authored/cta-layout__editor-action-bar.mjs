const authored = {
  "checklist-cta-layout-editor-action-bar-four-buttons-wrap-not-overflow": {
    roles: ["seller"],
    startPage: "/store/products/new",
    steps: [
      "Resize the browser window to 375 pixels wide.",
      "Sign in as tyson@beybladearena.in / TempPass123!.",
      "Open /store/products/new and read its action row. This is the QUICK form: expect two buttons, Publish and Save Draft, and a ghost link reading 'Show all fields (advanced)'.",
      "Click 'Show all fields (advanced)' to reach the full editor.",
      "Type 'QA Product editor-action-bar' in the Product Name field.",
      "Read the action bar and write down every button in it, in order, with its exact label.",
      "Try to scroll the page sideways.",
      "Read the right edge of the bar for any button that is partly off screen, and the left edge for Discard \u2014 it is anchored there rather than sitting beside the other two."
    ],
    inputs: {
      viewportWidth: 375,
      title: "QA Product editor-action-bar",
      quickFormButtons: 2,
      fullFormButtons: 3
    },
    expectedBehaviour: "Actions that cannot fit one row wrap onto a second. They used to be non-shrinking children of a non-wrapping row, which does not overflow gracefully \u2014 it simply runs off the right edge, taking the last button with it. Discard is the row's anchor rather than a third sibling, because a flat justify-between row with three children opened the gap between Save draft and Publish instead of beside Discard.",
    expectedUiState: "Every button in the bar is fully visible, wrapping onto a second line as needed. Nothing is cut off at the right edge and the page does not scroll sideways at all. Expect THREE in the full editor \u2014 a Discard anchored left, a save and a publish \u2014 and do not count Preview: it is in the top bar, not this row, and only when a preview slot is supplied. Record the exact labels you read; they differ between the generic shell and this editor.",
    expectedData: { quickFormButtonCount: 2, fullFormButtonCount: 3, horizontalScroll: false },
    endResult: "Leave the editor without saving, so no draft product is created. Restore the window width afterwards."
  }
};
export {
  authored
};
