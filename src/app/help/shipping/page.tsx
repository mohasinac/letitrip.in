"use client";

import React from "react";
import {
  Truck,
  Package,
  Globe,
  Clock,
  DollarSign,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function ShippingInfoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Shipping Information
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Everything you need to know about our shipping policies and delivery
            times
          </p>
        </div>

        {/* Shipping Methods */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Shipping Methods
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Standard Shipping */}
            <div className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Standard Shipping
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Economical shipping option for all orders
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        5-7 business days
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        ₹49 (Free on orders over ₹999)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Express Shipping */}
            <div className="p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Express Shipping
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Fastest delivery for urgent orders
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        2-3 business days
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        ₹149
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Zones */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Delivery Zones
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    India (Domestic Shipping)
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We ship to all major cities and towns across India. Free
                    shipping on orders above ₹999.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    International Shipping
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    We ship worldwide to over 100 countries. Delivery times vary
                    by location (7-21 business days).
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    International shipping rates are calculated at checkout based
                    on destination and package weight.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Processing */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order Processing
            </h2>
          </div>

          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              All orders are processed within <strong>1-2 business days</strong>{" "}
              (excluding weekends and holidays) after receiving your order
              confirmation email.
            </p>
            <p>
              You will receive another notification when your order has shipped.
              Orders placed on weekends or holidays will be processed the next
              business day.
            </p>
          </div>
        </div>

        {/* Tracking */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order Tracking
            </h2>
          </div>

          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              Once your order ships, you will receive a shipping confirmation
              email with a tracking number. You can use this tracking number to
              monitor your package's journey.
            </p>
            <p>
              You can also track your order by logging into your account and
              visiting the <Link href="/profile/track-order" className="text-blue-600 dark:text-blue-400 hover:underline">Track Order</Link> page.
            </p>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow-lg border border-yellow-200 dark:border-yellow-800 p-8">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Important Notes
            </h2>
          </div>

          <ul className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex gap-2">
              <span className="text-yellow-600 dark:text-yellow-400">•</span>
              <span>
                Delivery times are estimates and not guaranteed. Delays may occur
                due to weather, customs, or courier issues.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-600 dark:text-yellow-400">•</span>
              <span>
                For international orders, customers are responsible for any
                customs duties or import taxes.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-600 dark:text-yellow-400">•</span>
              <span>
                Please ensure your shipping address is correct. We are not
                responsible for orders shipped to incorrect addresses provided by
                the customer.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-yellow-600 dark:text-yellow-400">•</span>
              <span>
                If you don't receive your order within the estimated delivery
                time, please <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">contact us</Link>.
              </span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Have questions about shipping?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg no-underline"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
