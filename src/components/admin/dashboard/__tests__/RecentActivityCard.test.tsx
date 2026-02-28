/**
 * RecentActivityCard tests
 * TASK-39: verifies UI_LABELS → useTranslations migration
 */
import { render, screen } from "@testing-library/react";
import type React from "react";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params) return `${key}(${JSON.stringify(params)})`;
    return key;
  },
}));

import { RecentActivityCard } from "../RecentActivityCard";

const defaultStats = {
  users: { total: 100, active: 80, new: 5, disabled: 2 },
  products: { total: 50 },
  orders: { total: 30 },
};

const noNewUsersStats = {
  users: { total: 100, active: 80, new: 0, disabled: 2 },
  products: { total: 50 },
  orders: { total: 30 },
};

describe("RecentActivityCard", () => {
  it("renders recentActivity heading", () => {
    render(<RecentActivityCard stats={defaultStats} />);
    expect(screen.getByText("recentActivity")).toBeInTheDocument();
  });

  it("renders systemStatus label", () => {
    render(<RecentActivityCard stats={defaultStats} />);
    expect(screen.getByText("systemStatus")).toBeInTheDocument();
  });

  it("renders allSystemsOperational label", () => {
    render(<RecentActivityCard stats={defaultStats} />);
    expect(screen.getByText("allSystemsOperational")).toBeInTheDocument();
  });

  it("renders newUsers section when new > 0", () => {
    render(<RecentActivityCard stats={defaultStats} />);
    expect(screen.getByText("newUsers")).toBeInTheDocument();
  });

  it("does not render newUsers section when new === 0", () => {
    render(<RecentActivityCard stats={noNewUsersStats} />);
    expect(screen.queryByText("newUsers")).not.toBeInTheDocument();
  });

  it("renders newUsersRegistered interpolated message", () => {
    render(<RecentActivityCard stats={defaultStats} />);
    expect(
      screen.getByText('newUsersRegistered({"count":5})'),
    ).toBeInTheDocument();
  });
});
