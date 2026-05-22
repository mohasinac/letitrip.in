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
  const [defaultsJson, setDefaultsJson] = useState("{}");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetch(API_ROUTES.STORE.LISTING_TEMPLATE_BY_ID(id))
      .then((r) => r.json())
      .then((j) => {
        const doc = j?.data ?? {};
        setForm(doc);
        setDefaultsJson(JSON.stringify(doc.defaults ?? {}, null, 2));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const onSave = async () => {
    let defaults: unknown = {};
    try {
      defaults = JSON.parse(defaultsJson || "{}");
    } catch {
      showToast("Defaults must be valid JSON", "error");
      return;
    }
    setSaving(true);
    const res = await fetch(API_ROUTES.STORE.LISTING_TEMPLATE_BY_ID(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, defaults }),
    });
    setSaving(false);
    if (res.ok) {
      showToast("Saved", "success");
      router.push(String(ROUTES.STORE.LISTING_TEMPLATES));
    } else showToast("Save failed", "error");
  };

  const onDelete = async () => {
    await fetch(API_ROUTES.STORE.LISTING_TEMPLATE_BY_ID(id), { method: "DELETE" });
    router.push(String(ROUTES.STORE.LISTING_TEMPLATES));
  };

  if (loading) return <Section><Container size="md"><Stack gap="md" className="py-6">Loading…</Stack></Container></Section>;

  const f = form as Record<string, string | boolean | undefined>;

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" className="py-6">
          <Heading level={1}>Edit Listing Template</Heading>
          <Stack gap="md">
            <Input label="Name" value={String(f.name ?? "")} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Textarea label="Description" value={String(f.description ?? "")} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            <Textarea label="Defaults (JSON)" value={defaultsJson} onChange={(e) => setDefaultsJson(e.target.value)} rows={8} />
            <Row className="gap-4 items-center">
              <Toggle checked={!!f.isShared} onChange={(v) => setForm({ ...form, isShared: v })} label="Shared" />
              <Toggle checked={f.isActive !== false} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
            </Row>
          </Stack>
          <Row className="gap-2 justify-between">
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>{ACTIONS.STORE["delete-listing"].label}</Button>
            <Row className="gap-2">
              <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
              <Button variant="primary" onClick={onSave} disabled={saving} isLoading={saving}>{ACTIONS.STORE["save-changes"].label}</Button>
            </Row>
          </Row>
        </Stack>
      </Container>
      <ConfirmDeleteModal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={onDelete} title="Delete template?" message="This cannot be undone." />
    </Section>
  );
}
