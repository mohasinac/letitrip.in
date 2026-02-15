import { render, screen } from "@testing-library/react";
import type React from "react";
import { ProfileStatsGrid } from "@/components";

describe("ProfileStatsGrid", () => {
  it("renders three stat cards", () => {
    render(
      <ProfileStatsGrid stats={{ orders: 1, wishlist: 2, addresses: 3 }} />,
    );

    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Wishlist")).toBeInTheDocument();
    expect(screen.getByText("Addresses")).toBeInTheDocument();
  });
});
