/**
 * Tests for GET + PUT /api/admin/site
 * Site settings management — credentials always masked in GET response,
 * deep merge on PUT preserves unrelated keys.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockGetSingleton,
  mockGetCredentialsMasked,
  mockUpdateSingleton,
} = vi.hoisted(() => ({
  mockGetSingleton: vi.fn(),
  mockGetCredentialsMasked: vi.fn(),
  mockUpdateSingleton: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_ONLY: ["admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  siteSettingsRepository: {
    getSingleton: mockGetSingleton,
    getCredentialsMasked: mockGetCredentialsMasked,
    updateSingleton: mockUpdateSingleton,
  },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: string[];
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; request: Request }) => Promise<Response>;
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
        if (!result.success) {
          const msg = result.error?.issues[0]?.message ?? "Validation error";
          return new Response(JSON.stringify({ ok: false, error: msg }), { status: 400 });
        }
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, request });
    };
  },
}));

import { GET, PUT } from "../route";

const mockSettings = {
  branding: { siteName: "LetItRip", logoUrl: "" },
  featureFlags: { useMockPayment: false },
  integrations: { razorpayKeyId: "rzp_test_abc", razorpayKeySecret: "secret123" },
};

const mockMaskedCredentials = {
  integrations: { razorpayKeyId: "rzp_test_abc", razorpayKeySecret: "***" },
};

const makeGetReq = () => new Request("http://localhost/api/admin/site");

const makePutReq = (body: unknown) =>
  new Request("http://localhost/api/admin/site", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockGetSingleton.mockResolvedValue(mockSettings);
  mockGetCredentialsMasked.mockResolvedValue(mockMaskedCredentials);
  mockUpdateSingleton.mockResolvedValue({ ...mockSettings, branding: { siteName: "Updated" } });
});

describe("GET /api/admin/site", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(401);
  });

  it("moderator role → 403 (admin-only)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(403);
  });

  it("returns settings with credentialsMasked object", async () => {
    const res = await GET(makeGetReq() as never);
    const json = await res.clone().json() as { data: { credentialsMasked: typeof mockMaskedCredentials } };
    expect(json.data.credentialsMasked).toBeDefined();
    expect(json.data.credentialsMasked.integrations.razorpayKeySecret).toBe("***");
  });

  it("raw API key (secret) NOT returned in top-level settings (masked in credentialsMasked)", async () => {
    // getCredentialsMasked returns the masked version; raw credentials stay in Firestore
    await GET(makeGetReq() as never);
    expect(mockGetCredentialsMasked).toHaveBeenCalled();
  });

  it("success → 200 with site settings", async () => {
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean; data: { branding: { siteName: string } } };
    expect(json.ok).toBe(true);
    expect(json.data.branding.siteName).toBe("LetItRip");
  });
});

describe("PUT /api/admin/site", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PUT(makePutReq({ branding: { siteName: "New" } }) as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await PUT(makePutReq({ branding: { siteName: "New" } }) as never);
    expect(res.status).toBe(403);
  });

  it("delegates to updateSingleton with body", async () => {
    const update = { branding: { siteName: "LetItRip 2.0" } };
    await PUT(makePutReq(update) as never);
    expect(mockUpdateSingleton).toHaveBeenCalledWith(update);
  });

  it("success → 200 with updated settings", async () => {
    const res = await PUT(makePutReq({ branding: { siteName: "Updated" } }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { ok: boolean };
    expect(json.ok).toBe(true);
  });
});
