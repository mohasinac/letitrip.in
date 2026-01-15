import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  LoadingSkeleton,
  Skeleton,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonImage,
  SkeletonText,
} from "../tables/Skeleton";

describe("Skeleton Components", () => {
  describe("Skeleton (Base)", () => {
    it("renders with default props", () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild;
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass("bg-gray-200");
      expect(skeleton).toHaveClass("rounded");
    });

    it("includes pulse animation by default", () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass("animate-pulse");
    });

    it("disables animation when animate is false", () => {
      const { container } = render(<Skeleton animate={false} />);
      const skeleton = container.firstChild;
      expect(skeleton).not.toHaveClass("animate-pulse");
    });

    it("applies custom className", () => {
      const { container } = render(
        <Skeleton className="custom-class h-8 w-24" />
      );
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass("custom-class");
      expect(skeleton).toHaveClass("h-8");
      expect(skeleton).toHaveClass("w-24");
    });

    it("has accessibility attributes", () => {
      render(<Skeleton />);
      const skeleton = screen.getByRole("status");
      expect(skeleton).toHaveAttribute("aria-busy", "true");
      expect(skeleton).toHaveAttribute("aria-label", "Loading");
    });

    it("forwards additional HTML attributes", () => {
      const { container } = render(<Skeleton data-testid="skeleton-test" />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveAttribute("data-testid", "skeleton-test");
    });
  });

  describe("SkeletonText", () => {
    it("renders default 3 lines", () => {
      const { container } = render(<SkeletonText />);
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons).toHaveLength(3);
    });

    it("renders custom number of lines", () => {
      const { container } = render(<SkeletonText lines={5} />);
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons).toHaveLength(5);
    });

    it("makes last line shorter", () => {
      const { container } = render(<SkeletonText lines={3} />);
      const skeletons = container.querySelectorAll('[role="status"]');
      const lastSkeleton = skeletons[skeletons.length - 1];
      expect(lastSkeleton).toHaveClass("w-3/4");
    });

    it("makes other lines full width", () => {
      const { container } = render(<SkeletonText lines={3} />);
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons[0]).toHaveClass("w-full");
      expect(skeletons[1]).toHaveClass("w-full");
    });

    it("applies custom className to wrapper", () => {
      const { container } = render(<SkeletonText className="custom-wrapper" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("custom-wrapper");
      expect(wrapper).toHaveClass("space-y-2");
    });

    it("renders single line correctly", () => {
      const { container } = render(<SkeletonText lines={1} />);
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons).toHaveLength(1);
      expect(skeletons[0]).toHaveClass("w-3/4"); // Single line is last line
    });
  });

  describe("SkeletonAvatar", () => {
    it("renders with default medium size", () => {
      const { container } = render(<SkeletonAvatar />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveClass("h-12");
      expect(skeleton).toHaveClass("w-12");
      expect(skeleton).toHaveClass("rounded-full");
    });

    it("renders small size", () => {
      const { container } = render(<SkeletonAvatar size="sm" />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveClass("h-8");
      expect(skeleton).toHaveClass("w-8");
    });

    it("renders large size", () => {
      const { container } = render(<SkeletonAvatar size="lg" />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveClass("h-16");
      expect(skeleton).toHaveClass("w-16");
    });

    it("renders xl size", () => {
      const { container } = render(<SkeletonAvatar size="xl" />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveClass("h-24");
      expect(skeleton).toHaveClass("w-24");
    });

    it("applies custom className", () => {
      const { container } = render(
        <SkeletonAvatar className="custom-avatar" />
      );
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveClass("custom-avatar");
    });
  });

  describe("SkeletonButton", () => {
    it("renders with default variant", () => {
      const { container } = render(<SkeletonButton />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveClass("h-10");
      expect(skeleton).toHaveClass("w-24");
      expect(skeleton).toHaveClass("rounded-lg");
    });

    it("renders small variant", () => {
      const { container } = render(<SkeletonButton variant="sm" />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveClass("h-8");
      expect(skeleton).toHaveClass("w-20");
    });

    it("renders large variant", () => {
      const { container } = render(<SkeletonButton variant="lg" />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveClass("h-12");
      expect(skeleton).toHaveClass("w-32");
    });

    it("applies custom className", () => {
      const { container } = render(<SkeletonButton className="w-full" />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveClass("w-full");
    });
  });

  describe("SkeletonImage", () => {
    it("renders with default video aspect ratio", () => {
      const { container } = render(<SkeletonImage />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveClass("aspect-video");
      expect(skeleton).toHaveClass("w-full");
      expect(skeleton).toHaveClass("rounded-lg");
    });

    it("renders square aspect ratio", () => {
      const { container } = render(<SkeletonImage aspectRatio="square" />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveClass("aspect-square");
    });

    it("renders portrait aspect ratio", () => {
      const { container } = render(<SkeletonImage aspectRatio="portrait" />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveClass("aspect-[3/4]");
    });

    it("applies custom className", () => {
      const { container } = render(<SkeletonImage className="max-w-md" />);
      const skeleton = container.querySelector('[role="status"]');
      expect(skeleton).toHaveClass("max-w-md");
    });
  });

  describe("LoadingSkeleton", () => {
    describe("Card Type", () => {
      it("renders single card by default", () => {
        const { container } = render(<LoadingSkeleton type="card" />);
        const cards = container.querySelectorAll(".animate-pulse");
        expect(cards).toHaveLength(1);
      });

      it("renders multiple cards with count", () => {
        const { container } = render(<LoadingSkeleton type="card" count={3} />);
        const cards = container.querySelectorAll(".animate-pulse");
        expect(cards).toHaveLength(3);
      });

      it("contains image and content sections", () => {
        const { container } = render(<LoadingSkeleton type="card" />);
        const imageSection = container.querySelector(".h-48");
        const contentSection = container.querySelector(".p-4");
        expect(imageSection).toBeInTheDocument();
        expect(contentSection).toBeInTheDocument();
      });

      it("applies custom className", () => {
        const { container } = render(
          <LoadingSkeleton type="card" className="custom-card" />
        );
        const card = container.querySelector(".animate-pulse");
        expect(card).toHaveClass("custom-card");
      });
    });

    describe("List Type", () => {
      it("renders list items", () => {
        const { container } = render(<LoadingSkeleton type="list" count={2} />);
        const items = container.querySelectorAll(".animate-pulse");
        expect(items).toHaveLength(2);
      });

      it("contains flex layout with image and content", () => {
        const { container } = render(<LoadingSkeleton type="list" />);
        const listItem = container.querySelector(".flex.items-center");
        expect(listItem).toBeInTheDocument();
        const image = container.querySelector(".w-24.h-24");
        expect(image).toBeInTheDocument();
      });

      it("applies custom className", () => {
        const { container } = render(
          <LoadingSkeleton type="list" className="custom-list" />
        );
        const listItem = container.querySelector(".animate-pulse");
        expect(listItem).toHaveClass("custom-list");
      });
    });

    describe("Detail Type", () => {
      it("renders detail layout", () => {
        const { container } = render(<LoadingSkeleton type="detail" />);
        const grid = container.querySelector(".grid");
        expect(grid).toBeInTheDocument();
        expect(grid).toHaveClass("lg:grid-cols-2");
      });

      it("contains image gallery section", () => {
        const { container } = render(<LoadingSkeleton type="detail" />);
        const mainImage = container.querySelector(".h-96");
        expect(mainImage).toBeInTheDocument();
      });

      it("contains thumbnail gallery", () => {
        const { container } = render(<LoadingSkeleton type="detail" />);
        const thumbnails = container.querySelectorAll(".w-20.h-20");
        expect(thumbnails.length).toBeGreaterThan(0);
      });

      it("applies custom className", () => {
        const { container } = render(
          <LoadingSkeleton type="detail" className="custom-detail" />
        );
        const wrapper = container.querySelector(".animate-pulse");
        expect(wrapper).toHaveClass("custom-detail");
      });
    });

    describe("Grid Type", () => {
      it("renders grid layout", () => {
        const { container } = render(<LoadingSkeleton type="grid" count={4} />);
        const grid = container.querySelector(".grid");
        expect(grid).toBeInTheDocument();
        expect(grid).toHaveClass("xl:grid-cols-4");
      });

      it("renders correct number of items", () => {
        const { container } = render(<LoadingSkeleton type="grid" count={6} />);
        const items = container.querySelectorAll(".animate-pulse");
        expect(items).toHaveLength(6);
      });

      it("applies custom className to grid", () => {
        const { container } = render(
          <LoadingSkeleton type="grid" className="custom-grid" />
        );
        const grid = container.querySelector(".grid");
        expect(grid).toHaveClass("custom-grid");
      });
    });

    describe("Table Type", () => {
      it("renders table skeleton", () => {
        const { container } = render(
          <LoadingSkeleton type="table" count={5} />
        );
        const wrapper = container.querySelector(".animate-pulse");
        expect(wrapper).toBeInTheDocument();
      });

      it("renders header row", () => {
        const { container } = render(<LoadingSkeleton type="table" />);
        const header = container.querySelector(".border-b.border-gray-300");
        expect(header).toBeInTheDocument();
      });

      it("renders correct number of data rows", () => {
        const { container } = render(
          <LoadingSkeleton type="table" count={3} />
        );
        const rows = container.querySelectorAll(".py-4.border-b");
        expect(rows).toHaveLength(3);
      });

      it("applies custom className", () => {
        const { container } = render(
          <LoadingSkeleton type="table" className="custom-table" />
        );
        const wrapper = container.querySelector(".animate-pulse");
        expect(wrapper).toHaveClass("custom-table");
      });
    });

    describe("Default Export", () => {
      it("can be imported as default export", async () => {
        const { default: DefaultLoadingSkeleton } = await import(
          "../tables/Skeleton"
        );
        const { container } = render(<DefaultLoadingSkeleton type="card" />);
        expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
      });
    });

    describe("Dark Mode", () => {
      it("includes dark mode classes", () => {
        const { container } = render(<LoadingSkeleton type="card" />);
        const darkModeElements = container.querySelectorAll(
          ".dark\\:bg-gray-700, .dark\\:bg-gray-600"
        );
        expect(darkModeElements.length).toBeGreaterThan(0);
      });
    });

    describe("Edge Cases", () => {
      it("renders nothing for invalid type", () => {
        // @ts-expect-error Testing invalid type
        const { container } = render(<LoadingSkeleton type="invalid" />);
        expect(container.firstChild).toBeNull();
      });

      it("handles count of 0", () => {
        const { container } = render(<LoadingSkeleton type="card" count={0} />);
        const cards = container.querySelectorAll(".animate-pulse");
        expect(cards).toHaveLength(0);
      });

      it("handles large count values", () => {
        const { container } = render(
          <LoadingSkeleton type="grid" count={20} />
        );
        const items = container.querySelectorAll(".animate-pulse");
        expect(items).toHaveLength(20);
      });
    });
  });
});
