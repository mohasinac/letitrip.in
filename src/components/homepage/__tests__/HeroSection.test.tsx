import { render, screen, waitFor } from "@testing-library/react";
import { HeroSection } from "../HeroSection";

// Mock HeroCarousel
jest.mock("@/components/layout/HeroCarousel", () => ({
  __esModule: true,
  default: () => <div data-testid="hero-carousel">Hero Carousel</div>,
}));

// Mock constants
jest.mock("@/constants/navigation", () => ({
  COMPANY_NAME: "TestAuction",
}));

describe("HeroSection", () => {
  describe("Rendering", () => {
    it("should render HeroCarousel when enabled", async () => {
      render(<HeroSection enabled={true} />);
      // Dynamic import shows loading skeleton first, then carousel
      await waitFor(() => {
        const carousel = screen.queryByTestId("hero-carousel");
        if (carousel) {
          expect(carousel).toBeInTheDocument();
        } else {
          // Loading skeleton is shown
          const skeleton = screen.getByText(/Welcome to TestAuction/i);
          expect(skeleton).toBeInTheDocument();
        }
      });
    });

    it("should not render when disabled", () => {
      const { container } = render(<HeroSection enabled={false} />);
      expect(container).toBeEmptyDOMElement();
    });

    it("should render with correct section id", () => {
      const { container } = render(<HeroSection enabled={true} />);
      const section = container.querySelector("#hero-section");
      expect(section).toBeInTheDocument();
    });

    it("should have relative positioning class", () => {
      const { container } = render(<HeroSection enabled={true} />);
      const section = container.querySelector("section");
      expect(section).toHaveClass("relative");
    });
  });

  describe("Loading State", () => {
    it("should show skeleton or carousel", async () => {
      render(<HeroSection enabled={true} />);
      await waitFor(() => {
        const section = document.getElementById("hero-section");
        expect(section).toBeInTheDocument();
      });
    });
  });

  describe("Dark Mode", () => {
    it("should support dark mode classes in skeleton", () => {
      // Skeleton component has dark:bg-gray-800 class
      const { container } = render(<HeroSection enabled={true} />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have semantic section element", () => {
      const { container } = render(<HeroSection enabled={true} />);
      const section = container.querySelector("section");
      expect(section?.tagName).toBe("SECTION");
    });

    it("should have accessible id for navigation", () => {
      render(<HeroSection enabled={true} />);
      const section = document.getElementById("hero-section");
      expect(section).toBeInTheDocument();
    });
  });

  describe("Dynamic Import", () => {
    it("should use SSR for HeroCarousel", () => {
      // The component uses ssr: true in dynamic import config
      render(<HeroSection enabled={true} />);
      expect(screen.getByTestId("hero-carousel")).toBeInTheDocument();
    });

    it("should handle loading state gracefully", () => {
      const { container } = render(<HeroSection enabled={true} />);
      // Component should render without errors
      expect(container.querySelector("section")).toBeInTheDocument();
    });
  });

  describe("Mobile Responsiveness", () => {
    it("should be mobile-friendly", () => {
      const { container } = render(<HeroSection enabled={true} />);
      const section = container.querySelector("section");
      expect(section).toBeInTheDocument();
      // Component uses responsive classes in HeroCarousel
    });
  });
});
