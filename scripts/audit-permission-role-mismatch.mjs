#!/usr/bin/env node
/**
 * audit-permission-role-mismatch.mjs — catches a guaranteed-403 combination
 * in `createRouteHandler({ roles, permission })` calls.
 *
 * `getServerPermissions()` (appkit/src/_internal/server/features/auth/permissions.ts)
 * only ever resolves a non-empty permission set for role `"employee"` — admin
 * bypasses the permission check entirely, and every OTHER role (seller,
 * moderator, user) always gets `{ isAdmin: false, permissions: [] }`. In
 * `createRouteHandler` (appkit/src/next/api/routeHandler.ts), the permission
 * check runs for ANY authenticated non-admin user who passed the `roles`
 * gate — not just employees. So a route declaring:
 *
 *   roles: [ROLES_ADMIN_MOD]  // = [admin, moderator]
 *   permission: "admin:categories:read"
 *
 * lets a moderator PAST the roles check, then unconditionally 403s them at
 * the permission check (moderator's resolved permissions are always `[]`,
 * and "admin:categories:read" is never in that list). The route is
 * unreachable for every role in `roles` except admin — a bug that reads as
 * correctly-configured RBAC but silently locks out everyone it claims to
 * allow. This exact pattern caused a real bug (2026-08-15): sellers were
 * added to /api/admin/categories's `roles` to let them browse+create
 * categories inline, but the co-located `permission` field would have kept
 * 403ing them even after the roles fix, because sellers are not employees
 * either.
 *
 * Rule: if `roles` includes anything other than "admin" and/or "employee",
 * a co-located `permission` field is almost certainly a bug — either the
 * non-admin/non-employee role can never actually use the route (dead
 * grant), or the `permission` field is a stale carry-over from a route that
 * used to be employee-only. Flag it.
 *
 * Suppression: `// audit-permission-role-mismatch-ok: <reason>` on the
 * `permission:` line or the line above, for genuine cases (e.g. a future
 * RBAC model where non-employee permission resolution is intentional).
 *
 * REPORT MODE — first run (2026-08-15) found 151 pre-existing instances,
 * spanning admin AND store routes (i.e. this most likely silently 403s real
 * moderators and sellers on a large swath of routes today, not just the
 * category/brand routes this audit was written to prevent regressing). That
 * is a large, separate fix effort outside this session's scope — reporting
 * every run (never silent) without blocking `npm run check` until someone
 * signs up to burn the list down. Set STRICT=1 to fail on any violation.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_DIRS = [join(ROOT, "src", "app", "api"), join(ROOT, "appkit", "src")];
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", "__tests__", "__mocks__"]);
const SKIP_FILE_RE = /\.(d\.ts|test\.tsx?|spec\.tsx?)$/;

// Roles that DO resolve real permissions via getServerPermissions() —
// admin bypasses the check outright, employee is the only role with a
// populated permissions[] array. Any other role token found in `roles`
// alongside a `permission` field is the bug.
const SAFE_ROLE_TOKENS = new Set(["admin", "employee", "ROLES_ADMIN_ONLY", "ROLES_TRUST_SAFETY"]);

const SUPPRESSION_RE = /audit-permission-role-mismatch-ok:/;

function walk(dir, files = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return files; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (extname(entry.name) === ".ts" && !SKIP_FILE_RE.test(entry.name)) files.push(full);
  }
  return files;
}

/** Extract the `roles: [...]` array literal (or identifier spread) contents from a createRouteHandler call block. */
function extractRolesTokens(block) {
  const m = block.match(/roles\s*:\s*\[([^\]]*)\]/);
  if (!m) return null;
  return m[1]
    .split(",")
    .map((t) => t.trim().replace(/^\.\.\./, "").replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const src = readFileSync(file, "utf8");
    if (!/createRouteHandler\s*(?:<[^>]*>)?\s*\(\s*\{/.test(src)) continue;

    // Find each createRouteHandler({ ... }) call block (non-nested-brace
    // heuristic: stop at the first top-level `handler:` close — good enough
    // since these calls don't nest object literals containing "roles"/
    // "permission" siblings elsewhere).
    const callStarts = [...src.matchAll(/createRouteHandler\s*(?:<[^>]*>)?\s*\(\s*\{/g)];
    for (const m of callStarts) {
      const start = m.index;
      // Grab a generous window — these option blocks are short (roles,
      // permission, schema, handler are all declared before the handler
      // body itself gets large); 800 chars comfortably covers the option
      // block for every route in this codebase.
      const window = src.slice(start, start + 800);
      const rolesTokens = extractRolesTokens(window);
      if (!rolesTokens) continue;
      const permissionMatch = window.match(/(?:^|\n)\s*permission\s*:\s*["'][^"']+["']/);
      if (!permissionMatch) continue;

      const hasUnsafeRole = rolesTokens.some((t) => !SAFE_ROLE_TOKENS.has(t));
      if (!hasUnsafeRole) continue;

      // Suppression: check the permission line itself and the line above it.
      const permissionOffset = start + permissionMatch.index + permissionMatch[0].indexOf("permission");
      const lineNumber = src.slice(0, permissionOffset).split("\n").length;
      const lines = src.split("\n");
      const thisLine = lines[lineNumber - 1] ?? "";
      const aboveLine = lines[lineNumber - 2] ?? "";
      if (SUPPRESSION_RE.test(thisLine) || SUPPRESSION_RE.test(aboveLine)) continue;

      violations.push({
        file: relative(ROOT, file).replace(/\\/g, "/"),
        line: lineNumber,
        roles: rolesTokens.join(", "),
      });
    }
  }
}

const STRICT = process.env.STRICT === "1";

if (violations.length === 0) {
  console.log("audit-permission-role-mismatch: clean ✓");
  process.exit(0);
}

const stream = STRICT ? console.error : console.log;
stream(
  `audit-permission-role-mismatch: ${violations.length} guaranteed-403 role/permission combo(s) found` +
    (STRICT ? "." : " — REPORT MODE (set STRICT=1 to fail)."),
);
stream(
  "A `permission` field alongside a `roles` array containing anything other than \"admin\"/\"employee\"\n" +
    "silently locks out every non-admin role in that array — getServerPermissions() only resolves\n" +
    "permissions for \"employee\". Either drop `permission` (gate on roles[] alone) or drop the\n" +
    "non-admin/non-employee role from roles[] if the route is genuinely meant to be permission-gated.\n",
);
for (const v of violations) {
  stream(`  ${v.file}:${v.line}  roles: [${v.roles}]`);
}
process.exit(STRICT ? 1 : 0);
