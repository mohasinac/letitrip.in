import { render, screen, act } from "@testing-library/react";
import { FeaturedAuctionsSection } from "../FeaturedAuctionsSection";
import type { SectionCarouselProps } from "../SectionCarousel";

// ── i18n ──────────────────────────────────────────────────────────────────
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// ── Navigation ────────────────────────────────────────────────────────────
jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
}));

// ── Data hook ─────────────────────────────────────────────────────────────
const mockUseFeaturedAuctions = jest.fn();
jest.mock("@/hooks", () => ({
  useFeaturedAuctions: (...args: unknown[]) => mockUseFeaturedAuctions(...args),
}));

// ── SectionCarousel stub — renders items via renderItem ───────────────────
jest.mock("../SectionCarousel", () => ({
  SectionCarousel: <T,>({
    items,
    renderItem,
    isLoading,
    viewMoreHref,
    title,
    description,
  }: SectionCarouselProps<T>) => (
    <div data-testid="section-carousel">
      {isLoading && <div data-testid="skeleton" className="animate-pulse" />}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {viewMoreHref && <a href={viewMoreHref}>viewMore</a>}
      {!isLoading &&
        (items as unknown[]).map((item, i) => (
          <div key={i}>{renderItem(item as T, i)}</div>
        ))}
    </div>
  ),
}));

// ── Shared components ─────────────────────────────────────────────────────
jest.mock("@/components", () => ({
  Heading: ({
    children,
    level,
  }: {
    children: React.ReactNode;
    level?: number;
  }) => {
    const Tag = `h${level ?? 2}` as React.ElementType;
    return <Tag>{children}</Tag>;
  },
  Span: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <span className={className}>{children}</span>,
  Text: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <p className={className}>{children}</p>,
  TextLink: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// ── Constants & utils ─────────────────────────────────────────────────────
jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "",
      bgSecondary: "",
      textPrimary: "",
      textSecondary: "",
    },
    spacing: { padding: { sm: "" } },
    borderRadius: { lg: "" },
    typography: { body: "", small: "" },
    skeleton: { text: "", image: "" },
  },
  ROUTES: { PUBLIC: { AUCTIONS: "/auctions" } },
}));

jest.mock("@/utils", () => ({
  formatCurrency: (amount: number) => `₹${amount.toLocaleString("en-IN")}`,
  nowMs: () => Date.now(),
}));

jest.mock("@/db/schema", () => ({}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

// ── Mock data ─────────────────────────────────────────────────────────────
const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

const mockAuctions = [
  {
    id: "1",
    title: "Rare Painting",
    slug: "rare-painting",
    currentBid: 25000,
    startingBid: 5000,
    currency: "INR",
    mainImage: "/img/painting.jpg",
    auctionEndDate: futureDate,
    bidCount: 15,
    category: "Art",
  },
  {
    id: "2",
    title: "Antique Vase",
    slug: "antique-vase",
    currentBid: 8000,
    startingBid: 2000,
    currency: "INR",
    mainImage: "/img/vase.jpg",
    auctionEndDate: futureDate,
    bidCount: 1,
    category: "Collectibles",
  },
  {
    id: "3",
    title: "Signed Jersey",
    slug: "signed-jersey",
    currentBid: 3500,
    startingBid: 1000,
    currency: "INR",
    mainImage: "/img/jersey.jpg",
    auctionEndDate: pastDate,
    bidCount: 0,
    category: "Sports",
  },
];

// ── Tests ─────────────────────────────────────────────────────────────────
describe("FeaturedAuctionsSection", () => {
  beforeEach(() => {
    mockUseFeaturedAuctions.mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ====================================
  // Loading State
  // ====================================
  describe("Loading State", () => {
    it("renders skeleton when loading", () => {
      mockUseFeaturedAuctions.mockReturnValue({ data: null, isLoading: true });
      render(<FeaturedAuctionsSection />);
      expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    });
  });

  // ====================================
  // No Data State
  // ====================================
  describe("No Data State", () => {
    it("returns null when no auctions and not loading", () => {
      mockUseFeaturedAuctions.mockReturnValue({
        data: [],
        isLoading: false,
      });
      const { container } = render(<FeaturedAuctionsSection />);
      expect(container.innerHTML).toBe("");
    });

    it("returns null when data is null and not loading", () => {
      mockUseFeaturedAuctions.mockReturnValue({ data: null, isLoading: false });
      const { container } = render(<FeaturedAuctionsSection />);
      expect(container.innerHTML).toBe("");
    });
  });

  // ====================================
  // Content Rendering
  // ====================================
  describe("Content Rendering", () => {
    beforeEach(() => {
      mockUseFeaturedAuctions.mockReturnValue({
        data: mockAuctions,
        isLoading: false,
      });
    });

    it("passes translated title key to SectionCarousel", () => {
      render(<FeaturedAuctionsSection />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "liveAuctions",
      );
    });

    it("passes translated description key", () => {
      render(<FeaturedAuctionsSection />);
      expect(screen.getByText("auctionsSubtitle")).toBeInTheDocument();
    });

    it("passes viewMoreHref to SectionCarousel", () => {
      render(<FeaturedAuctionsSection />);
      expect(screen.getByRole("link", { name: "viewMore" })).toHaveAttribute(
        "href",
        "/auctions",
      );
    });

    it("renders all auction titles", () => {
      render(<FeaturedAuctionsSection />);
      expect(screen.getByText("Rare Painting")).toBeInTheDocument();
      expect(screen.getByText("Antique Vase")).toBeInTheDocument();
      expect(screen.getByText("Signed Jersey")).toBeInTheDocument();
    });

    it("renders auction images with alt text", () => {
      render(<FeaturedAuctionsSection />);
      const images = screen.getAllByRole("img");
      expect(images).toHaveLength(3);
      expect(images[0]).toHaveAttribute("alt", "Rare Painting");
      expect(images[1]).toHaveAttribute("alt", "Antique Vase");
      expect(images[2]).toHaveAttribute("alt", "Signed Jersey");
    });

    it("renders currentBid labels", () => {
      render(<FeaturedAuctionsSection />);
      const labels = screen.getAllByText("currentBid");
      expect(labels).toHaveLength(3);
    });

    it("renders bid counts with proper pluralisation", () => {
      render(<FeaturedAuctionsSection />);
      expect(screen.getByText("15 bids")).toBeInTheDocument();
      expect(screen.getByText("1 bid")).toBeInTheDocument();
      expect(screen.getByText("0 bids")).toBeInTheDocument();
    });

    it("renders auction links with correct hrefs", () => {
      render(<FeaturedAuctionsSection />);
      const links = screen
        .getAllByRole("link")
        .filter((a) => a.getAttribute("href")?.startsWith("/auctions/"));
      expect(links).toHaveLength(3);
      expect(links[0]).toHaveAttribute("href", "/auctions/1");
      expect(links[1]).toHaveAttribute("href", "/auctions/2");
      expect(links[2]).toHaveAttribute("href", "/auctions/3");
    });
  });

  // ====================================
  // Price Formatting
  // ====================================
  describe("Price Formatting", () => {
    it("formats current bid prices in INR", () => {
      mockUseFeaturedAuctions.mockReturnValue({
        data: mockAuctions,
        isLoading: false,
      });
      render(<FeaturedAuctionsSection />);
      expect(screen.getByText("₹25,000")).toBeInTheDocument();
      expect(screen.getByText("₹8,000")).toBeInTheDocument();
      expect(screen.getByText("₹3,500")).toBeInTheDocument();
    });
  });

  // ====================================
  // Countdown Timer
  // ====================================
  describe("Countdown Timer", () => {
    beforeEach(() => {
      mockUseFeaturedAuctions.mockReturnValue({
        data: mockAuctions,
        isLoading: false,
      });
    });

    it('shows "Ended" for past auctions', () => {
      render(<FeaturedAuctionsSection />);
      expect(screen.getByText("Ended")).toBeInTheDocument();
    });

    it("shows time remaining for active auctions", () => {
      render(<FeaturedAuctionsSection />);
      const timeTexts = screen.getAllByText(/\d+d \d+h/);
      expect(timeTexts.length).toBeGreaterThanOrEqual(1);
    });

    it("updates countdown on interval tick", () => {
      render(<FeaturedAuctionsSection />);
      const before = screen.getAllByText(/\d+d \d+h/);
      expect(before.length).toBeGreaterThanOrEqual(1);
      // Advance timer — countdown recalculates
      act(() => {
        jest.advanceTimersByTime(60_000);
      });
      const after = screen.getAllByText(/\d+[dhm]/);
      expect(after.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    beforeEach(() => {
      mockUseFeaturedAuctions.mockReturnValue({
        data: mockAuctions,
        isLoading: false,
      });
    });

    it("uses h2 for section heading", () => {
      render(<FeaturedAuctionsSection />);
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    });

    it("uses h3 for auction titles", () => {
      render(<FeaturedAuctionsSection />);
      const h3s = screen.getAllByRole("heading", { level: 3 });
      expect(h3s).toHaveLength(3);
    });

    it("all images have non-empty alt text", () => {
      render(<FeaturedAuctionsSection />);
      screen.getAllByRole("img").forEach((img) => {
        expect(img).toHaveAttribute("alt");
        expect(img.getAttribute("alt")).not.toBe("");
      });
    });
  });
});
