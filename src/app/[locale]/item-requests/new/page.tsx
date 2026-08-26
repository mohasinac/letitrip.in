"use client";

import {
  Container,
  Stack,
  Heading,
  Text,
  Section,
  ROUTES,
  FormShellContext,
  FormErrorSummary,
  SectionForm,
  buildSectionsFromSchema,
  useSectionFormNav,
  useFormShellState,
  applyZodIssues,
  itemRequestCreateSchema,
  useToast,
  type ItemRequestCreateValues,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { createItemRequest } from "@/lib/api/items-client";
import { useMemo, useState } from "react";

/**
 * Post an item request — a public, any-signed-in-user write path.
 *
 * `itemRequestCreateSchema` was wired into `POST /api/item-requests` and had
 * no client consumer, so its rules only appeared as a 400: title needs 3
 * characters, description 10, and `maxBudget` is bounded at ₹10,000,000
 * because a typo there records a figure that reads as real money to every
 * seller browsing the request.
 *
 * The old form checked title and description were non-empty and, on any
 * rejection, said "Submit failed" without naming a field.
 *
 * Sections come from the schema's annotations. No field needs an override
 * here — `maxBudget` is a plain coerced number, and the schema's own
 * `z.coerce` is what turns the input's string into one, replacing a
 * hand-rolled `Number(e.target.value) || 0` that silently mapped every
 * unparseable entry to zero.
 */
export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [values, setValues] = useState<ItemRequestCreateValues>({
    title: "",
    description: "",
    category: "",
    brand: "",
    maxBudget: undefined,
  });

  const update = (partial: Partial<ItemRequestCreateValues>) =>
    setValues((prev) => ({ ...prev, ...partial }));

  const sections = useMemo(
    () => buildSectionsFromSchema<ItemRequestCreateValues>(itemRequestCreateSchema),
    [],
  );

  const { openIds, setOpenIds, goToSection, fieldToSectionIndex, sectionMeta } =
    useSectionFormNav(sections, values);

  const { shellCtx, setFieldError, validate } = useFormShellState(itemRequestCreateSchema, {
    sections: sectionMeta,
    onGoToSection: goToSection,
    fieldToSectionIndex,
  });

  const onSubmit = async () => {
    const parsed = itemRequestCreateSchema.safeParse(values);
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues, setFieldError);
      return;
    }

    setSaving(true);
    const res = await createItemRequest(parsed.data);
    setSaving(false);

    if (res.ok) {
      showToast("Request submitted for approval", "success");
      router.push(String(ROUTES.PUBLIC.ITEM_REQUESTS));
      return;
    }

    // The helper returns the raw Response, so the reason lives in the body.
    const body = (await res.json().catch(() => null)) as
      | { error?: string; message?: string }
      | null;
    showToast(body?.error ?? body?.message ?? "We could not post that request.", "error");
  };

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Post an Item Request</Heading>
          <Text color="muted">
            Tell sellers what you&apos;re hunting. Requests are approved before going
            live.
          </Text>

          <FormShellContext.Provider value={shellCtx}>
            <FormErrorSummary />
            <SectionForm<ItemRequestCreateValues>
              sections={sections}
              values={values}
              onChange={update}
              onSubmit={onSubmit}
              onValidationChange={() => validate(values)}
              schema={itemRequestCreateSchema}
              openIds={openIds}
              onOpenChange={setOpenIds}
              submitLabel="Submit for review"
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
