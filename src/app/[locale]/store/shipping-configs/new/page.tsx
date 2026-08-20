"use client";
import { normalizeError } from "@mohasinac/appkit/client";

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
import { createShippingConfig } from "@/lib/api/store-client";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    label: "",
    method: "flat",
    flatRate: 0,
    pricePerKg: 0,
    freeAbove: 0,
    estimatedDays: 5,
    isDefault: false,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await createShippingConfig(API_ROUTES.STORE.SHIPPING_CONFIGS, form as Record<string, unknown>);
      if (!res.ok) throw new Error("Save failed");
      showToast("Saved", "success");
      router.push(String(ROUTES.STORE.SHIPPING_CONFIGS));
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
          <Heading level={1}>New Shipping Configuration</Heading>
          <Stack gap="md">
            <Input
              label="Label"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g. Flat Rs 99"
            />
            <Select
              label="Method"
              value={form.method}
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
            {form.method === "flat" && (
              <Input
                type="number"
                label="Flat rate (₹)"
                value={String(form.flatRate)}
                onChange={(e) =>
                  setForm({ ...form, flatRate: Number(e.target.value) || 0 })
                }
              />
            )}
            {form.method === "weight" && (
              <Input
                type="number"
                label="Price per kg (₹)"
                value={String(form.pricePerKg)}
                onChange={(e) =>
                  setForm({ ...form, pricePerKg: Number(e.target.value) || 0 })
                }
              />
            )}
            {form.method === "free" && (
              <Input
                type="number"
                label="Free above (₹)"
                value={String(form.freeAbove)}
                onChange={(e) =>
                  setForm({ ...form, freeAbove: Number(e.target.value) || 0 })
                }
              />
            )}
            <Input
              type="number"
              label="Estimated days"
              value={String(form.estimatedDays)}
              onChange={(e) =>
                setForm({ ...form, estimatedDays: Number(e.target.value) || 0 })
              }
            />
          </Stack>
          <Row justify="end" gap="sm">
            <Button variant="ghost" onClick={() => router.back()}>
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
