"use client";

import { FormCheckbox } from "@/components/forms/FormCheckbox";
import { FormInput } from "@/components/forms/FormInput";
import { FormRadio } from "@/components/forms/FormRadio";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextarea } from "@/components/forms/FormTextarea";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { useState } from "react";

export default function FormAccessibilityDemo() {
  const [inputValue, setInputValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");

  const [showErrors, setShowErrors] = useState(false);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Form Accessibility Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Demonstrating WCAG 2.1 compliant form components with ARIA
            attributes, error announcements, and keyboard navigation.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-800 dark:text-blue-300">
              Try using a screen reader or keyboard-only navigation
            </span>
          </div>
        </div>

        {/* Accessibility Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ARIA Labels
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All form elements have proper aria-label, aria-describedby, and
              aria-invalid attributes for screen readers.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Error Announcements
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              aria-live regions announce errors to screen readers in real-time
              without interrupting the user.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Keyboard Navigation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Full keyboard support with Tab, Arrow keys, Enter, Space, and
              Escape for seamless navigation.
            </p>
          </div>
        </div>

        {/* Demo Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Interactive Form Demo
            </h2>
            <button
              type="button"
              onClick={() => setShowErrors(!showErrors)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showErrors ? "Hide Errors" : "Show Errors"}
            </button>
          </div>

          <div className="space-y-6">
            {/* Text Input with ARIA */}
            <FormInput
              label="Full Name"
              placeholder="Enter your full name"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              leftIcon={<User className="w-5 h-5" />}
              required
              error={showErrors && !inputValue ? "Name is required" : undefined}
              helperText="We'll use this to personalize your experience"
            />

            {/* Email Input with validation */}
            <FormInput
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              leftIcon={<Mail className="w-5 h-5" />}
              required
              error={
                showErrors && !emailValue
                  ? "Email is required"
                  : showErrors && emailValue && !emailValue.includes("@")
                  ? "Please enter a valid email address"
                  : undefined
              }
              helperText="We'll never share your email with anyone else"
            />

            {/* Select with ARIA */}
            <FormSelect
              label="Country"
              options={[
                { value: "us", label: "United States" },
                { value: "uk", label: "United Kingdom" },
                { value: "ca", label: "Canada" },
                { value: "au", label: "Australia" },
                { value: "in", label: "India" },
              ]}
              placeholder="Select your country"
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              required
              error={
                showErrors && !selectValue
                  ? "Please select a country"
                  : undefined
              }
              helperText="Select your country of residence"
            />

            {/* Textarea */}
            <FormTextarea
              label="Bio"
              placeholder="Tell us about yourself..."
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              rows={4}
              maxLength={500}
              showCharCount
              helperText="Write a brief description about yourself"
              error={
                showErrors && !textareaValue ? "Bio is required" : undefined
              }
            />

            {/* Checkbox with ARIA */}
            <FormCheckbox
              label="I agree to the terms and conditions"
              description="You must agree before submitting"
              checked={checkboxValue}
              onChange={(e) => setCheckboxValue(e.target.checked)}
              required
              error={
                showErrors && !checkboxValue
                  ? "You must agree to continue"
                  : undefined
              }
            />

            {/* Radio Group */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notification Preference <span className="text-red-500">*</span>
              </label>
              <FormRadio
                name="notifications"
                label="Email notifications"
                value="email"
                checked={radioValue === "email"}
                onChange={(e) => setRadioValue(e.target.value)}
                description="Receive updates via email"
              />
              <FormRadio
                name="notifications"
                label="SMS notifications"
                value="sms"
                checked={radioValue === "sms"}
                onChange={(e) => setRadioValue(e.target.value)}
                description="Receive updates via text message"
              />
              <FormRadio
                name="notifications"
                label="No notifications"
                value="none"
                checked={radioValue === "none"}
                onChange={(e) => setRadioValue(e.target.value)}
                description="Don't send me any notifications"
              />
              {showErrors && !radioValue && (
                <p
                  className="text-sm text-red-600 dark:text-red-400"
                  role="alert"
                  aria-live="polite"
                >
                  Please select a notification preference
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Guide */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Keyboard Shortcuts
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Navigation
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Next field
                  </span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                    Tab
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Previous field
                  </span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                    Shift + Tab
                  </kbd>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Selection
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Toggle checkbox
                  </span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                    Space
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Select radio/option
                  </span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">
                    Arrow Keys
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ARIA Attributes Reference */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            ARIA Attributes Implemented
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                <li>• aria-label - Accessible labels</li>
                <li>• aria-labelledby - Label associations</li>
                <li>• aria-describedby - Helper text links</li>
                <li>• aria-invalid - Error state indication</li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                <li>• aria-required - Required fields</li>
                <li>• aria-checked - Checkbox states</li>
                <li>• aria-live - Dynamic announcements</li>
                <li>• role="alert" - Error messages</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Testing Tips */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Testing with Screen Readers
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <strong className="text-gray-900 dark:text-white">
                Windows:
              </strong>{" "}
              NVDA (free) or JAWS
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">macOS:</strong>{" "}
              VoiceOver (Cmd + F5)
            </div>
            <div>
              <strong className="text-gray-900 dark:text-white">Linux:</strong>{" "}
              Orca
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <strong className="text-gray-900 dark:text-white">Tip:</strong>{" "}
              Try navigating this form using only your keyboard and listen to
              the error announcements when you toggle the "Show Errors" button.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
