/**
 * Codemod: strip ERROR_MESSAGES/SUCCESS_MESSAGES/INFO_MESSAGES/CONFIRMATION_MESSAGES
 * from @/constants imports and add direct @mohasinac/appkit/* imports.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const APPKIT_ERRORS_SYMBOLS = new Set(["ERROR_MESSAGES"]);
const APPKIT_VALUES_SYMBOLS = new Set([
  "SUCCESS_MESSAGES",
  "INFO_MESSAGES",
  "CONFIRMATION_MESSAGES",
]);
const APPKIT_CORE_SYMBOLS = new Set(["SITE_CONFIG", "FEATURE_FLAGS"]);

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...walk(full));
    else if ([".ts", ".tsx"].includes(extname(entry))) results.push(full);
  }
  return results;
}

const files = walk("src");
let changed = 0;

for (const filePath of files) {
  const original = readFileSync(filePath, "utf8");
  let content = original;

  // Match all import { ... } from "@/constants" statements (possibly multiline)
  const importRe =
    /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+"@\/constants";/g;

  let match;
  const matches = [];
  while ((match = importRe.exec(original)) !== null) {
    matches.push({ fullImport: match[0], symbolsStr: match[1] });
  }
  importRe.lastIndex = 0;

  for (const { fullImport, symbolsStr } of matches) {
    const symbols = symbolsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const errorsSymbols = symbols.filter((s) => APPKIT_ERRORS_SYMBOLS.has(s));
    const valuesSymbols = symbols.filter((s) => APPKIT_VALUES_SYMBOLS.has(s));
    const coreSymbols = symbols.filter((s) => APPKIT_CORE_SYMBOLS.has(s));
    const localSymbols = symbols.filter(
      (s) => !APPKIT_ERRORS_SYMBOLS.has(s) && !APPKIT_VALUES_SYMBOLS.has(s) && !APPKIT_CORE_SYMBOLS.has(s),
    );

    if (errorsSymbols.length === 0 && valuesSymbols.length === 0 && coreSymbols.length === 0) continue;

    // Build replacement
    const newLines = [];

    if (localSymbols.length > 0) {
      newLines.push(
        `import { ${localSymbols.join(", ")} } from "@/constants";`,
      );
    }
    if (errorsSymbols.length > 0) {
      newLines.push(
        `import { ${errorsSymbols.join(", ")} } from "@mohasinac/appkit/errors";`,
      );
    }
    if (valuesSymbols.length > 0) {
      newLines.push(
        `import { ${valuesSymbols.join(", ")} } from "@mohasinac/appkit/values";`,
      );
    }
    if (coreSymbols.length > 0) {
      newLines.push(
        `import { ${coreSymbols.join(", ")} } from "@mohasinac/appkit/core";`,
      );
    }

    content = content.replace(fullImport, newLines.join("\n"));
  }

  if (content !== original) {
    writeFileSync(filePath, content, "utf8");
    console.log(`  rewired: ${filePath}`);
    changed++;
  }
}

console.log(`\nDone — ${changed} files updated.`);
