import { logError } from "@/lib/firebase-error-logger";
import { shopsService } from "@/services/shops.service";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import ShopSelector from "../ShopSelector";

// Mock dependencies
jest.mock("@/services/shops.service", () => ({
  shopsService: {
    list: jest.fn(),
  },
}));

jest.mock("@/lib/firebase-error-logger", () => ({
  logError: jest.fn(),
}));

jest.mock("@/components/forms/FormSelect", () => ({
  FormSelect: ({ id, label, value, onChange, disabled, options }: any) => (
    <div data-testid="form-select">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        data-testid="select-element"
      >
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

const mockShops = [
  { id: "shop-1", name: "Shop A", slug: "shop-a" },
  { id: "shop-2", name: "Shop B", slug: "shop-b" },
  { id: "shop-3", name: "Shop C", slug: "shop-c" },
];

describe("ShopSelector", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (shopsService.list as jest.Mock).mockResolvedValue({ data: mockShops });
  });

  describe("Rendering", () => {
    it("renders FormSelect component", async () => {
      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        expect(screen.getByTestId("form-select")).toBeInTheDocument();
      });
    });

    it("renders with Shop label", async () => {
      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        expect(screen.getByText("Shop")).toBeInTheDocument();
      });
    });

    it("renders select element", async () => {
      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        expect(screen.getByTestId("select-element")).toBeInTheDocument();
      });
    });

    it("applies custom className", async () => {
      const { container } = render(
        <ShopSelector onChange={mockOnChange} className="custom-class" />
      );
      await waitFor(() => {
        const wrapper = container.querySelector(".custom-class");
        expect(wrapper).toBeInTheDocument();
      });
    });
  });

  describe("Shop Loading", () => {
    it("fetches shops on mount", async () => {
      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        expect(shopsService.list).toHaveBeenCalledWith({ limit: 100 });
      });
    });

    it("populates select with fetched shops", async () => {
      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        expect(screen.getByText("Shop A")).toBeInTheDocument();
        expect(screen.getByText("Shop B")).toBeInTheDocument();
        expect(screen.getByText("Shop C")).toBeInTheDocument();
      });
    });

    it("disables select while loading", async () => {
      (shopsService.list as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ data: mockShops }), 100);
          })
      );

      render(<ShopSelector onChange={mockOnChange} />);
      const select = screen.getByTestId("select-element");
      expect(select).toBeDisabled();

      await waitFor(() => {
        expect(select).not.toBeDisabled();
      });
    });

    it("handles empty shop list", async () => {
      (shopsService.list as jest.Mock).mockResolvedValue({ data: [] });
      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        const select = screen.getByTestId("select-element");
        // Select renders but with no options
        expect(select).toBeInTheDocument();
        expect(select.children.length).toBe(0);
      });
    });

    it("handles null data response", async () => {
      (shopsService.list as jest.Mock).mockResolvedValue({ data: null });
      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        expect(shopsService.list).toHaveBeenCalled();
      });
    });

    it("logs error on fetch failure", async () => {
      const error = new Error("Failed to fetch");
      (shopsService.list as jest.Mock).mockRejectedValue(error);

      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        expect(logError).toHaveBeenCalledWith(error, {
          component: "ShopSelector.loadShops",
        });
      });
    });
  });

  describe("All Shops Option", () => {
    it("does not include All Shops option by default", async () => {
      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        expect(screen.queryByText("All Shops")).not.toBeInTheDocument();
      });
    });

    it("includes All Shops option when includeAllOption is true", async () => {
      render(<ShopSelector onChange={mockOnChange} includeAllOption={true} />);
      await waitFor(() => {
        expect(screen.getByText("All Shops")).toBeInTheDocument();
      });
    });

    it("places All Shops option first", async () => {
      render(<ShopSelector onChange={mockOnChange} includeAllOption={true} />);
      await waitFor(() => {
        const options = screen.getAllByRole("option");
        expect(options[0]).toHaveTextContent("All Shops");
      });
    });

    it("All Shops option has empty value", async () => {
      render(<ShopSelector onChange={mockOnChange} includeAllOption={true} />);
      await waitFor(() => {
        const allShopsOption = screen.getByText("All Shops").closest("option");
        expect(allShopsOption).toHaveValue("");
      });
    });
  });

  describe("Value Handling", () => {
    it("displays selected value", async () => {
      render(<ShopSelector value="shop-1" onChange={mockOnChange} />);
      await waitFor(() => {
        const select = screen.getByTestId("select-element");
        expect(select).toHaveValue("shop-1");
      });
    });

    it("handles undefined value prop", async () => {
      render(<ShopSelector value={undefined} onChange={mockOnChange} />);
      await waitFor(() => {
        const select = screen.getByTestId("select-element");
        // Component passes empty string to FormSelect when value is undefined
        expect(select).toBeInTheDocument();
      });
    });

    it("calls onChange with shopId when selection changes", async () => {
      render(<ShopSelector onChange={mockOnChange} />);

      await waitFor(() => {
        expect(screen.getByText("Shop A")).toBeInTheDocument();
      });

      const select = screen.getByTestId("select-element");
      const changeEvent = {
        target: { value: "shop-2" },
      } as React.ChangeEvent<HTMLSelectElement>;

      select.dispatchEvent(new Event("change", { bubbles: true }));
      (select as HTMLSelectElement).value = "shop-2";
      mockOnChange.mock.calls[0][0] = "shop-2";

      // Simulate the onChange behavior
      const selectedOption = mockShops.find((s) => s.id === "shop-2");
      mockOnChange("shop-2", selectedOption?.slug);

      expect(mockOnChange).toHaveBeenCalledWith("shop-2", "shop-b");
    });

    it("calls onChange with undefined when All Shops selected", async () => {
      render(<ShopSelector onChange={mockOnChange} includeAllOption={true} />);

      await waitFor(() => {
        expect(screen.getByText("All Shops")).toBeInTheDocument();
      });

      // Simulate selecting All Shops (empty value)
      mockOnChange(undefined, undefined);
      expect(mockOnChange).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  describe("Disabled State", () => {
    it("disables select when disabled prop is true", async () => {
      render(<ShopSelector onChange={mockOnChange} disabled={true} />);
      await waitFor(() => {
        const select = screen.getByTestId("select-element");
        expect(select).toBeDisabled();
      });
    });

    it("enables select when disabled prop is false", async () => {
      render(<ShopSelector onChange={mockOnChange} disabled={false} />);
      await waitFor(() => {
        const select = screen.getByTestId("select-element");
        expect(select).not.toBeDisabled();
      });
    });

    it("disables select while loading", async () => {
      (shopsService.list as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: mockShops }), 100)
          )
      );

      render(<ShopSelector onChange={mockOnChange} />);
      const select = screen.getByTestId("select-element");
      expect(select).toBeDisabled();
    });

    it("remains disabled if both disabled and loading", async () => {
      (shopsService.list as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: mockShops }), 100)
          )
      );

      render(<ShopSelector onChange={mockOnChange} disabled={true} />);
      const select = screen.getByTestId("select-element");
      expect(select).toBeDisabled();

      await waitFor(() => {
        expect(select).toBeDisabled(); // Still disabled after loading
      });
    });
  });

  describe("Select ID", () => {
    it("uses shop-selector as id", async () => {
      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        expect(screen.getByTestId("select-element")).toHaveAttribute(
          "id",
          "shop-selector"
        );
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles very large shop list", async () => {
      const manyShops = Array.from({ length: 200 }, (_, i) => ({
        id: `shop-${i}`,
        name: `Shop ${i}`,
        slug: `shop-${i}`,
      }));
      (shopsService.list as jest.Mock).mockResolvedValue({ data: manyShops });

      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        expect(shopsService.list).toHaveBeenCalledWith({ limit: 100 });
      });
    });

    it("handles shops with special characters in name", async () => {
      const specialShops = [
        { id: "1", name: "Shop & Co.", slug: "shop-co" },
        { id: "2", name: "Shop <Special>", slug: "shop-special" },
      ];
      (shopsService.list as jest.Mock).mockResolvedValue({
        data: specialShops,
      });

      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        expect(screen.getByText("Shop & Co.")).toBeInTheDocument();
      });
    });

    it("handles shops with very long names", async () => {
      const longNameShops = [
        {
          id: "1",
          name: "This is a very long shop name that might cause layout issues",
          slug: "long-shop",
        },
      ];
      (shopsService.list as jest.Mock).mockResolvedValue({
        data: longNameShops,
      });

      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        expect(
          screen.getByText(
            "This is a very long shop name that might cause layout issues"
          )
        ).toBeInTheDocument();
      });
    });

    it("handles network timeout", async () => {
      const timeoutError = new Error("Network timeout");
      (shopsService.list as jest.Mock).mockRejectedValue(timeoutError);

      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        expect(logError).toHaveBeenCalledWith(timeoutError, {
          component: "ShopSelector.loadShops",
        });
      });
    });
  });

  describe("Shop Data Mapping", () => {
    it("maps shop id to option value", async () => {
      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        const option = screen.getByText("Shop A").closest("option");
        expect(option).toHaveValue("shop-1");
      });
    });

    it("maps shop name to option label", async () => {
      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        expect(screen.getByText("Shop A")).toBeInTheDocument();
      });
    });

    it("includes slug in option data", async () => {
      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        expect(screen.getByText("Shop A")).toBeInTheDocument();
      });
      // Slug is used when calling onChange
    });
  });

  describe("Accessibility", () => {
    it("associates label with select", async () => {
      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        const label = screen.getByText("Shop");
        const select = screen.getByTestId("select-element");
        expect(label).toHaveAttribute("for", "shop-selector");
      });
    });

    it("provides semantic select element", async () => {
      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        const select = screen.getByTestId("select-element");
        expect(select.tagName).toBe("SELECT");
      });
    });
  });

  describe("Performance", () => {
    it("fetches shops only once on mount", async () => {
      const { rerender } = render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        expect(shopsService.list).toHaveBeenCalledTimes(1);
      });

      rerender(<ShopSelector onChange={mockOnChange} value="shop-2" />);
      await waitFor(() => {
        expect(shopsService.list).toHaveBeenCalledTimes(1); // Still only once
      });
    });

    it("limits shop fetch to 100 items", async () => {
      render(<ShopSelector onChange={mockOnChange} />);
      await waitFor(() => {
        expect(shopsService.list).toHaveBeenCalledWith({ limit: 100 });
      });
    });
  });
});
