#!/usr/bin/env node
/**
 * fix-provider-guards.mjs
 *
 * Fixes all API route files that use createRouteHandler/createApiHandler
 * with a side-effect provider import instead of proper withProviders() wrapping.
 *
 * For each affected file:
 *   1. Replaces `import "@/providers.config"` side-effect with the named import.
 *   2. Wraps each handler export:
 *        export const X = createHandler({...});
 *      →  export const X = withProviders(createHandler({...}));
 *
 * Usage: node scripts/tooling/fix-provider-guards.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "../..");

/** All files confirmed (by audit) to have the race-prone pattern. */
const AFFECTED_FILES = [
  "src/app/api/admin/analytics/route.ts",
  "src/app/api/admin/bids/route.ts",
  "src/app/api/admin/blog/route.ts",
  "src/app/api/admin/coupons/route.ts",
  "src/app/api/admin/dashboard/route.ts",
  "src/app/api/admin/events/[id]/entries/route.ts",
  "src/app/api/admin/events/route.ts",
  "src/app/api/admin/faqs/route.ts",
  "src/app/api/admin/newsletter/[id]/route.ts",
  "src/app/api/admin/newsletter/route.ts",
  "src/app/api/admin/orders/route.ts",
  "src/app/api/admin/payouts/route.ts",
  "src/app/api/admin/payouts/weekly/route.ts",
  "src/app/api/admin/products/route.ts",
  "src/app/api/admin/reviews/route.ts",
  "src/app/api/admin/sessions/[id]/route.ts",
  "src/app/api/admin/sessions/revoke-user/route.ts",
  "src/app/api/admin/sessions/route.ts",
  "src/app/api/admin/stores/route.ts",
  "src/app/api/admin/users/route.ts",
  "src/app/api/auth/event/init/route.ts",
  "src/app/api/auth/forgot-password/route.ts",
  "src/app/api/auth/reset-password/route.ts",
  "src/app/api/auth/send-verification/route.ts",
  "src/app/api/auth/verify-email/route.ts",
  "src/app/api/cart/[itemId]/route.ts",
  "src/app/api/cart/merge/route.ts",
  "src/app/api/categories/[id]/route.ts",
  "src/app/api/checkout/preflight/route.ts",
  "src/app/api/checkout/route.ts",
  "src/app/api/contact/route.ts",
  "src/app/api/copilot/history/route.ts",
  "src/app/api/coupons/validate/route.ts",
  "src/app/api/faqs/route.ts",
  "src/app/api/media/crop/route.ts",
  "src/app/api/media/delete/route.ts",
  "src/app/api/media/trim/route.ts",
  "src/app/api/media/upload/route.ts",
  "src/app/api/newsletter/subscribe/route.ts",
  "src/app/api/notifications/[id]/route.ts",
  "src/app/api/notifications/read-all/route.ts",
  "src/app/api/notifications/route.ts",
  "src/app/api/notifications/unread-count/route.ts",
  "src/app/api/orders/[id]/invoice/route.ts",
  "src/app/api/payment/create-order/route.ts",
  "src/app/api/payment/event/init/route.ts",
  "src/app/api/payment/otp/request/route.ts",
  "src/app/api/payment/preorder/route.ts",
  "src/app/api/payment/verify/route.ts",
  "src/app/api/profile/[userId]/reviews/route.ts",
  "src/app/api/profile/[userId]/route.ts",
  "src/app/api/profile/add-phone/route.ts",
  "src/app/api/profile/delete-account/route.ts",
  "src/app/api/profile/verify-phone/route.ts",
  "src/app/api/promotions/route.ts",
  "src/app/api/realtime/bids/[id]/route.ts",
  "src/app/api/realtime/token/route.ts",
  "src/app/api/reviews/[id]/route.ts",
  "src/app/api/reviews/[id]/vote/route.ts",
  "src/app/api/seller/analytics/route.ts",
  "src/app/api/seller/coupons/route.ts",
  "src/app/api/seller/offers/route.ts",
  "src/app/api/seller/orders/[id]/ship/route.ts",
  "src/app/api/seller/orders/route.ts",
  "src/app/api/seller/payouts/route.ts",
  "src/app/api/seller/products/route.ts",
  "src/app/api/seller/store/addresses/route.ts",
  "src/app/api/seller/store/route.ts",
  "src/app/api/site-settings/route.ts",
  "src/app/api/user/addresses/route.ts",
  "src/app/api/user/change-password/route.ts",
  "src/app/api/user/offers/route.ts",
  "src/app/api/user/orders/[id]/cancel/route.ts",
  "src/app/api/user/orders/[id]/route.ts",
  "src/app/api/user/orders/route.ts",
  "src/app/api/user/sessions/route.ts",
  "src/app/api/user/wishlist/[productId]/route.ts",
  "src/app/api/user/wishlist/route.ts",
];

/**
 * Count { and } characters in a string, returning the net change in depth.
 * This is intentionally simple and will miscount { or } inside string
 * literals, but that rarely occurs in these handler files.
 */
function netDepth(str) {
  let d = 0;
  for (const ch of str) {
    if (ch === "{") d++;
    else if (ch === "}") d--;
  }
  return d;
}

function fixFile(absPath) {
  const original = readFileSync(absPath, "utf-8");
  const lines = original.split("\n");
  let changed = false;

  // ── Step 1: Replace side-effect provider import ──────────────────────────
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (
      t === 'import "@/providers.config";' ||
      t === "import '@/providers.config';" ||
      t === 'import "@/providers.config"' ||
      t === "import '@/providers.config'"
    ) {
      lines[i] = lines[i].replace(
        /import\s+["']@\/providers\.config["'];?/,
        'import { withProviders } from "@/providers.config";',
      );
      changed = true;
      break;
    }
  }

  // ── Step 2: Wrap handler exports with withProviders() ────────────────────
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match lines: export const X = createRouteHandler... or createApiHandler...
    if (!/^export const \w+ = create(?:Route|Api)Handler/.test(line)) continue;
    // Skip if already wrapped
    if (line.includes("withProviders(")) continue;

    // Insert `withProviders(` right before createRouteHandler / createApiHandler
    const fnMarker = line.includes("createRouteHandler")
      ? "createRouteHandler"
      : "createApiHandler";
    const fnPos = line.indexOf(fnMarker);
    lines[i] = line.slice(0, fnPos) + "withProviders(" + line.slice(fnPos);
    changed = true;

    // ── Find matching closing `});` using { } depth tracking ──────────────
    // Start depth count from the modified opening line
    let depth = netDepth(lines[i]);

    // If already closed on the same line (single-line handler) — unlikely but safe
    if (depth === 0) {
      // Replace the `}));` already on the line if it ends `});`
      lines[i] = lines[i].replace(/\}\);$/, "}));");
      continue;
    }

    let closed = false;
    for (let j = i + 1; j < lines.length; j++) {
      depth += netDepth(lines[j]);
      if (depth === 0) {
        const t = lines[j].trim();
        if (t === "});") {
          // Replace exactly `});` at the start of the line (preserving any leading whitespace)
          lines[j] = lines[j].replace(/\}\);/, "}));");
          closed = true;
        } else {
          console.warn(
            `  ⚠ depth=0 but unexpected line at ${absPath}:${j + 1}: "${lines[j]}"`,
          );
        }
        break;
      }
    }

    if (!closed) {
      console.warn(
        `  ⚠ Could not find closing for handler at ${absPath}:${i + 1}`,
      );
    }
  }

  if (changed) {
    writeFileSync(absPath, lines.join("\n"), "utf-8");
  }
  return changed;
}

// ── Main ─────────────────────────────────────────────────────────────────────
let fixed = 0;
let errors = 0;

for (const rel of AFFECTED_FILES) {
  const abs = join(ROOT, rel);
  try {
    if (fixFile(abs)) {
      console.log("✓", rel);
      fixed++;
    } else {
      console.log("- (no change):", rel);
    }
  } catch (e) {
    console.error("✗ ERROR:", rel, "-", e.message);
    errors++;
  }
}

console.log(
  `\nDone. Fixed ${fixed}/${AFFECTED_FILES.length} files.${errors ? ` ${errors} error(s).` : ""}`,
);
