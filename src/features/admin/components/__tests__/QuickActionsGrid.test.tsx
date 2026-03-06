/**
 * QuickActionsGrid tests
 * TASK-39: verifies UI_LABELS → useTranslations migration
 */
import { render, screen } from "@testing-library/react";
import type React from "react";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

import { QuickActionsGrid } from "../QuickActionsGrid";

describe("QuickActionsGrid", () => {
  it("renders the quickActions heading", () => {
    render(<QuickActionsGrid />);
    expect(screen.getByText("quickActions")).toBeInTheDocument();
  });

  it("renders manageUsers action button", () => {
    render(<QuickActionsGrid />);
    expect(screen.getByText("manageUsers")).toBeInTheDocument();
  });

  it("renders reviewDisabled action button", () => {
    render(<QuickActionsGrid />);
    expect(screen.getByText("reviewDisabled")).toBeInTheDocument();
  });

  it("renders manageContent action button", () => {
    render(<QuickActionsGrid />);
    expect(screen.getByText("manageContent")).toBeInTheDocument();
  });

  it("renders 3 action links", () => {
    render(<QuickActionsGrid />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(3);
  });
});

