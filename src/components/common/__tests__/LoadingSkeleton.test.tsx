import { render } from "@testing-library/react";
import LoadingSkeleton from "../LoadingSkeleton";

describe("LoadingSkeleton", () => {
  describe("card type", () => {
    it("renders card skeleton by default", () => {
      const { container } = render(<LoadingSkeleton />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass("animate-pulse");
    });

    it("renders single card skeleton by default", () => {
      const { container } = render(<LoadingSkeleton type="card" />);
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons).toHaveLength(1);
    });

    it("renders multiple card skeletons", () => {
      const { container } = render(<LoadingSkeleton type="card" count={3} />);
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons).toHaveLength(3);
    });

    it("has image and content sections", () => {
      const { container } = render(<LoadingSkeleton type="card" />);
      const imageSkeleton = container.querySelector(".h-48");
      const contentSection = container.querySelector(".p-4");

      expect(imageSkeleton).toBeInTheDocument();
      expect(contentSection).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <LoadingSkeleton type="card" className="custom-class" />
      );
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass("custom-class");
    });
  });

  describe("list type", () => {
    it("renders list skeleton", () => {
      const { container } = render(<LoadingSkeleton type="list" />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass("animate-pulse");
    });

    it("renders multiple list skeletons", () => {
      const { container } = render(<LoadingSkeleton type="list" count={5} />);
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons).toHaveLength(5);
    });

    it("has image, content, and action sections", () => {
      const { container } = render(<LoadingSkeleton type="list" />);
      const imageSkeleton = container.querySelector(".w-24.h-24");
      const contentSection = container.querySelector(".flex-1");

      expect(imageSkeleton).toBeInTheDocument();
      expect(contentSection).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <LoadingSkeleton type="list" className="custom-list-class" />
      );
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass("custom-list-class");
    });
  });

  describe("detail type", () => {
    it("renders detail skeleton", () => {
      const { container } = render(<LoadingSkeleton type="detail" />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass("animate-pulse");
    });

    it("has image gallery section", () => {
      const { container } = render(<LoadingSkeleton type="detail" />);
      const mainImage = container.querySelector(".h-96");
      expect(mainImage).toBeInTheDocument();
    });

    it("has thumbnail skeletons", () => {
      const { container } = render(<LoadingSkeleton type="detail" />);
      const thumbnails = container.querySelectorAll(".w-20.h-20");
      expect(thumbnails.length).toBeGreaterThan(0);
    });

    it("has product info section", () => {
      const { container } = render(<LoadingSkeleton type="detail" />);
      const grid = container.querySelector(".grid");
      expect(grid).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <LoadingSkeleton type="detail" className="custom-detail-class" />
      );
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass("custom-detail-class");
    });
  });

  describe("grid type", () => {
    it("renders grid skeleton", () => {
      const { container } = render(<LoadingSkeleton type="grid" />);
      const skeleton = container.firstChild;
      expect(skeleton).toBeInTheDocument();
    });

    it("renders multiple grid items", () => {
      const { container } = render(<LoadingSkeleton type="grid" count={4} />);
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons).toHaveLength(4);
    });

    it("has grid layout", () => {
      const { container } = render(<LoadingSkeleton type="grid" />);
      const grid = container.querySelector(".grid");
      expect(grid).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <LoadingSkeleton type="grid" className="custom-grid-class" />
      );
      const gridWrapper = container.firstChild;
      expect(gridWrapper).toHaveClass("custom-grid-class");
    });
  });

  describe("animation", () => {
    it("has animate-pulse class for all types", () => {
      const types = ["card", "list", "detail", "grid"] as const;

      types.forEach((type) => {
        const { container } = render(<LoadingSkeleton type={type} />);
        const skeleton = container.querySelector(".animate-pulse");
        expect(skeleton).toBeInTheDocument();
      });
    });
  });

  describe("dark mode support", () => {
    it("has dark mode classes", () => {
      const { container } = render(<LoadingSkeleton type="card" />);
      const darkElements = container.querySelectorAll("[class*='dark:']");
      expect(darkElements.length).toBeGreaterThan(0);
    });
  });

  describe("count prop", () => {
    it("respects count prop for card type", () => {
      const { container } = render(<LoadingSkeleton type="card" count={7} />);
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons).toHaveLength(7);
    });

    it("respects count prop for list type", () => {
      const { container } = render(<LoadingSkeleton type="list" count={10} />);
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons).toHaveLength(10);
    });

    it("respects count prop for grid type", () => {
      const { container } = render(<LoadingSkeleton type="grid" count={8} />);
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons).toHaveLength(8);
    });

    it("renders single skeleton when count is 1", () => {
      const { container } = render(<LoadingSkeleton type="card" count={1} />);
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons).toHaveLength(1);
    });

    it("renders no skeletons when count is 0", () => {
      const { container } = render(<LoadingSkeleton type="card" count={0} />);
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons).toHaveLength(0);
    });
  });

  describe("responsive behavior", () => {
    it("card skeleton has responsive classes", () => {
      const { container } = render(<LoadingSkeleton type="card" />);
      const rounded = container.querySelector(".rounded-lg");
      expect(rounded).toBeInTheDocument();
    });

    it("detail skeleton has responsive grid", () => {
      const { container } = render(<LoadingSkeleton type="detail" />);
      const responsiveGrid = container.querySelector(".lg\\:grid-cols-2");
      expect(responsiveGrid).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("does not have interactive elements", () => {
      const { container } = render(<LoadingSkeleton type="card" />);
      const buttons = container.querySelectorAll("button");
      const links = container.querySelectorAll("a");

      expect(buttons).toHaveLength(0);
      expect(links).toHaveLength(0);
    });

    it("is visually distinguishable from real content", () => {
      const { container } = render(<LoadingSkeleton type="card" />);
      const animatedElements = container.querySelectorAll(".animate-pulse");
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });
});
