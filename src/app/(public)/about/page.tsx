import { ABOUT_HERO, ABOUT_STORY, PRODUCT_CATEGORIES } from "@/constants/about";
import { generateMetadata as genMeta } from "@/lib/seo/metadata";
import { generateJSONLD, generateLocalBusinessSchema } from "@/lib/seo/schema";
import { Card } from "@letitrip/react-library";

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
              {ABOUT_HERO.title}
            </h1>
            <p className="text-xl text-blue-100">{ABOUT_HERO.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12 space-y-8">
          {/* Our Story */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {ABOUT_STORY.title}
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>{ABOUT_STORY.intro}</p>
              <p>{ABOUT_STORY.problem}</p>
              <p className="font-semibold text-gray-900">
                {ABOUT_STORY.solution}
              </p>
            </div>
          </div>

          {/* What We Sell */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What We Sell
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {PRODUCT_CATEGORIES.map((category) => (
                <Card
                  key={category.name}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{category.icon}</div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Let It Rip?
            </h2>
            <div className="space-y-4">
              {WHY_CHOOSE_US.map((feature) => (
                <Card
                  key={feature.title}
                  className="flex gap-4 items-start p-4 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <div className="text-3xl flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700">{feature.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Our Import Sources */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Where We Import From
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {IMPORT_SOURCES.map((source) => (
                <Card
                  key={source.country}
                  className={`bg-gradient-to-br ${source.colorClass} rounded-lg p-4`}
                >
                  <div className="text-2xl mb-2">{source.flag}</div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    {source.country}
                  </h3>
                  <p className="text-sm text-gray-600">{source.products}</p>
                </Card>
              ))}
            </div>
            <p className="text-gray-600 mt-4 text-center">
              {OTHER_IMPORT_SOURCES}
            </p>
          </div>

          {/* Our Promise */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              {OUR_PROMISE.title}
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-center font-semibold">
                {OUR_PROMISE.mainMessage}
              </p>
              <p className="text-center mt-4">{OUR_PROMISE.extendedMessage}</p>
            </div>
          </Card>

          {/* Contact CTA */}
          <div className="text-center pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {CONTACT_CTA.title}
            </h3>
            <p className="text-gray-600 mb-6">{CONTACT_CTA.description}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {CONTACT_CTA.buttons.map((button) => (
                <Link
                  key={button.text}
                  href={button.href}
                  className={
                    button.variant === "primary"
                      ? "inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      : "inline-block bg-gray-200 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  }
                >
                  {button.text}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
