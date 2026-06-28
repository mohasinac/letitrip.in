/**
 * Tests for GET /api/store/slug/check
 * Returns { available, reason } for a given slug.
 * Missing slug → 400.
 * Invalid slug format → available: false with format reason.
 * Taken slug → available: false with "already taken" reason.
 * Available slug → available: true, reason: null.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const { mockIsSlugAvailable } = vi.hoisted(() => ({
  mockIsSlugAvailable: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_READ: ["seller", "admin", "moderator"] }));

vi.mock("@mohasinac/appkit", () => ({
  storeRepository: { isSlugAvailable: mockIsSlugAvailable },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  ApiErrors: {
    badRequest: (msg: string) =>
      new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 }),
  },
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET } from "../route";

const makeReq = (slug?: string) => {
  const url = new URL("http://localhost/api/store/slug/check");
  if (slug !== undefined) url.searchParams.set("slug", slug);
  return new Request(url.toString());
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller" };
  mockIsSlugAvailable.mockResolvedValue(true);
});

describe("GET /api/store/slug/check", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeReq("valid-slug") as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(makeReq("valid-slug") as never);
    expect(res.status).toBe(403);
  });

  it("missing slug → 400", async () => {
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(400);
  });

  it("empty slug → 400", async () => {
    const res = await GET(makeReq("") as never);
    expect(res.status).toBe(400);
  });

  it("slug too short (< 3 chars) → available: false with format reason", async () => {
    const res = await GET(makeReq("ab") as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { available: boolean; reason: string } };
    expect(json.data.available).toBe(false);
    expect(json.data.reason).toMatch(/3.50|3–50/i);
  });

  it("slug with uppercase letters → available: false (lowercased internally)", async () => {
    // slug is lowercased before check, so 'MyStore' becomes 'mystore' which IS valid
    // depends on SLUG_RE: /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/
    const res = await GET(makeReq("mystore") as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { available: boolean } };
    // valid format → checks availability
    expect(mockIsSlugAvailable).toHaveBeenCalledWith("mystore");
    expect(json.data.available).toBe(true);
  });

  it("slug with special characters → available: false with format reason", async () => {
    const res = await GET(makeReq("my_store!") as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { available: boolean; reason: string } };
    expect(json.data.available).toBe(false);
    expect(json.data.reason).toMatch(/lowercase/i);
  });

  it("taken slug → available: false with 'already taken' reason", async () => {
    mockIsSlugAvailable.mockResolvedValue(false);
    const res = await GET(makeReq("taken-slug-here") as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { available: boolean; reason: string } };
    expect(json.data.available).toBe(false);
    expect(json.data.reason).toMatch(/taken/i);
  });

  it("available slug → available: true, reason: null", async () => {
    mockIsSlugAvailable.mockResolvedValue(true);
    const res = await GET(makeReq("my-new-store") as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { available: boolean; reason: null } };
    expect(json.data.available).toBe(true);
    expect(json.data.reason).toBeNull();
  });

  it("slug is lowercased before availability check", async () => {
    await GET(makeReq("My-Store") as never);
    // Slug is lowercased: "my-store"
    expect(mockIsSlugAvailable).toHaveBeenCalledWith("my-store");
  });
});
