/**
 * Homepage - Let It Rip E-Commerce Platform
 *
 * Main landing page with hero carousel, featured products, popular categories, and FAQ.
 * Fully responsive with dark mode support.
 *
 * Sections:
 * 1. Advertisement Banner (10% height)
 * 2. Welcome Section with background video/image
 * 3. Hero Carousel (50% height) with video/image slides
 * 4. Popular Categories (horizontal scroller)
 * 5. Featured Products (horizontal scroller)
 * 6. Popular Products (horizontal scroller)
 * 7. FAQ Section with category filter
 *
 * @page / - Homepage
 */

import { ClientLink } from "@/components/common";
import { AdvertisementBanner } from "@/components/common/AdvertisementBanner";
import { FAQAccordion } from "@/components/common/FAQAccordion";
import { ROUTES } from "@/constants/routes";
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from "@/lib/fallback-data";
import { Metadata } from "next";

// SEO Metadata
export const metadata: Metadata = {
  title: "Let It Rip - India's Premier Auction & E-Commerce Platform",
  description:
    "Discover amazing deals on electronics, fashion, home & garden, and more. Shop products or participate in live auctions. Verified sellers, secure payments, fast shipping across India.",
  keywords: [
    "online shopping India",
    "auctions",
    "buy products online",
    "e-commerce",
    "electronics",
    "fashion",
    "home decor",
    "deals",
    "discounts",
  ],
  openGraph: {
    title: "Let It Rip - Shop & Bid on Premium Products",
    description:
      "India's trusted platform for online shopping and auctions. Great deals, verified sellers, secure checkout.",
    type: "website",
    url: "https://letitrip.in",
  },
};

// Fetch data server-side
async function getHomePageData() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    // Fetch in parallel
    const [categoriesRes, featuredRes, popularRes] = await Promise.all([
      fetch(`${baseUrl}/api/categories?featured=true&limit=10`, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }),
      fetch(`${baseUrl}/api/products?featured=true&limit=10`, {
        next: { revalidate: 600 }, // Cache for 10 minutes
      }),
      fetch(`${baseUrl}/api/products?sort=popular&limit=10`, {
        next: { revalidate: 600 },
      }),
    ]);

    const categories = categoriesRes.ok
      ? await categoriesRes.json()
      : { data: [] };
    const featured = featuredRes.ok ? await featuredRes.json() : { data: [] };
    const popular = popularRes.ok ? await popularRes.json() : { data: [] };

    // Extract data with fallback for empty arrays
    const categoriesData = categories.data || [];
    const featuredData = featured.data?.products || [];
    const popularData = popular.data?.products || [];

    return {
      categories:
        categoriesData.length > 0 ? categoriesData : FALLBACK_CATEGORIES,
      featuredProducts:
        featuredData.length > 0 ? featuredData : FALLBACK_PRODUCTS,
      popularProducts: popularData.length > 0 ? popularData : FALLBACK_PRODUCTS,
    };
  } catch (error) {
    console.error(
      "Error fetching homepage data:",
      error,
      "- Using fallback data",
    );
    return {
      categories: FALLBACK_CATEGORIES,
      featuredProducts: FALLBACK_PRODUCTS,
      popularProducts: FALLBACK_PRODUCTS,
    };
  }
}

// Hero slides data
const heroSlides = [
  {
    type: "video" as const,
    videoSources: [
      {
        src: "/videos/hero-1.mp4",
        type: "video/mp4",
      },
    ],
    title: "Premium Electronics at Unbeatable Prices",
    subtitle: "Shop the latest gadgets with exclusive deals",
    ctaText: "Shop Now",
    ctaLink: ROUTES.PRODUCTS.FILTERS("electronics"),
    poster: "/images/hero-1-poster.jpg",
  },
  {
    type: "image" as const,
    image: "/images/hero-2.jpg",
    title: "Live Auctions Every Day",
    subtitle: "Bid on premium products and win amazing deals",
    ctaText: "View Auctions",
    ctaLink: "/auctions",
  },
  {
    type: "image" as const,
    image: "/images/hero-3.jpg",
    title: "Fashion Sale - Up to 70% Off",
    subtitle: "Trending styles for men, women & kids",
    ctaText: "Explore Fashion",
    ctaLink: ROUTES.PRODUCTS.FILTERS("fashion"),
  },
];

// FAQ data
const faqData = [
  {
    id: "faq-1",
    question: "How do I place an order?",
    answer:
      "Browse products, add items to cart, proceed to checkout, enter shipping details, and complete payment. You'll receive an order confirmation email.",
    category: "Orders",
    order: 1,
  },
  {
    id: "faq-2",
    question: "What payment methods do you accept?",
    answer:
      "We accept credit/debit cards, UPI, net banking, wallets, and cash on delivery for eligible orders.",
    category: "Payments",
    order: 2,
  },
  {
    id: "faq-3",
    question: "How does the auction system work?",
    answer:
      "Browse live auctions, place bids higher than the current bid. If you have the highest bid when the auction ends, you win! Payment is processed automatically.",
    category: "Auctions",
    order: 3,
  },
  {
    id: "faq-4",
    question: "What is your return policy?",
    answer:
      "Most products can be returned within 7-30 days. Check product page for specific return policy. Items must be unused with original packaging.",
    category: "Returns",
    order: 4,
  },
  {
    id: "faq-5",
    question: "How long does shipping take?",
    answer:
      "Standard delivery: 3-7 business days. Express: 1-3 days. Shipping time varies by location and product availability.",
    category: "Shipping",
    order: 5,
  },
  {
    id: "faq-6",
    question: "How can I become a seller?",
    answer:
      "Register for a seller account, complete verification, set up your shop, and start listing products. We charge a small commission per sale.",
    category: "Sellers",
    order: 6,
  },
];

export default async function HomePage() {
  const { categories, featuredProducts, popularProducts } =
    await getHomePageData();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Advertisement Banner */}
      <AdvertisementBanner
        LinkComponent={ClientLink}
        content="🎉 New Year Sale! Get up to 50% off on selected products"
        ctaText="Shop Now"
        ctaHref={ROUTES.DEALS}
        isDismissible={true}
        backgroundColor="#3b82f6"
      />

      {/* Welcome Section */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {/* Background Video/Image */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
            poster="/images/welcome-bg.jpg"
          >
            <source src="/videos/welcome-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full items-center justify-center px-4">
          <div className="text-center">
            <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">
              Welcome to Let It Rip
            </h1>
            <p className="mb-8 text-xl text-white/90 md:text-2xl">
              India's Premier Platform for Shopping & Auctions
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <ClientLink
                href={ROUTES.PRODUCTS.LIST}
                className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
              >
                Start Shopping
              </ClientLink>
              <ClientLink
                href={ROUTES.AUCTIONS.LIST}
                className="rounded-lg border-2 border-white bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                View Auctions
              </ClientLink>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Carousel */}
      <section className="relative h-[60vh] min-h-[500px]">
        <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Hero Carousel</h2>
            <p className="text-xl">
              Coming Soon - Carousel implementation in progress
            </p>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Popular Categories
            </h2>
            <ClientLink
              href={ROUTES.CATEGORIES.LIST}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View All →
            </ClientLink>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {categories.slice(0, 10).map((category: any) => (
                <ClientLink
                  key={category.id}
                  href={ROUTES.PRODUCTS.FILTERS(category.slug)}
                  className="rounded-lg border border-gray-200 p-4 text-center transition hover:border-blue-500 hover:shadow-lg dark:border-gray-700"
                >
                  <div className="mb-2 text-4xl">{category.icon || "📦"}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {category.itemCount || 0} items
                  </p>
                </ClientLink>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No categories available
            </p>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-12 dark:bg-gray-800 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Featured Products
            </h2>
            <ClientLink
              href={`${ROUTES.PRODUCTS.LIST}?featured=true`}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View All →
            </ClientLink>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.slice(0, 8).map((product: any) => (
                <ClientLink
                  key={product.id}
                  href={ROUTES.PRODUCTS.DETAIL(product.slug)}
                  className="group rounded-lg border border-gray-200 overflow-hidden transition hover:shadow-lg dark:border-gray-700"
                >
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
                  <div className="p-4">
                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      ₹{product.price?.toLocaleString("en-IN")}
                    </p>
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <p className="text-sm text-gray-500 line-through">
                          ₹{product.originalPrice.toLocaleString("en-IN")}
                        </p>
                      )}
                  </div>
                </ClientLink>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No featured products available
            </p>
          )}
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Popular Products
            </h2>
            <ClientLink
              href={`${ROUTES.PRODUCTS.LIST}?sort=popular`}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View All →
            </ClientLink>
          </div>

          {popularProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {popularProducts.slice(0, 8).map((product: any) => (
                <ClientLink
                  key={product.id}
                  href={ROUTES.PRODUCTS.DETAIL(product.slug)}
                  className="group rounded-lg border border-gray-200 overflow-hidden transition hover:shadow-lg dark:border-gray-700"
                >
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
                  <div className="p-4">
                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      ₹{product.price?.toLocaleString("en-IN")}
                    </p>
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <p className="text-sm text-gray-500 line-through">
                          ₹{product.originalPrice.toLocaleString("en-IN")}
                        </p>
                      )}
                  </div>
                </ClientLink>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No popular products available
            </p>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-12 dark:bg-gray-800 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>

          <div className="mx-auto max-w-4xl">
            <FAQAccordion
              faqs={faqData}
              singleOpen={true}
              showSearch={true}
              showCategoryFilter={true}
              defaultCategory="all"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to Start Shopping?
          </h2>
          <p className="mb-8 text-xl text-white/90">
            Join thousands of happy customers across India
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <ClientLink
              href={ROUTES.AUTH.REGISTER}
              className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 transition hover:bg-gray-100"
            >
              Create Account
            </ClientLink>
            <ClientLink
              href={ROUTES.PRODUCTS.LIST}
              className="rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10"
            >
              Browse Products
            </ClientLink>
          </div>
        </div>
      </section>
    </div>
  );
}
