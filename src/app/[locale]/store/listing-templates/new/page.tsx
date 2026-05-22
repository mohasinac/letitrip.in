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
  Textarea,
  Toggle,
  ROUTES,
  useToast,
  ACTIONS,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { useState } from "react";

const LISTING_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "auction", label: "Auction" },
  { value: "pre-order", label: "Pre-order" },
  { value: "prize-draw", label: "Prize draw" },
  { value: "bundle", label: "Bundle" },
  { value: "classified", label: "Classified" },
  { value: "digital-code", label: "Digital code" },
  { value: "live", label: "Live item" },
];

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    description: "",
    listingType: "standard",
    defaultsJson: "{}",
    isShared: false,
  });
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    let defaults: unknown = {};
    try {
      defaults = JSON.parse(form.defaultsJson || "{}");
    } catch {
      showToast("Defaults must be valid JSON", "error");
      return;
    }
    setSaving(true);
    const res = await fetch(API_ROUTES.STORE.LISTING_TEMPLATES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        listingType: form.listingType,
        defaults,
        isShared: form.isShared,
      }),
    });
    setSaving(false);
    if (res.ok) {
      showToast("Saved", "success");
      router.push(String(ROUTES.STORE.LISTING_TEMPLATES));
    } else showToast("Save failed", "error");
  };

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" className="py-6">
          <Heading level={1}>New Listing Template</Heading>
          <Stack gap="md">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            <Select label="Listing type" value={form.listingType} onValueChange={(v) => setForm({ ...form, listingType: String(v) })} options={LISTING_TYPES} />
            <Textarea label="Defaults (JSON)" value={form.defaultsJson} onChange={(e) => setForm({ ...form, defaultsJson: e.target.value })} rows={6} placeholder='{"condition":"mint","currency":"INR"}' />
            <Toggle checked={form.isShared} onChange={(v) => setForm({ ...form, isShared: v })} label="Share with team" />
          </Stack>
          <Row className="gap-2 justify-end">
            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button variant="primary" onClick={onSave} disabled={saving} isLoading={saving}>{ACTIONS.STORE["save-changes"].label}</Button>
          </Row>
        </Stack>
      </Container>
    </Section>
  );
}
