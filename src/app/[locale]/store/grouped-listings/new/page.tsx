"use client";

import {
  Button,
  Container,
  Heading,
  Input,
  Row,
  ROUTES,
  Section,
  Select,
  Stack,
  Textarea,
  Toggle,
  useToast,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { useState } from "react";

const THEME_OPTIONS = [
  { value: "generic", label: "Generic" },
  { value: "related", label: "Related (similar items)" },
  { value: "character", label: "Character (same character)" },
  { value: "lineage", label: "Lineage (series / wave)" },
  { value: "set", label: "Set (same set / drop)" },
];

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    title: "",
    description: "",
    groupTheme: "generic",
    isActive: true,
    isFeatured: false,
  });
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!form.title.trim()) {
      showToast("Title is required", "error");
      return;
    }
    setSaving(true);
    const res = await fetch(API_ROUTES.STORE.GROUPED_LISTINGS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, productIds: [] }),
    });
    setSaving(false);
    if (res.ok) {
      showToast("Group created", "success");
      router.push(String(ROUTES.STORE.GROUPED_LISTINGS));
    } else {
      showToast("Save failed", "error");
    }
  };

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" className="py-6">
          <Heading level={1}>New Grouped Listing</Heading>
          <Stack gap="md">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Pokémon Base Set Collection"
              required
            />
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Describe what ties these listings together"
            />
            <Select
              label="Group theme"
              value={form.groupTheme}
              onValueChange={(v) => setForm({ ...form, groupTheme: String(v) })}
              options={THEME_OPTIONS}
            />
            <Toggle
              checked={form.isActive}
              onChange={(v) => setForm({ ...form, isActive: v })}
              label="Active"
            />
            <Toggle
              checked={form.isFeatured}
              onChange={(v) => setForm({ ...form, isFeatured: v })}
              label="Featured on homepage"
            />
          </Stack>
          <Row justify="end" className="gap-2">
            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button variant="primary" onClick={onSave} disabled={saving} isLoading={saving}>
              Create Group
            </Button>
          </Row>
        </Stack>
      </Container>
    </Section>
  );
}
