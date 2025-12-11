/**
 * AuctionCardSkeleton Component - Comprehensive Tests
 */

import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import AuctionCardSkeleton from "../../cards/AuctionCardSkeleton";

describe("AuctionCardSkeleton", () => {
  it("should render without props", () => {
    const { container } = render(<AuctionCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should have animate-pulse class", () => {
    const { container } = render(<AuctionCardSkeleton />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });

  it("should render image skeleton", () => {
    const { container } = render(<AuctionCardSkeleton />);
    const imageSkeleton = container.querySelector(".aspect-square");
    expect(imageSkeleton).toBeInTheDocument();
  });

  it("should render content skeleton elements", () => {
    const { container } = render(<AuctionCardSkeleton />);
    const skeletons = container.querySelectorAll(".bg-gray-200");
    expect(skeletons.length).toBeGreaterThan(5);
  });

  it("should match snapshot", () => {
    const { container } = render(<AuctionCardSkeleton />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
