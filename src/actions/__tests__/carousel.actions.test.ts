import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockRequireRoleUser,
  mockRateLimitByIdentifier,
  mockCreateCarouselSlide,
  mockUpdateCarouselSlide,
  mockDeleteCarouselSlide,
  mockReorderCarouselSlides,
  mockListActiveCarouselSlides,
  mockListAllCarouselSlides,
  mockGetCarouselSlideById,
} = vi.hoisted(() => ({
  mockRequireRoleUser: vi.fn(),
  mockRateLimitByIdentifier: vi.fn(),
  mockCreateCarouselSlide: vi.fn(),
  mockUpdateCarouselSlide: vi.fn(),
  mockDeleteCarouselSlide: vi.fn(),
  mockReorderCarouselSlides: vi.fn(),
  mockListActiveCarouselSlides: vi.fn(),
  mockListAllCarouselSlides: vi.fn(),
  mockGetCarouselSlideById: vi.fn(),
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
  AuthorizationError: class AuthorizationError extends Error { constructor(msg: string) { super(msg); this.name = "AuthorizationError"; } },
  ValidationError: class ValidationError extends Error { constructor(msg: string) { super(msg); this.name = "ValidationError"; } },
  createCarouselSlide: mockCreateCarouselSlide,
  updateCarouselSlide: mockUpdateCarouselSlide,
  deleteCarouselSlide: mockDeleteCarouselSlide,
  reorderCarouselSlides: mockReorderCarouselSlides,
  listActiveCarouselSlides: mockListActiveCarouselSlides,
  listAllCarouselSlides: mockListAllCarouselSlides,
  getCarouselSlideById: mockGetCarouselSlideById,
}));

import {
  createCarouselSlideAction,
  updateCarouselSlideAction,
  deleteCarouselSlideAction,
  reorderCarouselSlidesAction,
  listActiveCarouselSlidesAction,
  listAllCarouselSlidesAction,
  getCarouselSlideByIdAction,
} from "../carousel.actions";

function makeAdmin(overrides: Record<string, unknown> = {}) {
  return { uid: "user-admin-1", email: "admin@test.com", role: "admin", ...overrides };
}

function makeSlide(overrides: Record<string, unknown> = {}) {
  return {
    id: "slide-hero-homepage",
    title: "Hero Slide",
    order: 0,
    active: true,
    media: { type: "image" as const, url: "/media/slide-hero.jpg", alt: "Hero" },
    ...overrides,
  };
}

function makeValidSlideInput() {
  return {
    title: "New Slide",
    order: 1,
    active: true,
    media: { type: "image" as const, url: "/media/slide-new.jpg", alt: "New" },
  };
}

describe("createCarouselSlideAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockCreateCarouselSlide.mockResolvedValue(makeSlide());
  });

  it("non-admin → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await createCarouselSlideAction(makeValidSlideInput() as any);
    expect(result.ok).toBe(false);
  });

  it("rate limit exceeded → { ok: false }", async () => {
    mockRateLimitByIdentifier.mockResolvedValue({ success: false });
    const result = await createCarouselSlideAction(makeValidSlideInput() as any);
    expect(result.ok).toBe(false);
  });

  it("title missing → { ok: false }", async () => {
    const result = await createCarouselSlideAction({
      ...makeValidSlideInput(),
      title: "",
    } as any);
    expect(result.ok).toBe(false);
  });

  it("media.url missing → { ok: false }", async () => {
    const result = await createCarouselSlideAction({
      ...makeValidSlideInput(),
      media: { type: "image" as const, url: "", alt: "" },
    } as any);
    expect(result.ok).toBe(false);
  });

  it("requireRoleUser called with [\"admin\"]", async () => {
    await createCarouselSlideAction(makeValidSlideInput() as any);
    expect(mockRequireRoleUser).toHaveBeenCalledWith(["admin"]);
  });

  it("valid → createCarouselSlide called with (admin.uid, parsedData)", async () => {
    await createCarouselSlideAction(makeValidSlideInput() as any);
    expect(mockCreateCarouselSlide).toHaveBeenCalledWith(
      "user-admin-1",
      expect.objectContaining({ title: "New Slide" }),
    );
  });

  it("returns { ok: true, data: CarouselSlideDocument }", async () => {
    const result = await createCarouselSlideAction(makeValidSlideInput() as any);
    expect(result.ok).toBe(true);
  });
});

describe("updateCarouselSlideAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockUpdateCarouselSlide.mockResolvedValue(makeSlide());
  });

  it("non-admin → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await updateCarouselSlideAction("slide-1", { title: "Updated" });
    expect(result.ok).toBe(false);
  });

  it("empty id → { ok: false }", async () => {
    const result = await updateCarouselSlideAction("", { title: "Updated" });
    expect(result.ok).toBe(false);
  });

  it("valid partial update → updateCarouselSlide called with (admin.uid, id, parsedData)", async () => {
    await updateCarouselSlideAction("slide-1", { title: "Updated" });
    expect(mockUpdateCarouselSlide).toHaveBeenCalledWith(
      "user-admin-1",
      "slide-1",
      expect.objectContaining({ title: "Updated" }),
    );
  });
});

describe("deleteCarouselSlideAction — no wrapAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockDeleteCarouselSlide.mockResolvedValue(undefined);
  });

  it("non-admin → throws (requireRoleUser throws)", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    await expect(deleteCarouselSlideAction("slide-1")).rejects.toThrow();
  });

  it("empty id → throws ValidationError", async () => {
    await expect(deleteCarouselSlideAction("")).rejects.toThrow(/Invalid id/i);
  });

  it("whitespace id → throws ValidationError", async () => {
    await expect(deleteCarouselSlideAction("   ")).rejects.toThrow(/Invalid id/i);
  });

  it("valid → deleteCarouselSlide called with (admin.uid, id)", async () => {
    await deleteCarouselSlideAction("slide-1");
    expect(mockDeleteCarouselSlide).toHaveBeenCalledWith("user-admin-1", "slide-1");
  });
});

describe("reorderCarouselSlidesAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireRoleUser.mockResolvedValue(makeAdmin());
    mockRateLimitByIdentifier.mockResolvedValue({ success: true });
    mockReorderCarouselSlides.mockResolvedValue([makeSlide()]);
  });

  it("non-admin → { ok: false }", async () => {
    mockRequireRoleUser.mockRejectedValue(new Error("Forbidden"));
    const result = await reorderCarouselSlidesAction(["slide-1", "slide-2"]);
    expect(result.ok).toBe(false);
  });

  it("empty slideIds array → { ok: false }", async () => {
    const result = await reorderCarouselSlidesAction([]);
    expect(result.ok).toBe(false);
  });

  it("valid → reorderCarouselSlides called with (admin.uid, slideIds)", async () => {
    await reorderCarouselSlidesAction(["slide-2", "slide-1"]);
    expect(mockReorderCarouselSlides).toHaveBeenCalledWith(
      "user-admin-1",
      ["slide-2", "slide-1"],
    );
  });
});

describe("listActiveCarouselSlidesAction — no auth guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListActiveCarouselSlides.mockResolvedValue([makeSlide()]);
  });

  it("no requireRoleUser call; calls listActiveCarouselSlides()", async () => {
    await listActiveCarouselSlidesAction();
    expect(mockRequireRoleUser).not.toHaveBeenCalled();
    expect(mockListActiveCarouselSlides).toHaveBeenCalled();
  });

  it("returns { ok: true, data: CarouselSlideDocument[] }", async () => {
    const result = await listActiveCarouselSlidesAction();
    expect(result.ok).toBe(true);
  });
});

describe("listAllCarouselSlidesAction — no auth guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListAllCarouselSlides.mockResolvedValue([makeSlide()]);
  });

  it("calls listAllCarouselSlides() without auth check", async () => {
    await listAllCarouselSlidesAction();
    expect(mockRequireRoleUser).not.toHaveBeenCalled();
    expect(mockListAllCarouselSlides).toHaveBeenCalled();
  });
});

describe("getCarouselSlideByIdAction — no auth guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCarouselSlideById.mockResolvedValue(makeSlide());
  });

  it("calls getCarouselSlideById(id) without auth check", async () => {
    await getCarouselSlideByIdAction("slide-1");
    expect(mockRequireRoleUser).not.toHaveBeenCalled();
    expect(mockGetCarouselSlideById).toHaveBeenCalledWith("slide-1");
  });
});
