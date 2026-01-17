import { ComponentType } from "react";

export interface PaymentMethodProps {
  selected: "razorpay" | "paypal" | "cod";
  onSelect: (method: "razorpay" | "paypal" | "cod") => void;
  availableGateways?: string[];
  isInternational?: boolean;
  icons?: {
    creditCard?: ComponentType<{ className?: string }>;
    globe?: ComponentType<{ className?: string }>;
    banknote?: ComponentType<{ className?: string }>;
  };
}

export function PaymentMethod({
  selected,
  onSelect,
  availableGateways = ["razorpay", "cod"],
  isInternational = false,
  icons = {},
}: PaymentMethodProps) {
  const CreditCardIcon =
    icons.creditCard ||
    (() => (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ));
  const GlobeIcon =
    icons.globe ||
    (() => (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ));
  const BanknoteIcon =
    icons.banknote ||
    (() => (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    ));

  const isAvailable = (gateway: string) => availableGateways.includes(gateway);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">
        Payment Method
      </h3>

      <div className="space-y-3">
        {/* Razorpay - Indian Payments */}
        {isAvailable("razorpay") && (
          <div
            onClick={() => onSelect("razorpay")}
            onKeyDown={(e) => e.key === "Enter" && onSelect("razorpay")}
            role="button"
            tabIndex={0}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selected === "razorpay"
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                checked={selected === "razorpay"}
                onChange={() => onSelect("razorpay")}
                className="mt-1 w-4 h-4 text-primary border-gray-300 dark:border-gray-600 focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCardIcon className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Online Payment (India)
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Pay securely using UPI, Credit/Debit Card, Net Banking, or
                  Wallet
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-medium rounded">
                    UPI
                  </span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-xs font-medium rounded">
                    Cards
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded">
                    Net Banking
                  </span>
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 text-xs font-medium rounded">
                    Wallets
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  🔒 Secure payment powered by Razorpay
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PayPal - International Payments */}
        {isAvailable("paypal") && (
          <div
            onClick={() => onSelect("paypal")}
            onKeyDown={(e) => e.key === "Enter" && onSelect("paypal")}
            role="button"
            tabIndex={0}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selected === "paypal"
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                checked={selected === "paypal"}
                onChange={() => onSelect("paypal")}
                className="mt-1 w-4 h-4 text-primary border-gray-300 dark:border-gray-600 focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <GlobeIcon className="w-5 h-5 text-[#0070ba]" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    PayPal
                  </h4>
                  {isInternational && (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-medium rounded">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Pay securely with PayPal, Credit/Debit Card, or your PayPal
                  balance
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-[#0070ba]/10 text-[#0070ba] text-xs font-medium rounded">
                    PayPal Balance
                  </span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-xs font-medium rounded">
                    Credit/Debit Card
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded">
                    Bank Account
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  🔒 Secure international payment powered by PayPal
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cash on Delivery */}
        {isAvailable("cod") && (
          <div
            onClick={() => onSelect("cod")}
            onKeyDown={(e) => e.key === "Enter" && onSelect("cod")}
            role="button"
            tabIndex={0}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selected === "cod"
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                checked={selected === "cod"}
                onChange={() => onSelect("cod")}
                className="mt-1 w-4 h-4 text-primary border-gray-300 dark:border-gray-600 focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <BanknoteIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Cash on Delivery
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pay with cash when your order is delivered
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  ℹ️ Additional charges may apply
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> Your payment information is secure and
          encrypted. We never store your card details.
        </p>
      </div>
    </div>
  );
}
