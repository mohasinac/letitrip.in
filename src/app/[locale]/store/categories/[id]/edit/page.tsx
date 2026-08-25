"use client";

/**
 * Edit a storefront category.
 *
 * ## The cheapest migration in the repo, and the reference for the rest
 *
 * This page and its `new/` sibling edit the SAME entity through the SAME
 * schema — and only the sibling was wired to it. `storeCategoryFormSchema`
 * already existed and was already validating the route; this page just never
 * used it, so the only feedback on a rejected save was a generic "Save failed"
 * toast that discarded whatever the server actually objected to.
 *
 * The pattern here is what every remaining form migration follows:
 *   1. `<Form schema={…}>` with the render-prop form, for `setFieldError`.
 *   2. `<FormErrorSummary />` near the submit control.
 *   3. `Field*` inputs, so `aria-invalid` and the error text are wired.
 *   4. `safeParse` → `applyZodIssues` before the request.
 *   5. On a server rejection, read the body and put the message on a FIELD.
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
  storeCategoryFormSchema,
  type StoreCategoryFormValues,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { API_ROUTES } from "@/constants";
import { getStoreCategory, updateStoreCategory, deleteStoreCategory } from "@/lib/api/store-client";
import { useEffect, useState } from "react";

type FormState = Partial<StoreCategoryFormValues>;

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [form, setForm] = useState<FormState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    getStoreCategory(API_ROUTES.STORE.STORE_CATEGORY_BY_ID(id))
      .then((r) => r.json())
      .then((j) => setForm((j?.data ?? {}) as FormState))
      .finally(() => setLoading(false));
  }, [id]);

  const onDelete = async () => {
    await deleteStoreCategory(API_ROUTES.STORE.STORE_CATEGORY_BY_ID(id));
    router.push(String(ROUTES.STORE.STORE_CATEGORIES));
  };

  if (loading) {
    return (
      <Section>
        <Container size="md">
          <Stack gap="md" padding="y-lg">
            <Skeleton variant="rectangular" height="32px" />
            <Skeleton variant="rectangular" height="56px" />
            <Skeleton variant="rectangular" height="56px" />
            <Skeleton variant="rectangular" height="96px" />
          </Stack>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Edit Storefront Category</Heading>
          <Form schema={storeCategoryFormSchema} onSubmit={(e) => e.preventDefault()}>
            {({ setFieldError, clearErrors }) => (
              <Stack gap="md">
                <FormErrorSummary />
                <FieldInput
                  name="label"
                  label="Label"
                  required
                  value={form.label ?? ""}
                  onChange={(v) => setForm({ ...form, label: v })}
                />
                <FieldInput
                  name="slug"
                  label="Slug"
                  required
                  value={form.slug ?? ""}
                  onChange={(v) => setForm({ ...form, slug: v })}
                />
                <FieldTextarea
                  name="description"
                  label="Description"
                  rows={3}
                  value={form.description ?? ""}
                  onChange={(v) => setForm({ ...form, description: v })}
                />
                <FieldInput
                  name="displayOrder"
                  type="number"
                  label="Display order"
                  value={String(form.displayOrder ?? 0)}
                  onChange={(v) => setForm({ ...form, displayOrder: Number(v) || 0 })}
                />
                <FieldCheckbox
                  name="isActive"
                  label="Active"
                  checked={form.isActive !== false}
                  onChange={(v) => setForm({ ...form, isActive: v })}
                />
                <Row justify="between" gap="sm">
                  <Button
                    variant="danger"
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                  >
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
                        const parsed = storeCategoryFormSchema.safeParse(form);
                        if (!parsed.success) {
                          applyZodIssues(parsed.error.issues, setFieldError);
                          return;
                        }
                        setSaving(true);
                        const res = await updateStoreCategory(
                          API_ROUTES.STORE.STORE_CATEGORY_BY_ID(id),
                          parsed.data,
                        );
                        setSaving(false);
                        if (res.ok) {
                          showToast("Saved", "success");
                          router.push(String(ROUTES.STORE.STORE_CATEGORIES));
                        } else {
                          // The server's objection lands on a field, not in a
                          // toast that throws the reason away.
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
        title="Delete category?"
        message="This cannot be undone."
      />
    </Section>
  );
}
