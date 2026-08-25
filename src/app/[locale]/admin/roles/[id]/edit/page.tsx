"use client";

import type { JsonValue } from "@mohasinac/appkit/client";
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
  Skeleton,
  Form,
  FormErrorSummary,
  customRoleUpdateSchema,
  isKnownPermission,
  Toggle,
  ROUTES,
  useToast,
  ConfirmDeleteModal,
  ACTIONS,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { API_ROUTES } from "@/constants";
import { getAdminRole, updateAdminRole, deleteAdminRole } from "@/lib/api/admin-client";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [form, setForm] = useState<Record<string, JsonValue>>({});
  const [permissionsText, setPermissionsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    getAdminRole(API_ROUTES.ADMIN.ROLE_BY_ID(id))
      .then((r) => r.json())
      .then((j) => {
        const doc = j?.data ?? {};
        setForm(doc);
        setPermissionsText((doc.permissions ?? []).join("\n"));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const onSave = async (setFieldError: (name: string, error: string | null) => void) => {
    const permissions = permissionsText
      .split(/[\n,]/)
      .map((x) => x.trim())
      .filter(Boolean);

    // A permission outside the catalogue never matches anything, so a role
    // built from typos reads as configured and grants nothing. Name them,
    // rather than reporting an array index the admin cannot map back to the
    // single textarea they typed into.
    const unknown = permissions.filter((perm) => !isKnownPermission(perm));
    if (unknown.length > 0) {
      setFieldError(
        "permissionsText",
        `Not real permissions: ${unknown.join(", ")}. They would grant nothing.`,
      );
      return;
    }

    // Send ONLY the editable fields.
    //
    // This used to PATCH `{ ...form, permissions }` — the entire document as
    // loaded, including `id`, `createdAt`, `createdBy` and `slug`. That let a
    // save rewrite the role's creator (the one field an audit of a privilege
    // grant depends on) and its stable identifier. It is also why the update
    // schema is `.strict()`: an unknown key is now a 400, not a silent write.
    const cur = form as Record<string, unknown>;
    const payload = {
      name: String(cur.name ?? ""),
      description: cur.description ? String(cur.description) : undefined,
      scope: (cur.scope === "store" ? "store" : "global") as "global" | "store",
      isActive: cur.isActive !== false,
      permissions,
    };

    const parsed = customRoleUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setFieldError(String(issue.path[0] ?? "name"), issue.message);
      }
      return;
    }

    setSaving(true);
    const res = await updateAdminRole(API_ROUTES.ADMIN.ROLE_BY_ID(id), payload);
    setSaving(false);
    if (res.ok) {
      showToast("Saved", "success");
      router.push(String(ROUTES.ADMIN.ROLES));
      return;
    }
    const detail = await res
      .json()
      .then((j: { error?: string; message?: string }) => j?.error ?? j?.message)
      .catch(() => undefined);
    setFieldError("name", detail ?? "Save failed");
  };

  const onDelete = async () => {
    await deleteAdminRole(API_ROUTES.ADMIN.ROLE_BY_ID(id));
    router.push(String(ROUTES.ADMIN.ROLES));
  };

  if (loading) {
    return (
      <Section>
        <Container size="md">
          <Stack gap="md" padding="y-lg">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </Stack>
        </Container>
      </Section>
    );
  }

  const f = form as Record<string, string | boolean | undefined>;

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Edit Custom Role</Heading>
          <Form schema={customRoleUpdateSchema} onSubmit={(e) => e.preventDefault()}>
          {({ setFieldError, clearErrors }) => (<>
          <Stack gap="md">
            <FormErrorSummary />
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
          <Row justify="between" gap="sm">
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>{ACTIONS.STORE["delete-listing"].label}</Button>
            <Row gap="sm">
              <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
              <Button variant="primary" type="submit" onClick={() => { clearErrors(); void onSave(setFieldError); }} disabled={saving} isLoading={saving}>{ACTIONS.ADMIN["save-changes"].label}</Button>
            </Row>
          </Row>
        </>)}
        </Form>
        </Stack>
      </Container>
      <ConfirmDeleteModal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={onDelete} title="Delete role?" message="Users with this role will lose its permissions." />
    </Section>
  );
}
