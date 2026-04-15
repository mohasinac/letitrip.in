"use client";

import { useTranslations } from "next-intl";
import { ContactForm as AppkitContactForm } from "@mohasinac/appkit/features/contact";
import { ERROR_MESSAGES } from "@/constants";
import { useContactSubmit } from "@/hooks";

export function ContactForm() {
  const t = useTranslations("contact");
  const mutation = useContactSubmit();

  return (
    <AppkitContactForm
      labels={{
        title: t("formTitle"),
        nameLabel: t("formName"),
        namePlaceholder: t("namePlaceholder"),
        emailLabel: t("formEmail"),
        emailPlaceholder: t("emailPlaceholder"),
        subjectLabel: t("formSubject"),
        subjectPlaceholder: t("subjectPlaceholder"),
        messageLabel: t("formMessage"),
        messagePlaceholder: t("messagePlaceholder"),
        submitButton: t("formSend"),
        submittingButton: t("formSending"),
        successTitle: t("formSuccessTitle"),
        successDescription: t("formSuccess"),
        sendAnotherButton: t("formSendAnother"),
        errorGeneric: ERROR_MESSAGES.CONTACT.SEND_FAILED,
        validationRequired: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
        validationEmail: ERROR_MESSAGES.VALIDATION.INVALID_EMAIL,
        validationMessageTooShort: ERROR_MESSAGES.VALIDATION.MESSAGE_TOO_SHORT,
      }}
      onSubmit={async (data) => {
        await mutation.mutateAsync(data);
      }}
    />
  );
}

