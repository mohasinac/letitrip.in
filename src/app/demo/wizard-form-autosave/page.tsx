"use client";

import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { WizardForm, WizardFormStep } from "@/components/forms/WizardForm";
import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  company: string;
  role: string;
  bio: string;
  preferences: string;
}

/**
 * Demo page for WizardForm auto-save feature
 * Shows automatic data persistence with localStorage
 */
export default function WizardFormAutoSaveDemo() {
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);
  const [autoSaveLog, setAutoSaveLog] = useState<string[]>([]);

  const handleSubmit = async (data: FormData) => {
    console.log("Form submitted:", data);
    setSubmitted(true);
    setFormData(data);
  };

  const handleAutoSave = (data: FormData, step: number) => {
    const timestamp = new Date().toLocaleTimeString();
    setAutoSaveLog((prev) => [
      `[${timestamp}] Auto-saved at step ${step + 1}`,
      ...prev.slice(0, 4), // Keep last 5 logs
    ]);
  };

  const handleRestore = (data: FormData, step: number) => {
    const timestamp = new Date().toLocaleTimeString();
    setAutoSaveLog((prev) => [
      `[${timestamp}] ✅ Restored data from step ${step + 1}`,
      ...prev.slice(0, 4),
    ]);
  };

  const steps: WizardFormStep[] = [
    {
      label: "Personal Info",
      icon: "👤",
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Personal Information</h2>

          <FormInput
            label="Full Name"
            value={formData.name || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter your name"
            required
          />

          <FormInput
            label="Email"
            type="email"
            value={formData.email || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="you@example.com"
            required
          />

          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
            💡 Your progress is being automatically saved. Try filling some
            fields and refreshing the page!
          </p>
        </div>
      ),
    },
    {
      label: "Professional Info",
      icon: "💼",
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Professional Information</h2>

          <FormInput
            label="Company"
            value={formData.company || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, company: e.target.value }))
            }
            placeholder="Your company name"
          />

          <FormSelect
            label="Role"
            value={formData.role || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, role: e.target.value }))
            }
            options={[
              { value: "", label: "Select your role" },
              { value: "developer", label: "Developer" },
              { value: "designer", label: "Designer" },
              { value: "manager", label: "Manager" },
              { value: "other", label: "Other" },
            ]}
            required
          />

          <FormTextarea
            label="Bio"
            value={formData.bio || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bio: e.target.value }))
            }
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </div>
      ),
    },
    {
      label: "Preferences",
      icon: "⚙️",
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Preferences</h2>

          <FormTextarea
            label="Additional Notes"
            value={formData.preferences || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                preferences: e.target.value,
              }))
            }
            placeholder="Any additional preferences or notes..."
            rows={6}
          />

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">
              Auto-Save Activity:
            </h3>
            {autoSaveLog.length > 0 ? (
              <ul className="text-sm text-green-800 space-y-1">
                {autoSaveLog.map((log, index) => (
                  <li key={index} className="font-mono">
                    {log}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-700">
                No auto-save activity yet. Start filling the form!
              </p>
            )}
          </div>
        </div>
      ),
    },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Form Submitted Successfully!
            </h2>
            <p className="text-gray-600">
              Your data has been saved and auto-save data has been cleared.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Submitted Data:</h3>
            <pre className="text-xs text-gray-800 overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>

          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({});
              setAutoSaveLog([]);
            }}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            WizardForm Auto-Save Demo
          </h1>
          <p className="text-gray-600">
            Multi-step form with automatic data persistence to localStorage
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">
                Testing Auto-Save:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  1. Fill out some fields in the form (notice auto-save
                  activity)
                </li>
                <li>
                  2. Refresh the page or close and reopen this tab - your data
                  will be restored
                </li>
                <li>
                  3. The form auto-saves every 1 second after you stop typing
                </li>
                <li>
                  4. Submit the form to clear auto-saved data, or click "Start
                  Fresh" to discard
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Wizard Form */}
      <WizardForm<FormData>
        steps={steps}
        initialData={formData}
        onSubmit={handleSubmit}
        submitLabel="Submit Application"
        stepsVariant="numbered"
        enableAutoSave={true}
        autoSaveKey="wizard-demo-autosave"
        autoSaveDelay={1000}
        onAutoSave={handleAutoSave}
        onRestore={handleRestore}
      />

      {/* Features */}
      <div className="bg-white border-t border-gray-200 px-4 py-6 mt-auto">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-semibold text-gray-900 mb-3">
            Auto-Save Features:
          </h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Automatic Saving:</strong> Data saved to localStorage
                every 1 second
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Auto Restore:</strong> Data restored on page reload
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Current Step:</strong> Remembers which step you were on
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Clear on Submit:</strong> Auto-save cleared after
                successful submission
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Start Fresh:</strong> Option to discard saved data
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>
                <strong>Callbacks:</strong> onAutoSave and onRestore hooks
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
