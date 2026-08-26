"use client";

import {
  Container,
  Stack,
  Heading,
  Text,
  Section,
  FieldTextarea,
  FormShellContext,
  FormErrorSummary,
  SectionForm,
  buildSectionsFromSchema,
  useSectionFormNav,
  useFormShellState,
  applyZodIssues,
  reportCreateSchema,
  useToast,
  type ReportCreateValues,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { submitReport } from "@/lib/api/report-client";
import { useMemo, useState } from "react";

/**
 * The public "report a problem" form.
 *
 * ## What it validated before: two `.trim()` checks and a toast
 *
 * `reportCreateSchema` has existed the whole time and was wired into
 * `POST /api/reports` — but nothing on the client used it. So the real rules
 * were invisible until the server rejected them:
 *
 *   · `detail` needs 10 characters, not just non-empty
 *   · every evidence line must be a URL
 *   · `reason` and `entityType` are closed enums
 *
 * A user pasting a non-URL into evidence got a 400 and a "Submit failed"
 * toast that named no field. On a form anyone can reach, and whose own copy
 * warns that frivolous reports may affect their account, that is the wrong
 * place to be terse.
 *
 * ## Sections are derived
 *
 * The schema is already annotated with `section`/`row`/`order`, so
 * `buildSectionsFromSchema` produces the layout — adding a field to the schema
 * puts it on this page with no second edit. Only `evidenceUrls` is overridden,
 * because a `string[]` is collected here as one-per-line text.
 */

interface Props {
  initialEntityType: string;
  initialEntityId: string;
}

/** `\n`-separated text → the `string[]` the schema wants. */
function linesToUrls(raw: string): string[] {
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ReportFormClient({ initialEntityType, initialEntityId }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  /*
   * Kept as raw text rather than derived from `values.evidenceUrls` on every
   * keystroke: round-tripping through split/join would delete the blank line
   * the user is in the middle of typing.
   */
  const [evidenceText, setEvidenceText] = useState("");

  const [values, setValues] = useState<ReportCreateValues>({
    entityType: (initialEntityType || "product") as ReportCreateValues["entityType"],
    entityId: initialEntityId,
    reason: "scam",
    detail: "",
    evidenceUrls: [],
  });

  const update = (partial: Partial<ReportCreateValues>) =>
    setValues((prev) => ({ ...prev, ...partial }));

  const sections = useMemo(
    () =>
      buildSectionsFromSchema<ReportCreateValues>(reportCreateSchema, {
        renderers: {
          evidenceUrls: () => (
            <FieldTextarea
              name="evidenceUrls"
              label="Evidence URLs (one per line)"
              rows={3}
              placeholder="https://…"
              value={evidenceText}
              onChange={(v) => {
                setEvidenceText(v);
                update({ evidenceUrls: linesToUrls(v) });
              }}
            />
          ),
        },
      }),
    [evidenceText],
  );

  const { openIds, setOpenIds, goToSection, fieldToSectionIndex, sectionMeta } =
    useSectionFormNav(sections, values);

  const { shellCtx, setFieldError, validate } = useFormShellState(reportCreateSchema, {
    sections: sectionMeta,
    onGoToSection: goToSection,
    fieldToSectionIndex,
  });

  const onSubmit = async () => {
    const parsed = reportCreateSchema.safeParse(values);
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues, setFieldError);
      return;
    }

    setSaving(true);
    const res = await submitReport(parsed.data);
    setSaving(false);

    if (res.ok) {
      showToast("Report submitted — thank you", "success");
      router.back();
      return;
    }

    /*
     * `submitReport` returns the raw Response, so the reason has to be read
     * out of the body. Worth the two lines: the previous "Submit failed"
     * named nothing, and the server is the only thing that knows why a
     * well-formed report was refused (rate limit, banned reporter, missing
     * entity).
     */
    const body = (await res.json().catch(() => null)) as
      | { error?: string; message?: string }
      | null;
    showToast(
      body?.error ?? body?.message ?? "We could not submit that report.",
      "error",
    );
  };

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Report a problem</Heading>
          <Text color="muted">
            Reports go to the LetItRip trust &amp; safety team. Frivolous reports may
            impact your account.
          </Text>

          <FormShellContext.Provider value={shellCtx}>
            <FormErrorSummary />
            <SectionForm<ReportCreateValues>
              sections={sections}
              values={values}
              onChange={update}
              onSubmit={onSubmit}
              onValidationChange={() => validate(values)}
              schema={reportCreateSchema}
              openIds={openIds}
              onOpenChange={setOpenIds}
              submitLabel="Submit report"
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
