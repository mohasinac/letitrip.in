#!/usr/bin/env node
/**
 * audit-settings-payload-parity — every `SiteSettingsDocument` group field the
 * admin form can SAVE must also be one it LOADS.
 *
 * ## The defect this exists for (D13, D19)
 *
 * `AdminSiteSettingsView` is one form over one document, saving through one
 * PUT. Its commissions payload omitted five keys —
 * `saleProtectionFeeEnabled`, `saleProtectionFeePercent`,
 * `saleProtectionFeeMin`, `codHandlingFeeCap`, `codHandlingFeePercent` — with
 * no state, no field and no control for any of them. Combined with
 * `updateSingleton` writing nested objects through Firestore's `update()`,
 * which REPLACES a nested map wholesale, the first save of any commissions
 * field DELETED all five: sale protection stopped being sold (3%, min ₹49)
 * and COD handling reverted to code defaults, with no error anywhere.
 *
 * `legalPages` had hit the same wall independently — `cancellation` and
 * `grievance` omitted from both halves — which is why the repository now
 * flattens to dotted paths. That fix makes an omission non-destructive.
 *
 * 🛑 BUT IT DOES NOT MAKE IT HARMLESS, and that is what this audit is for. A
 * field the form saves but never loads is still a live bug of a different
 * shape: the control renders with its DEFAULT, not the stored value, so an
 * admin opening the tab sees a figure that is not what is in force — and
 * saving writes that default over the real one. Dotted paths stop the
 * collateral damage to siblings; only parity stops the field lying about
 * itself.
 *
 * ## The rule
 *
 * For each group in `GROUPS`: every key in the save payload must appear in the
 * load block. The reverse is allowed — a loaded-but-unsaved key is a read-only
 * display, which is a deliberate and common choice.
 *
 * 🛑 Deliberately NOT checking "every schema field is in the form". Many
 * schema fields are intentionally not admin-editable (`credentials` is
 * encrypted and masked; `aboutContent` has its own tab). A rule demanding
 * total coverage would fail on correct code and get suppressed, which is
 * worse than no rule — see Root Cause #106's exemption list.
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VIEW = join(
  ROOT,
  "appkit/src/features/admin/components/AdminSiteSettingsView.tsx",
);

/**
 * Groups to check, and how to find each half.
 *
 * `payload` matches the object literal inside `buildFullPayload`; `load` is
 * the `s.<group>?.<key>` read in the hydrate effect. Both are read from the
 * same file, so this cannot drift from the thing it checks.
 */
const GROUPS = ["commissions", "legalPages", "emi", "gst", "shipping", "returns"];

const errors = [];

if (!existsSync(VIEW)) {
  console.error(`audit-settings-payload-parity: ${VIEW} not found`);
  process.exit(1);
}

const raw = readFileSync(VIEW, "utf8");
// Strip comments so a key named in prose cannot count as coverage — the
// mistake `audit-observability-registration` made on its first write.
const src = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

for (const group of GROUPS) {
  /*
   * The save half: `<group>: { a, b: x, c }` inside the payload. Brace-matched
   * rather than regex-terminated, because a nested object inside the group
   * (e.g. `watermark: { ... }`) would end a lazy match early and under-report.
   */
  const open = src.indexOf(`${group}: {`);
  if (open === -1) continue; // group not saved by this form at all — fine

  let depth = 0;
  let end = -1;
  for (let i = src.indexOf("{", open); i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) {
    errors.push(`${group}: could not brace-match the payload object — the audit cannot verify this group`);
    continue;
  }

  const body = src.slice(src.indexOf("{", open) + 1, end);
  const savedKeys = new Set();
  // Split only at depth 0 so `a: { b, c }` contributes `a`, not `b` and `c`.
  let d = 0;
  let cur = "";
  for (const ch of body) {
    if (ch === "{" || ch === "[" || ch === "(") d++;
    if (ch === "}" || ch === "]" || ch === ")") d--;
    if (ch === "," && d === 0) {
      cur = "";
      continue;
    }
    cur += ch;
    if (ch === "," && d === 0) cur = "";
  }
  for (const part of body.split(/,(?![^{[(]*[}\])])/)) {
    const m = /^\s*([A-Za-z_$][\w$]*)\s*(?::|$)/.exec(part);
    if (m) savedKeys.add(m[1]);
  }

  for (const key of savedKeys) {
    // The load half, in any of the spellings the file actually uses.
    const loaded =
      src.includes(`s.${group}?.${key}`) ||
      src.includes(`s.${group}.${key}`) ||
      src.includes(`settings.${group}?.${key}`) ||
      src.includes(`settings?.${group}?.${key}`);
    if (!loaded) {
      errors.push(
        `${group}.${key} is SAVED but never LOADED. ` +
          `The control renders its default rather than the stored value, so opening the tab shows a figure that is not in force — and saving writes that default over the real one. ` +
          `Add \`set…(s.${group}?.${key} ?? <default>)\` to the hydrate effect.`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error(`\n❌ audit-settings-payload-parity — ${errors.length} violation(s)\n`);
  for (const e of errors) console.error(`   • ${e}`);
  console.error(
    `\n   D13: five commissions keys were saved-but-unloaded AND destroyed on save.\n` +
      `   The repository now writes dotted paths, so an omission no longer destroys\n` +
      `   its siblings — but a saved-but-unloaded field still overwrites the stored\n` +
      `   value with a default. There is no suppression marker for this.\n`,
  );
  process.exit(1);
}

console.log("✅ audit-settings-payload-parity — clean");
