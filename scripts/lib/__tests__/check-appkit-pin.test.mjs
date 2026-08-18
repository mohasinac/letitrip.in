import { describe, it, expect } from "vitest";
import { checkAppkitPin } from "../check-appkit-pin.mjs";

// Regression test for 2026-08-17 commit 99c0509db — a prior "publish appkit"
// session left package.json pinned to the npm registry instead of
// "file:./appkit", silently making local appkit/src/ edits invisible to
// `npm run dev` for a full session before anyone noticed.
describe("checkAppkitPin", () => {
  it("flags an npm-registry semver pin", () => {
    const pkg = { dependencies: { "@mohasinac/appkit": "^3.9.1" } };
    expect(checkAppkitPin(pkg)).toBe("^3.9.1");
  });

  it("flags an exact npm-registry version pin", () => {
    const pkg = { dependencies: { "@mohasinac/appkit": "4.0.0" } };
    expect(checkAppkitPin(pkg)).toBe("4.0.0");
  });

  it("passes a file: pin", () => {
    const pkg = { dependencies: { "@mohasinac/appkit": "file:./appkit" } };
    expect(checkAppkitPin(pkg)).toBeNull();
  });

  it("passes when the dependency is absent", () => {
    expect(checkAppkitPin({ dependencies: {} })).toBeNull();
    expect(checkAppkitPin({})).toBeNull();
  });
});
