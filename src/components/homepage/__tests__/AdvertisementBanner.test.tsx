import { render, screen } from "@testing-library/react";
import { AdvertisementBanner } from "../AdvertisementBanner";

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

const mockBanner = {
  section: {
    id: "banner-1",
    title: "Summer Sale",
    subtitle: "Up to 70% off on all products",
    ctaText: "Shop Now",
    ctaLink: "/sale",
    backgroundImage: "https://example.com/banner.jpg",
    backgroundColor: "#ff6600",
    textColor: "#ffffff",
  },
};

describe("AdvertisementBanner", () => {
  beforeEach(() => {
    mockUseApiQuery.mockReset();
  });

  // ====================================
  // Loading State
  // ====================================
  describe("Loading State", () => {
    it("renders loading skeleton when loading", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: true });
      const { container } = render(<AdvertisementBanner />);
      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });
  });

  // ====================================
  // No Data State
  // ====================================
  describe("No Data State", () => {
    it("returns null when no banner data", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: false });
      const { container } = render(<AdvertisementBanner />);
      expect(container.innerHTML).toBe("");
    });

    it("returns null when section is undefined", () => {
      mockUseApiQuery.mockReturnValue({
        data: { section: undefined },
        isLoading: false,
      });
      const { container } = render(<AdvertisementBanner />);
      expect(container.innerHTML).toBe("");
    });
  });

  // ====================================
  // Content Rendering
  // ====================================
  describe("Content Rendering", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({ data: mockBanner, isLoading: false });
    });

    it("renders the banner title", () => {
      render(<AdvertisementBanner />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Summer Sale",
      );
    });

    it("renders the subtitle", () => {
      render(<AdvertisementBanner />);
      expect(
        screen.getByText("Up to 70% off on all products"),
      ).toBeInTheDocument();
    });

    it("renders the CTA button", () => {
      render(<AdvertisementBanner />);
      expect(screen.getByText("Shop Now")).toBeInTheDocument();
    });

    it("applies textColor to heading", () => {
      render(<AdvertisementBanner />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveStyle({ color: "#ffffff" });
    });

    it("applies textColor to subtitle", () => {
      render(<AdvertisementBanner />);
      const subtitle = screen.getByText("Up to 70% off on all products");
      expect(subtitle).toHaveStyle({ color: "#ffffff" });
    });
  });

  // ====================================
  // Dynamic Styling
  // ====================================
  describe("Dynamic Styling", () => {
    it("applies backgroundColor from banner data", () => {
      mockUseApiQuery.mockReturnValue({ data: mockBanner, isLoading: false });
      const { container } = render(<AdvertisementBanner />);
      const bannerDiv = container.querySelector(".relative.overflow-hidden");
      expect(bannerDiv).toHaveStyle({ backgroundColor: "#ff6600" });
    });

    it("applies backgroundImage from banner data", () => {
      mockUseApiQuery.mockReturnValue({ data: mockBanner, isLoading: false });
      const { container } = render(<AdvertisementBanner />);
      const bannerDiv = container.querySelector(".relative.overflow-hidden");
      expect(bannerDiv).toHaveStyle({
        backgroundImage: "url(https://example.com/banner.jpg)",
      });
    });

    it("renders overlay when backgroundImage is present", () => {
      mockUseApiQuery.mockReturnValue({ data: mockBanner, isLoading: false });
      const { container } = render(<AdvertisementBanner />);
      expect(container.querySelector(".bg-black\\/40")).toBeInTheDocument();
    });

    it("does not render overlay when no backgroundImage", () => {
      const noBgBanner = {
        section: {
          ...mockBanner.section,
          backgroundImage: undefined,
        },
      };
      mockUseApiQuery.mockReturnValue({ data: noBgBanner, isLoading: false });
      const { container } = render(<AdvertisementBanner />);
      expect(container.querySelector(".bg-black\\/40")).not.toBeInTheDocument();
    });

    it("uses default background color when not provided", () => {
      const noBgColor = {
        section: {
          id: "banner-2",
          title: "Default Banner",
          backgroundColor: undefined,
          backgroundImage: undefined,
          textColor: undefined,
        },
      };
      mockUseApiQuery.mockReturnValue({ data: noBgColor, isLoading: false });
      const { container } = render(<AdvertisementBanner />);
      const bannerDiv = container.querySelector(".relative.overflow-hidden");
      expect(bannerDiv).toHaveStyle({ backgroundColor: "#1a1a1a" });
    });

    it("uses default text color when not provided", () => {
      const noTextColor = {
        section: {
          id: "banner-3",
          title: "No Color Banner",
          textColor: undefined,
        },
      };
      mockUseApiQuery.mockReturnValue({ data: noTextColor, isLoading: false });
      render(<AdvertisementBanner />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveStyle({ color: "#ffffff" });
    });
  });

  // ====================================
  // Optional Content
  // ====================================
  describe("Optional Content", () => {
    it("hides subtitle when not provided", () => {
      const noSubtitle = {
        section: { id: "b1", title: "Title Only", subtitle: undefined },
      };
      mockUseApiQuery.mockReturnValue({ data: noSubtitle, isLoading: false });
      render(<AdvertisementBanner />);
      expect(screen.getByText("Title Only")).toBeInTheDocument();
      expect(screen.queryByText("Up to 70%")).not.toBeInTheDocument();
    });

    it("hides CTA when ctaText is missing", () => {
      const noCta = {
        section: {
          id: "b2",
          title: "No CTA",
          ctaText: undefined,
          ctaLink: "/link",
        },
      };
      mockUseApiQuery.mockReturnValue({ data: noCta, isLoading: false });
      render(<AdvertisementBanner />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("hides CTA when ctaLink is missing", () => {
      const noCta = {
        section: {
          id: "b3",
          title: "No Link",
          ctaText: "Click",
          ctaLink: undefined,
        },
      };
      mockUseApiQuery.mockReturnValue({ data: noCta, isLoading: false });
      render(<AdvertisementBanner />);
      expect(screen.queryByText("Click")).not.toBeInTheDocument();
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    it("uses h2 for the banner title", () => {
      mockUseApiQuery.mockReturnValue({ data: mockBanner, isLoading: false });
      render(<AdvertisementBanner />);
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    });

    it("renders as a section element", () => {
      mockUseApiQuery.mockReturnValue({ data: mockBanner, isLoading: false });
      const { container } = render(<AdvertisementBanner />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });
  });
});
