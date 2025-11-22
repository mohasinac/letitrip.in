import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductFilters } from "./ProductFilters";

jest.mock("@/services/categories.service", () => ({
  categoriesService: {
    list: jest.fn().mockResolvedValue({
      data: [
        { id: "cat-1", name: "Category 1" },
        { id: "cat-2", name: "Category 2" },
      ],
    }),
  },
}));

describe("ProductFilters", () => {
  it("renders filter controls and category list", async () => {
    render(
      <ProductFilters
        filters={{}}
        onChange={jest.fn()}
        onApply={jest.fn()}
        onReset={jest.fn()}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Filters")).toBeInTheDocument();
      expect(screen.getByText("Category 1")).toBeInTheDocument();
      expect(screen.getByText("Category 2")).toBeInTheDocument();
    });
  });

  it("calls onChange when filter is updated", async () => {
    const onChange = jest.fn();
    await waitFor(() => {
      render(
        <ProductFilters
          filters={{ priceMin: 0, priceMax: 1000 }}
          onChange={onChange}
          onApply={jest.fn()}
          onReset={jest.fn()}
        />
      );
    });
    // Simulate changing min price
    const minInput = screen.getByPlaceholderText("₹0");
    fireEvent.change(minInput, { target: { value: "500" } });
    expect(onChange).toHaveBeenCalled();
  });
});
