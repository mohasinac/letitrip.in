/**
 * SellerStoreView
 *
 * Feature view for seller store profile / settings.
 * Sections: Store Details, Contact & Social, Policies, Vacation Mode.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Alert,
  Button,
  FormField,
  Toggle,
  Heading,
  Text,
  Caption,
  Label,
  Spinner,
  Divider,
  useToast,
} from "@/components";
import { useAuth } from "@/hooks";
import { ROUTES, THEME_CONSTANTS, SUCCESS_MESSAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { useSellerStore } from "../hooks";

const { themed, spacing } = THEME_CONSTANTS;

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
  storeReturnPolicy: string;
  storeShippingPolicy: string;
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
  storeReturnPolicy: "",
  storeShippingPolicy: "",
  isVacationMode: false,
  vacationMessage: "",
  isPublic: true,
};

function profileToForm(
  profile: ReturnType<typeof useSellerStore>["publicProfile"],
): StoreFormState {
  if (!profile) return EMPTY_FORM;
  return {
    storeName: profile.storeName ?? "",
    storeDescription: profile.storeDescription ?? "",
    storeCategory: profile.storeCategory ?? "",
    storeLogoURL: profile.storeLogoURL ?? "",
    storeBannerURL: profile.storeBannerURL ?? "",
    bio: profile.bio ?? "",
    website: profile.website ?? "",
    location: profile.location ?? "",
    twitter: profile.socialLinks?.twitter ?? "",
    instagram: profile.socialLinks?.instagram ?? "",
    facebook: profile.socialLinks?.facebook ?? "",
    linkedin: profile.socialLinks?.linkedin ?? "",
    storeReturnPolicy: (profile as any).storeReturnPolicy ?? "",
    storeShippingPolicy: (profile as any).storeShippingPolicy ?? "",
    isVacationMode: (profile as any).isVacationMode ?? false,
    vacationMessage: (profile as any).vacationMessage ?? "",
    isPublic: profile.isPublic ?? true,
  };
}

export function SellerStoreView() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("sellerStore");
  const { showToast } = useToast();

  const { publicProfile, storeSlug, isLoading, isSaving, error, updateStore } =
    useSellerStore();

  const [form, setForm] = useState<StoreFormState>(EMPTY_FORM);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Populate form once data loads
  useEffect(() => {
    if (publicProfile !== null && publicProfile !== undefined) {
      setForm(profileToForm(publicProfile));
    }
  }, [publicProfile]);

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
        storeReturnPolicy: form.storeReturnPolicy,
        storeShippingPolicy: form.storeShippingPolicy,
        isVacationMode: form.isVacationMode,
        vacationMessage: form.vacationMessage,
        isPublic: form.isPublic,
      });
      showToast(SUCCESS_MESSAGES.USER.STORE_UPDATED, "success");
    } catch (err: any) {
      const msg = err?.message ?? t("saveFailed");
      setSaveError(msg);
      showToast(msg, "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={spacing.stack}>
      {/* Vacation mode banner */}
      {form.isVacationMode && (
        <Alert variant="warning" title={t("vacationActiveTitle")}>
          {form.vacationMessage || t("vacationActiveDefault")}
        </Alert>
      )}

      {saveError && <Alert variant="error">{saveError}</Alert>}

      {/* ── Store Details ─────────────────────────────────────── */}
      <Card>
        <div className={spacing.stack}>
          <div>
            <Heading level={3}>{t("sectionStoreDetails")}</Heading>
            <Text variant="secondary" size="sm" className="mt-0.5">
              {t("sectionStoreDetailsSubtitle")}
            </Text>
          </div>

          {storeSlug && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${themed.bgSecondary} border ${themed.borderColor}`}
            >
              <Caption>{t("storeUrlLabel")}</Caption>
              <Caption className="font-mono">/stores/{storeSlug}</Caption>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div className="flex items-center justify-between">
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
      </Card>

      {/* ── Contact & Social ──────────────────────────────────── */}
      <Card>
        <div className={spacing.stack}>
          <div>
            <Heading level={3}>{t("sectionSocial")}</Heading>
            <Text variant="secondary" size="sm" className="mt-0.5">
              {t("sectionSocialSubtitle")}
            </Text>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>
        </div>
      </Card>

      {/* ── Store Policies ────────────────────────────────────── */}
      <Card>
        <div className={spacing.stack}>
          <div>
            <Heading level={3}>{t("sectionPolicies")}</Heading>
            <Text variant="secondary" size="sm" className="mt-0.5">
              {t("sectionPoliciesSubtitle")}
            </Text>
          </div>

          <FormField
            name="storeReturnPolicy"
            label={t("returnPolicy")}
            type="textarea"
            rows={4}
            value={form.storeReturnPolicy}
            onChange={set("storeReturnPolicy")}
            placeholder={t("returnPolicyPlaceholder")}
          />

          <FormField
            name="storeShippingPolicy"
            label={t("shippingPolicy")}
            type="textarea"
            rows={4}
            value={form.storeShippingPolicy}
            onChange={set("storeShippingPolicy")}
            placeholder={t("shippingPolicyPlaceholder")}
          />
        </div>
      </Card>

      {/* ── Vacation Mode ─────────────────────────────────────── */}
      <Card>
        <div className={spacing.stack}>
          <div className="flex items-center justify-between">
            <div>
              <Heading level={3}>{t("sectionVacation")}</Heading>
              <Text variant="secondary" size="sm" className="mt-0.5">
                {t("sectionVacationSubtitle")}
              </Text>
            </div>
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
      </Card>

      {/* ── Save ──────────────────────────────────────────────── */}
      <div className="flex justify-end">
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
