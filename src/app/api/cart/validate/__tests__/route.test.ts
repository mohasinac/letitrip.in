/**
 * Tests for POST /api/cart/validate
 * Validates a list of productIds: categorises them as stale (removed from catalog)
 * or moveable (temporarily unavailable but exists).
 * No auth required.
 *
 * Stale: product not found, null, ARCHIVED, DRAFT, IN_REVIEW
 * Moveable: isSold=true OR availableQuantity <= 0 (but product still exists and is published)
 * Published and in-stock: returned in neither list
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockProductFindById } = vi.hoisted(() => ({
  mockProductFindById: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ withProviders: (fn: unknown) => fn }));

vi.mock("@mohasinac/appkit", () => ({
  productRepository: { findById: mockProductFindById },
  ProductStatusValues: {
    ARCHIVED: "archived",
    DRAFT: "draft",
    IN_REVIEW: "in_review",
    PUBLISHED: "published",
  },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  createRouteHandler: (opts: {
    auth?: boolean;
    schema?: { safeParse: (d: unknown) => { success: boolean; data?: unknown; error?: { issues: { message: string }[] } } };
    handler: (ctx: { body?: unknown }) => Promise<Response>;
  }) => {
    return async (request: Request) => {
      let body: unknown;
      try { body = await request.clone().json(); } catch { body = undefined; }
      if (opts.schema && body !== undefined) {
        const result = opts.schema.safeParse(body);
        if (!result.success)
          return new Response(JSON.stringify({ ok: false, error: result.error?.issues[0]?.message }), { status: 400 });
        body = result.data;
      }
      return opts.handler({ body });
    };
  },
}));

import { POST } from "../route";

const makeReq = (body: unknown) =>
  new Request("http://localhost/api/cart/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const publishedProduct = {
  id: "product-good",
  status: "published",
  isSold: false,
  availableQuantity: 5,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockProductFindById.mockResolvedValue(publishedProduct);
});

describe("POST /api/cart/validate", () => {
  it("missing productIds → 400", async () => {
    const res = await POST(makeReq({}) as never);
    expect(res.status).toBe(400);
  });

  it("empty productIds array → 400", async () => {
    const res = await POST(makeReq({ productIds: [] }) as never);
    expect(res.status).toBe(400);
  });

  it("productIds array > 50 → 400 (Zod max)", async () => {
    const res = await POST(makeReq({ productIds: Array(51).fill("p") }) as never);
    expect(res.status).toBe(400);
  });

  it("no auth required → 200 for anonymous request", async () => {
    const res = await POST(makeReq({ productIds: ["product-good"] }) as never);
    expect(res.status).toBe(200);
  });

  it("all products published + in stock → stale=[], moveable=[]", async () => {
    const res = await POST(makeReq({ productIds: ["product-good"] }) as never);
    const json = await res.clone().json() as { data: { stale: string[]; moveable: string[] } };
    expect(json.data.stale).toHaveLength(0);
    expect(json.data.moveable).toHaveLength(0);
  });

  it("product not found (null) → added to stale", async () => {
    mockProductFindById.mockResolvedValue(null);
    const res = await POST(makeReq({ productIds: ["product-missing"] }) as never);
    const json = await res.clone().json() as { data: { stale: string[] } };
    expect(json.data.stale).toContain("product-missing");
  });

  it("product findById throws → added to stale", async () => {
    mockProductFindById.mockRejectedValue(new Error("DB error"));
    const res = await POST(makeReq({ productIds: ["product-error"] }) as never);
    const json = await res.clone().json() as { data: { stale: string[] } };
    expect(json.data.stale).toContain("product-error");
  });

  it("status=archived → added to stale", async () => {
    mockProductFindById.mockResolvedValue({ ...publishedProduct, status: "archived" });
    const res = await POST(makeReq({ productIds: ["product-archived"] }) as never);
    const json = await res.clone().json() as { data: { stale: string[] } };
    expect(json.data.stale).toContain("product-archived");
  });

  it("status=draft → added to stale", async () => {
    mockProductFindById.mockResolvedValue({ ...publishedProduct, status: "draft" });
    const res = await POST(makeReq({ productIds: ["product-draft"] }) as never);
    const json = await res.clone().json() as { data: { stale: string[] } };
    expect(json.data.stale).toContain("product-draft");
  });

  it("status=in_review → added to stale", async () => {
    mockProductFindById.mockResolvedValue({ ...publishedProduct, status: "in_review" });
    const res = await POST(makeReq({ productIds: ["product-in-review"] }) as never);
    const json = await res.clone().json() as { data: { stale: string[] } };
    expect(json.data.stale).toContain("product-in-review");
  });

  it("isSold=true → added to moveable (not stale)", async () => {
    mockProductFindById.mockResolvedValue({ ...publishedProduct, isSold: true });
    const res = await POST(makeReq({ productIds: ["product-sold"] }) as never);
    const json = await res.clone().json() as { data: { stale: string[]; moveable: string[] } };
    expect(json.data.moveable).toContain("product-sold");
    expect(json.data.stale).not.toContain("product-sold");
  });

  it("availableQuantity=0 → added to moveable", async () => {
    mockProductFindById.mockResolvedValue({ ...publishedProduct, availableQuantity: 0 });
    const res = await POST(makeReq({ productIds: ["product-oos"] }) as never);
    const json = await res.clone().json() as { data: { moveable: string[] } };
    expect(json.data.moveable).toContain("product-oos");
  });

  it("mixed: stale, moveable, and healthy products classified correctly", async () => {
    mockProductFindById
      .mockResolvedValueOnce(null)                                           // stale (not found)
      .mockResolvedValueOnce({ ...publishedProduct, isSold: true })         // moveable
      .mockResolvedValueOnce({ ...publishedProduct });                       // healthy

    const res = await POST(makeReq({
      productIds: ["product-missing", "product-sold", "product-good"],
    }) as never);
    const json = await res.clone().json() as { data: { stale: string[]; moveable: string[] } };
    expect(json.data.stale).toEqual(["product-missing"]);
    expect(json.data.moveable).toEqual(["product-sold"]);
    // product-good in neither list
    expect(json.data.stale).not.toContain("product-good");
    expect(json.data.moveable).not.toContain("product-good");
  });

  it("status=suspended → NOT stale nor moveable (published-but-hidden, still ordered)", async () => {
    mockProductFindById.mockResolvedValue({ ...publishedProduct, status: "suspended" });
    const res = await POST(makeReq({ productIds: ["product-suspended"] }) as never);
    const json = await res.clone().json() as { data: { stale: string[]; moveable: string[] } };
    // suspended is not in stale list (only ARCHIVED/DRAFT/IN_REVIEW are stale)
    expect(json.data.stale).not.toContain("product-suspended");
    expect(json.data.moveable).not.toContain("product-suspended");
  });
});
