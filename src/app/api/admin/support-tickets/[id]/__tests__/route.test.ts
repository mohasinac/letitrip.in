/**
 * Tests for GET /api/admin/support-tickets/[id] and PATCH /api/admin/support-tickets/[id]
 *
 * Both verbs: ROLES_TRUST_SAFETY = ["admin", "employee"]
 * GET permission: admin:support-tickets:read — getTicketById, 404 via errorResponse
 * PATCH permission: admin:support-tickets:write — Zod patchSchema, getTicketById check, updateTicketStatus
 *
 * patchSchema fields: status (enum), priority (enum), assignedTo, assignedToName,
 *   internalNotes, relatedParties (orderId, productId, etc.)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockGetTicketById,
  mockUpdateTicketStatus,
} = vi.hoisted(() => ({
  mockGetTicketById: vi.fn(),
  mockUpdateTicketStatus: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_TRUST_SAFETY: ["admin", "employee"] }));

vi.mock("@mohasinac/appkit", () => ({
  supportRepository: {
    getTicketById: mockGetTicketById,
    updateTicketStatus: mockUpdateTicketStatus,
  },
  successResponse: (data: unknown, msg?: string) =>
    new Response(JSON.stringify({ ok: true, data, message: msg }), { status: 200 }),
  errorResponse: (msg: string, status: number) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  createRouteHandler: <B = unknown>(opts: {
    auth?: boolean;
    roles?: readonly string[];
    permission?: string;
    schema?: { safeParse: (b: unknown) => { success: boolean; data?: B; error?: { format: () => unknown } } };
    handler: (ctx: { request: Request; params?: unknown; user?: { uid: string; role: string }; body?: B }) => Promise<Response>;
  }) => {
    return async (request: Request, context?: { params?: unknown }) => {
      const params = context?.params instanceof Promise ? await (context.params as Promise<Record<string, string>>) : (context?.params as Record<string, string> | undefined);
      if ((opts.auth || opts.roles) && !_user)
        return new Response(JSON.stringify({ ok: false }), { status: 401 });
      if (opts.roles && _user && !opts.roles.includes(_user.role))
        return new Response(JSON.stringify({ ok: false }), { status: 403 });

      let body: B | undefined;
      if (opts.schema) {
        let raw: unknown = {};
        try { raw = await request.json(); } catch { /* empty body */ }
        const parsed = opts.schema.safeParse(raw);
        if (!parsed.success)
          return new Response(JSON.stringify({ ok: false, error: parsed.error?.format() }), { status: 400 });
        body = parsed.data;
      }

      return opts.handler({ request, params, user: _user ?? undefined, body });
    };
  },
}));

import { GET, PATCH } from "../route";

const params = { params: Promise.resolve({ id: "ticket-order-issue-ravi-20260508" }) };

const mockTicket = {
  id: "ticket-order-issue-ravi-20260508",
  status: "open",
  priority: "normal",
  subject: "Broken item received",
  userId: "user-ravi-k",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockGetTicketById.mockResolvedValue(mockTicket);
  mockUpdateTicketStatus.mockResolvedValue({ ...mockTicket, status: "in_progress" });
});

describe("GET /api/admin/support-tickets/[id]", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403 (not in ROLES_TRUST_SAFETY)", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("moderator → 403 (not in ROLES_TRUST_SAFETY)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(403);
  });

  it("employee → 200 (ROLES_TRUST_SAFETY includes employee)", async () => {
    _user = { uid: "emp-uid", role: "employee" };
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(200);
  });

  it("ticket not found → 404 via errorResponse", async () => {
    mockGetTicketById.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Ticket not found");
  });

  it("ticket found → 200 with full ticket document", async () => {
    const res = await GET(new Request("http://localhost") as never, params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { id: string; subject: string } };
    expect(json.data.id).toBe("ticket-order-issue-ravi-20260508");
    expect(json.data.subject).toBe("Broken item received");
  });

  it("calls getTicketById with correct id", async () => {
    await GET(new Request("http://localhost") as never, params as never);
    expect(mockGetTicketById).toHaveBeenCalledWith("ticket-order-issue-ravi-20260508");
  });
});

describe("PATCH /api/admin/support-tickets/[id]", () => {
  const makeRequest = (body: Record<string, unknown>) =>
    new Request("http://localhost", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }) as never;

  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await PATCH(makeRequest({}), params as never);
    expect(res.status).toBe(401);
  });

  it("seller → 403", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await PATCH(makeRequest({}), params as never);
    expect(res.status).toBe(403);
  });

  it("employee → 200 (ROLES_TRUST_SAFETY)", async () => {
    _user = { uid: "emp-uid", role: "employee" };
    const res = await PATCH(makeRequest({ status: "in_progress" }), params as never);
    expect(res.status).toBe(200);
  });

  it("invalid status value → 400", async () => {
    const res = await PATCH(makeRequest({ status: "INVALID_STATUS" }), params as never);
    expect(res.status).toBe(400);
  });

  it("invalid priority value → 400", async () => {
    const res = await PATCH(makeRequest({ priority: "critical" }), params as never);
    expect(res.status).toBe(400);
  });

  it("all optional fields absent (empty body) → 200 (all fields optional)", async () => {
    const res = await PATCH(makeRequest({}), params as never);
    expect(res.status).toBe(200);
  });

  it("ticket not found → 404", async () => {
    mockGetTicketById.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ status: "resolved" }), params as never);
    expect(res.status).toBe(404);
    const json = await res.clone().json() as { error: string };
    expect(json.error).toBe("Ticket not found");
  });

  it("valid status values accepted: open, in_progress, waiting_on_user, resolved, closed", async () => {
    const validStatuses = ["open", "in_progress", "waiting_on_user", "resolved", "closed"];
    for (const status of validStatuses) {
      vi.clearAllMocks();
      mockGetTicketById.mockResolvedValue(mockTicket);
      mockUpdateTicketStatus.mockResolvedValue({ ...mockTicket, status });
      const res = await PATCH(makeRequest({ status }), params as never);
      expect(res.status).toBe(200);
    }
  });

  it("valid priority values accepted: low, normal, high, urgent", async () => {
    const validPriorities = ["low", "normal", "high", "urgent"];
    for (const priority of validPriorities) {
      vi.clearAllMocks();
      mockGetTicketById.mockResolvedValue(mockTicket);
      mockUpdateTicketStatus.mockResolvedValue({ ...mockTicket, priority });
      const res = await PATCH(makeRequest({ priority }), params as never);
      expect(res.status).toBe(200);
    }
  });

  it("relatedParties fields (orderId, productId) accepted", async () => {
    const body = { relatedParties: { orderId: "order-3-20260508-a1b2c3", productId: "product-charizard" } };
    const res = await PATCH(makeRequest(body), params as never);
    expect(res.status).toBe(200);
  });

  it("calls updateTicketStatus with id and validated body", async () => {
    await PATCH(makeRequest({ status: "in_progress", assignedTo: "admin-uid" }), params as never);
    expect(mockUpdateTicketStatus).toHaveBeenCalledWith(
      "ticket-order-issue-ravi-20260508",
      expect.objectContaining({ status: "in_progress", assignedTo: "admin-uid" }),
    );
  });

  it("success → 200 with updated ticket and 'Ticket updated' message", async () => {
    const res = await PATCH(makeRequest({ status: "in_progress" }), params as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { message: string; data: { status: string } };
    expect(json.message).toBe("Ticket updated");
    expect(json.data.status).toBe("in_progress");
  });
});
