"use client";

// Constants for all hardcoded strings
const SUPPORT_TICKET_TITLE = "Create Support Ticket";
const SUBJECT_LABEL = "Subject";
const SUBJECT_PLACEHOLDER = "Brief description of your issue";
const CATEGORY_LABEL = "Category";
const CATEGORY_OPTIONS = [
  { value: "order-issue", label: "Order Issue" },
  { value: "return-refund", label: "Return/Refund" },
  { value: "product-question", label: "Product Question" },
  { value: "account", label: "Account" },
  { value: "payment", label: "Payment" },
  { value: "other", label: "Other" },
];
const PRIORITY_LABEL = "Priority";
const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];
const DESCRIPTION_LABEL = "Description";
const DESCRIPTION_PLACEHOLDER =
  "Describe your issue in detail (minimum 10 characters)";
const SUBMIT_BTN = "Submit Ticket";
const SUBMITTING_BTN = "Submitting...";
const CANCEL_BTN = "Cancel";
const TIPS_TITLE = "Tips for faster resolution:";
const TIPS_LIST = [
  "Be specific about the issue you're facing",
  "Include order number if related to an order",
  "Mention steps you've already tried",
  "Add any relevant screenshots or documents",
];

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supportService } from "@/services/support.service";

export default function SupportTicketPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: "",
    category: "other",
    priority: "medium",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.subject.trim().length < 3) {
      setError("Subject must be at least 3 characters");
      return;
    }

    if (formData.description.trim().length < 10) {
      setError("Description must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      await supportService.createTicket(formData as any);
      // Redirect to tickets list
      router.push("/user/tickets");
    } catch (err: any) {
      console.error("Error creating ticket:", err);
      setError(err.message || "Failed to create support ticket");
      setIsSubmitting(false);
    }
  };

  // ...existing code...
  return (
    <main
      id="support-ticket-page"
      className="container mx-auto px-4 py-8 max-w-2xl"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {SUPPORT_TICKET_TITLE}
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="support-subject"
              className="block text-gray-800 mb-2 font-semibold"
            >
              {SUBJECT_LABEL} <span className="text-red-500">*</span>
            </label>
            <input
              id="support-subject"
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-4 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder={SUBJECT_PLACEHOLDER}
              required
            />
          </div>

          <div>
            <label
              htmlFor="support-category"
              className="block text-gray-800 mb-2 font-semibold"
            >
              {CATEGORY_LABEL} <span className="text-red-500">*</span>
            </label>
            <select
              id="support-category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-4 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="support-priority"
              className="block text-gray-800 mb-2 font-semibold"
            >
              {PRIORITY_LABEL}
            </label>
            <select
              id="support-priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-4 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="support-description"
              className="block text-gray-800 mb-2 font-semibold"
            >
              {DESCRIPTION_LABEL} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="support-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-4 py-2 h-32 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder={DESCRIPTION_PLACEHOLDER}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length} characters
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-yellow-500 text-gray-900 px-6 py-2 rounded hover:bg-yellow-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? SUBMITTING_BTN : SUBMIT_BTN}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-50 font-semibold"
            >
              {CANCEL_BTN}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p className="mb-2">
          <strong>{TIPS_TITLE}</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          {TIPS_LIST.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
