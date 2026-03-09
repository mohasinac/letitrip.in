/**
 * SiteCredentialsForm
 *
 * Admin form for managing encrypted provider credentials
 * (Razorpay, Resend, WhatsApp Business API).
 *
 * Security model:
 *  - Server returns MASKED values (e.g. "rzp_li…key4") for display only.
 *  - Input fields are always empty on load — the admin types a NEW value to
 *    replace the stored one, or leaves the field blank to keep it unchanged.
 *  - Rendered as type="password" to prevent shoulder-surfing.
 *  - Plaintext is sent over HTTPS, encrypted at rest by the repository.
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, Heading, Text, FormField } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import type { SiteSettingsCredentialsMasked } from "@/db/schema";

const { spacing, enhancedCard, typography } = THEME_CONSTANTS;

export interface CredentialsUpdateValues {
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
  resendApiKey?: string;
  whatsappApiKey?: string;
  /** WhatsApp contact number — stored in contact.whatsappNumber (plain, not encrypted) */
  whatsappNumber?: string;
}

interface SiteCredentialsFormProps {
  /** Masked current values returned by the API for admin display */
  maskedCredentials: SiteSettingsCredentialsMasked;
  /** Current WhatsApp contact number (from contact.whatsappNumber, not encrypted) */
  whatsappNumber?: string;
  /** Called whenever any field changes so the parent can collect the update */
  onChange: (values: CredentialsUpdateValues) => void;
}

export function SiteCredentialsForm({
  maskedCredentials,
  whatsappNumber,
  onChange,
}: SiteCredentialsFormProps) {
  const t = useTranslations("adminSite");

  const [values, setValues] = useState<CredentialsUpdateValues>({
    razorpayKeyId: "",
    razorpayKeySecret: "",
    razorpayWebhookSecret: "",
    resendApiKey: "",
    whatsappApiKey: "",
    whatsappNumber: whatsappNumber ?? "",
  });

  const update = (field: keyof CredentialsUpdateValues, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    onChange(next);
  };

  const hint = (masked: string | undefined) =>
    masked
      ? `${t("credentialPlaceholderSet")} (${masked})`
      : t("credentialPlaceholderUnset");

  const statusBadge = (masked: string | undefined) =>
    masked ? (
      <Text size="xs" className="text-green-600 font-medium">
        {t("credentialSet")}
      </Text>
    ) : (
      <Text size="xs" className="text-amber-600 font-medium">
        {t("credentialNotSet")}
      </Text>
    );

  return (
    <Card className={enhancedCard.base}>
      <div className={spacing.cardPadding}>
        <Heading level={3} className={`${typography.cardTitle} mb-1`}>
          {t("credentialsTitle")}
        </Heading>
        <Text variant="secondary" size="sm" className="mb-6">
          {t("credentialsSubtitle")}
        </Text>

        {/* ── Razorpay ─────────────────────────────────────────────── */}
        <Heading level={4} className="text-sm font-semibold mb-3 mt-2">
          {t("razorpaySection")}
        </Heading>
        <div className={`${spacing.stack} mb-6`}>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Text size="sm" className="font-medium">
                {t("razorpayKeyId")}
              </Text>
              {statusBadge(maskedCredentials.razorpayKeyId)}
            </div>
            <FormField
              name="razorpayKeyId"
              label=""
              type="text"
              value={values.razorpayKeyId ?? ""}
              placeholder={hint(maskedCredentials.razorpayKeyId)}
              onChange={(v) => update("razorpayKeyId", v)}
              autoComplete="off"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Text size="sm" className="font-medium">
                {t("razorpayKeySecret")}
              </Text>
              {statusBadge(maskedCredentials.razorpayKeySecret)}
            </div>
            <FormField
              name="razorpayKeySecret"
              label=""
              type="password"
              value={values.razorpayKeySecret ?? ""}
              placeholder={hint(maskedCredentials.razorpayKeySecret)}
              onChange={(v) => update("razorpayKeySecret", v)}
              autoComplete="new-password"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Text size="sm" className="font-medium">
                {t("razorpayWebhookSecret")}
              </Text>
              {statusBadge(maskedCredentials.razorpayWebhookSecret)}
            </div>
            <FormField
              name="razorpayWebhookSecret"
              label=""
              type="password"
              value={values.razorpayWebhookSecret ?? ""}
              placeholder={hint(maskedCredentials.razorpayWebhookSecret)}
              onChange={(v) => update("razorpayWebhookSecret", v)}
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* ── Resend ───────────────────────────────────────────────── */}
        <Heading level={4} className="text-sm font-semibold mb-3">
          {t("resendSection")}
        </Heading>
        <div className={`${spacing.stack} mb-6`}>
          <div>
            <div className="flex items-center justify-between mb-1">
              <Text size="sm" className="font-medium">
                {t("resendApiKey")}
              </Text>
              {statusBadge(maskedCredentials.resendApiKey)}
            </div>
            <FormField
              name="resendApiKey"
              label=""
              type="password"
              value={values.resendApiKey ?? ""}
              placeholder={hint(maskedCredentials.resendApiKey)}
              onChange={(v) => update("resendApiKey", v)}
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* ── WhatsApp ─────────────────────────────────────────────── */}
        <Heading level={4} className="text-sm font-semibold mb-3">
          {t("whatsappSection")}
        </Heading>
        <div className={spacing.stack}>
          <FormField
            name="whatsappNumber"
            label={t("whatsappNumber")}
            type="tel"
            value={values.whatsappNumber ?? ""}
            placeholder="+91XXXXXXXXXX"
            onChange={(v) => update("whatsappNumber", v)}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <Text size="sm" className="font-medium">
                {t("whatsappApiKey")}
              </Text>
              {statusBadge(maskedCredentials.whatsappApiKey)}
            </div>
            <FormField
              name="whatsappApiKey"
              label=""
              type="password"
              value={values.whatsappApiKey ?? ""}
              placeholder={hint(maskedCredentials.whatsappApiKey)}
              onChange={(v) => update("whatsappApiKey", v)}
              autoComplete="new-password"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
