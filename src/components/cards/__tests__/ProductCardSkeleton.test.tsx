/**
 * ProductCardSkeleton Component - Comprehensive Tests
 */

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { ProductCardSkeleton } from "../../cards/ProductCardSkeleton";

describe("ProductCardSkeleton", () => {
  it("should render with default props", () => {
    const { container } = render(<ProductCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should render with showShopName=true by default", () => {
    const { container } = render(<ProductCardSkeleton />);
    // Check for shop name skeleton (h-3 element)
    const shopSkeleton = container.querySelector(".h-3");
    expect(shopSkeleton).toBeInTheDocument();
  });

  it("should not show shop name when showShopName=false", () => {
    const { container } = render(<ProductCardSkeleton showShopName={false} />);
    const skeletons = container.querySelectorAll(".h-3");
    // Should have fewer h-3 elements without shop name
    expect(skeletons.length).toBeLessThan(3);
  });

  it("should render compact variant", () => {
    const { container } = render(<ProductCardSkeleton compact />);
    // Compact uses p-3 instead of p-4
    const content = container.querySelector(".p-3");
    expect(content).toBeInTheDocument();
  });

  it("should not render rating in compact mode", () => {
    const { container } = render(<ProductCardSkeleton compact />);
    // Rating has h-4 w-4 skeleton
    const ratingSkeletons = container.querySelectorAll(".h-4.w-4");
    expect(ratingSkeletons.length).toBe(0);
  });

  it("should render rating in non-compact mode", () => {
    const { container } = render(<ProductCardSkeleton compact={false} />);
    const ratingSkeletons = container.querySelectorAll(".h-4");
    expect(ratingSkeletons.length).toBeGreaterThan(0);
  });

  it("should have animate-pulse class", () => {
    const { container } = render(<ProductCardSkeleton />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });

  it("should render image skeleton with aspect-square", () => {
    const { container } = render(<ProductCardSkeleton />);
    expect(container.querySelector(".aspect-square")).toBeInTheDocument();
  });

  it("should match snapshot - default", () => {
    const { container } = render(<ProductCardSkeleton />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should match snapshot - compact", () => {
    const { container } = render(<ProductCardSkeleton compact />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should match snapshot - without shop name", () => {
    const { container } = render(<ProductCardSkeleton showShopName={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
