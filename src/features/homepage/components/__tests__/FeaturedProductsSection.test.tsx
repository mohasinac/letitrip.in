import { render, screen } from "@testing-library/react";
import { FeaturedProductsSection } from "../FeaturedProductsSection";
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
const mockUseFeaturedProducts = jest.fn();
jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useFeaturedProducts: (...args: unknown[]) => mockUseFeaturedProducts(...args),
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
    className,
  }: {
    children: React.ReactNode;
    level?: number;
    className?: string;
  }) => {
    const Tag = `h${level ?? 2}` as React.ElementType;
    return <Tag className={className}>{children}</Tag>;
  },
  Text: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <p className={className}>{children}</p>,
  Span: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <span className={className}>{children}</span>,
  TextLink: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: {
      bgPrimary: "bg-primary",
      bgSecondary: "bg-secondary",
      textPrimary: "text-primary",
      textSecondary: "text-secondary",
    },
    spacing: { padding: { sm: "p-3" } },
    borderRadius: { lg: "rounded-lg" },
    typography: { body: "text-base", small: "text-sm", h4: "text-xl" },
  },
  ROUTES: { PUBLIC: { PRODUCTS: "/products" } },
}));

jest.mock("@/utils", () => ({
  formatCurrency: (amount: number) => `₹${amount.toLocaleString("en-IN")}`,
}));

jest.mock("@/db/schema", () => ({}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    fill: _fill,
    ...rest
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} {...rest} />,
}));

// ── Test data ─────────────────────────────────────────────────────────────
const mockProducts = [
  {
    id: "1",
    title: "Premium Headphones",
    slug: "premium-headphones",
    price: 4999,
    currency: "INR",
    mainImage: "/img/headphones.jpg",
    isPromoted: true,
    brand: "SoundMax",
  },
  {
    id: "2",
    title: "Vintage Watch",
    slug: "vintage-watch",
    price: 12500,
    currency: "INR",
    mainImage: "/img/watch.jpg",
    isPromoted: false,
    brand: "TimeCraft",
  },
  {
    id: "3",
    title: "Leather Wallet",
    slug: "leather-wallet",
    price: 1299,
    currency: "INR",
    mainImage: "/img/wallet.jpg",
    isPromoted: false,
  },
];

// ── Tests ─────────────────────────────────────────────────────────────────
describe("FeaturedProductsSection", () => {
  beforeEach(() => {
    mockUseFeaturedProducts.mockReset();
  });

  describe("Loading State", () => {
    it("passes isLoading=true to SectionCarousel when loading", () => {
      mockUseFeaturedProducts.mockReturnValue({ data: null, isLoading: true });
      render(<FeaturedProductsSection />);
      expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    });
  });

  describe("With data", () => {
    beforeEach(() => {
      mockUseFeaturedProducts.mockReturnValue({
        data: { items: mockProducts },
        isLoading: false,
      });
    });

    it("renders SectionCarousel", () => {
      render(<FeaturedProductsSection />);
      expect(screen.getByTestId("section-carousel")).toBeInTheDocument();
    });

    it("passes title translation key", () => {
      render(<FeaturedProductsSection />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "featuredProducts",
      );
    });

    it("passes description translation key", () => {
      render(<FeaturedProductsSection />);
      expect(screen.getByText("featuredProductsSubtitle")).toBeInTheDocument();
    });

    it("passes viewMoreHref pointing to products route", () => {
      render(<FeaturedProductsSection />);
      expect(screen.getByRole("link", { name: "viewMore" })).toHaveAttribute(
        "href",
        "/products",
      );
    });

    it("renders all product titles", () => {
      render(<FeaturedProductsSection />);
      expect(screen.getByText("Premium Headphones")).toBeInTheDocument();
      expect(screen.getByText("Vintage Watch")).toBeInTheDocument();
      expect(screen.getByText("Leather Wallet")).toBeInTheDocument();
    });

    it('renders "Featured" badge for promoted products', () => {
      render(<FeaturedProductsSection />);
      expect(screen.getByText("Featured")).toBeInTheDocument();
    });

    it("renders brand name when available", () => {
      render(<FeaturedProductsSection />);
      expect(screen.getByText("SoundMax")).toBeInTheDocument();
      expect(screen.getByText("TimeCraft")).toBeInTheDocument();
    });

    it("renders product image with alt text", () => {
      render(<FeaturedProductsSection />);
      const images = screen.getAllByRole("img");
      expect(images.length).toBeGreaterThanOrEqual(1);
      images.forEach((img) => {
        expect(img).toHaveAttribute("alt");
        expect(img.getAttribute("alt")).not.toBe("");
      });
    });

    it("renders formatted prices", () => {
      render(<FeaturedProductsSection />);
      expect(screen.getByText(/4,999/)).toBeInTheDocument();
    });

    it("renders product cards as links", () => {
      render(<FeaturedProductsSection />);
      const links = screen
        .getAllByRole("link")
        .filter((l) => l.getAttribute("href")?.startsWith("/products/"));
      expect(links.length).toBeGreaterThanOrEqual(3);
    });

    it("uses h3 for product card headings", () => {
      render(<FeaturedProductsSection />);
      const h3s = screen.getAllByRole("heading", { level: 3 });
      expect(h3s.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Empty data", () => {
    it("returns null when no products and not loading", () => {
      mockUseFeaturedProducts.mockReturnValue({
        data: { items: [] },
        isLoading: false,
      });
      const { container } = render(<FeaturedProductsSection />);
      expect(container.innerHTML).toBe("");
    });

    it("shows skeleton when loading even with no data yet", () => {
      mockUseFeaturedProducts.mockReturnValue({
        data: null,
        isLoading: true,
      });
      render(<FeaturedProductsSection />);
      expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    });
  });
});
