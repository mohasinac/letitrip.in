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
  Toggle,
  ROUTES,
  useToast,
  ConfirmDeleteModal,
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
    fetch(API_ROUTES.STORE.STORE_CATEGORY_BY_ID(id))
      .then((r) => r.json())
      .then((j) => setForm(j?.data ?? {}))
      .finally(() => setLoading(false));
  }, [id]);

  const onSave = async () => {
    setSaving(true);
    const res = await fetch(API_ROUTES.STORE.STORE_CATEGORY_BY_ID(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      showToast("Saved", "success");
      router.push(String(ROUTES.STORE.STORE_CATEGORIES));
    } else showToast("Save failed", "error");
  };

  const onDelete = async () => {
    await fetch(API_ROUTES.STORE.STORE_CATEGORY_BY_ID(id), { method: "DELETE" });
    router.push(String(ROUTES.STORE.STORE_CATEGORIES));
  };

  if (loading) return <Section><Container size="md"><Stack gap="md" className="py-6">Loading…</Stack></Container></Section>;

  const f = form as Record<string, string | number | boolean | undefined>;

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" className="py-6">
          <Heading level={1}>Edit Storefront Category</Heading>
          <Stack gap="md">
            <Input label="Label" value={String(f.label ?? "")} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <Input label="Slug" value={String(f.slug ?? "")} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <Textarea label="Description" value={String(f.description ?? "")} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            <Input type="number" label="Display order" value={String(f.displayOrder ?? 0)} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) || 0 })} />
            <Toggle checked={f.isActive !== false} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
          </Stack>
          <Row className="gap-2 justify-between">
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete</Button>
            <Row className="gap-2">
              <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
              <Button variant="primary" onClick={onSave} disabled={saving} isLoading={saving}>Save</Button>
            </Row>
          </Row>
        </Stack>
      </Container>
      <ConfirmDeleteModal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={onDelete} title="Delete category?" message="This cannot be undone." />
    </Section>
  );
}
