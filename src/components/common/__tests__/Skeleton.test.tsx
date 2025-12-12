import { render } from "@testing-library/react";
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonImage,
  SkeletonText,
} from "../Skeleton";

describe("Skeleton Components", () => {
  describe("Skeleton (Base)", () => {
    // Basic rendering
    describe("Basic Rendering", () => {
      it("renders skeleton element", () => {
        const { container } = render(<Skeleton />);
        const skeleton = container.firstChild;
        expect(skeleton).toBeInTheDocument();
      });

      it("has base styling classes", () => {
        const { container } = render(<Skeleton />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("bg-gray-200", "rounded");
      });

      it("has pulse animation by default", () => {
        const { container } = render(<Skeleton />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("animate-pulse");
      });

      it("can disable animation", () => {
        const { container } = render(<Skeleton animate={false} />);
        const skeleton = container.firstChild;
        expect(skeleton).not.toHaveClass("animate-pulse");
      });

      it("accepts custom className", () => {
        const { container } = render(<Skeleton className="h-4 w-full" />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("h-4", "w-full", "bg-gray-200", "rounded");
      });

      it("merges custom className with base classes", () => {
        const { container } = render(<Skeleton className="custom-class" />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("custom-class", "bg-gray-200", "rounded");
      });

      it("spreads additional HTML attributes", () => {
        const { container } = render(
          <Skeleton data-testid="skeleton-element" aria-label="Loading" />
        );
        const skeleton = container.firstChild;
        expect(skeleton).toHaveAttribute("data-testid", "skeleton-element");
        expect(skeleton).toHaveAttribute("aria-label", "Loading");
      });
    });

    // Custom styling
    describe("Custom Styling", () => {
      it("applies height classes", () => {
        const { container } = render(<Skeleton className="h-10" />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("h-10");
      });

      it("applies width classes", () => {
        const { container } = render(<Skeleton className="w-24" />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("w-24");
      });

      it("applies border radius overrides", () => {
        const { container } = render(<Skeleton className="rounded-full" />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("rounded-full");
      });
    });
  });

  describe("SkeletonText", () => {
    // Basic rendering
    describe("Basic Rendering", () => {
      it("renders default 3 lines", () => {
        const { container } = render(<SkeletonText />);
        const skeletons = container.querySelectorAll(".bg-gray-200");
        expect(skeletons).toHaveLength(3);
      });

      it("renders custom number of lines", () => {
        const { container } = render(<SkeletonText lines={5} />);
        const skeletons = container.querySelectorAll(".bg-gray-200");
        expect(skeletons).toHaveLength(5);
      });

      it("renders single line", () => {
        const { container } = render(<SkeletonText lines={1} />);
        const skeletons = container.querySelectorAll(".bg-gray-200");
        expect(skeletons).toHaveLength(1);
      });

      it("has space-y-2 wrapper", () => {
        const { container } = render(<SkeletonText />);
        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass("space-y-2");
      });

      it("accepts custom className for wrapper", () => {
        const { container } = render(
          <SkeletonText className="custom-wrapper" />
        );
        const wrapper = container.firstChild;
        expect(wrapper).toHaveClass("space-y-2", "custom-wrapper");
      });
    });

    // Line width variations
    describe("Line Width", () => {
      it("first line is full width", () => {
        const { container } = render(<SkeletonText lines={2} />);
        const lines = container.querySelectorAll(".bg-gray-200");
        expect(lines[0]).toHaveClass("w-full");
      });

      it("last line is 3/4 width", () => {
        const { container } = render(<SkeletonText lines={3} />);
        const lines = container.querySelectorAll(".bg-gray-200");
        expect(lines[2]).toHaveClass("w-3/4");
      });

      it("middle lines are full width", () => {
        const { container } = render(<SkeletonText lines={4} />);
        const lines = container.querySelectorAll(".bg-gray-200");
        expect(lines[1]).toHaveClass("w-full");
        expect(lines[2]).toHaveClass("w-full");
      });

      it("all lines have h-4 height", () => {
        const { container } = render(<SkeletonText lines={3} />);
        const lines = container.querySelectorAll(".bg-gray-200");
        lines.forEach((line) => {
          expect(line).toHaveClass("h-4");
        });
      });
    });

    // Edge cases
    describe("Edge Cases", () => {
      it("handles 0 lines", () => {
        const { container } = render(<SkeletonText lines={0} />);
        const skeletons = container.querySelectorAll(".bg-gray-200");
        expect(skeletons).toHaveLength(0);
      });

      it("handles many lines", () => {
        const { container } = render(<SkeletonText lines={10} />);
        const skeletons = container.querySelectorAll(".bg-gray-200");
        expect(skeletons).toHaveLength(10);
      });
    });
  });

  describe("SkeletonAvatar", () => {
    // Basic rendering
    describe("Basic Rendering", () => {
      it("renders avatar skeleton", () => {
        const { container } = render(<SkeletonAvatar />);
        const skeleton = container.firstChild;
        expect(skeleton).toBeInTheDocument();
      });

      it("is circular by default", () => {
        const { container } = render(<SkeletonAvatar />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("rounded-full");
      });

      it("has medium size by default", () => {
        const { container } = render(<SkeletonAvatar />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("h-12", "w-12");
      });
    });

    // Size variants
    describe("Size Variants", () => {
      it("renders small avatar", () => {
        const { container } = render(<SkeletonAvatar size="sm" />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("h-8", "w-8");
      });

      it("renders medium avatar", () => {
        const { container } = render(<SkeletonAvatar size="md" />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("h-12", "w-12");
      });

      it("renders large avatar", () => {
        const { container } = render(<SkeletonAvatar size="lg" />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("h-16", "w-16");
      });

      it("renders extra large avatar", () => {
        const { container } = render(<SkeletonAvatar size="xl" />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("h-24", "w-24");
      });

      it("all sizes are circular", () => {
        const sizes = ["sm", "md", "lg", "xl"] as const;
        sizes.forEach((size) => {
          const { container } = render(<SkeletonAvatar size={size} />);
          const skeleton = container.firstChild;
          expect(skeleton).toHaveClass("rounded-full");
        });
      });
    });

    // Custom styling
    describe("Custom Styling", () => {
      it("accepts custom className", () => {
        const { container } = render(
          <SkeletonAvatar className="custom-avatar" />
        );
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("custom-avatar", "rounded-full");
      });

      it("can override size with className", () => {
        const { container } = render(
          <SkeletonAvatar size="sm" className="h-32 w-32" />
        );
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("h-32", "w-32");
      });
    });
  });

  describe("SkeletonButton", () => {
    // Basic rendering
    describe("Basic Rendering", () => {
      it("renders button skeleton", () => {
        const { container } = render(<SkeletonButton />);
        const skeleton = container.firstChild;
        expect(skeleton).toBeInTheDocument();
      });

      it("has rounded-lg corners", () => {
        const { container } = render(<SkeletonButton />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("rounded-lg");
      });

      it("has default variant size", () => {
        const { container } = render(<SkeletonButton />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("h-10", "w-24");
      });
    });

    // Variant sizes
    describe("Variant Sizes", () => {
      it("renders default variant", () => {
        const { container } = render(<SkeletonButton variant="default" />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("h-10", "w-24");
      });

      it("renders small variant", () => {
        const { container } = render(<SkeletonButton variant="sm" />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("h-8", "w-20");
      });

      it("renders large variant", () => {
        const { container } = render(<SkeletonButton variant="lg" />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("h-12", "w-32");
      });

      it("all variants have rounded-lg", () => {
        const variants = ["default", "sm", "lg"] as const;
        variants.forEach((variant) => {
          const { container } = render(<SkeletonButton variant={variant} />);
          const skeleton = container.firstChild;
          expect(skeleton).toHaveClass("rounded-lg");
        });
      });
    });

    // Custom styling
    describe("Custom Styling", () => {
      it("accepts custom className", () => {
        const { container } = render(
          <SkeletonButton className="custom-button" />
        );
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("custom-button", "rounded-lg");
      });

      it("can override size with className", () => {
        const { container } = render(
          <SkeletonButton variant="sm" className="h-20 w-40" />
        );
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("h-20", "w-40");
      });
    });
  });

  describe("SkeletonImage", () => {
    // Basic rendering
    describe("Basic Rendering", () => {
      it("renders image skeleton", () => {
        const { container } = render(<SkeletonImage />);
        const skeleton = container.firstChild;
        expect(skeleton).toBeInTheDocument();
      });

      it("has rounded-lg corners", () => {
        const { container } = render(<SkeletonImage />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("rounded-lg");
      });

      it("has full width", () => {
        const { container } = render(<SkeletonImage />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("w-full");
      });

      it("has video aspect ratio by default", () => {
        const { container } = render(<SkeletonImage />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("aspect-video");
      });
    });

    // Aspect ratios
    describe("Aspect Ratios", () => {
      it("renders square aspect ratio", () => {
        const { container } = render(<SkeletonImage aspectRatio="square" />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("aspect-square");
      });

      it("renders video aspect ratio", () => {
        const { container } = render(<SkeletonImage aspectRatio="video" />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("aspect-video");
      });

      it("renders portrait aspect ratio", () => {
        const { container } = render(<SkeletonImage aspectRatio="portrait" />);
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("aspect-[3/4]");
      });

      it("all aspect ratios have w-full", () => {
        const ratios = ["square", "video", "portrait"] as const;
        ratios.forEach((ratio) => {
          const { container } = render(<SkeletonImage aspectRatio={ratio} />);
          const skeleton = container.firstChild;
          expect(skeleton).toHaveClass("w-full");
        });
      });

      it("all aspect ratios have rounded-lg", () => {
        const ratios = ["square", "video", "portrait"] as const;
        ratios.forEach((ratio) => {
          const { container } = render(<SkeletonImage aspectRatio={ratio} />);
          const skeleton = container.firstChild;
          expect(skeleton).toHaveClass("rounded-lg");
        });
      });
    });

    // Custom styling
    describe("Custom Styling", () => {
      it("accepts custom className", () => {
        const { container } = render(
          <SkeletonImage className="custom-image" />
        );
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("custom-image", "w-full", "rounded-lg");
      });

      it("can override aspect ratio with className", () => {
        const { container } = render(
          <SkeletonImage aspectRatio="square" className="aspect-auto" />
        );
        const skeleton = container.firstChild;
        expect(skeleton).toHaveClass("aspect-auto");
      });
    });
  });

  // Integration tests
  describe("Integration", () => {
    it("can combine multiple skeleton types", () => {
      const { container } = render(
        <div>
          <SkeletonAvatar size="lg" />
          <SkeletonText lines={2} />
          <SkeletonButton variant="sm" />
        </div>
      );

      const skeletons = container.querySelectorAll(".bg-gray-200");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("can create card skeleton layout", () => {
      const { container } = render(
        <div className="p-4">
          <SkeletonImage aspectRatio="square" />
          <div className="mt-4">
            <SkeletonText lines={2} />
          </div>
          <div className="mt-4 flex gap-2">
            <SkeletonButton variant="sm" />
            <SkeletonButton variant="sm" />
          </div>
        </div>
      );

      expect(container.querySelector(".aspect-square")).toBeInTheDocument();
      const textLines = container.querySelectorAll(".h-4");
      expect(textLines.length).toBe(2);
    });

    it("can create user profile skeleton", () => {
      const { container } = render(
        <div className="flex items-center gap-4">
          <SkeletonAvatar size="xl" />
          <div className="flex-1">
            <SkeletonText lines={3} />
          </div>
        </div>
      );

      expect(container.querySelector(".h-24.w-24")).toBeInTheDocument();
      const textLines = container.querySelectorAll(".h-4");
      expect(textLines.length).toBe(3);
    });
  });

  // Animation consistency
  describe("Animation", () => {
    it("all skeleton types animate by default", () => {
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
      expect(animated.length).toBeGreaterThan(0);
    });

    it("base Skeleton can disable animation for all types", () => {
      const { container } = render(
        <Skeleton animate={false} className="h-4 w-full" />
      );
      const skeleton = container.firstChild;
      expect(skeleton).not.toHaveClass("animate-pulse");
    });
  });
});
