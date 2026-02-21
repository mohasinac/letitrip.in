import { render, screen, fireEvent, act } from "@testing-library/react";
import { HeroCarousel } from "../HeroCarousel";

// Mock useApiQuery and Phase 10 hooks
const mockUseApiQuery = jest.fn();
jest.mock("@/hooks", () => ({
  useApiQuery: (...args: unknown[]) => mockUseApiQuery(...args),
  useSwipe: jest.fn(), // no-op — swipe is tested via keyboard equivalents
  useMediaQuery: jest.fn().mockReturnValue(false), // default: no reduced-motion preference
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

const makeSlide = (
  id: string,
  title: string,
  order: number,
  cards: object[] = [],
) => ({
  id,
  title,
  order,
  active: true,
  media: {
    type: "image" as const,
    url: `https://example.com/${id}.jpg`,
    alt: `${title} image`,
  },
  cards,
});

const mockCard = (overrides: object = {}) => ({
  id: "card-1",
  gridPosition: { row: 1, col: 1 },
  width: 3,
  height: 3,
  background: { type: "color", value: "#ff0000" },
  content: {
    title: "Card Title",
    subtitle: "Card Subtitle",
    description: "Card description text",
  },
  buttons: [
    {
      id: "btn-1",
      text: "Shop Now",
      link: "/shop",
      variant: "primary",
      openInNewTab: false,
    },
  ],
  isButtonOnly: false,
  mobileHideText: false,
  ...overrides,
});

const mockSlides = [
  makeSlide("slide-1", "First Slide", 1, [mockCard()]),
  makeSlide("slide-2", "Second Slide", 2, [
    mockCard({
      id: "card-2",
      content: { title: "Second Card" },
      buttons: [],
    }),
  ]),
  makeSlide("slide-3", "Third Slide", 3),
];

describe("HeroCarousel", () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    mockUseApiQuery.mockReset();
    jest.useFakeTimers();
    // Default to desktop
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  // ====================================
  // Loading State
  // ====================================
  describe("Loading State", () => {
    it("renders loading skeleton with animate-pulse", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: true });
      const { container } = render(<HeroCarousel />);
      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });

    it('shows "Loading..." text when loading', () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: true });
      render(<HeroCarousel />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  // ====================================
  // No Data State
  // ====================================
  describe("No Data State", () => {
    it("returns null when no slides data", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: false });
      const { container } = render(<HeroCarousel />);
      expect(container.innerHTML).toBe("");
    });

    it("returns null when slides array is empty", () => {
      mockUseApiQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });
      const { container } = render(<HeroCarousel />);
      expect(container.innerHTML).toBe("");
    });

    it("returns null when all slides are inactive", () => {
      const inactiveSlides = [
        { ...makeSlide("s1", "Inactive", 1), active: false },
      ];
      mockUseApiQuery.mockReturnValue({
        data: inactiveSlides,
        isLoading: false,
      });
      const { container } = render(<HeroCarousel />);
      expect(container.innerHTML).toBe("");
    });
  });

  // ====================================
  // Slide Rendering
  // ====================================
  describe("Slide Rendering", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({ data: mockSlides, isLoading: false });
    });

    it("renders the first slide image", () => {
      render(<HeroCarousel />);
      const img = screen.getByAltText("First Slide image");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "https://example.com/slide-1.jpg");
    });

    it("renders section element", () => {
      const { container } = render(<HeroCarousel />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });

    it("renders slides sorted by order", () => {
      const unorderedSlides = [
        makeSlide("s3", "Third", 3),
        makeSlide("s1", "First", 1),
        makeSlide("s2", "Second", 2),
      ];
      mockUseApiQuery.mockReturnValue({
        data: unorderedSlides,
        isLoading: false,
      });
      render(<HeroCarousel />);
      // First visible slide should be the one with order=1
      expect(screen.getByAltText("First image")).toBeInTheDocument();
    });

    it("filters out inactive slides", () => {
      const mixedSlides = [
        { ...makeSlide("s1", "Active", 1), active: true },
        { ...makeSlide("s2", "Inactive", 2), active: false },
      ];
      mockUseApiQuery.mockReturnValue({ data: mixedSlides, isLoading: false });
      const { container } = render(<HeroCarousel />);
      // Should render but with only 1 active slide, no nav dots
      expect(container.querySelector("section")).toBeInTheDocument();
      // No navigation dots for single slide
      expect(screen.queryByLabelText("Go to slide 1")).not.toBeInTheDocument();
    });
  });

  // ====================================
  // Video Support
  // ====================================
  describe("Video Support", () => {
    it("renders video element when media type is video", () => {
      const videoSlides = [
        {
          id: "vs1",
          title: "Video Slide",
          order: 1,
          active: true,
          media: {
            type: "video" as const,
            url: "https://example.com/video.mp4",
            alt: "Video alt",
            thumbnail: "https://example.com/thumb.jpg",
          },
          cards: [],
        },
      ];
      mockUseApiQuery.mockReturnValue({ data: videoSlides, isLoading: false });
      const { container } = render(<HeroCarousel />);
      const video = container.querySelector("video");
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute("src", "https://example.com/video.mp4");
      expect(video).toHaveAttribute("poster", "https://example.com/thumb.jpg");
    });
  });

  // ====================================
  // Card Rendering
  // ====================================
  describe("Card Rendering", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({ data: mockSlides, isLoading: false });
    });

    it("renders card title", () => {
      render(<HeroCarousel />);
      expect(screen.getByText("Card Title")).toBeInTheDocument();
    });

    it("renders card subtitle", () => {
      render(<HeroCarousel />);
      expect(screen.getByText("Card Subtitle")).toBeInTheDocument();
    });

    it("renders card button text", () => {
      render(<HeroCarousel />);
      expect(screen.getByText("Shop Now")).toBeInTheDocument();
    });

    it("renders button-only card as clickable button", () => {
      const btnOnlySlides = [
        makeSlide("s1", "Slide", 1, [
          mockCard({
            id: "btn-card",
            isButtonOnly: true,
            buttons: [
              {
                id: "b1",
                text: "Click Me",
                link: "/click",
                variant: "primary",
                openInNewTab: false,
              },
            ],
          }),
        ]),
      ];
      mockUseApiQuery.mockReturnValue({
        data: btnOnlySlides,
        isLoading: false,
      });
      render(<HeroCarousel />);
      expect(screen.getByText("Click Me")).toBeInTheDocument();
    });
  });

  // ====================================
  // Navigation
  // ====================================
  describe("Navigation", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({ data: mockSlides, isLoading: false });
    });

    it("renders navigation dots for multiple slides", () => {
      render(<HeroCarousel />);
      expect(screen.getByLabelText("Go to slide 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to slide 2")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to slide 3")).toBeInTheDocument();
    });

    it("renders prev/next arrows on desktop", () => {
      render(<HeroCarousel />);
      expect(screen.getByLabelText("Previous slide")).toBeInTheDocument();
      expect(screen.getByLabelText("Next slide")).toBeInTheDocument();
    });

    it("clicking dot changes slide", () => {
      render(<HeroCarousel />);
      // Click on dot for slide 2
      fireEvent.click(screen.getByLabelText("Go to slide 2"));
      // Second slide image should be visible
      expect(screen.getByAltText("Second Slide image")).toBeInTheDocument();
    });

    it("clicking next arrow advances slide", () => {
      render(<HeroCarousel />);
      fireEvent.click(screen.getByLabelText("Next slide"));
      expect(screen.getByAltText("Second Slide image")).toBeInTheDocument();
    });

    it("clicking prev arrow goes to last slide (wraps)", () => {
      render(<HeroCarousel />);
      fireEvent.click(screen.getByLabelText("Previous slide"));
      // Wraps from 0 to last (slide 3)
      expect(screen.getByAltText("Third Slide image")).toBeInTheDocument();
    });

    it("does not render dots for a single slide", () => {
      const singleSlide = [makeSlide("s1", "Only", 1)];
      mockUseApiQuery.mockReturnValue({ data: singleSlide, isLoading: false });
      render(<HeroCarousel />);
      expect(screen.queryByLabelText("Go to slide 1")).not.toBeInTheDocument();
    });
  });

  // ====================================
  // Auto-Advance
  // ====================================
  describe("Auto-Advance", () => {
    it("auto-advances after 5 seconds", () => {
      mockUseApiQuery.mockReturnValue({ data: mockSlides, isLoading: false });
      render(<HeroCarousel />);

      // Initially first slide
      expect(screen.getByAltText("First Slide image")).toBeInTheDocument();

      // Advance by 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should now show second slide
      expect(screen.getByAltText("Second Slide image")).toBeInTheDocument();
    });

    it("wraps around to first slide after last", () => {
      mockUseApiQuery.mockReturnValue({ data: mockSlides, isLoading: false });
      render(<HeroCarousel />);

      // Advance through all 3 slides (3 × 5000ms)
      act(() => {
        jest.advanceTimersByTime(15000);
      });

      // Should wrap back to first slide
      expect(screen.getByAltText("First Slide image")).toBeInTheDocument();
    });
  });

  // ====================================
  // Mobile Behavior
  // ====================================
  describe("Mobile Behavior", () => {
    it("hides arrows on mobile", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });
      mockUseApiQuery.mockReturnValue({ data: mockSlides, isLoading: false });
      render(<HeroCarousel />);

      // Trigger the resize check
      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(screen.queryByLabelText("Previous slide")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Next slide")).not.toBeInTheDocument();
    });
  });

  // ====================================
  // Accessibility — Phase 10
  // ====================================
  describe("Accessibility (Phase 10)", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({ data: mockSlides, isLoading: false });
    });

    it("has aria-roledescription='carousel' on the section", () => {
      const { container } = render(<HeroCarousel />);
      const section = container.querySelector("section");
      expect(section).toHaveAttribute("aria-roledescription", "carousel");
    });

    it("has aria-label on the section", () => {
      const { container } = render(<HeroCarousel />);
      const section = container.querySelector("section");
      expect(section).toHaveAttribute("aria-label");
      expect(section!.getAttribute("aria-label")).toBeTruthy();
    });

    it("ArrowRight key advances to next slide", () => {
      const { container } = render(<HeroCarousel />);
      const section = container.querySelector("section")!;
      fireEvent.keyDown(section, { key: "ArrowRight" });
      expect(screen.getByAltText("Second Slide image")).toBeInTheDocument();
    });

    it("ArrowLeft key goes to previous slide (wraps to last)", () => {
      const { container } = render(<HeroCarousel />);
      const section = container.querySelector("section")!;
      fireEvent.keyDown(section, { key: "ArrowLeft" });
      expect(screen.getByAltText("Third Slide image")).toBeInTheDocument();
    });

    it("has an aria-live region for slide announcements", () => {
      const { container } = render(<HeroCarousel />);
      const live = container.querySelector("[aria-live]");
      expect(live).toBeInTheDocument();
      expect(live).toHaveAttribute("aria-live", "polite");
    });

    it("navigation dots are <button> elements with aria-label", () => {
      render(<HeroCarousel />);
      const dot1 = screen.getByLabelText("Go to slide 1");
      expect(dot1.tagName).toBe("BUTTON");
    });
  });
});
