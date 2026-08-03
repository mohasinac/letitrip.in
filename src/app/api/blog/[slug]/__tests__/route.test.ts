/**
 * Tests for GET /api/blog/[slug] (public blog detail)
 * Key behaviors:
 *  - draft posts → 404 (not visible to public)
 *  - archived posts → 404
 *  - published posts → 200 with post + related
 *  - missing slug → 404
 *  - incrementViews fires async (fire-and-forget)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockFindBySlug,
  mockIncrementViews,
  mockFindRelated,
} = vi.hoisted(() => ({
  mockFindBySlug: vi.fn(),
  mockIncrementViews: vi.fn(),
  mockFindRelated: vi.fn(),
}));

vi.mock("@/providers.config", () => ({
  withProviders: (fn: unknown) => fn,
}));

vi.mock("@mohasinac/appkit", () => ({
  blogRepository: {
    findBySlug: mockFindBySlug,
    incrementViews: mockIncrementViews,
    findRelated: mockFindRelated,
  },
  createRouteHandler: ({ handler }: { handler: (ctx: { params: unknown }) => Promise<Response> }) => {
    return async (_req: Request, context: { params: Record<string, string> }) =>
      handler({ params: context?.params ?? {} });
  },
  successResponse: (data: unknown) =>
    new Response(JSON.stringify({ ok: true, data }), { status: 200 }),
  errorResponse: (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), { status }),
  BlogPostStatusValues: { PUBLISHED: "published", DRAFT: "draft", ARCHIVED: "archived" },
}));

import { GET } from "../route";

function makeReq(slug: string) {
  return new Request(`http://localhost/api/blog/${slug}`);
}

function makeContext(slug: string) {
  return { params: { slug } };
}

function makePublishedPost(overrides: Record<string, unknown> = {}) {
  return {
    id: "blog-how-to-grade",
    slug: "how-to-grade-pokemon-cards",
    title: "How to Grade Pokémon Cards",
    status: "published",
    category: "guides",
    publishedAt: new Date("2026-07-01"),
    createdAt: new Date("2026-07-01"),
    updatedAt: new Date("2026-07-01"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFindRelated.mockResolvedValue([]);
  mockIncrementViews.mockResolvedValue(undefined);
});

describe("GET /api/blog/[slug]", () => {
  it("published post → 200 with post and related", async () => {
    const post = makePublishedPost();
    mockFindBySlug.mockResolvedValue(post);

    const res = await GET(makeReq(post.slug) as never, makeContext(post.slug) as never);

    expect(res.status).toBe(200);
    const body = await res.json() as { ok: boolean; data: { post: Record<string, unknown> } };
    expect(body.ok).toBe(true);
    expect(body.data.post.slug).toBe("how-to-grade-pokemon-cards");
    expect(body.data.post.status).toBe("published");
  });

  it("draft post → 404 (not visible to unauthenticated callers)", async () => {
    mockFindBySlug.mockResolvedValue(makePublishedPost({ status: "draft" }));

    const res = await GET(makeReq("how-to-grade-pokemon-cards") as never, makeContext("how-to-grade-pokemon-cards") as never);

    expect(res.status).toBe(404);
    const body = await res.json() as { ok: boolean; error: string };
    expect(body.ok).toBe(false);
    expect(body.error).toMatch(/not found/i);
  });

  it("archived post → 404 (same as draft)", async () => {
    mockFindBySlug.mockResolvedValue(makePublishedPost({ status: "archived" }));

    const res = await GET(makeReq("how-to-grade-pokemon-cards") as never, makeContext("how-to-grade-pokemon-cards") as never);

    expect(res.status).toBe(404);
  });

  it("non-existent slug (findBySlug returns null) → 404", async () => {
    mockFindBySlug.mockResolvedValue(null);

    const res = await GET(makeReq("does-not-exist") as never, makeContext("does-not-exist") as never);

    expect(res.status).toBe(404);
  });

  it("findBySlug throws → 404 (error caught by .catch(() => null))", async () => {
    mockFindBySlug.mockRejectedValue(new Error("Firestore unavailable"));

    const res = await GET(makeReq("bad-slug") as never, makeContext("bad-slug") as never);

    expect(res.status).toBe(404);
  });

  it("published post → incrementViews called async (fire-and-forget)", async () => {
    const post = makePublishedPost();
    mockFindBySlug.mockResolvedValue(post);

    await GET(makeReq(post.slug) as never, makeContext(post.slug) as never);

    expect(mockIncrementViews).toHaveBeenCalledWith(post.id);
  });

  it("published post → related posts returned in response", async () => {
    const post = makePublishedPost();
    const relatedPost = makePublishedPost({
      id: "blog-card-grading-tips",
      slug: "card-grading-tips",
      title: "Card Grading Tips",
      publishedAt: new Date("2026-07-10"),
      createdAt: new Date("2026-07-10"),
      updatedAt: new Date("2026-07-10"),
    });
    mockFindBySlug.mockResolvedValue(post);
    mockFindRelated.mockResolvedValue([relatedPost]);

    const res = await GET(makeReq(post.slug) as never, makeContext(post.slug) as never);

    expect(res.status).toBe(200);
    const body = await res.json() as { data: { related: unknown[] } };
    expect(Array.isArray(body.data.related)).toBe(true);
    expect(body.data.related).toHaveLength(1);
  });

  it("findRelated throws → returns empty related array (graceful degradation)", async () => {
    const post = makePublishedPost();
    mockFindBySlug.mockResolvedValue(post);
    mockFindRelated.mockRejectedValue(new Error("Index not found"));

    const res = await GET(makeReq(post.slug) as never, makeContext(post.slug) as never);

    expect(res.status).toBe(200);
    const body = await res.json() as { data: { related: unknown[] } };
    expect(body.data.related).toEqual([]);
  });

  it("publishedAt is serialized to ISO string (not raw Date object)", async () => {
    const post = makePublishedPost({ publishedAt: new Date("2026-07-01T12:00:00Z") });
    mockFindBySlug.mockResolvedValue(post);

    const res = await GET(makeReq(post.slug) as never, makeContext(post.slug) as never);

    const body = await res.json() as { data: { post: { publishedAt: string } } };
    expect(typeof body.data.post.publishedAt).toBe("string");
    expect(body.data.post.publishedAt).toContain("2026-07-01");
  });

  it("no auth required — public endpoint", async () => {
    const post = makePublishedPost();
    mockFindBySlug.mockResolvedValue(post);

    // No Authorization header — should still succeed
    const res = await GET(makeReq(post.slug) as never, makeContext(post.slug) as never);
    expect(res.status).toBe(200);
  });
});
