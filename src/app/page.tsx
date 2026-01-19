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

import { Metadata } from "next";
import {
  HeroSlide,
  HorizontalScroller,
  FAQAccordion,
  ProductCard,
  CategoryCard,
  AdvertisementBanner,
} from "@letitrip/react-library";
import Link from "next/link";

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

    return {
      categories: categories.data || [],
      featuredProducts: featured.data?.products || [],
      popularProducts: popular.data?.products || [],
    };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return {
      categories: [],
      featuredProducts: [],
      popularProducts: [],
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
    ctaLink: "/buy-product-electronics",
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
    ctaLink: "/buy-product-fashion",
  },
];

// FAQ data
const faqData = [
  {
    question: "How do I place an order?",
    answer:
      "Browse products, add items to cart, proceed to checkout, enter shipping details, and complete payment. You'll receive an order confirmation email.",
    category: "Orders",
    order: 1,
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept credit/debit cards, UPI, net banking, wallets, and cash on delivery for eligible orders.",
    category: "Payments",
    order: 2,
  },
  {
    question: "How does the auction system work?",
    answer:
      "Browse live auctions, place bids higher than the current bid. If you have the highest bid when the auction ends, you win! Payment is processed automatically.",
    category: "Auctions",
    order: 3,
  },
  {
    question: "What is your return policy?",
    answer:
      "Most products can be returned within 7-30 days. Check product page for specific return policy. Items must be unused with original packaging.",
    category: "Returns",
    order: 4,
  },
  {
    question: "How long does shipping take?",
    answer:
      "Standard delivery: 3-7 business days. Express: 1-3 days. Shipping time varies by location and product availability.",
    category: "Shipping",
    order: 5,
  },
  {
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
        message="🎉 New Year Sale! Get up to 50% off on selected products"
        ctaText="Shop Now"
        ctaLink="/deals"
        dismissible={true}
        backgroundColor="bg-gradient-to-r from-blue-600 to-purple-600"
        height="h-12"
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
              <Link
                href="/buy-product-all"
                className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
              >
                Start Shopping
              </Link>
              <Link
                href="/auctions"
                className="rounded-lg border-2 border-white bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                View Auctions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Carousel */}
      <section className="relative h-[60vh] min-h-[500px]">
        <div className="h-full">
          <HeroSlide
            slides={heroSlides}
            autoPlay={true}
            interval={5000}
            showControls={true}
            showIndicators={true}
          />
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Popular Categories
            </h2>
            <Link
              href="/categories"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View All →
            </Link>
          </div>

          {categories.length > 0 ? (
            <HorizontalScroller
              items={categories}
              renderItem={(category: any) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  slug={category.slug}
                  image={category.image}
                  icon={category.icon}
                  itemCount={category.itemCount}
                  onClick={() => {}}
                  LinkComponent={Link}
                />
              )}
              itemWidth={250}
              gap={16}
              showArrows={true}
            />
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
            <Link
              href="/buy-product-all?featured=true"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View All →
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <HorizontalScroller
              items={featuredProducts}
              renderItem={(product: any) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.images?.[0]}
                  images={product.images}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  inStock={product.stock > 0}
                  featured={product.featured}
                  shopName={product.shopName}
                  shopSlug={product.shopSlug}
                  variant="public"
                  LinkComponent={Link}
                />
              )}
              itemWidth={280}
              gap={16}
              showArrows={true}
            />
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
            <Link
              href="/buy-product-all?sort=popular"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View All →
            </Link>
          </div>

          {popularProducts.length > 0 ? (
            <HorizontalScroller
              items={popularProducts}
              renderItem={(product: any) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.images?.[0]}
                  images={product.images}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  inStock={product.stock > 0}
                  shopName={product.shopName}
                  shopSlug={product.shopSlug}
                  variant="public"
                  LinkComponent={Link}
                />
              )}
              itemWidth={280}
              gap={16}
              showArrows={true}
            />
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
              items={faqData}
              allowMultipleOpen={false}
              searchable={true}
              categoryFilter={true}
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
            <Link
              href="/register"
              className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 transition hover:bg-gray-100"
            >
              Create Account
            </Link>
            <Link
              href="/buy-product-all"
              className="rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
