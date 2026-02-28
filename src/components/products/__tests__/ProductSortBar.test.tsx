import React from "react";
import { render, screen } from "@testing-library/react";
import { ProductSortBar } from "../ProductSortBar";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params) return JSON.stringify({ key, ...params });
    return key;
  },
}));

const defaultProps = {
  total: 50,
  showing: 12,
  sort: "newest",
  onSortChange: jest.fn(),
};

describe("ProductSortBar", () => {
  it("renders sort by label", () => {
    render(<ProductSortBar {...defaultProps} />);
    expect(screen.getByText("sortBy")).toBeInTheDocument();
  });

  it("renders showing count with params", () => {
    render(<ProductSortBar {...defaultProps} />);
    const showingText = screen.getByText(/showing/i);
    expect(showingText).toBeInTheDocument();
  });

  it("renders sort dropdown options", () => {
    render(<ProductSortBar {...defaultProps} />);
    // The select should be present
    const select = document.querySelector("select");
    expect(select).toBeInTheDocument();
  });

  it("renders without crashing when total is 0", () => {
    render(<ProductSortBar {...defaultProps} total={0} showing={0} />);
    expect(screen.getByText("sortBy")).toBeInTheDocument();
  });
});
