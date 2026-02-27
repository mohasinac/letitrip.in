/**
 * useAdminSections Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminSections } from "../useAdminSections";

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
  homepageSectionsService: {
    list: jest.fn().mockResolvedValue({ sections: [] }),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
}));

const { useApiQuery, useApiMutation } = require("@/hooks");
const { homepageSectionsService } = require("@/services");

describe("useAdminSections", () => {
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

  it("calls homepageSectionsService.list via queryFn", () => {
    renderHook(() => useAdminSections());
    expect(homepageSectionsService.list).toHaveBeenCalled();
  });

  it("uses queryKey ['homepage-sections', 'list']", () => {
    renderHook(() => useAdminSections());
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["homepage-sections", "list"] }),
    );
  });

  it("createMutation calls homepageSectionsService.create", () => {
    const { result } = renderHook(() => useAdminSections());
    result.current.createMutation.mutate({ type: "welcome" });
    expect(homepageSectionsService.create).toHaveBeenCalledWith({
      type: "welcome",
    });
  });

  it("deleteMutation calls homepageSectionsService.delete with id", () => {
    const { result } = renderHook(() => useAdminSections());
    result.current.deleteMutation.mutate("sec-1");
    expect(homepageSectionsService.delete).toHaveBeenCalledWith("sec-1");
  });
});
