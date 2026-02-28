import { render, screen } from "@testing-library/react";
import type React from "react";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import { AdminStatsCards } from "@/components";

const defaultStats = {
  users: { total: 10, active: 8, new: 2, disabled: 0 },
  products: { total: 5 },
  orders: { total: 3 },
};

describe("AdminStatsCards", () => {
  it("renders all six stat cards with translation keys", () => {
    render(<AdminStatsCards stats={defaultStats} />);

    expect(screen.getByText("totalUsers")).toBeInTheDocument();
    expect(screen.getByText("activeUsers")).toBeInTheDocument();
    expect(screen.getByText("newUsers")).toBeInTheDocument();
    expect(screen.getByText("disabledUsers")).toBeInTheDocument();
    expect(screen.getByText("totalProducts")).toBeInTheDocument();
    expect(screen.getByText("totalOrders")).toBeInTheDocument();
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
