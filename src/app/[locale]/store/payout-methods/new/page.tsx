"use client";

/**
 * Add a payout method.
 *
 * The fields are not written out here. `buildSectionsFromSchema` reads
 * `payoutMethodFormSchema`'s annotations and produces them — including the
 * type-dependent branching, which used to live in this file as two JSX
 * conditionals (`form.type === "upi"`, `form.type === "bank"`) and now lives on
 * the schema as `when` predicates beside the `superRefine` that makes those same
 * fields conditionally required. One place decides whether a field applies,
 * instead of a renderer and a validator agreeing by hand.
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
  normalizeError,
  payoutMethodFormSchema,
  ROUTES,
  useToast,
  ACTIONS,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { createPayoutMethod } from "@/lib/api/store-client";
import { useMemo, useState } from "react";

interface Values {
  [key: string]: string | boolean;
  type: string;
  label: string;
  upiVpa: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
  isDefault: boolean;
  isActive: boolean;
}

const EMPTY: Values = {
  type: "upi",
  label: "",
  upiVpa: "",
  accountNumber: "",
  ifscCode: "",
  accountHolderName: "",
  bankName: "",
  isDefault: false,
  isActive: true,
};

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState<Values>(EMPTY);
  const [saving, setSaving] = useState(false);

  const sections = useMemo(
    () => buildSectionsFromSchema<Values>(payoutMethodFormSchema),
    [],
  );

  const nav = useSectionFormNav(sections, form);
  const { shellCtx, setFieldError, clearErrors } = useFormShellState(payoutMethodFormSchema, {
    sections: nav.sectionMeta,
    onGoToSection: nav.goToSection,
    fieldToSectionIndex: nav.fieldToSectionIndex,
  });

  const onSubmit = async () => {
    clearErrors();
    // Nothing checked this before the schema landed — a bank method with a
    // blank account number, IFSC and holder name saved cleanly and only failed
    // at payout time.
    const parsed = payoutMethodFormSchema.safeParse(form);
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues, setFieldError);
      return;
    }

    setSaving(true);
    try {
      const res = await createPayoutMethod(
        API_ROUTES.STORE.PAYOUT_METHODS,
        form as Record<string, unknown>,
      );
      if (!res.ok) {
        // Surface what the route objected to on a field rather than a generic
        // toast that discards the server's message.
        const detail = await res
          .json()
          .then((j: { error?: string; message?: string }) => j?.error ?? j?.message)
          .catch(() => undefined);
        setFieldError("label", detail ?? "Save failed");
        return;
      }
      showToast("Payout method saved", "success");
      router.push(String(ROUTES.STORE.PAYOUT_METHODS));
    } catch (err) {
      void normalizeError(err);
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>New Payout Method</Heading>
          <FormShellContext.Provider value={shellCtx}>
            <FormErrorSummary />
            <SectionForm<Values>
              sections={sections}
              values={form}
              onChange={(partial) => setForm((prev) => Object.assign({}, prev, partial))}
              onSubmit={onSubmit}
              schema={payoutMethodFormSchema}
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
