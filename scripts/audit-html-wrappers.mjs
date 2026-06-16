#!/usr/bin/env node
/**
 * audit-html-wrappers — raw HTML vs appkit primitives + redundant wrapper detector.
 *
 * Rules:
 *   RAW_HEADING   — <h1>–<h6> in component files; use <Heading> from appkit.
 *   RAW_PARAGRAPH — <p> in component files; use <Text> from appkit.
 *   RAW_SECTION   — <section> in component files; use <Section> from appkit.
 *   BARE_DIV      — <div> on its own line with no attributes; likely a redundant wrapper.
 *   RAW_DIV       — <div ...> with attributes in feature views; use <Div>/<Stack>/<Row>/<Container>
 *                   from appkit (baseline-drift: only regressions above current count block).
 *
 * Scans .tsx files in src/ and appkit/src/ (JSX component files only).
 * Skips: node_modules, .next, seed/, repositories/, scripts/, __tests__, configs/, *.d.ts,
 * ui/components (primitive implementations), _internal/server feature og.tsx (Satori OG images).
 * Exits 0 on clean, 1 on violations.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const SCAN_DIRS = [join(ROOT, "src"), join(ROOT, "appkit", "src")];

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  "seed",
  "repositories",
  "scripts",
  "__tests__",
  "__mocks__",
  "configs",
  "contracts",
  "validators",
]);
const SKIP_FILE_RE = /\.(d\.ts|test\.tsx?|spec\.tsx?)$/;
// Skip the UI primitive implementations — they define the wrappers themselves.
// Also skip Satori-rendered OG images (server/features/**/og.tsx, og-layout.tsx),
// ErrorBoundary files (must render before React tree is ready), and the
// shared Layout.tsx (defines Stack/Row/Container/Section/Grid themselves).
const SKIP_PATH_RE = /[/\\]ui[/\\](?:components|forms|rich-text)[/\\]|[/\\]ui[/\\]DataTable\.tsx$|[/\\]features[/\\]forms[/\\]|[/\\]features[/\\]email[/\\]|[/\\]_internal[/\\]server[/\\]features[/\\][^/\\]+[/\\]og(?:-layout)?\.tsx$|ErrorBoundary\.tsx$/;

const RULES = [
  {
    id: "RAW_HEADING",
    // Match <h1 through <h6 followed by space, >, or /
    re: /<h[1-6][\s>/]/,
    message: "Use <Heading> from appkit instead of raw heading tag (<h1>–<h6>)",
    fix: "import { Heading } from '@mohasinac/appkit'",
  },
  {
    id: "RAW_PARAGRAPH",
    // Match <p followed by space or > but not <pre, <progress, <param, <path
    re: /<p[\s>]/,
    exclude: /<p(?:re|ro|a|at|l|s|h)/,
    message: "Use <Text> from appkit instead of raw <p> tag",
    fix: "import { Text } from '@mohasinac/appkit'",
  },
  {
    id: "RAW_SECTION",
    re: /<section[\s>/]/,
    message: "Use <Section> from appkit instead of raw <section> tag",
    fix: "import { Section } from '@mohasinac/appkit'",
  },
  {
    id: "BARE_DIV",
    // <div> with no attributes on its own line — classic pointless wrapper
    re: /^\s*<div>\s*$/,
    message: "Bare <div> with no props — likely a redundant wrapper; use <> or <Div>/<Container>",
    fix: "Replace with React.Fragment <> or remove; use <Div>/<Container>/<Stack> from appkit for layout",
  },
  {
    id: "RAW_DIV",
    // <div with at least one attribute. Excludes <div> (caught by BARE_DIV) and </div>.
    re: /<div\s/,
    message: "Use <Div>/<Stack>/<Row>/<Container>/<Section> from appkit instead of raw <div ...>",
    fix: "Replace with appkit primitive: surface/padding/border props for chrome, Stack/Row for flex layouts, Grid for grids",
    baselineDrift: true,
  },
  {
    // Theme-aware gradient classes flow through `--appkit-gradient-*` tokens
    // and primitive variants (e.g. `<Section gradient="brand">`, `<Text
    // gradient="brand">`). Tailwind `bg-gradient-to-*` / `from-*` / `to-*`
    // bake the gradient colour into the className string, bypassing the
    // theme registry. Baseline-drift while the consumer sweep is in flight —
    // current count locks today; only regressions block.
    id: "RAW_GRADIENT_UTILITY",
    re: /\b(?:bg-gradient-to-(?:r|l|t|b|tr|tl|br|bl)|from-[a-z]+-\d+|to-[a-z]+-\d+|via-[a-z]+-\d+)\b/,
    message: "Raw Tailwind gradient utility bypasses theme tokens. Use a primitive variant (<Section gradient=…>, <Card variant=…>, <Text gradient=…>) backed by --appkit-gradient-*",
    fix: "Pick a catalogue gradient slot (brand, brand-tri, accent, page-header, section-warm, section-cool, section-mesh, accent-banner, promotion, spotlight, glass, card-*) and surface it through the primitive's variant prop",
    baselineDrift: true,
  },
  // RAW_MEDIA_URL is covered by `audit-firestore-storage-urls.mjs` (strict-zero).
  // RAW_BUTTON is owned by `audit-typography.mjs` (RAW_BUTTON rule there).
  // RAW_INPUT/SELECT/TEXTAREA/FORM are owned by `audit-raw-form-input.mjs`.
  // RAW_IMG is owned by `audit-raw-img-src.mjs`.
  // The rules below cover the remaining raw HTML tags that bypass the
  // catalogue's primitive surface. All baseline-drift so current state
  // locks today; regressions block. Drive each baseline to 0 in the sweep.
  {
    id: "RAW_SPAN",
    re: /<span\s/,
    message: "Use <Span> from appkit instead of raw <span ...>; pick `color`/`size`/`weight`/`gradient` variants",
    fix: "Replace with <Span color=… size=… weight=…> from @mohasinac/appkit",
    baselineDrift: true,
  },
  {
    id: "RAW_LIST",
    re: /<(?:ul|ol|li)\s/,
    message: "Use <Ul>/<Ol>/<Li> from appkit instead of raw list tags",
    fix: "Replace with <Ul>/<Ol>/<Li> from @mohasinac/appkit",
    baselineDrift: true,
  },
  {
    id: "RAW_TABLE",
    re: /<(?:table|thead|tbody|tfoot|tr|th|td)\s/,
    message: "Use <Table>/<Thead>/<Tbody>/<Tfoot>/<Tr>/<Th>/<Td> from appkit instead of raw table tags",
    fix: "Replace with the appkit table primitives",
    baselineDrift: true,
  },
  {
    id: "RAW_NAV_HEADER_FOOTER",
    re: /<(?:nav|header|footer|aside|main|article)\s/,
    message: "Use the appkit semantic primitive (<Nav>/<BlockHeader>/<BlockFooter>/<Aside>/<Main>/<Article>) instead of raw tags",
    fix: "Replace with the matching appkit semantic primitive",
    baselineDrift: true,
  },
  {
    id: "RAW_HR",
    re: /<hr[\s/>]/,
    message: "Use <HorizontalRule> from appkit instead of raw <hr>",
    fix: "Replace with <HorizontalRule tone=… spacing=…> from @mohasinac/appkit",
    baselineDrift: true,
  },
  {
    id: "RAW_INLINE_TEXT",
    re: /<(?:code|pre|blockquote|kbd|q)\s/,
    message: "Use the appkit primitive (<Code>/<Pre>/<Blockquote>/<Kbd>/<Quote>) instead of raw inline-text tags",
    fix: "Replace with the matching appkit primitive",
    baselineDrift: true,
  },
  {
    id: "RAW_DISCLOSURE",
    re: /<(?:details|summary|dialog)\s/,
    message: "Use <Details>/<Summary>/<Dialog> from appkit instead of raw disclosure tags",
    fix: "Replace with the matching appkit primitive",
    baselineDrift: true,
  },
  {
    id: "RAW_FIGURE",
    re: /<(?:figure|figcaption)\s/,
    message: "Use <Figure>/<Figcaption> from appkit instead of raw figure tags",
    fix: "Replace with the matching appkit semantic primitive",
    baselineDrift: true,
  },
  {
    id: "RAW_FIELDSET",
    re: /<(?:fieldset|legend)\s/,
    message: "Use <Fieldset>/<Legend> from appkit instead of raw fieldset tags",
    fix: "Replace with <Fieldset tone=…><Legend>… from @mohasinac/appkit",
    baselineDrift: true,
  },
  {
    id: "RAW_LABEL",
    re: /<label\s/,
    message: "Use <Label> from appkit instead of raw <label> (form fields use <FieldInput>/etc. which include labels)",
    fix: "Replace with <Label required={…}>… from @mohasinac/appkit",
    baselineDrift: true,
  },
  {
    id: "RAW_ANCHOR",
    re: /<a\s/,
    message: "Use <TextLink> (internal Next.js routes) or <Anchor> (external / mailto / tel) instead of raw <a>",
    fix: "Replace with <TextLink> for internal navigation or <Anchor> for external URLs",
    baselineDrift: true,
  },
  {
    id: "RAW_MEDIA_EMBED",
    re: /<(?:audio|video|iframe|picture)\s/,
    message: "Use the appkit media primitive (<MediaAudio>/<MediaVideo>/<Iframe>/<MediaImage sources=…>) instead of raw media embed tags",
    fix: "Replace with the matching appkit primitive — bytes flow through the /api/media proxy",
    baselineDrift: true,
  },
];

function walk(dir, files = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (extname(entry.name) === ".tsx" && !SKIP_FILE_RE.test(entry.name) && !SKIP_PATH_RE.test(full)) {
      files.push(full);
    }
  }
  return files;
}

const violations = [];

for (const dir of SCAN_DIRS) {
  for (const file of walk(dir)) {
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip comments and import lines
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) continue;
      if (trimmed.startsWith("import ")) continue;

      for (const rule of RULES) {
        if (!rule.re.test(line)) continue;
        if (rule.exclude && rule.exclude.test(line)) continue;
        violations.push({
          rule: rule.id,
          file: relative(ROOT, file),
          line: i + 1,
          text: trimmed.slice(0, 100),
          message: rule.message,
          fix: rule.fix,
          baselineDrift: !!rule.baselineDrift,
        });
        // First-match wins per line: BARE_DIV and RAW_DIV are mutually exclusive
        // (different regexes), but if a future rule overlaps we don't want
        // double-counting.
        break;
      }
    }
  }
}

// Per-rule baselines. Rules without an entry default to 0 (hard-block on any).
// RAW_DIV is on a baseline-drift policy: today's count is the cap; lower is fine,
// higher fails. Drive this down to 0 as feature views adopt <Div>/<Stack>/<Row>.
const BASELINES = {
  RAW_HEADING: 0,
  RAW_PARAGRAPH: 0,
  RAW_SECTION: 0,
  BARE_DIV: 0,
  // RAW_DIV baseline = current count of raw <div ...> in feature views.
  // Tightened 2026-05-30 (Phase D7/E1 final — all remaining admin editor divs): 0 actual. LOCKED.
  // Any new <div className="..."> in feature views is a regression — use appkit primitives:
  //   - flex/grid layouts → <Stack>/<Row>/<Grid>
  //   - bordered/padded chrome → <Div surface=... padding=... border=...>
  //   - page-level wrappers → <Container>/<Section>
  RAW_DIV: 0,
  // RAW_GRADIENT_UTILITY baseline = current count of raw Tailwind gradient
  // utilities. Locked 2026-06-14 with the theme-system rollout; drive to 0
  // as feature views switch to `<Section gradient=…>`, `<Card variant=…>`,
  // `<Text gradient=…>` and the catalogue gradient slots.
  RAW_GRADIENT_UTILITY: 45,
  // Variant-catalogue raw-tag baselines — locked 2026-06-14. Drive each
  // to 0 in the consumer sweep (the audit will let you tighten the number
  // every time the count drops).
  RAW_SPAN: 0,
  RAW_LIST: 124,
  RAW_TABLE: 0,
  RAW_NAV_HEADER_FOOTER: 0,
  RAW_HR: 0,
  RAW_INLINE_TEXT: 86,
  RAW_DISCLOSURE: 0,
  RAW_FIGURE: 0,
  RAW_FIELDSET: 0,
  RAW_LABEL: 0,
  RAW_ANCHOR: 20,
  RAW_MEDIA_EMBED: 0,
};

const hardBlocking = violations.filter((v) => !v.baselineDrift);
const drift = violations.filter((v) => v.baselineDrift);

const driftByRule = new Map();
for (const v of drift) {
  driftByRule.set(v.rule, (driftByRule.get(v.rule) || 0) + 1);
}

const regressions = [];
for (const [rule, count] of driftByRule) {
  const baseline = BASELINES[rule] ?? 0;
  if (count > baseline) regressions.push({ rule, count, baseline, over: count - baseline });
}

if (hardBlocking.length === 0 && regressions.length === 0) {
  // Report drift status (informational, not blocking)
  const driftStatus = [...driftByRule.entries()]
    .map(([r, c]) => `${r}=${c}/${BASELINES[r] ?? 0}`)
    .join(", ");
  console.log(`audit-html-wrappers: clean ✓${driftStatus ? ` (drift: ${driftStatus})` : ""}`);
  process.exit(0);
}

// Group by rule for readable output
const byRule = Map.groupBy
  ? Map.groupBy(violations, (v) => v.rule)
  : violations.reduce((m, v) => { m.set(v.rule, [...(m.get(v.rule) || []), v]); return m; }, new Map());

const out = [];
for (const [rule, vs] of byRule) {
  const baseline = BASELINES[rule] ?? 0;
  const status = vs[0].baselineDrift
    ? (vs.length > baseline ? ` — REGRESSION (baseline ${baseline}, +${vs.length - baseline})` : ` — within baseline ${baseline}`)
    : "";
  out.push(`[${rule}] ${vs[0].message} (${vs.length} instance${vs.length === 1 ? "" : "s"})${status}`);
  out.push(`  Fix: ${vs[0].fix}`);
  // Only print sample lines when this rule is actually blocking
  const blocking = !vs[0].baselineDrift || vs.length > baseline;
  if (blocking) {
    for (const v of vs.slice(0, 8)) {
      out.push(`  ${v.file}:${v.line}  ${v.text}`);
    }
    if (vs.length > 8) out.push(`  … and ${vs.length - 8} more`);
  }
  out.push("");
}

if (hardBlocking.length === 0 && regressions.length === 0) {
  process.stdout.write(out.join("\n"));
  process.exit(0);
}

process.stderr.write(out.join("\n") + "\n");
if (hardBlocking.length > 0) {
  process.stderr.write(`audit-html-wrappers: ${hardBlocking.length} hard-blocking violation(s).\n`);
}
for (const r of regressions) {
  process.stderr.write(`audit-html-wrappers: ${r.rule} regressed +${r.over} above baseline ${r.baseline} (now ${r.count}).\n`);
}
process.exit(1);
