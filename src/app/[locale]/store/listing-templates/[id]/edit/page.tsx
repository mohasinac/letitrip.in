"use client";

/**
 * Edit a listing template.
 *
 * ## What changed
 *
 * `listingTemplateFormSchema` already existed and already validated the route;
 * this page used raw controls and ignored it.
 *
 * It also PATCHed `{ ...form, defaults }` — the entire loaded document,
 * including `id`, `storeId`, `createdAt`, `updatedAt` and `usageCount`. The
 * update schema was `.partial()` but not `.strict()`, so those extra keys were
 * silently stripped rather than rejected; the payload is now narrowed to the
 * editable fields and the schema tightened to `.strict()`, in that order, so a
 * stray key becomes a 400 instead of a silent no-op.
 *
 * `listingType` is deliberately not editable — changing a template's type
 * after creation would invalidate every default stored against it.
 */

import {
  Container,
  Stack,
  Heading,
  Button,
  Row,
  Section,
  Skeleton,
  Form,
  FieldInput,
  FieldTextarea,
  FieldCheckbox,
  FormErrorSummary,
  applyZodIssues,
  ROUTES,
  useToast,
  ConfirmDeleteModal,
  ACTIONS,
  normalizeError,
  listingTemplateUpdateSchema,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { API_ROUTES } from "@/constants";
import {
  getListingTemplate,
  updateListingTemplate,
  deleteListingTemplate,
} from "@/lib/api/store-client";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [form, setForm] = useState({
    name: "",
    description: "",
    isShared: false,
    isActive: true,
  });
  const [defaultsJson, setDefaultsJson] = useState("{}");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    getListingTemplate(API_ROUTES.STORE.LISTING_TEMPLATE_BY_ID(id))
      .then((r) => r.json())
      .then((j) => {
        const doc = (j?.data ?? {}) as Record<string, unknown>;
        setForm({
          name: String(doc.name ?? ""),
          description: String(doc.description ?? ""),
          isShared: Boolean(doc.isShared),
          isActive: doc.isActive !== false,
        });
        setDefaultsJson(JSON.stringify(doc.defaults ?? {}, null, 2));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const onDelete = async () => {
    await deleteListingTemplate(API_ROUTES.STORE.LISTING_TEMPLATE_BY_ID(id));
    router.push(String(ROUTES.STORE.LISTING_TEMPLATES));
  };

  if (loading) {
    return (
      <Section>
        <Container size="md">
          <Stack gap="md" padding="y-lg">
            <Skeleton variant="rectangular" height="32px" />
            <Skeleton variant="rectangular" height="56px" />
            <Skeleton variant="rectangular" height="120px" />
          </Stack>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Edit Listing Template</Heading>
          <Form schema={listingTemplateUpdateSchema} onSubmit={(e) => e.preventDefault()}>
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
                <FieldTextarea
                  name="defaults"
                  label="Defaults (JSON)"
                  rows={8}
                  value={defaultsJson}
                  onChange={setDefaultsJson}
                />
                <Row gap="md" wrap>
                  <FieldCheckbox
                    name="isShared"
                    label="Shared"
                    checked={form.isShared}
                    onChange={(v) => setForm({ ...form, isShared: v })}
                  />
                  <FieldCheckbox
                    name="isActive"
                    label="Active"
                    checked={form.isActive}
                    onChange={(v) => setForm({ ...form, isActive: v })}
                  />
                </Row>
                <Row justify="between" gap="sm">
                  <Button variant="danger" type="button" onClick={() => setConfirmDelete(true)}>
                    {ACTIONS.STORE["delete-listing"].label}
                  </Button>
                  <Row gap="sm">
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

                        let defaults: unknown;
                        try {
                          defaults = JSON.parse(defaultsJson || "{}");
                        } catch (err) {
                          void normalizeError(err);
                          setFieldError("defaults", "Defaults must be valid JSON.");
                          return;
                        }

                        const parsed = listingTemplateUpdateSchema.safeParse({
                          ...form,
                          defaults,
                        });
                        if (!parsed.success) {
                          applyZodIssues(parsed.error.issues, setFieldError);
                          return;
                        }

                        setSaving(true);
                        const res = await updateListingTemplate(
                          API_ROUTES.STORE.LISTING_TEMPLATE_BY_ID(id),
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
                </Row>
              </Stack>
            )}
          </Form>
        </Stack>
      </Container>
      <ConfirmDeleteModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
        title="Delete template?"
        message="This cannot be undone."
      />
    </Section>
  );
}
