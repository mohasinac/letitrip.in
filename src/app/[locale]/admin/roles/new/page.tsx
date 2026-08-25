"use client";

import {
  Container,
  Stack,
  Heading,
  Button,
  Row,
  Section,
  Form,
  FieldInput,
  FieldSelect,
  FieldTextarea,
  FormErrorSummary,
  Toggle,
  ROUTES,
  useToast,
  ACTIONS,
  customRoleCreateSchema,
  isKnownPermission,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { createAdminRole } from "@/lib/api/admin-client";
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

  /** The free-text box, as the array the schema and the route expect. */
  const parsePermissions = () =>
    form.permissionsText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

  const onSave = async (setFieldError: (name: string, error: string | null) => void) => {
    const permissions = parsePermissions();

    // Validate BEFORE saving. This form granted permissions with no checks of
    // any kind, and the route spread the body straight into Firestore — so a
    // role could be created with no name and a permissions list of typos.
    //
    // A permission outside the catalogue is the quiet failure: it never
    // matches anything, so the role reads as configured and grants nothing.
    // The offending strings are named rather than reported by array index,
    // because the admin typed them into one textarea and an index means
    // nothing to them.
    const unknown = permissions.filter((perm) => !isKnownPermission(perm));
    if (unknown.length > 0) {
      setFieldError(
        "permissionsText",
        `Not real permissions: ${unknown.join(", ")}. They would grant nothing.`,
      );
      return;
    }

    const parsed = customRoleCreateSchema.safeParse({
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description || undefined,
      permissions,
      scope: form.scope,
      isActive: form.isActive,
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setFieldError(String(issue.path[0] ?? "name"), issue.message);
      }
      return;
    }

    setSaving(true);
    const res = await createAdminRole(API_ROUTES.ADMIN.ROLES, {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      permissions,
      scope: form.scope,
      isActive: form.isActive,
    });
    setSaving(false);
    if (res.ok) {
      showToast("Role created", "success");
      router.push(String(ROUTES.ADMIN.ROLES));
      return;
    }
    // Surface what the route objected to, on a field — this used to be an
    // unconditional "Save failed" that discarded the server's message.
    const detail = await res
      .json()
      .then((j: { error?: string; message?: string }) => j?.error ?? j?.message)
      .catch(() => undefined);
    setFieldError("name", detail ?? "Save failed");
  };

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>New Custom Role</Heading>
          <Form schema={customRoleCreateSchema} onSubmit={(e) => e.preventDefault()}>
            {({ setFieldError, clearErrors }) => (
              <Stack gap="md">
                <FormErrorSummary />
                <FieldInput name="name" label="Name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Catalog Editor" />
                <FieldInput name="slug" label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder={slugify(form.name) || "auto"} />
                <FieldTextarea name="description" label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} />
                <FieldSelect
                  name="scope"
                  label="Scope"
                  value={form.scope}
                  onChange={(v) => setForm({ ...form, scope: String(v) })}
                  options={[
                    { value: "global", label: "Global" },
                    { value: "store", label: "Store-scoped" },
                  ]}
                />
                <FieldTextarea
                  name="permissionsText"
                  label="Permissions (one per line, or comma-separated)"
                  hint="Each must be a permission this system defines — anything else grants nothing."
                  value={form.permissionsText}
                  onChange={(v) => setForm({ ...form, permissionsText: v })}
                  rows={6}
                  placeholder="admin:products:read&#10;admin:products:write&#10;admin:reviews:read"
                />
                <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Active" />
                <Row justify="end" gap="sm">
                  <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={saving}
                    isLoading={saving}
                    onClick={() => {
                      clearErrors();
                      void onSave(setFieldError);
                    }}
                  >
                    {ACTIONS.ADMIN["save-changes"].label}
                  </Button>
                </Row>
              </Stack>
            )}
          </Form>
        </Stack>
      </Container>
    </Section>
  );
}
