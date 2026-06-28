/**
 * Tests for GET/POST /api/admin/faqs
 * GET: Lists FAQs with optional category/isActive filters. Requires ROLES_ADMIN_MOD.
 * POST: Creates an FAQ. Requires ROLES_ADMIN_ONLY (admin:faqs:write).
 *       Slug auto-generated from question if not provided.
 *       Slug always prefixed with "faq-".
 *       isActive defaults to true, isPinned/showOnHomepage/showInFooter default to false.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFaqList,
  mockFaqCreate,
} = vi.hoisted(() => ({
  mockFaqList: vi.fn(),
  mockFaqCreate: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({
  ROLES_ADMIN_MOD: ["admin", "moderator"],
  ROLES_ADMIN_ONLY: ["admin"],
}));

vi.mock("@mohasinac/appkit", () => ({
  faqsRepository: { list: mockFaqList, create: mockFaqCreate },
  sortBy: (field: string, dir = "DESC") => `${dir === "ASC" ? "" : "-"}${field}`,
  FAQ_FIELDS: { PRIORITY: "priority", ORDER: "order" },
  getNumberParam: (params: URLSearchParams, key: string, def: number) =>
    Number(params.get(key) ?? def),
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getStringParam: (params: URLSearchParams, key: string) => params.get(key) ?? "",
  successResponse: (data: unknown, _msg?: string) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    roles?: readonly string[];
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { user?: unknown; body?: unknown; request: Request }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      if ((opts.auth || opts.roles) && !_user)
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
      return opts.handler({ user: _user ?? undefined, body, request });
    };
  },
}));

import { GET, POST } from "../route";

const makeGetReq = (params: Record<string, string> = {}) => {
  const url = new URL("http://localhost/api/admin/faqs");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};
const makePostReq = (body: unknown) =>
  new Request("http://localhost/api/admin/faqs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockFaq = { id: "faq-how-to-bid", question: "How to bid?", answer: { text: "..." }, isActive: true };
const validFaqBody = {
  question: "How does shipping work?",
  answer: "We ship within 2-3 business days.",
  category: "Shipping",
};

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFaqList.mockResolvedValue({ items: [mockFaq], total: 1, page: 1, pageSize: 50 });
  mockFaqCreate.mockResolvedValue({ ...mockFaq, id: "faq-how-does-shipping-work" });
});

describe("GET /api/admin/faqs", () => {
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

  it("moderator → 200 (ROLES_ADMIN_MOD)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
  });

  it("admin → 200 with FAQ list", async () => {
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
    const json = await res.clone().json() as { data: { items: unknown[] } };
    expect(json.data.items).toHaveLength(1);
  });

  it("category filter forwarded to repo", async () => {
    await GET(makeGetReq({ category: "Shipping" }) as never);
    const listArg = mockFaqList.mock.calls[0][0] as { filters: string };
    expect(listArg.filters).toContain("category==Shipping");
  });

  it("isActive=true filter forwarded", async () => {
    await GET(makeGetReq({ isActive: "true" }) as never);
    const listArg = mockFaqList.mock.calls[0][0] as { filters: string };
    expect(listArg.filters).toContain("isActive==true");
  });

  it("isActive=false filter forwarded", async () => {
    await GET(makeGetReq({ isActive: "false" }) as never);
    const listArg = mockFaqList.mock.calls[0][0] as { filters: string };
    expect(listArg.filters).toContain("isActive==false");
  });

  it("isActive=invalid not forwarded as filter", async () => {
    await GET(makeGetReq({ isActive: "maybe" }) as never);
    const listArg = mockFaqList.mock.calls[0][0] as { filters?: string };
    expect(listArg.filters ?? "").not.toContain("isActive==maybe");
  });
});

describe("POST /api/admin/faqs", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq(validFaqBody) as never);
    expect(res.status).toBe(401);
  });

  it("moderator → 403 (ROLES_ADMIN_ONLY for write)", async () => {
    _user = { uid: "mod-uid", role: "moderator" };
    const res = await POST(makePostReq(validFaqBody) as never);
    expect(res.status).toBe(403);
  });

  it("missing question → 400", async () => {
    const res = await POST(makePostReq({ answer: "Test", category: "General" }) as never);
    expect(res.status).toBe(400);
  });

  it("missing answer → 400", async () => {
    const res = await POST(makePostReq({ question: "Test?", category: "General" }) as never);
    expect(res.status).toBe(400);
  });

  it("missing category → 400", async () => {
    const res = await POST(makePostReq({ question: "Test?", answer: "Yes" }) as never);
    expect(res.status).toBe(400);
  });

  it("slug auto-generated from question and prefixed with faq-", async () => {
    await POST(makePostReq(validFaqBody) as never);
    const createArg = mockFaqCreate.mock.calls[0][0] as { id: string };
    expect(createArg.id).toMatch(/^faq-/);
    expect(createArg.id).toContain("how-does-shipping-work");
  });

  it("provided slug gets faq- prefix if not already prefixed", async () => {
    await POST(makePostReq({ ...validFaqBody, slug: "my-custom-slug" }) as never);
    const createArg = mockFaqCreate.mock.calls[0][0] as { id: string };
    expect(createArg.id).toBe("faq-my-custom-slug");
  });

  it("provided slug already has faq- prefix — not double-prefixed", async () => {
    await POST(makePostReq({ ...validFaqBody, slug: "faq-existing-slug" }) as never);
    const createArg = mockFaqCreate.mock.calls[0][0] as { id: string };
    expect(createArg.id).toBe("faq-existing-slug");
  });

  it("isActive defaults to true", async () => {
    await POST(makePostReq(validFaqBody) as never);
    const createArg = mockFaqCreate.mock.calls[0][0] as { isActive: boolean };
    expect(createArg.isActive).toBe(true);
  });

  it("isPinned defaults to false", async () => {
    await POST(makePostReq(validFaqBody) as never);
    const createArg = mockFaqCreate.mock.calls[0][0] as { isPinned: boolean };
    expect(createArg.isPinned).toBe(false);
  });

  it("showOnHomepage defaults to false", async () => {
    await POST(makePostReq(validFaqBody) as never);
    const createArg = mockFaqCreate.mock.calls[0][0] as { showOnHomepage: boolean };
    expect(createArg.showOnHomepage).toBe(false);
  });

  it("answer stored as { text, format: 'html' } object", async () => {
    await POST(makePostReq(validFaqBody) as never);
    const createArg = mockFaqCreate.mock.calls[0][0] as { answer: { text: string; format: string } };
    expect(createArg.answer.text).toBe("We ship within 2-3 business days.");
    expect(createArg.answer.format).toBe("html");
  });

  it("success → 200 with created FAQ", async () => {
    const res = await POST(makePostReq(validFaqBody) as never);
    expect(res.status).toBe(200);
  });
});
