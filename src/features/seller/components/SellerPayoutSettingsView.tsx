/**
 * SellerPayoutSettingsView
 *
 * Lets a seller configure where their earnings are sent:
 *   1. UPI — enter UPI ID
 *   2. Bank Transfer — account holder name, account number (confirmed), IFSC, bank name, account type
 *
 * The server never returns the full account number; only accountNumberMasked is shown.
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionItem,
  AdminPageHeader,
  Card,
  Button,
  FormField,
  FormGroup,
  Alert,
  Text,
  Heading,
  Badge,
  Spinner,
} from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useSellerPayoutSettings } from "@/features/seller";

const { spacing, flex, themed } = THEME_CONSTANTS;

// ─── UPI form ─────────────────────────────────────────────────────────────────

interface UpiFormProps {
  defaultUpiId: string;
  isSaving: boolean;
  onSave: (upiId: string) => void;
}

function UpiForm({ defaultUpiId, isSaving, onSave }: UpiFormProps) {
  const t = useTranslations("sellerPayoutSettings");
  const [upiId, setUpiId] = useState(defaultUpiId);

  return (
    <div className={spacing.stack}>
      <FormField
        type="text"
        name="upiId"
        label={t("upiIdLabel")}
        value={upiId}
        onChange={(v) => setUpiId(v)}
        placeholder={t("upiIdPlaceholder")}
        helpText={t("upiIdHelper")}
      />
      <Button
        variant="primary"
        isLoading={isSaving}
        onClick={() => onSave(upiId)}
      >
        {t("saveButton")}
      </Button>
    </div>
  );
}

// ─── Bank form ────────────────────────────────────────────────────────────────

interface BankFormProps {
  defaultMasked: string;
  isSaving: boolean;
  onSave: (bank: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountType: "savings" | "current";
  }) => void;
}

function BankForm({ defaultMasked, isSaving, onSave }: BankFormProps) {
  const t = useTranslations("sellerPayoutSettings");
  const [form, setForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    bankName: "",
    accountType: "savings" as "savings" | "current",
  });
  const [mismatch, setMismatch] = useState(false);

  const set = (key: string, v: string) => setForm((f) => ({ ...f, [key]: v }));

  const handleSave = () => {
    if (form.accountNumber !== form.confirmAccountNumber) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    onSave({
      accountHolderName: form.accountHolderName,
      accountNumber: form.accountNumber,
      ifscCode: form.ifscCode,
      bankName: form.bankName,
      accountType: form.accountType,
    });
  };

  return (
    <div className={spacing.stack}>
      {defaultMasked && (
        <Alert variant="info" title={t("maskedNote")}>
          {`${t("currentAccount")}: ••••${defaultMasked}`}
        </Alert>
      )}
      <FormField
        type="text"
        name="accountHolderName"
        label={t("accountHolderLabel")}
        value={form.accountHolderName}
        onChange={(v) => set("accountHolderName", v)}
        placeholder={t("accountHolderPlaceholder")}
      />
      <FormGroup columns={2}>
        <FormField
          type="password"
          name="accountNumber"
          label={t("accountNumberLabel")}
          value={form.accountNumber}
          onChange={(v) => set("accountNumber", v)}
          placeholder="XXXXXXXXXX"
        />
        <FormField
          type="password"
          name="confirmAccountNumber"
          label={t("confirmAccountNumberLabel")}
          value={form.confirmAccountNumber}
          onChange={(v) => set("confirmAccountNumber", v)}
          placeholder="XXXXXXXXXX"
          error={mismatch ? t("accountNumberMismatch") : undefined}
        />
      </FormGroup>
      <FormGroup columns={2}>
        <FormField
          type="text"
          name="ifscCode"
          label={t("ifscLabel")}
          value={form.ifscCode}
          onChange={(v) => set("ifscCode", v.toUpperCase())}
          placeholder="ABCD0123456"
          helpText={t("ifscHelper")}
        />
        <FormField
          type="text"
          name="bankName"
          label={t("bankNameLabel")}
          value={form.bankName}
          onChange={(v) => set("bankName", v)}
          placeholder={t("bankNamePlaceholder")}
        />
      </FormGroup>
      <FormField
        type="select"
        name="accountType"
        label={t("accountTypeLabel")}
        value={form.accountType}
        onChange={(v) => set("accountType", v)}
        options={[
          { value: "savings", label: t("savings") },
          { value: "current", label: t("current") },
        ]}
      />
      <Button variant="primary" isLoading={isSaving} onClick={handleSave}>
        {t("saveButton")}
      </Button>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function SellerPayoutSettingsView() {
  const t = useTranslations("sellerPayoutSettings");
  const [selectedMethod, setSelectedMethod] = useState<
    "upi" | "bank_transfer" | null
  >(null);

  const {
    payoutDetails,
    isConfigured,
    isLoading,
    isSaving,
    updatePayoutSettings,
  } = useSellerPayoutSettings();

  const activeMethod = selectedMethod ?? payoutDetails?.method ?? null;

  if (isLoading) {
    return (
      <div className={`${flex.center} py-16`}>
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  return (
    <div className={spacing.stack}>
      <AdminPageHeader
        title={t("pageTitle")}
        subtitle={t("pageSubtitle")}
        badge={
          isConfigured ? (
            <Badge variant="success">{t("configured")}</Badge>
          ) : undefined
        }
      />

      {!isConfigured && (
        <Alert variant="warning" title={t("notConfiguredTitle")}>
          {t("notConfiguredDesc")}
        </Alert>
      )}

      {/* Method selector */}
      <Card className="p-6">
        <Accordion
          type="multiple"
          defaultValue={[
            "seller-payout-settings-method",
            activeMethod === "upi"
              ? "seller-payout-settings-upi"
              : "seller-payout-settings-bank",
          ]}
          className="rounded-2xl border border-zinc-200 dark:border-slate-700 overflow-hidden"
        >
          <AccordionItem
            value="seller-payout-settings-method"
            title={<Text className="font-semibold">{t("methodHeading")}</Text>}
          >
            <FormGroup columns={2} className="pt-3">
              {(["upi", "bank_transfer"] as const).map((method) => (
                <Button
                  key={method}
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedMethod(method)}
                  className={`p-4 h-auto items-start flex-col text-left whitespace-normal border-2 w-full gap-0 ${
                    activeMethod === method
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : `${themed.border} ${themed.bgPrimary} hover:border-primary/50`
                  }`}
                >
                  <Text weight="semibold" className="mb-1">
                    {method === "upi"
                      ? t("methodUpiTitle")
                      : t("methodBankTitle")}
                  </Text>
                  <Text variant="secondary" size="sm">
                    {method === "upi" ? t("methodUpiDesc") : t("methodBankDesc")}
                  </Text>
                </Button>
              ))}
            </FormGroup>
          </AccordionItem>

          {activeMethod === "upi" && (
            <AccordionItem
              value="seller-payout-settings-upi"
              title={<Text className="font-semibold">{t("upiHeading")}</Text>}
            >
              <div className="pt-3">
                <UpiForm
                  defaultUpiId={payoutDetails?.upiId ?? ""}
                  isSaving={isSaving}
                  onSave={(upiId) =>
                    updatePayoutSettings({ method: "upi", upiId })
                  }
                />
              </div>
            </AccordionItem>
          )}

          {activeMethod === "bank_transfer" && (
            <AccordionItem
              value="seller-payout-settings-bank"
              title={<Text className="font-semibold">{t("bankHeading")}</Text>}
            >
              <div className="pt-3">
                <BankForm
                  defaultMasked={
                    payoutDetails?.bankAccount?.accountNumberMasked ?? ""
                  }
                  isSaving={isSaving}
                  onSave={(bank) =>
                    updatePayoutSettings({
                      method: "bank_transfer",
                      bankAccount: bank,
                    })
                  }
                />
              </div>
            </AccordionItem>
          )}
        </Accordion>
      </Card>
    </div>
  );
}
