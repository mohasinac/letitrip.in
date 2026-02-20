"use client";

import { useState } from "react";
import {
  ROUTES,
  UI_LABELS,
  THEME_CONSTANTS,
  SITE_CONFIG,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UI_PLACEHOLDERS,
} from "@/constants";
import { FormField, Alert, Button } from "@/components";
import { useMessage } from "@/hooks";
import { isValidEmail, isRequired } from "@/utils";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";

const LABELS = UI_LABELS.CONTACT_PAGE;
const { themed, typography, spacing } = THEME_CONSTANTS;

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const INITIAL_FORM: ContactForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const { showSuccess, showError } = useMessage();
  const [form, setForm] = useState<ContactForm>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactForm>>({});

  const validate = (): boolean => {
    const newErrors: Partial<ContactForm> = {};
    if (!isRequired(form.name))
      newErrors.name = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD;
    if (!isValidEmail(form.email))
      newErrors.email = ERROR_MESSAGES.VALIDATION.INVALID_EMAIL;
    if (!isRequired(form.subject))
      newErrors.subject = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD;
    if (!form.message || form.message.length < 10)
      newErrors.message = "Message must be at least 10 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await apiClient.post(API_ENDPOINTS.CONTACT.SEND, form);
      setSubmitted(true);
      setForm(INITIAL_FORM);
      showSuccess(SUCCESS_MESSAGES.CONTACT.SENT);
    } catch {
      showError(ERROR_MESSAGES.CONTACT.SEND_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  };

  const INFO_ITEMS = [
    {
      icon: "✉️",
      label: LABELS.INFO_EMAIL_LABEL,
      value: SITE_CONFIG.contact.email,
    },
    {
      icon: "📞",
      label: LABELS.INFO_PHONE_LABEL,
      value: SITE_CONFIG.contact.phone,
    },
    {
      icon: "📍",
      label: LABELS.INFO_ADDRESS_LABEL,
      value: SITE_CONFIG.contact.address,
    },
    {
      icon: "🕐",
      label: LABELS.INFO_HOURS_LABEL,
      value: LABELS.INFO_HOURS_VALUE,
    },
  ];

  return (
    <div className={`${themed.bgPrimary} min-h-screen`}>
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">{LABELS.TITLE}</h1>
          <p className="text-blue-100 text-lg">{LABELS.SUBTITLE}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-5 gap-12">
          {/* Contact info */}
          <aside className="md:col-span-2">
            <h2 className={`${typography.h3} ${themed.textPrimary} mb-6`}>
              {LABELS.INFO_TITLE}
            </h2>
            <div className={spacing.stack}>
              {INFO_ITEMS.map(({ icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <span className="text-xl shrink-0">{icon}</span>
                  <div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${themed.textSecondary}`}
                    >
                      {label}
                    </p>
                    <p className={`mt-1 text-sm ${themed.textPrimary}`}>
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`mt-8 p-4 rounded-xl ${themed.bgSecondary} border ${themed.border}`}
            >
              <p className={`text-sm ${themed.textSecondary}`}>
                {LABELS.FAQ_LINK}{" "}
                <Link
                  href={ROUTES.PUBLIC.FAQS}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  {UI_LABELS.FOOTER.FAQS}
                </Link>
              </p>
            </div>
          </aside>

          {/* Form */}
          <div className="md:col-span-3">
            <h2 className={`${typography.h3} ${themed.textPrimary} mb-6`}>
              {LABELS.FORM_TITLE}
            </h2>

            {submitted && (
              <Alert variant="success" className="mb-6">
                {LABELS.FORM_SUCCESS}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className={spacing.stack}>
              <FormField
                name="name"
                label={LABELS.FORM_NAME}
                type="text"
                value={form.name}
                onChange={(value) => setForm((f) => ({ ...f, name: value }))}
                placeholder={UI_PLACEHOLDERS.NAME}
                error={errors.name}
                required
              />
              <FormField
                name="email"
                label={LABELS.FORM_EMAIL}
                type="email"
                value={form.email}
                onChange={(value) => setForm((f) => ({ ...f, email: value }))}
                placeholder={UI_PLACEHOLDERS.EMAIL}
                error={errors.email}
                required
              />
              <FormField
                name="subject"
                label={LABELS.FORM_SUBJECT}
                type="text"
                value={form.subject}
                onChange={(value) => setForm((f) => ({ ...f, subject: value }))}
                placeholder={UI_PLACEHOLDERS.TITLE}
                error={errors.subject}
                required
              />
              <FormField
                name="message"
                label={LABELS.FORM_MESSAGE}
                type="textarea"
                value={form.message}
                onChange={(value) => setForm((f) => ({ ...f, message: value }))}
                placeholder={UI_PLACEHOLDERS.MESSAGE}
                error={errors.message}
                required
              />
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? LABELS.FORM_SENDING : LABELS.FORM_SEND}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
