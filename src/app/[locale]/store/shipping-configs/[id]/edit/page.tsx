"use client";

import type { JsonValue } from "@mohasinac/appkit";
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
import { getShippingConfig, updateShippingConfig, deleteShippingConfig } from "@/lib/api/store-client";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [form, setForm] = useState<Record<string, JsonValue>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    getShippingConfig(API_ROUTES.STORE.SHIPPING_CONFIG_BY_ID(id))
      .then((r) => r.json())
      .then((j) => setForm(j?.data ?? {}))
      .finally(() => setLoading(false));
  }, [id]);

  const onSave = async () => {
    setSaving(true);
    const res = await updateShippingConfig(API_ROUTES.STORE.SHIPPING_CONFIG_BY_ID(id), form as Record<string, unknown>);
    setSaving(false);
    if (res.ok) {
      showToast("Saved", "success");
      router.push(String(ROUTES.STORE.SHIPPING_CONFIGS));
    } else showToast("Save failed", "error");
  };

  const onDelete = async () => {
    await deleteShippingConfig(API_ROUTES.STORE.SHIPPING_CONFIG_BY_ID(id));
    router.push(String(ROUTES.STORE.SHIPPING_CONFIGS));
  };

  if (loading) return <Section><Container size="md"><Stack gap="md" padding="y-lg">Loading…</Stack></Container></Section>;

  const f = form as Record<string, string | number | boolean | undefined>;

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Edit Shipping Configuration</Heading>
          <Stack gap="md">
            <Input label="Label" value={String(f.label ?? "")} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <Select
              label="Method"
              value={String(f.method ?? "flat")}
              onValueChange={(v) => setForm({ ...form, method: String(v) })}
              options={[
                { value: "free", label: "Free" },
                { value: "flat", label: "Flat rate" },
                { value: "weight", label: "By weight" },
                { value: "express", label: "Express" },
                { value: "pickup", label: "Pickup" },
                { value: "custom", label: "Custom" },
              ]}
            />
            <Input type="number" label="Flat rate (paise)" value={String(f.flatRateInPaise ?? 0)} onChange={(e) => setForm({ ...form, flatRateInPaise: Number(e.target.value) || 0 })} />
            <Input type="number" label="Estimated days" value={String(f.estimatedDays ?? 0)} onChange={(e) => setForm({ ...form, estimatedDays: Number(e.target.value) || 0 })} />
            <Row gap="md">
              <Toggle checked={!!f.isDefault} onChange={(v) => setForm({ ...form, isDefault: v })} label="Default" />
              <Toggle checked={f.isActive !== false} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
            </Row>
          </Stack>
          <Row justify="between" gap="sm">
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>{ACTIONS.STORE["delete-listing"].label}</Button>
            <Row gap="sm">
              <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
              <Button variant="primary" onClick={onSave} disabled={saving} isLoading={saving}>{ACTIONS.STORE["save-changes"].label}</Button>
            </Row>
          </Row>
        </Stack>
      </Container>
      <ConfirmDeleteModal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={onDelete} title="Delete shipping config?" message="This cannot be undone." />
    </Section>
  );
}
