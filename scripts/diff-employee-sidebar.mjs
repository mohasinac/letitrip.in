#!/usr/bin/env node
/**
 * diff-employee-sidebar — the W6 gate, run BEFORE nav items gain ids.
 *
 * ## Why this exists
 *
 * `filterNavItems` opens with `if (!item.id) return true;`, and **no admin nav
 * item has an id** — every one comes from `adminItem(href, label, permission)`,
 * which cannot produce one. So the permission branch below it has never
 * executed, and every employee currently sees the entire admin sidebar
 * regardless of what `permissions[]` says.
 *
 * Giving items ids is a two-line mechanical change that **switches permission
 * filtering on for the first time**. That is not a refactor; it is a
 * behavioural change to who can see what. This script is the evidence for it:
 * for every permission preset, which entries disappear, and — the part that
 * actually bites — which GROUPS empty entirely, because `filterGroups` drops
 * an empty group and its heading with it.
 *
 * ## Why it diffs PRESETS rather than today's employees
 *
 * An employee's `permissions[]` is editable and today's roster is not the
 * roster this ships to. `PERMISSION_GROUPS` is the set of shapes an employee
 * can have, so a diff over the presets covers every roster reachable through
 * the admin UI — and it runs with no credentials and no production read.
 *
 * A custom-permission employee is not covered by construction; the summary
 * says so rather than implying completeness.
 *
 * Usage: node scripts/diff-employee-sidebar.mjs [--group <name>]
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/**
 * Parse `ADMIN_NAV_GROUPS` out of `navigation.tsx` textually.
 *
 * Importing it is not an option: the file is TSX and pulls in React icon
 * components. The shape it needs is regular enough to read — every item is one
 * `adminItem(route, "Label", "permission")` call inside a `title:` group.
 */
function readAdminNav() {
  const src = readFileSync(join(ROOT, "src/constants/navigation.tsx"), "utf8");
  const start = src.indexOf("export const ADMIN_NAV_GROUPS");
  if (start === -1) throw new Error("ADMIN_NAV_GROUPS not found");
  const end = src.indexOf("\n];", start);
  const body = src.slice(start, end);

  const groups = [];
  let current = null;
  for (const line of body.split("\n")) {
    const title = line.match(/title:\s*"([^"]+)"/);
    if (title) {
      current = { title: title[1], items: [] };
      groups.push(current);
      continue;
    }
    const item = line.match(/adminItem\(\s*[^,]+,\s*"([^"]+)",\s*"([^"]+)"/);
    if (item && current) current.items.push({ label: item[1], permission: item[2] });
  }
  return groups;
}

/** Parse `PERMISSION_GROUPS` out of the constants file, same reasoning. */
function readPermissionGroups() {
  const src = readFileSync(
    join(ROOT, "appkit/src/features/auth/permissions/constants.ts"),
    "utf8",
  );
  const start = src.indexOf("export const PERMISSION_GROUPS");
  if (start === -1) throw new Error("PERMISSION_GROUPS not found");
  const end = src.indexOf("\n};", start);
  const body = src.slice(start, end);

  const groups = {};
  let current = null;
  for (const line of body.split("\n")) {
    const key = line.match(/^\s{2}(\w+):\s*\[/);
    if (key) {
      current = key[1];
      groups[current] = [];
    }
    if (!current) continue;
    for (const m of line.matchAll(/"([a-z][\w:.-]*:[\w:.-]+)"/g)) {
      groups[current].push(m[1]);
    }
  }
  return groups;
}

const navGroups = readAdminNav();
const permissionGroups = readPermissionGroups();

const totalItems = navGroups.reduce((n, g) => n + g.items.length, 0);

console.log("W6 GATE — admin sidebar, before vs after permission filtering\n");
console.log(
  `Today every employee sees all ${totalItems} items across ${navGroups.length} groups,`,
);
console.log("because filterNavItems short-circuits on the missing `id`.\n");

const rows = [];
for (const [preset, perms] of Object.entries(permissionGroups)) {
  const held = new Set(perms);
  let visible = 0;
  const emptiedGroups = [];
  for (const g of navGroups) {
    const kept = g.items.filter((i) => held.has(i.permission));
    visible += kept.length;
    if (kept.length === 0 && g.items.length > 0) emptiedGroups.push(g.title);
  }
  rows.push({ preset, visible, emptied: emptiedGroups });
}

rows.sort((a, b) => a.visible - b.visible);

const pad = Math.max(...rows.map((r) => r.preset.length));
for (const r of rows) {
  const lost = totalItems - r.visible;
  console.log(
    `  ${r.preset.padEnd(pad)}  sees ${String(r.visible).padStart(3)} of ${totalItems}  (loses ${lost})`,
  );
  if (r.emptied.length) {
    console.log(`  ${" ".repeat(pad)}  groups that vanish entirely: ${r.emptied.join(", ")}`);
  }
}

/*
 * A permission that no nav item requires is not a defect — plenty of
 * permissions gate routes and actions rather than sidebar entries. It is
 * reported because a preset made ENTIRELY of such permissions produces an
 * employee with an empty sidebar, which reads as a broken account.
 */
const navPermissions = new Set(navGroups.flatMap((g) => g.items.map((i) => i.permission)));
const orphanPresets = rows.filter((r) => r.visible === 0);
if (orphanPresets.length) {
  console.log("\n🛑 Presets whose employees would see an EMPTY admin sidebar:");
  for (const r of orphanPresets) console.log(`   - ${r.preset}`);
}

const unusedByNav = Object.entries(permissionGroups)
  .flatMap(([, perms]) => perms)
  .filter((p) => !navPermissions.has(p));
console.log(
  `\n${new Set(unusedByNav).size} distinct preset permission(s) gate no sidebar entry (they gate routes/actions instead).`,
);
console.log(
  "\nNOT covered: an employee with hand-picked `permissions[]` rather than a preset.",
);
