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
import { useParams } from "next/navigation";
import { API_ROUTES } from "@/constants";
import { useEffect, useState } from "react";

const THEME_OPTIONS = [
  { value: "generic", label: "Generic" },
  { value: "related", label: "Related (similar items)" },
  { value: "character", label: "Character (same character)" },
  { value: "lineage", label: "Lineage (series / wave)" },
  { value: "set", label: "Set (same set / drop)" },
];

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);
  const { showToast } = useToast();
  const [form, setForm] = useState({
    title: "",
    description: "",
    groupTheme: "generic",
    isActive: true,
    isFeatured: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(API_ROUTES.STORE.GROUPED_LISTING_BY_ID(id))
      .then((r) => r.json())
      .then((json) => {
        const d = json?.data;
        if (d) {
          setForm({
            title: d.title ?? "",
            description: d.description ?? "",
            groupTheme: d.groupTheme ?? "generic",
            isActive: d.isActive ?? true,
            isFeatured: d.isFeatured ?? false,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const onSave = async () => {
    setSaving(true);
    const res = await fetch(API_ROUTES.STORE.GROUPED_LISTING_BY_ID(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      showToast("Saved", "success");
      router.push(String(ROUTES.STORE.GROUPED_LISTINGS));
    } else {
      showToast("Save failed", "error");
    }
  };

  if (loading) {
    return (
      <Section>
        <Container size="md">
          <div className="py-6 text-sm text-zinc-500 dark:text-zinc-400">Loading…</div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" className="py-6">
          <Heading level={1}>Edit Grouped Listing</Heading>
          <Stack gap="md">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
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
          <Row className="gap-2 justify-end">
            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button variant="primary" onClick={onSave} disabled={saving} isLoading={saving}>
              Save Changes
            </Button>
          </Row>
        </Stack>
      </Container>
    </Section>
  );
}
