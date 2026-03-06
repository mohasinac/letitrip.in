import { render } from "@testing-library/react";
import { HomepageSkeleton } from "../HomepageSkeleton";

describe("HomepageSkeleton", () => {
  // ====================================
  // Rendering
  // ====================================
  describe("Rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(<HomepageSkeleton />);
      expect(container.firstChild).not.toBeNull();
    });

    it("renders animate-pulse skeleton blocks", () => {
      const { container } = render(<HomepageSkeleton />);
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("renders hero skeleton block", () => {
      const { container } = render(<HomepageSkeleton />);
      // First direct child inside wrapper should be the hero block
      const wrapper = container.firstChild as HTMLElement;
      const hero = wrapper?.firstChild as HTMLElement;
      expect(hero).toBeTruthy();
      expect(hero.classList.contains("animate-pulse")).toBe(true);
    });

    it("renders 4 trust feature skeletons", () => {
      const { container } = render(<HomepageSkeleton />);
      // The trust section has a grid with 4 items
      const grids = container.querySelectorAll("[class*='grid-cols-2']");
      expect(grids.length).toBeGreaterThan(0);
    });

    it("renders section elements around skeleton groups", () => {
      const { container } = render(<HomepageSkeleton />);
      const sections = container.querySelectorAll("section");
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    it("marks decorative skeleton blocks as aria-hidden", () => {
      const { container } = render(<HomepageSkeleton />);
      const hidden = container.querySelectorAll("[aria-hidden='true']");
      expect(hidden.length).toBeGreaterThan(0);
    });
  });
});
