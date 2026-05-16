// @ts-check
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import lirPlugin from "../packages/packages/eslint-plugin-letitrip/index.js";
import reactPlugin from "eslint-plugin-react";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import { defineEslintConfig } from "@mohasinac/appkit/configs";

/**
 * ESLint flat config for LetItRip (Phase 18.19 baseline).
 *
 * Plugins are registered so that existing `eslint-disable` comments for
 * react-hooks and @next/next rules are not reported as "rule not found".
 * Plugin rules are set to "warn" to allow gradual adoption.
 * Strict mode (errors instead of warnings) is tracked in TECH_DEBT.md.
 */
export default tseslint.config(
  // appkit base: global ignores + no-hardcoded-route lint rule
  ...defineEslintConfig(),
  // Recommended TypeScript rules
  ...tseslint.configs.recommended,
  // Register react-hooks plugin — prevents "Definition for rule not found" errors
  // on existing eslint-disable-next-line comments in source files
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  // Register react + jsx-a11y plugins globally so eslint-disable comments in
  // src/ and packages/ referencing these rules don't produce "rule not found" errors.
  {
    plugins: { react: reactPlugin, "jsx-a11y": jsxA11yPlugin },
    rules: {
      "react/no-unknown-property": "warn",
      "jsx-a11y/media-has-caption": "warn",
      "jsx-a11y/no-autofocus": "warn",
    },
  },
  // Register @next/next plugin — same rationale as above
  {
    plugins: { "@next/next": nextPlugin },
    rules: {
      // warn — MEDIA-001 is also caught by lir/no-raw-media-elements
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  // ── LetItRip architectural rules (lir/) ─────────────────────────────────
  // Maps to all violation codes in scripts/check-violations.js.
  // Auto-fixable rules: lir/no-deep-barrel-import, lir/use-i18n-navigation
  //   → run: npm run lint:fix
  ...lirPlugin.configs.recommended,
  // ── packages/** — extend lint coverage to workspace packages ────────────
  // Barrel / feature / Firebase rules don't apply (packages are standalone
  // libraries that have no @/ aliases or feature-tier structure).
  // Base TypeScript quality overrides applied to all packages (mirror src/).
  {
    files: ["packages/*/src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "prefer-const": "off",
    },
  },
  // Each package file set only disables rules that its code legitimately needs
  // to bypass by design.
  {
    // @mohasinac/core — Logger is the console transport; StorageManager calls fetch()
    files: ["packages/core/src/**/*.{ts,tsx}"],
    plugins: { lir: lirPlugin },
    rules: {
      "lir/no-deep-barrel-import": "off",
      "lir/no-cross-feature-import": "off",
      "lir/no-tier1-feature-import": "off",
      "lir/no-fat-page": "off",
      "lir/use-i18n-navigation": "off",
      "lir/no-firebase-client-in-ui": "off",
      "lir/no-firebase-admin-outside-backend": "off",
      "lir/no-direct-firestore-query": "off",
      "lir/no-fetch-in-ui": "off",       // StorageManager uses fetch() legitimately
      "lir/no-apiclient-outside-services": "off",
      "lir/no-hardcoded-api-path": "off",
      "lir/no-hardcoded-route": "off",
      "lir/no-hardcoded-collection": "off",
      "lir/no-firebase-trigger-in-api": "off",
      "lir/no-module-scope-translations": "off",
      "lir/no-deprecated-annotations": "off",
      "lir/no-raw-date": "off",
      "lir/no-fixed-media-height": "off",
      "lir/require-xl-breakpoints": "off",
      "no-console": "off",               // Logger IS the console transport
    },
  },
  {
    // @mohasinac/http — ApiClient owns the fetch() call; this IS the HTTP wrapper
    files: ["packages/http/src/**/*.{ts,tsx}"],
    plugins: { lir: lirPlugin },
    rules: {
      "lir/no-deep-barrel-import": "off",
      "lir/no-cross-feature-import": "off",
      "lir/no-tier1-feature-import": "off",
      "lir/no-fat-page": "off",
      "lir/use-i18n-navigation": "off",
      "lir/no-firebase-client-in-ui": "off",
      "lir/no-firebase-admin-outside-backend": "off",
      "lir/no-direct-firestore-query": "off",
      "lir/no-fetch-in-ui": "off",       // ApiClient IS the fetch wrapper
      "lir/no-apiclient-outside-services": "off",
      "lir/no-hardcoded-api-path": "off",
      "lir/no-hardcoded-route": "off",
      "lir/no-hardcoded-collection": "off",
      "lir/no-firebase-trigger-in-api": "off",
      "lir/no-module-scope-translations": "off",
      "lir/no-deprecated-annotations": "off",
      "lir/no-raw-date": "off",
      "lir/no-fixed-media-height": "off",
      "lir/require-xl-breakpoints": "off",
    },
  },
  {
    // @mohasinac/next — thin Next.js utilities; no app-layer structure
    files: ["packages/next/src/**/*.{ts,tsx}"],
    plugins: { lir: lirPlugin },
    rules: {
      "lir/no-deep-barrel-import": "off",
      "lir/no-cross-feature-import": "off",
      "lir/no-tier1-feature-import": "off",
      "lir/no-fat-page": "off",
      "lir/use-i18n-navigation": "off",
      "lir/no-firebase-client-in-ui": "off",
      "lir/no-firebase-admin-outside-backend": "off",
      "lir/no-direct-firestore-query": "off",
      "lir/no-fetch-in-ui": "off",
      "lir/no-apiclient-outside-services": "off",
      "lir/no-hardcoded-api-path": "off",
      "lir/no-hardcoded-route": "off",
      "lir/no-hardcoded-collection": "off",
      "lir/no-firebase-trigger-in-api": "off",
      "lir/no-module-scope-translations": "off",
      "lir/no-deprecated-annotations": "off",
      "lir/no-raw-date": "off",
      "lir/no-fixed-media-height": "off",
      "lir/require-xl-breakpoints": "off",
    },
  },
  {
    // @mohasinac/react — UI hooks; no routing, no Firebase, no fetch
    files: ["packages/react/src/**/*.{ts,tsx}"],
    plugins: { lir: lirPlugin },
    rules: {
      "lir/no-deep-barrel-import": "off",
      "lir/no-cross-feature-import": "off",
      "lir/no-tier1-feature-import": "off",
      "lir/no-fat-page": "off",
      "lir/use-i18n-navigation": "off",
      "lir/no-firebase-client-in-ui": "off",
      "lir/no-firebase-admin-outside-backend": "off",
      "lir/no-direct-firestore-query": "off",
      "lir/no-fetch-in-ui": "off",
      "lir/no-apiclient-outside-services": "off",
      "lir/no-hardcoded-api-path": "off",
      "lir/no-hardcoded-route": "off",
      "lir/no-hardcoded-collection": "off",
      "lir/no-firebase-trigger-in-api": "off",
      "lir/no-module-scope-translations": "off",
      "lir/no-deprecated-annotations": "off",
      "lir/no-raw-date": "off",
      "lir/no-fixed-media-height": "off",
      "lir/require-xl-breakpoints": "off",
    },
  },
  {
    // @mohasinac/ui — primitive component implementations.
    // These files ARE the raw-element wrappers — flagging raw HTML inside them
    // would be a false positive. All other lir/ rules (service layer, Firebase,
    // i18n navigation) are irrelevant and turned off for this standalone package.
    files: ["packages/ui/src/**/*.{ts,tsx}"],
    plugins: { lir: lirPlugin, react: reactPlugin },
    rules: {
      "lir/no-deep-barrel-import": "off",
      "lir/no-cross-feature-import": "off",
      "lir/no-tier1-feature-import": "off",
      "lir/use-i18n-navigation": "off",
      "lir/no-firebase-client-in-ui": "off",
      "lir/no-firebase-admin-outside-backend": "off",
      "lir/no-direct-firestore-query": "off",
      "lir/no-fetch-in-ui": "off",
      "lir/no-apiclient-outside-services": "off",
      "lir/no-hardcoded-api-path": "off",
      "lir/no-hardcoded-route": "off",
      "lir/no-hardcoded-collection": "off",
      "lir/no-firebase-trigger-in-api": "off",
      "lir/no-module-scope-translations": "off",
      "lir/no-deprecated-annotations": "off",
      "lir/no-raw-date": "off",
      "lir/no-fat-page": "off",
      // Semantic.tsx, Typography.tsx, Button.tsx, Select.tsx, DataTable.tsx etc.
      // are the primitive implementations — they must use raw HTML elements.
      "lir/no-raw-html-elements": "off",
      // ImageLightbox.tsx uses <img> directly — the eslint-disable comment
      // in that file suppresses @next/next/no-img-element on that line.
      "lir/no-raw-media-elements": "off",
      // Inline styles in primitives are intentional token-level one-offs.
      "lir/no-inline-static-style": "off",
      // Fixed heights and grid columns are intentional in primitives.
      "lir/no-fixed-media-height": "off",
      "lir/require-xl-breakpoints": "off",
      // Progress.tsx and Skeleton.tsx use dangerouslySetInnerHTML for CSS injection.
      // Register the plugin so eslint-disable-next-line react/no-danger is valid.
      "react/no-danger": "warn",
    },
  },
  {
    files: ["src/**/*.tsx", "packages/*/src/**/*.tsx"],
    rules: {
      "lir/no-raw-html-elements": "error",
      "lir/no-raw-media-elements": "error",
    },
  },
  {
    // Scope general quality rules to src/ only so they don't override package
    // exceptions declared above (e.g. no-console off in @mohasinac/core Logger).
    files: ["src/**"],
    rules: {
      // QUAL-001: No console.* in production code — use logger / serverLogger
      "no-console": "warn",
      // QUAL-002: No native dialog functions — use useMessage() / ConfirmDeleteModal
      "no-alert": "warn",
      // Off — allow `any` in a large Next.js codebase (enables gradual typing)
      "@typescript-eslint/no-explicit-any": "off",
      // Warn on unused vars with _ prefix exception
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Off — CJS require() is used in some config and API files
      "@typescript-eslint/no-require-imports": "off",
      // Off — empty interfaces / types are intentional in some definitions
      "@typescript-eslint/no-empty-object-type": "off",
      // Warn only — pre-existing patterns, tracked in TECH_DEBT.md
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
      // Off — Function type used intentionally in several utility signatures
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      // Off — prefer-const may conflict with destructuring patterns in this codebase
      "prefer-const": "off",
    },
  },
  {
    // useChat.ts and useRealtimeEvent.ts must sign in with Firebase Auth
    // custom tokens to subscribe to Realtime Database — this is a legitimate
    // client-side use of firebase/auth for RTDB channel auth, not admin code.
    files: [
      "src/hooks/useChat.ts",
      "src/hooks/useRealtimeEvent.ts",
    ],
    rules: {
      "lir/no-firebase-client-in-ui": "off",
    },
  },
  {
    // Server Actions run on the server — Firebase Admin SDK is permitted.
    files: ["src/actions/**/*.ts"],
    rules: {
      "lir/no-firebase-admin-outside-backend": "off",
    },
  },
  {
    // server-logger.ts + client-logger.ts ARE the console transports.
    // proxy.ts uses console.error for Edge-compatible error reporting.
    files: [
      "src/lib/server-logger.ts",
      "src/lib/client-logger.ts",
      "src/proxy.ts",
    ],
    rules: {
      "no-console": "off",
    },
  },
  {
    // proxy.ts: middleware runs at the Edge — ROUTES import works but the
    // no-restricted-syntax rule fires on the path-prefix strings used for
    // tier detection. Date.now() is used for request timing, not UI rendering.
    files: ["src/proxy.ts"],
    rules: {
      "no-restricted-syntax": "off",
      "lir/no-raw-date": "off",
    },
  },
  {
    // Dev tools (DevToolbar, SeedPanel, etc.) are never shipped to production
    // users. Relaxed rules: they use inline styles for overlay positioning,
    // direct fetch() for seed operations, and hardcoded routes for convenience.
    files: ["src/components/dev/**"],
    rules: {
      "no-restricted-syntax": "off",
      "lir/no-fetch-in-ui": "off",
      "lir/no-inline-static-style": "off",
      "lir/no-hardcoded-grid-cols": "off",
    },
  },
  {
    // CartRouteClient + CheckoutRouteClient are orchestrator-level client
    // components that intentionally call fetch() directly to coordinate
    // cart state, coupon validation, and payment flow — not a query hook pattern.
    files: ["src/components/routing/**"],
    rules: {
      "lir/no-fetch-in-ui": "off",
    },
  },
  {
    // Newsletter form and footer slot use a single fire-and-forget fetch() for
    // newsletter subscription — converting to react-query adds no value here.
    files: [
      "src/components/homepage/**",
      "src/components/layout/**",
    ],
    rules: {
      "lir/no-fetch-in-ui": "off",
    },
  },
  {
    // ClientProviderBootstrap + register-client-providers bootstrap the Firebase
    // Auth client SDK for Google OAuth + session hydration. These ARE the
    // legitimate client-side firebase/auth call sites.
    files: [
      "src/app/*/ClientProviderBootstrap.tsx",
      "src/app/*/register-client-providers.ts",
    ],
    rules: {
      "lir/no-firebase-client-in-ui": "off",
    },
  },
  {
    // App Router pages/layouts/client-components have these by-design patterns:
    //   no-restricted-syntax: breadcrumbs, redirect maps, and metadata path
    //     strings all use hardcoded route values — converting every metadata
    //     `path:` to ROUTES.* is tracked in TECH_DEBT.md (ROUTES-meta sweep).
    //   no-fetch-in-ui: RSC pages call fetch() legitimately on the server;
    //     "use client" pages that call fetch() directly are tracked tech debt.
    //   no-fat-page: App Router forces framework boilerplate (generateMetadata,
    //     generateStaticParams, Suspense wrappers) into page.tsx — line counts
    //     inflate beyond the 150-line threshold for structural reasons.
    //   no-raw-date: new Date() / Date.now() in RSC pages and client-side
    //     timestamps are accepted here; the rule targets non-UI utility code.
    files: ["src/app/**/*.tsx", "src/app/**/*.ts"],
    rules: {
      "no-restricted-syntax": "off",
      "lir/no-fetch-in-ui": "off",
      "lir/no-fat-page": "off",
      "lir/no-raw-date": "off",
      // App-level page layouts have legitimately fixed grid column counts;
      // FLUID_GRID tokens and xl:/2xl: breakpoints are tracked in TECH_DEBT.md.
      "lir/no-hardcoded-grid-cols": "off",
      "lir/require-xl-breakpoints": "off",
    },
  },
  {
    // Dev API routes (mock-razorpay, seed endpoints) use hardcoded strings
    // intentionally — they are never called in production.
    files: ["src/app/api/dev/**"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  {
    // __mocks__: test doubles follow different conventions; date + var patterns
    // are intentional testing artifacts.
    files: ["src/__mocks__/**"],
    rules: {
      "lir/no-raw-date": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // social-feed routes call external APIs and log errors for debugging;
    // no logger abstraction exists at the Edge-compatible route layer.
    files: ["src/app/api/social-feed/**"],
    rules: {
      "no-console": "off",
    },
  },
  {
    // store-addresses route references the 'addresses' collection by string
    // because it performs raw Firestore queries via the Admin SDK, not the
    // addressesRepository abstraction — collection name is stable/correct here.
    files: ["src/app/api/admin/store-addresses/**"],
    rules: {
      "lir/no-hardcoded-collection": "off",
    },
  },
  {
    // brand.ts: brand-level constants include founding year / epoch dates that
    // are intentional Date objects, not UI timestamps.
    // request-schemas.ts: Zod schema defaults use new Date() for date range
    // validation boundaries — no nowMs()/nowISO() equivalent is available in Zod.
    files: [
      "src/constants/brand.ts",
      "src/validation/request-schemas.ts",
    ],
    rules: {
      "lir/no-raw-date": "off",
    },
  },
  {
    // Ignore generated / non-source files
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "dist/**",
      "packages/*/dist/**",
      "packages/eslint-plugin-letitrip/**", // plain JS plugin — not TypeScript
      "*.config.js",
      "postcss.config.js",
      "tailwind.config.js",
      "jest.config.ts",
      "jest.setup.ts",
      "scripts/**",
      "src/sw.ts",
    ],
  },
);

