"use client";

/**
 * Create a storefront category.
 *
 * ## What changed, in two passes
 *
 * Originally: five raw `<Input>`/`<Textarea>` controls, no `<Form>` wrapper
 * and no validation of any kind — an entirely empty category saved, and the
 * only feedback on failure was a generic "Save failed" toast that discarded
 * whatever the server objected to. That pass gave it `storeCategoryFormSchema`,
 * shared with `POST /api/store/categories`.
 *
 * This pass makes it the worked example for the W15 sectionising recipe:
 * the fields are no longer written out at all. `buildSectionsFromSchema` reads
 * the schema's own `section`/`row`/`order` annotations and produces them, so
 * adding a field to the schema puts it on this page — in the right section, in
 * the right row — with no second edit. ~50 lines of JSX became one `useMemo`.
 *
 * It also picks up the pinned mobile action bar for free, which is the real
 * argument for `<SectionForm>` on a short form: on a phone the Save button is
 * otherwise below the fold.
 *
 * ## `slug` is derived, not asked for
 *
 * Filled from the label before parsing, so a blank one is completed rather
 * than reported as an error — the server requires it and the form does not ask.
 * That is `derive()`'s job in the `EntityFormDefinition` model; done inline
 * here because this page has exactly one derived field.
 */

import {
  Container,
  Stack,
  Heading,
  Section,
  FormShellContext,
  FormErrorSummary,
  SectionForm,
  buildSectionsFromSchema,
  useSectionFormNav,
  useFormShellState,
  applyZodIssues,
  ROUTES,
  useToast,
  ACTIONS,
  storeCategoryFormSchema,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { createStoreCategory } from "@/lib/api/store-client";
import {useMemo, useState, Suspense } from "react";



function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type Values = {
  label: string;
  slug: string;
  description: string;
  coverImageUrl: string;
  displayOrder: number;
};

function PageInner() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState<Values>({
    label: "",
    slug: "",
    description: "",
    coverImageUrl: "",
    displayOrder: 0,
  });
  const [saving, setSaving] = useState(false);

  const update = (partial: Partial<Values>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const sections = useMemo(
    () => buildSectionsFromSchema<Values>(storeCategoryFormSchema),
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
    const values = { ...form, slug: form.slug || slugify(form.label) };
    const parsed = storeCategoryFormSchema.safeParse(values);
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues, setFieldError);
      return;
    }

    setSaving(true);
    // `parsed.data`, not `values` — the parsed object is what carries the
    // schema's coercions and drops anything it does not declare. Sending the
    // raw draft was a slip that happened to be harmless only because the two
    // shapes currently agree.
    const res = await createStoreCategory(API_ROUTES.STORE.STORE_CATEGORIES, parsed.data);
    setSaving(false);

    if (res.ok) {
      showToast("Saved", "success");
      router.push(String(ROUTES.STORE.STORE_CATEGORIES));
      return;
    }
    // `createStoreCategory` returns a raw Response, so the server's message
    // has to be read out of the body. This used to be an unconditional
    // "Save failed" toast that discarded whatever the route objected to.
    const detail = await res
      .json()
      .then((j: { error?: string; message?: string }) => j?.error ?? j?.message)
      .catch(() => undefined);
    setFieldError("label", detail ?? "Save failed");
  };

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>New Storefront Category</Heading>

          <FormShellContext.Provider value={shellCtx}>
            <FormErrorSummary />
            <SectionForm<Values>
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
            />
          </FormShellContext.Provider>
        </Stack>
      </Container>
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
