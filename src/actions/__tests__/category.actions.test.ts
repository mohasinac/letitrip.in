import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireRoleUser,
  mockRateLimitByIdentifier,
  mockCreateCategory,
  mockUpdateCategory,
  mockDeleteCategory,
  mockGetCategoryById,
  mockFetchCategoryTree,
  mockListTopLevelCategories,
} = vi.hoisted(() => ({
  mockRequireRoleUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockCreateCategory: vi.fn(),
  mockUpdateCategory: vi.fn(),
  mockDeleteCategory: vi.fn(),
  mockGetCategoryById: vi.fn(),
  mockFetchCategoryTree: vi.fn(),
  mockListTopLevelCategories: vi.fn(),
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
  createCategory: mockCreateCategory,
  updateCategory: mockUpdateCategory,
  deleteCategory: mockDeleteCategory,
  listCategories: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  listTopLevelCategories: mockListTopLevelCategories,
  listBrandCategories: vi.fn().mockResolvedValue([]),
  getCategoryById: mockGetCategoryById,
  getCategoryBySlug: vi.fn().mockResolvedValue(null),
  getCategoryChildren: vi.fn().mockResolvedValue([]),
  fetchCategoryTree: mockFetchCategoryTree,
}));

vi.mock("@/validation/request-schemas", () => ({
  categoryCreateSchema: {
    safeParse: (x: unknown) => ({ success: true, data: x }),
  },
  categoryUpdateSchema: {
    safeParse: (x: unknown) => ({ success: true, data: x }),
  },
  mediaUrlSchema: {},
}));

import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  buildCategoryTreeAction,
  listTopLevelCategoriesAction,
} from "../category.actions";

function makeAdmin(overrides: Record<string, unknown> = {}) {
  return { uid: "user-admin-1", email: "admin@letitrip.in", role: "admin", ...overrides };
}

function makeCategory(overrides: Record<string, unknown> = {}) {
  return {
    id: "category-action-figures",
    name: "Action Figures",
    slug: "action-figures",
    tier: 1,
    isActive: true,
    ...overrides,
  };
}

describe("createCategoryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateCategory.mockResolvedValue(makeCategory());
  });

  it("role 'seller' (not admin) → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await createCategoryAction({ name: "Action Figures" });
    expect(result.ok).toBe(false);
  });

  it("role 'moderator' → { ok: false } (admin only)", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await createCategoryAction({ name: "Action Figures" });
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await createCategoryAction({ name: "Action Figures" });
    expect(result.ok).toBe(false);
  });

  it("parentId provided → createCategory called with parentIds: [parentId]", async () => {
    await createCategoryAction({ name: "Gundam", parentId: "category-model-kits" });
    const arg = mockCreateCategory.mock.calls[0][0];
    expect(arg.parentIds).toEqual(["category-model-kits"]);
  });

  it("no parentId → createCategory called with parentIds: []", async () => {
    await createCategoryAction({ name: "Action Figures" });
    const arg = mockCreateCategory.mock.calls[0][0];
    expect(arg.parentIds).toEqual([]);
  });

  it("returns { ok: true, data: CategoryDocument }", async () => {
    const result = await createCategoryAction({ name: "Action Figures" });
    expect(result.ok).toBe(true);
  });
});

describe("updateCategoryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockGetCategoryById.mockResolvedValue(makeCategory());
    mockUpdateCategory.mockResolvedValue(makeCategory({ name: "Updated Figures" }));
  });

  it("role 'seller' → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await updateCategoryAction("category-action-figures", { name: "Updated" } as any);
    expect(result.ok).toBe(false);
  });

  it("empty id → { ok: false }", async () => {
    const result = await updateCategoryAction("", { name: "Updated" } as any);
    expect(result.ok).toBe(false);
  });

  it("category not found → { ok: false, error: /not found/i }", async () => {
    mockGetCategoryById.mockResolvedValue(null);
    const result = await updateCategoryAction("category-missing", { name: "Updated" } as any);
    expect(result.ok).toBe(false);
    expect((result as { error: string }).error).toMatch(/not found/i);
  });

  it("valid → updateCategory called with (id, parsedData)", async () => {
    await updateCategoryAction("category-action-figures", { name: "Updated Figures" } as any);
    expect(mockUpdateCategory).toHaveBeenCalledWith(
      "category-action-figures",
      expect.objectContaining({ name: "Updated Figures" }),
    );
  });
});

describe("deleteCategoryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockGetCategoryById.mockResolvedValue(makeCategory());
    mockDeleteCategory.mockResolvedValue(undefined);
  });

  it("role 'seller' → throws", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    await expect(deleteCategoryAction("category-action-figures")).rejects.toThrow();
  });

  it("category not found → throws NotFoundError", async () => {
    mockGetCategoryById.mockResolvedValue(null);
    await expect(deleteCategoryAction("category-missing")).rejects.toThrow(/not found/i);
  });

  it("valid → deleteCategory called with id", async () => {
    await deleteCategoryAction("category-action-figures");
    expect(mockDeleteCategory).toHaveBeenCalledWith("category-action-figures");
  });
});

describe("buildCategoryTreeAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchCategoryTree.mockResolvedValue([]);
  });

  it("no rootId → fetchCategoryTree called with undefined", async () => {
    await buildCategoryTreeAction();
    expect(mockFetchCategoryTree).toHaveBeenCalledWith(undefined);
  });

  it("rootId = 'category-action-figures' → fetchCategoryTree called with that value", async () => {
    await buildCategoryTreeAction("category-action-figures");
    expect(mockFetchCategoryTree).toHaveBeenCalledWith("category-action-figures");
  });

  it("returns { ok: true, data: CategoryTreeNode[] }", async () => {
    const result = await buildCategoryTreeAction();
    expect(result.ok).toBe(true);
  });
});

describe("listTopLevelCategoriesAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListTopLevelCategories.mockResolvedValue([makeCategory()]);
  });

  it("no auth required; calls listTopLevelCategories(limit)", async () => {
    await listTopLevelCategoriesAction(6);
    expect(mockListTopLevelCategories).toHaveBeenCalledWith(6);
  });

  it("limit defaults to 12", async () => {
    await listTopLevelCategoriesAction();
    expect(mockListTopLevelCategories).toHaveBeenCalledWith(12);
  });
});
