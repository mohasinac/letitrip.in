"use client";

/**
 * Create a sub-listing category.
 *
 * Follows the recipe worked out on `store/categories/new` — the fields are not
 * written out at all. `buildSectionsFromSchema` reads the section / row / order
 * annotations off `sublistingCategoryFormSchema` and produces them, so adding a
 * field to the schema puts it on this page, in the right section, with no
 * second edit.
 *
 * ## What this replaced
 *
 * Three raw `<Label>` + `<Input>` pairs, each carrying an inline copy of the
 * same ~200-character Tailwind class string, and a submit gated only on
 * `!name.trim()` — so `itemCode` and `description` had no bounds on the client
 * at all, and the schema was passed to `<Form>` without anything ever executing
 * it. `<SectionForm>` parses on every change, so the schema is now load-bearing.
 *
 * It also picks up the pinned mobile action bar, which is the real argument for
 * putting a short form through `<SectionForm>`: on a phone the Create button was
 * otherwise below the fold.
 */

import {
  Div,
  Heading,
  Text,
  ROUTES,
  FormShellContext,
  FormErrorSummary,
  SectionForm,
  buildSectionsFromSchema,
  useSectionFormNav,
  useFormShellState,
  applyZodIssues,
  useApiMutation,
  apiClient,
  normalizeError,
  sublistingCategoryFormSchema,
  useToast,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { useMemo, useState } from "react";

interface Values {
  [key: string]: string;
  name: string;
  itemCode: string;
  description: string;
}

const EMPTY: Values = { name: "", itemCode: "", description: "" };

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState<Values>(EMPTY);

  const sections = useMemo(
    () => buildSectionsFromSchema<Values>(sublistingCategoryFormSchema),
    [],
  );

  const nav = useSectionFormNav(sections, form);
  const { shellCtx, setFieldError } = useFormShellState(sublistingCategoryFormSchema, {
    sections: nav.sectionMeta,
    onGoToSection: nav.goToSection,
    fieldToSectionIndex: nav.fieldToSectionIndex,
  });

  const createMutation = useApiMutation({
    // Authored copy, on the mutation rather than in an onError toast: the
    // mutation already owns the failure surface, so toasting here too shows the
    // same failure twice.
    errorMessage: "Failed to create category.",
    mutationFn: (payload: Record<string, string | undefined>) =>
      apiClient.post(API_ROUTES.STORE.SUBLISTING_CATEGORIES, payload),
    onSuccess: () => {
      showToast("Category created.", "success");
      router.push(String(ROUTES.STORE.SUBLISTING_CATEGORIES));
    },
  });

  const onSubmit = () => {
    const parsed = sublistingCategoryFormSchema.safeParse(form);
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues, setFieldError);
      return;
    }
    createMutation.mutate({
      name: parsed.data.name,
      itemCode: parsed.data.itemCode || undefined,
      description: parsed.data.description || undefined,
    });
  };

  return (
    <Div className="mx-auto max-w-2xl">
      <Div className="mb-6">
        <Heading level={1} size="2xl" weight="bold" color="primary">
          New Sub-listing Category
        </Heading>
        <Text className="mt-1" color="muted" size="sm">
          Group listings of the same real-world collectible across grades, conditions, or prices.
          Example: &ldquo;Base Set Charizard 108/120&rdquo; groups PSA 10, PSA 9, raw copies, etc.
        </Text>
      </Div>

      <FormShellContext.Provider value={shellCtx}>
        <FormErrorSummary />
        <SectionForm<Values>
          sections={sections}
          values={form}
          onChange={(partial) => setForm((prev) => Object.assign({}, prev, partial))}
          onSubmit={onSubmit}
          schema={sublistingCategoryFormSchema}
          openIds={nav.openIds}
          onOpenChange={nav.setOpenIds}
          isLoading={createMutation.isPending}
          submitLabel="Create category"
          onCancel={() => router.back()}
          cancelLabel="Cancel"
        />
      </FormShellContext.Provider>
    </Div>
  );
}
