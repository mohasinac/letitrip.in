"use client";
import { normalizeError } from "@mohasinac/appkit/client";

import {
  Container,
  Stack,
  Heading,
  Button,
  Row,
  Section,
  Form,
  FieldInput,
  FieldSelect,
  FormErrorSummary,
  applyZodIssues,
  payoutMethodFormSchema,
  ROUTES,
  useToast,
  ACTIONS,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { createPayoutMethod } from "@/lib/api/store-client";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    type: "upi",
    label: "",
    upiVpa: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    bankName: "",
    isDefault: false,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const onSave = async (setFieldError: (field: string, message: string) => void) => {
    setSaving(true);
    try {
      const res = await createPayoutMethod(API_ROUTES.STORE.PAYOUT_METHODS, form as Record<string, unknown>);
      if (!res.ok) {
        // Surface what the route objected to on a field. This used to be a
        // hardcoded "Save failed" that discarded the server's message.
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
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>New Payout Method</Heading>
          <Form schema={payoutMethodFormSchema} onSubmit={(e) => e.preventDefault()}>
          {({ setFieldError, clearErrors }) => (
          <Stack gap="md">
            <FormErrorSummary />
            <FieldSelect
              name="type"
              label="Type"
              value={form.type}
              onChange={(v) => setForm({ ...form, type: String(v) })}
              options={[
                { value: "upi", label: "UPI" },
                { value: "bank", label: "Bank account" },
                { value: "card", label: "Card" },
                { value: "other", label: "Other" },
              ]}
            />
            <FieldInput name="label" label="Label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} placeholder="e.g. Primary UPI" />
            {form.type === "upi" && (
              <FieldInput name="upiVpa" label="UPI VPA" value={form.upiVpa} onChange={(v) => setForm({ ...form, upiVpa: v })} placeholder="name@upi" />
            )}
            {form.type === "bank" && (
              <>
                <FieldInput name="accountHolderName" label="Account holder" value={form.accountHolderName} onChange={(v) => setForm({ ...form, accountHolderName: v })} />
                <FieldInput name="accountNumber" label="Account number" value={form.accountNumber} onChange={(v) => setForm({ ...form, accountNumber: v })} />
                <FieldInput name="ifscCode" label="IFSC code" value={form.ifscCode} onChange={(v) => setForm({ ...form, ifscCode: v })} />
                <FieldInput name="bankName" label="Bank name" value={form.bankName} onChange={(v) => setForm({ ...form, bankName: v })} />
              </>
            )}
            <Row justify="end" gap="sm">
              <Button variant="ghost" type="button" onClick={() => router.back()} disabled={saving}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={saving}
                isLoading={saving}
                onClick={() => {
                  clearErrors();
                  // Nothing checked this before — a bank method with a blank
                  // account number, IFSC and holder name saved cleanly and
                  // only failed at payout time.
                  const parsed = payoutMethodFormSchema.safeParse(form);
                  if (!parsed.success) {
                    applyZodIssues(parsed.error.issues, setFieldError);
                    return;
                  }
                  void onSave(setFieldError);
                }}
              >
                {ACTIONS.STORE["save-changes"].label}
              </Button>
            </Row>
          </Stack>
          )}
          </Form>
        </Stack>
      </Container>
    </Section>
  );
}
