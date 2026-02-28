import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@/features/seller", () => ({
  SellerDashboardView: () => <div data-testid="seller-dashboard-view" />,
}));

import SellerDashboardPage from "../page";

describe("SellerDashboardPage (thin shell)", () => {
  it("renders SellerDashboardView", () => {
    render(<SellerDashboardPage />);
    expect(screen.getByTestId("seller-dashboard-view")).toBeInTheDocument();
  });
});
