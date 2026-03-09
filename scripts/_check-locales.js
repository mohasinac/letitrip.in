const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "messages");

function flatKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? prefix + "." + k : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flatKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

const en = JSON.parse(fs.readFileSync(path.join(dir, "en.json"), "utf8"));
const enKeys = new Set(flatKeys(en));

const locales = ["in", "mh", "ts", "tn"];
let anyIssue = false;
for (const loc of locales) {
  const data = JSON.parse(
    fs.readFileSync(path.join(dir, loc + ".json"), "utf8"),
  );
  const locKeys = new Set(flatKeys(data));
  const missing = [...enKeys].filter((k) => !locKeys.has(k));
  const extra = [...locKeys].filter((k) => !enKeys.has(k));
  if (missing.length || extra.length) {
    anyIssue = true;
    if (missing.length)
      console.log(
        "MISSING in " +
          loc +
          " (" +
          missing.length +
          "):\n  " +
          missing.join("\n  "),
      );
    if (extra.length)
      console.log(
        "EXTRA in " + loc + " (" + extra.length + "):\n  " + extra.join("\n  "),
      );
  } else {
    console.log(loc + ": OK (all " + enKeys.size + " keys present)");
  }
}
if (!anyIssue) console.log("All locales in sync with en.json.");
