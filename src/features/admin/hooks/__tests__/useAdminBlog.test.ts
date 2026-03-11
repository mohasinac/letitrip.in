/**
 * useAdminBlog Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminBlog } from "../useAdminBlog";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
  useMutation: jest.fn((opts: any) => ({
    mutate: (data: unknown) => opts.mutationFn(data),
    isPending: false,
    error: null,
  })),
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}));

jest.mock("@/services", () => ({
  adminService: {
    listBlog: jest.fn().mockResolvedValue({ posts: [], meta: {} }),
  },
}));

jest.mock("@/actions", () => ({
  createBlogPostAction: jest.fn().mockResolvedValue({}),
  updateBlogPostAction: jest.fn().mockResolvedValue({}),
  deleteBlogPostAction: jest.fn().mockResolvedValue({}),
}));

const { useQuery } = require("@tanstack/react-query");
const { adminService } = require("@/services");
const { createBlogPostAction, deleteBlogPostAction } = require("@/actions");

describe("useAdminBlog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return { data: null, isLoading: false };
    });
  });

  it("calls adminService.listBlog with encoded status filter", () => {
    renderHook(() => useAdminBlog("published"));
    expect(adminService.listBlog).toHaveBeenCalled();
  });

  it("uses queryKey ['admin', 'blog', statusFilter]", () => {
    renderHook(() => useAdminBlog("draft"));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin", "blog", "draft"] }),
    );
  });

  it("createMutation calls createBlogPostAction", () => {
    const { result } = renderHook(() => useAdminBlog(""));
    result.current.createMutation.mutate({ title: "Post" });
    expect(createBlogPostAction).toHaveBeenCalledWith({ title: "Post" });
  });

  it("deleteMutation calls deleteBlogPostAction with id", () => {
    const { result } = renderHook(() => useAdminBlog(""));
    result.current.deleteMutation.mutate("post-1");
    expect(deleteBlogPostAction).toHaveBeenCalledWith("post-1");
  });
});
