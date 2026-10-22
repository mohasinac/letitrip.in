const authored = {
  "checklist-addresses-state-picker-state-is-a-picker-for-india": {
    roles: ["buyer"],
    startPage: "/user/addresses/new",
    steps: [
      "Sign in as rehan.sheikh@gmail.com / TempPass123!.",
      "Open /user/addresses/new.",
      "Select India as the country.",
      "Click the 'State / region' field and try to type free text into it.",
      "Type karn in the picker's search box and read the options offered.",
      "Select Karnataka.",
      "Change the country to United Arab Emirates.",
      "Click 'State / region' again and try to type free text."
    ],
    inputs: { country: "India", stateSearch: "karn", state: "Karnataka" },
    expectedBehaviour: "Where a country's regions are enumerated, State is a searchable picker; where they are not, it is a plain text box. The picker is what stops one column holding 'Karnataka', 'karnataka' and 'KA' depending on which screen created the row \u2014 which is what happened while this form and the seller drawer wrote free text into the same field the admin editor filled from a 36-option list.",
    expectedUiState: "With India selected, 'State / region' cannot be typed into freely and searching 'karn' narrows a list of India's 36 states and union territories to Karnataka. With United Arab Emirates selected the same label becomes an ordinary text input that accepts anything, because the UAE has no subdivisions in the registry.",
    expectedData: { indiaStateOptionCount: 36 },
    endResult: "Nothing persists unless the form is submitted. A picker offering 28 or 29 options is missing the union territories."
  },
  "checklist-addresses-state-picker-changing-country-clears-state": {
    roles: ["buyer"],
    startPage: "/user/addresses/new",
    steps: [
      "Sign in as rehan.sheikh@gmail.com / TempPass123!.",
      "Open /user/addresses/new.",
      "Select India as the country.",
      "Select Karnataka in the 'State / region' picker.",
      "Change the country to Canada.",
      "Read the 'State / region' field, and count the options it now offers.",
      "Change the country back to India and read it again."
    ],
    inputs: {
      firstCountry: "India",
      state: "Karnataka",
      secondCountry: "Canada",
      canadaOptionCount: 13
    },
    expectedBehaviour: "Changing the country clears the state, because a state only means something inside the country it belongs to. An address carrying Karnataka under Canada is a row nothing can group, rate for shipping, or tax correctly.",
    expectedUiState: "After switching to Canada 'State / region' is empty and offers 13 Canadian options, its 10 provinces and 3 territories \u2014 an emptied field still listing India's 36 would mean the clear ran and the option source did not. Switching back to India leaves it empty too: the clear fires on every country change and does not restore 'Karnataka', which would reintroduce the mismatch it exists to prevent.",
    expectedData: { stateAfterCountryChange: "", canadaOptionCount: 13 },
    endResult: "Nothing persists unless the form is submitted. A retained 'Karnataka' under Canada is the failure."
  }
};
export {
  authored
};
