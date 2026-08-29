"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import {
  useSession, ROUTES, SCAM_TYPES, SCAM_PLATFORM_LABELS, Checkbox, Div, Button, Input,
  useApiMutation, apiClient, type FirestoreDocument,
} from "@mohasinac/appkit/client";
import { Alert, Stack, Heading, Text, Row, Main, Ul, Li } from "@mohasinac/appkit/client";
import {
  FormShellContext,
  FormErrorSummary,
  SectionForm,
  buildSectionsFromSchema,
  useSectionFormNav,
  useFormShellState,
  applyZodIssues,
  scamReportFormSchema,
} from "@mohasinac/appkit/client";
import { ChevronLeft, Loader2, Plus, X } from "lucide-react";
import { API_ROUTES } from "@/constants";

const LOGIN_HREF =
  `${String(ROUTES.AUTH.LOGIN)}?redirect=${encodeURIComponent("/scams/report")}` as const;

const CLS_INPUT = "w-full rounded-lg border border-[color:var(--appkit-color-border,theme(colors.zinc.200))] bg-transparent px-[var(--appkit-space-3)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] outline-none focus:ring-2 focus:ring-[color:var(--appkit-color-primary,theme(colors.blue.500))]/40";

const PLATFORM_OPTIONS = Object.entries(SCAM_PLATFORM_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const SCAM_TYPE_OPTIONS = [
  { value: "", label: "Select scam type…" },
  ...SCAM_TYPES.map((t) => ({ value: t.id, label: t.label })),
];

const SCAM_PLATFORM_OPTIONS = [
  { value: "", label: "Select platform…" },
  ...PLATFORM_OPTIONS,
];

function TagInput({
  label,
  placeholder,
  values,
  onChange,
  helpText,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (v: string[]) => void;
  helpText?: string;
}) {
  const [input, setInput] = useState("");

  function add() {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInput("");
    }
  }

  return (
    <Stack gap="xs">
      <Text size="sm" weight="medium">{label}</Text>
      <Row gap="xs" wrap>
        {values.map((v) => (
          <Div layout="inline-flex" gap="1" align="center" textWeight="medium" textSize="xs"
            key={v}
            className="bg-[color:var(--appkit-color-surface-elevated,theme(colors.zinc.100))]" paddingY="y-2xs" paddingX="x-xs" rounded="full"
          >
            {v}
            <Button
              type="button"
              variant="ghost"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="text-[color:var(--appkit-color-text-muted,theme(colors.zinc.400))] hover:text-[color:var(--appkit-color-danger,theme(colors.red.600))]"
            >
              <X className="h-3 w-3" />
            </Button>
          </Div>
        ))}
      </Row>
      <Row gap="xs">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-[color:var(--appkit-color-border,theme(colors.zinc.200))] bg-transparent px-[var(--appkit-space-3)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] outline-none focus:ring-2 focus:ring-[color:var(--appkit-color-primary,theme(colors.blue.500))]/40"
        />
        <Button
          type="button"
          variant="outline"
          onClick={add}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </Row>
      {helpText && (
        <Text variant="secondary" size="xs">{helpText}</Text>
      )}
    </Stack>
  );
}

interface FormState {
  [key: string]: unknown;
  displayName: string;
  phones: string[];
  upiIds: string[];
  emails: string[];
  scamType: string;
  scamPlatform: string;
  amountLost: string;
  itemInvolved: string;
  description: string;
  reportedByAnon: boolean;
  agreed: boolean;
}

/** Shared by all three identifier lists. */
const TAG_HELP = "Press Enter or comma to add.";

const EMPTY_FORM: FormState = {
  displayName: "",
  phones: [],
  upiIds: [],
  emails: [],
  scamType: "",
  scamPlatform: "",
  amountLost: "",
  itemInvolved: "",
  description: "",
  reportedByAnon: false,
  agreed: false,
};

/** A checkbox whose label is two lines — a claim and its consequence. */
function DeclarationCheckbox({
  checked,
  onChange,
  title,
  detail,
  required,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  detail: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <Stack gap="none">
      <Checkbox
        required={required}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        label={
          <Stack gap="none">
            <Text size="sm" weight="medium">
              {title}
              {required ? <Text as="span" color="error"> *</Text> : null}
            </Text>
            <Text variant="secondary" size="xs">{detail}</Text>
          </Stack>
        }
      />
      {error && <Text size="xs" color="error" role="alert">{error}</Text>}
    </Stack>
  );
}

// ─── Main form ─────────────────────────────────────────────────────────────

function ScamReportForm({ userId }: { userId: string }) {
  void userId;

  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  /*
   * Three identifier lists share one renderer. `kind: "list"` is what the
   * generator renders as a disabled placeholder, so each needs an entry — and
   * the draft holds them as ARRAYS, matching the schema, which is what finally
   * lets the per-entry regex and the "at least one identifier" superRefine run.
   * They are joined to comma-separated strings only at the wire, because that
   * is the shape the route parses.
   */
  const tagRenderer =
    (label: string, placeholder: string, helpText: string) =>
    ({ field, values, onChange, errors }: {
      field: { name: string };
      values: FormState;
      onChange: (partial: Partial<FormState>) => void;
      errors: Record<string, string>;
    }) => (
      <Stack gap="none">
        <TagInput
          label={label}
          placeholder={placeholder}
          helpText={helpText}
          values={(values[field.name] as string[]) ?? []}
          onChange={(v) => onChange({ [field.name]: v } as Partial<FormState>)}
        />
        {errors[field.name] && (
          <Text size="xs" color="error" role="alert">{errors[field.name]}</Text>
        )}
      </Stack>
    );

  const sections = useMemo(
    () =>
      buildSectionsFromSchema<FormState>(scamReportFormSchema, {
        options: {
          scamType: SCAM_TYPE_OPTIONS,
          scamPlatform: SCAM_PLATFORM_OPTIONS,
        },
        renderers: {
          phones: tagRenderer("Phone numbers", "+91…", TAG_HELP),
          upiIds: tagRenderer("UPI IDs", "name@bank", TAG_HELP),
          emails: tagRenderer("Email addresses", "name@example.com", TAG_HELP),
          reportedByAnon: ({ values, onChange }) => (
            <DeclarationCheckbox
              checked={Boolean(values.reportedByAnon)}
              onChange={(v) => onChange({ reportedByAnon: v })}
              title="Keep my identity private"
              detail={'Your name will not appear on the public profile page — shown as "Anonymous reporter".'}
            />
          ),
          agreed: ({ values, onChange, errors }) => (
            <DeclarationCheckbox
              required
              checked={Boolean(values.agreed)}
              onChange={(v) => onChange({ agreed: v })}
              title="I confirm this report is truthful to the best of my knowledge."
              detail="False reports may result in account action. All submissions are reviewed before publication."
              error={errors.agreed}
            />
          ),
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const nav = useSectionFormNav(sections, form);
  const { shellCtx, setFieldError, clearErrors } = useFormShellState(scamReportFormSchema, {
    sections: nav.sectionMeta,
    onGoToSection: nav.goToSection,
    fieldToSectionIndex: nav.fieldToSectionIndex,
  });

  const reportMutation = useApiMutation({
    // Authored copy on the mutation. It used to be an onError handler writing a
    // banner, which is the same failure surfaced twice.
    errorMessage: "Could not submit the report. Please try again.",
    mutationFn: (payload: FirestoreDocument) =>
      apiClient.post(API_ROUTES.SCAMS.REPORTS, payload),
    onSuccess: () => {
      router.push(String(ROUTES.PUBLIC.SCAMS) as Parameters<typeof router.push>[0]);
    },
  });

  const isSubmitting = reportMutation.isPending;

  const onSubmit = () => {
    clearErrors();
    /*
     * The schema replaces three hand-rolled guards (agreed / scamType+platform
     * / description length). Two of them disagreed with the route — the client
     * allowed a 30-character description where the route demands 100, and made
     * the platform optional — so the reward for satisfying them was a 400.
     */
    const parsed = scamReportFormSchema.safeParse(form);
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues, setFieldError);
      return;
    }

    reportMutation.mutate({
      displayName: parsed.data.displayName,
      // Arrays in the draft, comma-separated on the wire: the route parses it
      // back with its own parseCommaSeparated.
      phones: (parsed.data.phones ?? []).join(","),
      upiIds: (parsed.data.upiIds ?? []).join(","),
      emails: (parsed.data.emails ?? []).join(","),
      scamType: parsed.data.scamType,
      scamPlatform: parsed.data.scamPlatform,
      amountLost: parsed.data.amountLost,
      itemInvolved: parsed.data.itemInvolved ?? "",
      description: parsed.data.description,
      reportedByAnon: Boolean(parsed.data.reportedByAnon),
      // The declaration is now RECORDED, not merely required client-side.
      agreed: parsed.data.agreed,
    } as FirestoreDocument);
  };

  return (
    <Div className="mx-auto max-w-2xl">
      <Link
        href={String(ROUTES.PUBLIC.SCAMS)}
        className="mb-6 inline-flex items-center gap-[var(--appkit-space-1-5)] text-[length:var(--appkit-text-sm)] text-[color:var(--appkit-color-text-muted,theme(colors.zinc.500))] hover:text-[color:var(--appkit-color-text,theme(colors.zinc.700))]"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Scam Registry
      </Link>

      <Stack gap="lg">
        <Stack gap="xs">
          <Heading level={1} weight="bold" size="2xl">
            Report a Scammer
          </Heading>
          <Text variant="secondary" size="sm">
            Your report will be reviewed by our moderation team before appearing publicly. All
            submissions are confidential — your identity is never shared without consent.
          </Text>
        </Stack>

        <Alert variant="warning" title="Before you submit">
          <Ul marker="disc" spacing="tight" indent="md" size="sm">
            <Li>Only report genuine scam incidents — false reports can be contested.</Li>
            <Li>Max 5 pending reports per user. Verified reports are not counted.</Li>
            <Li>Evidence (screenshots, receipts) significantly speeds up verification.</Li>
          </Ul>
        </Alert>

        <FormShellContext.Provider value={shellCtx}>
          <FormErrorSummary />
          <SectionForm<FormState>
            sections={sections}
            values={form}
            onChange={(partial) => setForm((prev) => Object.assign({}, prev, partial))}
            onSubmit={onSubmit}
            schema={scamReportFormSchema}
            openIds={nav.openIds}
            onOpenChange={nav.setOpenIds}
            isLoading={isSubmitting}
            submitLabel="Submit Report"
            onCancel={() => router.push(String(ROUTES.PUBLIC.SCAMS) as Parameters<typeof router.push>[0])}
            cancelLabel="Cancel"
          />
        </FormShellContext.Provider>
      </Stack>
    </Div>
  );
}


export default function Page() {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(LOGIN_HREF as Parameters<typeof router.replace>[0]);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Row className="min-h-[50vh]" align="center" justify="center">
        <Loader2 className="h-6 w-6 animate-spin text-[color:var(--appkit-color-text-muted,theme(colors.zinc.400))]" />
      </Row>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Main paddingY="y-2xl" paddingX="x-page">
      <ScamReportForm userId={user.uid} />
    </Main>
  );
}
