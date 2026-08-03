import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireRoleUser,
  mockRateLimitByIdentifier,
  mockListStoreAddressesForSeller,
  mockCreateStoreAddressForSeller,
  mockUpdateStoreAddressForSeller,
  mockDeleteStoreAddressForSeller,
} = vi.hoisted(() => ({
  mockRequireRoleUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockListStoreAddressesForSeller: vi.fn(),
  mockCreateStoreAddressForSeller: vi.fn(),
  mockUpdateStoreAddressForSeller: vi.fn(),
  mockDeleteStoreAddressForSeller: vi.fn(),
}));

vi.mock("@mohasinac/appkit/server", () => ({
  wrapAction: async (fn: () => Promise<unknown>) => {
    try {
      return { ok: true, data: await fn() };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
}));

vi.mock("@mohasinac/appkit", () => ({
  requireRoleUser: mockRequireRoleUser,
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); this.name = "AuthorizationError"; } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); this.name = "ValidationError"; } },
  listStoreAddressesForSeller: mockListStoreAddressesForSeller,
  createStoreAddressForSeller: mockCreateStoreAddressForSeller,
  updateStoreAddressForSeller: mockUpdateStoreAddressForSeller,
  deleteStoreAddressForSeller: mockDeleteStoreAddressForSeller,
}));

import {
  listStoreAddressesAction,
  createStoreAddressAction,
  updateStoreAddressAction,
  deleteStoreAddressAction,
} from "../store-address.actions";

function makeSeller(overrides: Record<string, unknown> = {}) {
  return { uid: "user-seller-1", email: "seller@test.com", role: "seller", ...overrides };
}

function makeAddress(overrides: Record<string, unknown> = {}) {
  return {
    id: "addr-store-1",
    storeId: "store-pokemon-palace",
    label: "Warehouse",
    fullName: "Ravi Kumar",
    phone: "9876543210",
    addressLine1: "123 Main St",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    isPickupLocation: false,
    ...overrides,
  };
}

function makeValidAddressInput() {
  return {
    label: "Warehouse",
    fullName: "Ravi Kumar",
    phone: "9876543210",
    addressLine1: "123 Main St",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India",
  };
}

describe("listStoreAddressesAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeSeller());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockListStoreAddressesForSeller.mockResolvedValue([makeAddress()]);
  });

  it("requireRoleUser([ 'seller','admin']) — role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await listStoreAddressesAction();
    expect(result.ok).toBe(false);
  });

  it("requireRoleUser called with ['seller','admin']", async () => {
    await listStoreAddressesAction();
    expect(mockRequireRoleUser).toHaveBeenCalledWith(["seller", "admin"]);
  });

  it("seller role → listStoreAddressesForSeller called with user.uid", async () => {
    await listStoreAddressesAction();
    expect(mockListStoreAddressesForSeller).toHaveBeenCalledWith("user-seller-1");
  });

  it("admin role → listStoreAddressesForSeller called with user.uid", async () => {
    mockRequireRoleUser.mockResolvedValue({ uid: "user-admin-1", role: "admin" });
    await listStoreAddressesAction();
    expect(mockListStoreAddressesForSeller).toHaveBeenCalledWith("user-admin-1");
  });

  it("returns { ok: true, data: AddressDocument[] }", async () => {
    const result = await listStoreAddressesAction();
    expect(result.ok).toBe(true);
  });
});

describe("createStoreAddressAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeSeller());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateStoreAddressForSeller.mockResolvedValue(makeAddress());
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await createStoreAddressAction(makeValidAddressInput() as any);
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await createStoreAddressAction(makeValidAddressInput() as any);
    expect(result.ok).toBe(false);
  });

  it("fullName missing → { ok: false } (schema min1)", async () => {
    const result = await createStoreAddressAction({ ...makeValidAddressInput(), fullName: "" } as any);
    expect(result.ok).toBe(false);
  });

  it("phone < 7 chars → { ok: false }", async () => {
    const result = await createStoreAddressAction({ ...makeValidAddressInput(), phone: "12345" } as any);
    expect(result.ok).toBe(false);
  });

  it("postalCode < 4 chars → { ok: false }", async () => {
    const result = await createStoreAddressAction({ ...makeValidAddressInput(), postalCode: "400" } as any);
    expect(result.ok).toBe(false);
  });

  it("valid → createStoreAddressForSeller called with (user.uid, parsedData) — NOT storeId", async () => {
    await createStoreAddressAction(makeValidAddressInput() as any);
    expect(mockCreateStoreAddressForSeller).toHaveBeenCalledWith(
      "user-seller-1",
      expect.objectContaining({ fullName: "Ravi Kumar" }),
    );
  });

  it("returns { ok: true, data: AddressDocument }", async () => {
    const result = await createStoreAddressAction(makeValidAddressInput() as any);
    expect(result.ok).toBe(true);
  });
});

describe("updateStoreAddressAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeSeller());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockUpdateStoreAddressForSeller.mockResolvedValue(makeAddress());
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await updateStoreAddressAction("addr-1", { label: "Updated" });
    expect(result.ok).toBe(false);
  });

  it("empty addressId (manual trim check) → { ok: false }", async () => {
    const result = await updateStoreAddressAction("", { label: "Updated" });
    expect(result.ok).toBe(false);
  });

  it("whitespace addressId → { ok: false }", async () => {
    const result = await updateStoreAddressAction("   ", { label: "Updated" });
    expect(result.ok).toBe(false);
  });

  it("valid partial → updateStoreAddressForSeller called with (user.uid, addressId, parsedData)", async () => {
    await updateStoreAddressAction("addr-1", { label: "Updated" });
    expect(mockUpdateStoreAddressForSeller).toHaveBeenCalledWith(
      "user-seller-1",
      "addr-1",
      expect.objectContaining({ label: "Updated" }),
    );
  });

  it("returns { ok: true, data: AddressDocument }", async () => {
    const result = await updateStoreAddressAction("addr-1", { label: "Updated" });
    expect(result.ok).toBe(true);
  });
});

describe("deleteStoreAddressAction — no wrapAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeSeller());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockDeleteStoreAddressForSeller.mockResolvedValue(undefined);
  });

  it("role 'user' → throws (requireRoleUser throws)", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    await expect(deleteStoreAddressAction("addr-1")).rejects.toThrow();
  });

  it("empty addressId → throws ValidationError", async () => {
    await expect(deleteStoreAddressAction("")).rejects.toThrow();
  });

  it("valid → deleteStoreAddressForSeller called with (user.uid, addressId)", async () => {
    await deleteStoreAddressAction("addr-1");
    expect(mockDeleteStoreAddressForSeller).toHaveBeenCalledWith("user-seller-1", "addr-1");
  });

  it("domain throws → propagates", async () => {
    mockDeleteStoreAddressForSeller.mockRejectedValue(new Error("Not your address"));
    await expect(deleteStoreAddressAction("addr-1")).rejects.toThrow("Not your address");
  });
});
