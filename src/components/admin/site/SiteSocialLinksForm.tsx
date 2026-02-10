/**
 * SiteSocialLinksForm Component
 * Path: src/components/admin/site/SiteSocialLinksForm.tsx
 *
 * Form for editing social media link URLs.
 * Uses FormField from @/components and UI_LABELS from @/constants.
 */

"use client";

import { Card, Heading, FormField } from "@/components";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import type { SiteSettingsDocument } from "@/db/schema";

const { spacing, enhancedCard, typography } = THEME_CONSTANTS;

interface SiteSocialLinksFormProps {
  settings: Partial<SiteSettingsDocument>;
  onChange: (updated: Partial<SiteSettingsDocument>) => void;
}

export function SiteSocialLinksForm({
  settings,
  onChange,
}: SiteSocialLinksFormProps) {
  const links = settings.socialLinks || {};

  const updateLink = (platform: string, value: string) => {
    onChange({
      ...settings,
      socialLinks: { ...links, [platform]: value },
    });
  };

  return (
    <Card className={enhancedCard.base}>
      <div className={spacing.cardPadding}>
        <Heading level={3} className={`${typography.cardTitle} mb-4`}>
          {UI_LABELS.ADMIN.SITE.SOCIAL_LINKS}
        </Heading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            name="facebook"
            label={UI_LABELS.ADMIN.SITE.FACEBOOK}
            type="text"
            value={links.facebook || ""}
            onChange={(value) => updateLink("facebook", value)}
            placeholder="https://facebook.com/yourpage"
          />
          <FormField
            name="twitter"
            label={UI_LABELS.ADMIN.SITE.TWITTER}
            type="text"
            value={links.twitter || ""}
            onChange={(value) => updateLink("twitter", value)}
            placeholder="https://twitter.com/yourhandle"
          />
          <FormField
            name="instagram"
            label={UI_LABELS.ADMIN.SITE.INSTAGRAM}
            type="text"
            value={links.instagram || ""}
            onChange={(value) => updateLink("instagram", value)}
            placeholder="https://instagram.com/yourprofile"
          />
          <FormField
            name="linkedin"
            label={UI_LABELS.ADMIN.SITE.LINKEDIN}
            type="text"
            value={links.linkedin || ""}
            onChange={(value) => updateLink("linkedin", value)}
            placeholder="https://linkedin.com/company/yourcompany"
          />
        </div>
      </div>
    </Card>
  );
}
