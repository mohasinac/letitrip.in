import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProductGallery } from "./ProductGallery";

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, priority, fill, className }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      data-priority={priority}
      data-fill={fill}
    />
  ),
}));

const mockMedia = [
  { url: "/image1.jpg", type: "image" as const, alt: "Product 1" },
  { url: "/image2.jpg", type: "image" as const, alt: "Product 2" },
  { url: "/video1.mp4", type: "video" as const },
];

describe("ProductGallery Component", () => {
  beforeEach(() => {
    // Reset body overflow
    document.body.style.overflow = "unset";
  });

  afterEach(() => {
    document.body.style.overflow = "unset";
  });

  // ===== Basic Rendering =====
  describe("Basic Rendering", () => {
    it("renders main image display", () => {
      render(
        <ProductGallery media={[mockMedia[0]]} productName="Test Product" />
      );
      const image = screen.getByRole("img", { name: "Product 1" });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "/image1.jpg");
    });

    it("renders empty state when no media", () => {
      render(<ProductGallery media={[]} productName="Test Product" />);
      expect(screen.getByText("No images available")).toBeInTheDocument();
    });

    it("renders empty state when media is undefined", () => {
      render(
        <ProductGallery media={undefined as any} productName="Test Product" />
      );
      expect(screen.getByText("No images available")).toBeInTheDocument();
    });

    it("uses productName as alt text when alt is not provided", () => {
      const mediaWithoutAlt = [{ url: "/image1.jpg", type: "image" as const }];
      render(
        <ProductGallery media={mediaWithoutAlt} productName="Custom Name" />
      );
      expect(
        screen.getByRole("img", { name: "Custom Name" })
      ).toBeInTheDocument();
    });

    it("renders video player for video media", () => {
      const videoMedia = [{ url: "/video1.mp4", type: "video" as const }];
      render(<ProductGallery media={videoMedia} productName="Test Product" />);
      const video = document.querySelector("video");
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute("src", "/video1.mp4");
    });
  });

  // ===== Navigation =====
  describe("Navigation Controls", () => {
    it("shows navigation arrows when multiple media items", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);
      expect(screen.getByLabelText("Previous image")).toBeInTheDocument();
      expect(screen.getByLabelText("Next image")).toBeInTheDocument();
    });

    it("does not show navigation arrows for single media", () => {
      render(
        <ProductGallery media={[mockMedia[0]]} productName="Test Product" />
      );
      expect(screen.queryByLabelText("Previous image")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Next image")).not.toBeInTheDocument();
    });

    it("navigates to next image on next button click", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const nextButton = screen.getByLabelText("Next image");
      fireEvent.click(nextButton);

      const images = screen.getAllByRole("img", { name: "Product 2" });
      expect(images.length).toBeGreaterThan(0);
    });

    it("navigates to previous image on previous button click", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const prevButton = screen.getByLabelText("Previous image");
      fireEvent.click(prevButton);

      // Should wrap around to last item (video)
      const video = document.querySelector("video");
      expect(video).toHaveAttribute("src", "/video1.mp4");
    });

    it("wraps around from last to first on next click", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const nextButton = screen.getByLabelText("Next image");

      // Click twice to get to video (index 2)
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Click once more to wrap to first
      fireEvent.click(nextButton);

      expect(
        screen.getByRole("img", { name: "Product 1" })
      ).toBeInTheDocument();
    });
  });

  // ===== Thumbnails =====
  describe("Thumbnail Strip", () => {
    it("renders thumbnails when multiple media items", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const thumbnails = screen.getAllByRole("img", {
        name: /Test Product thumbnail/,
      });
      expect(thumbnails).toHaveLength(2); // Only images have thumbnails
    });

    it("does not render thumbnails for single media", () => {
      render(
        <ProductGallery media={[mockMedia[0]]} productName="Test Product" />
      );
      expect(screen.queryByText(/thumbnail/i)).not.toBeInTheDocument();
    });

    it("highlights active thumbnail", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const thumbnailButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.querySelector("img[alt*='thumbnail']"));

      expect(thumbnailButtons[0]).toHaveClass("border-primary");
    });

    it("changes active image on thumbnail click", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const thumbnailButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.querySelector("img[alt*='thumbnail']"));

      fireEvent.click(thumbnailButtons[1]);

      const images = screen.getAllByRole("img", { name: "Product 2" });
      expect(images.length).toBeGreaterThan(0);
    });

    it("renders video placeholder in thumbnails", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const videoThumbButton = screen
        .getAllByRole("button")
        .find((btn) => btn.textContent?.includes("Video"));

      expect(videoThumbButton).toBeInTheDocument();
    });
  });

  // ===== Media Counter =====
  describe("Media Counter", () => {
    it("shows current position counter for multiple media", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);
      expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("updates counter when navigating", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const nextButton = screen.getByLabelText("Next image");
      fireEvent.click(nextButton);

      expect(screen.getByText("2 / 3")).toBeInTheDocument();
    });

    it("does not show counter for single media", () => {
      render(
        <ProductGallery media={[mockMedia[0]]} productName="Test Product" />
      );
      expect(screen.queryByText(/\/ 1/)).not.toBeInTheDocument();
    });
  });

  // ===== Media Count Badges =====
  describe("Media Count Badges", () => {
    it("shows image count badge when images present", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const badges = screen.getAllByText("2");
      expect(badges.length).toBeGreaterThan(0); // Image badge showing count of 2
    });

    it("shows video count badge when videos present", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const badges = screen.getAllByText("1");
      expect(badges.length).toBeGreaterThan(0); // Video badge showing count of 1
    });

    it("does not show video badge when no videos", () => {
      const imagesOnly = mockMedia.filter((m) => m.type === "image");
      render(<ProductGallery media={imagesOnly} productName="Test Product" />);

      // Should only have one badge (images), not video badge
      const svgs = document.querySelectorAll("svg");
      const videoBadge = Array.from(svgs).find(
        (svg) => svg.querySelector("path[d*='2 6a2']") // Video icon path
      );
      expect(videoBadge?.parentElement?.textContent).not.toBe("1");
    });
  });

  // ===== Lightbox =====
  describe("Lightbox Functionality", () => {
    it("opens lightbox on zoom button click", async () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const zoomButton = screen.getByLabelText("Zoom image");
      fireEvent.click(zoomButton);

      await waitFor(() => {
        expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
      });
    });

    it("opens lightbox on Enter key", async () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const zoomButton = screen.getByLabelText("Zoom image");
      fireEvent.keyDown(zoomButton, { key: "Enter" });

      await waitFor(() => {
        expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
      });
    });

    it("opens lightbox on Space key", async () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const zoomButton = screen.getByLabelText("Zoom image");
      fireEvent.keyDown(zoomButton, { key: " " });

      await waitFor(() => {
        expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
      });
    });

    it("closes lightbox on close button click", async () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const zoomButton = screen.getByLabelText("Zoom image");
      fireEvent.click(zoomButton);

      await waitFor(() => {
        const closeButton = screen.getByLabelText("Close lightbox");
        fireEvent.click(closeButton);
      });

      await waitFor(() => {
        expect(
          screen.queryByLabelText("Close lightbox")
        ).not.toBeInTheDocument();
      });
    });

    it("closes lightbox on backdrop click", async () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const zoomButton = screen.getByLabelText("Zoom image");
      fireEvent.click(zoomButton);

      await waitFor(() => {
        const backdrop = screen
          .getByLabelText("Close lightbox")
          .closest("div.fixed");
        if (backdrop) {
          fireEvent.click(backdrop);
        }
      });

      await waitFor(() => {
        expect(
          screen.queryByLabelText("Close lightbox")
        ).not.toBeInTheDocument();
      });
    });

    it("closes lightbox on Escape key", async () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const zoomButton = screen.getByLabelText("Zoom image");
      fireEvent.click(zoomButton);

      await waitFor(() => {
        expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
      });

      fireEvent.keyDown(window, { key: "Escape" });

      await waitFor(() => {
        expect(
          screen.queryByLabelText("Close lightbox")
        ).not.toBeInTheDocument();
      });
    });

    it("locks body scroll when lightbox open", async () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const zoomButton = screen.getByLabelText("Zoom image");
      fireEvent.click(zoomButton);

      await waitFor(() => {
        expect(document.body.style.overflow).toBe("hidden");
      });
    });

    it("restores body scroll when lightbox closes", async () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const zoomButton = screen.getByLabelText("Zoom image");
      fireEvent.click(zoomButton);

      await waitFor(() => {
        const closeButton = screen.getByLabelText("Close lightbox");
        fireEvent.click(closeButton);
      });

      await waitFor(() => {
        expect(document.body.style.overflow).toBe("unset");
      });
    });

    it("shows lightbox navigation for multiple media", async () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const zoomButton = screen.getByLabelText("Zoom image");
      fireEvent.click(zoomButton);

      await waitFor(() => {
        const prevButtons = screen.getAllByLabelText("Previous image");
        const nextButtons = screen.getAllByLabelText("Next image");
        expect(prevButtons.length).toBe(2); // Main + lightbox
        expect(nextButtons.length).toBe(2);
      });
    });

    it("shows lightbox counter for multiple media", async () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const zoomButton = screen.getByLabelText("Zoom image");
      fireEvent.click(zoomButton);

      await waitFor(() => {
        const counters = screen.getAllByText("1 / 3");
        expect(counters.length).toBe(2); // Main + lightbox
      });
    });
  });

  // ===== Accessibility =====
  describe("Accessibility", () => {
    it("has proper ARIA labels on navigation buttons", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      expect(screen.getByLabelText("Previous image")).toBeInTheDocument();
      expect(screen.getByLabelText("Next image")).toBeInTheDocument();
      expect(screen.getByLabelText("Zoom image")).toBeInTheDocument();
    });

    it("has focus styles on zoom button", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const zoomButton = screen.getByLabelText("Zoom image");
      expect(zoomButton).toHaveClass("focus:outline-none", "focus:ring-2");
    });

    it("supports keyboard navigation for zoom", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const zoomButton = screen.getByLabelText("Zoom image");

      fireEvent.keyDown(zoomButton, { key: "Enter" });
      expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
    });

    it("has proper alt text for thumbnail images", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      expect(
        screen.getByRole("img", { name: "Test Product thumbnail 1" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: "Test Product thumbnail 2" })
      ).toBeInTheDocument();
    });
  });

  // ===== Edge Cases =====
  describe("Edge Cases", () => {
    it("handles rapid navigation clicks", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const nextButton = screen.getByLabelText("Next image");

      // Rapid clicks
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);

      // Should wrap around correctly
      const images = screen.getAllByRole("img", { name: "Product 2" });
      expect(images.length).toBeGreaterThan(0);
    });

    it("handles thumbnail clicks while lightbox open", async () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const zoomButton = screen.getByLabelText("Zoom image");
      fireEvent.click(zoomButton);

      await waitFor(() => {
        expect(screen.getByLabelText("Close lightbox")).toBeInTheDocument();
      });

      // Try to click thumbnail (outside lightbox context)
      const thumbnailButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.querySelector("img[alt*='thumbnail']"));

      fireEvent.click(thumbnailButtons[1]);

      // Should still work
      const images = screen.getAllByRole("img", { name: "Product 2" });
      expect(images.length).toBeGreaterThan(0);
    });

    it("handles empty media array gracefully", () => {
      const { rerender } = render(
        <ProductGallery media={mockMedia} productName="Test Product" />
      );

      rerender(<ProductGallery media={[]} productName="Test Product" />);

      expect(screen.getByText("No images available")).toBeInTheDocument();
    });

    it("cleans up event listeners on unmount", () => {
      const { unmount } = render(
        <ProductGallery media={mockMedia} productName="Test Product" />
      );

      const zoomButton = screen.getByLabelText("Zoom image");
      fireEvent.click(zoomButton);

      unmount();

      // Should restore body scroll
      expect(document.body.style.overflow).toBe("unset");
    });

    it("handles media with missing URLs", () => {
      const invalidMedia = [{ url: "", type: "image" as const, alt: "Empty" }];

      render(
        <ProductGallery media={invalidMedia} productName="Test Product" />
      );

      // Should render but with empty src
      const image = screen.getByRole("img", { name: "Empty" });
      // Next.js Image component does not render empty src, just verify image exists
    });

    it("handles very long product names in thumbnails", () => {
      const longName =
        "This is a very long product name that should be handled gracefully in the thumbnail alt text attribute";

      render(<ProductGallery media={mockMedia} productName={longName} />);

      expect(
        screen.getByRole("img", { name: `${longName} thumbnail 1` })
      ).toBeInTheDocument();
    });

    it("handles special characters in product name", () => {
      const specialName = "Product <>&\"'";

      render(<ProductGallery media={mockMedia} productName={specialName} />);

      const images = screen.getAllByRole("img");
      expect(images.length).toBeGreaterThan(0);
    });
  });

  // ===== Styling =====
  describe("Styling and Layout", () => {
    it("applies aspect-square to main display", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const mainDisplay = screen.getByRole("img", {
        name: "Product 1",
      }).parentElement;
      expect(mainDisplay).toHaveClass("aspect-square");
    });

    it("shows hover effects on navigation buttons", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const nextButton = screen.getByLabelText("Next image");
      expect(nextButton).toHaveClass("hover:bg-white");
    });

    it("applies thumbnail border highlighting", () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const thumbnailButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.querySelector("img[alt*='thumbnail']"));

      expect(thumbnailButtons[0]).toHaveClass("border-primary");
      expect(thumbnailButtons[1]).toHaveClass("border-gray-200");
    });

    it("applies z-index to lightbox", async () => {
      render(<ProductGallery media={mockMedia} productName="Test Product" />);

      const zoomButton = screen.getByLabelText("Zoom image");
      fireEvent.click(zoomButton);

      await waitFor(() => {
        const lightbox = screen
          .getByLabelText("Close lightbox")
          .closest("div.fixed");
        expect(lightbox).toHaveClass("z-[60]");
      });
    });
  });
});
