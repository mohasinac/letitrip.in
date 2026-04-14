"use client";

import { Checkbox } from "@mohasinac/appkit/ui";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth, useBecomeSeller } from "@/hooks";
import { Alert } from "@mohasinac/appkit/ui";
import { Card } from "@/components";
import {
  Caption,
  Heading,
  Li,
  Span,
  Text,
  Ul,
  Badge,
  Button,
  Divider,
  Spinner,
} from "@mohasinac/appkit/ui";
import { BecomeSellerView as AppkitBecomeSellerView } from "@mohasinac/appkit/features/account";
import { ROUTES, THEME_CONSTANTS } from "@/constants";

const SECTION_IDS = [
  "howItWorks",
  "fees",
  "whatYouCanSell",
  "auctions",
  "responsibilities",
] as const;
type SectionId = (typeof SECTION_IDS)[number];

interface GuideSectionProps {
  sectionIndex: number;
  id: SectionId;
  read: boolean;
  onToggle: (id: SectionId, checked: boolean) => void;
}

function GuideSection({ sectionIndex, id, read, onToggle }: GuideSectionProps) {
  const t = useTranslations("becomeSeller.guide");
  const checkboxId = `guide-section-${id}`;
  return (
    <Card
      className={`p-4 transition-colors ${read ? "border-emerald-400 dark:border-emerald-500" : ""}`}
    >
      <div className={THEME_CONSTANTS.flex.between}>
        <Heading level={4}>
          {sectionIndex + 1}. {t(`${id}.title`)}
        </Heading>
        <Checkbox
          id={checkboxId}
          checked={read}
          onChange={(e) => onToggle(id, e.target.checked)}
          aria-label={t("markAsRead")}
        />
      </div>
      <Text size="sm" variant="secondary" className="mt-2">
        {t(`${id}.content`)}
      </Text>
    </Card>
  );
}

export function BecomeSellerView() {
  const router = useRouter();
  const t = useTranslations("becomeSeller");
  const { user, loading } = useAuth();
  const { mutate: becomeSeller, isPending, isSuccess } = useBecomeSeller();
  const [readSections, setReadSections] = useState<Set<SectionId>>(new Set());
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push(ROUTES.AUTH.LOGIN);
    if (
      !loading &&
      user &&
      ["seller", "admin", "moderator"].includes(user.role)
    ) {
      router.push(ROUTES.SELLER.DASHBOARD);
    }
  }, [user, loading, router]);

  const handleToggle = (id: SectionId, checked: boolean) => {
    setReadSections((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const allRead = SECTION_IDS.every((id) => readSections.has(id));
  const canApply = allRead && agreedToTerms;

  if (loading) {
    return (
      <div className={`${THEME_CONSTANTS.flex.center} min-h-screen`}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <AppkitBecomeSellerView
        state="success"
        renderSuccess={() => (
          <div
            className={`${THEME_CONSTANTS.flex.center} flex-col text-center py-16 ${THEME_CONSTANTS.spacing.stack}`}
          >
            <Heading level={2}>{t("successTitle")}</Heading>
            <Text variant="secondary">{t("successDesc")}</Text>
            <Button
              variant="primary"
              onClick={() => router.push(ROUTES.USER.PROFILE)}
            >
              {t("goToProfile")}
            </Button>
          </div>
        )}
      />
    );
  }

  return (
    <AppkitBecomeSellerView
      state="guide"
      renderGuide={() => (
        <div className={THEME_CONSTANTS.spacing.stack}>
          <Heading level={2}>{t("title")}</Heading>
          <Text variant="secondary">{t("subtitle")}</Text>
          <Divider />
          {SECTION_IDS.map((id, i) => (
            <GuideSection
              key={id}
              sectionIndex={i}
              id={id}
              read={readSections.has(id)}
              onToggle={handleToggle}
            />
          ))}
          <Divider />
          <Checkbox
            id="agree-terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            label={t("agreeToTerms")}
          />
          <Button
            variant="primary"
            onClick={() => becomeSeller()}
            disabled={!canApply}
            isLoading={isPending}
          >
            {t("applyNow")}
          </Button>
        </div>
      )}
    />
  );
}
