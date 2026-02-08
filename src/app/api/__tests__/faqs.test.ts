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

const mockFaqsFindAll = jest.fn();
const mockFaqsCreate = jest.fn();
const mockGetSingleton = jest.fn();

jest.mock("@/repositories", () => ({
  faqsRepository: {
    findAll: (...args: unknown[]) => mockFaqsFindAll(...args),
    create: (...args: unknown[]) => mockFaqsCreate(...args),
  },
  siteSettingsRepository: {
    getSingleton: (...args: unknown[]) => mockGetSingleton(...args),
  },
}));

const mockRequireRoleFromRequest = jest.fn();
jest.mock("@/lib/security/authorization", () => ({
  requireRoleFromRequest: (...args: unknown[]) =>
    mockRequireRoleFromRequest(...args),
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
  faqCreateSchema: {},
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
    mockFaqsFindAll.mockResolvedValue([...mockFAQs]);
    mockGetSingleton.mockResolvedValue(mockSiteSettings);
  });

  it("returns all FAQs with success", async () => {
    const req = buildRequest("/api/faqs");
    const res = await GET(req);
    const { status, body } = await parseResponse(res);

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(3);
  });

  it("interpolates {{supportEmail}} in answers", async () => {
    const req = buildRequest("/api/faqs");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    const faq1 = body.data.find((f: any) => f.id === "faq-1");
    expect(faq1.answer.text).toContain("support@letitrip.in");
    expect(faq1.answer.text).not.toContain("{{supportEmail}}");
  });

  it("interpolates {{companyName}} in answers", async () => {
    const req = buildRequest("/api/faqs");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    const faq2 = body.data.find((f: any) => f.id === "faq-2");
    expect(faq2.answer.text).toContain("LetItRip");
    expect(faq2.answer.text).not.toContain("{{companyName}}");
  });

  it("interpolates {{supportPhone}} in answers", async () => {
    const req = buildRequest("/api/faqs");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    const faq3 = body.data.find((f: any) => f.id === "faq-3");
    expect(faq3.answer.text).toContain("+91-1234567890");
  });

  it("filters by category", async () => {
    const req = buildRequest("/api/faqs?category=orders_payment");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data).toHaveLength(1);
    expect(body.data[0].category).toBe("orders_payment");
  });

  it("filters by showOnHomepage", async () => {
    const req = buildRequest("/api/faqs?showOnHomepage=true");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data).toHaveLength(2);
    body.data.forEach((faq: any) => {
      expect(faq.showOnHomepage).toBe(true);
    });
  });

  it("filters by search query", async () => {
    const req = buildRequest("/api/faqs?search=return");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("faq-2");
  });

  it("filters by tags", async () => {
    const req = buildRequest("/api/faqs?tags=support");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe("faq-3");
  });

  it("sorts by priority (highest first)", async () => {
    const req = buildRequest("/api/faqs");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    const priorities = body.data.map((f: any) => f.priority);
    for (let i = 0; i < priorities.length - 1; i++) {
      expect(priorities[i]).toBeGreaterThanOrEqual(priorities[i + 1]);
    }
  });

  it("includes meta with total and categories", async () => {
    const req = buildRequest("/api/faqs");
    const res = await GET(req);
    const { body } = await parseResponse(res);

    expect(body.meta.total).toBe(3);
    expect(body.meta.categories).toBeDefined();
    expect(Array.isArray(body.meta.categories)).toBe(true);
  });

  it("sets cache-control headers", async () => {
    const req = buildRequest("/api/faqs");
    const res = await GET(req);

    expect(res.headers.get("cache-control")).toContain("public");
  });

  it("handles repository errors gracefully", async () => {
    mockFaqsFindAll.mockRejectedValue(new Error("DB error"));
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
    mockRequireRoleFromRequest.mockResolvedValue(mockAdminUser());
    mockFaqsFindAll.mockResolvedValue(mockFAQs);
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
    expect(mockRequireRoleFromRequest).toHaveBeenCalledWith(expect.anything(), [
      "admin",
    ]);
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
    mockRequireRoleFromRequest.mockResolvedValue(admin);

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
