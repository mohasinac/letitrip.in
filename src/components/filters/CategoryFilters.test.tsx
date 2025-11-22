import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategoryFilters } from "./CategoryFilters";

describe("CategoryFilters", () => {
  it("renders filter checkboxes and header", () => {
    const filters = { featured: true, homepage: false };
    render(
      <CategoryFilters
        filters={filters}
        onChange={jest.fn()}
        onApply={jest.fn()}
        onReset={jest.fn()}
      />
    );
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("Category Features")).toBeInTheDocument();
    expect(screen.getByText("Featured Only")).toBeInTheDocument();
    expect(screen.getByText("Homepage Only")).toBeInTheDocument();
  });

  it("calls onChange when checkboxes are toggled", () => {
    const onChange = jest.fn();
    render(
      <CategoryFilters
        filters={{ featured: false, homepage: false }}
        onChange={onChange}
        onApply={jest.fn()}
        onReset={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText("Featured Only"));
    expect(onChange).toHaveBeenCalledWith({ featured: true, homepage: false });
    fireEvent.click(screen.getByText("Homepage Only"));
    expect(onChange).toHaveBeenCalledWith({ featured: false, homepage: true });
  });

  it("shows clear all button when filters are active", () => {
    render(
      <CategoryFilters
        filters={{ featured: true }}
        onChange={jest.fn()}
        onApply={jest.fn()}
        onReset={jest.fn()}
      />
    );
    expect(screen.getByText("Clear All")).toBeInTheDocument();
  });
});
