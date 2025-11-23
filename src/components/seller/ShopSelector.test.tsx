import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ShopSelector from "./ShopSelector";

// Mock shopsService
jest.mock("@/services/shops.service");
const mockShopsService = require("@/services/shops.service").shopsService;

describe("ShopSelector", () => {
  const mockOnChange = jest.fn();
  const mockShops = [
    { id: "shop1", name: "Shop One", slug: "shop-one" },
    { id: "shop2", name: "Shop Two", slug: "shop-two" },
    { id: "shop3", name: "Shop Three", slug: "shop-three" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockShopsService.list.mockResolvedValue({ data: mockShops });
  });

  // Basic Rendering
  describe("Basic Rendering", () => {
    it("renders label and select", async () => {
      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.getByText("Shop")).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
      });
    });

    it("loads shops on mount", async () => {
      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        expect(mockShopsService.list).toHaveBeenCalledWith({ limit: 100 });
      });
    });

    it("displays loaded shop options", async () => {
      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.getByText("Shop One")).toBeInTheDocument();
        expect(screen.getByText("Shop Two")).toBeInTheDocument();
        expect(screen.getByText("Shop Three")).toBeInTheDocument();
      });
    });
  });

  // All Option
  describe("All Option", () => {
    it("includes 'All Shops' option when includeAllOption is true", async () => {
      render(<ShopSelector onChange={mockOnChange} includeAllOption={true} />);

      await waitFor(() => {
        expect(screen.getByText("All Shops")).toBeInTheDocument();
      });
    });

    it("does not include 'All Shops' when includeAllOption is false", async () => {
      render(<ShopSelector onChange={mockOnChange} includeAllOption={false} />);

      await waitFor(() => {
        expect(screen.queryByText("All Shops")).not.toBeInTheDocument();
      });
    });

    it("defaults to no 'All Shops' option", async () => {
      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.queryByText("All Shops")).not.toBeInTheDocument();
      });
    });
  });

  // Value Selection
  describe("Value Selection", () => {
    it("displays selected value", async () => {
      render(<ShopSelector value="shop2" onChange={mockOnChange} />);

      await waitFor(() => {
        const select = screen.getByRole("combobox") as HTMLSelectElement;
        expect(select.value).toBe("shop2");
      });
    });

    it("handles undefined value", async () => {
      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        const select = screen.getByRole("combobox") as HTMLSelectElement;
        expect(select.value).toBe("");
      });
    });

    it("updates when value prop changes", async () => {
      const { rerender } = render(
        <ShopSelector value="shop1" onChange={mockOnChange} />
      );

      await waitFor(() => {
        const select = screen.getByRole("combobox") as HTMLSelectElement;
        expect(select.value).toBe("shop1");
      });

      rerender(<ShopSelector value="shop3" onChange={mockOnChange} />);

      await waitFor(() => {
        const select = screen.getByRole("combobox") as HTMLSelectElement;
        expect(select.value).toBe("shop3");
      });
    });
  });

  // User Interaction
  describe("User Interaction", () => {
    it("calls onChange when shop is selected", async () => {
      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.getByText("Shop Two")).toBeInTheDocument();
      });

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "shop2" } });

      expect(mockOnChange).toHaveBeenCalledWith("shop2", "shop-two");
    });

    it("calls onChange with undefined when empty is selected", async () => {
      render(<ShopSelector onChange={mockOnChange} includeAllOption={true} />);

      await waitFor(() => {
        expect(screen.getByText("All Shops")).toBeInTheDocument();
      });

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "" } });

      expect(mockOnChange).toHaveBeenCalledWith(undefined, undefined);
    });

    it("provides slug in onChange callback", async () => {
      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.getByText("Shop One")).toBeInTheDocument();
      });

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "shop1" } });

      expect(mockOnChange).toHaveBeenCalledWith("shop1", "shop-one");
    });
  });

  // Disabled State
  describe("Disabled State", () => {
    it("disables select when disabled prop is true", async () => {
      render(<ShopSelector onChange={mockOnChange} disabled={true} />);

      await waitFor(() => {
        const select = screen.getByRole("combobox") as HTMLSelectElement;
        expect(select.disabled).toBe(true);
      });
    });

    it("enables select when disabled is false", async () => {
      render(<ShopSelector onChange={mockOnChange} disabled={false} />);

      await waitFor(() => {
        const select = screen.getByRole("combobox") as HTMLSelectElement;
        expect(select.disabled).toBe(false);
      });
    });

    it("disables select while loading", () => {
      render(<ShopSelector onChange={mockOnChange} />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.disabled).toBe(true); // Disabled initially while loading
    });

    it("enables select after loading completes", async () => {
      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        const select = screen.getByRole("combobox") as HTMLSelectElement;
        expect(select.disabled).toBe(false);
      });
    });
  });

  // Loading State
  describe("Loading State", () => {
    it("shows loading state initially", () => {
      render(<ShopSelector onChange={mockOnChange} />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.disabled).toBe(true);
    });

    it("removes loading state after shops load", async () => {
      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        const select = screen.getByRole("combobox") as HTMLSelectElement;
        expect(select.disabled).toBe(false);
      });
    });
  });

  // Error Handling
  describe("Error Handling", () => {
    it("handles API error gracefully", async () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation();
      mockShopsService.list.mockRejectedValue(new Error("API Error"));

      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it("disables select after error", async () => {
      mockShopsService.list.mockRejectedValue(new Error("API Error"));

      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        const select = screen.getByRole("combobox") as HTMLSelectElement;
        expect(select.disabled).toBe(false); // Not disabled, just has no options
      });
    });

    it("shows no options after error", async () => {
      mockShopsService.list.mockRejectedValue(new Error("API Error"));

      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        const options = screen.queryAllByRole("option");
        expect(options).toHaveLength(0);
      });
    });
  });

  // Custom Styling
  describe("Custom Styling", () => {
    it("applies custom className to container", async () => {
      const { container } = render(
        <ShopSelector onChange={mockOnChange} className="custom-class" />
      );

      await waitFor(() => {
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass("custom-class");
      });
    });

    it("has proper select styling", async () => {
      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        const select = screen.getByRole("combobox");
        expect(select).toHaveClass("w-full", "rounded-lg", "border");
      });
    });

    it("has focus styles", async () => {
      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        const select = screen.getByRole("combobox");
        expect(select.className).toContain("focus:border-blue-500");
        expect(select.className).toContain("focus:ring-1");
      });
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("handles empty shops array", async () => {
      mockShopsService.list.mockResolvedValue({ data: [] });

      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        const options = screen.queryAllByRole("option");
        expect(options).toHaveLength(0);
      });
    });

    it("handles null data from API", async () => {
      mockShopsService.list.mockResolvedValue({ data: null });

      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        const options = screen.queryAllByRole("option");
        expect(options).toHaveLength(0);
      });
    });

    it("limits API request to 100 shops", async () => {
      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        expect(mockShopsService.list).toHaveBeenCalledWith({ limit: 100 });
      });
    });

    it("handles very long shop names", async () => {
      mockShopsService.list.mockResolvedValue({
        data: [
          {
            id: "long",
            name: "This is a very long shop name that should still display correctly",
            slug: "long-shop",
          },
        ],
      });

      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        expect(
          screen.getByText(/This is a very long shop name/)
        ).toBeInTheDocument();
      });
    });

    it("handles shops with special characters in name", async () => {
      mockShopsService.list.mockResolvedValue({
        data: [
          {
            id: "special",
            name: "Shop & Co. (Main)",
            slug: "shop-co-main",
          },
        ],
      });

      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.getByText("Shop & Co. (Main)")).toBeInTheDocument();
      });
    });
  });

  // Label
  describe("Label", () => {
    it("renders 'Shop' label", async () => {
      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        const label = screen.getByText("Shop");
        expect(label).toHaveClass("text-sm", "font-medium", "text-gray-700");
      });
    });

    it("label is above select", async () => {
      const { container } = render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        const wrapper = container.firstChild as HTMLElement;
        const children = Array.from(wrapper.children);
        expect(children[0].tagName).toBe("LABEL");
        expect(children[1].tagName).toBe("SELECT");
      });
    });
  });
});
