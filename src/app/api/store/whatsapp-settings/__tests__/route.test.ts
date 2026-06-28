/**
 * Tests for GET/PUT /api/store/whatsapp-settings
 * GET: Returns masked whatsappConfig (accessToken → "••••••").
 * PUT: Requires whatsapp_catalog_sync capability.
 *      Encrypts accessToken via encryptPii. Keeps existing token when not provided.
 *      connected = true only when wabaId + catalogId + resolvedToken all truthy.
 *      connectedAt set only when transitioning connected: false → true.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockStoreFindByOwner,
  mockStoreUpdate,
  mockEncryptPii,
} = vi.hoisted(() => ({
  mockStoreFindByOwner: vi.fn(),
  mockStoreUpdate: vi.fn(),
  mockEncryptPii: vi.fn((v: string) => `enc:${v}`),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: {
    findByOwnerId: mockStoreFindByOwner,
    updateStore: mockStoreUpdate,
  },
  encryptPii: mockEncryptPii,
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success)
          return new Response(JSON.stringify({ ok: false, error: result.error?.issues[0]?.message }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body });
    };
  },
}));

import { GET, PUT } from "../route";

const makeGetReq = () => new Request("http://localhost/api/store/whatsapp-settings");
const makePutReq = (body: unknown) =>
  new Request("http://localhost/api/store/whatsapp-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockStore = {
  id: "store-pokemon-palace",
  storeSlug: "pokemon-palace",
  ownerId: "seller-uid",
  capabilities: ["whatsapp_catalog_sync"],
  whatsappConfig: {
    phoneNumber: "9876543210",
    wabaId: "waba-123",
    catalogId: "cat-456",
    accessToken: "enc:secret-token",
    catalogSyncEnabled: true,
    connected: true,
    connectedAt: new Date("2026-01-01"),
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockStoreFindByOwner.mockResolvedValue(mockStore);
  mockStoreUpdate.mockResolvedValue(undefined);
});

describe("GET /api/store/whatsapp-settings", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("no store → 404", async () => {
    mockStoreFindByOwner.mockResolvedValue(null);
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(404);
  });

  it("store without whatsappConfig → returns null config", async () => {
    mockStoreFindByOwner.mockResolvedValue({ ...mockStore, whatsappConfig: undefined });
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { whatsappConfig: null } };
    expect(json.data.whatsappConfig).toBeNull();
  });

  it("accessToken masked as '••••••' in response", async () => {
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { whatsappConfig: { accessToken: string } } };
    expect(json.data.whatsappConfig.accessToken).toBe("••••••");
  });

  it("raw encrypted token never returned", async () => {
    const res = await GET(makeGetReq() as never);
    const text = await res.text();
    expect(text).not.toContain("enc:secret-token");
    expect(text).not.toContain("secret-token");
  });

  it("other fields returned unmasked", async () => {
    const res = await GET(makeGetReq() as never);
    const json = await res.clone().json() as { data: { whatsappConfig: { wabaId: string; catalogId: string } } };
    expect(json.data.whatsappConfig.wabaId).toBe("waba-123");
    expect(json.data.whatsappConfig.catalogId).toBe("cat-456");
  });
});

describe("PUT /api/store/whatsapp-settings", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PUT(makePutReq({ wabaId: "new-waba" }) as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await PUT(makePutReq({ wabaId: "new-waba" }) as never);
    expect(res.status).toBe(403);
  });

  it("no store → 404", async () => {
    mockStoreFindByOwner.mockResolvedValue(null);
    const res = await PUT(makePutReq({ wabaId: "new-waba" }) as never);
    expect(res.status).toBe(404);
  });

  it("store without whatsapp_catalog_sync capability → 403", async () => {
    mockStoreFindByOwner.mockResolvedValue({ ...mockStore, capabilities: ["other_capability"] });
    const res = await PUT(makePutReq({ wabaId: "new-waba" }) as never);
    expect(res.status).toBe(403);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toMatch(/not enabled/i);
  });

  it("store with no capabilities array → 403", async () => {
    mockStoreFindByOwner.mockResolvedValue({ ...mockStore, capabilities: undefined });
    const res = await PUT(makePutReq({ wabaId: "new-waba" }) as never);
    expect(res.status).toBe(403);
  });

  it("phone number < 7 digits → 400", async () => {
    const res = await PUT(makePutReq({ phoneNumber: "123456" }) as never);
    expect(res.status).toBe(400);
  });

  it("phone number with letters → 400", async () => {
    const res = await PUT(makePutReq({ phoneNumber: "9876abc543" }) as never);
    expect(res.status).toBe(400);
  });

  it("accessToken < 10 chars → 400", async () => {
    const res = await PUT(makePutReq({ accessToken: "short" }) as never);
    expect(res.status).toBe(400);
  });

  it("new accessToken encrypted via encryptPii", async () => {
    await PUT(makePutReq({ accessToken: "valid-new-token-12345" }) as never);
    expect(mockEncryptPii).toHaveBeenCalledWith("valid-new-token-12345");
    const callArg = mockStoreUpdate.mock.calls[0][1] as {
      whatsappConfig: { accessToken: string }
    };
    expect(callArg.whatsappConfig.accessToken).toBe("enc:valid-new-token-12345");
  });

  it("no accessToken provided → keeps existing encrypted token", async () => {
    await PUT(makePutReq({ wabaId: "new-waba-id" }) as never);
    expect(mockEncryptPii).not.toHaveBeenCalled();
    const callArg = mockStoreUpdate.mock.calls[0][1] as {
      whatsappConfig: { accessToken: string }
    };
    // existing encrypted token preserved
    expect(callArg.whatsappConfig.accessToken).toBe("enc:secret-token");
  });

  it("connected = true when all three (wabaId, catalogId, token) are present", async () => {
    await PUT(makePutReq({ wabaId: "new-waba", catalogId: "new-cat", accessToken: "new-token-valid-123" }) as never);
    const callArg = mockStoreUpdate.mock.calls[0][1] as {
      whatsappConfig: { connected: boolean }
    };
    expect(callArg.whatsappConfig.connected).toBe(true);
  });

  it("connected = false when wabaId missing (and existing has no wabaId)", async () => {
    mockStoreFindByOwner.mockResolvedValue({
      ...mockStore,
      whatsappConfig: { ...mockStore.whatsappConfig, wabaId: undefined },
    });
    await PUT(makePutReq({ catalogId: "new-cat", accessToken: "new-token-valid-123" }) as never);
    const callArg = mockStoreUpdate.mock.calls[0][1] as {
      whatsappConfig: { connected: boolean }
    };
    expect(callArg.whatsappConfig.connected).toBe(false);
  });

  it("connected = true using existing wabaId when not provided in body", async () => {
    // existing wabaId + catalogId + token → still connected
    await PUT(makePutReq({ catalogSyncEnabled: true }) as never);
    const callArg = mockStoreUpdate.mock.calls[0][1] as {
      whatsappConfig: { connected: boolean }
    };
    // existing has wabaId + catalogId + accessToken, so connected = true
    expect(callArg.whatsappConfig.connected).toBe(true);
  });

  it("connectedAt set when transitioning from disconnected to connected", async () => {
    mockStoreFindByOwner.mockResolvedValue({
      ...mockStore,
      whatsappConfig: {
        ...mockStore.whatsappConfig,
        connected: false,
        connectedAt: undefined,
      },
    });
    await PUT(makePutReq({ wabaId: "waba-123", catalogId: "cat-456", accessToken: "token-long-enough-123" }) as never);
    const callArg = mockStoreUpdate.mock.calls[0][1] as {
      whatsappConfig: { connectedAt: Date | undefined }
    };
    expect(callArg.whatsappConfig.connectedAt).toBeDefined();
  });

  it("connectedAt NOT overwritten when already connected", async () => {
    // Already connected — connectedAt should remain the existing value
    await PUT(makePutReq({ catalogSyncEnabled: false }) as never);
    const callArg = mockStoreUpdate.mock.calls[0][1] as {
      whatsappConfig: { connectedAt: Date }
    };
    // The spread of existing sets connectedAt from existing value; the conditional `connected && !existing.connected` is false
    // so no new connectedAt is set — existing value is kept via spread
    expect(callArg.whatsappConfig.connectedAt).toEqual(mockStore.whatsappConfig.connectedAt);
  });

  it("accessToken masked in success response", async () => {
    const res = await PUT(makePutReq({ catalogSyncEnabled: true }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { whatsappConfig: { accessToken: string } } };
    expect(json.data.whatsappConfig.accessToken).toBe("••••••");
  });

  it("storeRepository.updateStore called with storeSlug and updated config", async () => {
    await PUT(makePutReq({ catalogSyncEnabled: false }) as never);
    expect(mockStoreUpdate).toHaveBeenCalledWith("pokemon-palace", expect.objectContaining({
      whatsappConfig: expect.any(Object),
    }));
  });

  it("success → 200", async () => {
    const res = await PUT(makePutReq({ catalogSyncEnabled: true }) as never);
    expect(res.status).toBe(200);
  });
});
