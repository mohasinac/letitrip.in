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
  Section,
  Skeleton,
  FormShellContext,
  FormErrorSummary,
  SectionForm,
  buildSectionsFromSchema,
  useSectionFormNav,
  useFormShellState,
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
import {useEffect, useMemo, useState, Suspense } from "react";



type FormState = Partial<StoreCategoryFormValues>;

function PageInner() {
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

  const update = (partial: FormState) => setForm((prev) => ({ ...prev, ...partial }));

  const sections = useMemo(
    () => buildSectionsFromSchema<FormState>(storeCategoryFormSchema),
    [],
  );

  const { openIds, setOpenIds, goToSection, fieldToSectionIndex, sectionMeta } =
    useSectionFormNav(sections, form);

  const { shellCtx, setFieldError, validate } = useFormShellState(storeCategoryFormSchema, {
    sections: sectionMeta,
    onGoToSection: goToSection,
    fieldToSectionIndex,
  });

  const onSubmit = async () => {
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
      return;
    }
    // The server's objection lands on a field, not in a toast that throws the
    // reason away.
    const detail = await res
      .json()
      .then((j: { error?: string; message?: string }) => j?.error ?? j?.message)
      .catch(() => undefined);
    setFieldError("label", detail ?? "Save failed");
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
          <FormShellContext.Provider value={shellCtx}>
            <FormErrorSummary />
            <SectionForm<FormState>
              sections={sections}
              values={form}
              onChange={update}
              onSubmit={onSubmit}
              onValidationChange={() => validate(form)}
              schema={storeCategoryFormSchema}
              openIds={openIds}
              onOpenChange={setOpenIds}
              submitLabel={ACTIONS.STORE["save-changes"].label}
              cancelLabel="Cancel"
              onCancel={() => router.back()}
              isLoading={saving}
              /*
               * The slot added for exactly this. Delete used to be hand-rolled
               * in a footer row, which is why SectionForm could not be used
               * here at all: the alternative was `hideActions`, and that also
               * silences the pinned mobile bar.
               */
              destructiveAction={{
                label: ACTIONS.STORE["delete-listing"].label,
                onClick: () => setConfirmDelete(true),
              }}
            />
          </FormShellContext.Provider>
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

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). This boundary
 * is the fix. (This comment used to add that the dashboard layout's own
 * <Suspense> was "empirically not enough" — that was wrong; the layout's
 * boundary was being defeated by a swallowed prerender bailout, not ignored.
 * See Root Cause #89. A segment config is never the answer here, and
 * `audit-no-force-dynamic` blocks it.)
 */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
