import { Metadata } from "next";
import Link from "next/link";
import { Package, Clock, RefreshCcw, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Returns & Refunds Guide | Let It Rip",
  description:
    "Learn about our return policy, refund process, and how to initiate returns",
};

export default function ReturnsGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Returns & Refunds Guide
          </h1>
          <p className="text-gray-600 mb-8">
            We want you to be completely satisfied with your purchase. Here's
            everything you need to know about our return and refund policy.
          </p>

          {/* Return Process */}
          <div className="space-y-8 mb-12">
            <ProcessStep
              icon={<Package className="w-6 h-6" />}
              title="1. Initiate Return Request"
              description="Log into your account and go to your orders. Click on the order you want to return and select 'Request Return'. Choose the reason for return and submit your request."
              timeframe="Within 7 days of delivery"
            />

            <ProcessStep
              icon={<Clock className="w-6 h-6" />}
              title="2. Seller Review"
              description="The seller will review your return request within 24-48 hours. You'll receive an email notification once it's approved."
              timeframe="24-48 hours"
            />

            <ProcessStep
              icon={<RefreshCcw className="w-6 h-6" />}
              title="3. Ship Back the Item"
              description="Pack the item securely in its original packaging. Ship it back using the provided return label or your preferred courier. Keep the tracking number."
              timeframe="7 days to ship"
            />

            <ProcessStep
              icon={<CheckCircle className="w-6 h-6" />}
              title="4. Refund Processing"
              description="Once the seller receives and inspects the item, your refund will be processed. The amount will be credited to your original payment method."
              timeframe="5-7 business days"
            />
          </div>

          {/* Return Eligibility */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Return Eligibility
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-3">
                  ✓ Returnable Items
                </h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>• Unopened products in original packaging</li>
                  <li>• Items with defects or damage</li>
                  <li>• Wrong items shipped</li>
                  <li>• Items not as described</li>
                </ul>
              </div>

              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-3">
                  ✗ Non-Returnable Items
                </h3>
                <ul className="space-y-2 text-sm text-red-800">
                  <li>• Opened electronics or software</li>
                  <li>• Personal care products (used)</li>
                  <li>• Custom-made items</li>
                  <li>• Items marked as non-returnable</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Refund Methods */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Refund Methods
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Original Payment Method
                </h3>
                <p className="text-sm text-gray-600">
                  Refund to the card/account used for payment
                </p>
                <p className="text-xs text-gray-500 mt-2">5-7 business days</p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Store Credit
                </h3>
                <p className="text-sm text-gray-600">
                  Instant credit to your Let It Rip wallet
                </p>
                <p className="text-xs text-gray-500 mt-2">Immediate</p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Bank Transfer
                </h3>
                <p className="text-sm text-gray-600">
                  Direct transfer to your bank account
                </p>
                <p className="text-xs text-gray-500 mt-2">7-10 business days</p>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-3">Important Notes</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>
                • Return shipping costs may apply unless the item is defective
                or wrong
              </li>
              <li>
                • Items must be returned in original condition with all tags and
                packaging
              </li>
              <li>
                • Refunds exclude original shipping charges (unless seller
                error)
              </li>
              <li>
                • Auction items have different return policies - check before
                bidding
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">Ready to initiate a return?</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/user/orders"
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-semibold"
              >
                View My Orders
              </Link>
              <Link
                href="/refund-policy"
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Read Full Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessStep({
  icon,
  title,
  description,
  timeframe,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  timeframe: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded whitespace-nowrap">
            {timeframe}
          </span>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
