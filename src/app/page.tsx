import FeaturedCategories from "@/components/layout/FeaturedCategories";
import FAQSection from "@/components/faq/FAQSection";

export default function Home() {
  return (
    <main id="home-page" className="container mx-auto px-4 py-8">
      {/* 5. Featured Categories */}
      <FeaturedCategories />
      <div className="space-y-8">
        {/* Hero Section */}
        <section
          id="hero-section"
          className="bg-gradient-to-r from-blue-100 via-yellow-50 to-red-50 rounded-lg p-8 md:p-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Let It Rip! 🎯
          </h1>
          <p className="text-xl md:text-2xl text-gray-800 mb-4 font-semibold">
            India's #1 Store for Authentic Collectibles
          </p>
          <p className="text-lg text-gray-700 mb-6 max-w-3xl mx-auto">
            Beyblades • Pokemon TCG • Yu-Gi-Oh • Transformers • Hot Wheels •
            Stickers & More!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <span className="text-2xl">✅</span>
              <span>100% Authentic</span>
            </div>
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <span className="text-2xl">✅</span>
              <span>Zero Customs Charges</span>
            </div>
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <span className="text-2xl">✅</span>
              <span>Fast India Delivery</span>
            </div>
          </div>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all">
            Shop Now
          </button>
        </section>

        {/* Featured Products Section */}
        <section id="featured-products">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <h3 className="font-bold text-gray-900 mb-2">Product {item}</h3>
                <p className="text-yellow-700 font-bold text-lg">
                  ¥{1000 * item}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Categories */}
        <section id="popular-categories">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Beyblades", icon: "🎯" },
              { name: "Pokemon TCG", icon: "🎴" },
              { name: "Yu-Gi-Oh", icon: "🃏" },
              { name: "Transformers", icon: "🤖" },
              { name: "Hot Wheels", icon: "🏎️" },
              { name: "Stickers", icon: "⭐" },
              { name: "Crafts", icon: "🎨" },
              { name: "Collectibles", icon: "🎁" },
            ].map((category) => (
              <div
                key={category.name}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg hover:border-yellow-400 transition-all cursor-pointer"
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="font-bold text-gray-900">{category.name}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq-section" className="py-8">
          <FAQSection
            title="Frequently Asked Questions"
            description="Quick answers about authentic collectibles, shipping, and more"
            maxItemsToShow={6}
            defaultCategory="getting-started"
          />
        </section>
      </div>
    </main>
  );
}
