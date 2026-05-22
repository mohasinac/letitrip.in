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
  const [permissionsText, setPermissionsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetch(API_ROUTES.ADMIN.ROLE_BY_ID(id))
      .then((r) => r.json())
      .then((j) => {
        const doc = j?.data ?? {};
        setForm(doc);
        setPermissionsText((doc.permissions ?? []).join("\n"));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const onSave = async () => {
    setSaving(true);
    const permissions = permissionsText.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    const res = await fetch(API_ROUTES.ADMIN.ROLE_BY_ID(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, permissions }),
    });
    setSaving(false);
    if (res.ok) {
      showToast("Saved", "success");
      router.push(String(ROUTES.ADMIN.ROLES));
    } else showToast("Save failed", "error");
  };

  const onDelete = async () => {
    await fetch(API_ROUTES.ADMIN.ROLE_BY_ID(id), { method: "DELETE" });
    router.push(String(ROUTES.ADMIN.ROLES));
  };

  if (loading) return <Section><Container size="md"><Stack gap="md" className="py-6">Loading…</Stack></Container></Section>;

  const f = form as Record<string, string | boolean | undefined>;

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" className="py-6">
          <Heading level={1}>Edit Custom Role</Heading>
          <Stack gap="md">
            <Input label="Name" value={String(f.name ?? "")} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Slug" value={String(f.slug ?? "")} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <Textarea label="Description" value={String(f.description ?? "")} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            <Select
              label="Scope"
              value={String(f.scope ?? "global")}
              onValueChange={(v) => setForm({ ...form, scope: String(v) })}
              options={[
                { value: "global", label: "Global" },
                { value: "store", label: "Store-scoped" },
              ]}
            />
            <Textarea label="Permissions" value={permissionsText} onChange={(e) => setPermissionsText(e.target.value)} rows={6} />
            <Toggle checked={f.isActive !== false} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
          </Stack>
          <Row justify="between" className="gap-2">
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>{ACTIONS.STORE["delete-listing"].label}</Button>
            <Row className="gap-2">
              <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
              <Button variant="primary" onClick={onSave} disabled={saving} isLoading={saving}>{ACTIONS.ADMIN["save-changes"].label}</Button>
            </Row>
          </Row>
        </Stack>
      </Container>
      <ConfirmDeleteModal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={onDelete} title="Delete role?" message="Users with this role will lose its permissions." />
    </Section>
  );
}
