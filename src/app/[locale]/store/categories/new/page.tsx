"use client";

/**
 * Create a storefront category.
 *
 * ## What changed
 *
 * This page had five raw `<Input>`/`<Textarea>` controls, no `<Form>` wrapper
 * and no validation of any kind — an entirely empty category could be saved,
 * and the only feedback on failure was a generic "Save failed" toast that
 * threw away whatever the server actually objected to.
 *
 * It now shares ONE schema with `POST /api/store/categories`
 * (`storeCategoryFormSchema`), so what the form accepts and what the route
 * accepts cannot drift apart, and every rejection lands on the field that
 * caused it instead of in a toast.
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
  FieldTextarea,
  FormErrorSummary,
  applyZodIssues,
  ROUTES,
  useToast,
  ACTIONS,
  storeCategoryFormSchema,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { createStoreCategory } from "@/lib/api/store-client";
import { useState } from "react";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    label: "",
    slug: "",
    description: "",
    coverImageUrl: "",
    displayOrder: 0,
  });
  const [saving, setSaving] = useState(false);

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>New Storefront Category</Heading>
          <Form schema={storeCategoryFormSchema} onSubmit={(e) => e.preventDefault()}>
            {({ setFieldError, clearErrors }) => (
              <Stack gap="md">
                <FormErrorSummary />
                <FieldInput
                  name="label"
                  label="Label"
                  required
                  value={form.label}
                  onChange={(v) => setForm({ ...form, label: v })}
                />
                <FieldInput
                  name="slug"
                  label="Slug"
                  hint="Left blank, this is generated from the label."
                  value={form.slug}
                  onChange={(v) => setForm({ ...form, slug: v })}
                  placeholder={slugify(form.label) || "auto"}
                />
                <FieldTextarea
                  name="description"
                  label="Description"
                  rows={3}
                  value={form.description}
                  onChange={(v) => setForm({ ...form, description: v })}
                />
                <FieldInput
                  name="coverImageUrl"
                  label="Cover image URL"
                  value={form.coverImageUrl}
                  onChange={(v) => setForm({ ...form, coverImageUrl: v })}
                />
                <FieldInput
                  name="displayOrder"
                  type="number"
                  label="Display order"
                  value={String(form.displayOrder)}
                  onChange={(v) => setForm({ ...form, displayOrder: Number(v) || 0 })}
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
                      // The slug is derived here, before parsing, so a blank
                      // one is filled rather than reported as an error — the
                      // server requires it, the form does not ask for it.
                      const values = { ...form, slug: form.slug || slugify(form.label) };
                      const parsed = storeCategoryFormSchema.safeParse(values);
                      if (!parsed.success) {
                        applyZodIssues(parsed.error.issues, setFieldError);
                        return;
                      }
                      setSaving(true);
                      const res = await createStoreCategory(
                        API_ROUTES.STORE.STORE_CATEGORIES,
                        values,
                      );
                      setSaving(false);
                      if (res.ok) {
                        showToast("Saved", "success");
                        router.push(String(ROUTES.STORE.STORE_CATEGORIES));
                      } else {
                        // `createStoreCategory` returns a raw Response, so the
                        // server's message has to be read out of the body.
                        // This used to be an unconditional "Save failed" toast
                        // that discarded whatever the route actually objected to.
                        const detail = await res
                          .json()
                          .then((j: { error?: string; message?: string }) => j?.error ?? j?.message)
                          .catch(() => undefined);
                        setFieldError("label", detail ?? "Save failed");
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
