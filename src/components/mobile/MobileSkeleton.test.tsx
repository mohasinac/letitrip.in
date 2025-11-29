import { render, screen } from "@testing-library/react";
import {
  MobileSkeleton,
  ProductCardSkeleton,
  OrderCardSkeleton,
  UserCardSkeleton,
  AddressCardSkeleton,
  DashboardStatSkeleton,
  ListSkeleton,
} from "./MobileSkeleton";

describe("MobileSkeleton", () => {
  it("renders with default props", () => {
    render(<MobileSkeleton />);
    const skeleton = screen.getByRole("progressbar");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-busy", "true");
  });

  it("applies pulse animation by default", () => {
    render(<MobileSkeleton />);
    expect(screen.getByRole("progressbar")).toHaveClass("animate-pulse");
  });

  it("applies wave animation when specified", () => {
    render(<MobileSkeleton animation="wave" />);
    expect(screen.getByRole("progressbar")).toHaveClass("animate-shimmer");
  });

  it("renders without animation when specified", () => {
    render(<MobileSkeleton animation="none" />);
    const skeleton = screen.getByRole("progressbar");
    expect(skeleton).not.toHaveClass("animate-pulse");
    expect(skeleton).not.toHaveClass("animate-shimmer");
  });

  it("applies circular variant", () => {
    render(<MobileSkeleton variant="circular" />);
    expect(screen.getByRole("progressbar")).toHaveClass("rounded-full");
  });

  it("applies rounded variant", () => {
    render(<MobileSkeleton variant="rounded" />);
    expect(screen.getByRole("progressbar")).toHaveClass("rounded-lg");
  });

  it("applies text variant", () => {
    render(<MobileSkeleton variant="text" />);
    expect(screen.getByRole("progressbar")).toHaveClass("rounded", "h-4");
  });

  it("applies custom width and height", () => {
    render(<MobileSkeleton width={100} height={50} />);
    const skeleton = screen.getByRole("progressbar");
    expect(skeleton).toHaveStyle({ width: "100px", height: "50px" });
  });

  it("applies custom className", () => {
    render(<MobileSkeleton className="custom-class" />);
    expect(screen.getByRole("progressbar")).toHaveClass("custom-class");
  });
});

describe("ProductCardSkeleton", () => {
  it("renders product card skeleton structure", () => {
    const { container } = render(<ProductCardSkeleton />);

    // Should have multiple skeleton elements
    const skeletons = container.querySelectorAll('[role="progressbar"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("has aspect-square image skeleton", () => {
    const { container } = render(<ProductCardSkeleton />);
    expect(container.querySelector(".aspect-square")).toBeInTheDocument();
  });
});

describe("OrderCardSkeleton", () => {
  it("renders order card skeleton structure", () => {
    const { container } = render(<OrderCardSkeleton />);

    const skeletons = container.querySelectorAll('[role="progressbar"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe("UserCardSkeleton", () => {
  it("renders user card skeleton structure", () => {
    const { container } = render(<UserCardSkeleton />);

    const skeletons = container.querySelectorAll('[role="progressbar"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("has circular avatar skeleton", () => {
    const { container } = render(<UserCardSkeleton />);
    expect(container.querySelector(".rounded-full")).toBeInTheDocument();
  });
});

describe("AddressCardSkeleton", () => {
  it("renders address card skeleton structure", () => {
    const { container } = render(<AddressCardSkeleton />);

    const skeletons = container.querySelectorAll('[role="progressbar"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe("DashboardStatSkeleton", () => {
  it("renders dashboard stat skeleton structure", () => {
    const { container } = render(<DashboardStatSkeleton />);

    const skeletons = container.querySelectorAll('[role="progressbar"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe("ListSkeleton", () => {
  it("renders specified number of items", () => {
    const { container } = render(
      <ListSkeleton
        count={5}
        renderItem={() => <div data-testid="skeleton-item" />}
      />,
    );

    expect(screen.getAllByTestId("skeleton-item")).toHaveLength(5);
  });

  it("uses default count of 5", () => {
    const { container } = render(
      <ListSkeleton renderItem={() => <div data-testid="skeleton-item" />} />,
    );

    expect(screen.getAllByTestId("skeleton-item")).toHaveLength(5);
  });
});
