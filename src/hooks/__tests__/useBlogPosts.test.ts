/**
 * useBlogPosts Tests — Phase 61
 *
 * Verifies that useBlogPosts delegates to blogService.list(),
 * uses the correct queryKey, and returns sensible defaults.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useBlogPosts } from "../useBlogPosts";

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
}));

jest.mock("@/services", () => ({
  blogService: {
    list: jest.fn().mockResolvedValue({
      posts: [],
      meta: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
    }),
  },
}));

const { useApiQuery } = require("@/hooks");
const { blogService } = require("@/services");

describe("useBlogPosts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls blogService.list with undefined when no params provided", () => {
    renderHook(() => useBlogPosts());
    expect(blogService.list).toHaveBeenCalledWith(undefined);
  });

  it("calls blogService.list with the provided params string", () => {
    renderHook(() => useBlogPosts("sort=-createdAt&page=2"));
    expect(blogService.list).toHaveBeenCalledWith("sort=-createdAt&page=2");
  });

  it("uses queryKey ['blog', ''] when no params", () => {
    renderHook(() => useBlogPosts());
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["blog", ""] }),
    );
  });

  it("uses queryKey ['blog', params] when params provided", () => {
    renderHook(() => useBlogPosts("page=2"));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["blog", "page=2"] }),
    );
  });

  it("returns empty posts and undefined meta when data is null", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useBlogPosts());
    expect(result.current.posts).toEqual([]);
    expect(result.current.meta).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });

  it("returns posts and meta when data is available", () => {
    const mockData = {
      posts: [{ id: "1", title: "Post 1" }],
      meta: { total: 1, page: 1, pageSize: 10, totalPages: 1 },
    };
    (useApiQuery as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useBlogPosts());
    expect(result.current.posts).toEqual(mockData.posts);
    expect(result.current.meta).toEqual(mockData.meta);
    expect(result.current.isLoading).toBe(false);
  });

  it("exposes error from query", () => {
    const err = new Error("fetch failed");
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: err,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useBlogPosts());
    expect(result.current.error).toBe(err);
  });

  it("exposes refetch from query", () => {
    const refetch = jest.fn();
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch,
    });
    const { result } = renderHook(() => useBlogPosts());
    expect(result.current.refetch).toBe(refetch);
  });
});
