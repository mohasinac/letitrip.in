const fs = require("fs");
const path = require("path");

const messages = JSON.parse(fs.readFileSync("messages/en.json", "utf8"));

function resolveKey(obj, keyPath) {
  const parts = keyPath.split(".");
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[part];
  }
  return current;
}

function getFiles(dir, exts) {
  let results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (
          ["node_modules", ".next", "__mocks__", "__tests__"].includes(
            entry.name,
          )
        )
          continue;
        results = results.concat(getFiles(fullPath, exts));
      } else if (exts.some((e) => entry.name.endsWith(e))) {
        results.push(fullPath);
      }
    }
  } catch (e) {}
  return results;
}

const files = getFiles("src", [".tsx", ".ts"]);
const missing = [];
const seen = new Set();

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const relFile = path.relative("src", file).replace(/\\/g, "/");

  // Find all translation hook/function calls with their variable names
  const hookRegex =
    /(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  const bindings = [];
  let hm;
  while ((hm = hookRegex.exec(content)) !== null) {
    bindings.push({ varName: hm[1], ns: hm[2] });
  }

  if (bindings.length === 0) continue;

  for (const { varName, ns } of bindings) {
    const nsObj = resolveKey(messages, ns);
    if (nsObj === undefined) {
      const k = ns + ".__NAMESPACE__:" + relFile;
      if (!seen.has(k)) {
        seen.add(k);
        missing.push({ file: relFile, ns, key: "(entire namespace missing)" });
      }
      continue;
    }

    // Build regex for this specific variable name
    const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const tRegex = new RegExp(
      escaped +
        "(?:\\.rich|\\.raw|\\.markup|\\.has)?\\s*\\(\\s*['\"]([^'\"]+)['\"]",
      "g",
    );
    let tm;
    while ((tm = tRegex.exec(content)) !== null) {
      const key = tm[1];
      // Skip dynamic keys
      if (key.includes("{") || key.includes("$") || key.includes("`")) continue;
      const resolved = resolveKey(nsObj, key);
      if (resolved === undefined) {
        const k = ns + "." + key + ":" + relFile;
        if (!seen.has(k)) {
          seen.add(k);
          missing.push({ file: relFile, ns, key });
        }
      }
    }
  }
}

if (missing.length === 0) {
  console.log("No missing keys found.");
} else {
  // Group by namespace
  const grouped = {};
  for (const m of missing) {
    if (!grouped[m.ns]) grouped[m.ns] = [];
    grouped[m.ns].push(m);
  }
  for (const ns of Object.keys(grouped).sort()) {
    console.log(`\n[${ns}]`);
    for (const m of grouped[ns]) {
      console.log(`  ${m.key}  ->  src/${m.file}`);
    }
  }
  console.log("\nTotal missing:", missing.length);
}
