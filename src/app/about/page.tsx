import { generateMetadata as genMeta } from "@/lib/seo/metadata";
import { generateLocalBusinessSchema, generateJSONLD } from "@/lib/seo/schema";

export const metadata = genMeta({
  title: "About Us - Authentic Collectibles Seller",
  description:
    "Let It Rip is India's trusted seller of authentic imported collectibles - Beyblades, Pokemon TCG, Yu-Gi-Oh, Transformers, Hot Wheels & more. We handle all customs, you pay ₹0 import duties!",
  keywords: [
    "about Let It Rip",
    "authentic collectibles India",
    "beyblade seller India",
    "Pokemon TCG seller",
    "import collectibles India",
  ],
  path: "/about",
});

export default function AboutPage() {
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <main id="about-page" className="min-h-screen bg-gray-50">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateJSONLD(localBusinessSchema)}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About Let It Rip
            </h1>
            <p className="text-xl text-blue-100">
              India's Trusted Source for Authentic Imported Collectibles
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12 space-y-8">
          {/* Our Story */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                <strong className="text-blue-600">Let It Rip</strong> - the
                famous battle cry from the Beyblade anime - perfectly captures
                our passion for authentic collectibles! We're India's premier
                seller of imported toys, trading cards, and collectibles from
                around the world.
              </p>
              <p>
                Founded by collectors, for collectors, we understand the
                frustration of finding authentic products in India. High customs
                duties, long shipping times, and the prevalence of fake products
                made it nearly impossible to enjoy your favorite collectibles.
              </p>
              <p className="font-semibold text-gray-900">
                That's why we created Let It Rip - to bring authentic
                collectibles directly to Indian fans, handling all the import
                hassles so you don't have to!
              </p>
            </div>
          </div>

          {/* What We Sell */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What We Sell
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: "🎯",
                  name: "Beyblades",
                  desc: "Authentic Takara Tomy - Burst, X, Metal Fusion, stadiums & launchers",
                },
                {
                  icon: "🎴",
                  name: "Pokemon TCG",
                  desc: "Official booster packs, elite trainer boxes, singles & collections",
                },
                {
                  icon: "🃏",
                  name: "Yu-Gi-Oh! TCG",
                  desc: "Konami originals - booster packs, structure decks, tins & rare cards",
                },
                {
                  icon: "🤖",
                  name: "Transformers",
                  desc: "Hasbro & Takara Tomy - Studio Series, Generations, Masterpiece",
                },
                {
                  icon: "🏎️",
                  name: "Hot Wheels",
                  desc: "Die-cast cars, premium editions, Car Culture, track sets",
                },
                {
                  icon: "⭐",
                  name: "Stickers",
                  desc: "Collectible stickers - anime, gaming, holographic, vinyl designs",
                },
                {
                  icon: "🎨",
                  name: "Crafts",
                  desc: "Japanese washi tape, origami, art supplies & DIY materials",
                },
                {
                  icon: "🎁",
                  name: "Collectibles",
                  desc: "Figurines, model kits, plushies, keychains & limited editions",
                },
              ].map((category) => (
                <div
                  key={category.name}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{category.icon}</div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 text-sm">{category.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Let It Rip?
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: "100% Authentic Products",
                  desc: "We import directly from authorized distributors in Japan, USA, UK, China & Hong Kong. Every product is genuine - we guarantee it!",
                  icon: "✅",
                },
                {
                  title: "Zero Customs Charges for You",
                  desc: "We handle ALL import customs and duties. The price you see is the price you pay - no surprise charges at delivery!",
                  icon: "💰",
                },
                {
                  title: "Fast India Delivery",
                  desc: "In-stock items (most Beyblades, Pokemon packs, Hot Wheels) ship in 3-7 days. Pre-orders take 15-25 days from order to doorstep.",
                  icon: "🚀",
                },
                {
                  title: "COD Available",
                  desc: "Cash on Delivery available for in-stock items. Pay only when you receive your authentic collectibles!",
                  icon: "💵",
                },
                {
                  title: "Collector-Friendly",
                  desc: "We're collectors ourselves! We understand the importance of packaging, authenticity certificates, and product condition.",
                  icon: "🎯",
                },
                {
                  title: "Easy Returns",
                  desc: "Returns to our India warehouse (₹100-300) vs ₹2,000-5,000 to ship back to Japan/USA. Much more affordable!",
                  icon: "🔄",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="flex gap-4 items-start p-4 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <div className="text-3xl flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Our Import Sources */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Where We Import From
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-lg p-4">
                <div className="text-2xl mb-2">🇯🇵</div>
                <h3 className="font-bold text-gray-900 mb-2">Japan</h3>
                <p className="text-sm text-gray-600">
                  Takara Tomy Beyblades, Japanese Pokemon cards, Transformers,
                  Washi tape, Stickers
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-4">
                <div className="text-2xl mb-2">🇺🇸</div>
                <h3 className="font-bold text-gray-900 mb-2">USA</h3>
                <p className="text-sm text-gray-600">
                  Pokemon TCG, Yu-Gi-Oh TCG, Hasbro Transformers, Hot Wheels
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-white border border-yellow-200 rounded-lg p-4">
                <div className="text-2xl mb-2">🇨🇳</div>
                <h3 className="font-bold text-gray-900 mb-2">China</h3>
                <p className="text-sm text-gray-600">
                  Licensed Beyblades, Hot Wheels, Collectibles, Crafts
                </p>
              </div>
            </div>
            <p className="text-gray-600 mt-4 text-center">
              Also importing from: 🇬🇧 UK (Pokemon TCG) • 🇭🇰 Hong Kong (Trading
              Cards, Collectibles)
            </p>
          </div>

          {/* Our Promise */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              Our Promise to You
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-center font-semibold">
                Every product is{" "}
                <span className="text-blue-600">100% authentic</span>. Every
                order is handled with{" "}
                <span className="text-blue-600">care</span>. Every customer gets
                the <span className="text-blue-600">best service</span>.
              </p>
              <p className="text-center mt-4">
                We're not just a store - we're fellow collectors who want to
                share the joy of authentic collectibles with India. When you
                shop with Let It Rip, you're shopping with people who understand
                and love these products as much as you do!
              </p>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="text-center pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Questions? We're Here to Help!
            </h3>
            <p className="text-gray-600 mb-6">
              Have questions about authenticity, shipping, or specific products?
              Our team is ready to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/support/ticket"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/faq"
                className="inline-block bg-gray-200 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                View FAQs
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
