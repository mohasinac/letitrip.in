import { describe, it, expect } from "vitest";
import { detectConflict } from "../coupon-conflict";

type AppliedCoupon = { code: string; scope: "admin" | "seller"; storeId?: string; combineWithSellerCoupons?: boolean };

function applied(overrides: Partial<AppliedCoupon>): AppliedCoupon {
  return { code: "CODE", scope: "admin", ...overrides };
}

describe("detectConflict — no conflict", () => {
  it("empty existing array → always null", () => {
    expect(detectConflict([], { code: "NEW10", scope: "admin" })).toBeNull();
  });

  it("two seller coupons from different stores → null", () => {
    const existing = [applied({ scope: "seller", storeId: "store-A" })];
    expect(detectConflict(
      existing as never,
      { code: "OTHER", scope: "seller", storeId: "store-B" },
    )).toBeNull();
  });

  it("admin coupon combineWithSellerCoupons=true + existing seller → null", () => {
    const existing = [applied({ scope: "seller", storeId: "store-A" })];
    expect(detectConflict(
      existing as never,
      { code: "ADMIN10", scope: "admin", combineWithSellerCoupons: true },
    )).toBeNull();
  });

  it("incoming seller + existing admin combineWithSellerCoupons=true → null", () => {
    const existing = [applied({ scope: "admin", combineWithSellerCoupons: true })];
    expect(detectConflict(
      existing as never,
      { code: "SELLER10", scope: "seller", storeId: "store-A" },
    )).toBeNull();
  });

  it("two admin coupons → null (admin vs admin always allowed)", () => {
    const existing = [applied({ scope: "admin", code: "ADMIN1", combineWithSellerCoupons: false })];
    expect(detectConflict(
      existing as never,
      { code: "ADMIN2", scope: "admin" },
    )).toBeNull();
  });
});

describe("detectConflict — same code duplicate", () => {
  it("same code already in existing → returns conflict message", () => {
    const existing = [applied({ code: "WELCOME10", scope: "admin" })];
    const result = detectConflict(
      existing as never,
      { code: "WELCOME10", scope: "admin" },
    );
    expect(result).not.toBeNull();
    expect(result).toContain("WELCOME10");
  });
});

describe("detectConflict — seller × seller same store", () => {
  it("second seller coupon for same storeId → returns conflict message", () => {
    const existing = [applied({ scope: "seller", code: "STORE20", storeId: "store-A" })];
    const result = detectConflict(
      existing as never,
      { code: "STORE30", scope: "seller", storeId: "store-A" },
    );
    expect(result).not.toBeNull();
    expect(result).toContain("STORE20");
  });
});

describe("detectConflict — admin coupon blocks seller", () => {
  it("incoming admin combineWithSellerCoupons=false + existing seller → conflict", () => {
    const existing = [applied({ scope: "seller", code: "SELLER10" })];
    const result = detectConflict(
      existing as never,
      { code: "VIP20", scope: "admin", combineWithSellerCoupons: false },
    );
    expect(result).not.toBeNull();
    expect(result).toContain("SELLER10");
    expect(result).toContain("VIP20");
  });
});

describe("detectConflict — seller blocked by admin", () => {
  it("incoming seller + existing admin combineWithSellerCoupons=false → conflict", () => {
    const existing = [applied({ scope: "admin", code: "ADMIN20", combineWithSellerCoupons: false })];
    const result = detectConflict(
      existing as never,
      { code: "SELLER5", scope: "seller", storeId: "store-A" },
    );
    expect(result).not.toBeNull();
    expect(result).toContain("ADMIN20");
  });
});
