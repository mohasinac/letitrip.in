#!/usr/bin/env node
/**
 * gen-locale.js
 * Generates a messages/<locale>.json file from messages/en.json.
 *
 * Usage:
 *   node scripts/gen-locale.js <locale-code>
 *
 * The script walks all string values in en.json and replaces them using the
 * TRANSLATIONS map for the target locale. Keys not in the map fall back to
 * the English value.
 *
 * To add a new locale:
 *   1. Add a translation map under TRANSLATIONS['<code>'] below
 *   2. Add a locale section override under LOCALE_SECTIONS['<code>']
 *   3. Run: node scripts/gen-locale.js <code>
 *   4. Add '<code>' to src/i18n/routing.ts locales array
 *   5. Add the locale label to the "locale" section of every existing messages/*.json
 *
 * Current locale codes (custom — based on Indian state abbreviations):
 *   en  — English (default)
 *   in  — Hindi  (India)
 *   mh  — Marathi (Maharashtra)
 *   ts  — Telugu  (Telangana)
 *   tn  — Tamil   (Tamil Nadu)
 */

const fs = require("fs");
const path = require("path");

const MESSAGES_DIR = path.join(__dirname, "..", "messages");
const EN_SRC = path.join(MESSAGES_DIR, "en.json");

// ─── Translation Maps ─────────────────────────────────────────────────────────
// Each map: English value → translated value.
// Values absent from the map stay in English (safe fallback).

const TRANSLATIONS = {
  // ── tn — Tamil ──────────────────────────────────────────────────────────────
  // (tn.json was already fully translated — add overrides here if needed)
  tn: {},

  // ── in — Hindi ──────────────────────────────────────────────────────────────
  // (hi.json was already fully translated — add overrides here if needed)
  in: {},

  // ── mh — Marathi ────────────────────────────────────────────────────────────
  // (mr.json was already fully translated — add overrides here if needed)
  mh: {},

  // ── ts — Telugu ─────────────────────────────────────────────────────────────
  // (te.json was already fully translated — add overrides here if needed)
  ts: {},
};

// ─── Locale Section Overrides ─────────────────────────────────────────────────
// The "locale" section lists language names as shown in the switcher dropdown.
// Keys are locale codes; values are the native-language names.

const LOCALE_SECTIONS = {
  in: {
    label: "भाषा",
    switchTo: "भाषा बदलें",
    search: "भाषा खोजें",
    noResults: "कोई परिणाम नहीं",
    en: "English",
    in: "हिन्दी",
    mh: "मराठी",
    ts: "తెలుగు",
    tn: "தமிழ்",
  },
  mh: {
    label: "भाषा",
    switchTo: "भाषा बदला",
    search: "भाषा शोधा",
    noResults: "कोणतेही परिणाम नाहीत",
    en: "English",
    in: "हिन्दी",
    mh: "मराठी",
    ts: "తెలుగు",
    tn: "தமிழ்",
  },
  ts: {
    label: "భాష",
    switchTo: "భాష మార్చండి",
    search: "భాష వెతకండి",
    noResults: "ఫలితాలు లేవు",
    en: "English",
    in: "हिन्दी",
    mh: "मराठी",
    ts: "తెలుగు",
    tn: "தமிழ்",
  },
  tn: {
    label: "மொழி",
    switchTo: "மொழி மாற்று",
    search: "மொழி தேடு",
    noResults: "முடிவுகள் இல்லை",
    en: "English",
    in: "हिन्दी",
    mh: "मराठी",
    ts: "తెలుగు",
    tn: "தமிழ்",
  },
};

// ─── Engine ───────────────────────────────────────────────────────────────────

function translate(map, value) {
  if (typeof value !== "string") return value;
  return map[value] ?? value;
}

function walk(map, node) {
  if (Array.isArray(node)) return node.map((i) => walk(map, i));
  if (node && typeof node === "object") {
    return Object.fromEntries(
      Object.entries(node).map(([k, v]) => [k, walk(map, v)]),
    );
  }
  return translate(map, node);
}

function generate(localeCode) {
  const map = TRANSLATIONS[localeCode];
  if (map === undefined) {
    console.error(`No translation map for locale "${localeCode}".`);
    console.error(`Available: ${Object.keys(TRANSLATIONS).join(", ")}`);
    process.exit(1);
  }

  const src = JSON.parse(fs.readFileSync(EN_SRC, "utf8"));
  const result = walk(map, src);

  // Apply locale section override
  if (LOCALE_SECTIONS[localeCode]) {
    result.locale = LOCALE_SECTIONS[localeCode];
  }

  const dst = path.join(MESSAGES_DIR, `${localeCode}.json`);
  fs.writeFileSync(dst, JSON.stringify(result, null, 2), "utf8");

  const lines = fs.readFileSync(dst, "utf8").split("\n").length;
  console.log(`Written ${dst} (${lines} lines)`);
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

const [, , localeArg] = process.argv;
if (!localeArg) {
  console.error("Usage: node scripts/gen-locale.js <locale-code>");
  console.error(
    `Available locale maps: ${Object.keys(TRANSLATIONS).join(", ")}`,
  );
  process.exit(1);
}

generate(localeArg);
