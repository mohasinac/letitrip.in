import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

// Regression test for 2026-08-17 commit 40d856b90 — /media requests were
// locale-prefixed by next-intl before next.config.js's /media -> /api/media
// rewrite could run, breaking every image on the site. The matcher must
// exclude /media alongside /api/_next/_vercel/dotted-paths.
//
// Reads the matcher pattern directly out of the source file (as text) rather
// than `import`-ing src/proxy.ts — that file constructs next-intl's edge
// middleware at module scope, which Vitest's environment cannot evaluate.
function readMatcherPattern(): string {
  const source = readFileSync(join(__dirname, "..", "proxy.ts"), "utf8");
  const match = source.match(/matcher:\s*\[\s*"([^"]+)"/);
  if (!match) throw new Error("Could not find `matcher` pattern in src/proxy.ts");
  // JSON.parse unescapes the raw source text (e.g. "\\." -> "\.") the same
  // way the TS compiler would when parsing the original string literal.
  return JSON.parse(`"${match[1]}"`);
}

describe("proxy middleware matcher", () => {
  const matcherRegex = new RegExp(`^${readMatcherPattern()}$`);

  it("excludes /media/<slug> requests (extensionless, no dotted path)", () => {
    expect(matcherRegex.test("/media/abc123")).toBe(false);
    expect(matcherRegex.test("/media/product-image-charizard-1-20260508")).toBe(false);
  });

  it("excludes /api requests", () => {
    expect(matcherRegex.test("/api/products")).toBe(false);
  });

  it("excludes _next and _vercel internals", () => {
    expect(matcherRegex.test("/_next/static/chunk.js")).toBe(false);
    expect(matcherRegex.test("/_vercel/insights/script.js")).toBe(false);
  });

  it("excludes dotted asset paths", () => {
    expect(matcherRegex.test("/favicon.ico")).toBe(false);
    expect(matcherRegex.test("/robots.txt")).toBe(false);
  });

  it("still matches normal page routes (needs locale handling)", () => {
    expect(matcherRegex.test("/products")).toBe(true);
    expect(matcherRegex.test("/admin/dashboard")).toBe(true);
    expect(matcherRegex.test("/")).toBe(true);
  });
});
