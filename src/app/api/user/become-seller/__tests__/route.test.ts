/**
 * Tests for POST /api/user/become-seller
 * Auth required. Delegates to becomeSeller(uid) action.
 * Returns { ok: true, data: ... } on success.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockBecomeSeller } = vi.hoisted(() => ({
  mockBecomeSeller: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  becomeSeller: mockBecomeSeller,
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createApiHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request) => {
      if ((opts.auth) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      return opts.handler({ user: _user ?? undefined });
    };
  },
}));

import { POST } from "../route";

const makeReq = () =>
  new Request("http://localhost/api/user/become-seller", { method: "POST" });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockBecomeSeller.mockResolvedValue({ storeId: "store-new", status: "pending" });
});

describe("POST /api/user/become-seller", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("authenticated → calls becomeSeller with uid", async () => {
    await POST(makeReq() as never);
    expect(mockBecomeSeller).toHaveBeenCalledWith("buyer-uid");
  });

  it("success → 200 with seller data", async () => {
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean; data: { storeId: string } };
    expect(json.ok).toBe(true);
    expect(json.data.storeId).toBe("store-new");
  });

  it("becomeSeller throws → error propagates (no silent swallow)", async () => {
    mockBecomeSeller.mockRejectedValue(new Error("Already a seller"));
    await expect(POST(makeReq() as never)).rejects.toThrow("Already a seller");
  });
});
