/**
 * SellerStoreView
 *
 * Main feature view for the seller's store settings page.
 *
 * - No store yet  → renders SellerStoreSetupView (create form)
 * - Store exists  → renders the full edit form (StoreDocument fields)
 *
 * Sections: Store Details · Contact & Social · Policies · Vacation Mode
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { Caption, Heading, Label, Span, Text } from "@mohasinac/appkit/ui";
import {
  Accordion,
  AccordionItem,
  Card,
  Alert,
  Button,
  FormField,
  FormGroup,
  Toggle,
  Spinner,
  Divider,
  useToast,
} from "@/components";
import { useAuth } from "@/hooks";
import { ROUTES, THEME_CONSTANTS, SUCCESS_MESSAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { useSellerStore } from "../hooks";
import { SellerStoreSetupView } from "./SellerStoreSetupView";
import type { StoreDocument } from "@/db/schema";

const { themed, spacing, flex } = THEME_CONSTANTS;

// ─── Form state ───────────────────────────────────────────────────────────────

interface StoreFormState {
  storeName: string;
  storeDescription: string;
  storeCategory: string;
  storeLogoURL: string;
  storeBannerURL: string;
  bio: string;
  website: string;
  location: string;
  twitter: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  returnPolicy: string;
  shippingPolicy: string;
  isVacationMode: boolean;
  vacationMessage: string;
  isPublic: boolean;
}

const EMPTY_FORM: StoreFormState = {
  storeName: "",
  storeDescription: "",
  storeCategory: "",
  storeLogoURL: "",
  storeBannerURL: "",
  bio: "",
  website: "",
  location: "",
  twitter: "",
  instagram: "",
  facebook: "",
  linkedin: "",
  returnPolicy: "",
  shippingPolicy: "",
  isVacationMode: false,
  vacationMessage: "",
  isPublic: true,
};

function storeToForm(store: StoreDocument): StoreFormState {
  return {
    storeName: store.storeName ?? "",
    storeDescription: store.storeDescription ?? "",
    storeCategory: store.storeCategory ?? "",
    storeLogoURL: store.storeLogoURL ?? "",
    storeBannerURL: store.storeBannerURL ?? "",
    bio: store.bio ?? "",
    website: store.website ?? "",
    location: store.location ?? "",
    twitter: store.socialLinks?.twitter ?? "",
    instagram: store.socialLinks?.instagram ?? "",
    facebook: store.socialLinks?.facebook ?? "",
    linkedin: store.socialLinks?.linkedin ?? "",
    returnPolicy: store.returnPolicy ?? "",
    shippingPolicy: store.shippingPolicy ?? "",
    isVacationMode: store.isVacationMode ?? false,
    vacationMessage: store.vacationMessage ?? "",
    isPublic: store.isPublic ?? true,
  };
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<StoreDocument["status"], string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  active:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  suspended: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

function StatusBadge({
  status,
  label,
}: {
  status: StoreDocument["status"];
  label: string;
}) {
  return (
    <Span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}
    >
      {label}
    </Span>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function SellerStoreView() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("sellerStore");
  const { showToast } = useToast();

  const { store, isLoading, isSaving, error, updateStore } = useSellerStore();

  const [form, setForm] = useState<StoreFormState>(EMPTY_FORM);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Populate form once store data loads
  useEffect(() => {
    if (store) {
      setForm(storeToForm(store));
    }
  }, [store]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router]);

  const set = useCallback(
    (field: keyof StoreFormState) => (value: string | boolean) =>
      setForm((prev) => ({ ...prev, [field]: value })),
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    try {
      await updateStore({
        storeName: form.storeName || undefined,
        storeDescription: form.storeDescription,
        storeCategory: form.storeCategory,
        storeLogoURL: form.storeLogoURL,
        storeBannerURL: form.storeBannerURL,
        bio: form.bio,
        website: form.website,
        location: form.location,
        socialLinks: {
          twitter: form.twitter,
          instagram: form.instagram,
          facebook: form.facebook,
          linkedin: form.linkedin,
        },
        returnPolicy: form.returnPolicy,
        shippingPolicy: form.shippingPolicy,
        isVacationMode: form.isVacationMode,
        vacationMessage: form.vacationMessage,
        isPublic: form.isPublic,
      });
      showToast(SUCCESS_MESSAGES.USER.STORE_UPDATED, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("saveFailed");
      setSaveError(msg);
      showToast(msg, "error");
    }
  };

  if (isLoading) {
    return (
      <div className={`${flex.center} py-20`}>
        <Spinner size="lg" />
      </div>
    );
  }

  // ── No store yet → show setup flow ────────────────────────────────────────
  if (!store) {
    return <SellerStoreSetupView />;
  }

  // ── Store exists → full edit form ─────────────────────────────────────────

  const statusLabel = {
    pending: t("statusPending"),
    active: t("statusActive"),
    suspended: t("statusSuspended"),
    rejected: t("statusRejected"),
  }[store.status];

  return (
    <form onSubmit={handleSubmit} className={spacing.stack}>
      {/* Status banner */}
      {store.status === "pending" && (
        <Alert variant="warning" title={t("storeStatusLabel")}>
          {t("setupPendingBanner")}
        </Alert>
      )}

      {store.status === "suspended" && (
        <Alert variant="error" title={t("storeStatusLabel")}>
          {t("statusSuspended")}
        </Alert>
      )}

      {/* Vacation mode banner */}
      {form.isVacationMode && (
        <Alert variant="warning" title={t("vacationActiveTitle")}>
          {form.vacationMessage || t("vacationActiveDefault")}
        </Alert>
      )}

      {saveError && <Alert variant="error">{saveError}</Alert>}

      <Card>
        <Accordion
          type="multiple"
          defaultValue={["seller-store-details", "seller-store-social"]}
          className="rounded-2xl border border-zinc-200 dark:border-slate-700 overflow-hidden"
        >
          <AccordionItem
            value="seller-store-details"
            title={
              <Text className="font-semibold">{t("sectionStoreDetails")}</Text>
            }
          >
            <div className={`${spacing.stack} pt-3`}>
              <Text variant="secondary" size="sm">
                {t("sectionStoreDetailsSubtitle")}
              </Text>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Caption>{t("storeStatusLabel")}:</Caption>
                <StatusBadge status={store.status} label={statusLabel} />
              </div>

              {store.storeSlug && (
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${themed.bgSecondary} border ${themed.borderColor}`}
                >
                  <Caption>{t("storeUrlLabel")}</Caption>
                  <Caption className="font-mono">
                    /stores/{store.storeSlug}
                  </Caption>
                </div>
              )}

              <FormField
                name="storeName"
                label={t("storeName")}
                value={form.storeName}
                onChange={set("storeName")}
                placeholder={t("storeNamePlaceholder")}
                required
              />

              <FormField
                name="storeDescription"
                label={t("storeDescription")}
                type="textarea"
                rows={3}
                value={form.storeDescription}
                onChange={set("storeDescription")}
                placeholder={t("storeDescriptionPlaceholder")}
                helpText={t("storeDescriptionHelp")}
              />

              <FormField
                name="storeCategory"
                label={t("storeCategory")}
                value={form.storeCategory}
                onChange={set("storeCategory")}
                placeholder={t("storeCategoryPlaceholder")}
              />

              <FormField
                name="bio"
                label={t("bio")}
                type="textarea"
                rows={2}
                value={form.bio}
                onChange={set("bio")}
                placeholder={t("bioPlaceholder")}
                helpText={t("bioHelp")}
              />

              <FormGroup columns={2}>
                <FormField
                  name="storeLogoURL"
                  label={t("storeLogoURL")}
                  value={form.storeLogoURL}
                  onChange={set("storeLogoURL")}
                  placeholder="https://..."
                />
                <FormField
                  name="storeBannerURL"
                  label={t("storeBannerURL")}
                  value={form.storeBannerURL}
                  onChange={set("storeBannerURL")}
                  placeholder="https://..."
                />
              </FormGroup>

              <div className={flex.between}>
                <div>
                  <Label>{t("storeVisibilityLabel")}</Label>
                  <Caption>{t("storeVisibilityHelp")}</Caption>
                </div>
                <Toggle
                  checked={form.isPublic}
                  onChange={(v) => set("isPublic")(v)}
                />
              </div>
            </div>
          </AccordionItem>

          <AccordionItem
            value="seller-store-social"
            title={<Text className="font-semibold">{t("sectionSocial")}</Text>}
          >
            <div className={`${spacing.stack} pt-3`}>
              <Text variant="secondary" size="sm">
                {t("sectionSocialSubtitle")}
              </Text>

              <FormField
                name="website"
                label={t("website")}
                value={form.website}
                onChange={set("website")}
                placeholder="https://yourwebsite.com"
              />
              <FormField
                name="location"
                label={t("location")}
                value={form.location}
                onChange={set("location")}
                placeholder={t("locationPlaceholder")}
              />

              <Divider />

              <FormGroup columns={2}>
                <FormField
                  name="instagram"
                  label="Instagram"
                  value={form.instagram}
                  onChange={set("instagram")}
                  placeholder="https://instagram.com/..."
                />
                <FormField
                  name="twitter"
                  label="X / Twitter"
                  value={form.twitter}
                  onChange={set("twitter")}
                  placeholder="https://x.com/..."
                />
                <FormField
                  name="facebook"
                  label="Facebook"
                  value={form.facebook}
                  onChange={set("facebook")}
                  placeholder="https://facebook.com/..."
                />
                <FormField
                  name="linkedin"
                  label="LinkedIn"
                  value={form.linkedin}
                  onChange={set("linkedin")}
                  placeholder="https://linkedin.com/in/..."
                />
              </FormGroup>
            </div>
          </AccordionItem>

          <AccordionItem
            value="seller-store-policies"
            title={
              <Text className="font-semibold">{t("sectionPolicies")}</Text>
            }
          >
            <div className={`${spacing.stack} pt-3`}>
              <Text variant="secondary" size="sm">
                {t("sectionPoliciesSubtitle")}
              </Text>

              <FormField
                name="returnPolicy"
                label={t("returnPolicy")}
                type="textarea"
                rows={4}
                value={form.returnPolicy}
                onChange={set("returnPolicy")}
                placeholder={t("returnPolicyPlaceholder")}
              />

              <FormField
                name="shippingPolicy"
                label={t("shippingPolicy")}
                type="textarea"
                rows={4}
                value={form.shippingPolicy}
                onChange={set("shippingPolicy")}
                placeholder={t("shippingPolicyPlaceholder")}
              />
            </div>
          </AccordionItem>

          <AccordionItem
            value="seller-store-vacation"
            title={
              <Text className="font-semibold">{t("sectionVacation")}</Text>
            }
          >
            <div className={`${spacing.stack} pt-3`}>
              <div className={flex.between}>
                <Text variant="secondary" size="sm" className="max-w-[80%]">
                  {t("sectionVacationSubtitle")}
                </Text>
                <Toggle
                  checked={form.isVacationMode}
                  onChange={(v) => set("isVacationMode")(v)}
                />
              </div>

              {form.isVacationMode && (
                <FormField
                  name="vacationMessage"
                  label={t("vacationMessage")}
                  type="textarea"
                  rows={2}
                  value={form.vacationMessage}
                  onChange={set("vacationMessage")}
                  placeholder={t("vacationMessagePlaceholder")}
                  helpText={t("vacationMessageHelp")}
                />
              )}
            </div>
          </AccordionItem>

          <AccordionItem
            value="seller-store-pickup-addresses"
            title={
              <Text className="font-semibold">{t("pickupAddressesTitle")}</Text>
            }
          >
            <div className={`${flex.between} gap-4 pt-3`}>
              <Text variant="secondary" size="sm">
                {t("pickupAddressesSubtitle")}
              </Text>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push(ROUTES.SELLER.ADDRESSES)}
              >
                {t("manageAddresses")}
              </Button>
            </div>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* ── Save ──────────────────────────────────────────────── */}
      <div className="flex justify-start">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSaving}
          disabled={isSaving}
        >
          {isSaving ? t("saving") : t("saveChanges")}
        </Button>
      </div>
    </form>
  );
}
