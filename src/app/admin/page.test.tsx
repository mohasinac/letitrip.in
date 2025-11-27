import { render, screen } from "@testing-library/react";
import AdminDashboardPage from "./page";

describe("AdminDashboardPage", () => {
  it.skip("renders loading spinner when loading", () => {
    // Simulate loading state
    jest
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [null, jest.fn()])
      .mockImplementationOnce(() => [true, jest.fn()]);
    render(<AdminDashboardPage />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it.skip("renders dashboard stats after loading", async () => {
    render(<AdminDashboardPage />);
    // Should show stats labels
    expect(screen.getByText(/Total Users/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Sellers/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Shops/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Categories/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Products/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Orders/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Users/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Orders/i)).toBeInTheDocument();
  });
});
