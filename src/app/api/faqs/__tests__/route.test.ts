/**
 * Tests for GET + POST /api/faqs
 * GET: public endpoint; always appends isActive==true; variable interpolation.
 * POST: admin-only; auto-assigns order; SEO slug derived from question.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

let _user: { uid: string; role: string } | null = null;

const {
  mockFaqList,
  mockFaqCreate,
  mockGetSingleton,
  mockInvalidateCache,
} = vi.hoisted(() => ({
  mockFaqList: vi.fn(),
  mockFaqCreate: vi.fn(),
  mockGetSingleton: vi.fn(),
  mockInvalidateCache: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));
vi.mock("@/constants", () => ({ ROLES_ADMIN_ONLY: ["admin"] }));

vi.mock("@mohasinac/appkit", () => ({
  faqsRepository: { list: mockFaqList, create: mockFaqCreate },
  siteSettingsRepository: { getSingleton: mockGetSingleton },
  invalidateCache: mockInvalidateCache,
  faqCreateSchema: {
    _output: {},
    safeParse: (d: { question?: string; answer?: unknown; category?: string }) => {
      if (!d.question || !d.category) return { success: false, error: { issues: [{ message: "question and category required" }] } };
      return { success: true, data: d };
    },
  },
  slugifyQuestion: (q: string) => q.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  sortBy: (field: string, dir = "DESC") => `${dir === "ASC" ? "" : "-"}${field}`,
  FAQ_FIELDS: { PRIORITY: "priority", ORDER: "order" },
  getSearchParams: (req: Request) => new URL(req.url).searchParams,
  getStringParam: (sp: URLSearchParams, key: string) => sp.get(key) ?? undefined,
  getNumberParam: (sp: URLSearchParams, key: string, def: number, opts?: { min?: number; max?: number }) => {
    const v = Number(sp.get(key)) || def;
    if (opts?.min !== undefined && v < opts.min) return opts.min;
    if (opts?.max !== undefined && v > opts.max) return opts.max;
    return v;
  },
  getBooleanParam: (sp: URLSearchParams, key: string) => {
    const v = sp.get(key);
    if (v === "true") return true;
    if (v === "false") return false;
    return undefined;
  },
  successResponse: (data: unknown, _msg?: string, status = 200) => {
    const res = new Response(JSON.stringify({ ok: true, data }), { status });
    return res;
  },
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  SUCCESS_MESSAGES: { FAQ: { CREATED: "FAQ created" } },
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
          return new Response(JSON.stringify({ ok: false, error: result.error?.issues[0]?.message }), { status: 400 });
        }
        body = result.data;
      }
      return opts.handler({ user: _user ?? undefined, body, request });
    };
  },
}));

import { GET, POST } from "../route";

const mockSiteSettings = {
  siteName: "LetItRip",
  contact: { email: "support@letitrip.in", phone: "+91 9999999999", address: "Mumbai" },
};

const makeFaq = (overrides = {}) => ({
  id: "faq-001",
  question: "How does bidding work?",
  answer: { text: "To bid, click the bid button on any auction.", format: "plain" },
  category: "auctions",
  isActive: true,
  priority: 5,
  order: 1,
  ...overrides,
});

const pagedResult = {
  items: [makeFaq()],
  total: 1,
  page: 1,
  pageSize: 50,
  totalPages: 1,
  hasMore: false,
};

const makeGetReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/faqs");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const makePostReq = (body: unknown) =>
  new Request("http://localhost/api/faqs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  _user = { uid: "admin-uid", role: "admin" };
  mockFaqList.mockResolvedValue(pagedResult);
  mockFaqCreate.mockResolvedValue({ id: "faq-new", question: "New FAQ?", seo: { slug: "new-faq" } });
  mockGetSingleton.mockResolvedValue(mockSiteSettings);
});

describe("GET /api/faqs", () => {
  it("unauthenticated → 200 (public endpoint)", async () => {
    _user = null;
    const res = await GET(makeGetReq() as never);
    expect(res.status).toBe(200);
  });

  it("isActive==true always appended to filters", async () => {
    await GET(makeGetReq() as never);
    const callArg = mockFaqList.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).toContain("isActive==true");
  });

  it("category filter combined with isActive filter", async () => {
    await GET(makeGetReq({ category: "auctions" }) as never);
    const callArg = mockFaqList.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).toContain("isActive==true");
    expect(callArg.filters).toContain("category==auctions");
  });

  it("showOnHomepage filter appended when provided", async () => {
    await GET(makeGetReq({ showOnHomepage: "true" }) as never);
    const callArg = mockFaqList.mock.calls[0][0] as { filters: string };
    expect(callArg.filters).toContain("showOnHomepage==true");
  });

  it("search + tags simultaneously → 400 (Firestore Sieve limitation)", async () => {
    const res = await GET(makeGetReq({ search: "bidding", tags: "auctions" }) as never);
    expect(res.status).toBe(400);
  });

  it("variable interpolation: {{companyName}} replaced with site settings siteName", async () => {
    mockFaqList.mockResolvedValue({
      ...pagedResult,
      items: [makeFaq({ answer: { text: "Contact {{companyName}} for help.", format: "plain" } })],
    });
    const res = await GET(makeGetReq() as never);
    const json = await res.clone().json() as { data: { items: { answer: { text: string } }[] } };
    expect(json.data.items[0].answer.text).toBe("Contact LetItRip for help.");
  });

  it("variable interpolation: {{supportEmail}} replaced", async () => {
    mockFaqList.mockResolvedValue({
      ...pagedResult,
      items: [makeFaq({ answer: { text: "Email us at {{supportEmail}}", format: "plain" } })],
    });
    const res = await GET(makeGetReq() as never);
    const json = await res.clone().json() as { data: { items: { answer: { text: string } }[] } };
    expect(json.data.items[0].answer.text).toBe("Email us at support@letitrip.in");
  });

  it("pageSize clamped to 50", async () => {
    await GET(makeGetReq({ pageSize: "200" }) as never);
    const callArg = mockFaqList.mock.calls[0][0] as { pageSize: string };
    expect(Number(callArg.pageSize)).toBe(50);
  });

  it("returns categories list in response", async () => {
    const res = await GET(makeGetReq() as never);
    const json = await res.clone().json() as { data: { categories: string[] } };
    expect(json.data.categories).toContain("general");
    expect(json.data.categories).toContain("orders_payment");
  });
});

describe("POST /api/faqs", () => {
  it("unauthenticated → 401", async () => {
    _user = null;
    const res = await POST(makePostReq({ question: "Test?", category: "general" }) as never);
    expect(res.status).toBe(401);
  });

  it("seller role → 403 (admin-only)", async () => {
    _user = { uid: "seller-uid", role: "seller" };
    const res = await POST(makePostReq({ question: "Test?", category: "general" }) as never);
    expect(res.status).toBe(403);
  });

  it("missing question → 400", async () => {
    const res = await POST(makePostReq({ category: "general" }) as never);
    expect(res.status).toBe(400);
  });

  it("auto-assigns order as maxOrder + 1", async () => {
    mockFaqList.mockResolvedValueOnce({ items: [{ order: 7 }], total: 1 });
    await POST(makePostReq({ question: "Test FAQ?", category: "general" }) as never);
    expect(mockFaqCreate).toHaveBeenCalledWith(
      expect.objectContaining({ order: 8 }),
    );
  });

  it("order = 1 when no existing FAQs", async () => {
    mockFaqList.mockResolvedValueOnce({ items: [], total: 0 });
    await POST(makePostReq({ question: "Test FAQ?", category: "general" }) as never);
    expect(mockFaqCreate).toHaveBeenCalledWith(
      expect.objectContaining({ order: 1 }),
    );
  });

  it("SEO slug derived from question", async () => {
    await POST(makePostReq({ question: "How Does Bidding Work?", category: "auctions" }) as never);
    expect(mockFaqCreate).toHaveBeenCalledWith(
      expect.objectContaining({ seo: { slug: "how-does-bidding-work" } }),
    );
  });

  it("createdBy set to admin uid", async () => {
    await POST(makePostReq({ question: "Test?", category: "general" }) as never);
    expect(mockFaqCreate).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: "admin-uid" }),
    );
  });

  it("cache invalidated after creation", async () => {
    await POST(makePostReq({ question: "Test?", category: "general" }) as never);
    expect(mockInvalidateCache).toHaveBeenCalledWith("/api/faqs");
  });

  it("success → 201 with FAQ data", async () => {
    const res = await POST(makePostReq({ question: "How Does Bidding Work?", category: "auctions" }) as never);
    expect(res.status).toBe(201);
    const json = await res.clone().json() as { ok: boolean; data: { id: string } };
    expect(json.ok).toBe(true);
    expect(json.data.id).toBe("faq-new");
  });
});
