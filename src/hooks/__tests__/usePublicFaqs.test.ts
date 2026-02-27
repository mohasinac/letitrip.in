/**
 * usePublicFaqs Tests — Phase 62
 *
 * Covers two exports from usePublicFaqs.ts:
 * - usePublicFaqs(category?, limit?) — homepage FAQ widget
 * - useAllFaqs() — full FAQ page list
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { usePublicFaqs, useAllFaqs } from "../usePublicFaqs";

jest.mock("../useApiQuery", () => ({
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
}));

jest.mock("@/services", () => ({
  faqService: {
    listPublic: jest.fn().mockResolvedValue([]),
    list: jest.fn().mockResolvedValue([]),
  },
}));

const { useApiQuery } = require("../useApiQuery");
const { faqService } = require("@/services");

describe("usePublicFaqs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls faqService.listPublic with no args by default", () => {
    renderHook(() => usePublicFaqs());
    expect(faqService.listPublic).toHaveBeenCalledWith(undefined, 6);
  });

  it("calls faqService.listPublic with category and limit", () => {
    renderHook(() => usePublicFaqs("shipping", 3));
    expect(faqService.listPublic).toHaveBeenCalledWith("shipping", 3);
  });

  it("uses queryKey with category='all' when no category", () => {
    renderHook(() => usePublicFaqs());
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["faqs", "homepage", "all", "6"],
      }),
    );
  });

  it("uses queryKey with the provided category", () => {
    renderHook(() => usePublicFaqs("returns", 4));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["faqs", "homepage", "returns", "4"],
      }),
    );
  });
});

describe("useAllFaqs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls faqService.list with 'isActive=true'", () => {
    renderHook(() => useAllFaqs());
    expect(faqService.list).toHaveBeenCalledWith("isActive=true");
  });

  it("uses queryKey ['faqs', 'public']", () => {
    renderHook(() => useAllFaqs());
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["faqs", "public"] }),
    );
  });
});
