"use client";

/**
 * Edit a shipping rule.
 *
 * ## What changed
 *
 * `shippingConfigFormSchema` already existed and already validated the route;
 * this page used raw controls and ignored it. That mattered more here than on
 * most pages: the schema's `superRefine` enforces "a rate rule must have a
 * rate" per method, so a flat-rate rule with no flat rate was previously
 * rejected only by the server, as an opaque toast.
 *
 * The method dropdown also carried its own inline copy of the six options;
 * both it and the schema's enum now derive from one label map.
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
  shippingConfigFormSchema,
  SHIPPING_METHOD_OPTIONS,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { API_ROUTES } from "@/constants";
import {
  getShippingConfig,
  updateShippingConfig,
  deleteShippingConfig,
} from "@/lib/api/store-client";
import { useEffect, useMemo, useState } from "react";

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [form, setForm] = useState({
    label: "",
    method: "flat",
    flatRate: 0,
    estimatedDays: 0,
    isDefault: false,
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    getShippingConfig(API_ROUTES.STORE.SHIPPING_CONFIG_BY_ID(id))
      .then((r) => r.json())
      .then((j) => {
        const d = (j?.data ?? {}) as Record<string, unknown>;
        setForm({
          label: String(d.label ?? ""),
          method: String(d.method ?? "flat"),
          flatRate: Number(d.flatRate ?? 0),
          estimatedDays: Number(d.estimatedDays ?? 0),
          isDefault: Boolean(d.isDefault),
          isActive: d.isActive !== false,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const onDelete = async () => {
    await deleteShippingConfig(API_ROUTES.STORE.SHIPPING_CONFIG_BY_ID(id));
    router.push(String(ROUTES.STORE.SHIPPING_CONFIGS));
  };

  const update = (partial: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const sections = useMemo(
    () =>
      buildSectionsFromSchema<typeof form>(shippingConfigFormSchema, {
        /*
         * Keep the curated labels. Derived options run each enum value
         * through `humaniseFieldName`, which turns "weight" into "Weight" —
         * accurate and worse than "By weight". The `options` override exists
         * for exactly this, and passing it keeps SHIPPING_METHOD_OPTIONS as
         * the one place those labels live.
         */
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
    const res = await updateShippingConfig(
      API_ROUTES.STORE.SHIPPING_CONFIG_BY_ID(id),
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

  if (loading) {
    return (
      <Section>
        <Container size="md">
          <Stack gap="md" padding="y-lg">
            <Skeleton variant="rectangular" height="32px" />
            <Skeleton variant="rectangular" height="56px" />
            <Skeleton variant="rectangular" height="56px" />
          </Stack>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Edit Shipping Configuration</Heading>
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
        title="Delete shipping config?"
        message="This cannot be undone."
      />
    </Section>
  );
}
