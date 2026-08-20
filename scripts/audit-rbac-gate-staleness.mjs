#!/usr/bin/env node
/**
 * audit-rbac-gate-staleness — catches the bug class root-caused 2026-08-20 in
 * appkit/src/features/tester/components/TesterHubView.tsx: a component reads
 * an RBAC field (role/isTester/canTestAdmin/disabled, or a role predicate)
 * off `useSession()`/`useAuth()` and uses it, standalone, to decide whether
 * to render an access-denied `<Alert>` — while the SAME component also makes
 * its own data fetch to an endpoint that independently re-verifies the exact
 * same permission against live Firestore data on every request.
 *
 * The problem: SessionContext only refreshes role/isTester/canTestAdmin/
 * disabled/storeId periodically (every 5 minutes) or on a hard reload/
 * re-login — never on ordinary client-side navigation. So a flag an admin
 * just granted (or revoked) reads as denied here for up to 5 minutes even
 * though the paired API call, hit at the exact same moment, would already
 * succeed. The fix (see TesterHubView.tsx's post-fix shape): gate on the
 * query's actual 403 response instead of the cached session field — the
 * access decision is then exactly as fresh as the API it's calling.
 *
 * Rule RBAC_GATE_STALE_SESSION_FIELD (hard-fail, strict zero) — flags a
 * client file when ALL of:
 *   1. Reads an RBAC field off a session/auth hook result (`.role`,
 *      `.isTester`, `.canTestAdmin`, `.disabled`) or calls a role predicate
 *      (isAdminUser/isSellerUser/isEmployeeUser/isModeratorUser/isBuyerUser)
 *      on that hook's user.
 *   2. Contains an `if (...) return <Alert variant="warning|error|danger"`
 *      (same-line or the return spanning the next couple of lines) whose
 *      condition text references one of the fields/predicates from (1).
 *   3. Also calls its own data fetch (`useQuery(` or `apiClient.get(`) —
 *      i.e. it has a live signal to defer to, distinguishing it from a
 *      shared route-level guard component with no fetch of its own (those
 *      are structurally different and explicitly exempted below, not
 *      flagged — see RoleGuard.tsx/Guards.tsx, which need a different fix
 *      shape: a forced refreshUser() before trusting a denial, not a
 *      query-403 defer, since they wrap arbitrary children rather than
 *      owning a specific protected fetch).
 *   4. Does NOT already defer to the fetch's own failure (no `query.isError`
 *      co-located with `403`/`.status` anywhere in the file) — if present,
 *      the file already follows the correct pattern.
 *
 * This intentionally does NOT flag cosmetic show/hide-a-button/nav-link
 * checks (rule 2 requires an early-return Alert, not a .filter()/ternary),
 * and does NOT flag server-rendered RSC pages resolving via
 * getServerSessionUser() (a React.cache()-scoped per-request Firestore read
 * that re-executes fresh on every navigation — not subject to this staleness
 * class at all).
 *
 * Suppression: `// audit-rbac-gate-staleness-ok: <reason>` anywhere in the
 * file, for a deliberate exception (e.g. a gate that's supposed to block the
 * fetch from firing at all for cost/privacy reasons, not just delay it).
 *
 * Exits 1 on any violation.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN_DIRS = [join(ROOT, "appkit", "src"), join(ROOT, "src")];

// Structurally exempt — shared route-level guards with no fetch of their
// own; the fix for these is a forced refreshUser(), not a query-403 defer.
const EXEMPT_PATHS = [
  join(ROOT, "appkit", "src", "features", "auth", "components", "Guards.tsx"),
  join(ROOT, "appkit", "src", "_internal", "client", "features", "layout", "RoleGuard.tsx"),
];

const SUPPRESS_RE = /audit-rbac-gate-staleness-ok:/;
const SESSION_HOOK_RE = /\b(?:useSession|useAuth)\s*\(/;
const RBAC_FIELD_RE = /\.(?:role|isTester|canTestAdmin|disabled)\b|\b(?:isAdminUser|isSellerUser|isEmployeeUser|isModeratorUser|isBuyerUser)\s*\(/;
const DENIAL_RETURN_RE = /if\s*\([^)]*\)\s*\{?\s*(?:\n\s*)?return\s*\(?\s*(?:\n\s*)?<Alert\s+variant=["'{](?:warning|error|danger)/;
const HAS_FETCH_RE = /\buseQuery\s*\(|\bapiClient\.get\s*\(/;
const DEFERRED_RE = /query\.isError[\s\S]{0,200}?(?:403|\.status)|(?:403|\.status)[\s\S]{0,200}?query\.isError/;

function walkFiles(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, out);
    } else if (entry.isFile() && (entry.name.endsWith(".tsx"))) {
      out.push(full);
    }
  }
}

const files = [];
for (const dir of SCAN_DIRS) walkFiles(dir, files);

const violations = [];

for (const file of files) {
  if (EXEMPT_PATHS.includes(file)) continue;
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (SUPPRESS_RE.test(src)) continue;
  if (!SESSION_HOOK_RE.test(src)) continue;
  if (!RBAC_FIELD_RE.test(src)) continue;
  if (!HAS_FETCH_RE.test(src)) continue;
  if (DEFERRED_RE.test(src)) continue;

  const match = DENIAL_RETURN_RE.exec(src);
  if (!match) continue;

  const line = src.slice(0, match.index).split("\n").length;
  violations.push({ file: relative(ROOT, file), line, text: match[0].split("\n")[0].trim() });
}

if (violations.length > 0) {
  console.log(`\naudit-rbac-gate-staleness: ${violations.length} RBAC_GATE_STALE_SESSION_FIELD violation(s) — FAIL\n`);
  for (const v of violations) {
    console.log(`  🔴 ${v.file}:${v.line}`);
    console.log(`     ${v.text}`);
  }
  console.log(
    "\nFix: gate on the data fetch's own 403 response instead of the cached\n" +
    "     session field — e.g. `const denied = query.isError && (query.error as\n" +
    "     {status?:number})?.status === 403;` — so access updates on the very\n" +
    "     next request instead of waiting up to 5 minutes for SessionContext's\n" +
    "     periodic refresh. See TesterHubView.tsx for the reference fix.\n" +
    "     Genuine exceptions: `// audit-rbac-gate-staleness-ok: <reason>`.\n"
  );
  process.exit(1);
}

console.log("audit-rbac-gate-staleness: clean.\n");
process.exit(0);
