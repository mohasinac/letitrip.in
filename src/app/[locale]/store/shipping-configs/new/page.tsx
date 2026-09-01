"use client";

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
  shippingConfigFormSchema,
  SHIPPING_METHOD_OPTIONS,
  ROUTES,
  useToast,
  ACTIONS,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { createShippingConfig } from "@/lib/api/store-client";
import {useMemo, useState, Suspense } from "react";



/**
 * Create a shipping configuration.
 *
 * ## It validated NOTHING — not even a non-empty label
 *
 * Its `[id]/edit` sibling has used `shippingConfigFormSchema` for a while;
 * this page never did, and had no `.trim()` check either. An empty-label
 * config saved cleanly and then appeared as a blank row in the seller's
 * shipping list and at checkout. The create/edit asymmetry Root Cause #39
 * describes, on the validation axis.
 *
 * ## Two controls were in the state and rendered nowhere
 *
 * `isDefault` and `isActive` were held in form state and POSTed, with no UI
 * for either — so a seller could never create a config as the default, or
 * create one inactive to set up before switching it on. Both were frozen at
 * `false`/`true` forever. Same shape as Root Cause #52: the data was already
 * flowing, nothing rendered it.
 *
 * ## The per-method fields are still conditional — from the SCHEMA now
 *
 * This page hand-wrote three `{form.method === "x" && …}` blocks, which is
 * exactly why it could not be derived. `FieldUiMeta.when` moved that decision
 * onto the schema, beside the `superRefine` that requires the same field under
 * the same condition, so the two cannot drift apart. The edit page picks the
 * same behaviour up for free — it used to show a flat-rate box for every
 * method, including pickup.
 */
function PageInner() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    label: "",
    method: "flat",
    flatRate: 0,
    pricePerKg: 0,
    freeAbove: 0,
    estimatedDays: 5,
    isDefault: false,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const update = (partial: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  /*
   * The per-method rate fields are conditional, and that used to be the
   * reason this page could not be derived — it hand-wrote three
   * `{form.method === "x" && …}` blocks. `FieldUiMeta.when` moved that onto
   * the schema, next to the `superRefine` that requires the same field under
   * the same condition, so the two cannot drift.
   */
  const sections = useMemo(
    () =>
      buildSectionsFromSchema<typeof form>(shippingConfigFormSchema, {
        options: { method: [...SHIPPING_METHOD_OPTIONS] },
      }),
    [],
  );

  const { openIds, setOpenIds, goToSection, fieldToSectionIndex, sectionMeta } =
    useSectionFormNav(sections, form);

  const { shellCtx, setFieldError, validate } = useFormShellState(shippingConfigFormSchema, {
    sections: sectionMeta,
    onGoToSection: goToSection,
    fieldToSectionIndex,
  });

  const onSubmit = async () => {
    const parsed = shippingConfigFormSchema.safeParse(form);
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues, setFieldError);
      return;
    }
    setSaving(true);
    const res = await createShippingConfig(
      API_ROUTES.STORE.SHIPPING_CONFIGS,
      parsed.data,
    );
    setSaving(false);
    if (res.ok) {
      showToast("Saved", "success");
      router.push(String(ROUTES.STORE.SHIPPING_CONFIGS));
      return;
    }
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
          <Heading level={1}>New Shipping Configuration</Heading>

          <FormShellContext.Provider value={shellCtx}>
            <FormErrorSummary />
            <SectionForm<typeof form>
              sections={sections}
              values={form}
              onChange={update}
              onSubmit={onSubmit}
              onValidationChange={() => validate(form)}
              schema={shippingConfigFormSchema}
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
 * throws during prerender without a boundary (Root Cause #17). The dashboard
 * layout wraps {children} in Suspense too, and empirically that is not enough
 * for a client PAGE component.
 */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
