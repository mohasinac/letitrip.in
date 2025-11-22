import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import CategoriesContent from "./page";
import { categoriesService } from "@/services/categories.service";
import { Status } from "@/types/shared/common.types";

jest.mock("@/services/categories.service");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));
jest.mock("lucide-react", () => ({
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  Tag: () => <div data-testid="tag-icon" />,
  Loader2: () => <div data-testid="loader2-icon" />,
  Search: () => <div data-testid="search-icon" />,
  List: () => <div data-testid="list-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
}));

const mockCategoriesService = categoriesService as jest.Mocked<
  typeof categoriesService
>;
const mockRouter = { push: jest.fn() };
const mockSearchParams = { get: jest.fn() };

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
  (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  mockRouter.push.mockReset();
  mockSearchParams.get.mockReset();
  mockCategoriesService.list.mockReset();
});

describe("CategoriesContent", () => {
  it("renders categories on load", async () => {
    mockCategoriesService.list.mockResolvedValue({
      data: [
        {
          id: "1",
          name: "Category 1",
          slug: "cat-1",
          description: null,
          image: null,
          banner: null,
          icon: null,
          parentIds: [],
          level: 1,
          order: 1,
          status: Status.PUBLISHED,
          productCount: 0,
          isLeaf: true,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          hasProducts: false,
          hasParents: false,
          isRoot: true,
          displayName: "Category 1",
          urlPath: "/categories/cat-1",
        },
        {
          id: "2",
          name: "Category 2",
          slug: "cat-2",
          description: null,
          image: null,
          banner: null,
          icon: null,
          parentIds: [],
          level: 1,
          order: 2,
          status: Status.PUBLISHED,
          productCount: 0,
          isLeaf: true,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          hasProducts: false,
          hasParents: false,
          isRoot: true,
          displayName: "Category 2",
          urlPath: "/categories/cat-2",
        },
      ],
      count: 2,
      pagination: { limit: 50, hasNextPage: false, nextCursor: null, count: 2 },
    });
    await act(async () => {
      render(<CategoriesContent />);
    });
    await waitFor(() => {
      expect(screen.getByText("Category 1")).toBeInTheDocument();
      expect(screen.getByText("Category 2")).toBeInTheDocument();
    });
  });

  it("shows loading state initially", async () => {
    mockCategoriesService.list.mockResolvedValue({
      data: [],
      count: 0,
      pagination: { limit: 50, hasNextPage: false, nextCursor: null, count: 0 },
    });
    await act(async () => {
      render(<CategoriesContent />);
    });
    expect(screen.getByTestId("loader2-icon")).toBeInTheDocument();
  });

  it("handles search functionality", async () => {
    mockCategoriesService.list.mockResolvedValue({
      data: [
        {
          id: "1",
          name: "Category 1",
          slug: "cat-1",
          description: null,
          image: null,
          banner: null,
          icon: null,
          parentIds: [],
          level: 1,
          order: 1,
          status: Status.PUBLISHED,
          productCount: 0,
          isLeaf: true,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          hasProducts: false,
          hasParents: false,
          isRoot: true,
          displayName: "Category 1",
          urlPath: "/categories/cat-1",
        },
      ],
      count: 1,
      pagination: { limit: 50, hasNextPage: false, nextCursor: null, count: 1 },
    });
    await act(async () => {
      render(<CategoriesContent />);
    });
    const searchInput = screen.getByPlaceholderText("Search categories...");
    fireEvent.change(searchInput, { target: { value: "cat" } });
    fireEvent.submit(searchInput.closest("form"));
    await waitFor(() => {
      expect(mockCategoriesService.list).toHaveBeenCalledWith(
        expect.objectContaining({ search: "cat" })
      );
    });
  });

  it("shows empty state when no categories", async () => {
    mockCategoriesService.list.mockResolvedValue({
      data: [],
      count: 0,
      pagination: { limit: 50, hasNextPage: false, nextCursor: null, count: 0 },
    });
    await act(async () => {
      render(<CategoriesContent />);
    });
    await waitFor(() => {
      expect(screen.getByText("No categories available")).toBeInTheDocument();
    });
  });

  // TODO: Extract hardcoded strings like "No categories found", "Search categories..." to constants
});
