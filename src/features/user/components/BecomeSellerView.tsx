"use client";

/**
 * BecomeSellerView
 *
 * Multi-state view for the /user/become-seller page.
 *
 * States:
 *  1. Guide � user with role="user" reads 5 sections, then applies
 *  2. Success � just applied this session (pending admin review)
 *  3. Already a seller / admin / moderator � redirect to seller dashboard
 */

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Alert,
  Badge,
  Button,
  Caption,
  Card,
  Checkbox,
  Divider,
  Heading,
  Li,
  Span,
  Spinner,
  Text,
  Ul,
} from "@/components";
import { useAuth, useBecomeSeller } from "@/hooks";
import { ROUTES, THEME_CONSTANTS } from "@/constants";

const { spacing, themed, flex, page } = THEME_CONSTANTS;

// --- Section IDs --------------------------------------------------------------

const SECTION_IDS = [
  "howItWorks",
  "fees",
  "whatYouCanSell",
  "auctions",
  "responsibilities",
] as const;

type SectionId = (typeof SECTION_IDS)[number];

// --- Single guide section card ------------------------------------------------

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
      className={`p-4 transition-colors ${
        read
          ? "border border-emerald-300 dark:border-emerald-700"
          : "border border-transparent"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Step number */}
        <div
          aria-hidden="true"
          className={`mt-0.5 w-7 h-7 rounded-full flex-shrink-0 ${flex.center} text-xs font-bold ${
            read
              ? "bg-emerald-500 text-white"
              : "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
          }`}
        >
          {sectionIndex + 1}
        </div>

        <div className="flex-1 min-w-0">
          <Heading level={4} className="mb-2">
            {t(`sections.${id}.title`)}
          </Heading>
          <Text variant="secondary" size="sm" className="mb-3">
            {t(`sections.${id}.intro`)}
          </Text>

          {/* Bullet points */}
          <Ul className={`${spacing.stack} list-none mb-4`}>
            {(t.raw(`sections.${id}.points`) as string[]).map((point, i) => (
              <Li key={i} className="flex items-start gap-2">
                <Span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                <Text size="sm">{point}</Text>
              </Li>
            ))}
          </Ul>

          <Divider className="mb-4" />

          {/* Read acknowledgement */}
          <Checkbox
            id={checkboxId}
            checked={read}
            onChange={(e) => onToggle(id, e.target.checked)}
            label={t("ackLabel")}
          />
        </div>
      </div>
    </Card>
  );
}

// --- Post-apply success state -------------------------------------------------

function SuccessState() {
  const t = useTranslations("becomeSeller.states.success");

  return (
    <Card className={`p-6 text-center max-w-xl mx-auto`}>
      <div className={`${flex.colCenter} gap-4`}>
        <div
          className={`w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 ${flex.center} text-3xl`}
        >
          ??
        </div>
        <Badge variant="success">{t("badge")}</Badge>
        <Heading level={2}>{t("title")}</Heading>
        <Text variant="secondary" className="max-w-md mx-auto">
          {t("message")}
        </Text>
        <Alert variant="info">{t("note")}</Alert>
      </div>
    </Card>
  );
}

// --- Main component -----------------------------------------------------------

export function BecomeSellerView() {
  const t = useTranslations("becomeSeller");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const { mutate: applyAsSeller, isLoading: isApplying } = useBecomeSeller();

  // Track which guide sections have been read/acknowledged
  const [readSections, setReadSections] = useState<Record<SectionId, boolean>>(
    () =>
      SECTION_IDS.reduce(
        (acc, id) => ({ ...acc, [id]: false }),
        {} as Record<SectionId, boolean>,
      ),
  );

  // Local post-apply state � session isn't refreshed until re-login
  const [justApplied, setJustApplied] = useState(false);

  const allSectionsRead = SECTION_IDS.every((id) => readSections[id]);
  const readCount = SECTION_IDS.filter((id) => readSections[id]).length;

  // Users who are already sellers / admins / mods go straight to their dashboard
  const isAlreadySeller =
    user?.role === "seller" ||
    user?.role === "admin" ||
    user?.role === "moderator";

  useEffect(() => {
    if (!authLoading && isAlreadySeller) {
      router.replace(ROUTES.SELLER.DASHBOARD);
    }
  }, [authLoading, isAlreadySeller, router]);

  if (authLoading || isAlreadySeller) {
    return (
      <div className={`${flex.hCenter} ${page.empty}`}>
        <Spinner />
      </div>
    );
  }

  if (justApplied) {
    return <SuccessState />;
  }

  const handleToggle = (id: SectionId, checked: boolean) => {
    setReadSections((prev) => ({ ...prev, [id]: checked }));
  };

  const handleApply = async () => {
    try {
      await applyAsSeller(undefined);
      setJustApplied(true);
    } catch {
      // error toast already shown by useBecomeSeller's onError handler
    }
  };

  return (
    <div className={spacing.stack}>
      {/* Page header */}
      <div>
        <Heading level={1}>{t("title")}</Heading>
        <Text variant="secondary" className="mt-1">
          {t("subtitle")}
        </Text>
      </div>

      {/* Progress banner */}
      <Alert
        variant={allSectionsRead ? "success" : "info"}
        title={t("guide.title")}
      >
        {allSectionsRead
          ? t("guide.allReadMessage")
          : t("guide.progress", { read: readCount, total: SECTION_IDS.length })}
      </Alert>

      {/* Guide section cards */}
      <div className={spacing.stack}>
        {SECTION_IDS.map((id, index) => (
          <GuideSection
            key={id}
            id={id}
            sectionIndex={index}
            read={readSections[id]}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Apply call-to-action */}
      <div
        className={`${themed.bgSecondary} rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4`}
      >
        <div>
          <Heading level={3}>{t("applyTitle")}</Heading>
          <Text variant="secondary" size="sm" className="mt-0.5">
            {t("applySubtitle")}
          </Text>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={handleApply}
          disabled={!allSectionsRead}
          isLoading={isApplying}
          className="sm:flex-shrink-0"
        >
          {t("applyButton")}
        </Button>
      </div>

      {!allSectionsRead && (
        <Caption className="text-center text-amber-600 dark:text-amber-400">
          {t("guide.readAllHint")}
        </Caption>
      )}
    </div>
  );
}
