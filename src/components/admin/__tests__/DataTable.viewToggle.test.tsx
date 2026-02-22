/**
 * DataTable View Toggle Tests — Phase 2
 *
 * Tests showViewToggle, viewMode, defaultViewMode, onViewModeChange, mobileCardRender.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@/constants", () => {
  const ui = require("../../../constants/ui");
  return {
    UI_LABELS: ui.UI_LABELS,
    THEME_CONSTANTS: {
      themed: {
        border: "border-gray-200",
        borderColor: "border-gray-200",
        textPrimary: "text-gray-900",
        textSecondary: "text-gray-600",
        bgPrimary: "bg-white",
        bgSecondary: "bg-gray-50",
        bgTertiary: "bg-gray-100",
        hover: "hover:bg-gray-50",
        hoverCard: "hover:bg-gray-50",
        divider: "divide-gray-200",
      },
      borderRadius: { lg: "rounded-lg" },
      spacing: { stack: "space-y-4", gap: { md: "gap-4" } },
    },
  };
});

jest.mock("@/components", () => ({
  Spinner: ({ label }: { label: string }) => <div>{label}</div>,
  Pagination: () => <nav aria-label="Pagination" />,
}));

import { DataTable } from "../DataTable";

interface Item {
  id: string;
  name: string;
}

const COLUMNS = [{ key: "name", header: "Name" }];
const DATA: Item[] = [
  { id: "1", name: "Alpha" },
  { id: "2", name: "Beta" },
];
const CARD_RENDER = (item: Item) => (
  <div data-testid={`card-${item.id}`}>{item.name} Card</div>
);

describe("DataTable — view toggle", () => {
  it("showViewToggle=false → no toggle icons rendered (default)", () => {
    render(
      <DataTable
        data={DATA}
        columns={COLUMNS}
        keyExtractor={(i) => i.id}
        showViewToggle={false}
      />,
    );
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });

  it("showViewToggle=true → toolbar with toggle buttons visible", () => {
    render(
      <DataTable
        data={DATA}
        columns={COLUMNS}
        keyExtractor={(i) => i.id}
        showViewToggle
        mobileCardRender={CARD_RENDER}
      />,
    );
    const toolbar = screen.getByRole("toolbar", { name: /view mode/i });
    expect(toolbar).toBeInTheDocument();
    // Aria labels use UI_LABELS.ADMIN.GRID_VIEW = "Grid" and LIST_VIEW = "List"
    expect(screen.getByLabelText(/^grid$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^list$/i)).toBeInTheDocument();
  });

  it("clicking grid icon calls onViewModeChange('grid')", () => {
    const onChange = jest.fn();
    render(
      <DataTable
        data={DATA}
        columns={COLUMNS}
        keyExtractor={(i) => i.id}
        showViewToggle
        onViewModeChange={onChange}
        mobileCardRender={CARD_RENDER}
      />,
    );
    fireEvent.click(screen.getByLabelText(/^grid$/i));
    expect(onChange).toHaveBeenCalledWith("grid");
  });

  it("clicking list icon calls onViewModeChange('list')", () => {
    const onChange = jest.fn();
    render(
      <DataTable
        data={DATA}
        columns={COLUMNS}
        keyExtractor={(i) => i.id}
        showViewToggle
        onViewModeChange={onChange}
        mobileCardRender={CARD_RENDER}
      />,
    );
    fireEvent.click(screen.getByLabelText(/^list$/i));
    expect(onChange).toHaveBeenCalledWith("list");
  });

  it("clicking list icon renders mobileCardRender output per item", () => {
    render(
      <DataTable
        data={DATA}
        columns={COLUMNS}
        keyExtractor={(i) => i.id}
        showViewToggle
        defaultViewMode="list"
        mobileCardRender={CARD_RENDER}
      />,
    );
    expect(screen.getByTestId("card-1")).toBeInTheDocument();
    expect(screen.getByTestId("card-2")).toBeInTheDocument();
  });

  it("defaultViewMode='grid' starts in grid mode (uncontrolled)", () => {
    render(
      <DataTable
        data={DATA}
        columns={COLUMNS}
        keyExtractor={(i) => i.id}
        showViewToggle
        defaultViewMode="grid"
        mobileCardRender={CARD_RENDER}
      />,
    );
    expect(screen.getByTestId("card-1")).toBeInTheDocument();
  });

  it("controlled viewMode: renders grid cards when viewMode='grid'", () => {
    render(
      <DataTable
        data={DATA}
        columns={COLUMNS}
        keyExtractor={(i) => i.id}
        showViewToggle
        viewMode="grid"
        mobileCardRender={CARD_RENDER}
      />,
    );
    expect(screen.getByTestId("card-1")).toBeInTheDocument();
    expect(screen.getByTestId("card-2")).toBeInTheDocument();
  });

  it("active toggle icon has aria-pressed=true", () => {
    render(
      <DataTable
        data={DATA}
        columns={COLUMNS}
        keyExtractor={(i) => i.id}
        showViewToggle
        viewMode="grid"
        mobileCardRender={CARD_RENDER}
      />,
    );
    const gridBtn = screen.getByLabelText(/^grid$/i);
    expect(gridBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("toggle icons are <button> elements with aria-label and aria-pressed", () => {
    render(
      <DataTable
        data={DATA}
        columns={COLUMNS}
        keyExtractor={(i) => i.id}
        showViewToggle
        mobileCardRender={CARD_RENDER}
      />,
    );
    // Aria labels come from UI_LABELS.ADMIN (Grid/List from constants)
    [/^grid$/i, /^list$/i].forEach((labelRegex) => {
      const btn = screen.getByLabelText(labelRegex);
      expect(btn.tagName).toBe("BUTTON");
      expect(btn).toHaveAttribute("aria-pressed");
    });
  });

  it("mobileCardRender without showViewToggle: original CSS mobile-card behaviour unchanged", () => {
    const { container } = render(
      <DataTable
        data={DATA}
        columns={COLUMNS}
        keyExtractor={(i) => i.id}
        mobileCardRender={CARD_RENDER}
      />,
    );
    // The mobile card wrapper has class "md:hidden"
    const mobileWrapper = container.querySelector(".md\\:hidden");
    expect(mobileWrapper).toBeInTheDocument();
    // No view toggle toolbar
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });
});
