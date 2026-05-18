"use client";

import {
  Container,
  Stack,
  Heading,
  Button,
  Row,
  Section,
  Input,
  Textarea,
  ROUTES,
  useToast,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { useState } from "react";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    label: "",
    slug: "",
    description: "",
    coverImageUrl: "",
    displayOrder: 0,
  });
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    const body = { ...form, slug: form.slug || slugify(form.label) };
    const res = await fetch(API_ROUTES.STORE.STORE_CATEGORIES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      showToast("Saved", "success");
      router.push(String(ROUTES.STORE.STORE_CATEGORIES));
    } else showToast("Save failed", "error");
  };

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" className="py-6">
          <Heading level={1}>New Storefront Category</Heading>
          <Stack gap="md">
            <Input label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <Input label="Slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder={slugify(form.label) || "auto"} />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            <Input label="Cover image URL" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} />
            <Input type="number" label="Display order" value={String(form.displayOrder)} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) || 0 })} />
          </Stack>
          <Row className="gap-2 justify-end">
            <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button variant="primary" onClick={onSave} disabled={saving} isLoading={saving}>Save</Button>
          </Row>
        </Stack>
      </Container>
    </Section>
  );
}
