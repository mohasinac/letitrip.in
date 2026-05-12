#!/usr/bin/env node
// One-shot helper: parse `npm run check:lint` output (path passed as arg) and
// emit the relative TSX paths that hit `lir/no-raw-html-elements` or
// `lir/no-raw-media-elements`. Used by the LR1 disable-stamp script.
import fs from "fs";

const inputPath = process.argv[2] || "/tmp/lint-output.txt";
const txt = fs.readFileSync(inputPath, "utf8");
const root = "D:\\proj\\letitrip.in\\";
const files = new Set();
let cur = null;
for (const ln of txt.split("\n")) {
  if (ln.startsWith(root)) {
    cur = ln.slice(root.length).replace(/\\/g, "/").trim();
    continue;
  }
  if (
    cur &&
    (ln.includes("lir/no-raw-html-elements") ||
      ln.includes("lir/no-raw-media-elements"))
  ) {
    files.add(cur);
  }
}
console.log([...files].sort().join("\n"));
