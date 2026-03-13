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
  /** Shiprocket platform account email (plain, login identity) */
  shiprocketEmail?: string;
  /** Shiprocket platform account password — encrypted at rest */
  shiprocketPassword?: string;
  /** Meta (Facebook) App ID */
  metaAppId?: string;
  /** Meta App Secret — encrypted at rest */
  metaAppSecret?: string;
  /**
   * Meta long-lived page access token — encrypted at rest.
   * Obtain by pasting a short-lived user token from Meta Developers;
   * the server exchanges it for a 60-day token via POST /api/admin/meta/exchange-token.
   */
  metaPageAccessToken?: string;
  /** Meta page ID whose catalog / ads are managed */
  metaPageId?: string;
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
    shiprocketEmail: "",
    shiprocketPassword: "",
    metaAppId: "",
    metaAppSecret: "",
    metaPageAccessToken: "",
    metaPageId: "",
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
            <div className={`${THEME_CONSTANTS.flex.between} mb-1`}>
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
            <div className={`${THEME_CONSTANTS.flex.between} mb-1`}>
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
            <div className={`${THEME_CONSTANTS.flex.between} mb-1`}>
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
            <div className={`${THEME_CONSTANTS.flex.between} mb-1`}>
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
            <div className={`${THEME_CONSTANTS.flex.between} mb-1`}>
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

        {/* ── Shiprocket ──────────────────────────────────────────── */}
        <Heading level={4} className="text-sm font-semibold mb-3 mt-6">
          {t("shiprocketSection")}
        </Heading>
        <div className={`${spacing.stack} mb-6`}>
          <div>
            <div className={`${THEME_CONSTANTS.flex.between} mb-1`}>
              <Text size="sm" className="font-medium">
                {t("shiprocketEmail")}
              </Text>
              {statusBadge(maskedCredentials.shiprocketEmail)}
            </div>
            <FormField
              name="shiprocketEmail"
              label=""
              type="email"
              value={values.shiprocketEmail ?? ""}
              placeholder={hint(maskedCredentials.shiprocketEmail)}
              onChange={(v) => update("shiprocketEmail", v)}
              autoComplete="off"
            />
          </div>

          <div>
            <div className={`${THEME_CONSTANTS.flex.between} mb-1`}>
              <Text size="sm" className="font-medium">
                {t("shiprocketPassword")}
              </Text>
              {statusBadge(maskedCredentials.shiprocketPassword)}
            </div>
            <FormField
              name="shiprocketPassword"
              label=""
              type="password"
              value={values.shiprocketPassword ?? ""}
              placeholder={hint(maskedCredentials.shiprocketPassword)}
              onChange={(v) => update("shiprocketPassword", v)}
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* ── Meta (Facebook / Instagram) ──────────────────────── */}
        <Heading level={4} className="text-sm font-semibold mb-3">
          {t("metaSection")}
        </Heading>
        <div className={spacing.stack}>
          <div>
            <div className={`${THEME_CONSTANTS.flex.between} mb-1`}>
              <Text size="sm" className="font-medium">
                {t("metaAppId")}
              </Text>
              {statusBadge(maskedCredentials.metaAppId)}
            </div>
            <FormField
              name="metaAppId"
              label=""
              type="text"
              value={values.metaAppId ?? ""}
              placeholder={hint(maskedCredentials.metaAppId)}
              onChange={(v) => update("metaAppId", v)}
              autoComplete="off"
            />
          </div>

          <div>
            <div className={`${THEME_CONSTANTS.flex.between} mb-1`}>
              <Text size="sm" className="font-medium">
                {t("metaAppSecret")}
              </Text>
              {statusBadge(maskedCredentials.metaAppSecret)}
            </div>
            <FormField
              name="metaAppSecret"
              label=""
              type="password"
              value={values.metaAppSecret ?? ""}
              placeholder={hint(maskedCredentials.metaAppSecret)}
              onChange={(v) => update("metaAppSecret", v)}
              autoComplete="new-password"
            />
          </div>

          <div>
            <div className={`${THEME_CONSTANTS.flex.between} mb-1`}>
              <Text size="sm" className="font-medium">
                {t("metaPageAccessToken")}
              </Text>
              {statusBadge(maskedCredentials.metaPageAccessToken)}
            </div>
            <FormField
              name="metaPageAccessToken"
              label=""
              type="password"
              value={values.metaPageAccessToken ?? ""}
              placeholder={hint(maskedCredentials.metaPageAccessToken)}
              onChange={(v) => update("metaPageAccessToken", v)}
              autoComplete="new-password"
            />
            <Text size="xs" variant="secondary" className="mt-1">
              {t("metaPageAccessTokenHint")}
            </Text>
          </div>

          <FormField
            name="metaPageId"
            label={t("metaPageId")}
            type="text"
            value={values.metaPageId ?? ""}
            placeholder={hint(maskedCredentials.metaPageId)}
            onChange={(v) => update("metaPageId", v)}
            autoComplete="off"
          />
        </div>
      </div>
    </Card>
  );
}
