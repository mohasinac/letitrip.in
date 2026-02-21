import { render, screen } from "@testing-library/react";
import Page from "../page";

// Make next/dynamic synchronous in tests using React.lazy + Suspense wrapper.
// Since @/components/homepage is jest.mock'd, the dynamic imports resolve
// in the microtask queue and findByTestId correctly awaits them.
jest.mock("next/dynamic", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  return function mockDynamic(
    fn: () => Promise<{ default: React.ComponentType<unknown> }>,
  ) {
    const LazyComponent = React.lazy(fn);
    return function WrappedLazy(props: unknown) {
      return React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(LazyComponent, props),
      );
    };
  };
});

jest.mock("@/components/homepage", () => ({
  HeroCarousel: () => <div data-testid="hero-carousel" />,
  WelcomeSection: () => <div data-testid="welcome-section" />,
  TrustFeaturesSection: () => <div data-testid="trust-features" />,
  TopCategoriesSection: () => <div data-testid="top-categories" />,
  FeaturedProductsSection: () => <div data-testid="featured-products" />,
  FeaturedAuctionsSection: () => <div data-testid="featured-auctions" />,
  AdvertisementBanner: () => <div data-testid="ad-banner" />,

  CustomerReviewsSection: () => <div data-testid="customer-reviews" />,
  WhatsAppCommunitySection: () => <div data-testid="whatsapp-community" />,
  FAQSection: () => <div data-testid="faq-section" />,
  BlogArticlesSection: () => <div data-testid="blog-articles" />,
  NewsletterSection: () => <div data-testid="newsletter" />,
}));

describe("Home Page", () => {
  it("renders all homepage sections", async () => {
    render(<Page />);

    // Static (above-fold) sections are available immediately
    expect(screen.getByTestId("hero-carousel")).toBeInTheDocument();
    expect(screen.getByTestId("welcome-section")).toBeInTheDocument();
    expect(screen.getByTestId("trust-features")).toBeInTheDocument();

    // Dynamic (below-fold) sections load asynchronously via React.lazy
    expect(await screen.findByTestId("top-categories")).toBeInTheDocument();
    expect(await screen.findByTestId("featured-products")).toBeInTheDocument();
    expect(await screen.findByTestId("featured-auctions")).toBeInTheDocument();
    expect(await screen.findByTestId("ad-banner")).toBeInTheDocument();

    expect(await screen.findByTestId("customer-reviews")).toBeInTheDocument();
    expect(await screen.findByTestId("whatsapp-community")).toBeInTheDocument();
    expect(await screen.findByTestId("faq-section")).toBeInTheDocument();
    expect(await screen.findByTestId("blog-articles")).toBeInTheDocument();
    expect(await screen.findByTestId("newsletter")).toBeInTheDocument();
  });
});
