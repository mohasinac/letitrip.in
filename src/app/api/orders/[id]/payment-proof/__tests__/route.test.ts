import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("@mohasinac/appkit/server", () => ({
  attachPaymentProofAction: vi.fn(),
}));

vi.mock("@/providers.config", () => ({
  withProviders: (fn: (...args: unknown[]) => unknown) => fn,
}));

// Static mock — avoids loading real appkit dist which has a broken relative import in server-entry.js
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
  parseJsonBody: async <T>(req: Request) => (await req.json()) as T,
}));

const makeParams = (id = "order-test-1") =>
  ({ params: Promise.resolve({ id }) }) as Parameters<
    typeof import("../route")["POST"]
  >[1];

describe("POST /api/orders/[id]/payment-proof", () => {
  let attachPaymentProofAction: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@mohasinac/appkit/server");
    attachPaymentProofAction = mod.attachPaymentProofAction as ReturnType<
      typeof vi.fn
    >;
  });

  test("400 when proofUrl is missing", async () => {
    const { POST } = await import("../route");
    const req = new Request("https://test.com", {
      method: "POST",
      body: JSON.stringify({ transactionId: "UTR123" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req, makeParams());
    expect(res.status).toBe(400);
    const json = (await res.json()) as { code: string };
    expect(json.code).toBe("MISSING_PROOF_URL");
  });

  test("200 when action succeeds", async () => {
    attachPaymentProofAction.mockResolvedValueOnce({ ok: true });
    const { POST } = await import("../route");
    const req = new Request("https://test.com", {
      method: "POST",
      body: JSON.stringify({ proofUrl: "/media/proof-1.jpg", transactionId: "UTR999" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req, makeParams());
    expect(res.status).toBe(200);
  });

  test("409 when action returns PROOF_ALREADY_ATTACHED", async () => {
    attachPaymentProofAction.mockResolvedValueOnce({
      ok: false,
      error: "PROOF_ALREADY_ATTACHED",
    });
    const { POST } = await import("../route");
    const req = new Request("https://test.com", {
      method: "POST",
      body: JSON.stringify({ proofUrl: "/media/proof-1.jpg" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req, makeParams());
    expect(res.status).toBe(409);
  });

  test("403 when action returns UNAUTHORIZED", async () => {
    attachPaymentProofAction.mockResolvedValueOnce({
      ok: false,
      error: "UNAUTHORIZED",
    });
    const { POST } = await import("../route");
    const req = new Request("https://test.com", {
      method: "POST",
      body: JSON.stringify({ proofUrl: "/media/proof-1.jpg" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req, makeParams());
    expect(res.status).toBe(403);
  });
});
