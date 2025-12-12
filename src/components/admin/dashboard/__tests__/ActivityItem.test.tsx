/**
 * ActivityItem Component - Comprehensive Tests
 */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { Package } from "lucide-react";
import { ActivityItem } from "../ActivityItem";

describe("ActivityItem", () => {
  const defaultProps = {
    id: "activity-1",
    type: "order",
    message: "New order received",
    time: "2 hours ago",
    status: "success" as const,
    icon: Package,
    color: "green",
  };

  it("should render with required props", () => {
    render(<ActivityItem {...defaultProps} />);
    expect(screen.getByText("New order received")).toBeInTheDocument();
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
  });

  it("should render icon", () => {
    const { container } = render(<ActivityItem {...defaultProps} />);
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should not render action button for success status", () => {
    render(<ActivityItem {...defaultProps} status="success" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should render Review button for warning status", () => {
    render(<ActivityItem {...defaultProps} status="warning" />);
    expect(screen.getByText("Review")).toBeInTheDocument();
  });

  it("should render View button for error status", () => {
    render(<ActivityItem {...defaultProps} status="error" />);
    expect(screen.getByText("View")).toBeInTheDocument();
  });

  it("should not render button for info status", () => {
    render(<ActivityItem {...defaultProps} status="info" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should call onAction when warning button clicked", () => {
    const mockOnAction = jest.fn();
    render(
      <ActivityItem
        {...defaultProps}
        status="warning"
        onAction={mockOnAction}
      />
    );
    fireEvent.click(screen.getByText("Review"));
    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });

  it("should call onAction when error button clicked", () => {
    const mockOnAction = jest.fn();
    render(
      <ActivityItem {...defaultProps} status="error" onAction={mockOnAction} />
    );
    fireEvent.click(screen.getByText("View"));
    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });

  it("should handle missing onAction gracefully", () => {
    render(<ActivityItem {...defaultProps} status="warning" />);
    const button = screen.getByText("Review");
    expect(() => fireEvent.click(button)).not.toThrow();
  });

  it("should handle long message", () => {
    const longMessage = "A".repeat(200);
    render(<ActivityItem {...defaultProps} message={longMessage} />);
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it("should handle special characters in message", () => {
    render(
      <ActivityItem {...defaultProps} message="<script>alert('xss')</script>" />
    );
    expect(
      screen.getByText("<script>alert('xss')</script>")
    ).toBeInTheDocument();
  });

  it("should match snapshot", () => {
    const { container } = render(
      <ActivityItem {...defaultProps} status="warning" onAction={() => {}} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
