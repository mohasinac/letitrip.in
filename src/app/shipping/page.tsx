import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Information - JustForView",
  description:
    "Learn about our shipping options, delivery times, and policies.",
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Shipping Information
          </h1>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              We offer multiple shipping options to ensure your orders reach you
              quickly and safely.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Domestic Shipping Options
              </h2>
              <div className="grid gap-6">
                <div className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Standard Delivery
                      </h3>
                      <p className="text-gray-600">5-7 business days</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">₹99</span>
                  </div>
                  <ul className="text-gray-600 space-y-1">
                    <li>✓ Free for orders above ₹500</li>
                    <li>✓ Tracking included</li>
                    <li>✓ Secure packaging</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Express Delivery
                      </h3>
                      <p className="text-gray-600">2-3 business days</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      ₹199
                    </span>
                  </div>
                  <ul className="text-gray-600 space-y-1">
                    <li>✓ Priority handling</li>
                    <li>✓ SMS updates</li>
                    <li>✓ Tracking included</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Overnight Delivery
                      </h3>
                      <p className="text-gray-600">Next business day</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      ₹399
                    </span>
                  </div>
                  <ul className="text-gray-600 space-y-1">
                    <li>✓ Next day delivery</li>
                    <li>✓ Priority handling</li>
                    <li>✓ SMS updates</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                International Shipping
              </h2>
              <div className="grid gap-6">
                <div className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        International Standard
                      </h3>
                      <p className="text-gray-600">7-14 business days</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      ₹1,500
                    </span>
                  </div>
                  <ul className="text-gray-600 space-y-1">
                    <li>✓ Customs handling</li>
                    <li>✓ Tracking included</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        International Express
                      </h3>
                      <p className="text-gray-600">3-5 business days</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      ₹2,500
                    </span>
                  </div>
                  <ul className="text-gray-600 space-y-1">
                    <li>✓ Express customs</li>
                    <li>✓ Priority handling</li>
                    <li>✓ Tracking included</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Shipping Policy
              </h2>
              <div className="space-y-4 text-gray-600">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Processing Time
                  </h3>
                  <p>
                    Orders are processed within 1-2 business days. Processing
                    time is not included in shipping estimates.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Packaging
                  </h3>
                  <p>
                    All items are carefully packaged with protective materials
                    to ensure they arrive in perfect condition.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Tracking
                  </h3>
                  <p>
                    You'll receive a tracking number via email once your order
                    ships. You can track your package in real-time.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Delivery
                  </h3>
                  <p>
                    Packages are delivered Monday through Saturday. Signature
                    may be required for high-value items.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Contact Support
              </h2>
              <p className="text-gray-600">
                For shipping-related questions, contact our support team at{" "}
                <a
                  href="mailto:shipping@justforview.in"
                  className="text-primary hover:underline"
                >
                  shipping@justforview.in
                </a>{" "}
                or call us at{" "}
                <a
                  href="tel:+911234567890"
                  className="text-primary hover:underline"
                >
                  +91 12345 67890
                </a>
              </p>
            </section>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
              <p className="text-sm text-green-800">
                <strong>Free Shipping:</strong> Orders above ₹500 qualify for
                free standard shipping within India!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
