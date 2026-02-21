/**
 * Tests for useRBAC hooks
 * Phase 18.3 — Security / UX Hooks
 */

import { renderHook } from "@testing-library/react";
import {
  useHasRole,
  useIsAdmin,
  useIsModerator,
  useIsSeller,
  useCanAccess,
  useRoleChecks,
  useIsOwner,
} from "../useRBAC";

// ─── Mock @/contexts ──────────────────────────────────────────────────────────
// We control useSession return value per-test via mockSessionUser
let mockSessionUser: {
  role: string;
  uid: string;
  emailVerified: boolean;
  disabled: boolean;
} | null = null;

jest.mock("@/contexts", () => ({
  useSession: () => ({ user: mockSessionUser, loading: false }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeUser(role: string, uid = "u1") {
  return { role, uid, emailVerified: true, disabled: false };
}

// ─── Suite: useHasRole ────────────────────────────────────────────────────────
describe("useHasRole", () => {
  it("returns false when unauthenticated", () => {
    mockSessionUser = null;
    const { result } = renderHook(() => useHasRole("user"));
    expect(result.current).toBe(false);
  });

  it("returns true for exact role match", () => {
    mockSessionUser = makeUser("user");
    const { result } = renderHook(() => useHasRole("user"));
    expect(result.current).toBe(true);
  });

  it("returns true for higher role via hierarchy (admin satisfies 'user')", () => {
    mockSessionUser = makeUser("admin");
    const { result } = renderHook(() => useHasRole("user"));
    expect(result.current).toBe(true);
  });

  it("returns false for lower role (user does not satisfy 'admin')", () => {
    mockSessionUser = makeUser("user");
    const { result } = renderHook(() => useHasRole("admin"));
    expect(result.current).toBe(false);
  });

  it("returns true when role is in array and user meets one of them", () => {
    mockSessionUser = makeUser("seller");
    const { result } = renderHook(() => useHasRole(["admin", "seller"]));
    expect(result.current).toBe(true);
  });
});

// ─── Suite: useIsAdmin ────────────────────────────────────────────────────────
describe("useIsAdmin", () => {
  it("returns true when user.role is admin", () => {
    mockSessionUser = makeUser("admin");
    const { result } = renderHook(() => useIsAdmin());
    expect(result.current).toBe(true);
  });

  it("returns false when user.role is seller", () => {
    mockSessionUser = makeUser("seller");
    const { result } = renderHook(() => useIsAdmin());
    expect(result.current).toBe(false);
  });

  it("returns false when unauthenticated", () => {
    mockSessionUser = null;
    const { result } = renderHook(() => useIsAdmin());
    expect(result.current).toBe(false);
  });
});

// ─── Suite: useIsModerator ────────────────────────────────────────────────────
describe("useIsModerator", () => {
  it("returns true when user.role is moderator", () => {
    mockSessionUser = makeUser("moderator");
    const { result } = renderHook(() => useIsModerator());
    expect(result.current).toBe(true);
  });

  it("returns true when user.role is admin (hierarchy)", () => {
    mockSessionUser = makeUser("admin");
    const { result } = renderHook(() => useIsModerator());
    expect(result.current).toBe(true);
  });

  it("returns false when user.role is seller", () => {
    mockSessionUser = makeUser("seller");
    const { result } = renderHook(() => useIsModerator());
    expect(result.current).toBe(false);
  });

  it("returns false when unauthenticated", () => {
    mockSessionUser = null;
    const { result } = renderHook(() => useIsModerator());
    expect(result.current).toBe(false);
  });
});

// ─── Suite: useIsSeller ───────────────────────────────────────────────────────
describe("useIsSeller", () => {
  it("returns true when user.role is seller", () => {
    mockSessionUser = makeUser("seller");
    const { result } = renderHook(() => useIsSeller());
    expect(result.current).toBe(true);
  });

  it("returns true when user.role is admin (hierarchy)", () => {
    mockSessionUser = makeUser("admin");
    const { result } = renderHook(() => useIsSeller());
    expect(result.current).toBe(true);
  });

  it("returns false when user.role is user", () => {
    mockSessionUser = makeUser("user");
    const { result } = renderHook(() => useIsSeller());
    expect(result.current).toBe(false);
  });

  it("returns false when unauthenticated", () => {
    mockSessionUser = null;
    const { result } = renderHook(() => useIsSeller());
    expect(result.current).toBe(false);
  });
});

// ─── Suite: useCanAccess ──────────────────────────────────────────────────────
describe("useCanAccess", () => {
  it("returns allowed:true for a public route regardless of auth", () => {
    mockSessionUser = null;
    const { result } = renderHook(() => useCanAccess("/"));
    expect(result.current.allowed).toBe(true);
  });

  it("returns allowed:true for admin accessing admin dashboard route", () => {
    mockSessionUser = makeUser("admin");
    const { result } = renderHook(() => useCanAccess("/admin/dashboard"));
    expect(result.current.allowed).toBe(true);
  });

  it("returns allowed:false for regular user accessing admin dashboard route", () => {
    mockSessionUser = makeUser("user");
    const { result } = renderHook(() => useCanAccess("/admin/dashboard"));
    expect(result.current.allowed).toBe(false);
  });

  it("returns allowed:false for unauthenticated user accessing protected user route", () => {
    mockSessionUser = null;
    const { result } = renderHook(() => useCanAccess("/user/profile"));
    expect(result.current.allowed).toBe(false);
  });
});

// ─── Suite: useRoleChecks ─────────────────────────────────────────────────────
describe("useRoleChecks", () => {
  it("returns isAuthenticated:false and nullish role when unauthenticated", () => {
    mockSessionUser = null;
    const { result } = renderHook(() => useRoleChecks());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.role).toBeNull();
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isSeller).toBe(false);
  });

  it("returns correct flags for admin user", () => {
    mockSessionUser = makeUser("admin");
    const { result } = renderHook(() => useRoleChecks());
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isModerator).toBe(true);
    expect(result.current.isSeller).toBe(true);
    expect(result.current.isUser).toBe(false);
    expect(result.current.role).toBe("admin");
  });

  it("returns correct flags for regular user", () => {
    mockSessionUser = makeUser("user");
    const { result } = renderHook(() => useRoleChecks());
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isSeller).toBe(false);
    expect(result.current.isUser).toBe(true);
  });

  it("hasRole() inside useRoleChecks respects hierarchy", () => {
    mockSessionUser = makeUser("admin");
    const { result } = renderHook(() => useRoleChecks());
    expect(result.current.hasRole("user")).toBe(true);
    expect(result.current.hasRole("admin")).toBe(true);
  });
});

// ─── Suite: useIsOwner ────────────────────────────────────────────────────────
describe("useIsOwner", () => {
  it("returns false when unauthenticated", () => {
    mockSessionUser = null;
    const { result } = renderHook(() => useIsOwner("owner-uid"));
    expect(result.current).toBe(false);
  });

  it("returns true when user uid matches resource owner", () => {
    mockSessionUser = makeUser("user", "owner-uid");
    const { result } = renderHook(() => useIsOwner("owner-uid"));
    expect(result.current).toBe(true);
  });

  it("returns false when user uid does not match resource owner", () => {
    mockSessionUser = makeUser("user", "other-uid");
    const { result } = renderHook(() => useIsOwner("owner-uid"));
    expect(result.current).toBe(false);
  });

  it("returns true for admin even when uid does not match (admin override)", () => {
    mockSessionUser = makeUser("admin", "admin-uid");
    const { result } = renderHook(() => useIsOwner("owner-uid"));
    expect(result.current).toBe(true);
  });

  it("returns false when resourceOwnerId is null", () => {
    mockSessionUser = makeUser("user", "u1");
    const { result } = renderHook(() => useIsOwner(null));
    expect(result.current).toBe(false);
  });
});
