/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import { EventStatsBanner } from "../EventStatsBanner";

jest.mock("@/components", () => ({
  Card: ({ children }: any) => <div data-testid="stat-card">{children}</div>,
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: { textSecondary: "text-gray-600" },
    spacing: { gap: { md: "gap-4" } },
  },
}));

describe("EventStatsBanner", () => {
  const defaultProps = {
    totalEntries: 100,
    approvedEntries: 70,
    flaggedEntries: 10,
    pendingEntries: 20,
  };

  it("renders without crashing", () => {
    expect(() => render(<EventStatsBanner {...defaultProps} />)).not.toThrow();
  });

  it("renders total entries count", () => {
    render(<EventStatsBanner {...defaultProps} />);
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("renders approved entries count", () => {
    render(<EventStatsBanner {...defaultProps} />);
    expect(screen.getByText("70")).toBeInTheDocument();
  });

  it("renders pending entries count", () => {
    render(<EventStatsBanner {...defaultProps} />);
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("renders four stat cards", () => {
    render(<EventStatsBanner {...defaultProps} />);
    expect(screen.getAllByTestId("stat-card")).toHaveLength(4);
  });
});
