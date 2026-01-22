/**
 * Admin Content Management Page
 *
 * Manage static content like FAQs, legal texts, and other site content.
 * RBAC: Only accessible to admin users
 *
 * @page /admin/content - Content management page
 */

"use client";

import { useState } from "react";

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

interface LegalText {
  id: string;
  type: "terms" | "privacy" | "returns" | "shipping";
  title: string;
  content: string;
  lastUpdated: Date;
  version: string;
}

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<"faq" | "legal" | "pages">("faq");
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [editingLegal, setEditingLegal] = useState<LegalText | null>(null);

  // Mock data - in production, fetch from API
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: "1",
      category: "General",
      question: "What is Let It Rip?",
      answer:
        "Let It Rip is India's premier online marketplace combining e-commerce with auctions...",
      order: 1,
      active: true,
    },
    {
      id: "2",
      category: "Products & Ordering",
      question: "How do I place an order?",
      answer: "Browse products, add to cart, checkout, and complete payment...",
      order: 2,
      active: true,
    },
  ]);

  const [legalTexts, setLegalTexts] = useState<LegalText[]>([
    {
      id: "1",
      type: "terms",
      title: "Terms & Conditions",
      content: "1. Introduction\nThese terms and conditions...",
      lastUpdated: new Date(),
      version: "1.0",
    },
    {
      id: "2",
      type: "privacy",
      title: "Privacy Policy",
      content: "We respect your privacy...",
      lastUpdated: new Date(),
      version: "1.0",
    },
  ]);

  const faqCategories = [
    "General",
    "Products & Ordering",
    "Auctions",
    "Shipping & Delivery",
    "Selling on Let It Rip",
    "Account & Security",
    "Offers & Discounts",
    "Technical Issues",
  ];

  const legalTypes = [
    { value: "terms", label: "Terms & Conditions" },
    { value: "privacy", label: "Privacy Policy" },
    { value: "returns", label: "Returns & Refunds" },
    { value: "shipping", label: "Shipping Policy" },
  ];

  const handleSaveFAQ = () => {
    if (!editingFAQ) return;

    if (editingFAQ.id === "new") {
      // Add new FAQ
      const newFAQ = {
        ...editingFAQ,
        id: Date.now().toString(),
      };
      setFaqs([...faqs, newFAQ]);
    } else {
      // Update existing FAQ
      setFaqs(faqs.map((f) => (f.id === editingFAQ.id ? editingFAQ : f)));
    }

    setEditingFAQ(null);
  };

  const handleDeleteFAQ = (id: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      setFaqs(faqs.filter((f) => f.id !== id));
    }
  };

  const handleSaveLegal = () => {
    if (!editingLegal) return;

    if (editingLegal.id === "new") {
      // Add new legal text
      const newLegal = {
        ...editingLegal,
        id: Date.now().toString(),
        lastUpdated: new Date(),
      };
      setLegalTexts([...legalTexts, newLegal]);
    } else {
      // Update existing legal text
      const updated = {
        ...editingLegal,
        lastUpdated: new Date(),
      };
      setLegalTexts(
        legalTexts.map((l) => (l.id === editingLegal.id ? updated : l)),
      );
    }

    setEditingLegal(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Content Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage FAQs, legal texts, and other static content
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("faq")}
              className={`pb-4 border-b-2 font-medium transition ${
                activeTab === "faq"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              📋 FAQs
            </button>
            <button
              onClick={() => setActiveTab("legal")}
              className={`pb-4 border-b-2 font-medium transition ${
                activeTab === "legal"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              ⚖️ Legal Texts
            </button>
            <button
              onClick={() => setActiveTab("pages")}
              className={`pb-4 border-b-2 font-medium transition ${
                activeTab === "pages"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              📄 Static Pages
            </button>
          </nav>
        </div>

        {/* FAQ Management */}
        {activeTab === "faq" && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <button
                onClick={() =>
                  setEditingFAQ({
                    id: "new",
                    category: "General",
                    question: "",
                    answer: "",
                    order: faqs.length + 1,
                    active: true,
                  })
                }
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                + Add New FAQ
              </button>
            </div>

            {/* FAQ List */}
            <div className="grid gap-4">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-2">
                        {faq.category}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {faq.question}
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingFAQ(faq)}
                        className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFAQ(faq.id)}
                        className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                      >
                        Delete
                      </button>
                      <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition">
                        {faq.active ? "Active" : "Inactive"}
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>

            {/* FAQ Edit Modal */}
            {editingFAQ && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {editingFAQ.id === "new" ? "Add New FAQ" : "Edit FAQ"}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={editingFAQ.category}
                        onChange={(e) =>
                          setEditingFAQ({
                            ...editingFAQ,
                            category: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {faqCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Question
                      </label>
                      <input
                        type="text"
                        value={editingFAQ.question}
                        onChange={(e) =>
                          setEditingFAQ({
                            ...editingFAQ,
                            question: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter question"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Answer
                      </label>
                      <textarea
                        value={editingFAQ.answer}
                        onChange={(e) =>
                          setEditingFAQ({
                            ...editingFAQ,
                            answer: e.target.value,
                          })
                        }
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter detailed answer"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingFAQ.active}
                          onChange={(e) =>
                            setEditingFAQ({
                              ...editingFAQ,
                              active: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Active (visible to users)
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      onClick={() => setEditingFAQ(null)}
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveFAQ}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                    >
                      Save FAQ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Legal Text Management */}
        {activeTab === "legal" && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Legal Texts & Policies
              </h2>
              <button
                onClick={() =>
                  setEditingLegal({
                    id: "new",
                    type: "terms",
                    title: "",
                    content: "",
                    lastUpdated: new Date(),
                    version: "1.0",
                  })
                }
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                + Add New Policy
              </button>
            </div>

            {/* Legal List */}
            <div className="grid gap-4">
              {legalTexts.map((legal) => (
                <div
                  key={legal.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {legal.title}
                      </h3>
                      <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Version: {legal.version}</span>
                        <span>
                          Last Updated: {legal.lastUpdated.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingLegal(legal)}
                        className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                      >
                        Edit
                      </button>
                      <button className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition">
                        Preview
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                    {legal.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Legal Edit Modal */}
            {editingLegal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {editingLegal.id === "new"
                      ? "Add New Legal Text"
                      : "Edit Legal Text"}
                  </h3>

                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Type
                        </label>
                        <select
                          value={editingLegal.type}
                          onChange={(e) =>
                            setEditingLegal({
                              ...editingLegal,
                              type: e.target.value as any,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {legalTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Version
                        </label>
                        <input
                          type="text"
                          value={editingLegal.version}
                          onChange={(e) =>
                            setEditingLegal({
                              ...editingLegal,
                              version: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., 1.0, 2.1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editingLegal.title}
                        onChange={(e) =>
                          setEditingLegal({
                            ...editingLegal,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content
                      </label>
                      <textarea
                        value={editingLegal.content}
                        onChange={(e) =>
                          setEditingLegal({
                            ...editingLegal,
                            content: e.target.value,
                          })
                        }
                        rows={15}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                        placeholder="Enter legal text content. Supports Markdown formatting."
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Tip: Use Markdown for formatting (headings, lists, bold,
                        etc.)
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      onClick={() => setEditingLegal(null)}
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveLegal}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                    >
                      Save Legal Text
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Static Pages Management */}
        {activeTab === "pages" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Static Pages
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Manage content for About, Contact, and other static pages
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Static pages management feature will be available soon
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
