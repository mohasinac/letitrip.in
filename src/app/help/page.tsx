"use client";

import { useState } from "react";
import Link from "next/link";

interface SupportCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  links: { title: string; href: string; description: string }[];
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  orderNumber?: string;
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
    {
      id: "auctions",
      title: "Auctions & Bidding",
      description: "Auction rules, bidding help, and rare Beyblades",
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
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
      links: [
        {
          title: "How Auctions Work",
          href: "/faq#auctions",
          description: "Learn about our auction system",
        },
        {
          title: "Bidding Guidelines",
          href: "/auction-rules",
          description: "Rules and best practices for bidding",
        },
        {
          title: "Current Auctions",
          href: "/auctions",
          description: "View active Beyblade auctions",
        },
        {
          title: "Auction History",
          href: "/auctions/history",
          description: "Your bidding and winning history",
        },
      ],
    },
    {
      id: "technical",
      title: "Technical Support",
      description: "Website issues, app problems, and technical help",
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      links: [
        {
          title: "Website Issues",
          href: "/faq#support",
          description: "Report problems with the website",
        },
        {
          title: "Browser Compatibility",
          href: "/browser-help",
          description: "Supported browsers and troubleshooting",
        },
        {
          title: "Mobile App Help",
          href: "/app-help",
          description: "Help with our mobile application",
        },
        {
          title: "Clear Cache",
          href: "/clear-cache-guide",
          description: "Fix common browser issues",
        },
      ],
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit to contact API
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Reset form on success
        setFormData({
          name: "",
          email: "",
          subject: "",
          category: "general",
          message: "",
          orderNumber: "",
        });
        alert("Your message has been sent successfully!");
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      alert("Failed to send message. Please try again.");
    }
    setIsSubmitting(false);

    alert(
      "Thank you for contacting us! We'll get back to you within 24 hours."
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Help & Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help! Find answers to your questions or get in touch
            with our support team.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/orders"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
            >
              <svg
                className="h-6 w-6 text-primary mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <div>
                <p className="font-medium text-gray-900">Track Order</p>
                <p className="text-sm text-gray-500">Check status</p>
              </div>
            </Link>

            <Link
              href="/orders"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
            >
              <svg
                className="h-6 w-6 text-primary mr-3"
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
              <div>
                <p className="font-medium text-gray-900">Return Item</p>
                <p className="text-sm text-gray-500">Start return</p>
              </div>
            </Link>

            <Link
              href="/faq"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
            >
              <svg
                className="h-6 w-6 text-primary mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-medium text-gray-900">View FAQ</p>
                <p className="text-sm text-gray-500">Common questions</p>
              </div>
            </Link>

            <button
              onClick={() => setActiveTab("contact")}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
            >
              <svg
                className="h-6 w-6 text-primary mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <div>
                <p className="font-medium text-gray-900">Contact Us</p>
                <p className="text-sm text-gray-500">Get help</p>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 max-w-md">
            <button
              onClick={() => setActiveTab("help")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "help"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Help Topics
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "contact"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Contact Us
            </button>
          </div>
        </div>

        {/* Help Topics Tab */}
        {activeTab === "help" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-sm border overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-primary mr-4">{category.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {category.links.map((link, index) => (
                      <Link
                        key={index}
                        href={link.href}
                        className="block p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <p className="font-medium text-gray-900 text-sm">
                          {link.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {link.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Us Tab */}
        {activeTab === "contact" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Send us a message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                {(formData.category === "order" ||
                  formData.category === "shipping" ||
                  formData.category === "return") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., #12345"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Please describe your question or issue in detail..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Other ways to reach us
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg
                      className="h-6 w-6 text-primary mr-3 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">support@justforview.in</p>
                      <p className="text-sm text-gray-500">
                        We typically respond within 24 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg
                      className="h-6 w-6 text-primary mr-3 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <p className="text-gray-600">1-800-BEYBLADE</p>
                      <p className="text-sm text-gray-500">
                        Mon-Fri, 9 AM - 6 PM EST
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg
                      className="h-6 w-6 text-primary mr-3 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Live Chat</p>
                      <p className="text-gray-600">Available on our website</p>
                      <p className="text-sm text-gray-500">
                        Mon-Fri, 9 AM - 6 PM EST
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg border border-primary/20 p-6">
                <div className="flex items-start">
                  <svg
                    className="h-6 w-6 text-primary mr-3 mt-1"
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
                  <div>
                    <p className="font-medium text-gray-900 mb-2">
                      Before contacting us
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>
                        • Check our{" "}
                        <Link
                          href="/faq"
                          className="text-primary hover:underline"
                        >
                          FAQ page
                        </Link>{" "}
                        for quick answers
                      </li>
                      <li>
                        • Have your order number ready if asking about an order
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
  );
}
