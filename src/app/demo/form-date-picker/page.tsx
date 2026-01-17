"use client";

import { FormDatePicker } from "@letitrip/react-library";
import { useState } from "react";

/**
 * Demo page for FormDatePicker component
 * Shows date picker with calendar UI and validation
 */
export default function FormDatePickerDemo() {
  const [date1, setDate1] = useState<Date | null>(null);
  const [date2, setDate2] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [date3, setDate3] = useState<Date | null>(new Date());
  const [date4, setDate4] = useState<Date | null>(null);
  const [date5, setDate5] = useState<Date | null>(null);

  // Date range: 7 days ago to 7 days from now
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - 7);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);

  // Future dates only
  const futureMinDate = new Date();
  futureMinDate.setDate(futureMinDate.getDate() + 1);

  const validateDate = (date: Date | null): string => {
    if (!date) {
      return "Date is required";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return "Date cannot be in the past";
    }

    const maxAllowed = new Date();
    maxAllowed.setFullYear(maxAllowed.getFullYear() + 1);

    if (date > maxAllowed) {
      return "Date cannot be more than 1 year in the future";
    }

    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateDate(date2);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    alert(`Date submitted: ${date2?.toLocaleDateString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FormDatePicker Demo
          </h1>
          <p className="text-gray-600">
            Date picker with calendar UI and date validation
          </p>
        </div>

        {/* Example 1: Basic Usage */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Basic Usage</h2>

          <FormDatePicker
            label="Select Date"
            value={date1}
            onChange={(date) => setDate1(date)}
            helperText="Click to open calendar"
            placeholder="YYYY-MM-DD"
          />

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Selected date:</p>
            <pre className="text-xs text-gray-800">
              {JSON.stringify(
                {
                  date: date1 ? date1.toISOString() : null,
                  formatted: date1 ? date1.toLocaleDateString() : null,
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
            <FormDatePicker
              label="Event Date"
              value={date2}
              onChange={(date) => {
                setDate2(date);
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
              <li>• Date is required</li>
              <li>• Cannot be in the past</li>
              <li>• Cannot be more than 1 year in the future</li>
            </ul>
          </div>
        </div>

        {/* Example 3: Pre-selected Date */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Pre-selected Date</h2>

          <FormDatePicker
            label="Appointment Date"
            value={date3}
            onChange={(date) => setDate3(date)}
            helperText="This field has today's date pre-selected"
          />

          <p className="mt-4 text-sm text-gray-600">
            Pre-filled with today's date: {date3?.toLocaleDateString()}
          </p>
        </div>

        {/* Example 4: Date Range Restriction */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Date Range Restriction</h2>

          <FormDatePicker
            label="Select Date (±7 days from today)"
            value={date4}
            onChange={(date) => setDate4(date)}
            minDate={minDate}
            maxDate={maxDate}
            helperText="Only dates within 7 days range are allowed"
          />

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium mb-2">
              Date Range:
            </p>
            <p className="text-sm text-yellow-700">
              From: {minDate.toLocaleDateString()}
            </p>
            <p className="text-sm text-yellow-700">
              To: {maxDate.toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Example 5: Different Display Formats */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Display Formats</h2>

          <div className="space-y-4">
            <FormDatePicker
              label="YYYY-MM-DD Format"
              value={date5}
              onChange={(date) => setDate5(date)}
              displayFormat="YYYY-MM-DD"
              helperText="ISO format (default)"
            />

            <FormDatePicker
              label="DD/MM/YYYY Format"
              value={date5}
              onChange={(date) => setDate5(date)}
              displayFormat="DD/MM/YYYY"
              helperText="European format"
            />

            <FormDatePicker
              label="MM/DD/YYYY Format"
              value={date5}
              onChange={(date) => setDate5(date)}
              displayFormat="MM/DD/YYYY"
              helperText="US format"
            />
          </div>
        </div>

        {/* Example 6: States */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Component States</h2>

          <div className="space-y-4">
            <FormDatePicker
              label="Compact Size"
              value={new Date()}
              compact
              helperText="Compact variant"
            />

            <FormDatePicker
              label="Disabled"
              value={new Date()}
              disabled
              helperText="Disabled state"
            />

            <FormDatePicker
              label="Without Icon"
              value={null}
              showIcon={false}
              helperText="No calendar icon"
            />

            <FormDatePicker
              label="Future Dates Only"
              value={null}
              minDate={futureMinDate}
              helperText="Only future dates allowed"
            />
          </div>
        </div>

        {/* Features */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Features:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              ✓ <strong>Calendar UI:</strong> Interactive calendar dropdown with
              month/year navigation
            </li>
            <li>
              ✓ <strong>Date Validation:</strong> Min/max date restrictions
            </li>
            <li>
              ✓ <strong>Display Formats:</strong> YYYY-MM-DD, DD/MM/YYYY,
              MM/DD/YYYY
            </li>
            <li>
              ✓ <strong>Today Highlight:</strong> Current date highlighted in
              calendar
            </li>
            <li>
              ✓ <strong>Quick Actions:</strong> "Today" and "Clear" buttons
            </li>
            <li>
              ✓ <strong>Keyboard Accessible:</strong> Full keyboard navigation
              support
            </li>
            <li>
              ✓ <strong>No Dependencies:</strong> Lightweight, no external date
              libraries
            </li>
            <li>
              ✓ <strong>Validation Support:</strong> Error messages and required
              field
            </li>
          </ul>
        </div>

        {/* Code Example */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Usage Example:</h3>
          <pre className="text-xs text-gray-800 overflow-x-auto">
            {`import { FormDatePicker } from "@letitrip/react-library";

function BookingForm() {
  const [date, setDate] = useState<Date | null>(null);

  // Only allow future dates
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  return (
    <FormDatePicker
      label="Booking Date"
      value={date}
      onChange={setDate}
      minDate={minDate}
      displayFormat="DD/MM/YYYY"
      required
      helperText="Select your preferred date"
    />
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
