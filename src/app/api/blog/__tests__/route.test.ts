/**
 * Tests for GET /api/blog (public listing)
 * Thin wrapper around appkit's blogGET.
 * Key behaviors: search 500 → retry without ?q; missing Firestore index error → retry without ?q.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockBlogGET } = vi.hoisted(() => ({
  mockBlogGET: vi.fn(),
}));

vi.mock("@/providers.config", () => ({ initProviders: vi.fn() }));
vi.mock("@mohasinac/appkit", () => ({
  blogGET: mockBlogGET,
  normalizeError: vi.fn(),
  serverLogger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

import { GET } from "../route";

const makeReq = (params?: Record<string, string>) => {
  const url = new URL("http://localhost/api/blog");
  if (params) for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Request(url.toString());
};

const make200 = (body = {}) =>
  new Response(JSON.stringify({ success: true, ...body }), { status: 200 });
const make500 = () =>
  new Response(JSON.stringify({ success: false }), { status: 500 });

beforeEach(() => {
  vi.clearAllMocks();
  mockBlogGET.mockResolvedValue(make200());
});

describe("GET /api/blog", () => {
  it("delegates to blogGET and returns response", async () => {
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
    expect(mockBlogGET).toHaveBeenCalledTimes(1);
  });

  it("no auth required — public endpoint", async () => {
    const res = await GET(makeReq() as never);
    expect(res.status).toBe(200);
  });

  it("search query (?q) + 500 response → retries without ?q", async () => {
    mockBlogGET
      .mockResolvedValueOnce(make500()) // first call with ?q
      .mockResolvedValueOnce(make200()); // retry without ?q
    const res = await GET(makeReq({ q: "pikachu" }) as never);
    expect(mockBlogGET).toHaveBeenCalledTimes(2);
    // Second call should not have q param
    const secondCallRequest = mockBlogGET.mock.calls[1][0] as Request;
    expect(new URL(secondCallRequest.url).searchParams.has("q")).toBe(false);
    expect(res.status).toBe(200);
  });

  it("no search query + 500 → NOT retried (only search falls back)", async () => {
    mockBlogGET.mockResolvedValue(make500());
    const res = await GET(makeReq() as never);
    // Without ?q the 500 is returned as-is (no retry)
    expect(mockBlogGET).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(500);
  });

  it("search query + FAILED_PRECONDITION missing index error → retries without ?q", async () => {
    const indexError = new Error(
      "FAILED_PRECONDITION: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/letitrip/firestore/indexes?create_composite=..."
    );
    mockBlogGET
      .mockRejectedValueOnce(indexError) // first call throws
      .mockResolvedValueOnce(make200()); // retry without ?q succeeds
    const res = await GET(makeReq({ q: "pikachu" }) as never);
    expect(mockBlogGET).toHaveBeenCalledTimes(2);
    const secondCallRequest = mockBlogGET.mock.calls[1][0] as Request;
    expect(new URL(secondCallRequest.url).searchParams.has("q")).toBe(false);
    expect(res.status).toBe(200);
  });

  it("non-index error without search query → error re-thrown", async () => {
    const dbError = new Error("Connection timeout");
    mockBlogGET.mockRejectedValue(dbError);
    await expect(GET(makeReq() as never)).rejects.toThrow("Connection timeout");
  });

  it("non-FAILED_PRECONDITION error with search query → error re-thrown (not suppressed)", async () => {
    const authError = new Error("PERMISSION_DENIED: Missing credentials");
    mockBlogGET.mockRejectedValue(authError);
    await expect(GET(makeReq({ q: "test" }) as never)).rejects.toThrow("PERMISSION_DENIED");
  });
});
