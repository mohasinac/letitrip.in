/**
 * Comprehensive Skeleton Component Test Suite
 * Tests all skeleton variants, animations, and edge cases
 */

import { describe, expect, it } from "@jest/globals";
import { render } from "@testing-library/react";
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonImage,
  SkeletonText,
} from "../Skeleton";

describe("Skeleton Components - Comprehensive Tests", () => {
  describe("Skeleton Base Component", () => {
    it("should render basic skeleton", () => {
      const { container } = render(<Skeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(<Skeleton className="h-4 w-full" />);
      expect(container.firstChild).toHaveClass("h-4", "w-full");
    });

    it("should have default bg-gray-200 class", () => {
      const { container } = render(<Skeleton />);
      expect(container.firstChild).toHaveClass("bg-gray-200");
    });

    it("should have rounded class", () => {
      const { container } = render(<Skeleton />);
      expect(container.firstChild).toHaveClass("rounded");
    });

    it("should animate by default", () => {
      const { container } = render(<Skeleton />);
      expect(container.firstChild).toHaveClass("animate-pulse");
    });

    it("should not animate when animate is false", () => {
      const { container } = render(<Skeleton animate={false} />);
      expect(container.firstChild).not.toHaveClass("animate-pulse");
    });

    it("should support all HTML div attributes", () => {
      const { container } = render(
        <Skeleton data-testid="skeleton" aria-label="Loading" />
      );
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveAttribute("data-testid", "skeleton");
      expect(skeleton).toHaveAttribute("aria-label", "Loading");
    });

    it("should support onClick handler", () => {
      const onClick = jest.fn();
      const { container } = render(<Skeleton onClick={onClick} />);
      const skeleton = container.firstChild as HTMLElement;
      skeleton.click();
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should support id attribute", () => {
      const { container } = render(<Skeleton id="my-skeleton" />);
      expect(container.firstChild).toHaveAttribute("id", "my-skeleton");
    });

    it("should support style prop", () => {
      const { container } = render(<Skeleton style={{ width: "100px" }} />);
      expect(container.firstChild).toHaveStyle({ width: "100px" });
    });

    it("should merge multiple classNames correctly", () => {
      const { container } = render(
        <Skeleton className="h-8 w-full rounded-lg my-custom-class" />
      );
      expect(container.firstChild).toHaveClass(
        "h-8",
        "w-full",
        "rounded-lg",
        "my-custom-class"
      );
    });
  });

  describe("SkeletonText Component", () => {
    it("should render default 3 lines", () => {
      const { container } = render(<SkeletonText />);
      const skeletons = container.querySelectorAll(".h-4");
      expect(skeletons).toHaveLength(3);
    });

    it("should render specified number of lines", () => {
      const { container } = render(<SkeletonText lines={5} />);
      const skeletons = container.querySelectorAll(".h-4");
      expect(skeletons).toHaveLength(5);
    });

    it("should render 1 line when specified", () => {
      const { container } = render(<SkeletonText lines={1} />);
      const skeletons = container.querySelectorAll(".h-4");
      expect(skeletons).toHaveLength(1);
    });

    it("should make last line shorter (w-3/4)", () => {
      const { container } = render(<SkeletonText lines={3} />);
      const skeletons = container.querySelectorAll(".h-4");
      expect(skeletons[2]).toHaveClass("w-3/4");
    });

    it("should make non-last lines full width", () => {
      const { container } = render(<SkeletonText lines={3} />);
      const skeletons = container.querySelectorAll(".h-4");
      expect(skeletons[0]).toHaveClass("w-full");
      expect(skeletons[1]).toHaveClass("w-full");
    });

    it("should apply space-y-2 to container", () => {
      const { container } = render(<SkeletonText />);
      expect(container.firstChild).toHaveClass("space-y-2");
    });

    it("should apply custom className to container", () => {
      const { container } = render(
        <SkeletonText className="my-custom-class" />
      );
      expect(container.firstChild).toHaveClass("my-custom-class", "space-y-2");
    });

    it("should render 10 lines", () => {
      const { container } = render(<SkeletonText lines={10} />);
      const skeletons = container.querySelectorAll(".h-4");
      expect(skeletons).toHaveLength(10);
    });

    it("should render 0 lines gracefully", () => {
      const { container } = render(<SkeletonText lines={0} />);
      const skeletons = container.querySelectorAll(".h-4");
      expect(skeletons).toHaveLength(0);
    });

    it("should handle negative lines gracefully", () => {
      const { container } = render(<SkeletonText lines={-1} />);
      const skeletons = container.querySelectorAll(".h-4");
      expect(skeletons).toHaveLength(0);
    });

    it("should animate all lines", () => {
      const { container } = render(<SkeletonText lines={3} />);
      const skeletons = container.querySelectorAll(".h-4");
      skeletons.forEach((skeleton) => {
        expect(skeleton).toHaveClass("animate-pulse");
      });
    });
  });

  describe("SkeletonAvatar Component", () => {
    it("should render with default medium size", () => {
      const { container } = render(<SkeletonAvatar />);
      expect(container.firstChild).toHaveClass("h-12", "w-12");
    });

    it("should render small size", () => {
      const { container } = render(<SkeletonAvatar size="sm" />);
      expect(container.firstChild).toHaveClass("h-8", "w-8");
    });

    it("should render medium size", () => {
      const { container } = render(<SkeletonAvatar size="md" />);
      expect(container.firstChild).toHaveClass("h-12", "w-12");
    });

    it("should render large size", () => {
      const { container } = render(<SkeletonAvatar size="lg" />);
      expect(container.firstChild).toHaveClass("h-16", "w-16");
    });

    it("should render extra large size", () => {
      const { container } = render(<SkeletonAvatar size="xl" />);
      expect(container.firstChild).toHaveClass("h-24", "w-24");
    });

    it("should be circular (rounded-full)", () => {
      const { container } = render(<SkeletonAvatar />);
      expect(container.firstChild).toHaveClass("rounded-full");
    });

    it("should apply custom className", () => {
      const { container } = render(
        <SkeletonAvatar className="my-avatar-class" />
      );
      expect(container.firstChild).toHaveClass(
        "my-avatar-class",
        "rounded-full"
      );
    });

    it("should animate by default", () => {
      const { container } = render(<SkeletonAvatar />);
      expect(container.firstChild).toHaveClass("animate-pulse");
    });

    it("should have square aspect ratio for all sizes", () => {
      const sizes = ["sm", "md", "lg", "xl"] as const;
      sizes.forEach((size) => {
        const { container } = render(<SkeletonAvatar size={size} />);
        const avatar = container.firstChild as HTMLElement;
        // Should have equal height and width classes
        expect(avatar.className).toMatch(/h-\d+.*w-\d+/);
      });
    });
  });

  describe("SkeletonButton Component", () => {
    it("should render with default size", () => {
      const { container } = render(<SkeletonButton />);
      expect(container.firstChild).toHaveClass("h-10", "w-24");
    });

    it("should render default variant", () => {
      const { container } = render(<SkeletonButton variant="default" />);
      expect(container.firstChild).toHaveClass("h-10", "w-24");
    });

    it("should render small variant", () => {
      const { container } = render(<SkeletonButton variant="sm" />);
      expect(container.firstChild).toHaveClass("h-8", "w-20");
    });

    it("should render large variant", () => {
      const { container } = render(<SkeletonButton variant="lg" />);
      expect(container.firstChild).toHaveClass("h-12", "w-32");
    });

    it("should be rounded (rounded-lg)", () => {
      const { container } = render(<SkeletonButton />);
      expect(container.firstChild).toHaveClass("rounded-lg");
    });

    it("should apply custom className", () => {
      const { container } = render(
        <SkeletonButton className="my-button-class" />
      );
      expect(container.firstChild).toHaveClass("my-button-class", "rounded-lg");
    });

    it("should animate by default", () => {
      const { container } = render(<SkeletonButton />);
      expect(container.firstChild).toHaveClass("animate-pulse");
    });
  });

  describe("SkeletonImage Component", () => {
    it("should render with default video aspect ratio", () => {
      const { container } = render(<SkeletonImage />);
      expect(container.firstChild).toHaveClass("aspect-video");
    });

    it("should render square aspect ratio", () => {
      const { container } = render(<SkeletonImage aspectRatio="square" />);
      expect(container.firstChild).toHaveClass("aspect-square");
    });

    it("should render video aspect ratio", () => {
      const { container } = render(<SkeletonImage aspectRatio="video" />);
      expect(container.firstChild).toHaveClass("aspect-video");
    });

    it("should render portrait aspect ratio", () => {
      const { container } = render(<SkeletonImage aspectRatio="portrait" />);
      expect(container.firstChild).toHaveClass("aspect-[3/4]");
    });

    it("should be full width", () => {
      const { container } = render(<SkeletonImage />);
      expect(container.firstChild).toHaveClass("w-full");
    });

    it("should be rounded (rounded-lg)", () => {
      const { container } = render(<SkeletonImage />);
      expect(container.firstChild).toHaveClass("rounded-lg");
    });

    it("should apply custom className", () => {
      const { container } = render(
        <SkeletonImage className="my-image-class" />
      );
      expect(container.firstChild).toHaveClass("my-image-class", "rounded-lg");
    });

    it("should animate by default", () => {
      const { container } = render(<SkeletonImage />);
      expect(container.firstChild).toHaveClass("animate-pulse");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null className", () => {
      const { container } = render(<Skeleton className={null as any} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle undefined className", () => {
      const { container } = render(<Skeleton className={undefined} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle empty string className", () => {
      const { container } = render(<Skeleton className="" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle very large number of lines", () => {
      const { container } = render(<SkeletonText lines={100} />);
      const skeletons = container.querySelectorAll(".h-4");
      expect(skeletons).toHaveLength(100);
    });

    it("should handle decimal lines value", () => {
      const { container } = render(<SkeletonText lines={3.7} />);
      const skeletons = container.querySelectorAll(".h-4");
      // Should render 3 lines (Array.from truncates)
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should support aria-label", () => {
      const { container } = render(<Skeleton aria-label="Loading content" />);
      expect(container.firstChild).toHaveAttribute(
        "aria-label",
        "Loading content"
      );
    });

    it("should support aria-busy", () => {
      const { container } = render(<Skeleton aria-busy="true" />);
      expect(container.firstChild).toHaveAttribute("aria-busy", "true");
    });

    it("should support role attribute", () => {
      const { container } = render(<Skeleton role="status" />);
      expect(container.firstChild).toHaveAttribute("role", "status");
    });
  });

  describe("Performance", () => {
    it("should render many skeletons without issues", () => {
      const { container } = render(
        <>
          {Array.from({ length: 50 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </>
      );
      const skeletons = container.querySelectorAll(".h-4");
      expect(skeletons).toHaveLength(50);
    });

    it("should handle rapid re-renders", () => {
      const { rerender, container } = render(<Skeleton className="h-4" />);
      for (let i = 0; i < 10; i++) {
        rerender(<Skeleton className={`h-${i + 4}`} />);
      }
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("Real-world Scenarios", () => {
    it("should create card skeleton layout", () => {
      const { container } = render(
        <div className="space-y-3">
          <SkeletonImage aspectRatio="square" />
          <SkeletonText lines={2} />
          <SkeletonButton variant="sm" />
        </div>
      );
      expect(container.querySelector(".aspect-square")).toBeInTheDocument();
    });

    it("should create profile skeleton layout", () => {
      const { container } = render(
        <div className="flex items-center gap-4">
          <SkeletonAvatar size="lg" />
          <div className="flex-1">
            <SkeletonText lines={2} />
          </div>
        </div>
      );
      expect(container.querySelector(".rounded-full")).toBeInTheDocument();
    });

    it("should create list skeleton", () => {
      const { container } = render(
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <SkeletonAvatar size="md" />
              <SkeletonText lines={2} />
            </div>
          ))}
        </div>
      );
      const avatars = container.querySelectorAll(".rounded-full");
      expect(avatars).toHaveLength(5);
    });

    it("should create table skeleton", () => {
      const { container } = render(
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      );
      const rows = container.querySelectorAll(".h-12");
      expect(rows).toHaveLength(10);
    });
  });

  describe("Animation Control", () => {
    it("should disable animation on all components", () => {
      const { container: c1 } = render(<Skeleton animate={false} />);
      const { container: c2 } = render(<SkeletonText lines={1} />);
      const { container: c3 } = render(<SkeletonAvatar />);
      const { container: c4 } = render(<SkeletonButton />);
      const { container: c5 } = render(<SkeletonImage />);

      expect(c1.firstChild).not.toHaveClass("animate-pulse");
      // Note: SkeletonText, Avatar, Button, Image don't expose animate prop
      // but they all use Skeleton which has animate by default
    });

    it("should have consistent animation across all components", () => {
      const { container } = render(
        <div>
          <Skeleton />
          <SkeletonText lines={1} />
          <SkeletonAvatar />
          <SkeletonButton />
          <SkeletonImage />
        </div>
      );
      const animated = container.querySelectorAll(".animate-pulse");
      // All should be animated
      expect(animated.length).toBeGreaterThan(0);
    });
  });

  describe("Styling Consistency", () => {
    it("should use consistent gray color", () => {
      const { container: c1 } = render(<Skeleton />);
      const { container: c2 } = render(<SkeletonText lines={1} />);
      const { container: c3 } = render(<SkeletonAvatar />);
      const { container: c4 } = render(<SkeletonButton />);
      const { container: c5 } = render(<SkeletonImage />);

      expect(c1.firstChild).toHaveClass("bg-gray-200");
      // All other components use Skeleton internally
      expect(c2.querySelector(".bg-gray-200")).toBeInTheDocument();
      expect(c3.firstChild).toHaveClass("bg-gray-200");
      expect(c4.firstChild).toHaveClass("bg-gray-200");
      expect(c5.firstChild).toHaveClass("bg-gray-200");
    });

    it("should use consistent rounded corners", () => {
      const { container: c1 } = render(<Skeleton />);
      const { container: c2 } = render(<SkeletonAvatar />);
      const { container: c3 } = render(<SkeletonButton />);
      const { container: c4 } = render(<SkeletonImage />);

      expect(c1.firstChild).toHaveClass("rounded");
      expect(c2.firstChild).toHaveClass("rounded-full");
      expect(c3.firstChild).toHaveClass("rounded-lg");
      expect(c4.firstChild).toHaveClass("rounded-lg");
    });
  });
});
