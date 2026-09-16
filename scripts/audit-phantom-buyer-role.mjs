#!/usr/bin/env node
/*
 * Role gates that name "buyer" — a role no user in this system has.
 *
 * UserDocument.role is `user | seller | moderator | employee | admin`. There is
 * no "buyer". Measured on production: user-yugi-muto and user-seto-kaiba, the
 * two seeded buyer personas, both carry role "user".
 *
 * So `requireRoleUser(["buyer", "seller", "admin"])` — the gate on
 * requestReturnAction — rejects EVERY ordinary buyer, and the entire returns
 * feature is unreachable by the only people it exists for. The failure surfaces
 * as a generic "Failed to submit refund request" on a fully valid form, which
 * reads as a transient glitch rather than a permanent gate.
 *
 * The role-predicate helpers (isBuyerUser etc.) exist precisely so nobody has
 * to remember this. A literal "buyer" in a role list is the tell.
 *
 * 🛑 POSITIVE CONTROL FIRST — a sweep that cannot see its own known-bad string
 * is worse than no sweep, because it is reported as evidence.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["src", "appkit/src"];

/*
 * 🛑 SCOPE IS THE WHOLE DESIGN OF THIS RULE.
 *
 * The first version matched any array containing "buyer" and reported ~300
 * hits, nearly all legitimate:
 *
 *   - `z.enum(["buyer", "seller"])` on `shippingPaidBy` — a VALUE, not a role;
 *   - `roles: ["buyer"]` throughout the tester seed-data — the checklist
 *     author's OWN vocabulary for "whose point of view is this case written
 *     from", which the harness maps to a browsing identity. A different
 *     namespace that happens to share a word.
 *
 * An audit that reports 300 findings of which 3 are real is worse than no
 * audit: it trains people to skip it. This matches only a RUNTIME AUTH GATE.
 */
const SKIP = /node_modules|\.next|dist|\.tester-runs|features[\\/]tester[\\/]seed-data/;

const PATTERNS = [
  // the auth helpers — the only things that actually refuse a request
  /require(Role|RoleUser|AnyRole)\s*\(\s*\[?[^)]*["']buyer["']/,
  // a route handler's own role list
  /createRouteHandler\([^)]*roles:\s*\[[^\]]*["']buyer["']/,
  // a hand-rolled comparison against the role field
  /\brole\s*[!=]==\s*["']buyer["']/,
  /\.role\s*\)?\s*\.includes\(\s*["']buyer["']/,
];

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e);
    if (SKIP.test(p)) continue;
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(e)) out.push(p);
  }
  return out;
}

/*
 * 🛑 THE DEFECT IS "buyer WITHOUT user", NOT "buyer".
 *
 * The first version flagged any gate naming "buyer" and so kept failing after
 * the fix landed — it could not tell a repaired gate from a broken one, which
 * makes it useless as a regression check.
 *
 * "buyer" alongside "user" is harmless: it costs nothing, and some deployment
 * may carry it as a custom claim. What breaks a real buyer is a list that
 * names "buyer" and omits "user" — `requireRole` is a plain
 * `allowed.includes(userRole)`, so that list refuses every ordinary account.
 */
const hits = (line) => PATTERNS.some((re) => re.test(line)) && !/["']user["']/.test(line);

// ── Controls ────────────────────────────────────────────────────────────────
if (!hits(`const user = await requireRoleUser(["buyer", "seller", "admin"]);`)) {
  console.error("✗ CONTROL FAILED — cannot see the known-bad gate. Aborting.");
  process.exit(2);
}
if (hits(`* a buyer must not be able to lodge a request`)) {
  console.error("✗ CONTROL FAILED — matches prose, which would drown the signal. Aborting.");
  process.exit(2);
}
if (hits(`shippingPaidBy: z.enum(["buyer", "seller"]).optional(),`)) {
  console.error("✗ CONTROL FAILED — matches a Zod value enum, not a role gate. Aborting.");
  process.exit(2);
}
console.log("✓ controls: sees the known-bad gate, ignores prose and types\n");

let violations = 0;
for (const file of ROOTS.flatMap((r) => walk(r))) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    const t = line.trim();
    if (t.startsWith("*") || t.startsWith("//")) return;
    if (!hits(line)) return;
    console.log(`  ${file.replace(/\\/g, "/")}:${i + 1}`);
    console.log(`    gates on role "buyer", which no user has — the role is "user"`);
    console.log(`    ${t.slice(0, 110)}`);
    violations++;
  });
}

console.log(
  violations === 0
    ? "\naudit-phantom-buyer-role: clean ✓"
    : `\naudit-phantom-buyer-role: ${violations} gate(s) naming a role nobody has.`,
);
process.exit(violations === 0 ? 0 : 1);
