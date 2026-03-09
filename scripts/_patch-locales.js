const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "messages");

const additions = {
  "search.searching": "Searching...",
  "search.browseProducts": 'Search "{q}" in products \u2192',
  "adminSite.algoliaTitle": "Algolia Search Index",
  "adminSite.algoliaSubtitle":
    "Manually trigger a full re-index for products or navigation pages. The trigger runs automatically on product changes, but use these if records appear out of sync.",
  "adminUsers.title": "Users",
  "adminCarousel.overlayMode": "Central Overlay",
  "adminCarousel.overlayModeSubtitle":
    "Render text + button centred over the background. Disables grid cards.",
  "adminCarousel.overlayTitle": "Title",
  "adminCarousel.overlaySubtitle": "Subtitle / Label",
  "adminCarousel.overlayDescription": "Description",
  "adminCarousel.overlayButton": "Button",
  "adminCarousel.enableButton": "Enable button",
  "adminCarousel.buttonText": "Button Text",
  "adminCarousel.buttonLink": "Button Link",
  "adminCarousel.openInNewTab": "Open in new tab",
};

const localesMissing = {
  in: [
    "search.searching",
    "search.browseProducts",
    "adminSite.algoliaTitle",
    "adminSite.algoliaSubtitle",
    "adminUsers.title",
    "adminCarousel.overlayMode",
    "adminCarousel.overlayModeSubtitle",
    "adminCarousel.overlayTitle",
    "adminCarousel.overlaySubtitle",
    "adminCarousel.overlayDescription",
    "adminCarousel.overlayButton",
    "adminCarousel.enableButton",
    "adminCarousel.buttonText",
    "adminCarousel.buttonLink",
    "adminCarousel.openInNewTab",
  ],
  mh: [
    "search.searching",
    "search.browseProducts",
    "adminSite.algoliaTitle",
    "adminSite.algoliaSubtitle",
    "adminCarousel.overlayMode",
    "adminCarousel.overlayModeSubtitle",
    "adminCarousel.overlayTitle",
    "adminCarousel.overlaySubtitle",
    "adminCarousel.overlayDescription",
    "adminCarousel.overlayButton",
    "adminCarousel.enableButton",
    "adminCarousel.buttonText",
    "adminCarousel.buttonLink",
    "adminCarousel.openInNewTab",
  ],
  ts: [
    "search.searching",
    "search.browseProducts",
    "adminSite.algoliaTitle",
    "adminSite.algoliaSubtitle",
    "adminUsers.title",
    "adminCarousel.overlayMode",
    "adminCarousel.overlayModeSubtitle",
    "adminCarousel.overlayTitle",
    "adminCarousel.overlaySubtitle",
    "adminCarousel.overlayDescription",
    "adminCarousel.overlayButton",
    "adminCarousel.enableButton",
    "adminCarousel.buttonText",
    "adminCarousel.buttonLink",
    "adminCarousel.openInNewTab",
  ],
  tn: [
    "search.searching",
    "search.browseProducts",
    "adminSite.algoliaTitle",
    "adminSite.algoliaSubtitle",
    "adminCarousel.overlayMode",
    "adminCarousel.overlayModeSubtitle",
    "adminCarousel.overlayTitle",
    "adminCarousel.overlaySubtitle",
    "adminCarousel.overlayDescription",
    "adminCarousel.overlayButton",
    "adminCarousel.enableButton",
    "adminCarousel.buttonText",
    "adminCarousel.buttonLink",
    "adminCarousel.openInNewTab",
  ],
};

for (const [loc, keys] of Object.entries(localesMissing)) {
  const file = path.join(dir, loc + ".json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  for (const k of keys) {
    const [section, field] = k.split(".");
    if (!data[section]) data[section] = {};
    data[section][field] = additions[k];
  }

  // Remove stray 'categories.viewCategory' from in.json (not in en.json)
  if (loc === "in" && data.categories && "viewCategory" in data.categories) {
    delete data.categories.viewCategory;
  }

  const content = JSON.stringify(data, null, 2) + "\n";
  const buf = Buffer.from(content, "utf8");
  if (buf[0] === 0xef) {
    console.error("BOM detected! Aborting.");
    process.exit(1);
  }
  fs.writeFileSync(file, buf);
  console.log("Updated " + file);
}
console.log("Done.");
