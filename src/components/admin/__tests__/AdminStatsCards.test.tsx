import { render, screen } from "@testing-library/react";
import type React from "react";
import { AdminStatsCards } from "@/components";

describe("AdminStatsCards", () => {
  it("renders all stat cards", () => {
    render(
      <AdminStatsCards
        stats={{
          users: { total: 10, active: 8, new: 2, disabled: 0 },
          products: { total: 5 },
          orders: { total: 3 },
        }}
      />,
    );

    const headings = screen.getAllByRole("heading");
    expect(headings.length).toBe(6);
  });
});
