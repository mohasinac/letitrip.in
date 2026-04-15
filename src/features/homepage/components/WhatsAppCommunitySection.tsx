"use client";
// Thin adapter — layout lives in @mohasinac/appkit
import { useTranslations } from "next-intl";
import { useHomepageSections } from "@/hooks";
import { proseMirrorToHtml } from "@/utils";
import { WhatsAppCommunitySection as AppkitWhatsAppCommunitySection } from "@mohasinac/appkit/features/homepage";
import type { WhatsAppCommunitySectionConfig } from "@/db/schema";

export function WhatsAppCommunitySection() {
  const t = useTranslations("homepage");
  const { data, isLoading } = useHomepageSections(
    "type=whatsapp-community&enabled=true",
  );
  const section = data?.[0];
  const config = section?.config as WhatsAppCommunitySectionConfig | undefined;

  const descriptionHtml = config?.description
    ? proseMirrorToHtml(config.description)
    : undefined;

  return (
    <AppkitWhatsAppCommunitySection
      title={config?.title ?? t("whatsappTitle")}
      descriptionHtml={descriptionHtml}
      memberCount={config?.memberCount}
      memberCountLabel={t("whatsappMemberCount", {
        count: config?.memberCount ?? 0,
      })}
      testimonial={config?.testimonial}
      benefits={config?.benefits}
      buttonText={config?.buttonText ?? t("whatsappCta")}
      groupLink={config?.groupLink}
      isLoading={isLoading}
    />
  );
}

