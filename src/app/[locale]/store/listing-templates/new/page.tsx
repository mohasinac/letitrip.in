"use client";

/**
 * Create a listing template.
 *
 * ## What changed
 *
 * `listingTemplateFormSchema` already existed and already validated the route;
 * this page ignored it and used raw controls, so a rejected save produced a
 * generic "Save failed" toast with the reason discarded.
 *
 * The listing-type dropdown was also a hand-written list of EIGHT types
 * against a union of TEN — `art` and `stickers` were unofferable, so a seller
 * simply could not create a template for either. It now derives from
 * `LISTING_TEMPLATE_TYPE_OPTIONS`.
 */

import {
  Container,
  Stack,
  Heading,
  Button,
  Row,
  Section,
  Form,
  FieldInput,
  FieldSelect,
  FieldTextarea,
  FieldCheckbox,
  FormErrorSummary,
  applyZodIssues,
  ROUTES,
  useToast,
  ACTIONS,
  normalizeError,
  listingTemplateFormSchema,
  LISTING_TEMPLATE_TYPE_OPTIONS,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { createListingTemplate } from "@/lib/api/store-client";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    description: "",
    listingType: "standard",
    defaultsJson: "{}",
    isShared: false,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>New Listing Template</Heading>
          <Form schema={listingTemplateFormSchema} onSubmit={(e) => e.preventDefault()}>
            {({ setFieldError, clearErrors }) => (
              <Stack gap="md">
                <FormErrorSummary />
                <FieldInput
                  name="name"
                  label="Name"
                  required
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                />
                <FieldTextarea
                  name="description"
                  label="Description"
                  rows={2}
                  value={form.description}
                  onChange={(v) => setForm({ ...form, description: v })}
                />
                <FieldSelect
                  name="listingType"
                  label="Listing type"
                  required
                  value={form.listingType}
                  onChange={(v) => setForm({ ...form, listingType: String(v) })}
                  options={LISTING_TEMPLATE_TYPE_OPTIONS}
                />
                <FieldTextarea
                  name="defaults"
                  label="Defaults (JSON)"
                  rows={6}
                  hint="Applied to a new listing when this template is chosen."
                  value={form.defaultsJson}
                  onChange={(v) => setForm({ ...form, defaultsJson: v })}
                  placeholder='{"condition":"mint","currency":"INR"}'
                />
                <FieldCheckbox
                  name="isShared"
                  label="Share with team"
                  checked={form.isShared}
                  onChange={(v) => setForm({ ...form, isShared: v })}
                />
                <Row justify="end" gap="sm">
                  <Button variant="ghost" type="button" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={saving}
                    isLoading={saving}
                    onClick={async () => {
                      clearErrors();

                      // Malformed JSON is reported on the `defaults` FIELD.
                      // It used to be a toast, which vanishes and takes the
                      // user's place in the textarea with it.
                      let defaults: unknown;
                      try {
                        defaults = JSON.parse(form.defaultsJson || "{}");
                      } catch (err) {
                        void normalizeError(err);
                        setFieldError("defaults", "Defaults must be valid JSON.");
                        return;
                      }

                      const parsed = listingTemplateFormSchema.safeParse({
                        name: form.name,
                        description: form.description,
                        listingType: form.listingType,
                        defaults,
                        isShared: form.isShared,
                        isActive: form.isActive,
                      });
                      if (!parsed.success) {
                        applyZodIssues(parsed.error.issues, setFieldError);
                        return;
                      }

                      setSaving(true);
                      const res = await createListingTemplate(
                        API_ROUTES.STORE.LISTING_TEMPLATES,
                        parsed.data,
                      );
                      setSaving(false);
                      if (res.ok) {
                        showToast("Saved", "success");
                        router.push(String(ROUTES.STORE.LISTING_TEMPLATES));
                      } else {
                        const detail = await res
                          .json()
                          .then((j: { error?: string; message?: string }) => j?.error ?? j?.message)
                          .catch(() => undefined);
                        setFieldError("name", detail ?? "Save failed");
                      }
                    }}
                  >
                    {ACTIONS.STORE["save-changes"].label}
                  </Button>
                </Row>
              </Stack>
            )}
          </Form>
        </Stack>
      </Container>
    </Section>
  );
}
