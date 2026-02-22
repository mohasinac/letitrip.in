/**
 * TablePagination Tests — Phase 2
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
        textPrimary: "text-gray-900",
        textSecondary: "text-gray-600",
        bgSecondary: "bg-gray-50",
      },
      spacing: { padding: { md: "p-3" } },
      input: { base: "border rounded-lg px-3 py-2" },
    },
  };
});

// Mock Pagination to avoid deep rendering
jest.mock("@/components", () => ({
  Pagination: ({
    currentPage,
    totalPages,
    onPageChange,
    disabled,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (p: number) => void;
    disabled?: boolean;
  }) => (
    <nav aria-label="Pagination" data-disabled={disabled}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || disabled}
      >
        Prev
      </button>
      <span>
        {currentPage}/{totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || disabled}
      >
        Next
      </button>
    </nav>
  ),
}));

import { TablePagination } from "../TablePagination";

describe("TablePagination", () => {
  it("shows correct 'Showing X–Y of Z results' text", () => {
    render(
      <TablePagination
        currentPage={2}
        totalPages={10}
        pageSize={25}
        total={243}
        onPageChange={jest.fn()}
      />,
    );
    // Page 2, pageSize 25 → from=26, to=50
    expect(screen.getByText("26–50")).toBeInTheDocument();
    expect(screen.getByText("243")).toBeInTheDocument();
    // "results" is in the paragraph text flow — check with regex
    expect(screen.getByText(/results/i)).toBeInTheDocument();
  });

  it("shows 0–0 when total is 0", () => {
    render(
      <TablePagination
        currentPage={1}
        totalPages={0}
        pageSize={25}
        total={0}
        onPageChange={jest.fn()}
      />,
    );
    expect(screen.getByText("0–0")).toBeInTheDocument();
  });

  it("onPageChange called with correct page on navigation", () => {
    const onPageChange = jest.fn();
    render(
      <TablePagination
        currentPage={3}
        totalPages={10}
        pageSize={25}
        total={243}
        onPageChange={onPageChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("onPageSizeChange called when per-page selector changes", () => {
    const onPageSizeChange = jest.fn();
    render(
      <TablePagination
        currentPage={1}
        totalPages={5}
        pageSize={25}
        total={100}
        onPageChange={jest.fn()}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "50" } });
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it("Prev/next disabled when isLoading=true", () => {
    render(
      <TablePagination
        currentPage={3}
        totalPages={10}
        pageSize={25}
        total={243}
        onPageChange={jest.fn()}
        isLoading
      />,
    );
    // Multiple navigation elements exist (wrapper + Pagination mock);
    // find the inner Pagination mock nav which has data-disabled attr
    const navs = screen.getAllByRole("navigation", { name: /pagination/i });
    const disabledNav = navs.find((n) => n.hasAttribute("data-disabled"));
    expect(disabledNav).toBeDefined();
    expect(disabledNav).toHaveAttribute("data-disabled", "true");
  });
});
