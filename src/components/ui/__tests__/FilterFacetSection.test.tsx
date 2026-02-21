/**
 * FilterFacetSection Tests — Phase 2
 *
 * Verifies option rendering, search, pagination (load more), selection,
 * and ARIA compliance.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock @/constants barrel to avoid rbac → sieve ESM chain
jest.mock("@/constants", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ui = require("../../../constants/ui");
  return {
    UI_LABELS: ui.UI_LABELS,
    THEME_CONSTANTS: {
      themed: {
        border: "border-gray-200",
        textPrimary: "text-gray-900",
        textSecondary: "text-gray-600",
        bgSecondary: "bg-gray-50",
        hover: "hover:bg-gray-50",
        hoverCard: "hover:bg-gray-50",
      },
      borderRadius: {
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
      spacing: {
        padding: { xs: "p-1", md: "p-3", lg: "p-6" },
        gap: { md: "gap-4" },
        stack: "space-y-4",
      },
      badge: { active: "bg-emerald-100 text-emerald-800" },
      input: {
        base: "border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500",
      },
    },
  };
});

import { FilterFacetSection } from "../FilterFacetSection";

const makeOptions = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    value: `opt-${i}`,
    label: `Option ${i + 1}`,
    count: i * 2,
  }));

describe("FilterFacetSection", () => {
  it("renders up to pageSize options (default 10); remainder hidden", () => {
    render(
      <FilterFacetSection
        title="Category"
        options={makeOptions(15)}
        selected={[]}
        onChange={jest.fn()}
      />,
    );
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(10);
  });

  it('"Load 10 more" appends next batch without network fetch', () => {
    render(
      <FilterFacetSection
        title="Category"
        options={makeOptions(25)}
        selected={[]}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getAllByRole("checkbox")).toHaveLength(10);

    fireEvent.click(screen.getByRole("button", { name: /load/i }));
    expect(screen.getAllByRole("checkbox")).toHaveLength(20);
  });

  it("search input filters visible list in real time (client-side)", () => {
    render(
      <FilterFacetSection
        title="Category"
        options={[
          { value: "a", label: "Apple" },
          { value: "b", label: "Banana" },
          { value: "c", label: "Apricot" },
        ]}
        selected={[]}
        onChange={jest.fn()}
        pageSize={2} // fewer than options.length (3) so search input renders
      />,
    );
    const search = screen.getByPlaceholderText(/search category/i);
    fireEvent.change(search, { target: { value: "ap" } });

    expect(screen.getByLabelText("Apple")).toBeInTheDocument();
    expect(screen.getByLabelText("Apricot")).toBeInTheDocument();
    expect(screen.queryByLabelText("Banana")).not.toBeInTheDocument();
  });

  it("toggling an option calls onChange with new selection", () => {
    const handleChange = jest.fn();
    render(
      <FilterFacetSection
        title="Status"
        options={[{ value: "active", label: "Active" }]}
        selected={[]}
        onChange={handleChange}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(handleChange).toHaveBeenCalledWith(["active"]);
  });

  it("unchecking selected option removes it from selection", () => {
    const handleChange = jest.fn();
    render(
      <FilterFacetSection
        title="Status"
        options={[{ value: "active", label: "Active" }]}
        selected={["active"]}
        onChange={handleChange}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { checked: true }));
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it("ARIA: role=group present on the outer wrapper", () => {
    const { container } = render(
      <FilterFacetSection
        title="Color"
        options={[]}
        selected={[]}
        onChange={jest.fn()}
      />,
    );
    expect(container.querySelector('[role="group"]')).toBeInTheDocument();
  });

  it("ARIA: selected option has aria-checked=true", () => {
    render(
      <FilterFacetSection
        title="Status"
        options={[{ value: "active", label: "Active" }]}
        selected={["active"]}
        onChange={jest.fn()}
      />,
    );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });
});
