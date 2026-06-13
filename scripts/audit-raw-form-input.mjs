#!/usr/bin/env node
/**
 * audit-raw-form-input.mjs — Enforce appkit form primitives
 *
 * Catches raw HTML form/input elements that should use appkit primitives:
 *   <form>      → <FormShell> (Zod-driven) or `useFormShellState()` for compact forms
 *   <input>     → <FieldInput> (FormShell-wired) or <Input> (low-level UI primitive)
 *   <select>    → <FieldSelect> or <PaginatedSelect> (>5 options)
 *   <textarea>  → <FieldTextarea>
 *
 * Why: raw forms bypass Zod validation, FormShell error context, dirty tracking,
 * label/aria wiring, i18n, and the ACTIONS-registry submit-button pattern.
 *
 * Per-line escape hatch: add `// audit-raw-form-input-ok: <reason>` on the same
 * line OR the line immediately before. Use only for genuinely-one-off cases
 * (e.g. a single uncontrolled search box where FormShell is overkill).
 *
 * Mode: strict-zero. Any violation without a suppression marker fails.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const DIRS = [
  join(ROOT, "appkit", "src"),
  join(ROOT, "src"),
];

const IGNORE_DIRS = ["node_modules", ".next", "dist", "__tests__", "scripts"];
const EXTENSIONS = [".tsx", ".jsx"];

// Files where raw HTML form/input is inherent to the implementation.
// Each entry MUST have a 1-line justification.
const ALLOWLIST = [
  // The form primitives themselves wrap raw HTML internally.
  "FormShell.tsx",
  "FieldInput.tsx",
  "FieldSelect.tsx",
  "FieldCheckbox.tsx",
  "FieldTextarea.tsx",
  "QuickFormDrawer.tsx",
  "Form.tsx",                  // <Form> canonical wrapper — owns the raw <form>
  "FormGrid.tsx",
  "FormField.tsx",
  // Low-level UI primitives that wrap raw <input> / <textarea>.
  "Input.tsx",
  "Textarea.tsx",
  "Select.tsx",
  "Toggle.tsx",
  "Checkbox.tsx",
  "PaginatedSelect.tsx",
  // Rich-text editor uses raw <input type=file> and contentEditable internally.
  "RichTextEditor.tsx",
  "RichTextRenderer.tsx",
  // Media editor / uploader internals.
  "ImageEditor.tsx",
  "ImageCropModal.tsx",
  "VideoTrimModal.tsx",
  "CameraCapture.tsx",
  "MediaUploadField.tsx",
  "ImageUpload.tsx",
  // Dev-only admin tooling.
  "SeedPanel.tsx",
  "DevToolbar.tsx",
];

// Per-line suppression marker. Place on same line or immediately preceding line.
// Supports both `// audit-raw-form-input-ok` and `{/* audit-raw-form-input-ok */}`
// (JSX comments are the usual form between JSX tags).
const SUPPRESS_RE = /(?:\/\/|\/\*)\s*audit-raw-form-input-ok\b/;

// ── Patterns ─────────────────────────────────────────────────────────────────
const RULES = [
  {
    id: "RAW_FORM",
    label: "Raw <form> (use <FormShell> with a Zod schema, or `useFormShellState()` for compact single-step forms)",
    regex: /<form(?:\s|>)/,
  },
  {
    id: "RAW_INPUT",
    label: "Raw <input> (use <FieldInput> for forms, or <Input> for low-level UI)",
    regex: /<input(?:\s|>)/,
  },
  {
    id: "RAW_SELECT",
    label: "Raw <select> (use <FieldSelect>, or <PaginatedSelect> if >5 options)",
    regex: /<select(?:\s|>)/,
  },
  {
    id: "RAW_TEXTAREA",
    label: "Raw <textarea> (use <FieldTextarea>)",
    regex: /<textarea(?:\s|>)/,
  },
];

// ── Scanner ──────────────────────────────────────────────────────────────────

function walkFiles(dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (IGNORE_DIRS.includes(entry)) continue;
    const stat = statSync(full, { throwIfNoEntry: false });
    if (!stat) continue;
    if (stat.isDirectory()) {
      results.push(...walkFiles(full));
    } else if (EXTENSIONS.some(ext => entry.endsWith(ext))) {
      if (ALLOWLIST.includes(entry)) continue;
      results.push(full);
    }
  }
  return results;
}

function isInsideComment(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*");
}

function isInsideString(line, matchIndex) {
  const before = line.slice(0, matchIndex);
  const single = (before.match(/'/g) || []).length;
  const double = (before.match(/"/g) || []).length;
  const back = (before.match(/`/g) || []).length;
  return (single % 2 !== 0) || (double % 2 !== 0) || (back % 2 !== 0);
}

const violations = {};
for (const rule of RULES) violations[rule.id] = [];

for (const dir of DIRS) {
  const files = walkFiles(dir);
  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isInsideComment(line)) continue;

      for (const rule of RULES) {
        const match = rule.regex.exec(line);
        if (!match) continue;
        if (isInsideString(line, match.index)) continue;

        // Per-line escape hatch: same line, previous line, or the line two
        // before (lets nested suppression markers — e.g. audit-hex-tokens-ok
        // sandwiched between the form marker and the JSX — still suppress).
        if (SUPPRESS_RE.test(line)) continue;
        if (i > 0 && SUPPRESS_RE.test(lines[i - 1])) continue;
        if (i > 1 && SUPPRESS_RE.test(lines[i - 2])) continue;

        const rel = relative(ROOT, file).replace(/\\/g, "/");
        violations[rule.id].push({
          file: rel,
          line: i + 1,
          text: line.trim().slice(0, 120),
        });
      }
    }
  }
}

// ── Report ───────────────────────────────────────────────────────────────────

let total = 0;
for (const rule of RULES) {
  const hits = violations[rule.id];
  total += hits.length;
  if (hits.length === 0) continue;
  console.error(`\n[${rule.id}] ${hits.length} violation(s) — ${rule.label}`);
  for (const v of hits.slice(0, 15)) {
    console.error(`  ${v.file}:${v.line} — ${v.text}`);
  }
  if (hits.length > 15) console.error(`  ... and ${hits.length - 15} more`);
}

console.log("");

if (total === 0) {
  console.log("audit-raw-form-input: clean ✓");
  process.exit(0);
}

console.error(`audit-raw-form-input: ${total} violation(s). Migrate to appkit form primitives, or add \`// audit-raw-form-input-ok: <reason>\` for legitimate exceptions.`);
process.exit(1);
