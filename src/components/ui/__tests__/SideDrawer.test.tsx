/**
 * SideDrawer Tests — Phase 2
 *
 * Tests the `side` prop and core ARIA/interaction behaviour.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock hooks used by SideDrawer
jest.mock("@/hooks", () => ({
  useSwipe: jest.fn(),
  useUnsavedChanges: jest.fn(),
}));

jest.mock("@/constants", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ui = require("../../../constants/ui");
  return {
    UI_LABELS: ui.UI_LABELS,
    THEME_CONSTANTS: {
      themed: {
        border: "border-gray-200 dark:border-gray-700",
        textPrimary: "text-gray-900 dark:text-white",
        textSecondary: "text-gray-600 dark:text-gray-400",
        bgPrimary: "bg-white dark:bg-gray-900",
        bgSecondary: "bg-gray-50 dark:bg-gray-800",
        hover: "hover:bg-gray-100 dark:hover:bg-gray-800",
        borderColor: "border-gray-200 dark:border-gray-700",
        divider: "divide-gray-200 dark:divide-gray-700",
      },
      borderRadius: { lg: "rounded-lg" },
      spacing: {
        padding: { lg: "p-6" },
        stack: "space-y-4",
      },
      container: { "2xl": "max-w-2xl" },
    },
  };
});

// Mock @/components to only provide Button and Heading
jest.mock("@/components", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
  Heading: ({ children }: { children: React.ReactNode; level?: number }) => (
    <div role="heading">{children}</div>
  ),
}));

import SideDrawer from "../SideDrawer";

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  title: "Test Drawer",
  children: <p>Content</p>,
};

describe("SideDrawer", () => {
  it("applies left-edge positioning when side='left'", () => {
    render(<SideDrawer {...defaultProps} side="left" />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("left-0");
  });

  it("applies right-edge positioning when side='right' (default)", () => {
    render(<SideDrawer {...defaultProps} side="right" />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("right-0");
  });

  it("defaults to right-edge when side prop is omitted", () => {
    render(<SideDrawer {...defaultProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("right-0");
  });

  it("has aria-modal='true' on the dialog element", () => {
    render(<SideDrawer {...defaultProps} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("Escape keydown triggers onClose", () => {
    const onClose = jest.fn();
    render(<SideDrawer {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("returns null when isOpen=false", () => {
    const { container } = render(
      <SideDrawer {...defaultProps} isOpen={false} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
