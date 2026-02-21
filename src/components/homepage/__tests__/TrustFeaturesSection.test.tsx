import { render, screen } from "@testing-library/react";
import { TrustFeaturesSection } from "../TrustFeaturesSection";

// Mock IntersectionObserver (not available in jsdom)
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
beforeAll(() => {
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: jest.fn().mockImplementation((cb: IntersectionObserverCallback) => {
      // Immediately fire as visible
      cb(
        [{ isIntersecting: true }] as IntersectionObserverEntry[],
        {} as IntersectionObserver,
      );
      return { observe: mockObserve, disconnect: mockDisconnect };
    }),
  });
});

describe("TrustFeaturesSection", () => {
  // ====================================
  // Rendering
  // ====================================
  describe("Rendering", () => {
    it("renders as a section element", () => {
      const { container } = render(<TrustFeaturesSection />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });

    it("renders all 4 feature cards", () => {
      render(<TrustFeaturesSection />);
      expect(screen.getByText("Secure Payments")).toBeInTheDocument();
      expect(screen.getByText("Fast Delivery")).toBeInTheDocument();
      expect(screen.getByText("Easy Returns")).toBeInTheDocument();
      expect(screen.getByText("24/7 Support")).toBeInTheDocument();
    });

    it("renders descriptions for each feature", () => {
      render(<TrustFeaturesSection />);
      expect(screen.getByText(/Multiple payment options/)).toBeInTheDocument();
      expect(screen.getByText(/Delivery in 2/)).toBeInTheDocument();
      expect(screen.getByText(/7-day hassle-free/)).toBeInTheDocument();
      expect(screen.getByText(/Round-the-clock/)).toBeInTheDocument();
    });
  });

  // ====================================
  // Icons
  // ====================================
  describe("Icons", () => {
    it("renders 4 lucide icon SVGs", () => {
      const { container } = render(<TrustFeaturesSection />);
      // Each card has one SVG for the lucide icon
      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThanOrEqual(4);
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    it("renders h3 headings for each card", () => {
      render(<TrustFeaturesSection />);
      const headings = screen.getAllByRole("heading", { level: 3 });
      expect(headings).toHaveLength(4);
    });

    it("uses a 2-col or 4-col grid layout", () => {
      const { container } = render(<TrustFeaturesSection />);
      expect(container.querySelector("[class*='grid']")).toBeInTheDocument();
    });
  });

  // ====================================
  // Animation (IntersectionObserver)
  // ====================================
  describe("Animation", () => {
    it("calls IntersectionObserver observe on mount", () => {
      render(<TrustFeaturesSection />);
      expect(mockObserve).toHaveBeenCalled();
    });
  });
});
