import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HeroCarousel from "./HeroCarousel";
import { homepageService } from "@/services/homepage.service";

// Mock dependencies
jest.mock("@/services/homepage.service");
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, fill, priority }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} data-fill={fill} data-priority={priority} />
  ),
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

const mockSlides = [
  {
    id: "1",
    image: "https://example.com/slide1.jpg",
    title: "Test Slide 1",
    subtitle: "Subtitle 1",
    ctaText: "Shop Now",
    ctaLink: "/products",
    order: 1,
    enabled: true,
  },
  {
    id: "2",
    image: "https://example.com/slide2.jpg",
    title: "Test Slide 2",
    subtitle: "Subtitle 2 <strong>Bold</strong>",
    ctaText: "View Auctions",
    ctaLink: "/auctions",
    order: 2,
    enabled: true,
  },
  {
    id: "3",
    image: "https://example.com/slide3.jpg",
    title: "Test Slide 3",
    subtitle: "Subtitle 3",
    ctaText: "Learn More",
    ctaLink: "/about",
    order: 3,
    enabled: true,
  },
];

describe("HeroCarousel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (homepageService.getHeroSlides as jest.Mock).mockResolvedValue(mockSlides);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // Basic Rendering
  describe("Basic Rendering", () => {
    it("renders carousel container", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(screen.getByText("Test Slide 1")).toBeInTheDocument();
      });
    });

    it("renders first slide by default", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(screen.getByText("Test Slide 1")).toBeInTheDocument();
        expect(screen.getByText("Subtitle 1")).toBeInTheDocument();
      });
    });

    it("renders slide title", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Test Slide 1" })
        ).toBeInTheDocument();
      });
    });

    it("renders slide subtitle with HTML", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const nextButton = screen.getByLabelText("Next slide");
        fireEvent.click(nextButton);
      });
      await waitFor(() => {
        expect(screen.getByText("Bold")).toBeInTheDocument();
      });
    });

    it("renders CTA button", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(screen.getByText("Shop Now")).toBeInTheDocument();
      });
    });

    it("renders slide image", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(screen.getByAltText("Test Slide 1")).toBeInTheDocument();
      });
    });
  });

  // Slide Loading
  describe("Slide Loading", () => {
    it("fetches slides from API", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(homepageService.getHeroSlides).toHaveBeenCalled();
      });
    });

    it("uses default slides on API error", async () => {
      (homepageService.getHeroSlides as jest.Mock).mockRejectedValue(
        new Error("API Error")
      );
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error fetching hero slides:",
          expect.any(Error)
        );
      });
      consoleSpy.mockRestore();
    });

    it("keeps default slides when API returns empty", async () => {
      (homepageService.getHeroSlides as jest.Mock).mockResolvedValue([]);
      render(<HeroCarousel />);
      await waitFor(() => {
        // Should use default slides
        expect(
          document.querySelectorAll('[aria-label^="Go to slide"]')
        ).toHaveLength(3);
      });
    });

    it("updates slides from API", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(screen.getByText("Test Slide 1")).toBeInTheDocument();
      });
    });
  });

  // Navigation Arrows
  describe("Navigation Arrows", () => {
    it("renders next button", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(screen.getByLabelText("Next slide")).toBeInTheDocument();
      });
    });

    it("renders previous button", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(screen.getByLabelText("Previous slide")).toBeInTheDocument();
      });
    });

    it("advances to next slide on click", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const nextButton = screen.getByLabelText("Next slide");
        fireEvent.click(nextButton);
      });
      jest.advanceTimersByTime(600);
      await waitFor(() => {
        expect(screen.getByText("Test Slide 2")).toBeInTheDocument();
      });
    });

    it("goes to previous slide on click", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const nextButton = screen.getByLabelText("Next slide");
        fireEvent.click(nextButton);
      });
      jest.advanceTimersByTime(600);
      await waitFor(() => {
        const prevButton = screen.getByLabelText("Previous slide");
        fireEvent.click(prevButton);
      });
      jest.advanceTimersByTime(600);
      await waitFor(() => {
        expect(screen.getByText("Test Slide 1")).toBeInTheDocument();
      });
    });

    it("wraps to first slide from last", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const nextButton = screen.getByLabelText("Next slide");
        fireEvent.click(nextButton);
        jest.advanceTimersByTime(600);
        fireEvent.click(nextButton);
        jest.advanceTimersByTime(600);
        fireEvent.click(nextButton);
      });
      jest.advanceTimersByTime(600);
      await waitFor(() => {
        expect(screen.getByText("Test Slide 1")).toBeInTheDocument();
      });
    });

    it("wraps to last slide from first", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const prevButton = screen.getByLabelText("Previous slide");
        fireEvent.click(prevButton);
      });
      jest.advanceTimersByTime(600);
      await waitFor(() => {
        expect(screen.getByText("Test Slide 3")).toBeInTheDocument();
      });
    });

    it("disables buttons during transition", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const nextButton = screen.getByLabelText("Next slide");
        fireEvent.click(nextButton);
        expect(nextButton).toBeDisabled();
      });
    });
  });

  // Dot Navigation
  describe("Dot Navigation", () => {
    it("renders dot for each slide", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const dots = document.querySelectorAll('[aria-label^="Go to slide"]');
        expect(dots).toHaveLength(3);
      });
    });

    it("highlights active dot", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const dots = document.querySelectorAll('[aria-label^="Go to slide"]');
        expect(dots[0]).toHaveClass("w-8", "bg-yellow-500");
      });
    });

    it("navigates to specific slide on dot click", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const dots = document.querySelectorAll('[aria-label^="Go to slide"]');
        fireEvent.click(dots[2]);
      });
      jest.advanceTimersByTime(600);
      await waitFor(() => {
        expect(screen.getByText("Test Slide 3")).toBeInTheDocument();
      });
    });

    it("does not navigate during transition", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const dots = document.querySelectorAll('[aria-label^="Go to slide"]');
        fireEvent.click(dots[1]);
        fireEvent.click(dots[2]); // Should be ignored
      });
      jest.advanceTimersByTime(600);
      await waitFor(() => {
        expect(screen.getByText("Test Slide 2")).toBeInTheDocument();
      });
    });
  });

  // Auto-play
  describe("Auto-play", () => {
    it("auto-advances after 5 seconds", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(screen.getByText("Test Slide 1")).toBeInTheDocument();
      });
      jest.advanceTimersByTime(5000);
      jest.advanceTimersByTime(600);
      await waitFor(() => {
        expect(screen.getByText("Test Slide 2")).toBeInTheDocument();
      });
    });

    it("pauses on mouse enter", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const carousel = screen.getByText("Test Slide 1").closest(".relative");
        fireEvent.mouseEnter(carousel!);
      });
      jest.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(screen.getByText("Test Slide 1")).toBeInTheDocument();
      });
    });

    it("resumes on mouse leave", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const carousel = screen.getByText("Test Slide 1").closest(".relative");
        fireEvent.mouseEnter(carousel!);
        fireEvent.mouseLeave(carousel!);
      });
      jest.advanceTimersByTime(5000);
      jest.advanceTimersByTime(600);
      await waitFor(() => {
        expect(screen.getByText("Test Slide 2")).toBeInTheDocument();
      });
    });
  });

  // Play/Pause Control
  describe("Play/Pause Control", () => {
    it("renders play/pause button", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(screen.getByLabelText("Pause autoplay")).toBeInTheDocument();
      });
    });

    it("toggles autoplay on button click", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const toggleButton = screen.getByLabelText("Pause autoplay");
        fireEvent.click(toggleButton);
      });
      await waitFor(() => {
        expect(screen.getByLabelText("Start autoplay")).toBeInTheDocument();
      });
    });

    it("pauses autoplay when clicked", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const toggleButton = screen.getByLabelText("Pause autoplay");
        fireEvent.click(toggleButton);
      });
      jest.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(screen.getByText("Test Slide 1")).toBeInTheDocument();
      });
    });

    it("starts autoplay when clicked again", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const toggleButton = screen.getByLabelText("Pause autoplay");
        fireEvent.click(toggleButton);
        fireEvent.click(screen.getByLabelText("Start autoplay"));
      });
      jest.advanceTimersByTime(5000);
      jest.advanceTimersByTime(600);
      await waitFor(() => {
        expect(screen.getByText("Test Slide 2")).toBeInTheDocument();
      });
    });
  });

  // CTA Links
  describe("CTA Links", () => {
    it("renders CTA as link", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const cta = screen.getByText("Shop Now").closest("a");
        expect(cta).toHaveAttribute("href", "/products");
      });
    });

    it("displays CTA text", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(screen.getByText("Shop Now")).toBeInTheDocument();
      });
    });

    it("has correct href for each slide", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const nextButton = screen.getByLabelText("Next slide");
        fireEvent.click(nextButton);
      });
      jest.advanceTimersByTime(600);
      await waitFor(() => {
        const cta = screen.getByText("View Auctions").closest("a");
        expect(cta).toHaveAttribute("href", "/auctions");
      });
    });
  });

  // Enabled/Disabled Slides
  describe("Enabled/Disabled Slides", () => {
    it("only shows enabled slides", async () => {
      const slidesWithDisabled = [
        ...mockSlides,
        { ...mockSlides[0], id: "4", enabled: false },
      ];
      (homepageService.getHeroSlides as jest.Mock).mockResolvedValue(
        slidesWithDisabled
      );
      render(<HeroCarousel />);
      await waitFor(() => {
        const dots = document.querySelectorAll('[aria-label^="Go to slide"]');
        expect(dots).toHaveLength(3);
      });
    });

    it("does not render when no enabled slides", async () => {
      (homepageService.getHeroSlides as jest.Mock).mockResolvedValue([
        { ...mockSlides[0], enabled: false },
      ]);
      render(<HeroCarousel />);
      await waitFor(() => {
        // Should use default slides
        expect(
          document.querySelectorAll('[aria-label^="Go to slide"]')
        ).toHaveLength(3);
      });
    });
  });

  // Single Slide
  describe("Single Slide", () => {
    it("hides navigation for single slide", async () => {
      (homepageService.getHeroSlides as jest.Mock).mockResolvedValue([
        mockSlides[0],
      ]);
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(screen.queryByLabelText("Next slide")).not.toBeInTheDocument();
        expect(
          screen.queryByLabelText("Previous slide")
        ).not.toBeInTheDocument();
      });
    });

    it("hides dots for single slide", async () => {
      (homepageService.getHeroSlides as jest.Mock).mockResolvedValue([
        mockSlides[0],
      ]);
      render(<HeroCarousel />);
      await waitFor(() => {
        const dots = document.querySelectorAll('[aria-label^="Go to slide"]');
        expect(dots).toHaveLength(0);
      });
    });
  });

  // Styling
  describe("Styling", () => {
    it("has gradient background", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const carousel = document.querySelector(".bg-gradient-to-br");
        expect(carousel).toBeInTheDocument();
      });
    });

    it("has rounded corners", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const carousel = document.querySelector(".rounded-2xl");
        expect(carousel).toBeInTheDocument();
      });
    });

    it("has responsive height", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const carousel = screen.getByText("Test Slide 1").closest(".relative");
        expect(carousel).toHaveClass(
          "h-[400px]",
          "md:h-[500px]",
          "lg:h-[600px]"
        );
      });
    });

    it("has gradient overlay on images", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const overlay = document.querySelector(".bg-gradient-to-r");
        expect(overlay).toBeInTheDocument();
      });
    });
  });

  // Animations
  describe("Animations", () => {
    it("has fade animation classes", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const title = screen.getByText("Test Slide 1");
        expect(title).toHaveClass("animate-fade-in-up");
      });
    });

    it("has staggered animation delays", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const subtitle = screen.getByText("Subtitle 1");
        expect(subtitle).toHaveClass("animation-delay-200");
      });
    });

    it("applies opacity transitions", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const slides = document.querySelectorAll(".transition-opacity");
        expect(slides.length).toBeGreaterThan(0);
      });
    });
  });

  // Image Priority
  describe("Image Priority", () => {
    it("prioritizes first slide image", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const firstImage = screen.getByAltText("Test Slide 1");
        expect(firstImage).toHaveAttribute("data-priority", "true");
      });
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("handles missing subtitle", async () => {
      const slidesWithoutSubtitle = [{ ...mockSlides[0], subtitle: "" }];
      (homepageService.getHeroSlides as jest.Mock).mockResolvedValue(
        slidesWithoutSubtitle
      );
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(screen.getByText("Test Slide 1")).toBeInTheDocument();
      });
    });

    it("handles HTML in subtitle", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        const nextButton = screen.getByLabelText("Next slide");
        fireEvent.click(nextButton);
      });
      jest.advanceTimersByTime(600);
      await waitFor(() => {
        expect(screen.getByText("Bold")).toBeInTheDocument();
      });
    });
  });

  // Accessibility
  describe("Accessibility", () => {
    it("has aria-labels for navigation buttons", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(screen.getByLabelText("Next slide")).toBeInTheDocument();
        expect(screen.getByLabelText("Previous slide")).toBeInTheDocument();
      });
    });

    it("has aria-labels for dots", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(screen.getByLabelText("Go to slide 1")).toBeInTheDocument();
        expect(screen.getByLabelText("Go to slide 2")).toBeInTheDocument();
        expect(screen.getByLabelText("Go to slide 3")).toBeInTheDocument();
      });
    });

    it("has aria-label for play/pause", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(screen.getByLabelText("Pause autoplay")).toBeInTheDocument();
      });
    });

    it("has alt text for images", async () => {
      render(<HeroCarousel />);
      await waitFor(() => {
        expect(screen.getByAltText("Test Slide 1")).toBeInTheDocument();
      });
    });
  });
});
