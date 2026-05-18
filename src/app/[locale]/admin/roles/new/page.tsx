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
    name: "",
    slug: "",
    description: "",
    permissionsText: "",
    scope: "global",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    const permissions = form.permissionsText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await fetch(API_ROUTES.ADMIN.ROLES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        permissions,
        scope: form.scope,
        isActive: form.isActive,
      }),
    });
    setSaving(false);
    if (res.ok) {
      showToast("Role created", "success");
      router.push(String(ROUTES.ADMIN.ROLES));
    } else showToast("Save failed", "error");
  };

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" className="py-6">
          <Heading level={1}>New Custom Role</Heading>
          <Stack gap="md">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Catalog Editor" />
            <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder={slugify(form.name) || "auto"} />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            <Select
              label="Scope"
              value={form.scope}
              onValueChange={(v) => setForm({ ...form, scope: String(v) })}
              options={[
                { value: "global", label: "Global" },
                { value: "store", label: "Store-scoped" },
              ]}
            />
            <Textarea
              label="Permissions (one per line, or comma-separated)"
              value={form.permissionsText}
              onChange={(e) => setForm({ ...form, permissionsText: e.target.value })}
              rows={6}
              placeholder="admin:products:read&#10;admin:products:write&#10;admin:reviews:read"
            />
            <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
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
