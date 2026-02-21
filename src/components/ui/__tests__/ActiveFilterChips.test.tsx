/**
 * ActiveFilterChips Tests — Phase 2
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

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
      },
      borderRadius: { lg: "rounded-lg", full: "rounded-full" },
      spacing: { padding: { xs: "p-1" } },
    },
  };
});

import { ActiveFilterChips } from "../ActiveFilterChips";

const FILTERS = [
  { key: "status", label: "Status", value: "Active" },
  { key: "role", label: "Role", value: "Seller" },
];

describe("ActiveFilterChips", () => {
  it("renders one chip per filter", () => {
    render(
      <ActiveFilterChips
        filters={FILTERS}
        onRemove={jest.fn()}
        onClearAll={jest.fn()}
      />,
    );
    expect(screen.getByText(/Status:/i)).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText(/Role:/i)).toBeInTheDocument();
    expect(screen.getByText("Seller")).toBeInTheDocument();
  });

  it("chip × button calls onRemove(key) with correct key", () => {
    const onRemove = jest.fn();
    render(
      <ActiveFilterChips
        filters={FILTERS}
        onRemove={onRemove}
        onClearAll={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Remove Status: Active filter"));
    expect(onRemove).toHaveBeenCalledWith("status");
  });

  it('"Clear all" button calls onClearAll', () => {
    const onClearAll = jest.fn();
    render(
      <ActiveFilterChips
        filters={FILTERS}
        onRemove={jest.fn()}
        onClearAll={onClearAll}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /clear all/i }));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it("returns null when filters is empty", () => {
    const { container } = render(
      <ActiveFilterChips
        filters={[]}
        onRemove={jest.fn()}
        onClearAll={jest.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});
