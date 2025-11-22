import { render, screen, fireEvent } from "@testing-library/react";
import AdminProductsPage from "./page";

describe("AdminProductsPage", () => {
  it("renders product moderation table", () => {
    render(<AdminProductsPage />);
    expect(screen.getByText(/Product Moderation/i)).toBeInTheDocument();
    expect(screen.getByText(/Product Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Status/i)).toBeInTheDocument();
  });

  it("filters products by status", () => {
    render(<AdminProductsPage />);
    fireEvent.change(screen.getByLabelText(/Status/i), {
      target: { value: "active" },
    });
    expect(screen.getByText(/Active/i)).toBeInTheDocument();
  });
});
