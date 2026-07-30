import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("@mohasinac/appkit/server", () => ({
  adminVerifyPaymentAction: vi.fn(),
}));

vi.mock("@/providers.config", () => ({
  withProviders: (fn: (...args: unknown[]) => unknown) => fn,
}));

// Static mock — avoids loading real appkit dist which has a broken relative import in server-entry.js.
// createRouteHandler is called as createRouteHandler({ roles, permission, handler }) (single-object arg),
// so the mock extracts `handler` from the options object rather than treating it as a curried call.
vi.mock("@mohasinac/appkit", () => ({
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  errorResponse: (msg: string, status = 400, code?: string) =>
    new Response(JSON.stringify({ ok: false, error: msg, code }), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  createRouteHandler:
    ({
      handler,
    }: {
      handler: (ctx: {
        request: Request;
        params: Record<string, string>;
      }) => unknown;
    }) =>
    async (req: Request, ctx: { params: Promise<Record<string, string>> }) =>
      handler({ request: req, params: await ctx.params }),
}));

vi.mock("@/constants/api-roles", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
}));

const makeParams = (id = "order-test-1") =>
  ({ params: Promise.resolve({ id }) }) as Parameters<
    typeof import("../route")["PATCH"]
  >[1];

describe("PATCH /api/admin/orders/[id]/payment-verify", () => {
  let adminVerifyPaymentAction: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@mohasinac/appkit/server");
    adminVerifyPaymentAction = mod.adminVerifyPaymentAction as ReturnType<
      typeof vi.fn
    >;
  });

  test("200 when action succeeds", async () => {
    adminVerifyPaymentAction.mockResolvedValueOnce({ ok: true });
    const { PATCH } = await import("../route");
    const req = new Request("https://test.com", { method: "PATCH" });
    const res = await PATCH(req, makeParams());
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean };
    expect(json.ok).toBe(true);
  });

  test("403 when action returns UNAUTHORIZED", async () => {
    adminVerifyPaymentAction.mockResolvedValueOnce({
      ok: false,
      error: "UNAUTHORIZED: not admin",
    });
    const { PATCH } = await import("../route");
    const req = new Request("https://test.com", { method: "PATCH" });
    const res = await PATCH(req, makeParams());
    expect(res.status).toBe(403);
  });

  test("404 when action returns NOT_FOUND", async () => {
    adminVerifyPaymentAction.mockResolvedValueOnce({
      ok: false,
      error: "NOT_FOUND: order not found",
    });
    const { PATCH } = await import("../route");
    const req = new Request("https://test.com", { method: "PATCH" });
    const res = await PATCH(req, makeParams());
    expect(res.status).toBe(404);
  });

  test("400 when action fails with generic error", async () => {
    adminVerifyPaymentAction.mockResolvedValueOnce({
      ok: false,
      error: "Already in processing state",
    });
    const { PATCH } = await import("../route");
    const req = new Request("https://test.com", { method: "PATCH" });
    const res = await PATCH(req, makeParams());
    expect(res.status).toBe(400);
  });
});
