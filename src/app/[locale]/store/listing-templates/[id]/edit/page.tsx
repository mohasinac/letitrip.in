"use client";

/**
 * Edit a listing template.
 *
 * ## What changed
 *
 * `listingTemplateUpdateSchema` already existed and already validated the
 * route; this page used raw controls and ignored it. Then the fields were
 * hand-written against it; now `buildSectionsFromSchema` produces them from the
 * schema's annotations, as on the `new` sibling.
 *
 * It also PATCHed `{ ...form, defaults }` — the entire loaded document,
 * including `id`, `storeId`, `createdAt`, `updatedAt` and `usageCount`. The
 * update schema was `.partial()` but not `.strict()`, so those extra keys were
 * silently stripped rather than rejected; the payload is now narrowed to the
 * editable fields and the schema tightened to `.strict()`, in that order, so a
 * stray key becomes a 400 instead of a silent no-op.
 *
 * `listingType` is deliberately not editable — changing a template's type after
 * creation would invalidate every default stored against it. The update schema
 * omits it, so the generated form cannot offer it; that used to rely on this
 * page simply not rendering a control.
 *
 * See the `new` sibling for why the `defaults` JSON text buffer is local state
 * rather than part of the draft.
 */

import {
  Container,
  Stack,
  Heading,
  Section,
  Skeleton,
  FieldTextarea,
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
  normalizeError,
  type JsonValue,
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
import { useEffect, useMemo, useState } from "react";

type Values = {
  [key: string]: unknown;
  name: string;
  description: string;
  defaults: Record<string, JsonValue>;
  isShared: boolean;
  isActive: boolean;
};

const EMPTY: Values = {
  name: "",
  description: "",
  defaults: {},
  isShared: false,
  isActive: true,
};

/** See the `new` sibling — `null` means "not valid JSON right now". */
function parseDefaults(text: string): Record<string, JsonValue> | null {
  try {
    return JSON.parse(text || "{}") as Record<string, JsonValue>;
  } catch (err) {
    void normalizeError(err);
    return null;
  }
}

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [form, setForm] = useState<Values>(EMPTY);
  const [defaultsJson, setDefaultsJson] = useState("{}");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    getListingTemplate(API_ROUTES.STORE.LISTING_TEMPLATE_BY_ID(id))
      .then((r) => r.json())
      .then((j) => {
        const doc = (j?.data ?? {}) as Record<string, JsonValue>;
        setForm({
          name: String(doc.name ?? ""),
          description: String(doc.description ?? ""),
          defaults: (doc.defaults ?? {}) as Record<string, JsonValue>,
          isShared: Boolean(doc.isShared),
          isActive: doc.isActive !== false,
        });
        setDefaultsJson(JSON.stringify(doc.defaults ?? {}, null, 2));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const sections = useMemo(
    () =>
      buildSectionsFromSchema<Values>(listingTemplateUpdateSchema, {
        renderers: {
          defaults: ({ onChange, errors }) => (
            <FieldTextarea
              name="defaults"
              label="Defaults (JSON)"
              rows={8}
              value={defaultsJson}
              error={errors.defaults}
              onChange={(v) => {
                setDefaultsJson(v);
                const next = parseDefaults(v);
                if (next) onChange({ defaults: next });
              }}
            />
          ),
        },
      }),
    [defaultsJson],
  );

  const nav = useSectionFormNav(sections, form);
  const { shellCtx, setFieldError, clearErrors } = useFormShellState(listingTemplateUpdateSchema, {
    sections: nav.sectionMeta,
    onGoToSection: nav.goToSection,
    fieldToSectionIndex: nav.fieldToSectionIndex,
  });

  const onDelete = async () => {
    await deleteListingTemplate(API_ROUTES.STORE.LISTING_TEMPLATE_BY_ID(id));
    router.push(String(ROUTES.STORE.LISTING_TEMPLATES));
  };

  const onSubmit = async () => {
    clearErrors();

    const defaults = parseDefaults(defaultsJson);
    if (!defaults) {
      setFieldError("defaults", "Defaults must be valid JSON.");
      return;
    }

    const parsed = listingTemplateUpdateSchema.safeParse({ ...form, defaults });
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
      return;
    }
    const detail = await res
      .json()
      .then((j: { error?: string; message?: string }) => j?.error ?? j?.message)
      .catch(() => undefined);
    setFieldError("name", detail ?? "Save failed");
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
          <FormShellContext.Provider value={shellCtx}>
            <FormErrorSummary />
            <SectionForm<Values>
              sections={sections}
              values={form}
              onChange={(partial) => setForm((prev) => Object.assign({}, prev, partial))}
              onSubmit={onSubmit}
              schema={listingTemplateUpdateSchema}
              openIds={nav.openIds}
              onOpenChange={nav.setOpenIds}
              isLoading={saving}
              submitLabel={ACTIONS.STORE["save-changes"].label}
              onCancel={() => router.back()}
              cancelLabel="Cancel"
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
        title="Delete template?"
        message="This cannot be undone."
      />
    </Section>
  );
}
