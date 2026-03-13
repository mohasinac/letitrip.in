#!/usr/bin/env node
/**
 * check-violations.js
 *
 * Scans src/ for violations of architectural and code-quality rules defined in
 * .github/instructions/*.instructions.md
 *
 * Run:   node scripts/check-violations.js
 * Output: violations.json at the project root
 *
 * ─── HOW TO ADD A NEW RULE ──────────────────────────────────────────────────
 * Append an entry to the RULES array (search for "RULES = [" below).
 * Each entry must have:
 *   code        – unique violation code, e.g. "ARCH-005"
 *   name        – short human-readable name
 *   description – what the rule forbids and why
 *   ruleRef     – instruction file + rule number that defines it
 *   fileFilter  – (filePath: string) => boolean  — which files to scan
 *   check       – (filePath, lines, rawLines) => ViolationResult[]
 *                  lines    = preprocessed (block-comments removed, // stripped)
 *                  rawLines = original file lines (used for snippet output)
 * ────────────────────────────────────────────────────────────────────────────
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src");
const OUTPUT = path.join(ROOT, "violations.json");

// ─── File & Path Helpers ────────────────────────────────────────────────────

function relPath(p) {
  return path.relative(ROOT, p).replace(/\\/g, "/");
}

function norm(p) {
  return p.replace(/\\/g, "/");
}

/** Recursively collect files with the given extensions, skipping noise dirs. */
function walkDir(dir, extensions) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    // Skip noise directories (including node_modules at any depth)
    if (fs.statSync(full).isDirectory()) {
      if (
        ![
          "node_modules",
          ".next",
          ".git",
          "dist",
          "build",
          "coverage",
          ".turbo",
        ].includes(item) &&
        !norm(full).includes("/node_modules/")
      ) {
        results.push(...walkDir(full, extensions));
      }
    } else if (
      extensions.some((e) => full.endsWith(e)) &&
      !norm(full).includes("/node_modules/")
    ) {
      results.push(full);
    }
  }
  return results;
}

// ─── Content Preprocessing ─────────────────────────────────────────────────

/**
 * Remove block comments  /* … * /  (including JSX {/* … *\/})
 * while preserving line count so line numbers stay accurate.
 */
function removeBlockComments(content) {
  return content.replace(/\/\*[\s\S]*?\*\//g, (match) =>
    match.replace(/[^\n]/g, " "),
  );
}

/**
 * Strip the // comment portion from a single line.
 * Tries not to remove // that appears inside a string literal.
 */
function stripLineComment(line) {
  const idx = line.indexOf("//");
  if (idx === -1) return line;
  const before = line.substring(0, idx);
  const sq = (before.match(/'/g) || []).length % 2;
  const dq = (before.match(/"/g) || []).length % 2;
  const bt = (before.match(/`/g) || []).length % 2;
  return sq || dq || bt ? line : line.substring(0, idx);
}

// ─── Context Classifiers ────────────────────────────────────────────────────

const isTestFile = (p) =>
  /\/__tests__\/|\/__mocks__\/|\.test\.[tj]sx?$|\.spec\.[tj]sx?$/.test(norm(p));
const isApiRoute = (p) => norm(p).includes("/app/api/");
const isLibDir = (p) => norm(p).includes("/src/lib/");
const isUtilsDir = (p) =>
  norm(p).includes("/src/utils/") || norm(p).includes("/src/helpers/");
const isHookFile = (p) => /\/hooks\/[^/]+\.[tj]sx?$/.test(norm(p));
const isContextFile = (p) => norm(p).includes("/src/contexts/");
const isFeatureFile = (p) => norm(p).includes("/src/features/");
const isI18nFile = (p) => norm(p).includes("/src/i18n/");
const isScriptFile = (p) =>
  norm(p).startsWith(norm(path.join(ROOT, "scripts/")));
/** Repositories are server-side by design (RULE-12 requires them); allow Admin SDK. */
const isRepositoryFile = (p) => norm(p).includes("/src/repositories/");
/** Next.js App Router server files outside api/ (sitemap, robots, manifest, etc.) */
const isAppServerFile = (p) => {
  const n = norm(p);
  return (
    n.includes("/src/app/") &&
    !isApiRoute(p) &&
    !n.endsWith("page.tsx") &&
    !n.endsWith("layout.tsx") &&
    !n.endsWith("error.tsx") &&
    !n.endsWith("loading.tsx")
  );
};
/** Snippet files are code-template examples, not production code */
const isSnippetFile = (p) => norm(p).includes("/src/snippets/");
/** Core singleton classes (Logger, EventBus) that are transport/infrastructure */
const isCoreClassFile = (p) => {
  const n = norm(p);
  return (
    n.includes("/src/classes/Logger.ts") ||
    n.includes("/src/classes/EventBus.ts") ||
    n.includes("/src/db/")
  );
};

function isSharedTierFile(p) {
  const n = norm(p);
  return (
    n.includes("/src/components/") ||
    n.includes("/src/hooks/") ||
    n.includes("/src/utils/") ||
    n.includes("/src/helpers/") ||
    n.includes("/src/classes/")
  );
}

function isPageFile(p) {
  const n = norm(p);
  return /\/app\/\[locale\]\//.test(n) && n.endsWith("/page.tsx");
}

function getFeatureName(p) {
  const m = norm(p).match(/\/features\/([^/]+)\//);
  return m ? m[1] : null;
}

// ─── Rule Metadata (severity + autoFixable) ────────────────────────────────
// severity:    'error'   — breaks behaviour / architecture
//              'warning' — clear rule break, not immediately runtime-breaking
//              'info'    — style / convention preference
// autoFixable: true when fix-violations.js has a safe mechanical fixer

const RULE_META = {
  "ARCH-001": { severity: "warning", autoFixable: true },
  "ARCH-002": { severity: "error", autoFixable: false },
  "ARCH-003": { severity: "warning", autoFixable: false },
  "ARCH-004": { severity: "error", autoFixable: false },
  "I18N-001": { severity: "error", autoFixable: true },
  "I18N-002": { severity: "error", autoFixable: true },
  "I18N-003": { severity: "error", autoFixable: false },
  "FIREBASE-001": { severity: "error", autoFixable: false },
  "FIREBASE-002": { severity: "error", autoFixable: false },
  "FIREBASE-003": { severity: "error", autoFixable: false },
  "FIREBASE-004": { severity: "error", autoFixable: false },
  "SVC-001": { severity: "error", autoFixable: false },
  "SVC-002": { severity: "error", autoFixable: false },
  "SVC-003": { severity: "warning", autoFixable: false },
  "COMP-001": { severity: "warning", autoFixable: false },
  "COMP-002": { severity: "warning", autoFixable: false },
  "COMP-003": { severity: "warning", autoFixable: false },
  "COMP-004": { severity: "warning", autoFixable: false },
  "COMP-005": { severity: "warning", autoFixable: false },
  "COMP-006": { severity: "warning", autoFixable: false },
  "COMP-007": { severity: "warning", autoFixable: false },
  "COMP-008": { severity: "warning", autoFixable: false },
  "COMP-009": { severity: "warning", autoFixable: false },
  "MEDIA-001": { severity: "warning", autoFixable: false },
  "MEDIA-002": { severity: "warning", autoFixable: false },
  "MEDIA-003": { severity: "warning", autoFixable: false },
  "MEDIA-004": { severity: "info", autoFixable: false },
  "QUAL-001": { severity: "warning", autoFixable: false },
  "QUAL-002": { severity: "error", autoFixable: false },
  "QUAL-003": { severity: "info", autoFixable: false },
  "QUAL-004": { severity: "error", autoFixable: false },
  "CNST-001": { severity: "warning", autoFixable: false },
  "CNST-002": { severity: "info", autoFixable: false },
  "CNST-003": { severity: "error", autoFixable: false },
  "STYL-001": { severity: "info", autoFixable: false },
  "STYL-002": { severity: "info", autoFixable: false },
  "STYL-003": { severity: "info", autoFixable: false },
};

// ─── Rule Definitions ───────────────────────────────────────────────────────
// To add a new rule: append an object to RULES and add its code to RULE_META.

const RULES = [
  // ══════════════════════════════════════════════════════════════════════════
  // ARCHITECTURE (ARCH)
  // ══════════════════════════════════════════════════════════════════════════

  {
    code: "ARCH-001",
    name: "Deep non-barrel import",
    description:
      "Must import from barrel exports (index.ts) only. " +
      "Never import from sub-paths like @/components/ui/Button or @/utils/validators/email.",
    ruleRef: "rules-architecture.instructions.md — RULE 2",
    fileFilter: (p) =>
      (p.endsWith(".ts") || p.endsWith(".tsx")) &&
      !isTestFile(p) &&
      !isScriptFile(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      // Known intentional exceptions: modules that use Node.js built-ins and
      // are explicitly documented as "import directly" in their barrel comment.
      const ALLOWED_DEEP_IMPORTS = [
        "@/helpers/data/sieve.helper", // requires node:url — intentionally excluded from barrel
      ];
      // Barrel paths allowed: @/components, @/hooks, @/utils, @/helpers,
      // @/classes, @/services, @/constants, @/repositories, @/types, @/contexts, @/db/schema, @/lib/errors
      const deepImport =
        /from\s+['"](@\/(?:components|hooks|utils|helpers|classes|services|constants|repositories)\/[^'"]+)['"]/g;
      lines.forEach((line, i) => {
        let m;
        while ((m = deepImport.exec(line)) !== null) {
          if (ALLOWED_DEEP_IMPORTS.includes(m[1])) {
            // Do NOT reset lastIndex here — exec() already advanced past this
            // match. Resetting would cause an infinite loop on the same match.
            continue;
          }
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message: `Deep import '${m[1]}' — use the barrel index instead`,
            snippet: rawLines[i].trim(),
          });
        }
        deepImport.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "ARCH-002",
    name: "Cross-feature import",
    description:
      "Feature modules must not import from other features. " +
      "Elevate shared logic to Tier-1 (src/components, src/hooks, src/utils…).",
    ruleRef: "rules-architecture.instructions.md — RULE 1",
    fileFilter: (p) =>
      isFeatureFile(p) &&
      (p.endsWith(".ts") || p.endsWith(".tsx")) &&
      !isTestFile(p),
    check(filePath, lines, rawLines) {
      const thisFeature = getFeatureName(filePath);
      if (!thisFeature) return [];
      const violations = [];
      const featureImport = /from\s+['"]@\/features\/([^/'"]+)['"]/g;
      lines.forEach((line, i) => {
        let m;
        while ((m = featureImport.exec(line)) !== null) {
          if (m[1] !== thisFeature) {
            violations.push({
              line: i + 1,
              col: m.index + 1,
              message: `Feature '${thisFeature}' imports from '${m[1]}' — cross-feature imports are forbidden`,
              snippet: rawLines[i].trim(),
            });
          }
        }
        featureImport.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "ARCH-003",
    name: "Page file exceeds 150 lines",
    description:
      "Page components (page.tsx) must be thin shells (≤150 non-empty lines). " +
      "Extract logic to src/features/<name>/components/<Domain>View.tsx.",
    ruleRef: "rules-architecture.instructions.md — RULE 9 & 10",
    fileFilter: isPageFile,
    check(filePath, lines, rawLines) {
      const nonEmpty = rawLines.filter((l) => l.trim().length > 0).length;
      if (nonEmpty > 150) {
        return [
          {
            line: 1,
            col: 1,
            message: `Page has ${nonEmpty} non-empty lines — max is 150`,
            snippet: `${nonEmpty} non-empty lines`,
          },
        ];
      }
      return [];
    },
  },

  {
    code: "ARCH-004",
    name: "Shared tier imports from features",
    description:
      "Components, hooks, utils, helpers and classes (Tier-1) must NOT import from feature modules.",
    ruleRef: "rules-architecture.instructions.md — RULE 1",
    fileFilter: (p) =>
      isSharedTierFile(p) &&
      (p.endsWith(".ts") || p.endsWith(".tsx")) &&
      !isTestFile(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      const featureImport = /from\s+['"](@\/features\/[^'"]+)['"]/g;
      lines.forEach((line, i) => {
        let m;
        while ((m = featureImport.exec(line)) !== null) {
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message: `Shared tier imports '${m[1]}' — Tier-1 must not depend on features`,
            snippet: rawLines[i].trim(),
          });
        }
        featureImport.lastIndex = 0;
      });
      return violations;
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // i18n  (I18N)
  // ══════════════════════════════════════════════════════════════════════════

  {
    code: "I18N-001",
    name: "useRouter / usePathname / redirect from next/navigation",
    description:
      "Navigation hooks must be imported from @/i18n/navigation, not next/navigation, " +
      "so locale-aware routing is applied automatically.",
    ruleRef: "rules-strings-i18n.instructions.md — RULE 33.3",
    fileFilter: (p) =>
      (p.endsWith(".ts") || p.endsWith(".tsx")) &&
      !isTestFile(p) &&
      !isApiRoute(p) &&
      !isI18nFile(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      const pat = /from\s+['"]next\/navigation['"]/g;
      lines.forEach((line, i) => {
        if (
          pat.test(line) &&
          /\b(useRouter|usePathname|redirect)\b/.test(line)
        ) {
          violations.push({
            line: i + 1,
            col: 1,
            message:
              "Import useRouter/usePathname/redirect from @/i18n/navigation, not next/navigation",
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "I18N-002",
    name: "Link from next/link instead of @/i18n/navigation",
    description:
      "The Next.js <Link> must be imported from @/i18n/navigation to enable locale-prefixed routing.",
    ruleRef: "rules-strings-i18n.instructions.md — RULE 33.3",
    fileFilter: (p) =>
      p.endsWith(".tsx") && !isTestFile(p) && !isApiRoute(p) && !isI18nFile(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      const pat = /from\s+['"]next\/link['"]/g;
      lines.forEach((line, i) => {
        if (pat.test(line)) {
          violations.push({
            line: i + 1,
            col: 1,
            message: "Import Link from @/i18n/navigation, not next/link",
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "I18N-003",
    name: "useTranslations called outside component function",
    description:
      "useTranslations() must be called inside a component function body — never at module scope or conditionally.",
    ruleRef: "rules-strings-i18n.instructions.md — RULE 33.1",
    fileFilter: (p) => p.endsWith(".tsx") && !isTestFile(p) && !isApiRoute(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      // Detect useTranslations at column 0 (module scope) — inside a function it would be indented
      const pat = /^const\s+\w+\s*=\s*useTranslations\s*\(/;
      lines.forEach((line, i) => {
        if (pat.test(line)) {
          violations.push({
            line: i + 1,
            col: 1,
            message:
              "useTranslations() called at module scope — must be inside the component function body",
            snippet: rawLines[i].trim(),
          });
        }
      });
      return violations;
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // FIREBASE  (FIREBASE)
  // ══════════════════════════════════════════════════════════════════════════

  {
    code: "FIREBASE-001",
    name: "Firebase client SDK in UI code",
    description:
      "firebase/auth, firebase/firestore, and firebase/storage must NOT be imported in UI code. " +
      "Only the Realtime DB client listener pattern is allowed client-side.",
    ruleRef: "rules-firebase.instructions.md — RULE 11",
    fileFilter: (p) =>
      (p.endsWith(".ts") || p.endsWith(".tsx")) &&
      !isTestFile(p) &&
      !isApiRoute(p) &&
      !isLibDir(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      // firebase/auth is allowed when used exclusively for RTDB custom-token auth
      // (signInWithCustomToken / getAuth with realtimeApp) — see RULE 11 RTDB pattern.
      const RTDB_AUTH_ONLY_SYMBOLS =
        /\b(signInWithCustomToken|signOut|getAuth)\b/;
      const pat = /from\s+['"]firebase\/(auth|firestore|storage)['"]/g;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let m;
        while ((m = pat.exec(line)) !== null) {
          // Allow firebase/auth when it's only for RTDB custom-token auth (signInWithCustomToken)
          if (m[1] === "auth") {
            const context = rawLines
              .slice(Math.max(0, i - 2), Math.min(rawLines.length, i + 15))
              .join("\n");
            if (
              RTDB_AUTH_ONLY_SYMBOLS.test(context) &&
              /realtimeApp/.test(context)
            )
              continue;
          }
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message: `firebase/${m[1]} must not be imported in UI code — use API routes with Admin SDK`,
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      }
      return violations;
    },
  },

  {
    code: "FIREBASE-002",
    name: "@/lib/firebase/config in UI code",
    description:
      "The Firebase client config must not be imported in components, hooks, features, contexts, or pages.",
    ruleRef: "rules-firebase.instructions.md — RULE 11",
    fileFilter: (p) =>
      (p.endsWith(".ts") || p.endsWith(".tsx")) &&
      !isTestFile(p) &&
      !isApiRoute(p) &&
      !isLibDir(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      const pat = /from\s+['"][^'"]*lib\/firebase\/config['"]/g;
      lines.forEach((line, i) => {
        if (pat.test(line)) {
          violations.push({
            line: i + 1,
            col: 1,
            message:
              "@/lib/firebase/config must not be imported outside src/app/api/ or src/lib/",
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "FIREBASE-003",
    name: "Firebase Admin SDK outside api/ or lib/",
    description:
      "getAdminDb, getAdminAuth, getAdminStorage must only be imported in src/app/api/** and src/lib/**.",
    ruleRef: "rules-firebase.instructions.md — RULE 11",
    // Repositories and Next.js server-side app files legitimately use the Admin SDK.
    // Server Actions (src/actions/) are also server-side and may use the Admin SDK.
    fileFilter: (p) =>
      (p.endsWith(".ts") || p.endsWith(".tsx")) &&
      !isTestFile(p) &&
      !isApiRoute(p) &&
      !isLibDir(p) &&
      !isRepositoryFile(p) &&
      !isAppServerFile(p) &&
      !norm(p).includes("/src/actions/"),
    check(filePath, lines, rawLines) {
      const violations = [];
      const pat = /from\s+['"][^'"]*lib\/firebase\/admin['"]/g;
      lines.forEach((line, i) => {
        if (pat.test(line)) {
          violations.push({
            line: i + 1,
            col: 1,
            message:
              "Firebase Admin SDK must not be imported outside src/app/api/ or src/lib/",
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "FIREBASE-004",
    name: "Direct Firestore query in API route (bypasses repository)",
    description:
      "API routes must query Firestore via repositories from @/repositories, never via getDocs/getDoc/addDoc directly.",
    ruleRef: "rules-firebase.instructions.md — RULE 12",
    fileFilter: (p) =>
      isApiRoute(p) && (p.endsWith(".ts") || p.endsWith(".tsx")),
    check(filePath, lines, rawLines) {
      const violations = [];
      // Only flag standalone client-SDK calls (not Admin SDK method chains like db.collection(...))
      const pat =
        /(?<!\.)\b(getDocs|getDoc|addDoc|setDoc|updateDoc|deleteDoc|query)\s*\(/g;
      lines.forEach((line, i) => {
        let m;
        while ((m = pat.exec(line)) !== null) {
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message: `${m[1]}() is a direct Firestore call — use a repository from @/repositories instead`,
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SERVICE LAYER  (SVC)
  // ══════════════════════════════════════════════════════════════════════════

  {
    code: "SVC-001",
    name: "Direct fetch() in UI code",
    description:
      "fetch() must not be called in components, hooks, contexts, or pages. " +
      "Reads use apiClient in a hook queryFn. Mutations use Server Actions.",
    ruleRef: "rules-services.instructions.md — RULE 20 & 21",
    fileFilter: (p) => {
      const n = norm(p);
      return (
        (p.endsWith(".ts") || p.endsWith(".tsx")) &&
        !isTestFile(p) &&
        !isApiRoute(p) &&
        !isLibDir(p) &&
        !isSnippetFile(p) &&
        !isCoreClassFile(p)
      );
    },
    check(filePath, lines, rawLines) {
      const violations = [];
      // Match fetch( but not useFetch( or prefetch(
      const pat = /(?<![A-Za-z])fetch\s*\(/g;
      lines.forEach((line, i) => {
        let m;
        while ((m = pat.exec(line)) !== null) {
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message:
              "Direct fetch() in UI code — use apiClient in a hook queryFn instead",
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "SVC-002",
    name: "apiClient used in component or page",
    description:
      "apiClient must not be called in components (.tsx) or page files. " +
      "Use apiClient inside a hook queryFn (src/hooks/ or src/features/<name>/hooks/). " +
      "Mutations must use Server Actions, not apiClient.",
    ruleRef: "rules-services.instructions.md — RULE 20 & 21",
    fileFilter: (p) => {
      const n = norm(p);
      // Only flag .tsx component files that are NOT hooks or contexts or lib
      return (
        (p.endsWith(".tsx") || p.endsWith(".ts")) &&
        !isTestFile(p) &&
        !isApiRoute(p) &&
        !isLibDir(p) &&
        !isHookFile(p) &&
        !isContextFile(p)
      );
    },
    check(filePath, lines, rawLines) {
      const violations = [];
      const usagePat = /\bapiClient\./g;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const hasUsage = usagePat.test(line);
        usagePat.lastIndex = 0;
        if (hasUsage) {
          violations.push({
            line: i + 1,
            col: 1,
            message:
              "apiClient must not be called in components or pages — use a hook instead",
            snippet: rawLines[i].trim(),
          });
        }
      }
      return violations;
    },
  },

  {
    code: "SVC-003",
    name: "Hardcoded API path in hook",
    description:
      'apiClient calls must use API_ENDPOINTS from @/constants — never hardcode strings like "/api/products".',
    ruleRef:
      "rules-services.instructions.md — RULE 20 & 21 / rules-constants.instructions.md — RULE 19",
    fileFilter: (p) => (isHookFile(p) || isContextFile(p)) && !isTestFile(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      // apiClient.get('/api/...')  or  apiClient.post("/api/...")
      const pat = /apiClient\.\w+\s*\(\s*['"](\/api\/[^'"]+)['"]/g;
      lines.forEach((line, i) => {
        let m;
        while ((m = pat.exec(line)) !== null) {
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message: `Hardcoded API path '${m[1]}' — use API_ENDPOINTS from @/constants`,
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // COMPONENTS — RAW HTML TAGS  (COMP)
  // ══════════════════════════════════════════════════════════════════════════

  {
    code: "COMP-001",
    name: "Raw HTML heading tag",
    description:
      "Never use <h1>–<h6> in TSX. Use <Heading level={N}> from @/components.",
    ruleRef: "rules-components.instructions.md — RULE 7 & 8",
    fileFilter: (p) => p.endsWith(".tsx") && !isTestFile(p) && !isApiRoute(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      const pat = /<h([1-6])[\s>/]/g;
      lines.forEach((line, i) => {
        let m;
        while ((m = pat.exec(line)) !== null) {
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message: `Raw <h${m[1]}> — use <Heading level={${m[1]}}>`,
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "COMP-002",
    name: "Raw HTML paragraph tag",
    description: "Never use <p> in TSX. Use <Text> from @/components.",
    ruleRef: "rules-components.instructions.md — RULE 7 & 8",
    fileFilter: (p) => p.endsWith(".tsx") && !isTestFile(p) && !isApiRoute(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      // <p> or <p  but NOT <progress, <pre, <path etc.
      const pat = /<p[\s>/]/g;
      lines.forEach((line, i) => {
        let m;
        while ((m = pat.exec(line)) !== null) {
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message: "Raw <p> tag — use <Text> from @/components",
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "COMP-003",
    name: "Raw HTML label tag",
    description: "Never use <label> in TSX. Use <Label> from @/components.",
    ruleRef: "rules-components.instructions.md — RULE 7 & 8",
    fileFilter: (p) => p.endsWith(".tsx") && !isTestFile(p) && !isApiRoute(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      // Exclude form primitive implementations (Checkbox wraps <label> intentionally)
      const n = norm(filePath);
      if (n.includes("/src/components/forms/")) return violations;
      // Use rawLines (not lowercased) so <Label> (React component) is not falsely flagged;
      // skip JSDoc/block-comment content lines (start with optional space + *)
      const pat = /<label[\s>/]/g;
      rawLines.forEach((line, i) => {
        if (/^\s*\*/.test(line)) return; // skip JSDoc comment lines
        const cleaned = line.replace(/\/\*.*?\*\//g, "").replace(/\/\/.*/g, "");
        let m;
        while ((m = pat.exec(cleaned)) !== null) {
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message: "Raw <label> — use <Label> from @/components",
            snippet: line.trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "COMP-004",
    name: "Raw HTML anchor tag",
    description:
      "Never use <a href> in TSX. Use <TextLink href={...}> from @/components.",
    ruleRef: "rules-components.instructions.md — RULE 7 & 8",
    fileFilter: (p) => p.endsWith(".tsx") && !isTestFile(p) && !isApiRoute(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      // <a> or <a  — not <abbr, <acronym
      const pat = /<a[\s>]/g;
      lines.forEach((line, i) => {
        let m;
        while ((m = pat.exec(line)) !== null) {
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message:
              "Raw <a> tag — use <TextLink href={...}> from @/components",
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "COMP-005",
    name: "Raw HTML button tag",
    description:
      'Never use <button> in TSX. Use <Button variant="..."> from @/components.',
    ruleRef: "rules-components.instructions.md — RULE 7 & 8",
    fileFilter: (p) => p.endsWith(".tsx") && !isTestFile(p) && !isApiRoute(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      // Use rawLines so <Button> (React component) is not falsely flagged;
      // skip JSDoc/block-comment content lines (start with optional space + *)
      const pat = /<button[\s>/]/g;
      rawLines.forEach((line, i) => {
        if (/^\s*\*/.test(line)) return; // skip JSDoc comment lines
        const cleaned = line.replace(/\/\*.*?\*\//g, "").replace(/\/\/.*/g, "");
        let m;
        while ((m = pat.exec(cleaned)) !== null) {
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message:
              'Raw <button> — use <Button variant="..."> from @/components',
            snippet: line.trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "COMP-006",
    name: "Raw HTML input element",
    description:
      "Never use <input> in TSX. Use <Input> or <FormField> from @/components.",
    ruleRef: "rules-components.instructions.md — RULE 7 & 8",
    fileFilter: (p) => p.endsWith(".tsx") && !isTestFile(p) && !isApiRoute(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      // Exclude form primitive implementations (they ARE the wrappers for <input>)
      // Also exclude file/media upload components that must use raw <input type="file">
      const n = norm(filePath);
      if (
        n.includes("/src/components/forms/") ||
        n.includes("/src/components/typography/") ||
        n.endsWith("/src/components/admin/ImageUpload.tsx") ||
        n.endsWith("/src/components/admin/MediaUploadField.tsx")
      )
        return violations;
      // Use rawLines; skip JSDoc comment lines
      // Also skip <input type="checkbox"> and <input type="radio"> — those types
      // must remain raw when used inside a <Label> wrapper for implicit label association,
      // since <Checkbox>/<RadioGroup> components have their own internal <label> wrapper
      // which would produce invalid nested labels.
      const pat = /<input[\s>/]/g;
      rawLines.forEach((line, i) => {
        if (/^\s*\*/.test(line)) return; // skip JSDoc comment lines
        const cleaned = line.replace(/\/\*.*?\*\//g, "").replace(/\/\/.*/g, "");
        // skip checkbox / radio inputs (must stay raw for label-wrapping pattern)
        // The type attribute may be on the same line OR on a nearby continuation line
        const lookahead = rawLines.slice(i, i + 8).join(" ");
        if (/type=["'](?:checkbox|radio)["']/.test(lookahead)) return;
        let m;
        while ((m = pat.exec(cleaned)) !== null) {
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message:
              "Raw <input> — use <Input> or <FormField> from @/components",
            snippet: line.trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "COMP-007",
    name: "Raw HTML select or textarea",
    description:
      "Never use <select> or <textarea> in TSX. Use <Select> or <Textarea> from @/components.",
    ruleRef: "rules-components.instructions.md — RULE 7 & 8",
    fileFilter: (p) => p.endsWith(".tsx") && !isTestFile(p) && !isApiRoute(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      // Exclude form primitive implementations (they are the wrappers)
      const n = norm(filePath);
      if (n.includes("/src/components/forms/")) return violations;
      // Use rawLines; skip JSDoc comment lines
      const pat = /<(select|textarea)[\s>/]/g;
      rawLines.forEach((line, i) => {
        if (/^\s*\*/.test(line)) return; // skip JSDoc comment lines
        const cleaned = line.replace(/\/\*.*?\*\//g, "").replace(/\/\/.*/g, "");
        let m;
        while ((m = pat.exec(cleaned)) !== null) {
          const tag = m[1].toLowerCase();
          const comp = tag.charAt(0).toUpperCase() + tag.slice(1);
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message: `Raw <${tag}> — use <${comp}> from @/components`,
            snippet: line.trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "COMP-008",
    name: "Raw semantic HTML tag",
    description:
      "Never use raw <section>, <nav>, <ul>, <ol>, <li>, <article>, <main>, <aside> in TSX. " +
      "Use the matching component from @/components (Section, Nav, Ul, Ol, Li, Article, Main, Aside).",
    ruleRef: "rules-components.instructions.md — RULE 7 & 8",
    fileFilter: (p) => p.endsWith(".tsx") && !isTestFile(p) && !isApiRoute(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      // Exclude semantic component implementations (they ARE the wrappers for these tags)
      const n = norm(filePath);
      if (n.includes("/src/components/semantic/")) return violations;
      // Use rawLines so <Section>, <Nav>, <Ul>, <Ol>, <Li>, <Article>, <Main>, <Aside>
      // (React components) are not falsely flagged as raw semantic HTML tags.
      // Skip JSDoc/block-comment content lines.
      const REPLACEMENTS = {
        section: "Section",
        nav: "Nav",
        ul: "Ul",
        ol: "Ol",
        li: "Li",
        article: "Article",
        main: "Main",
        aside: "Aside",
      };
      const pat = /<(section|nav|ul|ol|li|article|main|aside)[\s>/]/g;
      rawLines.forEach((line, i) => {
        if (/^\s*\*/.test(line)) return; // skip JSDoc comment lines
        const cleaned = line.replace(/\/\*.*?\*\//g, "").replace(/\/\/.*/g, "");
        let m;
        while ((m = pat.exec(cleaned)) !== null) {
          const tag = m[1].toLowerCase();
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message: `Raw <${tag}> — use <${REPLACEMENTS[tag]}> from @/components`,
            snippet: line.trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "COMP-009",
    name: "Filter/sort/page state via useState instead of useUrlTable",
    description:
      "Filter, sort, page, and pagination state must live in the URL via useUrlTable, not React useState.",
    ruleRef: "rules-components.instructions.md — RULE 32",
    // Only check feature pages and app routes — shared components in src/components/ manage
    // their own internal UI state (DataTable, Search, FilterFacetSection, etc.) and are NOT
    // expected to push state into the URL.
    fileFilter: (p) =>
      p.endsWith(".tsx") &&
      !isTestFile(p) &&
      !norm(p).includes("/src/components/"),
    check(filePath, lines, rawLines) {
      const violations = [];
      // Match useState with variable names suggesting list/table state
      const pat =
        /const\s+\[(\w*(?:filter|sort|page|pagination|search|query)\w*)\s*,/gi;
      lines.forEach((line, i) => {
        let m;
        while ((m = pat.exec(line)) !== null) {
          if (/useState/.test(line)) {
            const varName = m[1];
            // Skip boolean UI toggles — variables ending in Open/Close/Active/Visible/Loading
            // e.g. mobileFilterOpen, searchOpen, filterActive — these are UI state, not table state
            if (
              /(?:Open|Close|Active|Visible|Loading|Disabled|Toggle|Modal)$/i.test(
                varName,
              )
            )
              continue;
            violations.push({
              line: i + 1,
              col: m.index + 1,
              message: `'${varName}' appears to be table state in useState — use useUrlTable to persist in URL`,
              snippet: rawLines[i].trim(),
            });
          }
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MEDIA  (MEDIA)
  // ══════════════════════════════════════════════════════════════════════════

  {
    code: "MEDIA-001",
    name: "Raw <img> tag",
    description:
      'Never use <img> in TSX. Use <MediaImage src="..." alt="..."> with an aspect-* container.',
    ruleRef: "rules-media.instructions.md — RULE 28",
    fileFilter: (p) => p.endsWith(".tsx") && !isTestFile(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      const pat = /<img[\s>/]/gi;
      lines.forEach((line, i) => {
        if (pat.test(line)) {
          violations.push({
            line: i + 1,
            col: 1,
            message: "Raw <img> — use <MediaImage> from @/components",
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "MEDIA-002",
    name: "Raw <video> tag",
    description:
      "Never use <video> in TSX. Use <MediaVideo> from @/components.",
    ruleRef: "rules-media.instructions.md — RULE 28",
    fileFilter: (p) => p.endsWith(".tsx") && !isTestFile(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      const n = norm(filePath);
      // Exclude media component implementations and components with legitimate raw <video> usage:
      // MediaVideo.tsx IS the component; CameraCapture uses srcObject for live camera stream;
      // BackgroundRenderer uses specialized autoPlay/loop/onLoadedData that MediaVideo doesn't expose.
      if (
        n.includes("/src/components/media/") ||
        n.endsWith("/src/components/ui/CameraCapture.tsx") ||
        n.endsWith("/src/components/utility/BackgroundRenderer.tsx")
      )
        return violations;
      const pat = /<video[\s>/]/gi;
      lines.forEach((line, i) => {
        if (pat.test(line)) {
          violations.push({
            line: i + 1,
            col: 1,
            message: "Raw <video> — use <MediaVideo> from @/components",
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "MEDIA-003",
    name: "Raw <picture> tag",
    description:
      "Never use <picture> in TSX. Use <MediaImage> from @/components.",
    ruleRef: "rules-media.instructions.md — RULE 28",
    fileFilter: (p) => p.endsWith(".tsx") && !isTestFile(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      const pat = /<picture[\s>/]/gi;
      lines.forEach((line, i) => {
        if (pat.test(line)) {
          violations.push({
            line: i + 1,
            col: 1,
            message: "Raw <picture> — use <MediaImage> from @/components",
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "MEDIA-004",
    name: "Fixed-pixel height on media container",
    description:
      "Media containers must use aspect-* Tailwind classes, not fixed h-[Npx] heights. " +
      "Detected when h-[Npx] appears together with overflow-hidden on the same element.",
    ruleRef: "rules-media.instructions.md — RULE 28",
    fileFilter: (p) => p.endsWith(".tsx") && !isTestFile(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      // Use negative lookbehind to avoid matching min-h-[Npx] or max-h-[Npx]
      lines.forEach((line, i) => {
        if (
          /(?<![-a-z])h-\[\d+px\]/.test(line) &&
          /overflow-hidden/.test(line)
        ) {
          violations.push({
            line: i + 1,
            col: 1,
            message:
              "Fixed h-[Npx] on overflow-hidden container — use aspect-* class instead",
            snippet: rawLines[i].trim(),
          });
        }
      });
      return violations;
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CODE QUALITY  (QUAL)
  // ══════════════════════════════════════════════════════════════════════════

  {
    code: "QUAL-001",
    name: "console.log / debug / info / warn in production code",
    description:
      "console.* is forbidden in production source. " +
      "Use logger (client) from @/classes or serverLogger from @/lib/server-logger.",
    ruleRef: "rules-code-quality.instructions.md — RULE 23",
    // Exclude Logger/EventBus (they ARE the logging transport), db tool files, snippets, and Edge middleware.
    fileFilter: (p) =>
      (p.endsWith(".ts") || p.endsWith(".tsx")) &&
      !isTestFile(p) &&
      !p.endsWith("jest.setup.ts") &&
      !isCoreClassFile(p) &&
      !isSnippetFile(p) &&
      !norm(p).endsWith("/src/lib/server-logger.ts") &&
      !norm(p).endsWith("/src/proxy.ts"),
    check(filePath, lines, rawLines) {
      const violations = [];
      const pat = /\bconsole\.(log|debug|info|warn|error)\s*\(/g;
      lines.forEach((line, i) => {
        let m;
        while ((m = pat.exec(line)) !== null) {
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message: `console.${m[1]}() is forbidden — use logger or serverLogger`,
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "QUAL-002",
    name: "Native dialog (alert / confirm / prompt)",
    description:
      "alert(), confirm(), and prompt() are forbidden. " +
      "Use useMessage() for notifications or ConfirmDeleteModal for confirmations.",
    ruleRef: "rules-code-quality.instructions.md — RULE 22",
    fileFilter: (p) =>
      (p.endsWith(".ts") || p.endsWith(".tsx")) && !isTestFile(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      const REPLACE = {
        alert: "useMessage()",
        confirm: "ConfirmDeleteModal",
        prompt: "Modal with a form",
      };
      const pat = /\b(alert|confirm|prompt)\s*\(/g;
      lines.forEach((line, i) => {
        let m;
        while ((m = pat.exec(line)) !== null) {
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message: `${m[1]}() is forbidden — use ${REPLACE[m[1]]} instead`,
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "QUAL-003",
    name: "@deprecated annotation in source",
    description:
      "No @deprecated stubs allowed. Delete old code when replacing it — no compat shims.",
    ruleRef: "rules-code-quality.instructions.md — RULE 24",
    fileFilter: (p) =>
      (p.endsWith(".ts") || p.endsWith(".tsx")) && !isTestFile(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      rawLines.forEach((line, i) => {
        if (/@deprecated/i.test(line)) {
          violations.push({
            line: i + 1,
            col: 1,
            message:
              "@deprecated annotation — delete the old code instead of keeping stubs",
            snippet: line.trim(),
          });
        }
      });
      return violations;
    },
  },

  {
    code: "QUAL-004",
    name: "Scheduled job / Firestore trigger in Next.js API route",
    description:
      "onSchedule, onDocumentCreated, onDocumentUpdated etc. must live in functions/src/, not in Next.js API routes.",
    ruleRef: "rules-functions.instructions.md — RULE 35",
    fileFilter: (p) =>
      isApiRoute(p) && (p.endsWith(".ts") || p.endsWith(".tsx")),
    check(filePath, lines, rawLines) {
      const violations = [];
      const pat =
        /\b(onSchedule|onDocumentCreated|onDocumentUpdated|onDocumentDeleted|onDocumentWritten|onMessagePublished|onTaskDispatched)\s*\(/g;
      lines.forEach((line, i) => {
        let m;
        while ((m = pat.exec(line)) !== null) {
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message: `${m[1]}() in a Next.js API route — move to functions/src/jobs/ or functions/src/triggers/`,
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CONSTANTS  (CNST)
  // ══════════════════════════════════════════════════════════════════════════

  {
    code: "CNST-001",
    name: "Hardcoded route path in navigation call",
    description:
      "Use ROUTES from @/constants for all router.push / router.replace calls. Never pass a literal string.",
    ruleRef: "rules-constants.instructions.md — RULE 18",
    fileFilter: (p) =>
      (p.endsWith(".ts") || p.endsWith(".tsx")) &&
      !isTestFile(p) &&
      !isApiRoute(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      const pat = /router\.(push|replace|prefetch)\s*\(\s*['"]\/[a-z]/g;
      lines.forEach((line, i) => {
        if (pat.test(line)) {
          violations.push({
            line: i + 1,
            col: 1,
            message:
              "Hardcoded route string in router.push/replace — use ROUTES from @/constants",
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "CNST-002",
    name: "new Date() / Date.now() outside utils/",
    description:
      "Date creation must use utility functions from @/utils (nowMs, nowISO, parseDate…). " +
      "Never call new Date() or Date.now() directly in components, hooks, or features.",
    ruleRef: "rules-hooks-utils.instructions.md — RULE 5",
    fileFilter: (p) => {
      const n = norm(p);
      return (
        (p.endsWith(".ts") || p.endsWith(".tsx")) &&
        !isTestFile(p) &&
        !isUtilsDir(p) &&
        !isApiRoute(p) &&
        !isLibDir(p) &&
        !isScriptFile(p) &&
        !isSnippetFile(p) &&
        !isAppServerFile(p) &&
        !n.includes("/src/repositories/") &&
        !n.includes("/src/db/") &&
        !n.includes("/src/classes/") &&
        !n.includes("/src/actions/") &&
        !n.endsWith("/src/proxy.ts")
      );
    },
    check(filePath, lines, rawLines) {
      const violations = [];
      const pat = /\bnew Date\(\)|Date\.now\(\)/g;
      lines.forEach((line, i) => {
        if (pat.test(line)) {
          violations.push({
            line: i + 1,
            col: 1,
            message:
              "new Date()/Date.now() outside utils — use nowMs(), nowISO(), parseDate() from @/utils",
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "CNST-003",
    name: "Hardcoded Firestore collection name string",
    description:
      "Collection names must come from constants in @/db/schema (USER_COLLECTION etc.), never hardcoded strings.",
    ruleRef: "rules-constants.instructions.md — RULE 17",
    fileFilter: (p) =>
      (p.endsWith(".ts") || p.endsWith(".tsx")) && !isTestFile(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      // collection('users'), collection('products'), etc.
      // Actual Firestore collection string values (from src/db/schema/*COLLECTION constants)
      const KNOWN_COLLECTIONS = [
        // Core user/product/order
        "users",
        "products",
        "orders",
        "reviews",
        "bids",
        "sessions",
        "carts",
        "stores",
        // Platform config
        "carouselSlides",
        "homepageSections",
        "categories",
        "coupons",
        "couponUsage",
        "faqs",
        "siteSettings",
        // Auth tokens
        "emailVerificationTokens",
        "passwordResetTokens",
        // User subcollections (string literal still needs a constant)
        "addresses",
        "wishlist",
        // Content & comms
        "blogPosts",
        "chatRooms",
        "events",
        "eventEntries",
        "newsletterSubscribers",
        "notifications",
        "payouts",
        "ripcoins",
        "sms_counters",
      ];
      const quoted = KNOWN_COLLECTIONS.map((c) => `'${c}'|"${c}"`).join("|");
      const pat = new RegExp(`\\.collection\\s*\\(\\s*(${quoted})\\s*\\)`, "g");
      lines.forEach((line, i) => {
        let m;
        while ((m = pat.exec(line)) !== null) {
          violations.push({
            line: i + 1,
            col: m.index + 1,
            message: `Hardcoded collection name ${m[1]} — import the constant from @/db/schema`,
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // STYLING  (STYL)
  // ══════════════════════════════════════════════════════════════════════════

  {
    code: "STYL-001",
    name: "Grid missing xl: / 2xl: column breakpoints",
    description:
      "Every grid must include xl: and 2xl: column counts for widescreen. " +
      "Flagged when lg:grid-cols-N is present but xl:grid-cols-N is absent.",
    ruleRef: "rules-styling.instructions.md — RULE 25",
    fileFilter: (p) => p.endsWith(".tsx") && !isTestFile(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      lines.forEach((line, i) => {
        if (
          /\bgrid\b/.test(line) &&
          /lg:grid-cols-\d/.test(line) &&
          !/xl:grid-cols-\d/.test(line)
        ) {
          violations.push({
            line: i + 1,
            col: 1,
            message:
              "Grid defines lg: columns but missing xl:grid-cols-N and 2xl:grid-cols-N",
            snippet: rawLines[i].trim(),
          });
        }
      });
      return violations;
    },
  },

  {
    code: "STYL-002",
    name: "Inline style with static string value",
    description:
      "Inline styles are forbidden for static values. Use Tailwind / THEME_CONSTANTS instead. " +
      "Allowed only for dynamic computed values (e.g. style={{ width: `${pct}%` }}).",
    ruleRef: "rules-styling.instructions.md — RULE 4",
    fileFilter: (p) => p.endsWith(".tsx") && !isTestFile(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      // style={{ someProperty: 'static-string' }}
      const pat = /style=\{\{\s*\w+:\s*['"][^'"]+['"]/g;
      lines.forEach((line, i) => {
        if (pat.test(line)) {
          violations.push({
            line: i + 1,
            col: 1,
            message:
              "Inline style with a static string value — use Tailwind or THEME_CONSTANTS",
            snippet: rawLines[i].trim(),
          });
        }
        pat.lastIndex = 0;
      });
      return violations;
    },
  },

  {
    code: "STYL-003",
    name: "Raw repeated Tailwind spacing/color string",
    description:
      "Known raw Tailwind strings that THEME_CONSTANTS covers must not appear directly in className. " +
      "Use THEME_CONSTANTS from @/constants.",
    ruleRef: "rules-styling.instructions.md — RULE 4",
    fileFilter: (p) => p.endsWith(".tsx") && !isTestFile(p),
    check(filePath, lines, rawLines) {
      const violations = [];
      // A sample of the most common patterns flagged by RULE 4
      const THEME_PATTERNS = [
        {
          pattern: /\bbg-white\s+dark:bg-gray-900\b/,
          note: "use THEME_CONSTANTS.themed.bgPrimary",
        },
        {
          pattern: /\bbg-gray-50\s+dark:bg-gray-800\b/,
          note: "use THEME_CONSTANTS.themed.bgSecondary",
        },
        {
          pattern: /(?<![a-zA-Z0-9_-])flex\s+items-center\s+justify-center\b/,
          note: "use THEME_CONSTANTS.flex.center",
        },
        {
          pattern: /(?<![a-zA-Z0-9_-])flex\s+items-center\s+justify-between\b/,
          note: "use THEME_CONSTANTS.flex.between",
        },
        {
          pattern: /\bmax-w-7xl\s+mx-auto\s+px-4\b/,
          note: 'use THEME_CONSTANTS.page.container["2xl"]',
        },
        { pattern: /\bspace-y-4\b/, note: "use THEME_CONSTANTS.spacing.stack" },
        {
          pattern: /\btext-gray-900\s+dark:text-white\b/,
          note: "use THEME_CONSTANTS.themed.textPrimary",
        },
        {
          pattern: /\btext-gray-600\s+dark:text-gray-400\b/,
          note: "use THEME_CONSTANTS.themed.textSecondary",
        },
        {
          pattern: /\bborder-gray-200\s+dark:border-gray-700\b/,
          note: "use THEME_CONSTANTS.themed.border",
        },
      ];
      lines.forEach((line, i) => {
        for (const { pattern, note } of THEME_PATTERNS) {
          if (pattern.test(line)) {
            violations.push({
              line: i + 1,
              col: 1,
              message: `Raw Tailwind string — ${note}`,
              snippet: rawLines[i].trim(),
            });
            break; // one violation per line per rule
          }
        }
      });
      return violations;
    },
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const allFiles = walkDir(SRC_DIR, [".ts", ".tsx"]);
  console.log(`\nScanning ${allFiles.length} TypeScript files in src/ ...\n`);

  const violations = [];
  let id = 1;

  for (const filePath of allFiles) {
    if (isTestFile(filePath)) continue;

    let rawContent;
    try {
      rawContent = fs.readFileSync(filePath, "utf8");
    } catch {
      continue;
    }

    const rawLines = rawContent.split("\n");
    const processedContent = removeBlockComments(rawContent);
    const lines = processedContent.split("\n").map(stripLineComment);

    for (const rule of RULES) {
      if (!rule.fileFilter(filePath)) continue;

      const meta = RULE_META[rule.code] || {
        severity: "warning",
        autoFixable: false,
      };

      let found;
      try {
        found = rule.check(filePath, lines, rawLines);
      } catch (err) {
        console.error(
          `[ERROR] Rule ${rule.code} failed on ${relPath(filePath)}: ${err.message}`,
        );
        found = [];
      }

      for (const v of found) {
        // 3 lines of context before and after the violation
        const lineIdx = v.line - 1;
        const ctxStart = Math.max(0, lineIdx - 3);
        const ctxEnd = Math.min(rawLines.length, lineIdx + 4);
        const context = rawLines
          .slice(ctxStart, ctxEnd)
          .map((content, offset) => ({
            lineNumber: ctxStart + offset + 1,
            content,
            isViolation: ctxStart + offset === lineIdx,
          }));

        violations.push({
          id: `V${String(id++).padStart(5, "0")}`,
          code: rule.code,
          severity: meta.severity,
          autoFixable: meta.autoFixable,
          rule: rule.name,
          description: rule.description,
          ruleRef: rule.ruleRef,
          file: relPath(filePath),
          line: v.line,
          col: v.col,
          message: v.message,
          snippet: v.snippet,
          context,
        });
      }
    }
  }

  // ─── Build summaries ────────────────────────────────────────────────────────
  const byCode = {};
  const bySeverity = { error: 0, warning: 0, info: 0 };
  const byCategory = {};
  const byFile = {};

  for (const v of violations) {
    byCode[v.code] = (byCode[v.code] || 0) + 1;
    bySeverity[v.severity] = (bySeverity[v.severity] || 0) + 1;
    const cat = v.code.split("-")[0];
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    byFile[v.file] = (byFile[v.file] || 0) + 1;
  }

  const autoFixableCount = violations.filter((v) => v.autoFixable).length;

  const output = {
    generatedAt: new Date().toISOString(),
    scannedFiles: allFiles.length,
    totalViolations: violations.length,
    autoFixableCount,
    summary: {
      byCode: Object.entries(byCode)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([code, count]) => ({
          code,
          count,
          severity: (RULE_META[code] || {}).severity || "warning",
          autoFixable: (RULE_META[code] || {}).autoFixable || false,
        })),
      bySeverity,
      byCategory: Object.entries(byCategory)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, count]) => ({ category, count })),
      topFiles: Object.entries(byFile)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([file, count]) => ({ file, count })),
    },
    violations,
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), "utf8");

  // Console report
  if (violations.length === 0) {
    console.log("✅  No violations found.\n");
  } else {
    console.log(
      `⚠️  Found ${violations.length} violation(s)  (${autoFixableCount} auto-fixable):\n`,
    );
    console.log("  By severity:");
    console.log(`    error   ${String(bySeverity.error).padStart(4)}`);
    console.log(`    warning ${String(bySeverity.warning).padStart(4)}`);
    console.log(`    info    ${String(bySeverity.info).padStart(4)}`);
    console.log("\n  By code:");
    for (const [code, count] of Object.entries(byCode).sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      const m = RULE_META[code] || {};
      const tag = m.autoFixable ? " [auto-fixable]" : "";
      console.log(`    ${code.padEnd(16)} ${String(count).padStart(4)}${tag}`);
    }
    console.log("\n  Top offending files:");
    Object.entries(byFile)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .forEach(([file, count]) => {
        console.log(`    ${String(count).padStart(4)}  ${file}`);
      });
    console.log(`\nFull report → violations.json`);
    if (autoFixableCount > 0) {
      console.log(
        `Run:  node scripts/fix-violations.js --apply  to auto-fix ${autoFixableCount} violation(s)`,
      );
    }
    console.log();
  }
}

main();
