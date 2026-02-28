import React from "react";
import { render, screen } from "@testing-library/react";
import { ProductFilters } from "../ProductFilters";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const defaultProps = {
  category: "",
  categories: ["Trekking", "Camping"],
  minPrice: "",
  maxPrice: "",
  onCategoryChange: jest.fn(),
  onMinPriceChange: jest.fn(),
  onMaxPriceChange: jest.fn(),
  onClear: jest.fn(),
  hasActiveFilters: false,
};

describe("ProductFilters", () => {
  it("renders filters heading", () => {
    render(<ProductFilters {...defaultProps} />);
    expect(screen.getByText("filters")).toBeInTheDocument();
  });

  it("renders price range label", () => {
    render(<ProductFilters {...defaultProps} />);
    expect(screen.getByText("filterPriceRange")).toBeInTheDocument();
  });

  it("shows clearFilters button when hasActiveFilters is true", () => {
    render(<ProductFilters {...defaultProps} hasActiveFilters />);
    expect(screen.getByText("clearFilters")).toBeInTheDocument();
  });

  it("does not show clearFilters button when no active filters", () => {
    render(<ProductFilters {...defaultProps} hasActiveFilters={false} />);
    expect(screen.queryByText("clearFilters")).not.toBeInTheDocument();
  });

  it("renders category filter section", () => {
    render(<ProductFilters {...defaultProps} />);
    expect(screen.getByText("filterCategory")).toBeInTheDocument();
  });
});
