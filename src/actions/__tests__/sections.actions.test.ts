import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireRoleUser,
  mockRateLimitByIdentifier,
  mockCreateHomepageSection,
  mockUpdateHomepageSection,
  mockDeleteHomepageSection,
  mockReorderHomepageSections,
  mockListEnabledHomepageSections,
  mockGetHomepageSectionById,
} = vi.hoisted(() => ({
  mockRequireRoleUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockCreateHomepageSection: vi.fn(),
  mockUpdateHomepageSection: vi.fn(),
  mockDeleteHomepageSection: vi.fn(),
  mockReorderHomepageSections: vi.fn(),
  mockListEnabledHomepageSections: vi.fn(),
  mockGetHomepageSectionById: vi.fn(),
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
  requireRoleUser: mockRequireRoleUser,
  rateLimitByIdentifier: mockRateLimitByIdentifier,
  RateLimitPresets: { API: "api", STRICT: "strict" },
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); } },
  NotFoundError: class NotFoundError extends Error { constructor(msg: string) { super(msg); } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); } },
  createHomepageSection: mockCreateHomepageSection,
  updateHomepageSection: mockUpdateHomepageSection,
  deleteHomepageSection: mockDeleteHomepageSection,
  reorderHomepageSections: mockReorderHomepageSections,
  listHomepageSections: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  listEnabledHomepageSections: mockListEnabledHomepageSections,
  getHomepageSectionById: mockGetHomepageSectionById,
  createSectionSchema: { safeParse: (x: unknown) => ({ success: true, data: x }) },
  updateSectionSchema: { safeParse: (x: unknown) => ({ success: true, data: x }) },
}));

import {
  createHomepageSectionAction,
  updateHomepageSectionAction,
  deleteHomepageSectionAction,
  reorderHomepageSectionsAction,
  listEnabledHomepageSectionsAction,
} from "../sections.actions";

function makeAdmin(overrides: Record<string, unknown> = {}) {
  return { uid: "user-admin-1", email: "admin@letitrip.in", role: "admin", ...overrides };
}

function makeSection(overrides: Record<string, unknown> = {}) {
  return {
    id: "section-featured-products",
    type: "featured-products",
    order: 1,
    enabled: true,
    ...overrides,
  };
}

describe("createHomepageSectionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateHomepageSection.mockResolvedValue(makeSection());
  });

  it("role 'seller' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await createHomepageSectionAction({ type: "featured-products", order: 1 } as any);
    expect(result.ok).toBe(false);
  });

  it("role 'moderator' → { ok: false } (admin only)", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await createHomepageSectionAction({ type: "featured-products", order: 1 } as any);
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await createHomepageSectionAction({ type: "featured-products", order: 1 } as any);
    expect(result.ok).toBe(false);
  });

  it("valid → createHomepageSection called with (parsedData, uid)", async () => {
    await createHomepageSectionAction({ type: "featured-products", order: 1 } as any);
    expect(mockCreateHomepageSection).toHaveBeenCalledWith(
      expect.objectContaining({ type: "featured-products" }),
      "user-admin-1",
    );
  });

  it("returns { ok: true, data: HomepageSectionDocument }", async () => {
    const result = await createHomepageSectionAction({ type: "featured-products", order: 1 } as any);
    expect(result.ok).toBe(true);
  });
});

describe("updateHomepageSectionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockGetHomepageSectionById.mockResolvedValue(makeSection());
    mockUpdateHomepageSection.mockResolvedValue(makeSection({ enabled: false }));
  });

  it("role 'seller' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await updateHomepageSectionAction("section-featured-products", { enabled: false } as any);
    expect(result.ok).toBe(false);
  });

  it("empty id → { ok: false }", async () => {
    const result = await updateHomepageSectionAction("", { enabled: false } as any);
    expect(result.ok).toBe(false);
  });

  it("section not found (getHomepageSectionById returns null) → { ok: false, error: /not found/i }", async () => {
    mockGetHomepageSectionById.mockResolvedValue(null);
    const result = await updateHomepageSectionAction("section-missing", { enabled: false } as any);
    expect(result.ok).toBe(false);
    expect((result as { error: string }).error).toMatch(/not found/i);
  });

  it("valid → updateHomepageSection called with (id, parsedData)", async () => {
    await updateHomepageSectionAction("section-featured-products", { enabled: false } as any);
    expect(mockUpdateHomepageSection).toHaveBeenCalledWith("section-featured-products", expect.anything());
  });
});

describe("deleteHomepageSectionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockGetHomepageSectionById.mockResolvedValue(makeSection());
    mockDeleteHomepageSection.mockResolvedValue(undefined);
  });

  it("role 'seller' → throws", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    await expect(deleteHomepageSectionAction("section-featured-products")).rejects.toThrow();
  });

  it("section not found → throws NotFoundError", async () => {
    mockGetHomepageSectionById.mockResolvedValue(null);
    await expect(deleteHomepageSectionAction("section-missing")).rejects.toThrow(/not found/i);
  });

  it("valid → deleteHomepageSection called with id", async () => {
    await deleteHomepageSectionAction("section-featured-products");
    expect(mockDeleteHomepageSection).toHaveBeenCalledWith("section-featured-products");
  });
});

describe("reorderHomepageSectionsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockReorderHomepageSections.mockResolvedValue([makeSection()]);
  });

  it("role 'seller' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await reorderHomepageSectionsAction(["section-1"]);
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await reorderHomepageSectionsAction(["section-1"]);
    expect(result.ok).toBe(false);
  });

  it("empty sectionIds array → { ok: false }", async () => {
    const result = await reorderHomepageSectionsAction([]);
    expect(result.ok).toBe(false);
  });

  it("sectionIds containing empty string → { ok: false }", async () => {
    const result = await reorderHomepageSectionsAction(["section-1", ""]);
    expect(result.ok).toBe(false);
  });

  it("valid → reorderHomepageSections called with sectionIds", async () => {
    await reorderHomepageSectionsAction(["section-1", "section-2"]);
    expect(mockReorderHomepageSections).toHaveBeenCalledWith(["section-1", "section-2"]);
  });

  it("returns { ok: true, data: HomepageSectionDocument[] }", async () => {
    const result = await reorderHomepageSectionsAction(["section-1"]);
    expect(result.ok).toBe(true);
  });
});

describe("listEnabledHomepageSectionsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListEnabledHomepageSections.mockResolvedValue([makeSection()]);
  });

  it("no auth required; calls listEnabledHomepageSections()", async () => {
    await listEnabledHomepageSectionsAction();
    expect(mockListEnabledHomepageSections).toHaveBeenCalled();
  });
});
