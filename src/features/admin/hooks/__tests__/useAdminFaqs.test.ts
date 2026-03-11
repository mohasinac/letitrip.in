/**
 * useAdminFaqs Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminFaqs } from "../useAdminFaqs";

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
  faqService: {
    list: jest.fn().mockResolvedValue({ items: [], total: 0 }),
  },
}));

jest.mock("@/actions", () => ({
  adminCreateFaqAction: jest.fn().mockResolvedValue({}),
  adminUpdateFaqAction: jest.fn().mockResolvedValue({}),
  adminDeleteFaqAction: jest.fn().mockResolvedValue({}),
}));

const { useQuery } = require("@tanstack/react-query");
const { faqService } = require("@/services");
const { adminCreateFaqAction, adminDeleteFaqAction } = require("@/actions");

describe("useAdminFaqs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return { data: null, isLoading: false };
    });
  });

  it("calls faqService.list with paramsString", () => {
    renderHook(() => useAdminFaqs("page=1"));
    expect(faqService.list).toHaveBeenCalledWith("page=1");
  });

  it("uses queryKey ['faqs', 'list', paramsString]", () => {
    renderHook(() => useAdminFaqs("page=1"));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["faqs", "list", "page=1"] }),
    );
  });

  it("createMutation calls adminCreateFaqAction", () => {
    const { result } = renderHook(() => useAdminFaqs(""));
    result.current.createMutation.mutate({ question: "Q?" });
    expect(adminCreateFaqAction).toHaveBeenCalledWith({ question: "Q?" });
  });

  it("deleteMutation calls adminDeleteFaqAction with id", () => {
    const { result } = renderHook(() => useAdminFaqs(""));
    result.current.deleteMutation.mutate("faq-1");
    expect(adminDeleteFaqAction).toHaveBeenCalledWith("faq-1");
  });
});
