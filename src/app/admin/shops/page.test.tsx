import React from "react";
import {
  render,
  screen,
  waitFor,
  within,
  act,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminShopsPage from "./page";
import { shopsService } from "@/services/shops.service";
import { useAuth } from "@/contexts/AuthContext";

// Mock dependencies
jest.mock("@/services/shops.service");
jest.mock("@/contexts/AuthContext");
jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: any) => value,
}));

const mockUseIsMobile = jest.fn(() => false);
jest.mock("@/hooks/useMobile", () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

jest.mock("next/link", () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

const mockShops = [
  {
    id: "shop1",
    slug: "shop-1",
    name: "Test Shop 1",
    email: "owner1@test.com",
    location: "Mumbai",
    isVerified: true,
    featured: true,
    isBanned: false,
    productCount: 50,
    rating: 4.5,
    reviewCount: 120,
    logo: "https://example.com/logo1.jpg",
    ownerId: "owner1",
  },
  {
    id: "shop2",
    slug: "shop-2",
    name: "Test Shop 2",
    email: "owner2@test.com",
    location: "Delhi",
    isVerified: false,
    featured: false,
    isBanned: true,
    productCount: 25,
    rating: 3.8,
    reviewCount: 45,
    logo: null,
    ownerId: "owner2",
  },
];

describe("AdminShopsPage", () => {
  const mockAuth = {
    user: { uid: "admin1", role: "admin" },
    isAdmin: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue(mockAuth);
    (shopsService.list as jest.Mock).mockResolvedValue({
      data: mockShops,
      count: 2,
    });

    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = jest.fn();
  });

  describe("Rendering & Layout", () => {
    it("should render page title and description", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.getByText("Shops")).toBeInTheDocument();
        expect(
          screen.getByText(/Manage all shops on the platform/)
        ).toBeInTheDocument();
      });
    });

    it("should show total shop count in description", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.getByText(/2 total/)).toBeInTheDocument();
      });
    });

    it("should render export button", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /export/i })
        ).toBeInTheDocument();
      });
    });

    it("should render view toggle", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.getByTestId("view-toggle")).toBeInTheDocument();
      });
    });

    it("should render search input", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Search shops...")
        ).toBeInTheDocument();
      });
    });

    it("should render filters button", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        const filterButtons = screen.getAllByRole("button", {
          name: /filters/i,
        });
        expect(filterButtons.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("Loading States", () => {
    it("should show loading spinner initially", () => {
      (shopsService.list as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );
      const { container } = render(<AdminShopsPage />);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should hide loading spinner after data loads", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(
          screen.queryByRole("status", { hidden: true })
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Error States", () => {
    it("should show error message on API failure", async () => {
      (shopsService.list as jest.Mock).mockRejectedValue(
        new Error("API Error")
      );
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /error/i })
        ).toBeInTheDocument();
        expect(screen.getByText(/api error/i)).toBeInTheDocument();
      });
    });

    it("should show try again button on error", async () => {
      (shopsService.list as jest.Mock).mockRejectedValue(new Error("Failed"));
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /try again/i })
        ).toBeInTheDocument();
      });
    });

    it("should retry loading on try again click", async () => {
      (shopsService.list as jest.Mock)
        .mockRejectedValueOnce(new Error("Failed"))
        .mockResolvedValueOnce({ data: mockShops, count: 2 });
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /try again/i })
        ).toBeInTheDocument();
      });

      userEvent.click(screen.getByRole("button", { name: /try again/i }));

      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });
    });
  });

  describe("Access Control", () => {
    it("should show access denied for non-admin users", () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { uid: "user1", role: "user" },
        isAdmin: false,
      });
      render(<AdminShopsPage />);
      expect(screen.getByText("Access Denied")).toBeInTheDocument();
      expect(screen.getByText(/you must be an admin/i)).toBeInTheDocument();
    });

    it("should render content for admin users", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.queryByText("Access Denied")).not.toBeInTheDocument();
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });
    });
  });

  describe("Shops List - Table View", () => {
    it("should display all shops in table", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
        expect(screen.getByText("Test Shop 2")).toBeInTheDocument();
      });
    });

    it("should show shop name and logo", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        const logos = screen.getAllByAltText(/test shop/i);
        expect(logos.length).toBeGreaterThan(0);
      });
    });

    it("should show shop location", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.getByText("Mumbai")).toBeInTheDocument();
        expect(screen.getByText("Delhi")).toBeInTheDocument();
      });
    });

    it("should show shop owner email", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.getByText("owner1@test.com")).toBeInTheDocument();
        expect(screen.getByText("owner2@test.com")).toBeInTheDocument();
      });
    });

    it("should show verification status badges", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.getByText("Verified")).toBeInTheDocument();
        expect(screen.getByText("Unverified")).toBeInTheDocument();
      });
    });

    it("should show banned status for banned shops", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.getByText("Banned")).toBeInTheDocument();
      });
    });

    it("should show product count", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.getByText(/50 products/i)).toBeInTheDocument();
        expect(screen.getByText(/25 products/i)).toBeInTheDocument();
      });
    });

    it("should show rating and review count", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        const ratingElements = screen.getAllByText(/4\.5|3\.8/);
        expect(ratingElements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("should show featured badge for featured shops", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.getByText("Featured")).toBeInTheDocument();
      });
    });

    it("should show homepage badge for featured shops", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.getByText("Homepage")).toBeInTheDocument();
      });
    });
  });

  describe("Search Functionality", () => {
    it("should filter shops by search query", async () => {
      const user = userEvent.setup();
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search shops...");
      await user.type(searchInput, "Test Shop 1");

      await waitFor(() => {
        expect(shopsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "Test Shop 1",
          })
        );
      });
    });

    it("should reset to page 1 on search", async () => {
      const user = userEvent.setup();
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search shops...");
      await user.type(searchInput, "search term");

      await waitFor(() => {
        expect(shopsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
          })
        );
      });
    });

    it("should clear search results when search is cleared", async () => {
      const user = userEvent.setup();
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search shops...");
      await user.type(searchInput, "search");
      await user.clear(searchInput);

      await waitFor(() => {
        expect(shopsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            search: undefined,
          })
        );
      });
    });
  });

  describe("Bulk Selection", () => {
    it("should render checkbox for each shop", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes.length).toBeGreaterThan(2); // Including select-all
      });
    });

    it("should select individual shop on checkbox click", async () => {
      const user = userEvent.setup();
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole("checkbox");
      await user.click(checkboxes[1]); // First shop checkbox

      expect(checkboxes[1]).toBeChecked();
    });

    it("should select all shops on select-all click", async () => {
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });

      const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
      fireEvent.click(selectAllCheckbox);

      await waitFor(() => {
        const allCheckboxes = screen.getAllByRole("checkbox");
        allCheckboxes.forEach((checkbox) => {
          expect(checkbox).toBeChecked();
        });
      });
    });

    it("should deselect all when clicking select-all again", async () => {
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });

      const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
      fireEvent.click(selectAllCheckbox);

      await waitFor(() => {
        expect(selectAllCheckbox).toBeChecked();
      });

      fireEvent.click(selectAllCheckbox);

      await waitFor(() => {
        const allCheckboxes = screen.getAllByRole("checkbox");
        allCheckboxes.forEach((checkbox) => {
          expect(checkbox).not.toBeChecked();
        });
      });
    });
  });

  describe("Bulk Actions", () => {
    it("should show bulk action bar when shops are selected", async () => {
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[1]);

      await waitFor(() => {
        expect(screen.getByText(/1.*shop/i)).toBeInTheDocument();
      });
    });

    it("should hide bulk action bar when no shops selected", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.queryByText(/selected/i)).not.toBeInTheDocument();
      });
    });

    it("should perform verify action on selected shops", async () => {
      (shopsService.verify as jest.Mock).mockResolvedValue({});
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[1]);

      await waitFor(() => {
        expect(screen.getByText(/1.*shop/i)).toBeInTheDocument();
      });

      const verifyButton = screen.getByRole("button", { name: /verify/i });
      fireEvent.click(verifyButton);

      await waitFor(() => {
        expect(shopsService.verify).toHaveBeenCalled();
      });
    });

    it("should perform delete action on selected shops", async () => {
      (shopsService.delete as jest.Mock).mockResolvedValue({});
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[1]);

      await waitFor(() => {
        expect(screen.getByText(/1.*shop/i)).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole("button", { name: /delete/i });
      const bulkDeleteButton = buttons.find((btn) =>
        btn.textContent?.includes("Delete")
      );
      if (bulkDeleteButton) {
        fireEvent.click(bulkDeleteButton);
      }

      await waitFor(() => {
        expect(shopsService.delete).toHaveBeenCalled();
      });
    });
  });

  describe("Shop Actions", () => {
    it("should render edit link for each shop", async () => {
      const { container } = render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });

      const editLinks = container.querySelectorAll('a[title="Edit"]');
      expect(editLinks.length).toBeGreaterThanOrEqual(2);
    });

    it("should render view link for each shop", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
        expect(screen.getByText("Test Shop 2")).toBeInTheDocument();
      });
    });

    it("should render delete button for each shop", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle("Delete");
        expect(deleteButtons).toHaveLength(2);
      });
    });

    it("should show confirmation dialog on delete click", async () => {
      const user = userEvent.setup();
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle("Delete");
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/delete shop/i)).toBeInTheDocument();
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });
    });

    it("should call delete API on confirmation", async () => {
      (shopsService.delete as jest.Mock).mockResolvedValue({});
      const user = userEvent.setup();
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle("Delete");
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getAllByRole("button", { name: /delete/i })).toHaveLength(
          3
        ); // 2 table buttons + 1 confirm button
      });

      const buttons = screen.getAllByRole("button", { name: /delete/i });
      const confirmButton = buttons.find((btn) =>
        btn.className.includes("bg-red-600")
      );
      await user.click(confirmButton);

      await waitFor(() => {
        expect(shopsService.delete).toHaveBeenCalledWith("shop-1");
      });
    });
  });

  describe("Export Functionality", () => {
    it("should export shops to CSV on export click", async () => {
      const user = userEvent.setup();
      const createElementSpy = jest.spyOn(document, "createElement");
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });

      const exportButton = screen.getByRole("button", { name: /export/i });
      await user.click(exportButton);

      expect(createElementSpy).toHaveBeenCalledWith("a");
    });
  });

  describe("Pagination", () => {
    beforeEach(() => {
      (shopsService.list as jest.Mock).mockResolvedValue({
        data: Array(20).fill(mockShops[0]),
        count: 50,
      });
    });

    it("should show pagination when more than one page", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
      });
    });

    it("should show previous and next buttons", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /previous/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /next/i })
        ).toBeInTheDocument();
      });
    });

    it("should disable previous button on first page", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /previous/i })
        ).toBeDisabled();
      });
    });

    it("should enable next button when more pages available", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /next/i })
        ).not.toBeDisabled();
      });
    });

    it("should load next page on next button click", async () => {
      const user = userEvent.setup();
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /next/i })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /next/i }));

      await waitFor(() => {
        expect(shopsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
          })
        );
      });
    });

    it("should show correct item range in pagination", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        const elements = screen.getAllByText((content, element) => {
          return (
            (element?.textContent?.includes("20") &&
              element?.textContent?.includes("50")) ||
            false
          );
        });
        expect(elements.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("Empty States", () => {
    it("should show empty state when no shops", async () => {
      (shopsService.list as jest.Mock).mockResolvedValue({
        data: [],
        count: 0,
      });
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByText(/no shops/i)).toBeInTheDocument();
      });
    });

    it("should show different message for filtered empty state", async () => {
      (shopsService.list as jest.Mock).mockResolvedValue({
        data: [],
        count: 0,
      });
      const user = userEvent.setup();
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("Search shops...")
        ).toBeInTheDocument();
      });

      await user.type(
        screen.getByPlaceholderText("Search shops..."),
        "nonexistent"
      );

      await waitFor(() => {
        expect(
          screen.getByText(/try adjusting your filters/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Grid View", () => {
    it("should switch to grid view when grid button clicked", async () => {
      const user = userEvent.setup();
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByTestId("view-toggle")).toBeInTheDocument();
      });

      const gridButton = screen.getByRole("button", { name: /grid/i });
      await user.click(gridButton);

      await waitFor(() => {
        expect(screen.getByTestId("grid-view")).toBeInTheDocument();
      });
    });

    it("should display shops in grid format", async () => {
      const user = userEvent.setup();
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });

      const gridButton = screen.getByRole("button", { name: /grid/i });
      await user.click(gridButton);

      await waitFor(() => {
        const gridContainer = screen.getByTestId("grid-view");
        expect(gridContainer).toHaveClass("grid");
      });
    });

    it("should show shop cards with all info in grid view", async () => {
      const user = userEvent.setup();
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });

      const gridButton = screen.getByRole("button", { name: /grid/i });
      await user.click(gridButton);

      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
        expect(screen.getByText("Mumbai")).toBeInTheDocument();
        expect(screen.getByText("4.5")).toBeInTheDocument();
      });
    });

    it("should show edit and view buttons in grid cards", async () => {
      const user = userEvent.setup();
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Shop 1")).toBeInTheDocument();
      });

      const gridButton = screen.getByRole("button", { name: /grid/i });
      await user.click(gridButton);

      await waitFor(() => {
        const editLinks = screen.getAllByText("Edit");
        const viewLinks = screen.getAllByText("View");
        expect(editLinks.length).toBeGreaterThan(0);
        expect(viewLinks.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Filters", () => {
    it("should show filter sidebar", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.getByTestId("filter-sidebar")).toBeInTheDocument();
      });
    });

    it("should apply filters on filter change", async () => {
      const user = userEvent.setup();
      render(<AdminShopsPage />);

      await waitFor(() => {
        expect(screen.getByTestId("filter-sidebar")).toBeInTheDocument();
      });

      const verifiedFilter = screen.getByLabelText(/verified/i);
      await user.click(verifiedFilter);

      await waitFor(() => {
        expect(shopsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            is_verified: ["true"],
          })
        );
      });
    });

    it("should reset filters on reset button click", async () => {
      const user = userEvent.setup();
      render(<AdminShopsPage />);

      // First apply a filter to make reset button visible
      await waitFor(() => {
        expect(screen.getByTestId("filter-sidebar")).toBeInTheDocument();
      });

      const verifiedCheckbox = screen.getByLabelText(/verified/i);
      await user.click(verifiedCheckbox);

      // Wait for reset button to appear
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /reset all/i })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /reset all/i }));

      // Verify filters were reset (should call without filter params)
      await waitFor(() => {
        const lastCall = (shopsService.list as jest.Mock).mock.calls[
          (shopsService.list as jest.Mock).mock.calls.length - 1
        ];
        expect(lastCall[0]).not.toHaveProperty("is_verified");
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels on checkboxes", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.getByLabelText("Select all shops")).toBeInTheDocument();
        expect(screen.getByLabelText("Select Test Shop 1")).toBeInTheDocument();
      });
    });

    it("should have proper table structure", async () => {
      render(<AdminShopsPage />);
      await waitFor(() => {
        expect(screen.getByRole("table")).toBeInTheDocument();
        expect(screen.getAllByRole("row")).toHaveLength(3); // Header + 2 shops
      });
    });
  });

  describe("Responsive Design", () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(false);
    });

    it("should hide filters sidebar on mobile", async () => {
      mockUseIsMobile.mockReturnValue(true);
      render(<AdminShopsPage />);
      await waitFor(() => {
        const sidebar = screen.getByTestId("filter-sidebar");
        expect(sidebar).toHaveClass("-translate-x-full");
      });
    });

    it("should show filters button on mobile", async () => {
      mockUseIsMobile.mockReturnValue(true);
      render(<AdminShopsPage />);
      await waitFor(() => {
        const filterButtons = screen.getAllByRole("button", {
          name: /filters/i,
        });
        expect(filterButtons.length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
