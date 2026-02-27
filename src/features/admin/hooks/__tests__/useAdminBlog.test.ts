/**
 * useAdminBlog Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminBlog } from "../useAdminBlog";

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
  useApiMutation: jest.fn((opts: any) => ({
    mutate: (data: unknown) => opts.mutationFn(data),
    isPending: false,
    error: null,
  })),
}));

jest.mock("@/services", () => ({
  adminService: {
    listBlog: jest.fn().mockResolvedValue({ posts: [], meta: {} }),
    createBlogPost: jest.fn().mockResolvedValue({}),
    updateBlogPost: jest.fn().mockResolvedValue({}),
    deleteBlogPost: jest.fn().mockResolvedValue({}),
  },
}));

const { useApiQuery, useApiMutation } = require("@/hooks");
const { adminService } = require("@/services");

describe("useAdminBlog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useApiQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return { data: null, isLoading: false };
    });
    (useApiMutation as jest.Mock).mockImplementation((opts: any) => ({
      mutate: (data: unknown) => opts.mutationFn(data),
      isPending: false,
    }));
  });

  it("calls adminService.listBlog with encoded status filter", () => {
    renderHook(() => useAdminBlog("published"));
    expect(adminService.listBlog).toHaveBeenCalled();
  });

  it("uses queryKey ['admin', 'blog', statusFilter]", () => {
    renderHook(() => useAdminBlog("draft"));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin", "blog", "draft"] }),
    );
  });

  it("createMutation calls adminService.createBlogPost", () => {
    const { result } = renderHook(() => useAdminBlog(""));
    result.current.createMutation.mutate({ title: "Post" });
    expect(adminService.createBlogPost).toHaveBeenCalledWith({ title: "Post" });
  });

  it("deleteMutation calls adminService.deleteBlogPost with id", () => {
    const { result } = renderHook(() => useAdminBlog(""));
    result.current.deleteMutation.mutate("post-1");
    expect(adminService.deleteBlogPost).toHaveBeenCalledWith("post-1");
  });
});
