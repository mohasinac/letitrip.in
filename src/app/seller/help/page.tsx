"use client";

import { useState } from "react";
import Link from "next/link";
import { FormInput } from "@/components/forms";
import {
  Search,
  HelpCircle,
  BookOpen,
  MessageSquare,
  Phone,
  Mail,
  ChevronRight,
  ChevronDown,
  Package,
  Gavel,
  DollarSign,
  Truck,
  RotateCcw,
  CreditCard,
  ShieldCheck,
  Settings,
  TrendingUp,
  Users,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// FAQ Categories with questions
const FAQ_CATEGORIES = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    color: "blue",
    questions: [
      {
        q: "How do I set up my seller account?",
        a: "After registering, navigate to the Seller Dashboard. Complete your shop profile by adding business details, bank information for payouts, and verify your identity. Once approved, you can start listing products.",
      },
      {
        q: "What documents are required for seller verification?",
        a: "You'll need a valid government ID (Aadhaar/PAN), GST registration (if applicable), bank account details, and proof of business address. Upload these in the Settings > Verification section.",
      },
      {
        q: "How long does seller verification take?",
        a: "Seller verification typically takes 24-48 hours on business days. You'll receive an email notification once your account is verified or if additional information is needed.",
      },
    ],
  },
  {
    id: "products",
    title: "Product Listings",
    icon: Package,
    color: "green",
    questions: [
      {
        q: "How do I create a product listing?",
        a: "Go to Products > Add New Product. Fill in the title, description, price, category, and upload high-quality images. Add variants if applicable, set stock levels, and publish.",
      },
      {
        q: "What are the image requirements for products?",
        a: "Images should be at least 800x800 pixels, in JPEG/PNG format, with a white or neutral background. You can upload up to 10 images per product. The first image will be the main display image.",
      },
      {
        q: "How do I manage product inventory?",
        a: "Navigate to Products > Inventory. Here you can update stock levels, set low-stock alerts, and manage variants. Bulk updates are available via CSV import.",
      },
    ],
  },
  {
    id: "auctions",
    title: "Auctions",
    icon: Gavel,
    color: "purple",
    questions: [
      {
        q: "How do I create an auction?",
        a: "Go to Auctions > Create Auction. Set the starting bid, reserve price (optional), auction duration, and add product details. Review and publish to make it live.",
      },
      {
        q: "What is a reserve price?",
        a: "A reserve price is the minimum amount you're willing to accept. If bidding doesn't reach this amount, the auction ends without a winner. Reserve prices are hidden from bidders.",
      },
      {
        q: "Can I cancel an auction after it starts?",
        a: "You can cancel an auction only if there are no bids. Once bidding begins, cancellation requires admin approval and may affect your seller rating.",
      },
      {
        q: "What happens when an auction ends?",
        a: "The highest bidder receives a notification to complete payment within 48 hours. Once paid, you'll be notified to ship the item. If unpaid, the item can be relisted.",
      },
    ],
  },
  {
    id: "orders",
    title: "Orders & Shipping",
    icon: Truck,
    color: "orange",
    questions: [
      {
        q: "How do I process an order?",
        a: "Go to Orders > Pending. Click on an order to view details, then confirm shipment with tracking number. The buyer will be notified automatically.",
      },
      {
        q: "What shipping methods can I offer?",
        a: "You can offer Standard, Express, or Self-pickup options. Configure shipping zones and rates in Settings > Shipping. Free shipping can be offered above a minimum order value.",
      },
      {
        q: "What if an order is returned?",
        a: "Return requests appear in Orders > Returns. Review the request, approve or reject with reason. Approved returns trigger refund processing once item is received.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments & Payouts",
    icon: CreditCard,
    color: "emerald",
    questions: [
      {
        q: "How and when do I receive payouts?",
        a: "Payouts are processed weekly on Fridays for orders delivered and confirmed. The amount (minus platform fees) is transferred to your registered bank account within 2-3 business days.",
      },
      {
        q: "What are the platform fees?",
        a: "Platform commission is 5-15% depending on your seller tier. Transaction fees and payment gateway charges are additional. View detailed breakdown in Settings > Fees.",
      },
      {
        q: "How do I update my bank details?",
        a: "Navigate to Settings > Payout. Update your bank account details and verify with an OTP. Changes take effect from the next payout cycle.",
      },
    ],
  },
  {
    id: "returns",
    title: "Returns & Refunds",
    icon: RotateCcw,
    color: "red",
    questions: [
      {
        q: "What is the return policy?",
        a: "Standard return window is 7 days from delivery. Returns are allowed for damaged, defective, or incorrect items. Some categories may have different policies.",
      },
      {
        q: "Who pays for return shipping?",
        a: "If the return is due to seller error (wrong/defective item), the seller covers shipping. For buyer's remorse returns, the buyer typically pays return shipping.",
      },
      {
        q: "When are refunds processed?",
        a: "Refunds are initiated once the returned item is received and inspected (usually 24-48 hours). The refund reaches the buyer within 5-7 business days.",
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics & Growth",
    icon: TrendingUp,
    color: "indigo",
    questions: [
      {
        q: "Where can I view my sales analytics?",
        a: "Access detailed analytics at Seller Dashboard > Analytics. View sales trends, top products, customer demographics, and performance metrics.",
      },
      {
        q: "How can I improve my product visibility?",
        a: "Optimize titles with keywords, use high-quality images, maintain competitive pricing, encourage reviews, and keep high stock levels. Featured listings are available for premium visibility.",
      },
      {
        q: "What affects my seller rating?",
        a: "Rating is based on order fulfillment rate, shipping speed, customer reviews, response time, return rate, and policy compliance. Maintain 4+ stars to access premium features.",
      },
    ],
  },
];

// Quick action cards
const QUICK_ACTIONS = [
  {
    title: "Create Support Ticket",
    description: "Get personalized help from our team",
    icon: MessageSquare,
    href: "/support/create",
    color: "blue",
  },
  {
    title: "Seller Guidelines",
    description: "Best practices for successful selling",
    icon: BookOpen,
    href: "/guide/seller",
    color: "green",
  },
  {
    title: "Fee Structure",
    description: "Understand platform fees and commissions",
    icon: DollarSign,
    href: "/fees",
    color: "purple",
  },
  {
    title: "Policy Center",
    description: "Terms, shipping, and return policies",
    icon: ShieldCheck,
    href: "/legal/seller-policy",
    color: "orange",
  },
];

// Collapsible FAQ item
function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-100 dark:border-gray-700 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <span className="font-medium text-gray-900 dark:text-white">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

// FAQ Category section
function FAQCategory({
  category,
  openIndex,
  onToggle,
}: {
  category: (typeof FAQ_CATEGORIES)[0];
  openIndex: number | null;
  onToggle: (index: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = category.icon;

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    emerald: "bg-emerald-100 text-emerald-600",
    red: "bg-red-100 text-red-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            colorClasses[category.color]
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-gray-900 dark:text-white">{category.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {category.questions.length} questions
          </p>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="px-4 border-t border-gray-100 dark:border-gray-700">
          {category.questions.map((item, index) => (
            <FAQItem
              key={index}
              question={item.q}
              answer={item.a}
              isOpen={openIndex === index}
              onToggle={() => onToggle(openIndex === index ? -1 : index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SellerHelpPage() {
  const { isSeller } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [openQuestions, setOpenQuestions] = useState<Record<string, number>>(
    {},
  );

  // Filter FAQs by search
  const filteredCategories = searchQuery.trim()
    ? FAQ_CATEGORIES.map((cat) => ({
        ...cat,
        questions: cat.questions.filter(
          (q) =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      })).filter((cat) => cat.questions.length > 0)
    : FAQ_CATEGORIES;

  const handleToggle = (categoryId: string, index: number) => {
    setOpenQuestions((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId] === index ? -1 : index,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl font-bold mb-2">Seller Help Center</h1>
          <p className="text-blue-100 mb-8">
            Find answers to common questions and get the support you need
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <FormInput
              id="help-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              leftIcon={<Search className="h-5 w-5" />}
              className="rounded-xl py-3"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 -mt-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            const colorClasses: Record<string, string> = {
              blue: "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
              green:
                "bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white",
              purple:
                "bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
              orange:
                "bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
            };

            return (
              <Link
                key={action.title}
                href={action.href}
                className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                    colorClasses[action.color]
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm mb-1">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-500">{action.description}</p>
              </Link>
            );
          })}
        </div>

        {/* FAQ Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>

          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="font-medium text-gray-900 dark:text-white">No results found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Try different keywords or browse categories below
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-blue-600 hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <FAQCategory
                  key={category.id}
                  category={category}
                  openIndex={openQuestions[category.id] ?? null}
                  onToggle={(index) => handleToggle(category.id, index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Still need help?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/support/create"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <MessageSquare className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Submit a Ticket</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get help within 24 hours
                </p>
              </div>
            </Link>

            <a
              href="mailto:seller-support@letitrip.in"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Mail className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Us</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  seller-support@letitrip.in
                </p>
              </div>
            </a>

            <a
              href="tel:+918001234567"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Phone className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Call Us</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mon-Sat, 9AM-6PM IST</p>
              </div>
            </a>
          </div>
        </div>

        {/* Seller Resources */}
        <div className="mt-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Seller Academy</h3>
              <p className="text-gray-300 text-sm">
                Learn tips and tricks to grow your business with our free
                courses
              </p>
            </div>
            <Link
              href="/guide/seller"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Explore
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
