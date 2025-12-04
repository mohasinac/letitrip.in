"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Plus,
  Loader2,
  Check,
  Eye,
  Copy,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormField,
  FormInput,
  FormTextarea,
  FormSelect,
} from "@/components/forms";
import { logError } from "@/lib/firebase-error-logger";
import { useLoadingState } from "@/hooks/useLoadingState";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// Template Interface
export interface Template {
  id: string;
  name: string;
  category: "email" | "sms" | "notification";
  subject?: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TEMPLATE_CATEGORIES = [
  { value: "email", label: "Email Template" },
  { value: "sms", label: "SMS Template" },
  { value: "notification", label: "Notification Template" },
];

const TEMPLATE_VARIABLES = [
  "{{user_name}}",
  "{{order_id}}",
  "{{order_total}}",
  "{{product_name}}",
  "{{shop_name}}",
  "{{tracking_number}}",
  "{{date}}",
  "{{time}}",
];

const TemplateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  category: z.enum(["email", "sms", "notification"]),
  subject: z.string().optional(),
  body: z.string().min(10, "Body must be at least 10 characters"),
  isActive: z.boolean(),
});

type TemplateFormData = z.infer<typeof TemplateSchema>;

export interface TemplateSelectorWithCreateProps {
  value?: string | null;
  onChange: (templateId: string, template: Template) => void;
  category?: "email" | "sms" | "notification" | "all";
  required?: boolean;
  error?: string;
  label?: string;
  className?: string;
}

export function TemplateSelectorWithCreate({
  value,
  onChange,
  category = "all",
  required = false,
  error,
  label = "Select Template",
  className = "",
}: TemplateSelectorWithCreateProps) {
  const {
    isLoading: loading,
    data: templates,
    setData: setTemplates,
    execute,
  } = useLoadingState<Template[]>({
    initialData: [],
    onLoadError: (error) => {
      logError(error as Error, {
        component: "TemplateSelectorWithCreate.loadTemplates",
      });
      toast.error("Failed to load templates");
    },
  });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(value || null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(TemplateSchema),
    defaultValues: {
      category: category === "all" ? "email" : category,
      isActive: true,
    },
  });

  const templateCategory = watch("category");
  const templateBody = watch("body");

  useEffect(() => {
    loadTemplates();
  }, [category]);

  const loadTemplates = () =>
    execute(async () => {
      // TODO: Implement actual API
      // const data = await templatesService.list({ category });

      // Mock data
      const mockTemplates: Template[] = [
        {
          id: "1",
          name: "Order Confirmation",
          category: "email",
          subject: "Your Order #{{order_id}} Confirmed",
          body: "Hi {{user_name}},\n\nThank you for your order! Your order #{{order_id}} totaling {{order_total}} has been confirmed.",
          variables: ["{{user_name}}", "{{order_id}}", "{{order_total}}"],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      return category === "all"
        ? mockTemplates
        : mockTemplates.filter((t) => t.category === category);
    });

  const handleTemplateSelect = (template: Template) => {
    setSelectedId(template.id);
    onChange(template.id, template);
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const extractVariables = (text: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = text.match(regex) || [];
    return [...new Set(matches)];
  };

  const insertVariable = (variable: string) => {
    const currentBody = templateBody || "";
    setValue("body", `${currentBody}${variable}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const onSubmit = async (data: TemplateFormData) => {
    try {
      setSubmitting(true);

      const variables = extractVariables(`${data.subject || ""} ${data.body}`);

      // TODO: Implement actual API
      const newTemplate: Template = {
        id: `template_${Date.now()}`,
        name: data.name,
        category: data.category,
        subject: data.subject,
        body: data.body,
        variables,
        isActive: data.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setTemplates([...(templates || []), newTemplate]);
      setSelectedId(newTemplate.id);
      onChange(newTemplate.id, newTemplate);
      setShowForm(false);
      toast.success("Template created successfully");
    } catch (error) {
      logError(error as Error, {
        component: "TemplateSelectorWithCreate.createTemplate",
      });
      toast.error("Failed to create template");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && (templates || []).length === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="flex items-center justify-center p-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="space-y-3">
        {(templates || []).length === 0 ? (
          <div className="text-center p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              No templates found
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </button>
          </div>
        ) : (
          <>
            {(templates || []).map((template) => (
              <div
                key={template.id}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${
                    selectedId === template.id
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className="flex-shrink-0 mt-0.5"
                  >
                    {selectedId === template.id ? (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                        {template.category}
                      </span>
                      {!template.isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                          <AlertCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </div>

                    {template.subject && (
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subject: {template.subject}
                      </p>
                    )}

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {template.body}
                    </p>

                    {template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {template.variables.map((variable, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            {variable}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(variable)}
                              className="hover:text-primary"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePreview(template)}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Eye className="w-3 h-3" />
                      Preview Template
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
            >
              <div className="flex items-center justify-center gap-2 text-primary">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create New Template</span>
              </div>
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Create Template Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Create Template
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <FormField
                label="Template Name"
                required
                error={errors.name?.message}
              >
                <FormInput
                  {...register("name")}
                  placeholder="e.g., Order Confirmation"
                />
              </FormField>

              <FormField
                label="Category"
                required
                error={errors.category?.message}
              >
                <select {...register("category")} className="input w-full">
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </FormField>

              {(templateCategory === "email" ||
                templateCategory === "notification") && (
                <FormField label="Subject" error={errors.subject?.message}>
                  <FormInput
                    {...register("subject")}
                    placeholder="Enter subject line"
                  />
                </FormField>
              )}

              <FormField label="Body" required error={errors.body?.message}>
                <FormTextarea
                  {...register("body")}
                  rows={6}
                  placeholder="Enter template body with variables..."
                />
              </FormField>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Available Variables
                </p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_VARIABLES.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => insertVariable(variable)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white transition-colors"
                    >
                      {variable}
                      <Plus className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  {...register("isActive")}
                  type="checkbox"
                  id="isActive"
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Set template as active
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Template"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Template Preview
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Template Name
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {previewTemplate.name}
                </p>
              </div>

              {previewTemplate.subject && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Subject
                  </p>
                  <p className="text-gray-900 dark:text-white font-mono text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    {previewTemplate.subject}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Body
                </p>
                <div className="text-gray-900 dark:text-white font-mono text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded whitespace-pre-wrap">
                  {previewTemplate.body}
                </div>
              </div>

              <button
                onClick={() => setShowPreview(false)}
                className="btn-primary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplateSelectorWithCreate;
