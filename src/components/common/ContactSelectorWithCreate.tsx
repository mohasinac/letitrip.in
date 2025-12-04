"use client";

import React, { useState, useEffect } from "react";
import { Phone, Plus, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, FormInput } from "@/components/forms";
import { MobileInput } from "@/components/common/MobileInput";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
  isValidPhone,
} from "@/constants/validation-messages";
import { logError } from "@/lib/firebase-error-logger";
import { useLoadingState } from "@/hooks/useLoadingState";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  countryCode: string;
  email?: string;
  relationship?: string;
  isPrimary: boolean;
  createdAt: Date;
}

const ContactSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH, VALIDATION_MESSAGES.NAME.TOO_SHORT),
  phone: z
    .string()
    .length(10, "Phone must be 10 digits")
    .refine((val) => isValidPhone(`+91${val}`), "Invalid phone number"),
  countryCode: z.string(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  relationship: z.string().optional(),
  isPrimary: z.boolean(),
});

type ContactFormData = z.infer<typeof ContactSchema>;

export interface ContactSelectorWithCreateProps {
  value?: string | null;
  onChange: (contactId: string, contact: Contact) => void;
  required?: boolean;
  error?: string;
  label?: string;
  autoSelectPrimary?: boolean;
  className?: string;
}

export function ContactSelectorWithCreate({
  value,
  onChange,
  required = false,
  error,
  label = "Select Contact",
  autoSelectPrimary = true,
  className = "",
}: ContactSelectorWithCreateProps) {
  const {
    isLoading: loading,
    data: contacts,
    setData: setContacts,
    execute,
  } = useLoadingState<Contact[]>({
    initialData: [],
    onLoadError: (error) => {
      logError(error as Error, { component: "ContactSelectorWithCreate.loadContacts" });
      toast.error("Failed to load contacts");
    },
  });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(value || null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      countryCode: "+91",
      isPrimary: false,
    },
  });

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (autoSelectPrimary && (contacts || []).length > 0 && !selectedId) {
      const primary = (contacts || []).find((c) => c.isPrimary);
      if (primary) {
        setSelectedId(primary.id);
        onChange(primary.id, primary);
      }
    }
  }, [contacts, autoSelectPrimary, selectedId, onChange]);

  const loadContacts = () =>
    execute(async () => {
      // TODO: Implement actual API
      return [];
    });

  const handleContactSelect = (contact: Contact) => {
    setSelectedId(contact.id);
    onChange(contact.id, contact);
  };

  const onSubmit = async (data: ContactFormData) => {
    try {
      setSubmitting(true);
      const newContact: Contact = {
        id: `contact_${Date.now()}`,
        name: data.name,
        phone: data.phone,
        countryCode: data.countryCode,
        email: data.email,
        relationship: data.relationship,
        isPrimary: data.isPrimary,
        createdAt: new Date(),
      };

      setContacts([...(contacts || []), newContact]);
      setSelectedId(newContact.id);
      onChange(newContact.id, newContact);
      setShowForm(false);
      toast.success("Contact added successfully");
    } catch (error) {
      logError(error as Error, {
        component: "ContactSelectorWithCreate.addContact",
      });
      toast.error("Failed to add contact");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && (contacts || []).length === 0) {
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
        {(contacts || []).length === 0 ? (
          <div className="text-center p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <Phone className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              No saved contacts
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>
        ) : (
          <>
            {(contacts || []).map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => handleContactSelect(contact)}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all
                  ${
                    selectedId === contact.id
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {selectedId === contact.id ? (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {contact.name}
                      </span>
                      {contact.isPrimary && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {contact.countryCode} {contact.phone}
                    </p>
                    {contact.email && (
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {contact.email}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
            >
              <div className="flex items-center justify-center gap-2 text-primary">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add New Contact</span>
              </div>
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add Contact
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <FormField label="Name" required error={errors.name?.message}>
                <FormInput {...register("name")} placeholder="Full Name" />
              </FormField>

              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <MobileInput
                    value={field.value || ""}
                    onChange={field.onChange}
                    countryCode={watch("countryCode")}
                    onCountryCodeChange={(code) =>
                      setValue("countryCode", code)
                    }
                    required
                    error={errors.phone?.message}
                    label="Phone Number"
                  />
                )}
              />

              <FormField label="Email (Optional)" error={errors.email?.message}>
                <FormInput
                  {...register("email")}
                  type="email"
                  placeholder="email@example.com"
                />
              </FormField>

              <FormField label="Relationship (Optional)">
                <FormInput
                  {...register("relationship")}
                  placeholder="e.g., Spouse, Parent"
                />
              </FormField>

              <div className="flex items-center gap-3 py-2">
                <input
                  {...register("isPrimary")}
                  type="checkbox"
                  id="isPrimary"
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label
                  htmlFor="isPrimary"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Set as primary contact
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
                      Adding...
                    </>
                  ) : (
                    "Add Contact"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactSelectorWithCreate;
