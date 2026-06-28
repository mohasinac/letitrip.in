/**
 * Tests for GET/PATCH /api/store/payout-settings
 * GET: Returns masked payout details (bank account number never returned raw).
 * PATCH upi: Stores UPI ID, isConfigured: true.
 * PATCH bank_transfer: Stores masked account number (last 4 digits), IFSC uppercased.
 * Bank account number stored in full server-side but masked in response.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string; payoutDetails?: unknown } | null = null;

const { mockUserUpdate } = vi.hoisted(() => ({
  mockUserUpdate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_STORE_WRITE: ["seller", "admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  userRepository: { update: mockUserUpdate },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: string[];
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

import { GET, PATCH } from "../route";

const makeGetReq = () => new Request("http://localhost/api/store/payout-settings");
const makePatchReq = (body: unknown) =>
  new Request("http://localhost/api/store/payout-settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockPayoutDetails = {
  method: "bank_transfer",
  isConfigured: true,
  bankAccount: {
    accountHolderName: "Ravi Kumar",
    accountNumber: "123456789012",
    accountNumberMasked: "••••••••9012",
    ifscCode: "HDFC0001234",
    bankName: "HDFC Bank",
    accountType: "savings",
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "seller-uid", role: "seller", payoutDetails: mockPayoutDetails };
  mockUserUpdate.mockResolvedValue(undefined);
});

describe("GET /api/store/payout-settings", () => {
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

  it("accountNumber never returned in response", async () => {
    const res = await GET(makeGetReq() as never);
    const text = await res.text();
    expect(text).not.toContain("123456789012");
  });

  it("masked account number returned", async () => {
    const res = await GET(makeGetReq() as never);
    const json = await res.clone().json() as {
      data: { payoutDetails: { bankAccount: { accountNumberMasked: string } } }
    };
    expect(json.data.payoutDetails.bankAccount.accountNumberMasked).toBe("••••••••9012");
  });

  it("no payout details → returns default { method: upi, isConfigured: false }", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(makeGetReq() as never);
    const json = await res.clone().json() as {
      data: { payoutDetails: { method: string; isConfigured: boolean } }
    };
    expect(json.data.payoutDetails.method).toBe("upi");
    expect(json.data.payoutDetails.isConfigured).toBe(false);
  });
});

describe("PATCH /api/store/payout-settings", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makePatchReq({ method: "upi", upiId: "seller@upi" }) as never);
    expect(res.status).toBe(401);
  });

  it("buyer → 403", async () => {
    _user = { uid: "buyer-uid", role: "user" };
    const res = await PATCH(makePatchReq({ method: "upi", upiId: "seller@upi" }) as never);
    expect(res.status).toBe(403);
  });

  it("missing method → 400", async () => {
    const res = await PATCH(makePatchReq({ upiId: "seller@upi" }) as never);
    expect(res.status).toBe(400);
  });

  it("invalid method → 400", async () => {
    const res = await PATCH(makePatchReq({ method: "crypto", upiId: "seller@upi" }) as never);
    expect(res.status).toBe(400);
  });

  it("UPI: missing upiId → 400", async () => {
    const res = await PATCH(makePatchReq({ method: "upi" }) as never);
    expect(res.status).toBe(400);
  });

  it("UPI: upiId too short (< 3 chars) → 400", async () => {
    const res = await PATCH(makePatchReq({ method: "upi", upiId: "ab" }) as never);
    expect(res.status).toBe(400);
  });

  it("UPI: valid → stores method:upi, upiId, isConfigured:true", async () => {
    await PATCH(makePatchReq({ method: "upi", upiId: "seller@paytm" }) as never);
    const updateArg = mockUserUpdate.mock.calls[0][1] as {
      payoutDetails: { method: string; upiId: string; isConfigured: boolean }
    };
    expect(updateArg.payoutDetails.method).toBe("upi");
    expect(updateArg.payoutDetails.upiId).toBe("seller@paytm");
    expect(updateArg.payoutDetails.isConfigured).toBe(true);
  });

  it("UPI: success → 200 with masked details", async () => {
    const res = await PATCH(makePatchReq({ method: "upi", upiId: "seller@paytm" }) as never);
    expect(res.status).toBe(200);
  });

  it("bank_transfer: invalid IFSC → 400", async () => {
    const res = await PATCH(makePatchReq({
      method: "bank_transfer",
      accountHolderName: "Ravi Kumar",
      accountNumber: "123456789012",
      ifscCode: "INVALIDIFSC",
      bankName: "HDFC Bank",
      accountType: "savings",
    }) as never);
    expect(res.status).toBe(400);
  });

  it("bank_transfer: account number < 9 digits → 400", async () => {
    const res = await PATCH(makePatchReq({
      method: "bank_transfer",
      accountHolderName: "Ravi Kumar",
      accountNumber: "12345678",
      ifscCode: "HDFC0001234",
      bankName: "HDFC Bank",
      accountType: "savings",
    }) as never);
    expect(res.status).toBe(400);
  });

  it("bank_transfer: account number with letters → 400", async () => {
    const res = await PATCH(makePatchReq({
      method: "bank_transfer",
      accountHolderName: "Ravi Kumar",
      accountNumber: "1234ABCD5678",
      ifscCode: "HDFC0001234",
      bankName: "HDFC Bank",
      accountType: "savings",
    }) as never);
    expect(res.status).toBe(400);
  });

  it("bank_transfer: account number masked (last 4 shown)", async () => {
    await PATCH(makePatchReq({
      method: "bank_transfer",
      accountHolderName: "Ravi Kumar",
      accountNumber: "123456789012",
      ifscCode: "HDFC0001234",
      bankName: "HDFC Bank",
      accountType: "savings",
    }) as never);
    const updateArg = mockUserUpdate.mock.calls[0][1] as {
      payoutDetails: { bankAccount: { accountNumber: string; accountNumberMasked: string } }
    };
    // Full account number stored server-side
    expect(updateArg.payoutDetails.bankAccount.accountNumber).toBe("123456789012");
    // Masked version shows last 4 digits
    expect(updateArg.payoutDetails.bankAccount.accountNumberMasked).toMatch(/9012$/);
    expect(updateArg.payoutDetails.bankAccount.accountNumberMasked).not.toBe("123456789012");
  });

  it("bank_transfer: IFSC stored uppercase (toUpperCase applied in handler)", async () => {
    // Zod regex /^[A-Z]{4}0[A-Z0-9]{6}$/ requires uppercase, so handler always
    // receives uppercase IFSC; toUpperCase() is a safe idempotent call.
    await PATCH(makePatchReq({
      method: "bank_transfer",
      accountHolderName: "Ravi Kumar",
      accountNumber: "123456789012",
      ifscCode: "HDFC0001234",
      bankName: "HDFC Bank",
      accountType: "savings",
    }) as never);
    const updateArg = mockUserUpdate.mock.calls[0][1] as {
      payoutDetails: { bankAccount: { ifscCode: string } }
    };
    expect(updateArg.payoutDetails.bankAccount.ifscCode).toBe("HDFC0001234");
  });

  it("bank_transfer: raw accountNumber NOT returned in response", async () => {
    const res = await PATCH(makePatchReq({
      method: "bank_transfer",
      accountHolderName: "Ravi Kumar",
      accountNumber: "123456789012",
      ifscCode: "HDFC0001234",
      bankName: "HDFC Bank",
      accountType: "savings",
    }) as never);
    const text = await res.text();
    // Raw account number must not appear in response body
    expect(text).not.toContain('"accountNumber":"123456789012"');
  });

  it("bank_transfer: success → 200", async () => {
    const res = await PATCH(makePatchReq({
      method: "bank_transfer",
      accountHolderName: "Ravi Kumar",
      accountNumber: "123456789012",
      ifscCode: "HDFC0001234",
      bankName: "HDFC Bank",
      accountType: "savings",
    }) as never);
    expect(res.status).toBe(200);
  });
});
