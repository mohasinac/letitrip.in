/**
 * @jest-environment node
 */

/**
 * FAQs API Integration Tests
 *
 * Tests GET /api/faqs and POST /api/faqs
 */

import { buildRequest, parseResponse, mockAdminUser } from "./helpers";

// ============================================
// Mocks
// ============================================

let mockRouteUser = mockAdminUser();

const mockFaqsFindAll = jest.fn();
const mockFaqsList = jest.fn();
const mockFaqsCreate = jest.fn();
const mockGetSingleton = jest.fn();

jest.mock("@/repositories", () => ({
  faqsRepository: {
    findAll: (...args: unknown[]) => mockFaqsFindAll(...args),
    list: (...args: unknown[]) => mockFaqsList(...args),
    create: (...args: unknown[]) => mockFaqsCreate(...args),
  },
  siteSettingsRepository: {
    getSingleton: (...args: unknown[]) => mockGetSingleton(...args),
  },
}));

jest.mock("@mohasinac/next", () => ({
  createRouteHandler:
    (config: any) =>
    async (requestOrContext: Request | { request: Request }) => {
      const request =
        requestOrContext instanceof Request
          ? requestOrContext
          : requestOrContext.request;

      try {
        let body: unknown;

        if (request.method !== "GET" && request.method !== "HEAD") {
          body = await request.json();

          if (config.schema?.safeParse) {
            const parsed = config.schema.safeParse(body);
            if (!parsed.success) {
              return Response.json(
                { success: false, errors: parsed.error.issues },
                { status: 400 },
              );
            }
            body = parsed.data;
          }
        }

        const result = await config.handler({
          request,
          body,
          user: config.auth ? mockRouteUser : undefined,
        });

        if (result instanceof Response) {
          return result;
        }

        return Response.json(
          { success: true, data: result },
          { status: request.method === "POST" ? 201 : 200 },
        );
      } catch (error) {
        return Response.json(
          {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        );
      }
    },
}));

jest.mock("@/lib/api/request-helpers", () => ({
  getSearchParams: (request: Request) => new URL(request.url).searchParams,
  getStringParam: (params: URLSearchParams, key: string) => {
    const value = params.get(key);
    return value === null ? undefined : value;
  },
  getBooleanParam: (params: URLSearchParams, key: string) => {
    const value = params.get(key);
    if (value === "true") return true;
    if (value === "false") return false;
    return undefined;
  },
  getNumberParam: (params: URLSearchParams, key: string, fallback: number) => {
    const value = params.get(key);
    if (value === null || value === "") return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  },
}));

jest.mock("@/lib/api/cache-middleware", () => ({
  invalidateCache: jest.fn(),
}));

jest.mock("@/lib/validation/schemas", () => ({
  validateRequestBody: (_schema: unknown, body: any) => {
    if (body && body.question && body.answer) {
      return { success: true, data: body };
    }
    return {
      success: false,
      errors: {
        format: () => [{ path: ["question"], message: "Question is required" }],
      },
    };
  },
  formatZodErrors: (errors: any) => errors?.format?.() || [],
  faqCreateSchema: {
    safeParse: (data: any) =>
      data && data.question && data.answer
        ? { success: true, data }
        : {
            success: false,
            error: {
              issues: [{ path: ["question"], message: "Question is required" }],
            },
          },
  },
}));

jest.mock("@/lib/errors", () => ({
  AuthenticationError: class AuthenticationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthenticationError";
    }
  },
  AuthorizationError: class AuthorizationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "AuthorizationError";
    }
  },
}));

import { GET, POST } from "../faqs/route";

// ============================================
// Mock data
// ============================================

const mockSiteSettings = {
  siteName: "LetItRip",
  contact: {
    email: "support@letitrip.in",
    phone: "+91-1234567890",
    address: "123 Market Street",
  },
};

const mockFAQs = [
  {
    id: "faq-1",
    question: "How do I place an order?",
    answer: {
      text: "Contact us at {{supportEmail}} for help.",
      format: "text",
    },
    category: "orders_payment",
    priority: 10,
    order: 1,
    tags: ["orders"],
    showOnHomepage: true,
  },
  {
    id: "faq-2",
    question: "What is the return policy?",
    answer: { text: "Visit {{companyName}} return center.", format: "text" },
    category: "returns_refunds",
    priority: 5,
    order: 2,
    tags: ["returns"],
    showOnHomepage: false,
  },
  {
    id: "faq-3",
    question: "How do I contact support?",
    answer: {
      text: "Call {{supportPhone}} or email {{supportEmail}}.",
      format: "text",
    },
    category: "technical_support",
    priority: 8,
    order: 3,
    tags: ["support", "contact"],
    showOnHomepage: true,
  },
];

// ============================================
// Tests
// ============================================

describe("FAQs API - GET /api/faqs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteUser = mockAdminUser();
    // Clear cache to prevent cached responses in tests
    const { CacheManager } = require("@/classes");
    const cache = CacheManager.getInstance();
    cache.clear();
    mockFaqsFindAll.mockResolvedValue([...mockFAQs]);
    mockGetSingleton.mockResolvedValue(mockSiteSettings);
    // Smart mock for Firestore-native list() — returns filtered/sorted subset
    mockFaqsList.mockImplementation(async (model: any, opts?: any) => {
      let items = [...mockFAQs] as any[];
      if (model?.filters) {
        const catMatch = model.filters.match(/category==([\w]+)/);
        if (catMatch) items = items.filter((f) => f.category === catMatch[1]);
        if (model.filters.includes("showOnHomepage==true")) {
          items = items.filter((f) => f.showOnHomepage === true);
        }
      }
      if (opts?.search) {
        const searchTerm = String(opts.search).toLowerCase();
        items = items.filter(
          (faq) =>
            faq.question.toLowerCase().includes(searchTerm) ||
            faq.answer.text.toLowerCase().includes(searchTerm),
        );
      }
      if (opts?.tags?.length) {
        items = items.filter((faq) =>
          opts.tags.some((tag: string) => faq.tags.includes(tag)),
        );
      }
      const sorts: string = model?.sorts ?? "-priority";
      if (sorts.includes("-priority")) {
        items = [...items].sort(
          (a, b) => (b.priority ?? 0) - (a.priority ?? 0),
        );
      }
      return {
        items,
        total: items.length,
        page: 1,
        pageSize: 100,
        totalPages: 1,
        hasMore: false,
      };
    });
  });

  it("returns all FAQs with success", async () => {
    const req = buildRequest("/api/faqs");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.items).toHaveLength(3);
  });

  it("interpolates {{supportEmail}} in answers", async () => {
    const req = buildRequest("/api/faqs");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    const faq1 = body.data.items.find((f: any) => f.id === "faq-1");
    expect(faq1.answer.text).toContain("support@letitrip.in");
    expect(faq1.answer.text).not.toContain("{{supportEmail}}");
  });

  it("interpolates {{companyName}} in answers", async () => {
    const req = buildRequest("/api/faqs");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    const faq2 = body.data.items.find((f: any) => f.id === "faq-2");
    expect(faq2.answer.text).toContain("LetItRip");
    expect(faq2.answer.text).not.toContain("{{companyName}}");
  });

  it("interpolates {{supportPhone}} in answers", async () => {
    const req = buildRequest("/api/faqs");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    const faq3 = body.data.items.find((f: any) => f.id === "faq-3");
    expect(faq3.answer.text).toContain("+91-1234567890");
  });

  it("filters by category", async () => {
    const req = buildRequest("/api/faqs?category=orders_payment");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data.items).toHaveLength(1);
    expect(body.data.items[0].category).toBe("orders_payment");
  });

  it("filters by showOnHomepage", async () => {
    const req = buildRequest("/api/faqs?showOnHomepage=true");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data.items).toHaveLength(2);
    body.data.items.forEach((faq: any) => {
      expect(faq.showOnHomepage).toBe(true);
    });
  });

  it("filters by search query", async () => {
    const req = buildRequest("/api/faqs?search=return");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data.items).toHaveLength(1);
    expect(body.data.items[0].id).toBe("faq-2");
  });

  it("filters by tags", async () => {
    const req = buildRequest("/api/faqs?tags=support");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data.items).toHaveLength(1);
    expect(body.data.items[0].id).toBe("faq-3");
  });

  it("sorts by priority (highest first)", async () => {
    const req = buildRequest("/api/faqs");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    const priorities = body.data.items.map((f: any) => f.priority);
    for (let i = 0; i < priorities.length - 1; i++) {
      expect(priorities[i]).toBeGreaterThanOrEqual(priorities[i + 1]);
    }
  });

  it("includes meta with total and categories", async () => {
    const req = buildRequest("/api/faqs");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data.total).toBe(3);
    expect(body.data.categories).toBeDefined();
    expect(Array.isArray(body.data.categories)).toBe(true);
  });

  it("sets cache-control headers", async () => {
    const req = buildRequest("/api/faqs");
    const res = await GET(req);

    expect(res.headers.get("cache-control")).toContain("public");
  });

  it("handles repository errors gracefully", async () => {
    mockFaqsList.mockRejectedValue(new Error("DB error"));
    const req = buildRequest("/api/faqs");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.success).toBe(false);
  });
});

describe("FAQs API - POST /api/faqs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouteUser = mockAdminUser();
    mockFaqsFindAll.mockResolvedValue(mockFAQs);
    // Return the highest-order FAQ so auto-assign gives maxOrder(3) + 1 = 4
    mockFaqsList.mockResolvedValue({ items: [mockFAQs[2]], total: 1 });
    mockFaqsCreate.mockResolvedValue({ id: "new-faq", question: "New FAQ" });
  });

  it("creates an FAQ with valid data", async () => {
    const req = buildRequest("/api/faqs", {
      method: "POST",
      body: {
        question: "How do I track my order?",
        answer: { text: "Check your email for tracking details." },
        category: "orders_payment",
      },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("requires admin role", async () => {
    const req = buildRequest("/api/faqs", {
      method: "POST",
      body: { question: "Test?", answer: { text: "Test" } },
    });
    await POST(req);
    expect(mockFaqsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: mockRouteUser.uid }),
    );
  });

  it("auto-assigns order position", async () => {
    const req = buildRequest("/api/faqs", {
      method: "POST",
      body: { question: "New FAQ?", answer: { text: "Answer" } },
    });
    await POST(req);

    expect(mockFaqsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ order: 4 }), // max existing order is 3
    );
  });

  it("sets createdBy from authenticated user", async () => {
    const admin = mockAdminUser();
    mockRouteUser = admin;

    const req = buildRequest("/api/faqs", {
      method: "POST",
      body: { question: "Test?", answer: { text: "Answer" } },
    });
    await POST(req);

    expect(mockFaqsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: admin.uid }),
    );
  });

  it("returns 400 for invalid body", async () => {
    const req = buildRequest("/api/faqs", {
      method: "POST",
      body: { category: "general" }, // missing question and answer
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(400);
    expect(body.success).toBe(false);
  });

  it("handles repository create errors", async () => {
    mockFaqsCreate.mockRejectedValue(new Error("DB error"));
    const req = buildRequest("/api/faqs", {
      method: "POST",
      body: { question: "Test?", answer: { text: "Answer" } },
    });
    const res = await POST(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(500);
    expect(body.success).toBe(false);
  });
});
