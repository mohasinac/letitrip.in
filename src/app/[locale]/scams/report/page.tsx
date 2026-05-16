"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useSession, ROUTES, SCAM_TYPES, SCAM_PLATFORM_LABELS, Div, Button, Label, Input, Textarea, Select } from "@mohasinac/appkit/client";
import { Alert, Stack, Heading, Text, Row, Card, CardBody, Main, Ul, Li } from "@mohasinac/appkit";
import { ChevronLeft, Loader2, Plus, X } from "lucide-react";
import { API_ROUTES } from "@/constants";

const LOGIN_HREF =
  `${String(ROUTES.AUTH.LOGIN)}?redirect=${encodeURIComponent("/scams/report")}` as const;

const CLS_INPUT = "w-full rounded-lg border border-[color:var(--appkit-color-border,theme(colors.zinc.200))] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--appkit-color-primary,theme(colors.blue.500))]/40";

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
      <Text className="text-sm font-medium">{label}</Text>
      <Row gap="xs" wrap>
        {values.map((v) => (
          <Div
            key={v}
            className="inline-flex items-center gap-1 rounded-full bg-[color:var(--appkit-color-surface-elevated,theme(colors.zinc.100))] px-2.5 py-1 text-xs font-medium"
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
          className="flex-1 rounded-lg border border-[color:var(--appkit-color-border,theme(colors.zinc.200))] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--appkit-color-primary,theme(colors.blue.500))]/40"
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
        <Text variant="secondary" className="text-xs">{helpText}</Text>
      )}
    </Stack>
  );
}

interface FormState {
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

// ─── Section sub-components ────────────────────────────────────────────────

function ScammerIdentitySection({
  form,
  field,
}: {
  form: FormState;
  field: <K extends keyof FormState>(key: K) => (val: FormState[K]) => void;
}) {
  return (
    <Card variant="outlined" padding="lg">
      <CardBody>
        <Stack gap="md">
          <Heading level={2} className="text-base font-semibold">Section 1 — Scammer Identity</Heading>
          <Stack gap="xs">
            <Label className="text-sm font-medium" htmlFor="displayName">
              Name / Display Name <Text as="span" className="text-[color:var(--appkit-color-danger,theme(colors.red.500))]">*</Text>
            </Label>
            <Input id="displayName" type="text" required value={form.displayName} onChange={(e) => field("displayName")(e.target.value)} placeholder="The name they used to scam you" className={CLS_INPUT} />
          </Stack>
          <TagInput label="Phone Numbers" placeholder="e.g. 9876543210" values={form.phones} onChange={field("phones")} helpText="Add each number and press Enter. 10-digit Indian mobile numbers." />
          <TagInput label="UPI IDs" placeholder="e.g. name@upi" values={form.upiIds} onChange={field("upiIds")} helpText="Add each UPI ID and press Enter." />
          <TagInput label="Email Addresses" placeholder="e.g. scammer@gmail.com" values={form.emails} onChange={field("emails")} helpText="Add each email and press Enter." />
        </Stack>
      </CardBody>
    </Card>
  );
}

function WhatHappenedSection({
  form,
  field,
}: {
  form: FormState;
  field: <K extends keyof FormState>(key: K) => (val: FormState[K]) => void;
}) {
  const selectedScamType = SCAM_TYPES.find((t) => t.id === form.scamType);
  return (
    <Card variant="outlined" padding="lg">
      <CardBody>
        <Stack gap="md">
          <Heading level={2} className="text-base font-semibold">Section 2 — What Happened</Heading>
          <Stack gap="xs">
            <Label className="text-sm font-medium" htmlFor="scamType">
              Scam Type <Text as="span" className="text-[color:var(--appkit-color-danger,theme(colors.red.500))]">*</Text>
            </Label>
            <Select id="scamType" value={form.scamType} onValueChange={(v) => field("scamType")(v)} options={SCAM_TYPE_OPTIONS} className={CLS_INPUT} />
            {selectedScamType && (<Alert variant="info" compact><Text className="text-xs leading-relaxed">{selectedScamType.howItHappens.slice(0, 180)}…</Text></Alert>)}
          </Stack>
          <Stack gap="xs">
            <Label className="text-sm font-medium" htmlFor="scamPlatform">
              Platform where scam occurred <Text as="span" className="text-[color:var(--appkit-color-danger,theme(colors.red.500))]">*</Text>
            </Label>
            <Select id="scamPlatform" value={form.scamPlatform} onValueChange={(v) => field("scamPlatform")(v)} options={SCAM_PLATFORM_OPTIONS} className={CLS_INPUT} />
          </Stack>
          <Row gap="md" className="flex-wrap">
            <Stack gap="xs" className="flex-1 min-w-[140px]">
              <Label className="text-sm font-medium" htmlFor="amountLost">Amount Lost (₹) — optional</Label>
              <Input id="amountLost" type="number" min="0" step="1" value={form.amountLost} onChange={(e) => field("amountLost")(e.target.value)} placeholder="e.g. 2500" className={CLS_INPUT} />
            </Stack>
            <Stack gap="xs" className="flex-1 min-w-[140px]">
              <Label className="text-sm font-medium" htmlFor="itemInvolved">Item Involved — optional</Label>
              <Input id="itemInvolved" type="text" value={form.itemInvolved} onChange={(e) => field("itemInvolved")(e.target.value)} placeholder="e.g. Charizard PSA 9" className={CLS_INPUT} />
            </Stack>
          </Row>
          <Stack gap="xs">
            <Label className="text-sm font-medium" htmlFor="description">
              What exactly happened? <Text as="span" className="text-[color:var(--appkit-color-danger,theme(colors.red.500))]">*</Text>
            </Label>
            <Textarea id="description" required minLength={100} rows={6} value={form.description} onChange={(e) => field("description")(e.target.value)} placeholder="Describe exactly what happened — dates, amounts promised, what you received, any communication details…" className="w-full resize-y rounded-lg border border-[color:var(--appkit-color-border,theme(colors.zinc.200))] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--appkit-color-primary,theme(colors.blue.500))]/40" />
            <Text variant="secondary" className="text-right text-xs">{form.description.length} / 5000 chars (min 100)</Text>
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
}

function PrivacyAgreementSection({
  form,
  field,
}: {
  form: FormState;
  field: <K extends keyof FormState>(key: K) => (val: FormState[K]) => void;
}) {
  return (
    <Card variant="outlined" padding="lg">
      <CardBody>
        <Stack gap="md">
          <Heading level={2} className="text-base font-semibold">Section 3 — Privacy & Agreement</Heading>
          <Label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={form.reportedByAnon} onChange={(e) => field("reportedByAnon")(e.target.checked)} className="mt-0.5 h-4 w-4 rounded" />
            <Stack gap="none">
              <Text className="text-sm font-medium">Keep my identity private</Text>
              <Text variant="secondary" className="text-xs">Your name will not appear on the public profile page — shown as "Anonymous reporter".</Text>
            </Stack>
          </Label>
          <Label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" required checked={form.agreed} onChange={(e) => field("agreed")(e.target.checked)} className="mt-0.5 h-4 w-4 rounded" />
            <Stack gap="none">
              <Text className="text-sm font-medium">
                I confirm this report is truthful to the best of my knowledge. <Text as="span" className="text-[color:var(--appkit-color-danger,theme(colors.red.500))]">*</Text>
              </Text>
              <Text variant="secondary" className="text-xs">False reports may result in account action. All submissions are reviewed before publication.</Text>
            </Stack>
          </Label>
        </Stack>
      </CardBody>
    </Card>
  );
}

// ─── Main form ─────────────────────────────────────────────────────────────

function ScamReportForm({ userId }: { userId: string }) {
  void userId;

  const router = useRouter();
  const [form, setForm] = useState<FormState>({
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field = <K extends keyof FormState>(key: K) => (val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.agreed) {
      setError("Please confirm the agreement before submitting.");
      return;
    }
    if (!form.scamType || !form.scamPlatform) {
      setError("Please select a scam type and platform.");
      return;
    }
    if (form.description.length < 100) {
      setError("Description must be at least 100 characters.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        displayName: form.displayName,
        phones: form.phones.join(","),
        upiIds: form.upiIds.join(","),
        emails: form.emails.join(","),
        scamType: form.scamType,
        scamPlatform: form.scamPlatform,
        amountLost: form.amountLost ? parseFloat(form.amountLost) : undefined,
        itemInvolved: form.itemInvolved,
        description: form.description,
        reportedByAnon: form.reportedByAnon,
      };

      const res = await fetch(API_ROUTES.SCAMS.REPORTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message ?? "Submission failed");
      }

      router.push(String(ROUTES.PUBLIC.SCAMS) as Parameters<typeof router.push>[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Div className="mx-auto max-w-2xl">
      <Link
        href={String(ROUTES.PUBLIC.SCAMS)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[color:var(--appkit-color-text-muted,theme(colors.zinc.500))] hover:text-[color:var(--appkit-color-text,theme(colors.zinc.700))]"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Scam Registry
      </Link>

      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          <Stack gap="xs">
            <Heading level={1} className="text-2xl font-bold">
              Report a Scammer
            </Heading>
            <Text variant="secondary" className="text-sm">
              Your report will be reviewed by our moderation team before appearing publicly. All
              submissions are confidential — your identity is never shared without consent.
            </Text>
          </Stack>

          <Alert variant="warning" title="Before you submit">
            <Ul className="list-disc space-y-1 pl-4 text-sm">
              <Li>Only report genuine scam incidents — false reports can be contested.</Li>
              <Li>Max 5 pending reports per user. Verified reports are not counted.</Li>
              <Li>Evidence (screenshots, receipts) significantly speeds up verification.</Li>
            </Ul>
          </Alert>

          <ScammerIdentitySection form={form} field={field} />
          <WhatHappenedSection form={form} field={field} />
          <PrivacyAgreementSection form={form} field={field} />

          {error && (
            <Alert variant="error" title="Submission error">
              {error}
            </Alert>
          )}

          <Row justify="between" align="center">
            <Link
              href={String(ROUTES.PUBLIC.SCAMS)}
              className="appkit-button appkit-button--ghost appkit-button--md"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !form.agreed}
              className="flex items-center gap-2 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Submitting…" : "Submit Report"}
            </Button>
          </Row>
        </Stack>
      </form>
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
      <Div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[color:var(--appkit-color-text-muted,theme(colors.zinc.400))]" />
      </Div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Main className="px-4 py-10 sm:px-6 lg:px-8">
      <ScamReportForm userId={user.uid} />
    </Main>
  );
}
