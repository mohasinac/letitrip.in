/**
 * Tests for PUT /api/store/profile
 * Changes the store's slug atomically via storeRepository.changeSlug.
 * Slug must match the pattern [a-z0-9][a-z0-9-]{1,48}[a-z0-9].
 * Same slug → no-op (changed: false).
 * Taken slug → 409.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockStoreFindByOwner,
  mockStoreIsSlugAvailable,
  mockStoreChangeSlug,
} = vi.hoisted(() => ({
  mockStoreFindByOwner: vi.fn(),
  mockStoreIsSlugAvailable: vi.fn(),
  mockStoreChangeSlug: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: {
    findByOwnerId: mockStoreFindByOwner,
    isSlugAvailable: mockStoreIsSlugAvailable,
    changeSlug: mockStoreChangeSlug,
  },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  ApiErrors: {
    badRequest: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 }),
    forbidden: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 403 }),
  },
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

import { PUT } from "../route";

const makeReq = (body: unknown) =>
  new Request("http://localhost/api/store/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockStore = {
  id: "store-pokemon-palace",
  storeSlug: "pokemon-palace",
  ownerId: "seller-uid",
};

const updatedStore = { ...mockStore, storeSlug: "new-store-slug" };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockStoreFindByOwner.mockResolvedValue(mockStore);
  mockStoreIsSlugAvailable.mockResolvedValue(true);
  mockStoreChangeSlug.mockResolvedValue(updatedStore);
});

describe("PUT /api/store/profile", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PUT(makeReq({ storeSlug: "new-slug" }) as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await PUT(makeReq({ storeSlug: "new-slug" }) as never);
    expect(res.status).toBe(403);
  });

  it("missing storeSlug → 400", async () => {
    const res = await PUT(makeReq({}) as never);
    expect(res.status).toBe(400);
  });

  it("slug too short (< 3 chars) → 400", async () => {
    const res = await PUT(makeReq({ storeSlug: "ab" }) as never);
    expect(res.status).toBe(400);
  });

  it("slug with uppercase letters → 400", async () => {
    const res = await PUT(makeReq({ storeSlug: "MyStore" }) as never);
    expect(res.status).toBe(400);
  });

  it("no store found for user → 403", async () => {
    mockStoreFindByOwner.mockResolvedValue(null);
    const res = await PUT(makeReq({ storeSlug: "new-slug-ok" }) as never);
    expect(res.status).toBe(403);
  });

  it("same slug → no-op, returns { changed: false }", async () => {
    const res = await PUT(makeReq({ storeSlug: "pokemon-palace" }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { changed: boolean } };
    expect(json.data.changed).toBe(false);
    expect(mockStoreChangeSlug).not.toHaveBeenCalled();
  });

  it("slug already taken → 409", async () => {
    mockStoreIsSlugAvailable.mockResolvedValue(false);
    const res = await PUT(makeReq({ storeSlug: "taken-slug" }) as never);
    expect(res.status).toBe(409);
  });

  it("new available slug → changeSlug called with old and new slug", async () => {
    await PUT(makeReq({ storeSlug: "new-store-slug" }) as never);
    expect(mockStoreChangeSlug).toHaveBeenCalledWith("pokemon-palace", "new-store-slug");
  });

  it("success → 200 with { store, changed: true }", async () => {
    const res = await PUT(makeReq({ storeSlug: "new-store-slug" }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { changed: boolean; store: typeof updatedStore } };
    expect(json.data.changed).toBe(true);
    expect(json.data.store.storeSlug).toBe("new-store-slug");
  });
});
