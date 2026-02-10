/**
 * SiteBasicInfoForm Component
 * Path: src/components/admin/site/SiteBasicInfoForm.tsx
 *
 * Form for editing site name and motto/tagline.
 * Uses FormField from @/components and UI_LABELS from @/constants.
 */

"use client";

import { Card, Heading, FormField } from "@/components";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import type { SiteSettingsDocument } from "@/db/schema";

const { spacing, enhancedCard, typography } = THEME_CONSTANTS;

interface SiteBasicInfoFormProps {
  settings: Partial<SiteSettingsDocument>;
  onChange: (updated: Partial<SiteSettingsDocument>) => void;
}

export function SiteBasicInfoForm({
  settings,
  onChange,
}: SiteBasicInfoFormProps) {
  return (
    <Card className={enhancedCard.base}>
      <div className={spacing.cardPadding}>
        <Heading level={3} className={`${typography.cardTitle} mb-4`}>
          {UI_LABELS.ADMIN.SITE.BASIC_INFO}
        </Heading>
        <div className={spacing.stack}>
          <FormField
            name="siteName"
            label={UI_LABELS.ADMIN.SITE.SITE_NAME}
            type="text"
            value={settings.siteName || ""}
            onChange={(value) => onChange({ ...settings, siteName: value })}
          />
          <FormField
            name="motto"
            label={UI_LABELS.ADMIN.SITE.MOTTO}
            type="text"
            value={settings.motto || ""}
            onChange={(value) => onChange({ ...settings, motto: value })}
          />
        </div>
      </div>
    </Card>
  );
}
