#!/usr/bin/env node
/**
 * audit-user-pages-overhaul.mjs
 *
 * Verifies the work shipped in the "user-pages-buzzing-wreath" cohort.
 * Each check is a single read + grep against a known file; failures print the
 * file + the marker that was missing.
 *
 * Two surfaces are scanned:
 *
 *   1. Consumer (letitrip.in/src/**) — these checks gate the merge and must
 *      stay green for as long as the user-dashboard overhaul ships.
 *   2. Appkit (appkit/src/**) — these checks confirm the appkit source matches
 *      the runtime behavior the dashboard expects. They pass against source
 *      regardless of whether dist/ has been republished yet. A separate notice
 *      at the end reminds you to publish appkit when source-only checks pass
 *      but the consumer is still on a pinned npm version.
 *
 * Exits 0 on clean, 1 on any failure.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const APPKIT = join(ROOT, "appkit");

const failures = [];
let consumerPasses = 0;
let appkitPasses = 0;

function check(label, abs, ...needles) {
  const rel = relative(ROOT, abs).replaceAll("\\", "/");
  if (!existsSync(abs)) {
    failures.push({ scope: rel.startsWith("appkit/") ? "appkit" : "consumer", label, rel, reason: "file missing" });
    return false;
  }
  const txt = readFileSync(abs, "utf8");
  const missing = needles.filter((n) => (n instanceof RegExp ? !n.test(txt) : !txt.includes(n)));
  if (missing.length > 0) {
    failures.push({
      scope: rel.startsWith("appkit/") ? "appkit" : "consumer",
      label,
      rel,
      reason: `missing markers: ${missing.map((n) => (n instanceof RegExp ? n.toString() : `"${n}"`)).join(", ")}`,
    });
    return false;
  }
  if (rel.startsWith("appkit/")) appkitPasses++;
  else consumerPasses++;
  return true;
}

function requireFile(label, abs) {
  return check(label, abs);
}

// ────────────────────────────────────────────────────────────────────────────
// Cohort 1 — Layout / theming / sidebar
// ────────────────────────────────────────────────────────────────────────────

check(
  "Cohort 1 · sidebar toggle is themed (no hardcoded green gradient)",
  join(APPKIT, "src/features/account/components/UserSidebar.tsx"),
  "--appkit-color-primary-700",
  "--appkit-color-secondary-500",
);

check(
  "Cohort 1 · DashboardLayoutClient widens padding + centers wide screens",
  join(APPKIT, "src/_internal/client/features/layout/DashboardLayoutClient.tsx"),
  "md:pl-14",
  "lg:pl-16",
  "max-w-screen-2xl",
);

check(
  "Cohort 1 · Settings page uses TabStrip + Accordion (no inline tab buttons)",
  join(ROOT, "src/app/[locale]/user/settings/page.tsx"),
  "TabStrip",
  "Accordion",
);
// Negative check — old inline tab class must be gone.
{
  const settingsAbs = join(ROOT, "src/app/[locale]/user/settings/page.tsx");
  if (existsSync(settingsAbs)) {
    const txt = readFileSync(settingsAbs, "utf8");
    if (txt.includes("border-[var(--appkit-color-cobalt)] text-[var(--appkit-color-cobalt)]")) {
      failures.push({
        scope: "consumer",
        label: "Cohort 1 · old hand-rolled tab classes removed",
        rel: "src/app/[locale]/user/settings/page.tsx",
        reason: 'still contains the old "border-[var(--appkit-color-cobalt)] text-[var(--appkit-color-cobalt)]" tab styles',
      });
    } else {
      consumerPasses++;
    }
  }
}

check(
  "Cohort 1 · FontToggleClient uses appkit <Toggle> (not bespoke iOS markup)",
  join(ROOT, "src/components/user/FontToggleClient.tsx"),
  /from\s+"@mohasinac\/appkit\/ui"/,
  /<Toggle\s/,
);
{
  const ftc = join(ROOT, "src/components/user/FontToggleClient.tsx");
  if (existsSync(ftc) && /\binline-flex\s+h-6\s+w-11\b/.test(readFileSync(ftc, "utf8"))) {
    failures.push({
      scope: "consumer",
      label: "Cohort 1 · bespoke toggle markup removed from FontToggleClient",
      rel: "src/components/user/FontToggleClient.tsx",
      reason: "still contains the old `inline-flex h-6 w-11` switch (giant-circle render)",
    });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Cohort 2 — Profile + Settings density
// ────────────────────────────────────────────────────────────────────────────

check(
  "Cohort 2 · User hub renders stats strip + clickable avatar uploader",
  join(ROOT, "src/app/[locale]/user/page.tsx"),
  "StatCard",
  "useMediaUpload",
  "useUpdateProfile",
  "useNotifications",
);

requireFile(
  "Cohort 2 · ProfileActivityPanel exists",
  join(ROOT, "src/components/user/ProfileActivityPanel.tsx"),
);

check(
  "Cohort 2 · Profile page mounts ProfileActivityPanel",
  join(ROOT, "src/app/[locale]/user/profile/page.tsx"),
  "ProfileActivityPanel",
);

check(
  "Cohort 2 · Appearance tab uses DynamicSelect for languages",
  join(ROOT, "src/app/[locale]/user/settings/page.tsx"),
  "DynamicSelect",
  "SUPPORTED_LANGUAGES",
);

requireFile(
  "Cohort 2 · Language constants module exists",
  join(ROOT, "src/constants/languages.ts"),
);

// ────────────────────────────────────────────────────────────────────────────
// Cohort 3 — Title bar avatar + unread badge
// ────────────────────────────────────────────────────────────────────────────

check(
  "Cohort 3 · TitleBarLayout exposes unreadNotificationCount prop + renders badge",
  join(APPKIT, "src/features/layout/TitleBarLayout.tsx"),
  "unreadNotificationCount",
  "99+",
);

check(
  "Cohort 3 · TitleBar wires useNotifications and passes unread count",
  join(APPKIT, "src/features/layout/TitleBar.tsx"),
  "useNotifications",
  "unreadNotificationCount",
);

// ────────────────────────────────────────────────────────────────────────────
// Cohort 4 + 5 — Listing toolbar adoption across user pages
// ────────────────────────────────────────────────────────────────────────────

const USER_PAGES_WITH_TOOLBAR = [
  "src/app/[locale]/user/orders/page.tsx",
  "src/app/[locale]/user/returns/page.tsx",
  "src/app/[locale]/user/reviews/page.tsx",
  "src/app/[locale]/user/pre-orders/page.tsx",
  "src/app/[locale]/user/prize-draws/page.tsx",
  "src/app/[locale]/user/digital-codes/page.tsx",
  "src/app/[locale]/user/events/page.tsx",
  "src/app/[locale]/user/bids/page.tsx",
  "src/app/[locale]/user/notifications/page.tsx",
  "src/app/[locale]/user/support/page.tsx",
];

for (const rel of USER_PAGES_WITH_TOOLBAR) {
  check(
    `Cohort 4/5 · ${rel} wired to useUrlTable + ListingToolbar`,
    join(ROOT, rel),
    "useUrlTable",
    "ListingToolbar",
  );
}

check(
  "Cohort 5 · UserAddressesClient ships inline search + label filter",
  join(ROOT, "src/components/user/UserAddressesClient.tsx"),
  "labelFilter",
  "address-search",
);

// ────────────────────────────────────────────────────────────────────────────
// Cohort 6 — Chat URL deep links + dedicated [id] route
// ────────────────────────────────────────────────────────────────────────────

requireFile(
  "Cohort 6 · /user/messages/[id] page exists",
  join(ROOT, "src/app/[locale]/user/messages/[id]/page.tsx"),
);

check(
  "Cohort 6 · Messages page reads activeId from URL ?c= state",
  join(ROOT, "src/app/[locale]/user/messages/page.tsx"),
  /table\.get\("c"\)/,
  "initialActiveId",
);

check(
  "Cohort 6 · Notifications page has no `tabs` filter (tabs replaced by toolbar)",
  join(ROOT, "src/app/[locale]/user/notifications/page.tsx"),
  "ListingToolbar",
);
{
  // negative check — old FilterKey tabs union should be gone
  const notif = join(ROOT, "src/app/[locale]/user/notifications/page.tsx");
  if (existsSync(notif)) {
    const txt = readFileSync(notif, "utf8");
    if (/type\s+FilterKey\s*=\s*"all"\s*\|\s*"unread"/.test(txt)) {
      failures.push({
        scope: "consumer",
        label: "Cohort 6 · notifications page no longer carries the FilterKey tab union",
        rel: "src/app/[locale]/user/notifications/page.tsx",
        reason: 'still contains `type FilterKey = "all" | "unread" | …` union',
      });
    } else {
      consumerPasses++;
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Cohort 7 — Tickets pages
// ────────────────────────────────────────────────────────────────────────────

requireFile("Cohort 7 · New ticket page exists",  join(ROOT, "src/app/[locale]/user/support/new/page.tsx"));
requireFile("Cohort 7 · Ticket detail page exists", join(ROOT, "src/app/[locale]/user/support/[id]/page.tsx"));
requireFile("Cohort 7 · GET /api/support/tickets/[id] route exists", join(ROOT, "src/app/api/support/tickets/[id]/route.ts"));
requireFile("Cohort 7 · Ticket constants module exists",          join(ROOT, "src/constants/tickets.ts"));

check(
  "Cohort 7 · Support list page replaced the old single-line UserSupportView delegate",
  join(ROOT, "src/app/[locale]/user/support/page.tsx"),
  "ListingToolbar",
  "TICKET_STATUSES",
);

// ────────────────────────────────────────────────────────────────────────────
// Cohort 8 — Modals + proxy bid + become-seller confirm
// ────────────────────────────────────────────────────────────────────────────

check(
  "Cohort 8 · MakeOfferButton renders the offer form inside a <Modal>",
  join(APPKIT, "src/features/products/components/MakeOfferButton.tsx"),
  /import\s+{[^}]*\bModal\b[^}]*}\s+from\s+"\.\.\/\.\.\/\.\.\/ui"/,
  "<Modal",
);

check(
  "Cohort 8 · PlaceBidFormClient exports PlaceBidModalButton companion",
  join(APPKIT, "src/features/auctions/components/PlaceBidFormClient.tsx"),
  "export function PlaceBidModalButton",
);

check(
  "Cohort 8 · bid-actions implements proxy-bid (cap + visibleBid) semantics",
  join(APPKIT, "src/features/auctions/actions/bid-actions.ts"),
  "newCap",
  "prevCap",
  "visibleBid",
  "bumpedPreviousVisible",
);

check(
  "Cohort 8 · UserNavItem.confirm intercept lands in NavLink onClick",
  join(APPKIT, "src/features/account/components/UserSidebar.tsx"),
  "confirm?:",
  "item.confirm.message",
);

check(
  "Cohort 8 · seller dashboard link is wired with confirm copy",
  join(ROOT, "src/constants/navigation.tsx"),
  "Leave your buyer dashboard",
);

// ────────────────────────────────────────────────────────────────────────────
// Report
// ────────────────────────────────────────────────────────────────────────────

if (failures.length === 0) {
  console.log(`audit-user-pages-overhaul: ${consumerPasses} consumer checks ✓ · ${appkitPasses} appkit-source checks ✓`);
  // Publish reminder — consumer can compile against the npm-pinned dist but the
  // runtime won't reflect appkit-side cohorts (1/3/8) until the dist is rebuilt.
  if (appkitPasses > 0) {
    try {
      const consumerPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
      const dep = consumerPkg.dependencies?.["@mohasinac/appkit"] ?? "";
      if (!String(dep).startsWith("file:")) {
        console.log(
          `\nReminder: appkit source changes in this audit don't ship until appkit is rebuilt + published.\n` +
          `  current pin: "@mohasinac/appkit": "${dep}"\n` +
          `  publish workflow: bump appkit/package.json → npm --prefix ./appkit run build → npm --prefix ./appkit publish → bump consumer pin → npm install`,
        );
      }
    } catch { /* package.json read failed; non-fatal */ }
  }
  process.exit(0);
}

const groups = { consumer: [], appkit: [] };
for (const f of failures) groups[f.scope].push(f);

const lines = [`audit-user-pages-overhaul: ${failures.length} violation(s).`];
for (const scope of ["consumer", "appkit"]) {
  if (groups[scope].length === 0) continue;
  lines.push("", `── ${scope} ──`);
  for (const f of groups[scope]) {
    lines.push(`  [${f.label}]`);
    lines.push(`    ${f.rel}`);
    lines.push(`    ${f.reason}`);
  }
}

process.stderr.write(lines.join("\n") + "\n");
process.exit(1);

// Silence unused-import warnings for helpers that are conditional.
void readdirSync; void statSync;
