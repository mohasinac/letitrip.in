import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SellerAddProductPage from "../page";

jest.mock("@/features/seller", () => ({
  SellerCreateProductView: () => (
    <div data-testid="seller-create-product-view">SellerCreateProductView</div>
  ),
}));

describe("SellerAddProductPage", () => {
  it("renders SellerCreateProductView", () => {
    render(<SellerAddProductPage />);
    expect(
      screen.getByTestId("seller-create-product-view"),
    ).toBeInTheDocument();
  });
});
