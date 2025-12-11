/**
 * StatCard Component - Comprehensive Tests
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Package } from "lucide-react";
import { StatCard } from "../StatCard";

describe("StatCard", () => {
  const defaultProps = {
    title: "Total Products",
    value: 1234,
    icon: Package,
    color: "blue",
    href: "/products",
  };

  it("should render with required props", () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText("Total Products")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
  });

  it("should format number values with locale string", () => {
    render(<StatCard {...defaultProps} value={1234567} />);
    expect(screen.getByText("1,234,567")).toBeInTheDocument();
  });

  it("should render string values as-is", () => {
    render(<StatCard {...defaultProps} value="$1.2M" />);
    expect(screen.getByText("$1.2M")).toBeInTheDocument();
  });

  it("should render with change and trend up", () => {
    render(<StatCard {...defaultProps} change={15} trend="up" />);
    expect(screen.getByText("15%")).toBeInTheDocument();
  });

  it("should render with change and trend down", () => {
    render(<StatCard {...defaultProps} change={10} trend="down" />);
    expect(screen.getByText("10%")).toBeInTheDocument();
  });

  it("should not render change when undefined", () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.queryByText("%")).not.toBeInTheDocument();
  });

  it("should not render change when change is 0", () => {
    render(<StatCard {...defaultProps} change={0} />);
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });

  it("should not render change when change is negative", () => {
    render(<StatCard {...defaultProps} change={-5} />);
    expect(screen.queryByText("-5%")).not.toBeInTheDocument();
  });

  it("should render as link with href", () => {
    render(<StatCard {...defaultProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/products");
  });

  it("should apply hover styles", () => {
    render(<StatCard {...defaultProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("hover:shadow-lg", "hover:border-yellow-200");
  });

  it("should render icon", () => {
    const { container } = render(<StatCard {...defaultProps} />);
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should handle zero value", () => {
    render(<StatCard {...defaultProps} value={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("should handle large numbers", () => {
    render(<StatCard {...defaultProps} value={999999999} />);
    expect(screen.getByText("999,999,999")).toBeInTheDocument();
  });

  it("should handle decimal change values", () => {
    render(<StatCard {...defaultProps} change={12.5} trend="up" />);
    expect(screen.getByText("12.5%")).toBeInTheDocument();
  });

  it("should match snapshot", () => {
    const { container } = render(
      <StatCard {...defaultProps} change={10} trend="up" />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
