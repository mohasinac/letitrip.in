const authored = {
  "checklist-cta-layout-checkout-bottom-bar-back-not-squeezed": {
    roles: ["buyer"],
    startPage: "/checkout",
    steps: [
      "Resize the browser window to 320 pixels wide.",
      "Sign in as rehan.sheikh@gmail.com / TempPass123!.",
      "Open /products/product-beyblade-burst-valkyrie and click 'Add to Cart'.",
      "Open /checkout. Select a saved address if one is offered; if the list is empty, add one, since no address is seeded for this buyer.",
      "Continue to the Extras step \u2014 checkout is Address, then Extras and fees, then Payment.",
      "Read the two buttons in the bottom action bar and compare their widths."
    ],
    inputs: { viewportWidth: 320 },
    expectedBehaviour: "Each button is sized by its own label rather than by a fixed share of the row, so the shorter label takes less space and the longer one takes more. A fixed split gives a two-letter button the same width as an eight-word one.",
    expectedUiState: "'Back' reads in full \u2014 not clipped to 'Ba' inside a roughly 44px box. 'Continue to payment' also reads in full and is visibly the wider of the two. Neither shows an ellipsis or a cut-off word.",
    endResult: "Layout-only; nothing persists. Restore the window width afterwards so later cases are not run at 320px by accident."
  },
  "checklist-cta-layout-checkout-bottom-bar-no-truncation-anywhere": {
    roles: ["buyer"],
    startPage: "/checkout",
    steps: [
      "Resize the browser window to 320 pixels wide.",
      "Sign in as rehan.sheikh@gmail.com / TempPass123!.",
      "Open /products/product-beyblade-burst-valkyrie and click 'Add to Cart'.",
      "Open /checkout, supply an address if none is saved, and continue through Extras to the Payment step.",
      "Read the primary button's label in full and write down which of the four it is: 'Pay via UPI / Cash', 'Pay Online (PhonePe)', 'Cash on Delivery' or 'Pay in EMI'.",
      "Select each payment method the page offers in turn and read the primary label after each."
    ],
    inputs: {
      viewportWidth: 320,
      defaultPrimaryCta: "Pay via UPI / Cash"
    },
    expectedBehaviour: "A label too long for one line makes its button taller rather than truncating. Height is cheap in a bottom bar; a clipped verb is not, because the buyer cannot tell what the button will do.",
    expectedUiState: "Whichever CTA the enabled method produces is shown complete, wrapping onto two lines if it needs to. On a default site that is 'Pay via UPI / Cash' \u2014 the longest of the four, and therefore the one most likely to clip. An ellipsis anywhere in the bar is a failure, on any method. Do NOT record the absence of 'Pay Online (PhonePe)' as a defect: PhonePe is off by default and a separate admin case covers switching it on.",
    endResult: "Layout-only; nothing persists. Restore the window width afterwards."
  }
};
export {
  authored
};
