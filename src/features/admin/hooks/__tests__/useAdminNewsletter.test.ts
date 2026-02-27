/**
 * useAdminNewsletter Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminNewsletter } from "../useAdminNewsletter";

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
    listNewsletter: jest.fn().mockResolvedValue({ subscribers: [], stats: {} }),
    updateNewsletterEntry: jest.fn().mockResolvedValue({}),
    deleteNewsletterEntry: jest.fn().mockResolvedValue({}),
  },
}));

const { useApiQuery, useApiMutation } = require("@/hooks");
const { adminService } = require("@/services");

describe("useAdminNewsletter", () => {
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

  it("calls adminService.listNewsletter with built params", () => {
    renderHook(() => useAdminNewsletter("active"));
    expect(adminService.listNewsletter).toHaveBeenCalled();
  });

  it("uses queryKey ['admin', 'newsletter', statusFilter]", () => {
    renderHook(() => useAdminNewsletter("active"));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin", "newsletter", "active"] }),
    );
  });

  it("toggleMutation calls adminService.updateNewsletterEntry", () => {
    const { result } = renderHook(() => useAdminNewsletter(""));
    result.current.toggleMutation.mutate({
      id: "sub-1",
      status: "unsubscribed",
    });
    expect(adminService.updateNewsletterEntry).toHaveBeenCalledWith("sub-1", {
      status: "unsubscribed",
    });
  });

  it("deleteMutation calls adminService.deleteNewsletterEntry with id", () => {
    const { result } = renderHook(() => useAdminNewsletter(""));
    result.current.deleteMutation.mutate("sub-2");
    expect(adminService.deleteNewsletterEntry).toHaveBeenCalledWith("sub-2");
  });
});
