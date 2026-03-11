/**
 * useAdminSections Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminSections } from "../useAdminSections";

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
  homepageSectionsService: {
    list: jest.fn().mockResolvedValue({ sections: [] }),
  },
}));

jest.mock("@/actions", () => ({
  createHomepageSectionAction: jest.fn().mockResolvedValue({}),
  updateHomepageSectionAction: jest.fn().mockResolvedValue({}),
  deleteHomepageSectionAction: jest.fn().mockResolvedValue({}),
}));

const { useQuery } = require("@tanstack/react-query");
const { homepageSectionsService } = require("@/services");
const {
  createHomepageSectionAction,
  deleteHomepageSectionAction,
} = require("@/actions");

describe("useAdminSections", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return { data: null, isLoading: false };
    });
  });

  it("calls homepageSectionsService.list via queryFn", () => {
    renderHook(() => useAdminSections());
    expect(homepageSectionsService.list).toHaveBeenCalled();
  });

  it("uses queryKey ['homepage-sections', 'list']", () => {
    renderHook(() => useAdminSections());
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["homepage-sections", "list"] }),
    );
  });

  it("createMutation calls createHomepageSectionAction", () => {
    const { result } = renderHook(() => useAdminSections());
    result.current.createMutation.mutate({ type: "welcome" });
    expect(createHomepageSectionAction).toHaveBeenCalledWith({
      type: "welcome",
    });
  });

  it("deleteMutation calls deleteHomepageSectionAction with id", () => {
    const { result } = renderHook(() => useAdminSections());
    result.current.deleteMutation.mutate("sec-1");
    expect(deleteHomepageSectionAction).toHaveBeenCalledWith("sec-1");
  });
});
