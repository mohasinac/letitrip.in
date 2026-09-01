"use client";

/**
 * Create a listing template.
 *
 * ## What changed
 *
 * `listingTemplateFormSchema` already existed and already validated the route;
 * this page ignored it and used raw controls, so a rejected save produced a
 * generic "Save failed" toast with the reason discarded. Then the fields were
 * hand-written against it. Now `buildSectionsFromSchema` produces them from the
 * schema's own annotations — the listing-type dropdown included, which is what
 * originally went wrong here: it was a hand-written list of EIGHT types against
 * a union of TEN, so `art` and `stickers` were unofferable. A derived control
 * cannot drift from its union at all.
 *
 * ## `defaults` needs a renderer, and why the text buffer is local
 *
 * The schema's `defaults` is a `z.record` — `kind: "list"`, which the generator
 * deliberately renders as a disabled placeholder rather than guessing at a list
 * editor. Here it is authored as JSON in a textarea, so it takes one
 * `renderers` entry.
 *
 * The raw text lives in its own state rather than in the draft: the draft is
 * the SCHEMA's shape, where `defaults` is a parsed object, and a half-typed
 * `{"a":` is not one. Keeping the text separate lets the user type freely while
 * the draft holds the last value that actually parsed, and makes malformed JSON
 * a submit-time field error instead of a validation failure on every keystroke.
 */

import {
  Container,
  Stack,
  Heading,
  Section,
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
  ACTIONS,
  normalizeError,
  type JsonValue,
  listingTemplateFormSchema,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { createListingTemplate } from "@/lib/api/store-client";
import { useMemo, useState } from "react";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender, and any client tree
 * reaching useSearchParams() throws during prerender without a boundary
 * (Root Cause #17). Kept from the concurrent build-fix work; the rest of that
 * file's version was dropped because it predated the SectionForm migration.
 */
export const dynamic = "force-dynamic";


type Values = {
  [key: string]: unknown;
  name: string;
  description: string;
  listingType: string;
  defaults: Record<string, JsonValue>;
  isShared: boolean;
  isActive: boolean;
};

const EMPTY: Values = {
  name: "",
  description: "",
  listingType: "standard",
  defaults: {},
  isShared: false,
  isActive: true,
};

/**
 * `null` means "not valid JSON right now", which is the ordinary state while
 * someone is typing an object — not an error worth reporting until submit.
 *
 * Module scope rather than inline in the renderer: a `try` there sits seven
 * braces deep (renderer → onChange → try) and trips the nesting rule.
 */
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
  const [form, setForm] = useState<Values>(EMPTY);
  const [defaultsText, setDefaultsText] = useState("{}");
  const [saving, setSaving] = useState(false);

  /*
   * Named rather than inlined in the renderer: three statements nested inside
   * useMemo → renderers → the JSX onChange sits at the nesting threshold, and
   * the rule is right that it is hard to read there.
   */
  const applyDefaultsText = (v: string, onChange: (p: Partial<Values>) => void) => {
    setDefaultsText(v);
    // Keep the draft on the last value that parsed. A half-typed object is not
    // a record, and reporting that while the user is still typing is noise.
    const next = parseDefaults(v);
    if (next) onChange({ defaults: next });
  };

  const sections = useMemo(
    () =>
      buildSectionsFromSchema<Values>(listingTemplateFormSchema, {
        renderers: {
          defaults: ({ onChange, errors }) => (
            <FieldTextarea
              name="defaults"
              label="Defaults (JSON)"
              rows={6}
              hint="Applied to a new listing when this template is chosen."
              placeholder='{"condition":"mint","currency":"INR"}'
              value={defaultsText}
              error={errors.defaults}
              onChange={(v) => applyDefaultsText(v, onChange)}
            />
          ),
        },
      }),
    [defaultsText],
  );

  const nav = useSectionFormNav(sections, form);
  const { shellCtx, setFieldError, clearErrors } = useFormShellState(listingTemplateFormSchema, {
    sections: nav.sectionMeta,
    onGoToSection: nav.goToSection,
    fieldToSectionIndex: nav.fieldToSectionIndex,
  });

  const onSubmit = async () => {
    clearErrors();

    // Malformed JSON is reported on the `defaults` FIELD. It used to be a
    // toast, which vanishes and takes the user's place in the textarea with it.
    const defaults = parseDefaults(defaultsText);
    if (!defaults) {
      setFieldError("defaults", "Defaults must be valid JSON.");
      return;
    }

    const parsed = listingTemplateFormSchema.safeParse({ ...form, defaults });
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues, setFieldError);
      return;
    }

    setSaving(true);
    const res = await createListingTemplate(API_ROUTES.STORE.LISTING_TEMPLATES, parsed.data);
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

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>New Listing Template</Heading>
          <FormShellContext.Provider value={shellCtx}>
            <FormErrorSummary />
            <SectionForm<Values>
              sections={sections}
              values={form}
              onChange={(partial) => setForm((prev) => Object.assign({}, prev, partial))}
              onSubmit={onSubmit}
              schema={listingTemplateFormSchema}
              openIds={nav.openIds}
              onOpenChange={nav.setOpenIds}
              isLoading={saving}
              submitLabel={ACTIONS.STORE["save-changes"].label}
              onCancel={() => router.back()}
              cancelLabel="Cancel"
            />
          </FormShellContext.Provider>
        </Stack>
      </Container>
    </Section>
  );
}
