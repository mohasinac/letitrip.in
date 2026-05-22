"use client";

import {
  Container,
  Stack,
  Heading,
  Button,
  Row,
  Section,
  Input,
  Select,
  ROUTES,
  useToast,
  ACTIONS,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
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

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(API_ROUTES.STORE.PAYOUT_METHODS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      showToast("Payout method saved", "success");
      router.push(String(ROUTES.STORE.PAYOUT_METHODS));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" className="py-6">
          <Heading level={1}>New Payout Method</Heading>
          <Stack gap="md">
            <Select
              label="Type"
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: String(v) })}
              options={[
                { value: "upi", label: "UPI" },
                { value: "bank", label: "Bank account" },
                { value: "card", label: "Card" },
                { value: "other", label: "Other" },
              ]}
            />
            <Input
              label="Label"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g. Primary UPI"
            />
            {form.type === "upi" && (
              <Input
                label="UPI VPA"
                value={form.upiVpa}
                onChange={(e) => setForm({ ...form, upiVpa: e.target.value })}
                placeholder="name@upi"
              />
            )}
            {form.type === "bank" && (
              <>
                <Input
                  label="Account holder"
                  value={form.accountHolderName}
                  onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
                />
                <Input
                  label="Account number"
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                />
                <Input
                  label="IFSC code"
                  value={form.ifscCode}
                  onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
                />
                <Input
                  label="Bank name"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                />
              </>
            )}
          </Stack>
          <Row justify="end" className="gap-2">
            <Button variant="ghost" onClick={() => router.back()} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onSave} disabled={saving} isLoading={saving}>
              {ACTIONS.STORE["save-changes"].label}
            </Button>
          </Row>
        </Stack>
      </Container>
    </Section>
  );
}
