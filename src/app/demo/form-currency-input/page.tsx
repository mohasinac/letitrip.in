"use client";

import {
  PriceCurrency as Currency,
  FormCurrencyInput,
} from "@letitrip/react-library";
import { useState } from "react";

/**
 * Demo page for FormCurrencyInput component
 * Shows currency input with auto-formatting and currency selector
 */
export default function FormCurrencyInputDemo() {
  const [price1, setPrice1] = useState<number | null>(1234.56);
  const [currency1, setCurrency1] = useState<Currency>("INR");

  const [price2, setPrice2] = useState<number | null>(null);
  const [currency2, setCurrency2] = useState<Currency>("INR");
  const [error, setError] = useState("");

  const [price3, setPrice3] = useState<number | null>(99.99);
  const [currency3, setCurrency3] = useState<Currency>("USD");

  const [price4, setPrice4] = useState<number | null>(50);

  const [price5, setPrice5] = useState<number | null>(-100);

  const validatePrice = (price: number | null): string => {
    if (price == null || price === 0) {
      return "Price is required and must be greater than 0";
    }

    if (price < 0) {
      return "Price cannot be negative";
    }

    if (price < 10) {
      return "Minimum price is ₹10";
    }

    if (price > 1000000) {
      return "Maximum price is ₹10,00,000";
    }

    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validatePrice(price2);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    alert(
      `Price submitted: ${price2} ${currency2}\nFormatted: ${
        currency2 === "INR" ? "₹" : "$"
      }${price2?.toLocaleString("en-IN")}`,
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FormCurrencyInput Demo
          </h1>
          <p className="text-gray-600">
            Currency input with symbol, auto-formatting, and validation
          </p>
        </div>

        {/* Example 1: Basic Usage */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Basic Usage</h2>

          <FormCurrencyInput
            label="Product Price"
            value={price1}
            currency={currency1}
            onChange={(value, curr) => {
              setPrice1(value);
              setCurrency1(curr);
            }}
            helperText="Enter the product price"
          />

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Current values:</p>
            <pre className="text-xs text-gray-800">
              {JSON.stringify(
                {
                  value: price1,
                  currency: currency1,
                  formatted:
                    price1 != null
                      ? `${
                          currency1 === "INR"
                            ? "₹"
                            : currency1 === "USD"
                            ? "$"
                            : currency1 === "EUR"
                            ? "€"
                            : "£"
                        }${price1.toLocaleString("en-IN")}`
                      : null,
                },
                null,
                2,
              )}
            </pre>
          </div>
        </div>

        {/* Example 2: With Validation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">With Validation</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormCurrencyInput
              label="Sale Price"
              value={price2}
              currency={currency2}
              onChange={(value, curr) => {
                setPrice2(value);
                setCurrency2(curr);
                // Clear error on change
                if (error) {
                  setError("");
                }
              }}
              error={error}
              required
              helperText="Required field with validation"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Validate & Submit
            </button>
          </form>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">
              Validation Rules:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Must be greater than 0</li>
              <li>• Minimum: ₹10</li>
              <li>• Maximum: ₹10,00,000</li>
              <li>• Auto-formats with commas on blur</li>
            </ul>
          </div>
        </div>

        {/* Example 3: Currency Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">With Currency Selector</h2>

          <FormCurrencyInput
            label="International Price"
            value={price3}
            currency={currency3}
            onChange={(value, curr) => {
              setPrice3(value);
              setCurrency3(curr);
            }}
            showCurrencySelector
            helperText="Select currency from dropdown"
          />

          <p className="mt-4 text-sm text-gray-600">
            Try selecting different currencies: INR (₹), USD ($), EUR (€), GBP
            (£)
          </p>
        </div>

        {/* Example 4: Min/Max Range */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">With Min/Max Range</h2>

          <FormCurrencyInput
            label="Bid Amount"
            value={price4}
            onChange={(value) => setPrice4(value)}
            min={10}
            max={1000}
            helperText="Value will be clamped to range"
          />

          <p className="mt-4 text-sm text-gray-600">
            Try entering values below 10 or above 1000 - they'll be
            automatically clamped to the valid range.
          </p>
        </div>

        {/* Example 5: Negative Values */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Allow Negative Values</h2>

          <div className="space-y-4">
            <FormCurrencyInput
              label="Profit/Loss"
              value={price5}
              onChange={(value) => setPrice5(value)}
              allowNegative
              helperText="Negative values allowed (e.g., -100)"
            />

            <FormCurrencyInput
              label="Discount Amount"
              value={50}
              compact
              helperText="Compact variant"
            />

            <FormCurrencyInput
              label="Fixed Price"
              value={299.99}
              disabled
              helperText="Disabled state"
            />
          </div>
        </div>

        {/* Features */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Features:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              ✓ <strong>Currency Symbol:</strong> Shows ₹, $, €, or £ based on
              currency
            </li>
            <li>
              ✓ <strong>Auto-formatting:</strong> Formats with commas on blur
              (Indian format for INR)
            </li>
            <li>
              ✓ <strong>Currency Selector:</strong> Optional dropdown to change
              currency
            </li>
            <li>
              ✓ <strong>Format Preview:</strong> Shows formatted value below
              input
            </li>
            <li>
              ✓ <strong>Min/Max Validation:</strong> Automatic clamping to valid
              range
            </li>
            <li>
              ✓ <strong>Negative Values:</strong> Optional support for negative
              amounts
            </li>
            <li>
              ✓ <strong>Reuses Utilities:</strong> formatPrice from
              @/lib/price.utils
            </li>
            <li>
              ✓ <strong>Clean Input:</strong> Removes formatting on focus for
              easy editing
            </li>
          </ul>
        </div>

        {/* Code Example */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Usage Example:</h3>
          <pre className="text-xs text-gray-800 overflow-x-auto">
            {`import { FormCurrencyInput } from "@letitrip/react-library";

function ProductForm() {
  const [price, setPrice] = useState<number | null>(null);
  const [currency, setCurrency] = useState<Currency>("INR");

  return (
    <FormCurrencyInput
      label="Product Price"
      value={price}
      currency={currency}
      onChange={(value, curr) => {
        setPrice(value);
        setCurrency(curr);
      }}
      showCurrencySelector
      min={10}
      max={1000000}
      required
      helperText="Enter price in your preferred currency"
    />
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
