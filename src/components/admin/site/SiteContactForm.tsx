/**
 * SiteContactForm Component
 * Path: src/components/admin/site/SiteContactForm.tsx
 *
 * Form for editing site contact information (email, phone, address).
 * Uses FormField from @/components and UI_LABELS from @/constants.
 */

"use client";

import { Card, Heading, FormField } from "@/components";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import type { SiteSettingsDocument } from "@/db/schema";

const { spacing, enhancedCard, typography } = THEME_CONSTANTS;

interface SiteContactFormProps {
  settings: Partial<SiteSettingsDocument>;
  onChange: (updated: Partial<SiteSettingsDocument>) => void;
}

export function SiteContactForm({ settings, onChange }: SiteContactFormProps) {
  const contact = settings.contact || { email: "", phone: "", address: "" };

  const updateContact = (field: string, value: string) => {
    onChange({
      ...settings,
      contact: { ...contact, [field]: value },
    });
  };

  return (
    <Card className={enhancedCard.base}>
      <div className={spacing.cardPadding}>
        <Heading level={3} className={`${typography.cardTitle} mb-4`}>
          {UI_LABELS.ADMIN.SITE.CONTACT_INFO}
        </Heading>
        <div className={spacing.stack}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              name="contactEmail"
              label={UI_LABELS.ADMIN.SITE.SUPPORT_EMAIL}
              type="email"
              value={contact.email || ""}
              onChange={(value) => updateContact("email", value)}
            />
            <FormField
              name="contactPhone"
              label={UI_LABELS.ADMIN.SITE.SUPPORT_PHONE}
              type="tel"
              value={contact.phone || ""}
              onChange={(value) => updateContact("phone", value)}
            />
          </div>
          <FormField
            name="contactAddress"
            label={UI_LABELS.ADMIN.SITE.ADDRESS}
            type="textarea"
            rows={3}
            value={contact.address || ""}
            onChange={(value) => updateContact("address", value)}
          />
        </div>
      </div>
    </Card>
  );
}
