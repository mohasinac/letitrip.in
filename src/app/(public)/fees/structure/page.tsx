import { Metadata } from "next";
import { IndianRupee, ShoppingBag, Store, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Fee Structure | Let It Rip",
  description:
    "Complete breakdown of fees for buyers and sellers on Let It Rip platform",
};

export default function FeeStructurePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Fee Structure
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Transparent pricing for all services on our platform. No hidden
            charges.
          </p>

          {/* Buyer Fees */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Buyer Fees
              </h2>
            </div>

            <div className="space-y-4">
              <FeeRow
                title="Product Purchase"
                description="Regular product purchases"
                fee="FREE"
                details="No buyer fees on product purchases"
              />
              <FeeRow
                title="Auction Bidding"
                description="Participating in auctions"
                fee="FREE"
                details="No bidding fees or buyer's premium"
              />
              <FeeRow
                title="Payment Processing"
                description="All payment methods"
                fee="FREE"
                details="We absorb all payment gateway charges"
              />
              <FeeRow
                title="Cash on Delivery"
                description="COD orders (if applicable)"
                fee="₹50"
                details="One-time COD handling fee per order"
              />
            </div>
          </section>

          {/* Seller Fees */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Store className="w-8 h-8 text-green-600 dark:text-green-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Seller Fees
              </h2>
            </div>

            <div className="space-y-4">
              <FeeRow
                title="Shop Registration"
                description="One-time shop setup"
                fee="FREE"
                details="No cost to create your shop"
              />
              <FeeRow
                title="Product Listing"
                description="List products for sale"
                fee="FREE"
                details="Unlimited product listings"
              />
              <FeeRow
                title="Commission on Sales"
                description="Standard category products"
                fee="5-10%"
                details="Varies by category, charged on successful sales only"
              />
              <FeeRow
                title="Auction Commission"
                description="Auction listings"
                fee="8%"
                details="Charged only when auction completes successfully"
              />
              <FeeRow
                title="Featured Listings"
                description="Boost product visibility (optional)"
                fee="₹199-999"
                details="See optional services for details"
              />
            </div>
          </section>

          {/* Commission Breakdown */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Commission Breakdown by Category
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Commission Rate
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Example (₹10,000 sale)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      Electronics
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                      5%
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      ₹500
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      Fashion & Apparel
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                      7%
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      ₹700
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      Home & Kitchen
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                      6%
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      ₹600
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      Collectibles & Art
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                      10%
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      ₹1,000
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      Other Categories
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                      7%
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      ₹700
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Payment Schedule */}
          <section className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              💰 Seller Payment Schedule
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
              <li>
                • Payments processed every Monday for previous week's sales
              </li>
              <li>• Minimum payout threshold: ₹500</li>
              <li>• Bank transfer within 3-5 business days</li>
              <li>• Transaction history available in seller dashboard</li>
            </ul>
          </section>

          {/* No Hidden Fees */}
          <div className="text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              ✓ No Hidden Fees
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              The fees listed above are all-inclusive. What you see is what you
              pay. No surprise charges ever.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeeRow({
  title,
  description,
  fee,
  details,
}: {
  title: string;
  description: string;
  fee: string;
  details: string;
}) {
  return (
    <div className="border dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {fee}
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{details}</p>
    </div>
  );
}
