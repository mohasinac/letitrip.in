import { Metadata } from "next";
import { Star, TrendingUp, Megaphone, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Optional Services | Let It Rip",
  description: "Optional premium services to boost your sales on Let It Rip",
};

export default function OptionalServicesPage() {
  const services = [
    {
      icon: <Star className="w-8 h-8" />,
      title: "Featured Listing",
      description: "Get your product highlighted at the top of search results",
      pricing: [
        { duration: "1 Day", price: "₹199" },
        { duration: "7 Days", price: "₹999", save: "Save 30%" },
        { duration: "30 Days", price: "₹2,999", save: "Save 50%" },
      ],
      benefits: [
        "Appear at top of category pages",
        "Yellow highlight badge",
        "3x more visibility",
        "Priority in search results",
      ],
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Promoted Product",
      description: "Show your product across the platform in various sections",
      pricing: [
        { duration: "7 Days", price: "₹1,499" },
        { duration: "14 Days", price: "₹2,499", save: "Save 17%" },
        { duration: "30 Days", price: "₹4,999", save: "Save 33%" },
      ],
      benefits: [
        "Featured in homepage carousel",
        "Related products section",
        "Email marketing campaigns",
        "Up to 10x more views",
      ],
    },
    {
      icon: <Megaphone className="w-8 h-8" />,
      title: "Premium Shop Badge",
      description: "Verified badge and premium positioning for your shop",
      pricing: [
        { duration: "Monthly", price: "₹999/mo" },
        { duration: "Quarterly", price: "₹2,499/quarter", save: "Save 17%" },
        { duration: "Yearly", price: "₹8,999/year", save: "Save 25%" },
      ],
      benefits: [
        "Verified shop badge",
        "Priority customer support",
        "Shop featured on homepage",
        "Analytics dashboard",
      ],
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Extended Coverage",
      description:
        "Additional buyer protection and insurance for high-value items",
      pricing: [
        { duration: "Per Item", price: "2% of value" },
        { duration: "Min Fee", price: "₹99" },
        { duration: "Max Fee", price: "₹4,999" },
      ],
      benefits: [
        "Damage protection",
        "Theft coverage during shipping",
        "Money-back guarantee",
        "Hassle-free claims",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Optional Services
          </h1>
          <p className="text-gray-600 mb-8">
            Boost your sales and visibility with our premium services. All
            services are optional - choose what works best for your business.
          </p>

          {/* Services Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {services.map((service) => (
              <div key={service.title} className="border rounded-lg p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-4 border-t pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                    Pricing
                  </p>
                  <div className="space-y-2">
                    {service.pricing.map((plan) => (
                      <div
                        key={plan.duration}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-700">{plan.duration}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {plan.price}
                          </span>
                          {plan.save && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              {plan.save}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div className="border-t pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                    Benefits
                  </p>
                  <ul className="space-y-2">
                    {service.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Package Deals */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">🎁 Package Deals</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Starter Package
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Featured Listing (7 days) + Premium Shop Badge (1 month)
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹1,799
                  <span className="text-sm text-gray-500 font-normal ml-2">
                    <del>₹1,998</del> Save 10%
                  </span>
                </p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Growth Package
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Promoted Product (30 days) + Premium Shop Badge (3 months)
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹6,499
                  <span className="text-sm text-gray-500 font-normal ml-2">
                    <del>₹7,498</del> Save 15%
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* How to Purchase */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-900 mb-4">How to Purchase</h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span>
                  Go to your seller dashboard and select the product or shop you
                  want to promote
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span>
                  Click on "Promote" or "Upgrade" and choose the service you
                  want
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <span>
                  Complete the payment and your promotion will be activated
                  immediately
                </span>
              </li>
            </ol>

            <div className="mt-6 text-center">
              <a
                href="/seller"
                className="inline-block px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-semibold"
              >
                Go to Seller Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
