"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api.service";
import { SUPPORT_ROUTES } from "@/constants/api-routes";

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
      await apiService.post(SUPPORT_ROUTES.CREATE_TICKET, formData);
      // Redirect to tickets list
      router.push("/user/tickets");
    } catch (err: any) {
      console.error("Error creating ticket:", err);
      setError(err.message || "Failed to create support ticket");
      setIsSubmitting(false);
    }
  };

  return (
    <main
      id="support-ticket-page"
      className="container mx-auto px-4 py-8 max-w-2xl"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Create Support Ticket
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-800 mb-2 font-semibold">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-4 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Brief description of your issue"
              required
            />
          </div>

          <div>
            <label className="block text-gray-800 mb-2 font-semibold">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-4 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            >
              <option value="order-issue">Order Issue</option>
              <option value="return-refund">Return/Refund</option>
              <option value="product-question">Product Question</option>
              <option value="account">Account</option>
              <option value="payment">Payment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-800 mb-2 font-semibold">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-4 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-800 mb-2 font-semibold">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-4 py-2 h-32 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Describe your issue in detail (minimum 10 characters)"
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
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p className="mb-2">
          <strong>Tips for faster resolution:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Be specific about the issue you're facing</li>
          <li>Include order number if related to an order</li>
          <li>Mention steps you've already tried</li>
          <li>Add any relevant screenshots or documents</li>
        </ul>
      </div>
    </main>
  );
}
