import { readFileSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FORBIDDEN_UTILITY_TOKENS,
  PRIMITIVE_TAGS,
  VARIANT_OK_MARKER,
} from "./variant-catalogue.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const file = join(ROOT, process.argv[2]);
const OPENER = new RegExp("<(" + PRIMITIVE_TAGS.join("|") + ")\\b([^>]*?)(?=/?>)", "g");
const CLS = /className\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{"([^"]*)"\}|\{'([^']*)'\})/;

const text = readFileSync(file, "utf8");
const lines = text.split("\n");
for (const m of text.matchAll(OPENER)) {
  const attrs = m[2];
  if (!attrs.includes("className")) continue;
  const cls = CLS.exec(attrs);
  if (!cls) continue;
  const v = cls[1] ?? cls[2] ?? cls[3] ?? cls[4] ?? cls[5] ?? "";
  if (!v.trim()) continue;
  const offending = FORBIDDEN_UTILITY_TOKENS.filter((rx) => rx.test(v));
  if (offending.length === 0) continue;
  const before = text.slice(0, m.index ?? 0);
  const li = before.split("\n").length - 1;
  if (VARIANT_OK_MARKER.test(lines[li]) || (li > 0 && VARIANT_OK_MARKER.test(lines[li - 1]))) continue;
  const tokens = offending.map((rx) => v.match(rx)?.[0]).filter(Boolean).join(", ");
  console.log(`${li + 1}  <${m[1]}>  [${tokens}]  ${v.slice(0, 100)}`);
}
