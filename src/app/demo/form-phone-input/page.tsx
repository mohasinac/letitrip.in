"use client";

import { FormPhoneInput } from "@/components/forms/FormPhoneInput";
import { useState } from "react";

/**
 * Demo page for FormPhoneInput component
 * Shows phone input with country code selector and auto-formatting
 */
export default function FormPhoneInputDemo() {
  const [phone1, setPhone1] = useState("");
  const [code1, setCode1] = useState("+91");
  const [phone2, setPhone2] = useState("");
  const [code2, setCode2] = useState("+91");
  const [phone3, setPhone3] = useState("9876543210");
  const [code3, setCode3] = useState("+91");
  const [phone4, setPhone4] = useState("");
  const [code4, setCode4] = useState("+1");
  const [error, setError] = useState("");

  const validatePhone = (phone: string, code: string) => {
    const cleaned = phone.replace(/\D/g, "");

    if (!phone) {
      return "Phone number is required";
    }

    if (code === "+91") {
      if (cleaned.length !== 10) {
        return "Indian phone numbers must be 10 digits";
      }
      if (!cleaned.match(/^[6-9]/)) {
        return "Indian mobile numbers must start with 6-9";
      }
    }

    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validatePhone(phone2, code2);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    alert(
      `Phone submitted: ${code2} ${phone2}\nFormatted: ${code2} ${phone2
        .replace(/\D/g, "")
        .replace(/(\d{5})(\d{5})/, "$1 $2")}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FormPhoneInput Demo
          </h1>
          <p className="text-gray-600">
            Phone input with country code selector and auto-formatting
          </p>
        </div>

        {/* Example 1: Basic Usage */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Basic Usage</h2>

          <FormPhoneInput
            label="Phone Number"
            value={phone1}
            countryCode={code1}
            onChange={(phone, code) => {
              setPhone1(phone);
              setCode1(code);
            }}
            helperText="Enter your phone number with country code"
            placeholder="Enter phone number"
          />

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Current values:</p>
            <pre className="text-xs text-gray-800">
              {JSON.stringify(
                {
                  phone: phone1,
                  countryCode: code1,
                  full: `${code1} ${phone1}`,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>

        {/* Example 2: With Validation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">With Validation</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormPhoneInput
              label="Mobile Number"
              value={phone2}
              countryCode={code2}
              onChange={(phone, code) => {
                setPhone2(phone);
                setCode2(code);
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
              Validation Rules (for +91):
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Must be 10 digits</li>
              <li>• Must start with 6, 7, 8, or 9</li>
              <li>• Auto-formats as XXXXX XXXXX</li>
            </ul>
          </div>
        </div>

        {/* Example 3: Pre-filled Value */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Pre-filled Value</h2>

          <FormPhoneInput
            label="Contact Number"
            value={phone3}
            countryCode={code3}
            onChange={(phone, code) => {
              setPhone3(phone);
              setCode3(code);
            }}
            helperText="This field has a pre-filled value"
          />

          <p className="mt-4 text-sm text-gray-600">
            Pre-filled with: <span className="font-mono">9876543210</span>
          </p>
        </div>

        {/* Example 4: Different Country Code */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">US Phone Number</h2>

          <FormPhoneInput
            label="US Phone"
            value={phone4}
            countryCode={code4}
            onChange={(phone, code) => {
              setPhone4(phone);
              setCode4(code);
            }}
            helperText="Select different country from dropdown"
            placeholder="(555) 123-4567"
          />

          <p className="mt-4 text-sm text-gray-600">
            Try selecting different countries from the dropdown to see how the
            input adapts
          </p>
        </div>

        {/* Example 5: Compact & Disabled States */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">States</h2>

          <div className="space-y-4">
            <FormPhoneInput
              label="Compact Size"
              value="9876543210"
              compact
              helperText="Compact variant"
            />

            <FormPhoneInput
              label="Disabled"
              value="9876543210"
              countryCode="+91"
              disabled
              helperText="Disabled state"
            />

            <FormPhoneInput
              label="Without Country Selector"
              value="9876543210"
              showCountrySelector={false}
              helperText="Hidden country code selector"
            />
          </div>
        </div>

        {/* Features */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Features:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              ✓ <strong>Country Code Selector:</strong> Dropdown with 8 common
              countries
            </li>
            <li>
              ✓ <strong>Auto-formatting:</strong> Indian numbers formatted as
              XXXXX XXXXX
            </li>
            <li>
              ✓ <strong>Sanitization:</strong> Removes invalid characters on
              blur
            </li>
            <li>
              ✓ <strong>Format Preview:</strong> Shows formatted number below
              input
            </li>
            <li>
              ✓ <strong>Validation Support:</strong> Error messages and required
              field
            </li>
            <li>
              ✓ <strong>Reuses Utilities:</strong> formatPhoneNumber from
              @/lib/formatters
            </li>
            <li>
              ✓ <strong>Accessible:</strong> Proper labels, ARIA attributes
            </li>
          </ul>
        </div>

        {/* Code Example */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Usage Example:</h3>
          <pre className="text-xs text-gray-800 overflow-x-auto">
            {`import { FormPhoneInput } from "@/components/forms/FormPhoneInput";

function MyForm() {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");

  return (
    <FormPhoneInput
      label="Phone Number"
      value={phone}
      countryCode={countryCode}
      onChange={(phone, code) => {
        setPhone(phone);
        setCountryCode(code);
      }}
      required
      helperText="Enter your phone number"
    />
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
