import { readFileSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";
const SCAN = ["src", "appkit/src"];
const SKIP = new Set(["node_modules", ".next", "seed", "repositories", "scripts", "__tests__", "__mocks__", "configs", "contracts", "validators"]);
const SKIP_RE = /[/\\]ui[/\\](?:components|forms|rich-text)[/\\]|og(?:-layout)?\.tsx$|ErrorBoundary\.tsx$/;
function walk(d, f = []) {
  let e; try { e = readdirSync(d, { withFileTypes: true }); } catch { return f; }
  for (const x of e) {
    if (SKIP.has(x.name)) continue;
    const p = join(d, x.name);
    if (x.isDirectory()) walk(p, f);
    else if (extname(x.name) === ".tsx" && !SKIP_RE.test(p)) f.push(p);
  }
  return f;
}
const counts = {};
for (const d of SCAN) for (const f of walk(d)) {
  const c = readFileSync(f, "utf8").split("\n").filter(l => /<div\s/.test(l) && !l.trim().startsWith("//") && !l.trim().startsWith("*")).length;
  if (c) counts[f] = c;
}
const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 20);
for (const [f, c] of sorted) console.log(c, f);
