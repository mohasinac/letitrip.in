/**
 * ImageGallery Tests — Wave 1 (HorizontalScroller thumbnail strip)
 *
 * Covers:
 * - Gallery renders images
 * - Thumbnail strip uses HorizontalScroller (not raw div)
 * - Navigating via thumbnail click
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@/hooks", () => ({
  useSwipe: jest.fn(),
  useGesture: jest.fn(() => ({})),
}));

jest.mock("@/components", () => ({
  HorizontalScroller: ({
    children,
    className,
    snapToItems,
  }: {
    children: React.ReactNode;
    className?: string;
    snapToItems?: boolean;
  }) => (
    <div
      data-testid="horizontal-scroller"
      data-snap={snapToItems ? "true" : "false"}
      className={className}
    >
      {children}
    </div>
  ),
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      border: "border-gray-200",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-600",
      textMuted: "text-gray-400",
      bgOverlay: "bg-black/50",
    },
    spacing: { padding: { md: "p-4" } },
  },
}));

import ImageGallery from "../ImageGallery";

const images = [
  { src: "/img1.jpg", alt: "Image 1", thumbnail: "/thumb1.jpg" },
  { src: "/img2.jpg", alt: "Image 2", thumbnail: "/thumb2.jpg" },
  { src: "/img3.jpg", alt: "Image 3", thumbnail: "/thumb3.jpg" },
];

describe("ImageGallery", () => {
  it("renders the first image by default", () => {
    render(<ImageGallery images={images} />);
    // Image 1 appears twice: main display + thumbnail
    const imagesWithAlt = screen.getAllByAltText("Image 1");
    expect(imagesWithAlt.length).toBeGreaterThanOrEqual(1);
  });

  it("renders thumbnails inside HorizontalScroller when showThumbnails=true (default)", () => {
    render(<ImageGallery images={images} />);
    const scroller = screen.getByTestId("horizontal-scroller");
    expect(scroller).toBeInTheDocument();
    // snapToItems should be passed
    expect(scroller).toHaveAttribute("data-snap", "true");
  });

  it("does NOT render HorizontalScroller when showThumbnails=false", () => {
    render(<ImageGallery images={images} showThumbnails={false} />);
    expect(screen.queryByTestId("horizontal-scroller")).not.toBeInTheDocument();
  });

  it("does not render thumbnail strip when only one image", () => {
    render(<ImageGallery images={[images[0]]} />);
    expect(screen.queryByTestId("horizontal-scroller")).not.toBeInTheDocument();
  });

  it("clicking a thumbnail navigates to that image", () => {
    render(<ImageGallery images={images} />);
    // Initially Image 1 is main — Image 3 appears only once (thumbnail)
    expect(screen.getAllByAltText("Image 3")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: /View image 3/i }));
    // After navigation, Image 3 is both main + thumbnail → appears twice
    expect(screen.getAllByAltText("Image 3")).toHaveLength(2);
  });
});
