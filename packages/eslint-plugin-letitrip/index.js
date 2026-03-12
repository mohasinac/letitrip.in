// @ts-check
/**
 * @mohasinac/eslint-plugin — LetItRip architectural rule enforcement.
 *
 * Rules map 1:1 to the violation codes in scripts/check-violations.js.
 *
 * Run:  npm run lint        → IDE + CI feedback
 * Run:  npm run lint:fix    → auto-fix ARCH-001, I18N-001, I18N-002
 *
 * Rule index:
 *   lir/no-deep-barrel-import            ARCH-001  (fixable)
 *   lir/no-cross-feature-import          ARCH-002
 *   lir/no-tier1-feature-import          ARCH-004
 *   lir/use-i18n-navigation              I18N-001, I18N-002  (fixable)
 *   lir/no-firebase-client-in-ui         FIREBASE-001, FIREBASE-002
 *   lir/no-firebase-admin-outside-backend FIREBASE-003
 *   lir/no-direct-firestore-query        FIREBASE-004
 *   lir/no-fetch-in-ui                   SVC-001
 *   lir/no-apiclient-outside-services    SVC-002
 *   lir/no-hardcoded-api-path            SVC-003
 *   lir/no-raw-html-elements             COMP-001 → COMP-009
 *   lir/no-raw-media-elements            MEDIA-001 → MEDIA-003
 *   lir/no-inline-static-style           STYL-002
 *   lir/no-hardcoded-route               CNST-001
 *   lir/no-hardcoded-collection          CNST-003
 *   lir/no-firebase-trigger-in-api       QUAL-004
 */

// ─── Path helpers ─────────────────────────────────────────────────────────────

/** @param {string} p */
function norm(p) {
  return (p || "").replace(/\\/g, "/");
}

/** @param {import('eslint').Rule.RuleContext} ctx */
function getFilename(ctx) {
  // ESLint 9+ flat config exposes ctx.filename; ESLint 8 used ctx.getFilename()
  return norm(ctx.filename ?? ctx.getFilename?.() ?? "");
}

/** @param {string} p */
function isTestFile(p) {
  return /\/__tests__\/|\.test\.[tj]sx?$|\.spec\.[tj]sx?$/.test(p);
}

/** @param {string} p */
function isApiRoute(p) {
  return p.includes("/app/api/");
}

/** @param {string} p */
function isLibDir(p) {
  return p.includes("/src/lib/");
}

/** @param {string} p */
function isServiceFile(p) {
  return p.includes(".service.ts");
}

/** @param {string} p */
function isServicesDir(p) {
  return p.includes("/src/services/");
}

/** @param {string} p */
function isI18nFile(p) {
  return p.includes("/src/i18n/");
}

/** @param {string} p */
function isRepositoryFile(p) {
  return p.includes("/src/repositories/");
}

/** @param {string} p */
function isFeatureFile(p) {
  return p.includes("/src/features/");
}

/** @param {string} p */
function isSharedTierFile(p) {
  return (
    p.includes("/src/components/") ||
    p.includes("/src/hooks/") ||
    p.includes("/src/utils/") ||
    p.includes("/src/helpers/") ||
    p.includes("/src/classes/")
  );
}

/**
 * Next.js app-level server files (sitemap, robots, manifest…) that legitimately
 * use the Admin SDK but are not API routes.
 * @param {string} p
 */
function isAppServerFile(p) {
  return (
    p.includes("/src/app/") &&
    !isApiRoute(p) &&
    !p.endsWith("page.tsx") &&
    !p.endsWith("layout.tsx") &&
    !p.endsWith("error.tsx") &&
    !p.endsWith("loading.tsx")
  );
}

/** @param {string} p */
function getFeatureName(p) {
  const m = p.match(/\/features\/([^/]+)\//);
  return m ? m[1] : null;
}

// ─── Shared constants ─────────────────────────────────────────────────────────

const BARREL_ROOTS = [
  "components",
  "hooks",
  "utils",
  "helpers",
  "classes",
  "services",
  "constants",
  "repositories",
];

const DEEP_BARREL_EXCEPTIONS = [
  "@/helpers/data/sieve.helper", // uses Node.js built-ins; intentionally excluded from barrel
];

const KNOWN_COLLECTIONS = new Set([
  "users",
  "products",
  "orders",
  "reviews",
  "bids",
  "sessions",
  "carousel_slides",
  "homepage_sections",
  "categories",
  "coupons",
  "faqs",
  "site_settings",
  "email_verifications",
  "password_resets",
  "addresses",
  "blogs",
  "carts",
  "wishlists",
  "chats",
  "events",
  "event_entries",
  "newsletters",
  "notifications",
  "payouts",
  "rip_coins",
]);

const FIREBASE_TRIGGER_FNS = new Set([
  "onSchedule",
  "onDocumentCreated",
  "onDocumentUpdated",
  "onDocumentDeleted",
  "onDocumentWritten",
  "onMessagePublished",
  "onTaskDispatched",
]);

const FIRESTORE_QUERY_FNS = new Set([
  "getDocs",
  "getDoc",
  "addDoc",
  "setDoc",
  "updateDoc",
  "deleteDoc",
  "query",
]);

// ─── Rules ───────────────────────────────────────────────────────────────────

const rules = {
  // ── ARCH-001: Deep barrel imports ──────────────────────────────────────────
  "no-deep-barrel-import": {
    meta: {
      type: "suggestion",
      docs: {
        description:
          "Import only from top-level barrel exports, not sub-paths. (ARCH-001)",
        url: "https://github.com/letitrip-in/.github/blob/main/instructions/rules-architecture.instructions.md",
      },
      fixable: "code",
      schema: [],
      messages: {
        deepImport:
          "Deep import '{{path}}' — import from '@/{{barrel}}' barrel instead.",
      },
    },
    /** @param {import('eslint').Rule.RuleContext} context */
    create(context) {
      if (isTestFile(getFilename(context))) return {};
      return {
        ImportDeclaration(node) {
          const src = node.source.value;
          for (const barrel of BARREL_ROOTS) {
            if (
              src.startsWith(`@/${barrel}/`) &&
              !DEEP_BARREL_EXCEPTIONS.includes(src)
            ) {
              const q = node.source.raw[0]; // preserve original quote style
              context.report({
                node: node.source,
                messageId: "deepImport",
                data: { path: src, barrel },
                fix: (fixer) =>
                  fixer.replaceText(node.source, `${q}@/${barrel}${q}`),
              });
              return;
            }
          }
        },
      };
    },
  },

  // ── ARCH-002: Cross-feature import ─────────────────────────────────────────
  "no-cross-feature-import": {
    meta: {
      type: "problem",
      docs: {
        description:
          "Feature modules must not import from other feature modules. (ARCH-002)",
      },
      schema: [],
      messages: {
        crossFeature:
          "Feature '{{thisFeature}}' imports from feature '{{otherFeature}}' — cross-feature imports are forbidden. Elevate shared logic to Tier-1.",
      },
    },
    create(context) {
      const filename = getFilename(context);
      if (isTestFile(filename)) return {};
      if (!isFeatureFile(filename)) return {};
      const thisFeature = getFeatureName(filename);
      if (!thisFeature) return {};
      return {
        ImportDeclaration(node) {
          const src = node.source.value;
          const m = src.match(/^@\/features\/([^/'"]+)/);
          if (m && m[1] !== thisFeature) {
            context.report({
              node: node.source,
              messageId: "crossFeature",
              data: { thisFeature, otherFeature: m[1] },
            });
          }
        },
      };
    },
  },

  // ── ARCH-004: Shared tier (Tier-1) imports from features ──────────────────
  "no-tier1-feature-import": {
    meta: {
      type: "problem",
      docs: {
        description:
          "Shared Tier-1 code (components, hooks, utils, helpers, classes) must not import from feature modules. (ARCH-004)",
      },
      schema: [],
      messages: {
        tier1FeatureImport:
          "Shared tier imports '{{path}}' — Tier-1 must not depend on feature modules.",
      },
    },
    create(context) {
      const filename = getFilename(context);
      if (isTestFile(filename)) return {};
      if (!isSharedTierFile(filename)) return {};
      return {
        ImportDeclaration(node) {
          const src = node.source.value;
          if (/^@\/features\//.test(src)) {
            context.report({
              node: node.source,
              messageId: "tier1FeatureImport",
              data: { path: src },
            });
          }
        },
      };
    },
  },

  // ── I18N-001 + I18N-002: Use @/i18n/navigation ────────────────────────────
  "use-i18n-navigation": {
    meta: {
      type: "problem",
      docs: {
        description:
          "Import routing hooks (useRouter, usePathname, redirect) and <Link> from '@/i18n/navigation', not 'next/navigation' or 'next/link'. (I18N-001, I18N-002)",
      },
      fixable: "code",
      schema: [],
      messages: {
        wrongNavigation:
          "Import useRouter/usePathname/redirect from '@/i18n/navigation', not 'next/navigation'.",
        wrongLink: "Import <Link> from '@/i18n/navigation', not 'next/link'.",
      },
    },
    create(context) {
      const filename = getFilename(context);
      if (isTestFile(filename)) return {};
      if (isApiRoute(filename)) return {};
      if (isI18nFile(filename)) return {};
      return {
        ImportDeclaration(node) {
          const src = node.source.value;
          const q = node.source.raw[0];

          if (src === "next/navigation") {
            const names = node.specifiers
              .filter((s) => s.type === "ImportSpecifier")
              .map((s) => s.imported.name);
            if (
              names.some((n) =>
                ["useRouter", "usePathname", "redirect"].includes(n),
              )
            ) {
              context.report({
                node: node.source,
                messageId: "wrongNavigation",
                fix: (fixer) =>
                  fixer.replaceText(node.source, `${q}@/i18n/navigation${q}`),
              });
            }
          }

          if (src === "next/link") {
            context.report({
              node: node.source,
              messageId: "wrongLink",
              fix: (fixer) =>
                fixer.replaceText(node.source, `${q}@/i18n/navigation${q}`),
            });
          }
        },
      };
    },
  },

  // ── FIREBASE-001 + FIREBASE-002: No Firebase client SDK in UI ──────────────
  "no-firebase-client-in-ui": {
    meta: {
      type: "problem",
      docs: {
        description:
          "Firebase client SDK (auth/firestore/storage) and @/lib/firebase/config must not be imported in UI code. (FIREBASE-001, FIREBASE-002)",
      },
      schema: [],
      messages: {
        clientSdk:
          "firebase/{{module}} must not be imported in UI code — use API routes with the Admin SDK.",
        configImport:
          "@/lib/firebase/config must not be imported outside src/app/api/ or src/lib/.",
      },
    },
    create(context) {
      const filename = getFilename(context);
      if (isTestFile(filename)) return {};
      if (isApiRoute(filename)) return {};
      if (isLibDir(filename)) return {};
      return {
        ImportDeclaration(node) {
          const src = node.source.value;
          const sdkMatch = src.match(/^firebase\/(auth|firestore|storage)$/);
          if (sdkMatch) {
            context.report({
              node: node.source,
              messageId: "clientSdk",
              data: { module: sdkMatch[1] },
            });
          }
          if (/lib\/firebase\/config/.test(src)) {
            context.report({ node: node.source, messageId: "configImport" });
          }
        },
      };
    },
  },

  // ── FIREBASE-003: No Admin SDK outside api/ or lib/ ────────────────────────
  "no-firebase-admin-outside-backend": {
    meta: {
      type: "problem",
      docs: {
        description:
          "Firebase Admin SDK may only be imported in src/app/api/**, src/lib/**, src/repositories/, and app server files. (FIREBASE-003)",
      },
      schema: [],
      messages: {
        adminSdk:
          "Firebase Admin SDK must not be imported here — allowed only in src/app/api/, src/lib/, and src/repositories/.",
      },
    },
    create(context) {
      const filename = getFilename(context);
      if (isTestFile(filename)) return {};
      if (isApiRoute(filename)) return {};
      if (isLibDir(filename)) return {};
      if (isRepositoryFile(filename)) return {};
      if (isAppServerFile(filename)) return {};
      return {
        ImportDeclaration(node) {
          if (/lib\/firebase\/admin/.test(node.source.value)) {
            context.report({ node: node.source, messageId: "adminSdk" });
          }
        },
      };
    },
  },

  // ── FIREBASE-004: Direct Firestore query in API route ──────────────────────
  "no-direct-firestore-query": {
    meta: {
      type: "problem",
      docs: {
        description:
          "API routes must query Firestore via repositories — never call getDocs/getDoc/addDoc etc. directly. (FIREBASE-004)",
      },
      schema: [],
      messages: {
        directQuery:
          "{{fn}}() is a direct Firestore call — use a repository from @/repositories instead.",
      },
    },
    create(context) {
      if (!isApiRoute(getFilename(context))) return {};
      return {
        CallExpression(node) {
          if (
            node.callee.type === "Identifier" &&
            FIRESTORE_QUERY_FNS.has(node.callee.name)
          ) {
            context.report({
              node: node.callee,
              messageId: "directQuery",
              data: { fn: node.callee.name },
            });
          }
        },
      };
    },
  },

  // ── SVC-001: No fetch() in UI code ─────────────────────────────────────────
  "no-fetch-in-ui": {
    meta: {
      type: "problem",
      docs: {
        description:
          "fetch() must not be called in UI code — use a named service function from @/services. (SVC-001)",
      },
      schema: [],
      messages: {
        directFetch:
          "Direct fetch() in UI code — call a service function from @/services instead.",
      },
    },
    create(context) {
      const filename = getFilename(context);
      if (isTestFile(filename)) return {};
      if (isApiRoute(filename)) return {};
      if (isLibDir(filename)) return {};
      if (isServiceFile(filename)) return {};
      if (isServicesDir(filename)) return {};
      return {
        CallExpression(node) {
          // fetch( — but not useFetch( or prefetch(
          if (
            node.callee.type === "Identifier" &&
            node.callee.name === "fetch"
          ) {
            context.report({ node: node.callee, messageId: "directFetch" });
          }
        },
      };
    },
  },

  // ── SVC-002: apiClient outside *.service.ts ────────────────────────────────
  "no-apiclient-outside-services": {
    meta: {
      type: "problem",
      docs: {
        description:
          "apiClient must only be used inside *.service.ts files. Components and hooks must call named service functions. (SVC-002)",
      },
      schema: [],
      messages: {
        wrongUsage:
          "apiClient must only be used in *.service.ts files — call a named service function instead.",
      },
    },
    create(context) {
      const filename = getFilename(context);
      if (isTestFile(filename)) return {};
      if (isServiceFile(filename)) return {};
      return {
        ImportDeclaration(node) {
          const src = node.source.value;
          if (/api-client/.test(src)) {
            // Allow: import type { ApiClientError } (error class only, not apiClient call)
            const onlyErrorClass = node.specifiers.every((s) => {
              if (s.type !== "ImportSpecifier") return false;
              return s.imported.name === "ApiClientError";
            });
            if (!onlyErrorClass) {
              context.report({ node: node.source, messageId: "wrongUsage" });
            }
          }
        },
        MemberExpression(node) {
          if (
            node.object.type === "Identifier" &&
            node.object.name === "apiClient"
          ) {
            context.report({ node: node.object, messageId: "wrongUsage" });
          }
        },
      };
    },
  },

  // ── SVC-003: Hardcoded API path in service ─────────────────────────────────
  "no-hardcoded-api-path": {
    meta: {
      type: "suggestion",
      docs: {
        description:
          "Service functions must use API_ENDPOINTS from @/constants — never hardcode '/api/...' strings. (SVC-003)",
      },
      schema: [],
      messages: {
        hardcodedPath:
          "Hardcoded API path '{{path}}' — use API_ENDPOINTS from @/constants.",
      },
    },
    create(context) {
      if (!isServiceFile(getFilename(context))) return {};
      return {
        CallExpression(node) {
          if (
            node.callee.type === "MemberExpression" &&
            node.callee.object.type === "Identifier" &&
            node.callee.object.name === "apiClient" &&
            node.arguments.length > 0 &&
            node.arguments[0].type === "Literal" &&
            typeof node.arguments[0].value === "string" &&
            node.arguments[0].value.startsWith("/api/")
          ) {
            context.report({
              node: node.arguments[0],
              messageId: "hardcodedPath",
              data: { path: node.arguments[0].value },
            });
          }
        },
      };
    },
  },

  // ── COMP-001 → COMP-009: Raw HTML elements in TSX ─────────────────────────
  "no-raw-html-elements": {
    meta: {
      type: "suggestion",
      docs: {
        description:
          "Never use raw HTML elements in TSX — use the matching component from @/components. (COMP-001 to COMP-009)",
      },
      schema: [],
      messages: {
        rawHeading:
          "Raw <h{{level}}> — use <Heading level={{{level}}}> from @/components.",
        rawParagraph: "Raw <p> — use <Text> from @/components.",
        rawLabel: "Raw <label> — use <Label> from @/components.",
        rawAnchor: "Raw <a> — use <TextLink href={...}> from @/components.",
        rawButton:
          'Raw <button> — use <Button variant="..."> from @/components.',
        rawInput: "Raw <input> — use <Input> or <FormField> from @/components.",
        rawSelect: "Raw <select> — use <Select> from @/components.",
        rawTextarea: "Raw <textarea> — use <Textarea> from @/components.",
        rawSemantic: "Raw <{{tag}}> — use <{{component}}> from @/components.",
      },
    },
    create(context) {
      const filename = getFilename(context);
      if (isTestFile(filename)) return {};
      if (isApiRoute(filename)) return {};

      const SEMANTIC_MAP = {
        section: "Section",
        nav: "Nav",
        ul: "Ul",
        ol: "Ol",
        li: "Li",
        article: "Article",
        main: "Main",
        aside: "Aside",
      };

      return {
        JSXOpeningElement(node) {
          if (node.name.type !== "JSXIdentifier") return;
          const tag = node.name.name;

          // COMP-001: Headings
          const headingMatch = tag.match(/^h([1-6])$/);
          if (headingMatch) {
            context.report({
              node: node.name,
              messageId: "rawHeading",
              data: { level: headingMatch[1] },
            });
            return;
          }

          // COMP-002: Paragraph
          if (tag === "p") {
            context.report({ node: node.name, messageId: "rawParagraph" });
            return;
          }

          // COMP-003: Label (exclude form primitive implementations)
          if (tag === "label" && !filename.includes("/src/components/forms/")) {
            context.report({ node: node.name, messageId: "rawLabel" });
            return;
          }

          // COMP-004: Anchor
          if (tag === "a") {
            context.report({ node: node.name, messageId: "rawAnchor" });
            return;
          }

          // COMP-005: Button (exclude form primitives)
          if (
            tag === "button" &&
            !filename.includes("/src/components/forms/")
          ) {
            context.report({ node: node.name, messageId: "rawButton" });
            return;
          }

          // COMP-006: Input (exclude form primitives, upload components, and checkbox/radio)
          if (
            tag === "input" &&
            !filename.includes("/src/components/forms/") &&
            !filename.includes("/src/components/typography/") &&
            !filename.endsWith("ImageUpload.tsx") &&
            !filename.endsWith("MediaUploadField.tsx")
          ) {
            // checkbox and radio must stay raw for label-wrapping pattern
            const typeAttr = node.attributes.find(
              (attr) =>
                attr.type === "JSXAttribute" &&
                attr.name &&
                attr.name.name === "type",
            );
            if (typeAttr && typeAttr.value) {
              const val =
                typeAttr.value.type === "Literal" ? typeAttr.value.value : null;
              if (val === "checkbox" || val === "radio") return;
            }
            context.report({ node: node.name, messageId: "rawInput" });
            return;
          }

          // COMP-007: Select / Textarea (exclude form primitives)
          if (
            (tag === "select" || tag === "textarea") &&
            !filename.includes("/src/components/forms/")
          ) {
            context.report({
              node: node.name,
              messageId: tag === "select" ? "rawSelect" : "rawTextarea",
            });
            return;
          }

          // COMP-008: Semantic HTML (exclude semantic component implementations)
          if (
            SEMANTIC_MAP[tag] &&
            !filename.includes("/src/components/semantic/")
          ) {
            context.report({
              node: node.name,
              messageId: "rawSemantic",
              data: { tag, component: SEMANTIC_MAP[tag] },
            });
          }
        },
      };
    },
  },

  // ── MEDIA-001 → MEDIA-003: Raw media elements in TSX ──────────────────────
  "no-raw-media-elements": {
    meta: {
      type: "suggestion",
      docs: {
        description:
          "Never use raw <img>, <video>, or <picture> in TSX — use MediaImage/MediaVideo from @/components. (MEDIA-001, MEDIA-002, MEDIA-003)",
      },
      schema: [],
      messages: {
        rawImg:
          "Raw <img> — use <MediaImage src={...} alt={...}> inside an aspect-* container from @/components.",
        rawVideo: "Raw <video> — use <MediaVideo> from @/components.",
        rawPicture: "Raw <picture> — use <MediaImage> from @/components.",
      },
    },
    create(context) {
      const filename = getFilename(context);
      if (isTestFile(filename)) return {};
      return {
        JSXOpeningElement(node) {
          if (node.name.type !== "JSXIdentifier") return;
          const tag = node.name.name;

          if (tag === "img") {
            context.report({ node: node.name, messageId: "rawImg" });
            return;
          }

          if (
            tag === "video" &&
            !filename.includes("/src/components/media/") &&
            !filename.endsWith("CameraCapture.tsx") &&
            !filename.endsWith("BackgroundRenderer.tsx")
          ) {
            context.report({ node: node.name, messageId: "rawVideo" });
            return;
          }

          if (tag === "picture") {
            context.report({ node: node.name, messageId: "rawPicture" });
          }
        },
      };
    },
  },

  // ── STYL-002: Inline style with a static string value ─────────────────────
  "no-inline-static-style": {
    meta: {
      type: "suggestion",
      docs: {
        description:
          "Inline styles are forbidden for static values — use Tailwind classes or THEME_CONSTANTS. (STYL-002)",
      },
      schema: [],
      messages: {
        staticStyle:
          "Inline style with a static value — use a Tailwind class or THEME_CONSTANTS instead.",
      },
    },
    create(context) {
      if (isTestFile(getFilename(context))) return {};
      return {
        JSXAttribute(node) {
          if (!node.name || node.name.name !== "style") return;
          if (node.value?.type !== "JSXExpressionContainer") return;
          const expr = node.value.expression;
          if (expr.type !== "ObjectExpression") return;
          for (const prop of expr.properties) {
            if (
              prop.type === "Property" &&
              prop.value.type === "Literal" &&
              typeof prop.value.value === "string"
            ) {
              context.report({ node: prop.value, messageId: "staticStyle" });
            }
          }
        },
      };
    },
  },

  // ── CNST-001: Hardcoded route string in router.push/replace ───────────────
  "no-hardcoded-route": {
    meta: {
      type: "suggestion",
      docs: {
        description:
          "Use ROUTES from @/constants for all router.push/replace calls — never pass a literal string. (CNST-001)",
      },
      schema: [],
      messages: {
        hardcodedRoute:
          "Hardcoded route in router.{{method}}() — use ROUTES from @/constants.",
      },
    },
    create(context) {
      const filename = getFilename(context);
      if (isTestFile(filename)) return {};
      if (isApiRoute(filename)) return {};
      return {
        CallExpression(node) {
          if (
            node.callee.type === "MemberExpression" &&
            node.callee.object.type === "Identifier" &&
            node.callee.object.name === "router" &&
            ["push", "replace", "prefetch"].includes(
              node.callee.property.name,
            ) &&
            node.arguments.length > 0 &&
            node.arguments[0].type === "Literal" &&
            typeof node.arguments[0].value === "string" &&
            /^\/[a-z]/.test(node.arguments[0].value)
          ) {
            context.report({
              node: node.arguments[0],
              messageId: "hardcodedRoute",
              data: { method: node.callee.property.name },
            });
          }
        },
      };
    },
  },

  // ── CNST-003: Hardcoded Firestore collection name ──────────────────────────
  "no-hardcoded-collection": {
    meta: {
      type: "suggestion",
      docs: {
        description:
          "Firestore collection names must come from constants in @/db/schema — never hardcode them as strings. (CNST-003)",
      },
      schema: [],
      messages: {
        hardcodedCollection:
          "Hardcoded collection name '{{name}}' — import the constant from @/db/schema.",
      },
    },
    create(context) {
      if (isTestFile(getFilename(context))) return {};
      return {
        CallExpression(node) {
          if (
            node.callee.type === "MemberExpression" &&
            node.callee.property.name === "collection" &&
            node.arguments.length > 0 &&
            node.arguments[0].type === "Literal" &&
            KNOWN_COLLECTIONS.has(node.arguments[0].value)
          ) {
            context.report({
              node: node.arguments[0],
              messageId: "hardcodedCollection",
              data: { name: node.arguments[0].value },
            });
          }
        },
      };
    },
  },

  // ── QUAL-004: Firebase triggers / scheduled jobs in Next.js API routes ─────
  "no-firebase-trigger-in-api": {
    meta: {
      type: "problem",
      docs: {
        description:
          "onSchedule, onDocumentCreated etc. must live in functions/src/, not in Next.js API routes. (QUAL-004)",
      },
      schema: [],
      messages: {
        triggerInApi:
          "{{fn}}() in a Next.js API route — move to functions/src/jobs/ or functions/src/triggers/.",
      },
    },
    create(context) {
      if (!isApiRoute(getFilename(context))) return {};
      return {
        CallExpression(node) {
          if (
            node.callee.type === "Identifier" &&
            FIREBASE_TRIGGER_FNS.has(node.callee.name)
          ) {
            context.report({
              node: node.callee,
              messageId: "triggerInApi",
              data: { fn: node.callee.name },
            });
          }
        },
      };
    },
  },
};

// ─── Plugin object ────────────────────────────────────────────────────────────

const plugin = {
  meta: { name: "@mohasinac/eslint-plugin", version: "0.1.0" },
  rules,
};

// Recommended flat config — spread into your eslint.config.mjs array.
// Each entry targets the narrowest file set that makes sense for the rule group.
plugin.configs = {
  recommended: [
    // ── All TS/TSX files in src/ ─────────────────────────────────────────────
    {
      files: ["src/**/*.{ts,tsx}"],
      plugins: { lir: plugin },
      rules: {
        // Architecture
        "lir/no-deep-barrel-import": "warn", // ARCH-001 — fixable with --fix
        "lir/no-cross-feature-import": "warn", // ARCH-002
        "lir/no-tier1-feature-import": "warn", // ARCH-004

        // i18n (wrong router = runtime locale bug)
        "lir/use-i18n-navigation": "warn", // I18N-001, I18N-002 — fixable with --fix

        // Firebase security / architecture
        "lir/no-firebase-client-in-ui": "warn", // FIREBASE-001, FIREBASE-002
        "lir/no-firebase-admin-outside-backend": "warn", // FIREBASE-003
        "lir/no-direct-firestore-query": "warn", // FIREBASE-004
        "lir/no-firebase-trigger-in-api": "warn", // QUAL-004

        // Service layer
        "lir/no-fetch-in-ui": "warn", // SVC-001
        "lir/no-apiclient-outside-services": "warn", // SVC-002
        "lir/no-hardcoded-api-path": "warn", // SVC-003

        // Constants
        "lir/no-hardcoded-route": "warn", // CNST-001
        "lir/no-hardcoded-collection": "warn", // CNST-003
      },
    },
    // ── TSX files only — JSX-specific rules ──────────────────────────────────
    {
      files: ["src/**/*.tsx"],
      plugins: { lir: plugin },
      rules: {
        "lir/no-raw-html-elements": "warn", // COMP-001 → COMP-009
        "lir/no-raw-media-elements": "warn", // MEDIA-001 → MEDIA-003
        "lir/no-inline-static-style": "warn", // STYL-002
      },
    },
  ],
};

export default plugin;
