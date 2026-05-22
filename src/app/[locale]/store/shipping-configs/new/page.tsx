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
    label: "",
    method: "flat",
    flatRateInPaise: 0,
    pricePerKgInPaise: 0,
    freeAbovePaise: 0,
    estimatedDays: 5,
    isDefault: false,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(API_ROUTES.STORE.SHIPPING_CONFIGS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      showToast("Saved", "success");
      router.push(String(ROUTES.STORE.SHIPPING_CONFIGS));
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
                label="Flat rate (paise)"
                value={String(form.flatRateInPaise)}
                onChange={(e) =>
                  setForm({ ...form, flatRateInPaise: Number(e.target.value) || 0 })
                }
              />
            )}
            {form.method === "weight" && (
              <Input
                type="number"
                label="Price per kg (paise)"
                value={String(form.pricePerKgInPaise)}
                onChange={(e) =>
                  setForm({ ...form, pricePerKgInPaise: Number(e.target.value) || 0 })
                }
              />
            )}
            {form.method === "free" && (
              <Input
                type="number"
                label="Free above (paise)"
                value={String(form.freeAbovePaise)}
                onChange={(e) =>
                  setForm({ ...form, freeAbovePaise: Number(e.target.value) || 0 })
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
          <Row justify="end" className="gap-2">
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
