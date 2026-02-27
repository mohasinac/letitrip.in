"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { Button } from "@/components/ui";
import { FormField } from "@/components/FormField";
import { Alert } from "@/components/feedback";
import { useMessage, useContactSubmit } from "@/hooks";
import { isValidEmail, isRequired } from "@/utils";
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
  const mutation = useContactSubmit();
  const t = useTranslations("contact");
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
      await mutation.mutate(form);
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
        {t("formTitle")}
      </h2>

      {submitted && (
        <Alert variant="success" className="mb-6">
          {t("formSuccess")}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className={spacing.stack}>
        <FormField
          name="name"
          label={t("formName")}
          type="text"
          value={form.name}
          onChange={(value: string) => setForm((f) => ({ ...f, name: value }))}
          placeholder={t("namePlaceholder")}
          error={errors.name}
          required
        />
        <FormField
          name="email"
          label={t("formEmail")}
          type="email"
          value={form.email}
          onChange={(value: string) => setForm((f) => ({ ...f, email: value }))}
          placeholder={t("emailPlaceholder")}
          error={errors.email}
          required
        />
        <FormField
          name="subject"
          label={t("formSubject")}
          type="text"
          value={form.subject}
          onChange={(value: string) =>
            setForm((f) => ({ ...f, subject: value }))
          }
          placeholder={t("subjectPlaceholder")}
          error={errors.subject}
          required
        />
        <FormField
          name="message"
          label={t("formMessage")}
          type="textarea"
          value={form.message}
          onChange={(value: string) =>
            setForm((f) => ({ ...f, message: value }))
          }
          placeholder={t("messagePlaceholder")}
          error={errors.message}
          required
        />
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? t("formSending") : t("formSend")}
        </Button>
      </form>
    </div>
  );
}
