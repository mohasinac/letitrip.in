/**
 * CategoryCardSkeleton Component - Comprehensive Tests
 */

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { CategoryCardSkeleton } from "../../cards/CategoryCardSkeleton";

describe("CategoryCardSkeleton", () => {
  it("should render with default variant", () => {
    const { container } = render(<CategoryCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.querySelector(".aspect-\\[4\\/3\\]")).toBeInTheDocument();
  });

  it("should render compact variant", () => {
    const { container } = render(<CategoryCardSkeleton variant="compact" />);
    expect(container.querySelector(".aspect-square")).toBeInTheDocument();
  });

  it("should render large variant", () => {
    const { container } = render(<CategoryCardSkeleton variant="large" />);
    expect(container.querySelector(".aspect-\\[16\\/9\\]")).toBeInTheDocument();
  });

  it("should have animate-pulse class", () => {
    const { container } = render(<CategoryCardSkeleton />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });

  it("should not show parent category in compact variant", () => {
    const { container } = render(<CategoryCardSkeleton variant="compact" />);
    const skeletons = container.querySelectorAll(".h-3");
    // Compact should have fewer skeleton elements
    expect(skeletons.length).toBeLessThan(5);
  });

  it("should show description in large variant", () => {
    const { container } = render(<CategoryCardSkeleton variant="large" />);
    const skeletons = container.querySelectorAll(".h-3");
    // Large should have more skeleton elements including description
    expect(skeletons.length).toBeGreaterThan(2);
  });

  it("should match snapshot - default", () => {
    const { container } = render(<CategoryCardSkeleton />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should match snapshot - compact", () => {
    const { container } = render(<CategoryCardSkeleton variant="compact" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should match snapshot - large", () => {
    const { container } = render(<CategoryCardSkeleton variant="large" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
