/**
 * QuickLink Component - Comprehensive Tests
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Plus } from "lucide-react";
import { QuickLink } from "../QuickLink";

describe("QuickLink", () => {
  const defaultProps = {
    label: "Add Product",
    href: "/products/new",
    icon: Plus,
  };

  it("should render with required props", () => {
    render(<QuickLink {...defaultProps} />);
    expect(screen.getByText("Add Product")).toBeInTheDocument();
  });

  it("should render as link", () => {
    render(<QuickLink {...defaultProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/products/new");
  });

  it("should render icon", () => {
    const { container } = render(<QuickLink {...defaultProps} />);
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should apply hover styles", () => {
    render(<QuickLink {...defaultProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("hover:shadow-md", "hover:border-yellow-200");
  });

  it("should handle empty label", () => {
    render(<QuickLink {...defaultProps} label="" />);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
  });

  it("should handle special characters in label", () => {
    render(<QuickLink {...defaultProps} label="<Test & Label>" />);
    expect(screen.getByText("<Test & Label>")).toBeInTheDocument();
  });

  it("should match snapshot", () => {
    const { container } = render(<QuickLink {...defaultProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
