"use client";

/**
 * Edit a sub-listing category. The `new` sibling's twin — same schema, same
 * generated sections, PUT instead of POST.
 *
 * See that file's header for what this replaced and why the schema had to
 * become load-bearing rather than decorative.
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
import { useParams } from "next/navigation";
import { API_ROUTES } from "@/constants";
import { useEffect, useMemo, useState } from "react";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender, and any client tree
 * reaching useSearchParams() throws during prerender without a boundary
 * (Root Cause #17). Kept from the concurrent build-fix work; the rest of that
 * file's version was dropped because it predated the SectionForm migration.
 */
export const dynamic = "force-dynamic";


interface Values {
  [key: string]: string;
  name: string;
  itemCode: string;
  description: string;
}

const EMPTY: Values = { name: "", itemCode: "", description: "" };

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? "");
  const { showToast } = useToast();

  const [form, setForm] = useState<Values>(EMPTY);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!id) return;
    apiClient
      .get(API_ROUTES.STORE.SUBLISTING_CATEGORY_BY_ID(id))
      .then((res) => {
        const cat = (res as any)?.data?.category ?? (res as any)?.data;
        if (!cat) {
          setLoadError("Category not found");
          return;
        }
        setForm({
          name: String(cat.name ?? ""),
          itemCode: String(cat.itemCode ?? ""),
          description: String(cat.description ?? ""),
        });
      })
      .catch((err) => {
        void normalizeError(err);
        setLoadError("Failed to load category");
      });
  }, [id]);

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

  const saveMutation = useApiMutation({
    // See the `new` sibling: the mutation owns the failure surface, so an
    // onError toast here would show the same failure twice.
    errorMessage: "Failed to save changes.",
    mutationFn: (payload: Record<string, string | undefined>) =>
      apiClient.put(API_ROUTES.STORE.SUBLISTING_CATEGORY_BY_ID(id), payload),
    onSuccess: () => {
      showToast("Changes saved.", "success");
      router.push(String(ROUTES.STORE.SUBLISTING_CATEGORIES));
    },
  });

  const onSubmit = () => {
    const parsed = sublistingCategoryFormSchema.safeParse(form);
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues, setFieldError);
      return;
    }
    saveMutation.mutate({
      name: parsed.data.name,
      itemCode: parsed.data.itemCode || undefined,
      description: parsed.data.description || undefined,
    });
  };

  if (loadError) {
    return (
      <Div className="mx-auto max-w-2xl">
        <Text className="text-error" size="sm">{loadError}</Text>
      </Div>
    );
  }

  return (
    <Div className="mx-auto max-w-2xl">
      <Div className="mb-6">
        <Heading level={1} size="2xl" weight="bold" color="primary">
          Edit Sub-listing Category
        </Heading>
        <Text className="mt-1" color="muted" size="sm">
          Group listings of the same real-world collectible across grades, conditions, or prices.
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
          isLoading={saveMutation.isPending}
          submitLabel="Save changes"
          onCancel={() => router.back()}
          cancelLabel="Cancel"
        />
      </FormShellContext.Provider>
    </Div>
  );
}
