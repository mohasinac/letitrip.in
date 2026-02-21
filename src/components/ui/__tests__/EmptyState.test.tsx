import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "@/components";
import { Package } from "lucide-react";

describe("EmptyState Component", () => {
  it("renders title", () => {
    render(<EmptyState title="Nothing here yet" />);
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <EmptyState title="Empty" description="Try adjusting your filters" />,
    );
    expect(screen.getByText("Try adjusting your filters")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    render(<EmptyState title="Empty" />);
    expect(
      screen.queryByText("Try adjusting your filters"),
    ).not.toBeInTheDocument();
  });

  it("renders icon slot when provided", () => {
    render(
      <EmptyState title="Empty" icon={<Package data-testid="empty-icon" />} />,
    );
    expect(screen.getByTestId("empty-icon")).toBeInTheDocument();
  });

  it("does not render icon slot when not provided", () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByTestId("empty-icon")).not.toBeInTheDocument();
  });

  it("renders action button and calls onAction", () => {
    const onAction = jest.fn();
    render(
      <EmptyState
        title="Empty"
        actionLabel="Start shopping"
        onAction={onAction}
      />,
    );
    const btn = screen.getByRole("button", { name: "Start shopping" });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("does not render button when neither onAction nor actionHref is provided", () => {
    render(<EmptyState title="Empty" actionLabel="Browse" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders link when actionHref is provided", () => {
    render(
      <EmptyState
        title="Empty"
        actionLabel="Browse products"
        actionHref="/products"
      />,
    );
    const link = screen.getByRole("link", { name: /browse products/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/products");
  });

  it("prefers actionHref link over onAction callback when both provided", () => {
    const onAction = jest.fn();
    render(
      <EmptyState
        title="Empty"
        actionLabel="Go"
        actionHref="/products"
        onAction={onAction}
      />,
    );
    // Link should render, button should NOT
    expect(screen.getByRole("link")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <EmptyState title="Empty" className="my-custom-class" />,
    );
    expect(container.firstChild).toHaveClass("my-custom-class");
  });
});
