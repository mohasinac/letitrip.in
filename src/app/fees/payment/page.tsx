import { Metadata } from "next";
import { CreditCard, Smartphone, Building2, Wallet } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Methods | Let It Rip",
  description: "Supported payment methods on Let It Rip platform",
};

export default function PaymentMethodsPage() {
  const paymentMethods = [
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Credit & Debit Cards",
      description: "We accept all major credit and debit cards",
      supported: ["Visa", "Mastercard", "American Express", "RuPay", "Maestro"],
      processingTime: "Instant",
      fees: "No additional fees",
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "UPI & Digital Wallets",
      description: "Pay using UPI or popular digital wallets",
      supported: ["Google Pay", "PhonePe", "Paytm", "Amazon Pay", "UPI"],
      processingTime: "Instant",
      fees: "No additional fees",
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Net Banking",
      description: "Direct payment from your bank account",
      supported: [
        "All major Indian banks",
        "HDFC",
        "ICICI",
        "SBI",
        "Axis",
        "Others",
      ],
      processingTime: "Instant",
      fees: "No additional fees",
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Cash on Delivery",
      description: "Pay when you receive your order (select items only)",
      supported: [
        "Available for orders under ₹50,000",
        "ID verification required",
      ],
      processingTime: "At delivery",
      fees: "₹50 COD handling fee",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Payment Methods
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            We offer multiple secure payment options to make your shopping
            experience convenient and safe. All transactions are encrypted and
            protected.
          </p>

          {/* Payment Methods Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {paymentMethods.map((method) => (
              <div key={method.title} className="border dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {method.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {method.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Supported
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {method.supported.map((item) => (
                        <span
                          key={item}
                          className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2 border-t dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Processing Time</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {method.processingTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Fees</p>
                      <p className="font-medium text-gray-900 dark:text-white">{method.fees}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Security Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              🔒 Payment Security
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
              <li>
                • All transactions are encrypted using 256-bit SSL technology
              </li>
              <li>• PCI DSS Level 1 compliant payment gateway</li>
              <li>• We never store your complete card details</li>
              <li>• Two-factor authentication for high-value transactions</li>
              <li>• 100% buyer protection on all purchases</li>
            </ul>
          </div>

          {/* Refund Info */}
          <div className="border-t dark:border-gray-700 pt-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">
              Refunds & Cancellations
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Refunds are processed to your original payment method within 5-7
              business days. For COD orders, refunds are issued as store credit
              or bank transfer.
            </p>
            <a
              href="/refund-policy"
              className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium"
            >
              Read Refund Policy →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
