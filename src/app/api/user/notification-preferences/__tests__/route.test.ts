/**
 * Tests for GET/PUT /api/user/notification-preferences
 * Auth required. Any authenticated user.
 *
 * GET: Returns preferences from user.notificationPreferences.
 *      If field missing → returns hardcoded defaults (all channels + types = true).
 *
 * PUT: Calls userRepository.update(uid, { notificationPreferences: body }).
 *      Body parsed via Zod — channels and types are both optional; individual fields optional.
 *      Returns the body that was saved.
 *
 * NOTE: PUT uses request.json() directly (no schema prop) — schema.parse() throws on invalid,
 * propagating unhandled. Route does NOT return 400 for Zod errors; it throws.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string; notificationPreferences?: unknown } | null = null;

const { mockUserUpdate } = vi.hoisted(() => ({
  mockUserUpdate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  userRepository: { update: mockUserUpdate },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      return opts.handler({ user: _user ?? undefined, request });
    };
  },
}));

import { GET, PUT } from "../route";

const makePutRequest = (body: unknown) =>
  new Request("http://localhost/api/user/notification-preferences", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const defaultPrefs = {
  channels: { email: true, whatsapp: true, sms: true },
  types: {
    orderUpdates: true,
    bids: true,
    promotions: true,
    system: true,
    reviews: true,
    messages: true,
    offers: true,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "buyer-uid", role: "user" };
  mockUserUpdate.mockResolvedValue(undefined);
});

describe("GET /api/user/notification-preferences", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost") as never);
    expect(res.status).toBe(401);
  });

  it("user has no notificationPreferences → returns defaults (all true)", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await GET(new Request("http://localhost") as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { notificationPreferences: typeof defaultPrefs } };
    expect(json.data.notificationPreferences.channels.email).toBe(true);
    expect(json.data.notificationPreferences.channels.whatsapp).toBe(true);
    expect(json.data.notificationPreferences.channels.sms).toBe(true);
    expect(json.data.notificationPreferences.types.orderUpdates).toBe(true);
    expect(json.data.notificationPreferences.types.promotions).toBe(true);
  });

  it("user has saved preferences → returns saved preferences", async () => {
    const savedPrefs = { channels: { email: false, whatsapp: true, sms: false }, types: { bids: false } };
    _user = { uid: "buyer-uid", role: "user", notificationPreferences: savedPrefs };
    const res = await GET(new Request("http://localhost") as never);
    const json = await res.clone().json() as { data: { notificationPreferences: typeof savedPrefs } };
    expect(json.data.notificationPreferences.channels.email).toBe(false);
    expect(json.data.notificationPreferences.channels.sms).toBe(false);
  });
});

describe("PUT /api/user/notification-preferences", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PUT(makePutRequest(defaultPrefs) as never);
    expect(res.status).toBe(401);
  });

  it("calls userRepository.update with notificationPreferences from body", async () => {
    const body = { channels: { email: false } };
    await PUT(makePutRequest(body) as never);
    expect(mockUserUpdate).toHaveBeenCalledWith(
      "buyer-uid",
      expect.objectContaining({ notificationPreferences: body }),
    );
  });

  it("returns the saved preferences in response", async () => {
    const body = { channels: { email: false, whatsapp: true } };
    const res = await PUT(makePutRequest(body) as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as {
      data: { notificationPreferences: typeof body };
    };
    expect(json.data.notificationPreferences.channels.email).toBe(false);
  });

  it("partial update — only channels → types not required in schema", async () => {
    const body = { channels: { sms: false } };
    const res = await PUT(makePutRequest(body) as never);
    expect(res.status).toBe(200);
  });

  it("partial update — only types → channels not required", async () => {
    const body = { types: { promotions: false, bids: false } };
    const res = await PUT(makePutRequest(body) as never);
    expect(res.status).toBe(200);
    expect(mockUserUpdate).toHaveBeenCalledWith(
      "buyer-uid",
      expect.objectContaining({ notificationPreferences: body }),
    );
  });

  it("empty body {} → valid (all optional), saves empty prefs", async () => {
    const res = await PUT(makePutRequest({}) as never);
    expect(res.status).toBe(200);
    expect(mockUserUpdate).toHaveBeenCalled();
  });

  it("uses uid from auth token when calling userRepository.update", async () => {
    _user = { uid: "specific-uid", role: "user" };
    await PUT(makePutRequest({ channels: { email: true } }) as never);
    expect(mockUserUpdate).toHaveBeenCalledWith("specific-uid", expect.any(Object));
  });
});
