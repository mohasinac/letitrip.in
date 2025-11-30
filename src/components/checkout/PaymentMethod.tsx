"use client";

import { CreditCard, Wallet, Banknote } from "lucide-react";

interface PaymentMethodProps {
  selected: "razorpay" | "cod";
  onSelect: (method: "razorpay" | "cod") => void;
}

export function PaymentMethod({ selected, onSelect }: PaymentMethodProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">
        Payment Method
      </h3>

      <div className="space-y-3">
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
                <CreditCard className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Online Payment
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
                <Banknote className="w-5 h-5 text-green-600 dark:text-green-400" />
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
