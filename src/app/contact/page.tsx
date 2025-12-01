"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
import { supportService } from "@/services/support.service";
import { FormField, FormInput, FormTextarea } from "@/components/forms";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await supportService.createTicket({
        ...formData,
        category: "general",
        priority: "medium",
      } as any);

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have questions or need help? We're here to assist you. Send us a
            message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Email
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      <a
                        href="mailto:support@justforview.in"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        support@justforview.in
                      </a>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      We'll respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Phone
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      <a
                        href="tel:+918000000000"
                        className="text-green-600 dark:text-green-400 hover:underline"
                      >
                        1800-000-0000
                      </a>{" "}
                      (Toll-free)
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Mon-Fri, 9am-6pm IST
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Address
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      123 Market Street
                      <br />
                      Mumbai, Maharashtra 400001
                      <br />
                      India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Quick Help</h3>
              <p className="mb-4 opacity-90">
                Looking for answers? Check out our frequently asked questions.
              </p>
              <a
                href="/faq"
                className="inline-block bg-white text-blue-600 px-6 py-3 min-h-[48px] rounded-lg font-semibold hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
              >
                View FAQ
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Send us a Message
            </h2>

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">
                    Message sent successfully!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    We'll get back to you soon.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-900 font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <FormField label="Your Name" required>
                <FormInput
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </FormField>

              {/* Email */}
              <FormField label="Email Address" required>
                <FormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  autoComplete="email"
                />
              </FormField>

              {/* Phone */}
              <FormField label="Phone Number" hint="Optional">
                <FormInput
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                />
              </FormField>

              {/* Subject */}
              <FormField label="Subject" required>
                <FormInput
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                />
              </FormField>

              {/* Message */}
              <FormField label="Message" required>
                <FormTextarea
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                />
              </FormField>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[48px] bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Additional Help Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Other Ways to Reach Us
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                For Sellers
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Questions about selling on our platform?
              </p>
              <a
                href="/seller"
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline text-sm"
              >
                Seller Dashboard →
              </a>
            </div>

            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Support Tickets
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Track your existing support requests
              </p>
              <Link
                href="/user/tickets"
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline text-sm"
              >
                View Tickets →
              </Link>
            </div>

            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Help Center
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                Browse our documentation and guides
              </p>
              <a
                href="/guide"
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline text-sm"
              >
                View Guides →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
