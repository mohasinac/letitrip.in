import { render, screen } from "@testing-library/react";
import type React from "react";
import { AdminStatsCards } from "@/components";
import { UI_LABELS } from "@/constants";

describe("AdminStatsCards", () => {
  it("renders all six stat cards with correct labels", () => {
    render(
      <AdminStatsCards
        stats={{
          users: { total: 10, active: 8, new: 2, disabled: 0 },
          products: { total: 5 },
          orders: { total: 3 },
        }}
      />,
    );

    expect(
      screen.getByText(UI_LABELS.ADMIN.STATS.TOTAL_USERS),
    ).toBeInTheDocument();
    expect(
      screen.getByText(UI_LABELS.ADMIN.STATS.ACTIVE_USERS),
    ).toBeInTheDocument();
    expect(
      screen.getByText(UI_LABELS.ADMIN.STATS.NEW_USERS),
    ).toBeInTheDocument();
    expect(
      screen.getByText(UI_LABELS.ADMIN.STATS.DISABLED_USERS),
    ).toBeInTheDocument();
    expect(
      screen.getByText(UI_LABELS.ADMIN.STATS.TOTAL_PRODUCTS),
    ).toBeInTheDocument();
    expect(
      screen.getByText(UI_LABELS.ADMIN.STATS.TOTAL_ORDERS),
    ).toBeInTheDocument();
  });

  it("renders stat values correctly", () => {
    render(
      <AdminStatsCards
        stats={{
          users: { total: 42, active: 38, new: 5, disabled: 1 },
          products: { total: 99 },
          orders: { total: 17 },
        }}
      />,
    );

    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("38")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("99")).toBeInTheDocument();
    expect(screen.getByText("17")).toBeInTheDocument();
  });
});
