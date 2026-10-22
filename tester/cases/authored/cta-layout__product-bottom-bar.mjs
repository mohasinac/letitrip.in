const authored = {
  "checklist-cta-layout-product-bottom-bar-three-actions-wrap-to-second-row": {
    roles: ["buyer"],
    startPage: "/products/product-beyblade-original-dranzer-s",
    steps: [
      "Resize the browser window to 375 pixels wide.",
      "Sign in as rehan.sheikh@gmail.com / TempPass123!.",
      "Open /products/product-beyblade-original-dranzer-s.",
      "Read the bottom action bar and note which buttons share a row.",
      "Compare the widths of the two buttons on the upper row.",
      "Read the price shown on the bar \u2014 signed in it should read the formatted price, 1,499 for this product.",
      "Click 'Add to Cart' and watch the bar while the label changes.",
      "Count the rows in the bar during and after the change."
    ],
    inputs: {
      viewportWidth: 375,
      productId: "product-beyblade-original-dranzer-s",
      price: 1499,
      expectedRows: 2
    },
    expectedBehaviour: "Three actions of different weight are laid out as two secondaries sharing a row above one full-width primary. The secondaries share that row proportionally rather than one being pinned to its content width, which is what made the row read lopsided before.",
    expectedUiState: "'Wishlist' and 'Add to Cart' occupy the upper row and neither is squeezed to a fraction of the other. 'Buy Now' spans the full width beneath them. The bar shows the price, which for a signed-in buyer reads the formatted amount and never 'Sign in to see price'. While the label reads 'Adding\u2026' the bar still has exactly two rows \u2014 a bar that reflows to three rows and back makes the whole page jump under the buyer's thumb mid-tap.",
    expectedData: { barRowCount: 2, priceOnBar: 1499 },
    endResult: "The item is in the cart. Restore the window width and empty the cart afterwards so later cases start clean."
  }
};
export {
  authored
};
