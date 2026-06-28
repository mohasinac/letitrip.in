/**
 * Tests for GET /api/user/export
 * Auth required. Any authenticated user.
 * Returns a JSON file download containing the user's profile, addresses, and orders.
 *
 * Key behaviors:
 * - Returns NextResponse with Content-Disposition: attachment
 * - exportedAt timestamp in ISO format
 * - Orders mapped to reduced shape: id, status, total (from totalPrice), currency, orderDate, items
 * - orderDate: if Date → ISO string; otherwise passed as-is
 * - addresses and orders fetched in parallel (Promise.all)
 * - On individual fetch failure → falls back gracefully (EMPTY_ORDER_RESULT / [])
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: {
  uid: string;
  role: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt?: string;
  publicProfile?: unknown;
  stats?: unknown;
} | null = null;

const { mockOrderListForUser, mockAddressListByOwner } = vi.hoisted(() => ({
  mockOrderListForUser: vi.fn(),
  mockAddressListByOwner: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  orderRepository: { listForUser: mockOrderListForUser },
  addressesRepository: { listByOwner: mockAddressListByOwner },
  createRouteHandler: (opts: {
    auth?: boolean;
    handler: (ctx: { user?: unknown }) => Promise<Response>;
  }) => {
    return async (_request: Request) => {
      if (opts.auth && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      return opts.handler({ user: _user ?? undefined });
    };
  },
}));

// NextResponse is used in the route; mock it so tests run outside Next.js
vi.mock("next/server", () => ({
  NextResponse: class {
    status: number;
    headers: Headers;
    body: string;
    constructor(body: string, init: { status: number; headers: Record<string, string> }) {
      this.body = body;
      this.status = init.status;
      this.headers = new Headers(init.headers);
    }
    async json() { return JSON.parse(this.body); }
    async text() { return this.body; }
  },
}));

import { GET } from "../route";

const mockOrders = [
  {
    id: "order-1-20260601-a1b2c3",
    status: "DELIVERED",
    totalPrice: 50000,
    currency: "INR",
    orderDate: new Date("2026-06-01T10:00:00Z"),
    items: [{ productId: "product-charizard", qty: 1 }],
  },
];

const mockAddresses = [
  { id: "addr-1", label: "Home", city: "Mumbai", ownerType: "user", ownerId: "buyer-uid" },
];

beforeEach(() => {
  vi.clearAllMocks();
  _user = {
    uid: "buyer-uid",
    role: "user",
    email: "buyer@test.com",
    displayName: "Ravi Kumar",
    photoURL: null as unknown as string,
    phoneNumber: "9876543210",
    createdAt: "2026-01-01T00:00:00Z",
  };
  mockOrderListForUser.mockResolvedValue({
    items: mockOrders,
    total: 1,
    page: 1,
    pageSize: 50,
    totalPages: 1,
    hasMore: false,
  });
  mockAddressListByOwner.mockResolvedValue(mockAddresses);
});

describe("GET /api/user/export", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost") as never);
    expect(res.status).toBe(401);
  });

  it("returns Content-Disposition: attachment header with uid prefix in filename", async () => {
    const res = await GET(new Request("http://localhost") as never);
    const disposition = res.headers.get("Content-Disposition");
    expect(disposition).toContain("attachment");
    expect(disposition).toContain("buyer-ui"); // first 8 chars of "buyer-uid"
    expect(disposition).toContain(".json");
  });

  it("Content-Type is application/json", async () => {
    const res = await GET(new Request("http://localhost") as never);
    expect(res.headers.get("Content-Type")).toBe("application/json");
  });

  it("response includes exportedAt, profile, addresses, orders", async () => {
    const res = await GET(new Request("http://localhost") as never);
    const payload = await res.json() as {
      exportedAt: string;
      profile: { uid: string };
      addresses: unknown[];
      orders: unknown[];
    };
    expect(payload.exportedAt).toBeDefined();
    expect(payload.profile.uid).toBe("buyer-uid");
    expect(payload.addresses).toHaveLength(1);
    expect(payload.orders).toHaveLength(1);
  });

  it("orders mapped to reduced shape: id, status, total (from totalPrice), currency, orderDate, items", async () => {
    const res = await GET(new Request("http://localhost") as never);
    const payload = await res.json() as { orders: Array<{ id: string; status: string; total: number; currency: string; orderDate: string }> };
    const order = payload.orders[0];
    expect(order.id).toBe("order-1-20260601-a1b2c3");
    expect(order.status).toBe("DELIVERED");
    expect(order.total).toBe(50000);
    expect(order.currency).toBe("INR");
  });

  it("orderDate as Date object → converted to ISO string in output", async () => {
    const res = await GET(new Request("http://localhost") as never);
    const payload = await res.json() as { orders: Array<{ orderDate: string }> };
    expect(payload.orders[0].orderDate).toBe("2026-06-01T10:00:00.000Z");
  });

  it("orderDate already a string → passed through as-is", async () => {
    mockOrderListForUser.mockResolvedValue({
      items: [{ ...mockOrders[0], orderDate: "2026-06-01" }],
      total: 1,
      page: 1,
      pageSize: 50,
      totalPages: 1,
      hasMore: false,
    });
    const res = await GET(new Request("http://localhost") as never);
    const payload = await res.json() as { orders: Array<{ orderDate: string }> };
    expect(payload.orders[0].orderDate).toBe("2026-06-01");
  });

  it("fetches orders and addresses in parallel", async () => {
    await GET(new Request("http://localhost") as never);
    // Both called during the handler (can't verify parallel easily, but both must be called)
    expect(mockOrderListForUser).toHaveBeenCalledWith("buyer-uid", {});
    expect(mockAddressListByOwner).toHaveBeenCalledWith("user", "buyer-uid");
  });

  it("order fetch fails → falls back to empty orders, still 200", async () => {
    mockOrderListForUser.mockRejectedValue(new Error("Firestore error"));
    const res = await GET(new Request("http://localhost") as never);
    expect(res.status).toBe(200);
    const payload = await res.json() as { orders: unknown[] };
    expect(payload.orders).toHaveLength(0);
  });

  it("address fetch fails → falls back to empty addresses, still 200", async () => {
    mockAddressListByOwner.mockRejectedValue(new Error("Firestore error"));
    const res = await GET(new Request("http://localhost") as never);
    expect(res.status).toBe(200);
    const payload = await res.json() as { addresses: unknown[] };
    expect(payload.addresses).toHaveLength(0);
  });

  it("profile includes uid, email, displayName, role from auth user", async () => {
    const res = await GET(new Request("http://localhost") as never);
    const payload = await res.json() as { profile: { uid: string; email: string; displayName: string; role: string } };
    expect(payload.profile.uid).toBe("buyer-uid");
    expect(payload.profile.email).toBe("buyer@test.com");
    expect(payload.profile.displayName).toBe("Ravi Kumar");
    expect(payload.profile.role).toBe("user");
  });
});
