import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireRoleUser,
  mockUpdateActionConfigDomain,
  mockUpdateNavConfigDomain,
} = vi.hoisted(() => ({
  mockRequireRoleUser: vi.fn(),
  mockUpdateActionConfigDomain: vi.fn(),
  mockUpdateNavConfigDomain: vi.fn(),
}));

vi.mock("@mohasinac/appkit/server", () => ({
  ActionResult: {},
  wrapAction: async (fn: () => Promise<unknown>) => {
    try {
      return { ok: true, data: await fn() };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
  requireRoleUser: mockRequireRoleUser,
  updateActionConfigDomain: mockUpdateActionConfigDomain,
  updateNavConfigDomain: mockUpdateNavConfigDomain,
}));

import {
  updateActionConfigAction,
  updateNavConfigAction,
} from "../admin-settings.actions";

function makeAdmin(overrides: Record<string, unknown> = {}) {
  return { uid: "user-admin-1", email: "admin@test.com", role: "admin", ...overrides };
}

describe("updateActionConfigAction — no wrapAction, throws raw", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockUpdateActionConfigDomain.mockResolvedValue(undefined);
  });

  it("requireRoleUser called with plain string 'admin' (not array)", async () => {
    await updateActionConfigAction("action-delete-product", true);
    expect(mockRequireRoleUser).toHaveBeenCalledWith("admin");
  });

  it("non-admin → throws (requireRoleUser throws)", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    await expect(updateActionConfigAction("action-delete-product", true)).rejects.toThrow();
  });

  it("valid → updateActionConfigDomain called with (actionId, enabled)", async () => {
    await updateActionConfigAction("action-delete-product", true);
    expect(mockUpdateActionConfigDomain).toHaveBeenCalledWith("action-delete-product", true);
  });

  it("valid with enabled=false → updateActionConfigDomain called with false", async () => {
    await updateActionConfigAction("action-approve-review", false);
    expect(mockUpdateActionConfigDomain).toHaveBeenCalledWith("action-approve-review", false);
  });

  it("returns void on success", async () => {
    const result = await updateActionConfigAction("action-delete-product", true);
    expect(result).toBeUndefined();
  });
});

describe("updateNavConfigAction — no wrapAction, throws raw", () => {
  const allNavItems = [
    { id: "nav-home", href: "/" },
    { id: "nav-products", href: "/products" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockUpdateNavConfigDomain.mockResolvedValue(undefined);
  });

  it("requireRoleUser called with plain string 'admin'", async () => {
    await updateNavConfigAction("nav-home", true, allNavItems);
    expect(mockRequireRoleUser).toHaveBeenCalledWith("admin");
  });

  it("non-admin → throws", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    await expect(
      updateNavConfigAction("nav-home", false, allNavItems),
    ).rejects.toThrow();
  });

  it("valid → updateNavConfigDomain called with (navId, enabled, allNavItems)", async () => {
    await updateNavConfigAction("nav-home", false, allNavItems);
    expect(mockUpdateNavConfigDomain).toHaveBeenCalledWith("nav-home", false, allNavItems);
  });

  it("returns void on success", async () => {
    const result = await updateNavConfigAction("nav-home", true, allNavItems);
    expect(result).toBeUndefined();
  });
});
