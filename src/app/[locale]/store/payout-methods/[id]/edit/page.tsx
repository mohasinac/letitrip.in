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
  Toggle,
  ROUTES,
  useToast,
  ConfirmDeleteModal,
  ACTIONS,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { API_ROUTES } from "@/constants";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetch(API_ROUTES.STORE.PAYOUT_METHOD_BY_ID(id))
      .then((r) => r.json())
      .then((j) => setForm(j?.data ?? {}))
      .finally(() => setLoading(false));
  }, [id]);

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(API_ROUTES.STORE.PAYOUT_METHOD_BY_ID(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      showToast("Saved", "success");
      router.push(String(ROUTES.STORE.PAYOUT_METHODS));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    await fetch(API_ROUTES.STORE.PAYOUT_METHOD_BY_ID(id), { method: "DELETE" });
    router.push(String(ROUTES.STORE.PAYOUT_METHODS));
  };

  if (loading) return <Section><Container size="md"><Stack gap="md" className="py-6">Loading…</Stack></Container></Section>;

  const f = form as Record<string, string | boolean | undefined>;

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" className="py-6">
          <Heading level={1}>Edit Payout Method</Heading>
          <Stack gap="md">
            <Select
              label="Type"
              value={String(f.type ?? "upi")}
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
              value={String(f.label ?? "")}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
            <Input
              label="UPI VPA"
              value={String(f.upiVpa ?? "")}
              onChange={(e) => setForm({ ...form, upiVpa: e.target.value })}
            />
            <Row className="gap-4 items-center">
              <Toggle
                checked={!!f.isDefault}
                onChange={(v) => setForm({ ...form, isDefault: v })}
                label="Default"
              />
              <Toggle
                checked={f.isActive !== false}
                onChange={(v) => setForm({ ...form, isActive: v })}
                label="Active"
              />
            </Row>
          </Stack>
          <Row className="gap-2 justify-between">
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              {ACTIONS.STORE["delete-listing"].label}
            </Button>
            <Row className="gap-2">
              <Button variant="ghost" onClick={() => router.back()} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" onClick={onSave} disabled={saving} isLoading={saving}>
                {ACTIONS.STORE["save-changes"].label}
              </Button>
            </Row>
          </Row>
        </Stack>
      </Container>
      <ConfirmDeleteModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
        title="Delete payout method?"
        message="This cannot be undone."
      />
    </Section>
  );
}
