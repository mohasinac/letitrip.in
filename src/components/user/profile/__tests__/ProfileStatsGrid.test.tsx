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

  it("renders stat values via Text component (renders as p)", () => {
    render(
      <ProfileStatsGrid stats={{ orders: 5, wishlist: 0, addresses: 2 }} />,
    );

    // Text renders numeric values as paragraph elements
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
