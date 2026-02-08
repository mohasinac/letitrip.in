import { render, screen } from "@testing-library/react";
import { WelcomeSection } from "../WelcomeSection";

// Mock useApiQuery
const mockUseApiQuery = jest.fn();
jest.mock("@/hooks", () => ({
  useApiQuery: (...args: unknown[]) => mockUseApiQuery(...args),
}));

// Mock Button component
jest.mock("@/components", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

const mockWelcomeData = {
  section: {
    h1: "Welcome to LetItRip",
    subtitle: "Your trusted marketplace",
    description: "<p>Find amazing products and great deals.</p>",
    showCTA: true,
    ctaText: "Shop Now",
    ctaLink: "/products",
  },
};

describe("WelcomeSection", () => {
  beforeEach(() => {
    mockUseApiQuery.mockReset();
  });

  // ====================================
  // Loading State
  // ====================================
  describe("Loading State", () => {
    it("renders loading skeleton when loading", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: true });
      const { container } = render(<WelcomeSection />);
      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });

    it("renders a section during loading", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: true });
      const { container } = render(<WelcomeSection />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });
  });

  // ====================================
  // No Data State
  // ====================================
  describe("No Data State", () => {
    it("returns null when no data", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: false });
      const { container } = render(<WelcomeSection />);
      expect(container.innerHTML).toBe("");
    });

    it("returns null when section is missing", () => {
      mockUseApiQuery.mockReturnValue({ data: {}, isLoading: false });
      const { container } = render(<WelcomeSection />);
      expect(container.innerHTML).toBe("");
    });
  });

  // ====================================
  // Content Rendering
  // ====================================
  describe("Content Rendering", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({
        data: mockWelcomeData,
        isLoading: false,
      });
    });

    it("renders the h1 heading", () => {
      render(<WelcomeSection />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Welcome to LetItRip");
    });

    it("renders the subtitle", () => {
      render(<WelcomeSection />);
      expect(screen.getByText("Your trusted marketplace")).toBeInTheDocument();
    });

    it("renders the rich text description via dangerouslySetInnerHTML", () => {
      render(<WelcomeSection />);
      expect(
        screen.getByText("Find amazing products and great deals."),
      ).toBeInTheDocument();
    });

    it("renders the CTA button", () => {
      render(<WelcomeSection />);
      expect(screen.getByText("Shop Now")).toBeInTheDocument();
    });

    it("renders as a section element", () => {
      const { container } = render(<WelcomeSection />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });
  });

  // ====================================
  // CTA Visibility
  // ====================================
  describe("CTA Visibility", () => {
    it("hides CTA when showCTA is false", () => {
      mockUseApiQuery.mockReturnValue({
        data: { section: { ...mockWelcomeData.section, showCTA: false } },
        isLoading: false,
      });
      render(<WelcomeSection />);
      expect(screen.queryByText("Shop Now")).not.toBeInTheDocument();
    });

    it("hides CTA when ctaText is missing", () => {
      mockUseApiQuery.mockReturnValue({
        data: { section: { ...mockWelcomeData.section, ctaText: undefined } },
        isLoading: false,
      });
      render(<WelcomeSection />);
      expect(screen.queryByText("Shop Now")).not.toBeInTheDocument();
    });

    it("hides CTA when ctaLink is missing", () => {
      mockUseApiQuery.mockReturnValue({
        data: { section: { ...mockWelcomeData.section, ctaLink: undefined } },
        isLoading: false,
      });
      render(<WelcomeSection />);
      expect(screen.queryByText("Shop Now")).not.toBeInTheDocument();
    });
  });

  // ====================================
  // Optional Content
  // ====================================
  describe("Optional Content", () => {
    it("hides subtitle when not provided", () => {
      mockUseApiQuery.mockReturnValue({
        data: { section: { ...mockWelcomeData.section, subtitle: "" } },
        isLoading: false,
      });
      render(<WelcomeSection />);
      expect(
        screen.queryByText("Your trusted marketplace"),
      ).not.toBeInTheDocument();
    });

    it("hides description when not provided", () => {
      mockUseApiQuery.mockReturnValue({
        data: { section: { ...mockWelcomeData.section, description: "" } },
        isLoading: false,
      });
      render(<WelcomeSection />);
      expect(
        screen.queryByText("Find amazing products and great deals."),
      ).not.toBeInTheDocument();
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    it("uses h1 for the main heading", () => {
      mockUseApiQuery.mockReturnValue({
        data: mockWelcomeData,
        isLoading: false,
      });
      render(<WelcomeSection />);
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("main heading text is visible", () => {
      mockUseApiQuery.mockReturnValue({
        data: mockWelcomeData,
        isLoading: false,
      });
      render(<WelcomeSection />);
      expect(screen.getByText("Welcome to LetItRip")).toBeVisible();
    });
  });
});
