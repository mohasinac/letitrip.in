/**
 * useAdminCarousel Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminCarousel } from "../useAdminCarousel";

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
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
  carouselService: {
    list: jest.fn().mockResolvedValue({ slides: [] }),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
}));

const { useApiQuery, useApiMutation } = require("@/hooks");
const { carouselService } = require("@/services");

describe("useAdminCarousel", () => {
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

  it("calls carouselService.list via queryFn", () => {
    renderHook(() => useAdminCarousel());
    expect(carouselService.list).toHaveBeenCalled();
  });

  it("uses queryKey ['carousel', 'list']", () => {
    renderHook(() => useAdminCarousel());
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["carousel", "list"] }),
    );
  });

  it("createMutation calls carouselService.create", () => {
    const { result } = renderHook(() => useAdminCarousel());
    result.current.createMutation.mutate({ title: "Slide" });
    expect(carouselService.create).toHaveBeenCalledWith({ title: "Slide" });
  });

  it("deleteMutation calls carouselService.delete with id", () => {
    const { result } = renderHook(() => useAdminCarousel());
    result.current.deleteMutation.mutate("slide-1");
    expect(carouselService.delete).toHaveBeenCalledWith("slide-1");
  });
});
