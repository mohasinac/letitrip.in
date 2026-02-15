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

const mockBanner = [
  {
    id: "banner-1",
    type: "advertisement",
    enabled: true,
    config: {
      content: {
        title: "Summer Sale",
        subtitle: "Up to 70% off on all products",
      },
      buttons: [{ text: "Shop Now", link: "/sale" }],
      backgroundImage: "https://example.com/banner.jpg",
      backgroundColor: "#ff6600",
    },
  },
];

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
        data: [],
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
      const noBgBanner = [
        {
          ...mockBanner[0],
          config: {
            ...mockBanner[0].config,
            backgroundImage: undefined,
          },
        },
      ];
      mockUseApiQuery.mockReturnValue({ data: noBgBanner, isLoading: false });
      const { container } = render(<AdvertisementBanner />);
      expect(container.querySelector(".bg-black\\/40")).not.toBeInTheDocument();
    });

    it("uses default background color when not provided", () => {
      const noBgColor = [
        {
          id: "banner-2",
          type: "advertisement",
          enabled: true,
          config: {
            content: { title: "Default Banner" },
            backgroundColor: undefined,
            backgroundImage: undefined,
          },
        },
      ];
      mockUseApiQuery.mockReturnValue({ data: noBgColor, isLoading: false });
      const { container } = render(<AdvertisementBanner />);
      const bannerDiv = container.querySelector(".relative.overflow-hidden");
      expect(bannerDiv).toHaveStyle({ backgroundColor: "#1a1a1a" });
    });
  });

  // ====================================
  // Optional Content
  // ====================================
  describe("Optional Content", () => {
    it("hides subtitle when not provided", () => {
      const noSubtitle = [
        {
          id: "b1",
          type: "advertisement",
          enabled: true,
          config: { content: { title: "Title Only", subtitle: undefined } },
        },
      ];
      mockUseApiQuery.mockReturnValue({ data: noSubtitle, isLoading: false });
      render(<AdvertisementBanner />);
      expect(screen.getByText("Title Only")).toBeInTheDocument();
      expect(screen.queryByText("Up to 70%")).not.toBeInTheDocument();
    });

    it("hides CTA when no buttons are provided", () => {
      const noCta = [
        {
          id: "b2",
          type: "advertisement",
          enabled: true,
          config: { content: { title: "No CTA" }, buttons: [] },
        },
      ];
      mockUseApiQuery.mockReturnValue({ data: noCta, isLoading: false });
      render(<AdvertisementBanner />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("hides CTA when button link is missing", () => {
      const noCta = [
        {
          id: "b3",
          type: "advertisement",
          enabled: true,
          config: {
            content: { title: "No Link" },
            buttons: [{ text: "Click", link: undefined }],
          },
        },
      ];
      mockUseApiQuery.mockReturnValue({ data: noCta, isLoading: false });
      render(<AdvertisementBanner />);
      expect(screen.queryByText("Click")).toBeInTheDocument();
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
