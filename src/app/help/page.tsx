"use client";

import { useState } from "react";
import Link from "next/link";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  orderNumber: string;
}

interface SupportCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  links: {
    title: string;
    href: string;
    description: string;
  }[];
}

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState("help");
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
    orderNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Help Center",
      href: "/help",
      active: true,
    },
  ]);

  const supportCategories: SupportCategory[] = [
    {
      id: "orders",
      title: "Orders & Shipping",
      description: "Track orders, shipping info, and delivery questions",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      links: [
        {
          title: "Track Your Order",
          href: "/orders",
          description: "View order status and tracking information",
        },
        {
          title: "Shipping Information",
          href: "/shipping-info",
          description: "Delivery times and shipping costs",
        },
        {
          title: "Order Changes",
          href: "/faq#orders",
          description: "Modify or cancel your order",
        },
        {
          title: "International Shipping",
          href: "/faq#shipping",
          description: "Global delivery options",
        },
      ],
    },
    {
      id: "returns",
      title: "Returns & Refunds",
      description: "Return items, refunds, and exchange policies",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      ),
      links: [
        {
          title: "Return Policy",
          href: "/returns",
          description: "Learn about our 30-day return policy",
        },
        {
          title: "Start a Return",
          href: "/orders",
          description: "Initiate a return from your order history",
        },
        {
          title: "Refund Status",
          href: "/orders",
          description: "Check the status of your refund",
        },
        {
          title: "Exchange Items",
          href: "/faq#orders",
          description: "Exchange for different size or color",
        },
      ],
    },
    {
      id: "products",
      title: "Product Information",
      description: "Beyblade specs, compatibility, and authenticity",
      icon: (
        <svg
          className="h-8 w-8"
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
      ),
      links: [
        {
          title: "Product Authenticity",
          href: "/faq#products",
          description: "Verify authentic Beyblade products",
        },
        {
          title: "Compatibility Guide",
          href: "/compatibility",
          description: "Check Beyblade part compatibility",
        },
        {
          title: "Battle Rules",
          href: "/battle-rules",
          description: "Official Beyblade battle regulations",
        },
        {
          title: "Care Instructions",
          href: "/care-guide",
          description: "Maintain your Beyblades properly",
        },
      ],
    },
    {
      id: "account",
      title: "Account & Payment",
      description: "Login issues, payment methods, and account settings",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      links: [
        {
          title: "Account Settings",
          href: "/account",
          description: "Update your profile and preferences",
        },
        {
          title: "Password Reset",
          href: "/forgot-password",
          description: "Reset your account password",
        },
        {
          title: "Payment Methods",
          href: "/account/payment",
          description: "Manage saved payment methods",
        },
        {
          title: "Address Book",
          href: "/addresses",
          description: "Manage shipping addresses",
        },
      ],
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    alert("Message sent successfully!");
    setFormData({
      name: "",
      email: "",
      subject: "",
      category: "general",
      message: "",
      orderNumber: "",
    });
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Help Center
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Get help with your Beyblade orders, products, and account
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("help")}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === "help"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Browse Help Topics
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                  activeTab === "contact"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* Help Topics Tab */}
          {activeTab === "help" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Browse Help Topics
              </h2>
              <div className="space-y-4">
                {supportCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
                  >
                    <div className="flex gap-4 items-start">
                      <div className="text-blue-600 dark:text-blue-400 mt-1">
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {category.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {category.description}
                        </p>
                        <div className="space-y-3">
                          {category.links.map((link, index) => (
                            <div key={index}>
                              <Link
                                href={link.href}
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                              >
                                {link.title}
                              </Link>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {link.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Contact Support
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Form */}
                <div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                      Send us a message
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Category
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="general">General Question</option>
                          <option value="order">Order Issue</option>
                          <option value="shipping">Shipping & Delivery</option>
                          <option value="return">Returns & Refunds</option>
                          <option value="product">Product Information</option>
                          <option value="account">Account & Payment</option>
                          <option value="auction">Auctions & Bidding</option>
                          <option value="technical">Technical Support</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Subject *
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      {(formData.category === "order" ||
                        formData.category === "shipping" ||
                        formData.category === "return") && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Order Number (Optional)
                          </label>
                          <input
                            type="text"
                            name="orderNumber"
                            value={formData.orderNumber}
                            onChange={handleInputChange}
                            placeholder="e.g., #12345"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Message *
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          rows={6}
                          placeholder="Please describe your question or issue in detail..."
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors"
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                        Other ways to reach us
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Email
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            support@hobbiesspot.com
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            We typically respond within 24 hours
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Phone
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            1-800-BEYBLADE
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            Mon-Fri, 9 AM - 6 PM EST
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Live Chat
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            Available on our website
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            Mon-Fri, 9 AM - 6 PM EST
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm p-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Before contacting us
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>
                          • Check our{" "}
                          <Link
                            href="/faq"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            FAQ page
                          </Link>{" "}
                          for quick answers
                        </li>
                        <li>
                          • Have your order number ready if asking about an
                          order
                        </li>
                        <li>• Include photos if reporting a product issue</li>
                        <li>
                          • Be specific about the problem you're experiencing
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
