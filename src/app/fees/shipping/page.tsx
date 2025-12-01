import { Metadata } from "next";
import { Plane, Package, DollarSign, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "International Shipping | Let It Rip",
  description: "Information about international shipping rates and policies",
};

export default function InternationalShippingPage() {
  const regions = [
    {
      name: "Asia Pacific",
      countries:
        "Singapore, Malaysia, Thailand, Indonesia, Vietnam, Philippines",
      baseRate: "₹1,500",
      deliveryTime: "5-10 business days",
    },
    {
      name: "Middle East",
      countries: "UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman",
      baseRate: "₹2,000",
      deliveryTime: "7-14 business days",
    },
    {
      name: "Europe",
      countries: "UK, Germany, France, Italy, Spain, Netherlands",
      baseRate: "₹2,500",
      deliveryTime: "10-15 business days",
    },
    {
      name: "North America",
      countries: "USA, Canada, Mexico",
      baseRate: "₹2,800",
      deliveryTime: "10-18 business days",
    },
    {
      name: "Australia & New Zealand",
      countries: "Australia, New Zealand",
      baseRate: "₹2,600",
      deliveryTime: "12-18 business days",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            International Shipping
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            We ship worldwide! Check our shipping rates and delivery times for
            international orders.
          </p>

          {/* Shipping Regions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Shipping Regions & Rates
            </h2>
            <div className="space-y-4">
              {regions.map((region) => (
                <div key={region.name} className="border dark:border-gray-700 rounded-lg p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {region.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {region.countries}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {region.baseRate}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Base rate</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Delivery: {region.deliveryTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Weight-Based Pricing */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Weight-Based Pricing
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Base rates apply to packages up to 1 kg. Additional charges apply
              for heavier items:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Weight Range
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Additional Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Up to 1 kg</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">Base rate</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">1-3 kg</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">+₹500</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">3-5 kg</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">+₹1,000</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">5-10 kg</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">+₹2,000</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Above 10 kg</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      Contact for quote
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Important Information */}
          <section className="mb-12">
            <div className="grid md:grid-cols-3 gap-6">
              <InfoCard
                icon={<Package className="w-6 h-6" />}
                title="Customs & Duties"
                description="Buyers are responsible for all customs duties, taxes, and import fees in their country."
              />
              <InfoCard
                icon={<DollarSign className="w-6 h-6" />}
                title="Currency"
                description="All prices displayed in INR. International customers will see converted amounts at checkout."
              />
              <InfoCard
                icon={<Plane className="w-6 h-6" />}
                title="Tracking"
                description="All international shipments include full tracking. Monitor your package from India to your doorstep."
              />
            </div>
          </section>

          {/* Restrictions */}
          <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              ❌ Shipping Restrictions
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Due to international shipping regulations, the following items
              cannot be shipped internationally:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
              <li>• Liquids and aerosols</li>
              <li>• Batteries (lithium-ion)</li>
              <li>• Perishable goods</li>
              <li>• Weapons and ammunition</li>
              <li>• Flammable materials</li>
              <li>• Items prohibited by destination country</li>
            </ul>
          </section>

          {/* FAQ */}
          <section className="border-t dark:border-gray-700 pt-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Common Questions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  How is shipping cost calculated?
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Shipping cost is based on destination region, package weight,
                  and dimensions. Final cost is calculated at checkout.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Can I track my international order?
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Yes! All international shipments include end-to-end tracking.
                  You'll receive tracking updates via email and can monitor your
                  order in real-time.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  What about returns?
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  International returns are accepted within 14 days. Return
                  shipping costs are buyer's responsibility unless the item is
                  defective.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border dark:border-gray-700 rounded-lg p-4">
      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
        {icon}
      </div>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
