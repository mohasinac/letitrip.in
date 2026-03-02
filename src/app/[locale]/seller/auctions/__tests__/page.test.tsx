import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import SellerAuctionsPage from "../page";

jest.mock("@/features/seller", () => ({
  SellerAuctionsView: () => <div data-testid="seller-auctions-view" />,
}));

jest.mock("@/components", () => ({
  AdminPageHeader: ({ title, subtitle }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  ),
}));

describe("SellerAuctionsPage", () => {
  it("renders page header with correct title", () => {
    render(<SellerAuctionsPage />);
    expect(screen.getByText("My Auctions")).toBeInTheDocument();
  });

  it("renders SellerAuctionsView", () => {
    render(<SellerAuctionsPage />);
    expect(screen.getByTestId("seller-auctions-view")).toBeInTheDocument();
  });
});
