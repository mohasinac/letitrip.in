import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";

export default function HomePage() {
  // Mock data - will be replaced with real API calls
  const featuredProducts = [
    {
      id: "1",
      name: "Premium Beyblade Stadium",
      slug: "premium-beyblade-stadium",
      price: 2999,
      compareAtPrice: 3999,
      image: "/images/product-1.jpg",
      isFeatured: true,
    },
    {
      id: "2",
      name: "Metal Fusion Beyblade Set",
      slug: "metal-fusion-set",
      price: 1499,
      compareAtPrice: 1999,
      image: "/images/product-2.jpg",
      isFeatured: true,
    },
    {
      id: "3",
      name: "Launcher Grip Pro",
      slug: "launcher-grip-pro",
      price: 799,
      image: "/images/product-3.jpg",
      isFeatured: true,
    },
    {
      id: "4",
      name: "Beyblade Burst Starter Pack",
      slug: "burst-starter-pack",
      price: 1299,
      compareAtPrice: 1599,
      image: "/images/product-4.jpg",
      isFeatured: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container py-20 md:py-32">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Discover Premium Hobby Products
              </h1>
              <p className="text-lg md:text-xl mb-8 text-blue-100">
                Your one-stop shop for authentic Beyblades, collectibles, and
                premium hobby items. Shop now and join thousands of satisfied
                customers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="btn bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg"
                >
                  Shop Now
                </Link>
                <Link
                  href="/auctions"
                  className="btn bg-transparent border-2 border-white hover:bg-white/10 px-8 py-3 text-lg"
                >
                  View Auctions
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 bg-gray-50 border-b">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Authentic Products</h3>
                <p className="text-sm text-muted-foreground">
                  100% genuine products guaranteed
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Safe & encrypted transactions
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Fast Shipping</h3>
                <p className="text-sm text-muted-foreground">
                  Quick delivery across India
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">
                  Always here to help you
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16">
          <div className="container">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
                <p className="text-muted-foreground">
                  Handpicked items just for you
                </p>
              </div>
              <Link href="/products" className="btn btn-outline">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </section>

        {/* Auctions CTA */}
        <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              🎯 Live Auctions Now!
            </h2>
            <p className="text-lg mb-8 text-purple-100 max-w-2xl mx-auto">
              Bid on exclusive and rare items. Don't miss out on amazing deals!
            </p>
            <Link
              href="/auctions"
              className="btn bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg"
            >
              Browse Auctions
            </Link>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Shop by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {["Beyblades", "Launchers", "Stadiums", "Accessories"].map(
                (category) => (
                  <Link
                    key={category}
                    href={`/categories/${category.toLowerCase()}`}
                    className="card p-8 text-center hover:shadow-lg transition-shadow group"
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <svg
                        className="w-8 h-8 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {category}
                    </h3>
                  </Link>
                )
              )}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-gray-50">
          <div className="container max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-8">
              Subscribe to our newsletter for exclusive deals, new arrivals, and
              auction updates.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="input flex-1"
              />
              <button type="submit" className="btn btn-primary px-8">
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
