import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: {
  uid: string; role: string; email: string; emailVerified: boolean;
  phoneNumber?: string; phoneVerified?: boolean; displayName?: string;
} | null = null;

const {
  mockUpdateProfile,
  mockUserUpdate,
} = vi.hoisted(() => ({
  mockUpdateProfile: vi.fn(),
  mockUserUpdate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  userRepository: {
    updateProfileWithVerificationReset: mockUpdateProfile,
    update: mockUserUpdate,
  },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  SUCCESS_MESSAGES: { USER: { PROFILE_UPDATED: "Profile updated" } },
  createApiHandler: (opts: {
    auth?: boolean;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: unknown[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user) {
        return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
      }
      let body: unknown;
      if (request.method !== "GET") {
        try { body = await request.clone().json(); } catch { body = undefined; }
        if (opts.schema) {
          const result = opts.schema.safeParse(body);
          if (!result.success) return new Response(JSON.stringify({ ok: false, error: "Validation" }), { status: 400 });
          body = result.data;
        }
      }
      return opts.handler({ user: _user ?? undefined, body, request });
    };
  },
}));

import { GET, PATCH } from "../route";

function makeGetReq(): Request {
  return new Request("http://localhost/api/user/profile", { method: "GET" });
}

function makePatchReq(body: unknown): Request {
  return new Request("http://localhost/api/user/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  _user = {
    uid: "user-1",
    role: "user",
    email: "test@test.com",
    emailVerified: true,
    phoneNumber: "+911234567890",
    phoneVerified: true,
    displayName: "Test User",
  };
  mockUpdateProfile.mockResolvedValue({
    uid: "user-1",
    displayName: "Test User",
    email: "test@test.com",
    emailVerified: true,
    phoneVerified: true,
    publicProfile: {},
  });
  mockUserUpdate.mockResolvedValue(undefined);
});

describe("GET /api/user/profile", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(401);
  });

  it("returns user profile fields from auth token", async () => {
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { uid: string; email: string } };
    expect(json.data.uid).toBe("user-1");
    expect(json.data.email).toBe("test@test.com");
  });

  it("does not call userRepository (data comes from auth context)", async () => {
    await GET(makeGetReq() as never);
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it("response includes role, emailVerified fields", async () => {
    const res = await GET(makeGetReq() as never);
    const json = await res.clone().json() as { data: { role: string; emailVerified: boolean } };
    expect(json.data.role).toBe("user");
    expect(json.data.emailVerified).toBe(true);
  });
});

describe("PATCH /api/user/profile", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makePatchReq({ displayName: "New Name" }) as never);
    expect(res.status).toBe(401);
  });

  it("invalid email format → 400", async () => {
    const res = await PATCH(makePatchReq({ email: "not-an-email" }) as never);
    expect(res.status).toBe(400);
  });

  it("bio too long (>500 chars) → 400", async () => {
    const res = await PATCH(makePatchReq({ bio: "x".repeat(501) }) as never);
    expect(res.status).toBe(400);
  });

  it("updates displayName via updateProfileWithVerificationReset", async () => {
    await PATCH(makePatchReq({ displayName: "New Name" }) as never);
    expect(mockUpdateProfile).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ displayName: "New Name" }),
    );
  });

  it("changing email → verificationReset.emailVerified=false", async () => {
    mockUpdateProfile.mockResolvedValue({
      uid: "user-1",
      email: "new@test.com",
      emailVerified: false,
      phoneVerified: true,
      publicProfile: {},
    });
    const res = await PATCH(makePatchReq({ email: "new@test.com" }) as never);
    const json = await res.clone().json() as { data: { verificationReset: { emailVerified: boolean } } };
    expect(json.data.verificationReset.emailVerified).toBe(false);
  });

  it("same email → emailVerified unchanged", async () => {
    mockUpdateProfile.mockResolvedValue({
      uid: "user-1",
      email: "test@test.com",
      emailVerified: true,
      phoneVerified: true,
      publicProfile: {},
    });
    const res = await PATCH(makePatchReq({ email: "test@test.com" }) as never);
    const json = await res.clone().json() as { data: { verificationReset: { emailVerified: boolean } } };
    expect(json.data.verificationReset.emailVerified).toBe(true);
  });

  it("bio update stored in publicProfile", async () => {
    await PATCH(makePatchReq({ bio: "My bio" }) as never);
    expect(mockUserUpdate).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ publicProfile: expect.objectContaining({ bio: "My bio" }) }),
    );
  });

  it("profileIsPublic toggle stored in publicProfile.isPublic", async () => {
    await PATCH(makePatchReq({ profileIsPublic: false }) as never);
    expect(mockUserUpdate).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ publicProfile: expect.objectContaining({ isPublic: false }) }),
    );
  });

  it("acknowledgeScamAwareness=true → updates scamAwarenessAcknowledgedAt", async () => {
    await PATCH(makePatchReq({ acknowledgeScamAwareness: true }) as never);
    expect(mockUserUpdate).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ scamAwarenessAcknowledgedAt: expect.any(Date) }),
    );
  });

  it("acknowledgeScamAwareness=false → does NOT update scamAwarenessAcknowledgedAt", async () => {
    await PATCH(makePatchReq({ acknowledgeScamAwareness: false }) as never);
    const scamCalls = (mockUserUpdate.mock.calls as Array<[string, Record<string, unknown>]>).filter(
      ([, payload]) => "scamAwarenessAcknowledgedAt" in payload,
    );
    expect(scamCalls).toHaveLength(0);
  });

  it("success → 200 with { user, verificationReset }", async () => {
    const res = await PATCH(makePatchReq({ displayName: "Updated" }) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { user: unknown; verificationReset: unknown } };
    expect(json.data.user).toBeDefined();
    expect(json.data.verificationReset).toBeDefined();
  });
});
