// @ts-check
/**
 * letitrip-local ESLint plugin — consumer-side rules that mirror audit-*.mjs
 * scripts so the editor flags violations inline (instead of waiting for the
 * stop hook or `npm run check`).
 *
 * Namespace: `letitrip/*` (kept distinct from the shared `lir/*` plugin at
 * `../../packages/packages/eslint-plugin-letitrip/` so this plugin can ship
 * consumer-specific rules without forking the shared monorepo plugin).
 *
 * Each rule pairs with one of the audit scripts in `scripts/`. The rule's
 * regex / detection should stay in sync with the matching audit; when the
 * audit's pattern changes, update the rule too.
 *
 * Rules:
 *   letitrip/no-double-navigation        ← audit-double-navigation     (root-cause #13)
 *   letitrip/no-jsx-text-comment         ← audit-jsx-text-comments
 *   letitrip/no-hardcoded-sticky-offset  ← audit-sticky-offsets        (root-cause #2)
 *   letitrip/no-dark-mode-orphan         ← audit-dark-mode (orphan rule subset)
 *   letitrip/no-button-as-toggle         ← audit-code-quality/BUTTON_AS_TOGGLE (root-cause #15)
 *
 * Deferred (cannot fix in this lane):
 * - `appkit/src/features/forms/Toggle.tsx:68` — the Toggle primitive itself
 *   uses `<Button role="switch">` (the root-cause #15 anti-pattern). Fixing
 *   it requires rewriting the primitive's JSX to render a native `<button>`
 *   with switch styling. Until that lands, `no-button-as-toggle` ships as
 *   "warn" so it surfaces in editor without blocking `npm run check:lint`.
 */

/** Return the className string when the JSXAttribute value is a static literal or simple template. */
function extractClassName(attr) {
  if (!attr || !attr.value) return null;
  if (attr.value.type === "Literal") {
    return typeof attr.value.value === "string" ? attr.value.value : null;
  }
  if (attr.value.type === "JSXExpressionContainer") {
    const expr = attr.value.expression;
    if (expr.type === "Literal" && typeof expr.value === "string") return expr.value;
    if (expr.type === "TemplateLiteral") {
      return expr.quasis.map((q) => q.value.raw).join(" ");
    }
  }
  return null;
}

const rules = {
  // ── ROOT-CAUSE #13: Double router.replace via table.set + table.setPage ────
  "no-double-navigation": {
    meta: {
      type: "problem",
      docs: {
        description:
          "table.set(key, v) followed by table.setPage(N) issues a second router.replace() that overwrites the first URL update — the sort/filter change is lost (root-cause #13).",
      },
      schema: [],
      messages: {
        doubleNav:
          "`table.setPage(...)` called immediately after `table.set(...)` — remove the setPage call. `table.set()` already resets page for any key not in NON_RESETTING_KEYS, so the second call reads stale searchParams and overwrites the first URL update.",
      },
    },
    create(context) {
      const sourceCode = context.sourceCode ?? context.getSourceCode?.();

      function isTableSet(node) {
        return (
          node.type === "CallExpression" &&
          node.callee.type === "MemberExpression" &&
          node.callee.object.type === "Identifier" &&
          node.callee.object.name === "table" &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "set"
        );
      }
      function isTableSetPage(node) {
        return (
          node.type === "CallExpression" &&
          node.callee.type === "MemberExpression" &&
          node.callee.object.type === "Identifier" &&
          node.callee.object.name === "table" &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "setPage"
        );
      }

      function checkSiblings(siblings) {
        if (!Array.isArray(siblings)) return;
        for (let i = 0; i < siblings.length - 1; i++) {
          const a = siblings[i];
          const b = siblings[i + 1];
          if (
            a.type === "ExpressionStatement" &&
            isTableSet(a.expression) &&
            b.type === "ExpressionStatement" &&
            isTableSetPage(b.expression)
          ) {
            context.report({ node: b.expression, messageId: "doubleNav" });
          }
        }
      }

      return {
        BlockStatement(node) {
          checkSiblings(node.body);
        },
        Program(node) {
          checkSiblings(node.body);
        },
      };
    },
  },

  // ── JSX-text-comment: `//` between JSX siblings renders as DOM text ───────
  "no-jsx-text-comment": {
    meta: {
      type: "problem",
      docs: {
        description:
          "A `// comment` line between two JSX elements becomes a JSXText node and renders into the DOM as literal text. Use {/* JSX comment */} syntax or move the comment inside a prop list.",
      },
      schema: [],
      messages: {
        jsxTextComment:
          "`// comment` in JSX child position renders as literal text in the DOM. Convert to `{/* ... */}` JSX comment syntax or move the comment into the next element's prop list.",
      },
    },
    create(context) {
      function checkChildren(children) {
        if (!Array.isArray(children)) return;
        for (const child of children) {
          if (child.type !== "JSXText") continue;
          const lines = child.value.split("\n");
          for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (trimmed.startsWith("//")) {
              const loc = {
                start: {
                  line: child.loc.start.line + i,
                  column: lines[i].indexOf("//"),
                },
                end: {
                  line: child.loc.start.line + i,
                  column: lines[i].length,
                },
              };
              context.report({ loc, messageId: "jsxTextComment" });
            }
          }
        }
      }

      return {
        JSXElement(node) {
          checkChildren(node.children);
        },
        JSXFragment(node) {
          checkChildren(node.children);
        },
      };
    },
  },

  // ── ROOT-CAUSE #2: hardcoded `sticky top-N` instead of --header-height ────
  "no-hardcoded-sticky-offset": {
    meta: {
      type: "problem",
      docs: {
        description:
          "Sticky elements must use `top-[var(--header-height,0px)]`, not hardcoded `top-N`. `--header-height` is written at runtime by AppLayoutShell and tracks the real header height (root-cause #2).",
      },
      schema: [],
      messages: {
        hardcodedSticky:
          "Sticky element has a hardcoded `top-N` offset. Use `top-[var(--header-height,0px)]` so the offset tracks the real header height. Add `// audit-sticky-offset-ok: <reason>` for non-header-relative stickies.",
      },
    },
    create(context) {
      // Co-occurrence: `sticky` and `top-N` (where N is a magic number) on the
      // same className value. `top-0` excluded — correct inside overflow scroll.
      const STICKY_HARDCODED =
        /(?:\bsticky\b[^"`'\n]*?(?<![-\w])top-(?:8|10|12|14|16|20|24|28|32|\[\d+(?:px|rem)\])|(?<![-\w])top-(?:8|10|12|14|16|20|24|28|32|\[\d+(?:px|rem)\])[^"`'\n]*?\bsticky\b)/;

      return {
        JSXAttribute(node) {
          if (!node.name || node.name.name !== "className") return;
          const cls = extractClassName(node);
          if (typeof cls !== "string") return;
          if (STICKY_HARDCODED.test(cls)) {
            context.report({ node, messageId: "hardcodedSticky" });
          }
        },
      };
    },
  },

  // ── Dark-mode orphan: `dark:text-X` / `dark:bg-X` without base sibling ────
  "no-dark-mode-orphan": {
    meta: {
      type: "suggestion",
      docs: {
        description:
          "`dark:text-zinc-X` without a base `text-*` class (or `dark:bg-zinc-X` without `bg-*`) leaves the light-mode style undefined. Both modes need explicit color tokens.",
      },
      schema: [],
      messages: {
        orphanText:
          "`{{match}}` is an orphan dark-mode token (no base `text-*` class in the same className). Add the matching light-mode color so both modes render explicitly.",
        orphanBg:
          "`{{match}}` is an orphan dark-mode token (no base `bg-*` class in the same className). Add the matching light-mode color so both modes render explicitly.",
      },
    },
    create(context) {
      const ORPHAN_DARK_TEXT = /\bdark:text-(?:zinc|neutral)-\d+\b/;
      const ORPHAN_DARK_BG = /\bdark:bg-(?:zinc|neutral)-\d+\b/;
      // Base color regex must NOT match `dark:text-X` / `dark:bg-X` itself —
      // require start of string or whitespace before the token so `dark:` etc.
      // prefixes don't satisfy the "base class present" condition.
      const HAS_BASE_TEXT =
        /(?:^|\s)text-(?:zinc|neutral|slate|gray|white|black|primary|secondary|emerald|blue|red|green|orange|yellow|purple|indigo|amber|inherit|current|transparent)/;
      const HAS_BASE_BG =
        /(?:^|\s)bg-(?:zinc|neutral|slate|gray|white|black|primary|secondary|emerald|blue|red|green|orange|yellow|purple|indigo|amber|transparent)/;

      function isPrefixed(match, cls) {
        const idx = cls.indexOf(match);
        if (idx <= 0) return false;
        const before = cls.substring(Math.max(0, idx - 20), idx);
        return /(?:placeholder|focus|hover|active|group-hover|peer):$/.test(before);
      }

      return {
        JSXAttribute(node) {
          if (!node.name || node.name.name !== "className") return;
          const cls = extractClassName(node);
          if (typeof cls !== "string") return;

          const orphanText = cls.match(ORPHAN_DARK_TEXT);
          if (orphanText && !isPrefixed(orphanText[0], cls) && !HAS_BASE_TEXT.test(cls)) {
            context.report({ node, messageId: "orphanText", data: { match: orphanText[0] } });
          }
          const orphanBg = cls.match(ORPHAN_DARK_BG);
          if (orphanBg && !isPrefixed(orphanBg[0], cls) && !HAS_BASE_BG.test(cls)) {
            context.report({ node, messageId: "orphanBg", data: { match: orphanBg[0] } });
          }
        },
      };
    },
  },

  // ── ROOT-CAUSE #15: <Button role="switch"> defeats toggle styling ──────────
  "no-button-as-toggle": {
    meta: {
      type: "problem",
      docs: {
        description:
          "`<Button role=\"switch\">` is the wrong primitive for a toggle pill — Button's internal padding overrides the custom sizing classes. Use the appkit `<Toggle>` primitive (renders a native button with switch styling) (root-cause #15).",
      },
      schema: [],
      messages: {
        buttonAsToggle:
          "<Button role=\"switch\"> — Button styles override sizing classes (w-10 h-6) and render as a grey circle. Use the appkit <Toggle checked onChange size> primitive instead.",
      },
    },
    create(context) {
      return {
        JSXOpeningElement(node) {
          if (node.name.type !== "JSXIdentifier" || node.name.name !== "Button") return;
          const roleAttr = node.attributes.find(
            (a) => a.type === "JSXAttribute" && a.name && a.name.name === "role",
          );
          if (!roleAttr || !roleAttr.value) return;
          const roleValue =
            roleAttr.value.type === "Literal"
              ? roleAttr.value.value
              : roleAttr.value.type === "JSXExpressionContainer" &&
                roleAttr.value.expression.type === "Literal"
              ? roleAttr.value.expression.value
              : null;
          if (roleValue === "switch") {
            context.report({ node, messageId: "buttonAsToggle" });
          }
        },
      };
    },
  },
};

const plugin = {
  meta: { name: "letitrip-eslint-rules", version: "0.1.0" },
  rules,
};

export default plugin;
