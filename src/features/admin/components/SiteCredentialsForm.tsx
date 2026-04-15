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

import { FormFieldSpan } from "@mohasinac/appkit/ui";
import { FormGroup } from "@mohasinac/appkit/ui";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Heading, Text, Accordion, AccordionItem, Div, Row } from "@mohasinac/appkit/ui";
import {
  Card, FormField } from "@/components";
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
      <Text
        size="xs"
        className="text-green-600 dark:text-green-400 font-medium"
      >
        {t("credentialSet")}
      </Text>
    ) : (
      <Text
        size="xs"
        className="text-amber-600 dark:text-amber-400 font-medium"
      >
        {t("credentialNotSet")}
      </Text>
    );

  const countConfigured = (fields: Array<string | undefined>) =>
    fields.filter(Boolean).length;

  return (
    <Card className={enhancedCard.base}>
      <Div className={spacing.cardPadding}>
        <Heading level={3} className={`${typography.cardTitle} mb-1`}>
          {t("credentialsTitle")}
        </Heading>
        <Text variant="secondary" size="sm" className="mb-6">
          {t("credentialsSubtitle")}
        </Text>

        <Accordion
          type="multiple"
          defaultValue={["razorpay", "resend"]}
          className="rounded-2xl border border-zinc-200 dark:border-slate-700 overflow-hidden"
        >
          <AccordionItem
            value="razorpay"
            title={
              <Row justify="between" className="gap-3 pr-2">
                <Text size="sm" className="font-semibold">
                  {t("razorpaySection")}
                </Text>
                <Text size="xs" variant="secondary">
                  {countConfigured([
                    maskedCredentials.razorpayKeyId,
                    maskedCredentials.razorpayKeySecret,
                    maskedCredentials.razorpayWebhookSecret,
                  ])}
                  /3
                </Text>
              </Row>
            }
          >
            <FormGroup columns={2} className="pt-2">
              <Div>
                <Row justify="between" className="mb-1">
                  <Text size="sm" className="font-medium">
                    {t("razorpayKeyId")}
                  </Text>
                  {statusBadge(maskedCredentials.razorpayKeyId)}
                </Row>
                <FormField
                  name="razorpayKeyId"
                  label=""
                  type="text"
                  value={values.razorpayKeyId ?? ""}
                  placeholder={hint(maskedCredentials.razorpayKeyId)}
                  onChange={(v) => update("razorpayKeyId", v)}
                  autoComplete="off"
                />
              </Div>

              <Div>
                <Row justify="between" className="mb-1">
                  <Text size="sm" className="font-medium">
                    {t("razorpayKeySecret")}
                  </Text>
                  {statusBadge(maskedCredentials.razorpayKeySecret)}
                </Row>
                <FormField
                  name="razorpayKeySecret"
                  label=""
                  type="password"
                  value={values.razorpayKeySecret ?? ""}
                  placeholder={hint(maskedCredentials.razorpayKeySecret)}
                  onChange={(v) => update("razorpayKeySecret", v)}
                  autoComplete="new-password"
                />
              </Div>

              <FormFieldSpan>
                <Div>
                  <Row justify="between" className="mb-1">
                    <Text size="sm" className="font-medium">
                      {t("razorpayWebhookSecret")}
                    </Text>
                    {statusBadge(maskedCredentials.razorpayWebhookSecret)}
                  </Row>
                  <FormField
                    name="razorpayWebhookSecret"
                    label=""
                    type="password"
                    value={values.razorpayWebhookSecret ?? ""}
                    placeholder={hint(maskedCredentials.razorpayWebhookSecret)}
                    onChange={(v) => update("razorpayWebhookSecret", v)}
                    autoComplete="new-password"
                  />
                </Div>
              </FormFieldSpan>
            </FormGroup>
          </AccordionItem>

          <AccordionItem
            value="resend"
            title={
              <Row justify="between" className="gap-3 pr-2">
                <Text size="sm" className="font-semibold">
                  {t("resendSection")}
                </Text>
                <Text size="xs" variant="secondary">
                  {countConfigured([maskedCredentials.resendApiKey])}/1
                </Text>
              </Row>
            }
          >
            <Div className="pt-2">
              <Div>
                <Row justify="between" className="mb-1">
                  <Text size="sm" className="font-medium">
                    {t("resendApiKey")}
                  </Text>
                  {statusBadge(maskedCredentials.resendApiKey)}
                </Row>
                <FormField
                  name="resendApiKey"
                  label=""
                  type="password"
                  value={values.resendApiKey ?? ""}
                  placeholder={hint(maskedCredentials.resendApiKey)}
                  onChange={(v) => update("resendApiKey", v)}
                  autoComplete="new-password"
                />
              </Div>
            </Div>
          </AccordionItem>

          <AccordionItem
            value="whatsapp"
            title={
              <Row justify="between" className="gap-3 pr-2">
                <Text size="sm" className="font-semibold">
                  {t("whatsappSection")}
                </Text>
                <Text size="xs" variant="secondary">
                  {countConfigured([
                    values.whatsappNumber,
                    maskedCredentials.whatsappApiKey,
                  ])}
                  /2
                </Text>
              </Row>
            }
          >
            <FormGroup columns={2} className="pt-2">
              <FormField
                name="whatsappNumber"
                label={t("whatsappNumber")}
                type="tel"
                value={values.whatsappNumber ?? ""}
                placeholder="+91XXXXXXXXXX"
                onChange={(v) => update("whatsappNumber", v)}
              />

              <Div>
                <Row justify="between" className="mb-1">
                  <Text size="sm" className="font-medium">
                    {t("whatsappApiKey")}
                  </Text>
                  {statusBadge(maskedCredentials.whatsappApiKey)}
                </Row>
                <FormField
                  name="whatsappApiKey"
                  label=""
                  type="password"
                  value={values.whatsappApiKey ?? ""}
                  placeholder={hint(maskedCredentials.whatsappApiKey)}
                  onChange={(v) => update("whatsappApiKey", v)}
                  autoComplete="new-password"
                />
              </Div>
            </FormGroup>
          </AccordionItem>

          <AccordionItem
            value="shiprocket"
            title={
              <Row justify="between" className="gap-3 pr-2">
                <Text size="sm" className="font-semibold">
                  {t("shiprocketSection")}
                </Text>
                <Text size="xs" variant="secondary">
                  {countConfigured([
                    maskedCredentials.shiprocketEmail,
                    maskedCredentials.shiprocketPassword,
                  ])}
                  /2
                </Text>
              </Row>
            }
          >
            <FormGroup columns={2} className="pt-2">
              <Div>
                <Row justify="between" className="mb-1">
                  <Text size="sm" className="font-medium">
                    {t("shiprocketEmail")}
                  </Text>
                  {statusBadge(maskedCredentials.shiprocketEmail)}
                </Row>
                <FormField
                  name="shiprocketEmail"
                  label=""
                  type="email"
                  value={values.shiprocketEmail ?? ""}
                  placeholder={hint(maskedCredentials.shiprocketEmail)}
                  onChange={(v) => update("shiprocketEmail", v)}
                  autoComplete="off"
                />
              </Div>

              <Div>
                <Row justify="between" className="mb-1">
                  <Text size="sm" className="font-medium">
                    {t("shiprocketPassword")}
                  </Text>
                  {statusBadge(maskedCredentials.shiprocketPassword)}
                </Row>
                <FormField
                  name="shiprocketPassword"
                  label=""
                  type="password"
                  value={values.shiprocketPassword ?? ""}
                  placeholder={hint(maskedCredentials.shiprocketPassword)}
                  onChange={(v) => update("shiprocketPassword", v)}
                  autoComplete="new-password"
                />
              </Div>
            </FormGroup>
          </AccordionItem>

          <AccordionItem
            value="meta"
            title={
              <Row justify="between" className="gap-3 pr-2">
                <Text size="sm" className="font-semibold">
                  {t("metaSection")}
                </Text>
                <Text size="xs" variant="secondary">
                  {countConfigured([
                    maskedCredentials.metaAppId,
                    maskedCredentials.metaAppSecret,
                    maskedCredentials.metaPageAccessToken,
                    maskedCredentials.metaPageId,
                  ])}
                  /4
                </Text>
              </Row>
            }
          >
            <FormGroup columns={2} className="pt-2">
              <Div>
                <Row justify="between" className="mb-1">
                  <Text size="sm" className="font-medium">
                    {t("metaAppId")}
                  </Text>
                  {statusBadge(maskedCredentials.metaAppId)}
                </Row>
                <FormField
                  name="metaAppId"
                  label=""
                  type="text"
                  value={values.metaAppId ?? ""}
                  placeholder={hint(maskedCredentials.metaAppId)}
                  onChange={(v) => update("metaAppId", v)}
                  autoComplete="off"
                />
              </Div>

              <Div>
                <Row justify="between" className="mb-1">
                  <Text size="sm" className="font-medium">
                    {t("metaAppSecret")}
                  </Text>
                  {statusBadge(maskedCredentials.metaAppSecret)}
                </Row>
                <FormField
                  name="metaAppSecret"
                  label=""
                  type="password"
                  value={values.metaAppSecret ?? ""}
                  placeholder={hint(maskedCredentials.metaAppSecret)}
                  onChange={(v) => update("metaAppSecret", v)}
                  autoComplete="new-password"
                />
              </Div>

              <FormFieldSpan>
                <Div>
                  <Row justify="between" className="mb-1">
                    <Text size="sm" className="font-medium">
                      {t("metaPageAccessToken")}
                    </Text>
                    {statusBadge(maskedCredentials.metaPageAccessToken)}
                  </Row>
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
                </Div>
              </FormFieldSpan>

              <FormField
                name="metaPageId"
                label={t("metaPageId")}
                type="text"
                value={values.metaPageId ?? ""}
                placeholder={hint(maskedCredentials.metaPageId)}
                onChange={(v) => update("metaPageId", v)}
                autoComplete="off"
              />
            </FormGroup>
          </AccordionItem>
        </Accordion>
      </Div>
    </Card>
  );
}

