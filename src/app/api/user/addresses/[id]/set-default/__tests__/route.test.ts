/**
 * Tests for POST /api/user/addresses/[id]/set-default
 * Auth required. Any authenticated user.
 * Calls addressesRepository.setDefault("user", uid, id).
 * setDefault atomically clears other defaults and sets this one.
 * Returns the updated address.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockSetDefault } = vi.hoisted(() => ({
  mockSetDefault: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  addressesRepository: { setDefault: mockSetDefault },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown; params?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request, { params }: { params: unknown } = { params: {} }) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      return opts.handler({ user: _user ?? undefined, params });
    };
  },
}));

import { POST } from "../route";

const params = { params: { id: "addr-user-home-001" } };

const updatedAddress = {
  id: "addr-user-home-001",
  ownerType: "user",
  ownerId: "buyer-uid",
  label: "Home",
  isDefault: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockSetDefault.mockResolvedValue(updatedAddress);
});

describe("POST /api/user/addresses/[id]/set-default", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(new Request("http://localhost", { method: "POST" }) as never, params as never);
    expect(res.status).toBe(401);
  });

  it("calls setDefault with ownerType=user, uid, and addressId from params", async () => {
    await POST(new Request("http://localhost", { method: "POST" }) as never, params as never);
    expect(mockSetDefault).toHaveBeenCalledWith("user", "buyer-uid", "addr-user-home-001");
  });

  it("uses uid from auth token", async () => {
    _user = { uid: "specific-uid", role: "user" };
    await POST(new Request("http://localhost", { method: "POST" }) as never, params as never);
    expect(mockSetDefault).toHaveBeenCalledWith("user", "specific-uid", expect.any(String));
  });

  it("success → 200 with updated address showing isDefault=true", async () => {
    const res = await POST(new Request("http://localhost", { method: "POST" }) as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { isDefault: boolean } };
    expect(json.data.isDefault).toBe(true);
  });

  it("setDefault throws (e.g. address not found or wrong owner) → propagates", async () => {
    mockSetDefault.mockRejectedValue(new Error("Address not found"));
    await expect(
      POST(new Request("http://localhost", { method: "POST" }) as never, params as never),
    ).rejects.toThrow("Address not found");
  });
});
