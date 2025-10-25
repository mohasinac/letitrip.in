"use client";

import { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface Policy {
  id: string;
  title: string;
  slug: string;
  content: string;
  isActive: boolean;
  lastModified: string;
  version: number;
}

interface SiteSettings {
  policies: Policy[];
}

export default function PoliciesManagementPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    policies: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Default policies structure
  const defaultPolicies = [
    {
      id: "privacy",
      title: "Privacy Policy",
      slug: "privacy",
      content: "",
      isActive: true,
      lastModified: new Date().toISOString(),
      version: 1,
    },
    {
      id: "terms",
      title: "Terms of Service",
      slug: "terms",
      content: "",
      isActive: true,
      lastModified: new Date().toISOString(),
      version: 1,
    },
    {
      id: "return",
      title: "Return Policy",
      slug: "returns",
      content: "",
      isActive: true,
      lastModified: new Date().toISOString(),
      version: 1,
    },
    {
      id: "shipping",
      title: "Shipping Policy",
      slug: "shipping",
      content: "",
      isActive: true,
      lastModified: new Date().toISOString(),
      version: 1,
    },
    {
      id: "cookies",
      title: "Cookie Policy",
      slug: "cookies",
      content: "",
      isActive: true,
      lastModified: new Date().toISOString(),
      version: 1,
    },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();

        // Check if policies is an array or object and convert accordingly
        let policies;
        if (data.policies) {
          if (Array.isArray(data.policies)) {
            policies = data.policies;
          } else {
            // Convert object format to array format
            policies = defaultPolicies.map((defaultPolicy) => {
              const existingContent =
                data.policies[defaultPolicy.id] ||
                data.policies[defaultPolicy.slug] ||
                "";
              return {
                ...defaultPolicy,
                content: existingContent,
                lastModified: existingContent
                  ? new Date().toISOString()
                  : defaultPolicy.lastModified,
              };
            });
          }
        } else {
          policies = defaultPolicies;
        }

        setSettings({ policies });
      } else {
        // If no policies exist, initialize with defaults
        setSettings({ policies: defaultPolicies });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setSettings({ policies: defaultPolicies });
    } finally {
      setLoading(false);
    }
  };

  const handlePolicyToggle = (policyId: string) => {
    // Ensure policies is an array before mapping
    if (!Array.isArray(settings.policies)) {
      console.error("settings.policies is not an array:", settings.policies);
      return;
    }

    const updatedPolicies = settings.policies.map((policy) =>
      policy.id === policyId
        ? {
            ...policy,
            isActive: !policy.isActive,
            lastModified: new Date().toISOString(),
          }
        : policy
    );
    updateSettings("policies", updatedPolicies);
  };

  const updateSettings = async (key: string, value: any) => {
    setSaving(true);
    try {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditPolicy = (policy: Policy) => {
    setEditingPolicy({ ...policy });
    setIsEditing(true);
  };

  const handleSavePolicy = async () => {
    if (!editingPolicy) return;

    // Ensure policies is an array before mapping
    if (!Array.isArray(settings.policies)) {
      console.error("settings.policies is not an array:", settings.policies);
      return;
    }

    const updatedPolicies = settings.policies.map((policy) =>
      policy.id === editingPolicy.id
        ? {
            ...editingPolicy,
            lastModified: new Date().toISOString(),
            version: policy.version + 1,
          }
        : policy
    );

    await updateSettings("policies", updatedPolicies);
    setIsEditing(false);
    setEditingPolicy(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingPolicy(null);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="h-3 w-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircleIcon className="h-3 w-3 mr-1" />
        Inactive
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center">
                <DocumentTextIcon className="h-8 w-8 mr-3 text-primary" />
                Policies Management
              </h1>
              <p className="text-secondary mt-2">
                Manage your website policies and legal documents
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {saving && <span className="text-sm text-muted">Saving...</span>}
              <span className="text-sm text-muted">Auto-save enabled</span>
            </div>
          </div>
        </div>

        {!isEditing ? (
          <>
            {/* Policies List */}
            <div className="admin-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-xl font-semibold">Legal Policies</h2>
                <p className="text-secondary mt-1">
                  Manage the content and status of your legal policies
                </p>
              </div>

              <div className="divide-y divide-border">
                {Array.isArray(settings.policies) ? (
                  settings.policies.map((policy) => (
                    <div key={policy.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-primary">
                              {policy.title}
                            </h3>
                            {getStatusBadge(policy.isActive)}
                            <span className="text-xs text-muted">
                              v{policy.version}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-muted">
                            <span>Slug: /{policy.slug}</span>
                            <span>•</span>
                            <span>
                              Last modified: {formatDate(policy.lastModified)}
                            </span>
                            <span>•</span>
                            <span>
                              Content:{" "}
                              {policy.content
                                ? `${
                                    Math.round(policy.content.length / 100) *
                                    100
                                  }+ chars`
                                : "Empty"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={policy.isActive}
                              onChange={() => handlePolicyToggle(policy.id)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after: bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>

                          <button
                            onClick={() =>
                              window.open(`/${policy.slug}`, "_blank")
                            }
                            className="p-2 text-muted hover: text-secondary"
                            title="Preview policy"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleEditPolicy(policy)}
                            className="p-2 text-blue-600 hover:text-blue-800"
                            title="Edit policy"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Content Preview */}
                      {policy.content && (
                        <div className="mt-3 bg-surface rounded p-3">
                          <p className="text-sm text-secondary line-clamp-2">
                            {policy.content
                              .replace(/<[^>]*>/g, "")
                              .substring(0, 200)}
                            ...
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-muted">
                    <p>No policies found or invalid data format.</p>
                    <button
                      onClick={() => setSettings({ policies: defaultPolicies })}
                      className="mt-2 text-primary hover:text-primary-dark font-medium"
                    >
                      Initialize with default policies
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="admin-card p-4">
                <h3 className="font-medium text-primary mb-2">
                  📋 Policy Templates
                </h3>
                <p className="text-sm text-secondary mb-3">
                  Need help writing policies? Use our templates as starting
                  points.
                </p>
                <button className="text-sm text-primary hover:text-primary-dark font-medium">
                  Browse Templates →
                </button>
              </div>

              <div className="admin-card p-4">
                <h3 className="font-medium text-primary mb-2">
                  ⚖️ Legal Compliance
                </h3>
                <p className="text-sm text-secondary mb-3">
                  Ensure your policies meet legal requirements for your region.
                </p>
                <button className="text-sm text-primary hover:text-primary-dark font-medium">
                  Learn More →
                </button>
              </div>

              <div className="admin-card p-4">
                <h3 className="font-medium text-primary mb-2">
                  🔄 Version History
                </h3>
                <p className="text-sm text-secondary mb-3">
                  Track changes and maintain version history of your policies.
                </p>
                <button className="text-sm text-primary hover:text-primary-dark font-medium">
                  View History →
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Policy Editor */
          <div className="admin-card">
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Edit Policy</h2>
                  <p className="text-secondary">
                    Editing: {editingPolicy?.title}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-secondary bg-surface rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePolicy}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    Save Policy
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="policy-title"
                    className="block text-sm font-medium text-secondary mb-2"
                  >
                    Policy Title
                  </label>
                  <input
                    type="text"
                    id="policy-title"
                    value={editingPolicy?.title || ""}
                    onChange={(e) =>
                      setEditingPolicy((prev) =>
                        prev ? { ...prev, title: e.target.value } : null
                      )
                    }
                    className="input w-full focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="policy-slug"
                    className="block text-sm font-medium text-secondary mb-2"
                  >
                    URL Slug
                  </label>
                  <div className="flex items-center">
                    <span className="text-muted text-sm mr-1">
                      justforview.in/
                    </span>
                    <input
                      type="text"
                      id="policy-slug"
                      value={editingPolicy?.slug || ""}
                      onChange={(e) =>
                        setEditingPolicy((prev) =>
                          prev ? { ...prev, slug: e.target.value } : null
                        )
                      }
                      className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="policy-content"
                    className="block text-sm font-medium text-secondary mb-2"
                  >
                    Policy Content
                  </label>
                  <textarea
                    id="policy-content"
                    rows={20}
                    value={editingPolicy?.content || ""}
                    onChange={(e) =>
                      setEditingPolicy((prev) =>
                        prev ? { ...prev, content: e.target.value } : null
                      )
                    }
                    className="input w-full focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter your policy content here. You can use HTML formatting if needed."
                  />
                  <p className="text-sm text-muted mt-2">
                    Character count: {editingPolicy?.content?.length || 0}
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="policy-active"
                    checked={editingPolicy?.isActive || false}
                    onChange={(e) =>
                      setEditingPolicy((prev) =>
                        prev ? { ...prev, isActive: e.target.checked } : null
                      )
                    }
                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  />
                  <label
                    htmlFor="policy-active"
                    className="ml-2 text-sm text-secondary"
                  >
                    Make this policy active and visible to users
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
