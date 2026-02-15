import { render, screen } from "@testing-library/react";
import Page from "../page";

jest.mock("@/components/homepage", () => ({
  HeroCarousel: () => <div data-testid="hero-carousel" />,
  WelcomeSection: () => <div data-testid="welcome-section" />,
  TrustIndicatorsSection: () => <div data-testid="trust-indicators" />,
  TopCategoriesSection: () => <div data-testid="top-categories" />,
  FeaturedProductsSection: () => <div data-testid="featured-products" />,
  FeaturedAuctionsSection: () => <div data-testid="featured-auctions" />,
  AdvertisementBanner: () => <div data-testid="ad-banner" />,
  SiteFeaturesSection: () => <div data-testid="site-features" />,
  CustomerReviewsSection: () => <div data-testid="customer-reviews" />,
  WhatsAppCommunitySection: () => <div data-testid="whatsapp-community" />,
  FAQSection: () => <div data-testid="faq-section" />,
  BlogArticlesSection: () => <div data-testid="blog-articles" />,
  NewsletterSection: () => <div data-testid="newsletter" />,
}));

describe("Home Page", () => {
  it("renders all homepage sections", () => {
    render(<Page />);

    expect(screen.getByTestId("hero-carousel")).toBeInTheDocument();
    expect(screen.getByTestId("welcome-section")).toBeInTheDocument();
    expect(screen.getByTestId("trust-indicators")).toBeInTheDocument();
    expect(screen.getByTestId("top-categories")).toBeInTheDocument();
    expect(screen.getByTestId("featured-products")).toBeInTheDocument();
    expect(screen.getByTestId("featured-auctions")).toBeInTheDocument();
    expect(screen.getByTestId("ad-banner")).toBeInTheDocument();
    expect(screen.getByTestId("site-features")).toBeInTheDocument();
    expect(screen.getByTestId("customer-reviews")).toBeInTheDocument();
    expect(screen.getByTestId("whatsapp-community")).toBeInTheDocument();
    expect(screen.getByTestId("faq-section")).toBeInTheDocument();
    expect(screen.getByTestId("blog-articles")).toBeInTheDocument();
    expect(screen.getByTestId("newsletter")).toBeInTheDocument();
  });
});
