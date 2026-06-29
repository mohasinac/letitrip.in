import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireAuthUser,
  mockRateLimitByIdentifier,
  mockCreateAddressForUser,
  mockUpdateAddressForUser,
  mockDeleteAddressForUser,
  mockSetDefaultAddressForUser,
  mockListAddressesForUser,
  mockGetAddressByIdForUser,
} = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockCreateAddressForUser: vi.fn(),
  mockUpdateAddressForUser: vi.fn(),
  mockDeleteAddressForUser: vi.fn(),
  mockSetDefaultAddressForUser: vi.fn(),
  mockListAddressesForUser: vi.fn(),
  mockGetAddressByIdForUser: vi.fn(),
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
  requireAuthUser: mockRequireAuthUser,
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); } },
  createAddressForUser: mockCreateAddressForUser,
  updateAddressForUser: mockUpdateAddressForUser,
  deleteAddressForUser: mockDeleteAddressForUser,
  setDefaultAddressForUser: mockSetDefaultAddressForUser,
  listAddressesForUser: mockListAddressesForUser,
  getAddressByIdForUser: mockGetAddressByIdForUser,
}));

import {
  createAddressAction,
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  listAddressesAction,
  getAddressByIdAction,
} from "../address.actions";

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", ...overrides };
}

function makeAddress(overrides: Record<string, unknown> = {}) {
  return {
    id: "addr-abc123",
    label: "Home",
    fullName: "Ravi Kumar",
    phone: "9876543210",
    addressLine1: "123 Main St",
    city: "Bangalore",
    state: "Karnataka",
    postalCode: "560001",
    country: "India",
    isDefault: false,
    ...overrides,
  };
}

function makeValidInput(overrides: Record<string, unknown> = {}) {
  return {
    label: "Home",
    fullName: "Ravi Kumar",
    phone: "9876543210",
    addressLine1: "123 Main St",
    city: "Bangalore",
    state: "Karnataka",
    postalCode: "560001",
    country: "India",
    ...overrides,
  };
}

describe("createAddressAction — auth + rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateAddressForUser.mockResolvedValue(makeAddress());
  });

  it("unauthenticated (requireAuthUser throws) → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await createAddressAction(makeValidInput() as any);
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await createAddressAction(makeValidInput() as any);
    expect(result.ok).toBe(false);
  });
});

describe("createAddressAction — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateAddressForUser.mockResolvedValue(makeAddress());
  });

  it("label missing → { ok: false }", async () => {
    const result = await createAddressAction(makeValidInput({ label: "" }) as any);
    expect(result.ok).toBe(false);
  });

  it("fullName missing → { ok: false }", async () => {
    const result = await createAddressAction(makeValidInput({ fullName: "" }) as any);
    expect(result.ok).toBe(false);
  });

  it("phone < 7 chars → { ok: false }", async () => {
    const result = await createAddressAction(makeValidInput({ phone: "123" }) as any);
    expect(result.ok).toBe(false);
  });

  it("addressLine1 missing → { ok: false }", async () => {
    const result = await createAddressAction(makeValidInput({ addressLine1: "" }) as any);
    expect(result.ok).toBe(false);
  });

  it("city missing → { ok: false }", async () => {
    const result = await createAddressAction(makeValidInput({ city: "" }) as any);
    expect(result.ok).toBe(false);
  });

  it("postalCode < 4 chars → { ok: false }", async () => {
    const result = await createAddressAction(makeValidInput({ postalCode: "56" }) as any);
    expect(result.ok).toBe(false);
  });
});

describe("createAddressAction — success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser({ uid: "user-buyer-1" }));
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateAddressForUser.mockResolvedValue(makeAddress());
  });

  it("valid → createAddressForUser called with user.uid + parsedData", async () => {
    await createAddressAction(makeValidInput() as any);
    expect(mockCreateAddressForUser).toHaveBeenCalledWith(
      "user-buyer-1",
      expect.objectContaining({ label: "Home", city: "Bangalore" }),
    );
  });

  it("isDefault defaults to false when omitted", async () => {
    await createAddressAction(makeValidInput() as any);
    const arg = mockCreateAddressForUser.mock.calls[0][1];
    expect(arg.isDefault).toBe(false);
  });

  it("returns { ok: true, data: AddressDocument }", async () => {
    const result = await createAddressAction(makeValidInput() as any);
    expect(result.ok).toBe(true);
  });
});

describe("updateAddressAction — auth + validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockUpdateAddressForUser.mockResolvedValue(makeAddress());
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await updateAddressAction("addr-abc123", { label: "Work" });
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await updateAddressAction("addr-abc123", { label: "Work" });
    expect(result.ok).toBe(false);
  });

  it("empty addressId (whitespace) → { ok: false, error: /required/i }", async () => {
    const result = await updateAddressAction("   ", { label: "Work" });
    expect(result.ok).toBe(false);
    expect((result as { error: string }).error).toMatch(/required/i);
  });

  it("valid partial update → updateAddressForUser called with (uid, addressId, parsedData)", async () => {
    await updateAddressAction("addr-abc123", { label: "Work" });
    expect(mockUpdateAddressForUser).toHaveBeenCalledWith(
      "user-buyer-1",
      "addr-abc123",
      expect.objectContaining({ label: "Work" }),
    );
  });

  it("returns { ok: true, data: AddressDocument }", async () => {
    const result = await updateAddressAction("addr-abc123", { label: "Work" });
    expect(result.ok).toBe(true);
  });
});

describe("deleteAddressAction — auth + validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockDeleteAddressForUser.mockResolvedValue(undefined);
  });

  it("unauthenticated → throws", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    await expect(deleteAddressAction("addr-abc123")).rejects.toThrow();
  });

  it("rate limit exceeded → throws", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    await expect(deleteAddressAction("addr-abc123")).rejects.toThrow();
  });

  it("empty addressId → throws ValidationError", async () => {
    await expect(deleteAddressAction("")).rejects.toThrow();
  });

  it("valid → deleteAddressForUser called with (uid, addressId)", async () => {
    await deleteAddressAction("addr-abc123");
    expect(mockDeleteAddressForUser).toHaveBeenCalledWith("user-buyer-1", "addr-abc123");
  });
});

describe("setDefaultAddressAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockSetDefaultAddressForUser.mockResolvedValue(makeAddress({ isDefault: true }));
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await setDefaultAddressAction("addr-abc123");
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await setDefaultAddressAction("addr-abc123");
    expect(result.ok).toBe(false);
  });

  it("empty addressId → { ok: false }", async () => {
    const result = await setDefaultAddressAction("");
    expect(result.ok).toBe(false);
  });

  it("valid → setDefaultAddressForUser called with (uid, addressId)", async () => {
    await setDefaultAddressAction("addr-abc123");
    expect(mockSetDefaultAddressForUser).toHaveBeenCalledWith("user-buyer-1", "addr-abc123");
  });

  it("returns { ok: true, data: AddressDocument }", async () => {
    const result = await setDefaultAddressAction("addr-abc123");
    expect(result.ok).toBe(true);
  });
});

describe("listAddressesAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockListAddressesForUser.mockResolvedValue([makeAddress()]);
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await listAddressesAction();
    expect(result.ok).toBe(false);
  });

  it("valid → listAddressesForUser called with uid", async () => {
    await listAddressesAction();
    expect(mockListAddressesForUser).toHaveBeenCalledWith("user-buyer-1");
  });

  it("returns { ok: true, data: AddressDocument[] }", async () => {
    const result = await listAddressesAction();
    expect(result.ok).toBe(true);
  });
});

describe("getAddressByIdAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockGetAddressByIdForUser.mockResolvedValue(makeAddress());
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await getAddressByIdAction("addr-abc123");
    expect(result.ok).toBe(false);
  });

  it("valid → getAddressByIdForUser called with (uid, id)", async () => {
    await getAddressByIdAction("addr-abc123");
    expect(mockGetAddressByIdForUser).toHaveBeenCalledWith("user-buyer-1", "addr-abc123");
  });
});
