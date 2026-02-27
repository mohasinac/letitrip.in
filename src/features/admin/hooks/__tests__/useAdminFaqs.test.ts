/**
 * useAdminFaqs Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminFaqs } from "../useAdminFaqs";

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
  faqService: {
    list: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
}));

const { useApiQuery, useApiMutation } = require("@/hooks");
const { faqService } = require("@/services");

describe("useAdminFaqs", () => {
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

  it("calls faqService.list with paramsString", () => {
    renderHook(() => useAdminFaqs("page=1"));
    expect(faqService.list).toHaveBeenCalledWith("page=1");
  });

  it("uses queryKey ['faqs', 'list', paramsString]", () => {
    renderHook(() => useAdminFaqs("page=1"));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["faqs", "list", "page=1"] }),
    );
  });

  it("createMutation calls faqService.create", () => {
    const { result } = renderHook(() => useAdminFaqs(""));
    result.current.createMutation.mutate({ question: "Q?" });
    expect(faqService.create).toHaveBeenCalledWith({ question: "Q?" });
  });

  it("deleteMutation calls faqService.delete with id", () => {
    const { result } = renderHook(() => useAdminFaqs(""));
    result.current.deleteMutation.mutate("faq-1");
    expect(faqService.delete).toHaveBeenCalledWith("faq-1");
  });
});
