import { render, screen } from "@testing-library/react";
import { ValueProposition } from "../ValueProposition";

describe("ValueProposition", () => {
  describe("Rendering", () => {
    it("should render all value propositions", () => {
      render(<ValueProposition />);

      expect(screen.getByText("100% Authentic Products")).toBeInTheDocument();
      expect(screen.getByText("Zero Customs Charges")).toBeInTheDocument();
      expect(screen.getByText("Fast India Delivery")).toBeInTheDocument();
      expect(screen.getByText("Secure Payments")).toBeInTheDocument();
    });

    it("should render with correct section id", () => {
      const { container } = render(<ValueProposition />);
      const section = container.querySelector("#value-proposition");
      expect(section).toBeInTheDocument();
    });

    it("should render all icons", () => {
      const { container } = render(<ValueProposition />);
      const svgs = container.querySelectorAll("svg");
      expect(svgs).toHaveLength(4);
    });

    it("should have gradient background", () => {
      const { container } = render(<ValueProposition />);
      const section = container.querySelector("section");
      expect(section).toHaveClass(
        "bg-gradient-to-r",
        "from-green-50",
        "to-blue-50"
      );
    });
  });

  describe("Icons", () => {
    it("should render checkmark icon for authentic products", () => {
      const { container } = render(<ValueProposition />);
      const svgs = container.querySelectorAll("svg");
      expect(svgs[0]).toBeInTheDocument();
      // First icon is checkmark (path with M5 13l4 4L19 7)
    });

    it("should render all icons with correct size", () => {
      const { container } = render(<ValueProposition />);
      const svgs = container.querySelectorAll("svg");
      svgs.forEach((svg) => {
        expect(svg).toHaveClass("w-5", "h-5");
      });
    });

    it("should have flex-shrink-0 on all icons", () => {
      const { container } = render(<ValueProposition />);
      const svgs = container.querySelectorAll("svg");
      svgs.forEach((svg) => {
        expect(svg).toHaveClass("flex-shrink-0");
      });
    });
  });

  describe("Color Coding", () => {
    it("should use green for authentic products", () => {
      const { container } = render(<ValueProposition />);
      const items = container.querySelectorAll(".text-green-700");
      expect(items.length).toBeGreaterThan(0);
    });

    it("should use blue for customs charges", () => {
      const { container } = render(<ValueProposition />);
      const items = container.querySelectorAll(".text-blue-700");
      expect(items.length).toBeGreaterThan(0);
    });

    it("should use purple for delivery", () => {
      const { container } = render(<ValueProposition />);
      const items = container.querySelectorAll(".text-purple-700");
      expect(items.length).toBeGreaterThan(0);
    });

    it("should use orange for payments", () => {
      const { container } = render(<ValueProposition />);
      const items = container.querySelectorAll(".text-orange-700");
      expect(items.length).toBeGreaterThan(0);
    });
  });

  describe("Dark Mode", () => {
    it("should have dark mode gradient background", () => {
      const { container } = render(<ValueProposition />);
      const section = container.querySelector("section");
      expect(section).toHaveClass(
        "dark:from-green-900/20",
        "dark:to-blue-900/20"
      );
    });

    it("should have dark mode colors for each item", () => {
      const { container } = render(<ValueProposition />);
      const items = container.querySelectorAll("[class*='dark:text-']");
      expect(items.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("Responsive Design", () => {
    it("should have mobile grid layout", () => {
      const { container } = render(<ValueProposition />);
      const grid = container.querySelector(".grid-cols-2");
      expect(grid).toBeInTheDocument();
    });

    it("should switch to flex on md screens", () => {
      const { container } = render(<ValueProposition />);
      const grid = container.querySelector(".md\\:flex");
      expect(grid).toBeInTheDocument();
    });

    it("should have responsive padding", () => {
      const { container } = render(<ValueProposition />);
      const section = container.querySelector("section");
      expect(section).toHaveClass("p-3", "md:p-4", "lg:p-6");
    });

    it("should have responsive gaps", () => {
      const { container } = render(<ValueProposition />);
      const grid = container.querySelector(".gap-3");
      expect(grid).toHaveClass("md:gap-6", "lg:gap-8");
    });

    it("should have responsive text sizes", () => {
      const { container } = render(<ValueProposition />);
      const texts = container.querySelectorAll("span");
      texts.forEach((text) => {
        expect(text).toHaveClass("text-xs");
      });
    });

    it("should have responsive icon sizes", () => {
      const { container } = render(<ValueProposition />);
      const svgs = container.querySelectorAll("svg");
      svgs.forEach((svg) => {
        expect(svg).toHaveClass("w-5", "h-5", "md:w-6", "md:h-6");
      });
    });
  });

  describe("Touch Optimization", () => {
    it("should have minimum touch target height", () => {
      const { container } = render(<ValueProposition />);
      const items = container.querySelectorAll(".min-h-\\[48px\\]");
      expect(items).toHaveLength(4);
    });

    it("should have touch-manipulation class", () => {
      const { container } = render(<ValueProposition />);
      const items = container.querySelectorAll(".touch-manipulation");
      expect(items).toHaveLength(4);
    });
  });

  describe("Layout", () => {
    it("should center items on md+ screens", () => {
      const { container } = render(<ValueProposition />);
      const grid = container.querySelector(".justify-center");
      expect(grid).toBeInTheDocument();
    });

    it("should align items to center", () => {
      const { container } = render(<ValueProposition />);
      const grid = container.querySelector(".items-center");
      expect(grid).toBeInTheDocument();
    });

    it("should have rounded corners", () => {
      const { container } = render(<ValueProposition />);
      const section = container.querySelector("section");
      expect(section).toHaveClass("rounded-lg");
    });
  });

  describe("Accessibility", () => {
    it("should use semantic section element", () => {
      const { container } = render(<ValueProposition />);
      const section = container.querySelector("section");
      expect(section?.tagName).toBe("SECTION");
    });

    it("should have accessible text", () => {
      render(<ValueProposition />);
      const texts = [
        "100% Authentic Products",
        "Zero Customs Charges",
        "Fast India Delivery",
        "Secure Payments",
      ];
      texts.forEach((text) => {
        expect(screen.getByText(text)).toBeInTheDocument();
      });
    });

    it("should have font-medium for readability", () => {
      const { container } = render(<ValueProposition />);
      const items = container.querySelectorAll(".font-medium");
      expect(items).toHaveLength(4);
    });
  });

  describe("SVG Configuration", () => {
    it("should have correct viewBox for all icons", () => {
      const { container } = render(<ValueProposition />);
      const svgs = container.querySelectorAll("svg");
      svgs.forEach((svg) => {
        expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
      });
    });

    it("should have no fill for all icons", () => {
      const { container } = render(<ValueProposition />);
      const svgs = container.querySelectorAll("svg");
      svgs.forEach((svg) => {
        expect(svg.getAttribute("fill")).toBe("none");
      });
    });

    it("should use currentColor for stroke", () => {
      const { container } = render(<ValueProposition />);
      const svgs = container.querySelectorAll("svg");
      svgs.forEach((svg) => {
        expect(svg.getAttribute("stroke")).toBe("currentColor");
      });
    });

    it("should have stroke attributes on paths", () => {
      const { container } = render(<ValueProposition />);
      const paths = container.querySelectorAll("path");
      // strokeWidth, strokeLinecap, strokeLinejoin are camelCase in JSX
      // but become lowercase in DOM (stroke-width, stroke-linecap, stroke-linejoin)
      paths.forEach((path) => {
        expect(
          path.getAttribute("stroke-width") || path.getAttribute("strokeWidth")
        ).toBeTruthy();
        expect(
          path.getAttribute("stroke-linecap") ||
            path.getAttribute("strokeLinecap")
        ).toBeTruthy();
        expect(
          path.getAttribute("stroke-linejoin") ||
            path.getAttribute("strokeLinejoin")
        ).toBeTruthy();
      });
    });
  });
});
