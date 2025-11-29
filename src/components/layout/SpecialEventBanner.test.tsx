import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SpecialEventBanner from "./SpecialEventBanner";
import { homepageService } from "@/services/homepage.service";

// Mock dependencies
jest.mock("@/services/homepage.service");
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

const mockBannerSettings = {
  enabled: true,
  content: "Special Sale! Get 50% off on all items",
  link: "/sale",
  backgroundColor: "#2563eb",
  textColor: "#ffffff",
};

describe("SpecialEventBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (homepageService.getBanner as jest.Mock).mockResolvedValue(
      mockBannerSettings,
    );
  });

  // Basic Rendering
  describe("Basic Rendering", () => {
    it("renders banner when enabled", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        expect(screen.getByText(/Special Sale/)).toBeInTheDocument();
      });
    });

    it("displays banner content", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        expect(
          screen.getByText(/Get 50% off on all items/),
        ).toBeInTheDocument();
      });
    });

    it("has banner id", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        expect(
          document.getElementById("special-event-banner"),
        ).toBeInTheDocument();
      });
    });

    it("renders close button", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        expect(screen.getByLabelText("Close banner")).toBeInTheDocument();
      });
    });
  });

  // Banner Loading
  describe("Banner Loading", () => {
    it("fetches banner settings on mount", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        expect(homepageService.getBanner).toHaveBeenCalled();
      });
    });

    it("does not render during loading", () => {
      (homepageService.getBanner as jest.Mock).mockImplementation(
        () => new Promise(() => {}),
      );
      render(<SpecialEventBanner />);
      expect(screen.queryByText(/Special Sale/)).not.toBeInTheDocument();
    });

    it("handles API error gracefully", async () => {
      (homepageService.getBanner as jest.Mock).mockRejectedValue(
        new Error("API Error"),
      );
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      render(<SpecialEventBanner />);
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to load banner settings:",
          expect.any(Error),
        );
      });
      consoleSpy.mockRestore();
    });

    it("does not render after error", async () => {
      (homepageService.getBanner as jest.Mock).mockRejectedValue(
        new Error("API Error"),
      );
      render(<SpecialEventBanner />);
      await waitFor(() => {
        expect(screen.queryByText(/Special Sale/)).not.toBeInTheDocument();
      });
    });
  });

  // Enabled/Disabled
  describe("Enabled/Disabled", () => {
    it("renders when enabled is true", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        expect(screen.getByText(/Special Sale/)).toBeInTheDocument();
      });
    });

    it("does not render when enabled is false", async () => {
      (homepageService.getBanner as jest.Mock).mockResolvedValue({
        ...mockBannerSettings,
        enabled: false,
      });
      render(<SpecialEventBanner />);
      await waitFor(() => {
        expect(screen.queryByText(/Special Sale/)).not.toBeInTheDocument();
      });
    });

    it("does not render when settings is null", async () => {
      (homepageService.getBanner as jest.Mock).mockResolvedValue(null);
      render(<SpecialEventBanner />);
      await waitFor(() => {
        expect(screen.queryByText(/Special Sale/)).not.toBeInTheDocument();
      });
    });
  });

  // Link Rendering
  describe("Link Rendering", () => {
    it("renders as link when link is provided", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const link = screen.getByText(/Special Sale/).closest("a");
        expect(link).toHaveAttribute("href", "/sale");
      });
    });

    it("does not render as link when link is missing", async () => {
      (homepageService.getBanner as jest.Mock).mockResolvedValue({
        ...mockBannerSettings,
        link: undefined,
      });
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const link = screen.getByText(/Special Sale/).closest("a");
        expect(link).not.toBeInTheDocument();
      });
    });

    it("renders as clickable link", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const link = screen.getByText(/Special Sale/).closest("a");
        expect(link).toHaveAttribute("href", "/sale");
      });
    });
  });

  // Close Button
  describe("Close Button", () => {
    it("hides banner when close is clicked", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const closeButton = screen.getByLabelText("Close banner");
        fireEvent.click(closeButton);
      });
      await waitFor(() => {
        expect(screen.queryByText(/Special Sale/)).not.toBeInTheDocument();
      });
    });

    it("close button has aria-label", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        expect(screen.getByLabelText("Close banner")).toBeInTheDocument();
      });
    });

    it("close button is positioned absolutely", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const closeButton = screen.getByLabelText("Close banner");
        expect(closeButton).toHaveClass("absolute");
      });
    });
  });

  // Custom Styling
  describe("Custom Styling", () => {
    it("applies custom background color", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const banner = document.getElementById("special-event-banner");
        expect(banner).toHaveStyle({ backgroundColor: "#2563eb" });
      });
    });

    it("applies custom text color", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const banner = document.getElementById("special-event-banner");
        expect(banner).toHaveStyle({ color: "#ffffff" });
      });
    });

    it("uses default background color when not provided", async () => {
      (homepageService.getBanner as jest.Mock).mockResolvedValue({
        ...mockBannerSettings,
        backgroundColor: undefined,
      });
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const banner = document.getElementById("special-event-banner");
        expect(banner).toHaveStyle({ backgroundColor: "#2563eb" });
      });
    });

    it("uses default text color when not provided", async () => {
      (homepageService.getBanner as jest.Mock).mockResolvedValue({
        ...mockBannerSettings,
        textColor: undefined,
      });
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const banner = document.getElementById("special-event-banner");
        expect(banner).toHaveStyle({ color: "#ffffff" });
      });
    });
  });

  // HTML Content
  describe("HTML Content", () => {
    it("renders HTML content", async () => {
      (homepageService.getBanner as jest.Mock).mockResolvedValue({
        ...mockBannerSettings,
        content: "<strong>Bold Text</strong> and normal text",
      });
      render(<SpecialEventBanner />);
      await waitFor(() => {
        expect(screen.getByText("Bold Text")).toBeInTheDocument();
      });
    });

    it("renders plain text content", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        expect(screen.getByText(/Special Sale/)).toBeInTheDocument();
      });
    });

    it("handles empty content", async () => {
      (homepageService.getBanner as jest.Mock).mockResolvedValue({
        ...mockBannerSettings,
        content: "",
      });
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const banner = document.getElementById("special-event-banner");
        expect(banner).toBeInTheDocument();
      });
    });
  });

  // Styling
  describe("Styling", () => {
    it("has padding", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const banner = document.getElementById("special-event-banner");
        expect(banner).toHaveClass("py-2", "px-4");
      });
    });

    it("has relative positioning", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const banner = document.getElementById("special-event-banner");
        expect(banner).toHaveClass("relative");
      });
    });

    it("content is centered", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const content = document.querySelector(".justify-center");
        expect(content).toBeInTheDocument();
      });
    });

    it("has responsive text size", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const content = document.querySelector(".text-sm.md\\:text-base");
        expect(content).toBeInTheDocument();
      });
    });
  });

  // Prose Styling
  describe("Prose Styling", () => {
    it("applies prose styles", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const prose = document.querySelector(".prose");
        expect(prose).toBeInTheDocument();
      });
    });

    it("has centered text", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const prose = document.querySelector(".text-center");
        expect(prose).toBeInTheDocument();
      });
    });

    it("has no max-width constraint", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const prose = document.querySelector(".max-w-none");
        expect(prose).toBeInTheDocument();
      });
    });
  });

  // Close Button Hover
  describe("Close Button Hover", () => {
    it("has hover background", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const closeButton = screen.getByLabelText("Close banner");
        expect(closeButton).toHaveClass("hover:bg-white/20");
      });
    });

    it("has rounded corners", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const closeButton = screen.getByLabelText("Close banner");
        expect(closeButton).toHaveClass("rounded");
      });
    });

    it("has transition effect", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const closeButton = screen.getByLabelText("Close banner");
        expect(closeButton).toHaveClass("transition-colors");
      });
    });
  });

  // Visibility State
  describe("Visibility State", () => {
    it("is visible initially", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        expect(screen.getByText(/Special Sale/)).toBeInTheDocument();
      });
    });

    it("stays hidden after closing", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const closeButton = screen.getByLabelText("Close banner");
        fireEvent.click(closeButton);
      });
      await waitFor(() => {
        expect(screen.queryByText(/Special Sale/)).not.toBeInTheDocument();
      });
      // Check it doesn't reappear
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(screen.queryByText(/Special Sale/)).not.toBeInTheDocument();
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("handles very long content", async () => {
      (homepageService.getBanner as jest.Mock).mockResolvedValue({
        ...mockBannerSettings,
        content:
          "This is a very long banner content that should still render properly even with many words and characters in it",
      });
      render(<SpecialEventBanner />);
      await waitFor(() => {
        expect(
          screen.getByText(/very long banner content/),
        ).toBeInTheDocument();
      });
    });

    it("handles special characters in content", async () => {
      (homepageService.getBanner as jest.Mock).mockResolvedValue({
        ...mockBannerSettings,
        content: "Sale! 50% & free shipping - Don't miss out!",
      });
      render(<SpecialEventBanner />);
      await waitFor(() => {
        expect(screen.getByText(/50% & free shipping/)).toBeInTheDocument();
      });
    });

    it("handles missing content", async () => {
      (homepageService.getBanner as jest.Mock).mockResolvedValue({
        enabled: true,
        content: "",
      });
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const banner = document.getElementById("special-event-banner");
        expect(banner).toBeInTheDocument();
      });
    });

    it("handles custom colors", async () => {
      (homepageService.getBanner as jest.Mock).mockResolvedValue({
        ...mockBannerSettings,
        backgroundColor: "#ff0000",
        textColor: "#00ff00",
      });
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const banner = document.getElementById("special-event-banner");
        expect(banner).toHaveStyle({
          backgroundColor: "#ff0000",
          color: "#00ff00",
        });
      });
    });
  });

  // Accessibility
  describe("Accessibility", () => {
    it("close button has aria-label", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        expect(screen.getByLabelText("Close banner")).toBeInTheDocument();
      });
    });

    it("link is accessible when provided", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", "/sale");
      });
    });

    it("has semantic structure", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const banner = document.getElementById("special-event-banner");
        expect(banner).toBeInTheDocument();
      });
    });
  });

  // Container Layout
  describe("Container Layout", () => {
    it("has container with max-width", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const container = document.querySelector(".container");
        expect(container).toBeInTheDocument();
      });
    });

    it("uses flex layout", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const flex = document.querySelector(".flex.items-center");
        expect(flex).toBeInTheDocument();
      });
    });

    it("centers content", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const centered = document.querySelector(".justify-center");
        expect(centered).toBeInTheDocument();
      });
    });
  });

  // Close Button Icon
  describe("Close Button Icon", () => {
    it("renders X icon", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const closeButton = screen.getByLabelText("Close banner");
        expect(closeButton.querySelector("svg")).toBeInTheDocument();
      });
    });

    it("icon has correct size", async () => {
      render(<SpecialEventBanner />);
      await waitFor(() => {
        const icon = document.querySelector(".w-4.h-4");
        expect(icon).toBeInTheDocument();
      });
    });
  });
});
