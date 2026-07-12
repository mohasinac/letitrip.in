import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireAuthUser,
  mockRequireRoleUser,
  mockRateLimitByIdentifier,
  mockVoteFaq,
  mockCreateFaq,
  mockUpdateFaq,
  mockDeleteFaq,
  mockListFaqs,
  mockListPublicFaqs,
  mockGetFaqById,
} = vi.hoisted(() => ({
  mockRequireAuthUser: vi.fn(),
  mockRequireRoleUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockVoteFaq: vi.fn(),
  mockCreateFaq: vi.fn(),
  mockUpdateFaq: vi.fn(),
  mockDeleteFaq: vi.fn(),
  mockListFaqs: vi.fn(),
  mockListPublicFaqs: vi.fn(),
  mockGetFaqById: vi.fn(),
}));

vi.mock("@mohasinac/appkit/server", () => ({
  wrapAction: async (fn: () => Promise<unknown>) => {
    try {
      return { ok: true, data: await fn() };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
}));

vi.mock("@mohasinac/appkit", () => ({
  requireAuthUser: mockRequireAuthUser,
  requireRoleUser: mockRequireRoleUser,
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); this.name = "AuthorizationError"; } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); this.name = "ValidationError"; } },
  NotFoundError: class NotFoundError extends Error { constructor(msg: string) { super(msg); this.name = "NotFoundError"; } },
  voteFaq: mockVoteFaq,
  createFaq: mockCreateFaq,
  updateFaq: mockUpdateFaq,
  deleteFaq: mockDeleteFaq,
  listFaqs: mockListFaqs,
  listPublicFaqs: mockListPublicFaqs,
  getFaqById: mockGetFaqById,
  faqCreateSchema: {
    safeParse: (data: unknown) => {
      const d = data as Record<string, unknown>;
      if (!d?.question || !d?.answer || !d?.category) {
        return { success: false, error: { issues: [{ message: "Required" }] } };
      }
      return { success: true, data };
    },
  },
  faqUpdateSchema: {
    safeParse: (data: unknown) => ({ success: true, data }),
  },
  ERROR_MESSAGES: { FAQ: { NOT_FOUND: "FAQ not found" } },
}));

import {
  voteFaqAction,
  adminCreateFaqAction,
  adminUpdateFaqAction,
  adminDeleteFaqAction,
  listFaqsAction,
  listPublicFaqsAction,
  getFaqByIdAction,
} from "../faq.actions";

function makeUser(overrides: Record<string, unknown> = {}) {
  return { uid: "user-buyer-1", email: "buyer@test.com", ...overrides };
}

function makeAdmin(overrides: Record<string, unknown> = {}) {
  return { uid: "user-admin-1", email: "admin@test.com", role: "admin", ...overrides };
}

function makeFaq(overrides: Record<string, unknown> = {}) {
  return {
    id: "faq-how-to-bid",
    question: "How do I bid?",
    answer: { text: "Click the bid button.", format: "html" },
    category: "Auctions",
    isActive: true,
    ...overrides,
  };
}

describe("voteFaqAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuthUser.mockResolvedValue(makeUser());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockGetFaqById.mockResolvedValue(makeFaq());
    mockVoteFaq.mockResolvedValue({ helpful: 5, notHelpful: 1 });
  });

  it("unauthenticated → { ok: false }", async () => {
    mockRequireAuthUser.mockRejectedValue(new Error("Unauthorized"));
    const result = await voteFaqAction({ faqId: "faq-1", helpful: true });
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await voteFaqAction({ faqId: "faq-1", helpful: true });
    expect(result.ok).toBe(false);
  });

  it("faqId not found → { ok: false, error contains 'not found' }", async () => {
    mockGetFaqById.mockResolvedValue(null);
    const result = await voteFaqAction({ faqId: "faq-missing", helpful: true });
    expect(result.ok).toBe(false);
    expect((result as { error: string }).error).toMatch(/not found/i);
  });

  it("valid → getFaqById(faqId) called first (existence check)", async () => {
    await voteFaqAction({ faqId: "faq-1", helpful: true });
    expect(mockGetFaqById).toHaveBeenCalledWith("faq-1");
  });

  it("valid → voteFaq called with the full input object", async () => {
    const input = { faqId: "faq-1", helpful: true };
    await voteFaqAction(input);
    expect(mockVoteFaq).toHaveBeenCalledWith(input);
  });

  it("valid → { ok: true }", async () => {
    const result = await voteFaqAction({ faqId: "faq-1", helpful: false });
    expect(result.ok).toBe(true);
  });
});

describe("adminCreateFaqAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateFaq.mockResolvedValue(makeFaq());
  });

  it("role 'user' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await adminCreateFaqAction({
      question: "Q?",
      answer: { text: "A.", format: "html" },
      category: "General",
    });
    expect(result.ok).toBe(false);
  });

  it("requireRoleUser called with ['admin','moderator']", async () => {
    await adminCreateFaqAction({ question: "Q?", answer: { text: "A.", format: "html" }, category: "General" });
    expect(mockRequireRoleUser).toHaveBeenCalledWith(["admin", "moderator"]);
  });

  it("schema parse fail (missing question) → { ok: false }", async () => {
    const result = await adminCreateFaqAction({} as any);
    expect(result.ok).toBe(false);
  });

  it("valid → createFaq called with (parsedData, admin.uid) — uid is 2nd arg", async () => {
    const input = { question: "Q?", answer: { text: "A.", format: "html" as const }, category: "General" };
    await adminCreateFaqAction(input);
    expect(mockCreateFaq).toHaveBeenCalledWith(
      expect.objectContaining({ question: "Q?" }),
      "user-admin-1",
    );
  });

  it("returns { ok: true, data: FAQDocument }", async () => {
    const result = await adminCreateFaqAction({
      question: "Q?",
      answer: { text: "A.", format: "html" },
      category: "General",
    });
    expect(result.ok).toBe(true);
  });
});

describe("adminUpdateFaqAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockGetFaqById.mockResolvedValue(makeFaq());
    mockUpdateFaq.mockResolvedValue(makeFaq());
  });

  it("non-admin/mod → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await adminUpdateFaqAction("faq-1", { question: "New Q?" });
    expect(result.ok).toBe(false);
  });

  it("empty id → { ok: false } (manual trim check)", async () => {
    const result = await adminUpdateFaqAction("", { question: "New Q?" });
    expect(result.ok).toBe(false);
  });

  it("whitespace id → { ok: false }", async () => {
    const result = await adminUpdateFaqAction("   ", { question: "New Q?" });
    expect(result.ok).toBe(false);
  });

  it("id not found → { ok: false, error contains 'not found' }", async () => {
    mockGetFaqById.mockResolvedValue(null);
    const result = await adminUpdateFaqAction("faq-missing", { question: "New Q?" });
    expect(result.ok).toBe(false);
    expect((result as { error: string }).error).toMatch(/not found/i);
  });

  it("valid → updateFaq called with (id, parsedData)", async () => {
    await adminUpdateFaqAction("faq-1", { question: "New Q?" });
    expect(mockUpdateFaq).toHaveBeenCalledWith("faq-1", expect.objectContaining({ question: "New Q?" }));
  });
});

describe("adminDeleteFaqAction — no wrapAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockGetFaqById.mockResolvedValue(makeFaq());
    mockDeleteFaq.mockResolvedValue(undefined);
  });

  it("non-admin/mod → throws", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    await expect(adminDeleteFaqAction("faq-1")).rejects.toThrow();
  });

  it("rate limit exceeded → throws", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    await expect(adminDeleteFaqAction("faq-1")).rejects.toThrow();
  });

  it("empty id → throws (manual trim check)", async () => {
    await expect(adminDeleteFaqAction("")).rejects.toThrow();
  });

  it("id not found → throws NotFoundError", async () => {
    mockGetFaqById.mockResolvedValue(null);
    await expect(adminDeleteFaqAction("faq-missing")).rejects.toThrow(/not found/i);
  });

  it("valid → deleteFaq called with id", async () => {
    await adminDeleteFaqAction("faq-1");
    expect(mockDeleteFaq).toHaveBeenCalledWith("faq-1");
  });
});

describe("listFaqsAction / listPublicFaqsAction / getFaqByIdAction — no auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListFaqs.mockResolvedValue({ items: [], total: 0 });
    mockListPublicFaqs.mockResolvedValue([makeFaq()]);
    mockGetFaqById.mockResolvedValue(makeFaq());
  });

  it("listFaqsAction — no auth required; calls listFaqs(params)", async () => {
    await listFaqsAction({ page: 1, pageSize: 10 });
    expect(mockRequireAuthUser).not.toHaveBeenCalled();
    expect(mockListFaqs).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
  });

  it("listPublicFaqsAction — no auth; calls listPublicFaqs with category + limit", async () => {
    await listPublicFaqsAction("Shipping", 5);
    expect(mockRequireAuthUser).not.toHaveBeenCalled();
    expect(mockListPublicFaqs).toHaveBeenCalledWith("Shipping", 5);
  });

  it("listPublicFaqsAction — default limit = 20", async () => {
    await listPublicFaqsAction("General");
    expect(mockListPublicFaqs).toHaveBeenCalledWith("General", 20);
  });

  it("getFaqByIdAction — no auth; calls getFaqById(id)", async () => {
    await getFaqByIdAction("faq-1");
    expect(mockRequireAuthUser).not.toHaveBeenCalled();
    expect(mockGetFaqById).toHaveBeenCalledWith("faq-1");
  });
});
