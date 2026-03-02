import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type React from "react";
import SellerStorePage from "../page";

jest.mock("@/features/seller", () => ({
  SellerStoreView: () => <div data-testid="seller-store-view" />,
}));

jest.mock("@/components", () => ({
  AdminPageHeader: ({ title, subtitle }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  ),
}));

describe("SellerStorePage", () => {
  it("renders page header with correct title", () => {
    render(<SellerStorePage />);
    expect(screen.getByText("Store Settings")).toBeInTheDocument();
  });

  it("renders SellerStoreView", () => {
    render(<SellerStorePage />);
    expect(screen.getByTestId("seller-store-view")).toBeInTheDocument();
  });
});
