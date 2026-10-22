const SIGN_IN_SELLER = "Sign in as tyson@beybladearena.in / TempPass123!.";
const authored = {
  "checklist-selling-quick-add-minimum-details-quick-form-is-the-default": {
    roles: ["seller"],
    startPage: "/store/products/new",
    steps: [
      SIGN_IN_SELLER,
      "Open /store/products/new without clicking anything else.",
      "Read the heading and count the input fields on screen.",
      "List the field labels in order.",
      "Read whether a control offering the full form is present, and read its label.",
      "Open /store/art/new and count its fields for comparison."
    ],
    expectedBehaviour: "Creating an ordinary product opens the SHORT form, because most listings need six fields and the sectioned form asks for thirty. The full form stays one click away rather than being the default. Non-standard types (art, auctions) open the sectioned form directly, since they carry type-specific fields the short form has no room for.",
    expectedUiState: "Six fields: Product Name, Category, Price, Product Image, Description, Stock Quantity \u2014 and a control reading 'Show all fields (advanced)'. /store/art/new shows the sectioned form instead.",
    expectedData: { quickFormFields: 6 },
    endResult: "Read-only; leave without saving."
  },
  "checklist-selling-quick-add-minimum-details-publish-with-the-minimum": {
    roles: ["seller"],
    startPage: "/store/products/new",
    steps: [
      SIGN_IN_SELLER,
      "Open /store/products/new.",
      "Enter Product Name 'Minimum Details Probe'.",
      "Pick Category 'Beyblade Burst'.",
      "Enter Price 499.",
      "Upload public/test-media/sample-image.png as the Product Image.",
      "Enter Description 'A short-form listing created with only the required fields present.'",
      "Click Publish and read what happens.",
      "Open the product's public page at /products/{its slug} and read the title, price and image."
    ],
    inputs: {
      title: "Minimum Details Probe",
      category: "Beyblade Burst",
      price: 499,
      image: "public/test-media/sample-image.png",
      description: "A short-form listing created with only the required fields present."
    },
    expectedBehaviour: "The short form can produce a real, published, buyable listing on its own. If it cannot, it is a decoy: the seller fills it, is refused, and has to learn the long form anyway \u2014 having already done the work twice.",
    expectedUiState: "Publish succeeds with no inline errors and no error toast. The public page renders the title, \u20B9499 and the uploaded image.",
    expectedData: { published: true },
    endResult: "The listing survives a reload of the public page and appears in /store/products. Delete it afterwards."
  },
  "checklist-selling-quick-add-minimum-details-advanced-flip-keeps-values": {
    roles: ["seller"],
    startPage: "/store/products/new",
    steps: [
      SIGN_IN_SELLER,
      "Open /store/products/new.",
      "Enter Product Name 'Flip Probe', Price 750, and Description 'Checking that switching to the full form keeps what was already typed.'",
      "Pick Category 'Beyblade Burst'.",
      "Click 'Show all fields (advanced)'.",
      "Read the Title, Price, Description and Category fields in the sectioned form.",
      "Read whether any value is blank that was filled a moment ago."
    ],
    inputs: { title: "Flip Probe", price: 750, category: "Beyblade Burst" },
    expectedBehaviour: "The flip changes the presentation, not the draft. Losing typed values on the way to the full form punishes the seller for outgrowing the short one, and teaches them to start with the long form every time \u2014 which defeats the point of having a short one.",
    expectedUiState: "Title reads 'Flip Probe', Price 750, Category 'Beyblade Burst' and the description is intact in the sectioned form's Basic and Pricing sections.",
    expectedData: { valuesPreserved: 4 },
    endResult: "Leave without saving."
  },
  "checklist-selling-quick-add-minimum-details-condition-options-are-all-saveable": {
    roles: ["seller"],
    startPage: "/store/products/new",
    steps: [
      SIGN_IN_SELLER,
      "Open /store/products/new and click 'Show all fields (advanced)'.",
      "Open the Basic section and read every option in the Condition dropdown, writing them all down.",
      "Fill Product Name 'Condition Probe', Description 'Checking that every condition the form offers can actually be saved.', Category 'Beyblade Burst', Price 499 and a Product Image. The six labels are exactly: Product Name, Category, Price (\u20B9), Stock Quantity, Description, Product Image \u2014 there is no field labelled Title or Main Image.",
      "Select Condition 'Like New' and click Publish.",
      "Read the result \u2014 inline error, toast, or success.",
      "Repeat with 'Good', then with 'Fair', then with 'New', reading the result each time."
    ],
    inputs: { title: "Condition Probe", price: 499, conditions: "Like New, Good, Fair, New" },
    expectedBehaviour: "Every option the dropdown offers can be saved. A select that lists a value the server rejects is a trap with no way out \u2014 the seller picks the option that describes their item honestly and is refused, with nothing on screen saying which options are real.",
    expectedUiState: "Publishing succeeds for EVERY option in the list, including Like New, Good and Fair. Any option that produces a validation failure is the finding \u2014 record which ones and quote the message.",
    expectedData: { saveableConditions: "all options listed in the dropdown" },
    endResult: "Each successful publish is visible on the public page with the chosen condition. Delete the listings afterwards."
  },
  "checklist-selling-quick-add-minimum-details-description-requirement-is-honest": {
    roles: ["seller"],
    startPage: "/store/products/new",
    steps: [
      SIGN_IN_SELLER,
      "Open /store/products/new.",
      "Read the Description field's label and note exactly whether it says required or optional.",
      "Fill Product Name 'Short Description Probe', Category 'Beyblade Burst', Price 499 and a Product Image.",
      "Type exactly 'Nice bey' in Description \u2014 eight characters.",
      "Click Publish and read what happens, and WHERE it appears.",
      "If it was refused, read whether the message appeared on the Description field itself or somewhere else."
    ],
    inputs: { title: "Short Description Probe", description: "Nice bey", price: 499 },
    expectedBehaviour: "The form tells the truth about what it requires, and it tells it at the field. Either the description really is optional and a short one publishes, or it is required and the label says so with the minimum length stated. What must not happen is a field marked optional being refused by the server after the seller commits \u2014 that is the form making a promise the save does not keep.",
    expectedUiState: "Label and behaviour agree. If a minimum length applies, the label states it and a short entry is caught inline on the Description field BEFORE publishing. A toast appearing after Publish, with the field itself showing no error, is the failure.",
    expectedData: { errorShownInline: true },
    endResult: "Either the listing publishes, or nothing is created and the form still holds what was typed. Delete anything created."
  }
};
export {
  authored
};
