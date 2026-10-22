const authored = {
  "checklist-community-support-public-profile-view-seller-store": {
    roles: ["guest"],
    startPage: "/stores",
    steps: [
      "Open /stores in a private window with no session.",
      "Click the 'Beyblade Arena' card.",
      "Read the store header \u2014 name, logo, banner, verified badge and rating.",
      "Read the tab bar and open each tab in turn.",
      "Open the browser's View Source and search the HTML for the words accessToken, adminNotes, suspensionReason and customCommissionRate."
    ],
    inputs: { storeId: "store-beyblade-arena" },
    expectedBehaviour: "The public store page is built from a projection that names every field it emits, rather than by spreading the store document and deleting a few keys. A deny-list is blind to fields nobody thought to delete \u2014 and to fields the TypeScript interface never declared at all.",
    expectedUiState: "The header shows 'Beyblade Arena' with its logo and banner. The tabs render their listings. None of accessToken, adminNotes, suspensionReason or customCommissionRate appears anywhere in the page source, including inside the React data payload embedded at the bottom of the HTML.",
    expectedData: { secretFieldsInHtml: 0 },
    endResult: "Nothing persists \u2014 read-only. A hit on any of those four words is a data leak and fails the case outright, regardless of how the page looks."
  },
  "checklist-community-support-public-profile-view-public-profile": {
    roles: ["guest"],
    startPage: "/profile/user-tyson-blader",
    steps: [
      "Open /profile/user-tyson-blader in a private window with no session.",
      "Read the display name, avatar and bio. The name is 'Mock User 6' \u2014 every seeded persona is literally Mock User N, so that is the fixture rather than a placeholder bug, and the bio is real prose.",
      "Open each tab on the profile.",
      "Search the page source for an email address and for a phone number.",
      "Open /profile/user-yugi-muto and read the same things \u2014 display name 'Mock User 3', its own bio.",
      "On BOTH profiles, check what is NOT shown. Each seeded publicProfile sets showEmail, showPhone, showOrders and showWishlist to FALSE, so none of those may appear anywhere on the page. Open View Source and search for the personas' email addresses (tyson@beybladearena.in, rehan.sheikh@gmail.com) and for the strings phoneNumber, orders and wishlist \u2014 a value hidden in the rendered page but present in the HTML is still published, which is the shape the store case on this page checks for."
    ],
    inputs: { sellerProfile: "user-tyson-blader", buyerProfile: "user-yugi-muto" },
    expectedBehaviour: "A public profile shows what its owner chose to publish and nothing drawn from their account record. Email and phone are PII-encrypted at rest and have no business on this page in any form, masked or otherwise.",
    expectedUiState: "Both profiles render a display name, avatar and bio, with their tabs populated. Neither page \u2014 nor its source \u2014 contains an email address or a phone number. A profile set to Private returns a not-found page for a signed-out visitor rather than rendering with fields blanked out.",
    endResult: "Nothing persists \u2014 read-only. Both profiles are public in the seed, so a not-found here means the visibility default changed."
  }
};
export {
  authored
};
