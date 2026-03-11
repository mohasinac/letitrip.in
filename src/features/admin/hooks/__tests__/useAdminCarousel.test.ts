/**
 * useAdminCarousel Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminCarousel } from "../useAdminCarousel";

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
  carouselService: {
    list: jest.fn().mockResolvedValue({ slides: [] }),
  },
}));

jest.mock("@/actions", () => ({
  createCarouselSlideAction: jest.fn().mockResolvedValue({}),
  updateCarouselSlideAction: jest.fn().mockResolvedValue({}),
  deleteCarouselSlideAction: jest.fn().mockResolvedValue({}),
}));

const { useQuery } = require("@tanstack/react-query");
const { carouselService } = require("@/services");
const {
  createCarouselSlideAction,
  deleteCarouselSlideAction,
} = require("@/actions");

describe("useAdminCarousel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return { data: null, isLoading: false };
    });
  });

  it("calls carouselService.list via queryFn", () => {
    renderHook(() => useAdminCarousel());
    expect(carouselService.list).toHaveBeenCalled();
  });

  it("uses queryKey ['carousel', 'list']", () => {
    renderHook(() => useAdminCarousel());
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["carousel", "list"] }),
    );
  });

  it("createMutation calls createCarouselSlideAction", () => {
    const { result } = renderHook(() => useAdminCarousel());
    result.current.createMutation.mutate({ title: "Slide" });
    expect(createCarouselSlideAction).toHaveBeenCalledWith({ title: "Slide" });
  });

  it("deleteMutation calls deleteCarouselSlideAction with id", () => {
    const { result } = renderHook(() => useAdminCarousel());
    result.current.deleteMutation.mutate("slide-1");
    expect(deleteCarouselSlideAction).toHaveBeenCalledWith("slide-1");
  });
});
