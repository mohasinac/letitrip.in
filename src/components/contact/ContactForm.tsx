"use client";

import { useState } from "react";
import {
  UI_LABELS,
  THEME_CONSTANTS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  UI_PLACEHOLDERS,
} from "@/constants";
import { Button } from "@/components/ui";
import { FormField } from "@/components/FormField";
import { Alert } from "@/components/feedback";
import { useMessage } from "@/hooks";
import { isValidEmail, isRequired } from "@/utils";
import { apiClient } from "@/lib/api-client";

const LABELS = UI_LABELS.CONTACT_PAGE;
const { typography, themed, spacing } = THEME_CONSTANTS;

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const INITIAL_FORM: ContactFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function ContactForm() {
  const { showSuccess, showError } = useMessage();
  const [form, setForm] = useState<ContactFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const validate = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};
    if (!isRequired(form.name))
      newErrors.name = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD;
    if (!isValidEmail(form.email))
      newErrors.email = ERROR_MESSAGES.VALIDATION.INVALID_EMAIL;
    if (!isRequired(form.subject))
      newErrors.subject = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD;
    if (!form.message || form.message.length < 10)
      newErrors.message = ERROR_MESSAGES.VALIDATION.MESSAGE_TOO_SHORT;
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

  return (
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
          onChange={(value: string) => setForm((f) => ({ ...f, name: value }))}
          placeholder={UI_PLACEHOLDERS.NAME}
          error={errors.name}
          required
        />
        <FormField
          name="email"
          label={LABELS.FORM_EMAIL}
          type="email"
          value={form.email}
          onChange={(value: string) => setForm((f) => ({ ...f, email: value }))}
          placeholder={UI_PLACEHOLDERS.EMAIL}
          error={errors.email}
          required
        />
        <FormField
          name="subject"
          label={LABELS.FORM_SUBJECT}
          type="text"
          value={form.subject}
          onChange={(value: string) =>
            setForm((f) => ({ ...f, subject: value }))
          }
          placeholder={UI_PLACEHOLDERS.TITLE}
          error={errors.subject}
          required
        />
        <FormField
          name="message"
          label={LABELS.FORM_MESSAGE}
          type="textarea"
          value={form.message}
          onChange={(value: string) =>
            setForm((f) => ({ ...f, message: value }))
          }
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
  );
}
