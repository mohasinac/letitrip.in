/**
 * Tests for POST /api/admin/payouts/weekly
 * Requires ROLES_ADMIN_ONLY + admin:payouts:write.
 * Queries all eligible orders (payoutStatus=eligible, status=delivered).
 * Groups by storeId; creates one payout per store.
 * Net amount computed via the shared computePayoutDeduction calculator
 * (platform fee + gateway fee + GST on platform fee) — same formula the
 * scheduled weeklyPayoutEligibility Firebase Function uses, so a manual
 * admin trigger produces an identical payout for the same order.
 * Updates each order to payoutStatus=requested.
 * Stores not found → skipped (no error).
 * Sellers not found → skipped.
 * Zero eligible orders → returns early { payoutsCreated: 0 }.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockOrderListAll,
  mockOrderUpdate,
  mockStoreRepository,
  mockUserFindById,
  mockPayoutCreate,
  mockGetSingleton,
} = vi.hoisted(() => ({
  mockOrderListAll: vi.fn(),
  mockOrderUpdate: vi.fn(),
  mockStoreRepository: { findById: vi.fn() },
  mockUserFindById: vi.fn(),
  mockPayoutCreate: vi.fn(),
  mockGetSingleton: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_ONLY: ["admin"],
  PAYOUT_FIELDS: { STATUS_VALUES: { PENDING: "pending" } },
}));

vi.mock("@mohasinac/appkit", () => ({
  orderRepository: { listAll: mockOrderListAll, update: mockOrderUpdate },
  storeRepository: { findById: mockStoreRepository.findById },
  userRepository: { findById: mockUserFindById },
  payoutRepository: { create: mockPayoutCreate },
  siteSettingsRepository: { getSingleton: mockGetSingleton },
  computePayoutDeduction: (grossAmount: number, commissions: { platformFeePercent: number; gstPercent: number; gatewayFeePercent?: number }) => {
    const platformFee = Math.round(grossAmount * (commissions.platformFeePercent / 100));
    const gatewayFee = Math.round(grossAmount * ((commissions.gatewayFeePercent ?? 0) / 100));
    const gstOnFee = Math.round(platformFee * (commissions.gstPercent / 100));
    const netAmount = Math.max(0, grossAmount - platformFee - gatewayFee - gstOnFee);
    return { platformFee, gatewayFee, gstOnFee, totalDeduction: platformFee + gatewayFee + gstOnFee, netAmount };
  },
  sortBy: (field: string) => `-${field}`,
  COMMON_FIELDS: { CREATED_AT: "createdAt" },
  SUCCESS_MESSAGES: { PAYOUT: { WEEKLY_PROCESSED: "Weekly payouts processed" } },
  serverLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createApiHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    handler: (ctx: { user?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });
      return opts.handler({ user: _user ?? undefined });
    };
  },
}));

import { POST } from "../route";

const makeReq = () =>
  new Request("http://localhost/api/admin/payouts/weekly", { method: "POST" });

const mockOrder1 = { id: "order-1", storeId: "store-pokemon", totalPrice: 100000, status: "delivered" };
const mockOrder2 = { id: "order-2", storeId: "store-pokemon", totalPrice: 50000, status: "delivered" };
const mockOrder3 = { id: "order-3", storeId: "store-diecast", totalPrice: 75000, status: "delivered" };

const mockStore = { id: "store-pokemon", ownerId: "seller-uid" };
const mockStore2 = { id: "store-diecast", ownerId: "seller-2-uid" };

const mockSeller = { uid: "seller-uid", displayName: "Ravi Kumar", email: "ravi@test.com", payoutDetails: { method: "upi", upiId: "ravi@upi" } };
const mockSeller2 = { uid: "seller-2-uid", displayName: "Ananya", email: "ananya@test.com", payoutDetails: { method: "bank_transfer" } };

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockOrderListAll.mockResolvedValue({ items: [mockOrder1, mockOrder2] });
  mockStoreRepository.findById.mockResolvedValue(mockStore);
  mockUserFindById.mockResolvedValue(mockSeller);
  mockPayoutCreate.mockResolvedValue({ id: "payout-1" });
  mockOrderUpdate.mockResolvedValue(undefined);
  mockGetSingleton.mockResolvedValue({
    commissions: { platformFeePercent: 5, gstPercent: 18, gatewayFeePercent: 2, minimumTransactionFee: 0 },
  });
});

describe("POST /api/admin/payouts/weekly", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(403);
  });

  it("no eligible orders → returns early with payoutsCreated=0", async () => {
    mockOrderListAll.mockResolvedValue({ items: [] });
    const res = await POST(makeReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { payoutsCreated: number; ordersProcessed: number } };
    expect(json.data.payoutsCreated).toBe(0);
    expect(json.data.ordersProcessed).toBe(0);
    expect(mockPayoutCreate).not.toHaveBeenCalled();
  });

  it("groups orders by storeId → creates one payout per store", async () => {
    mockOrderListAll.mockResolvedValue({ items: [mockOrder1, mockOrder2, mockOrder3] });
    mockStoreRepository.findById
      .mockResolvedValueOnce(mockStore)
      .mockResolvedValueOnce(mockStore2);
    mockUserFindById
      .mockResolvedValueOnce(mockSeller)
      .mockResolvedValueOnce(mockSeller2);
    mockPayoutCreate
      .mockResolvedValueOnce({ id: "payout-1" })
      .mockResolvedValueOnce({ id: "payout-2" });
    const res = await POST(makeReq() as never);
    const json = await res.clone().json() as { data: { payoutsCreated: number } };
    expect(json.data.payoutsCreated).toBe(2);
    expect(mockPayoutCreate).toHaveBeenCalledTimes(2);
  });

  it("net amount = gross - platform fee - gateway fee - GST on platform fee", async () => {
    // orders: 100000 + 50000 = 150000 gross
    // platformFee = 5% = 7500, gatewayFee = 2% = 3000, gstOnFee = 18% of 7500 = 1350
    // net = 150000 - 7500 - 3000 - 1350 = 138150
    await POST(makeReq() as never);
    const payoutArg = mockPayoutCreate.mock.calls[0][0] as {
      amount: number;
      grossAmount: number;
      platformFee: number;
      gatewayFee: number;
      gstAmount: number;
    };
    expect(payoutArg.grossAmount).toBe(150000);
    expect(payoutArg.platformFee).toBe(7500);
    expect(payoutArg.gatewayFee).toBe(3000);
    expect(payoutArg.gstAmount).toBe(1350);
    expect(payoutArg.amount).toBe(138150);
  });

  it("payout includes all order IDs for that store", async () => {
    await POST(makeReq() as never);
    const payoutArg = mockPayoutCreate.mock.calls[0][0] as { orderIds: string[] };
    expect(payoutArg.orderIds).toContain("order-1");
    expect(payoutArg.orderIds).toContain("order-2");
  });

  it("each order updated to payoutStatus=requested with payoutId", async () => {
    await POST(makeReq() as never);
    expect(mockOrderUpdate).toHaveBeenCalledWith("order-1", expect.objectContaining({
      payoutStatus: "requested",
      payoutId: "payout-1",
    }));
    expect(mockOrderUpdate).toHaveBeenCalledWith("order-2", expect.objectContaining({
      payoutStatus: "requested",
      payoutId: "payout-1",
    }));
  });

  it("store not found → store skipped, no payout created for it", async () => {
    mockStoreRepository.findById.mockResolvedValue(null);
    const res = await POST(makeReq() as never);
    const json = await res.clone().json() as { data: { payoutsCreated: number } };
    expect(json.data.payoutsCreated).toBe(0);
    expect(mockPayoutCreate).not.toHaveBeenCalled();
  });

  it("seller not found → store skipped, no payout created", async () => {
    mockUserFindById.mockResolvedValue(null);
    const res = await POST(makeReq() as never);
    const json = await res.clone().json() as { data: { payoutsCreated: number } };
    expect(json.data.payoutsCreated).toBe(0);
  });

  it("UPI seller → paymentMethod=upi with upiId", async () => {
    await POST(makeReq() as never);
    const payoutArg = mockPayoutCreate.mock.calls[0][0] as { paymentMethod: string; upiId?: string };
    expect(payoutArg.paymentMethod).toBe("upi");
    expect(payoutArg.upiId).toBe("ravi@upi");
  });

  it("bank transfer seller → paymentMethod=bank_transfer", async () => {
    mockUserFindById.mockResolvedValue(mockSeller2);
    await POST(makeReq() as never);
    const payoutArg = mockPayoutCreate.mock.calls[0][0] as { paymentMethod: string };
    expect(payoutArg.paymentMethod).toBe("bank_transfer");
  });

  it("order with no storeId → skipped (no payout for null storeId)", async () => {
    mockOrderListAll.mockResolvedValue({
      items: [{ ...mockOrder1, storeId: "" }],
    });
    const res = await POST(makeReq() as never);
    const json = await res.clone().json() as { data: { payoutsCreated: number } };
    expect(json.data.payoutsCreated).toBe(0);
  });

  it("success response includes sellers summary", async () => {
    const res = await POST(makeReq() as never);
    const json = await res.clone().json() as { data: { sellers: { storeId: string }[] } };
    expect(json.data.sellers).toHaveLength(1);
    expect(json.data.sellers[0].storeId).toBe("store-pokemon");
  });
});
