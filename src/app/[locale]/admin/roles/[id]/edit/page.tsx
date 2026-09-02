"use client";

/**
 * Edit a custom role.
 *
 * The fields come from `customRoleUpdateSchema`'s annotations; only
 * `permissions` needs a `renderers` entry, exactly as on the `new` sibling.
 *
 * ## Two things the schema now enforces that the page used to
 *
 * It PATCHed `{ ...form, permissions }` — the entire document as loaded,
 * including `id`, `createdAt`, `createdBy` and `slug`. That let a save rewrite
 * the role's creator, which is the one field an audit of a privilege grant
 * depends on. The payload is narrowed to the editable fields and the update
 * schema is `.strict()`, so an unknown key is a 400 rather than a silent write.
 *
 * And it rendered a **Slug** input that the narrowed payload deliberately did
 * not send — editable, and discarded on save. Deriving the form from the update
 * schema removes it by construction, because that schema omits `slug`.
 */

import {
  Container,
  Stack,
  Heading,
  Section,
  Skeleton,
  FieldTextarea,
  FormShellContext,
  FormErrorSummary,
  SectionForm,
  buildSectionsFromSchema,
  useSectionFormNav,
  useFormShellState,
  applyZodIssues,
  ROUTES,
  useToast,
  ConfirmDeleteModal,
  ACTIONS,
  customRoleUpdateSchema,
  isKnownPermission,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { API_ROUTES } from "@/constants";
import { getAdminRole, updateAdminRole, deleteAdminRole } from "@/lib/api/admin-client";
import { useEffect, useMemo, useState } from "react";

function parsePermissions(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

type Values = {
  [key: string]: unknown;
  name: string;
  description: string;
  permissions: string[];
  scope: "global" | "store";
  isActive: boolean;
};

const EMPTY: Values = {
  name: "",
  description: "",
  permissions: [],
  scope: "global",
  isActive: true,
};

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [form, setForm] = useState<Values>(EMPTY);
  const [permissionsText, setPermissionsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    getAdminRole(API_ROUTES.ADMIN.ROLE_BY_ID(id))
      .then((r) => r.json())
      .then((j) => {
        const doc = (j?.data ?? {}) as Record<string, unknown>;
        const permissions = Array.isArray(doc.permissions) ? (doc.permissions as string[]) : [];
        setForm({
          name: String(doc.name ?? ""),
          description: doc.description ? String(doc.description) : "",
          permissions,
          scope: doc.scope === "store" ? "store" : "global",
          isActive: doc.isActive !== false,
        });
        setPermissionsText(permissions.join("\n"));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const applyPermissionsText = (v: string, onChange: (p: Partial<Values>) => void) => {
    setPermissionsText(v);
    onChange({ permissions: parsePermissions(v) });
  };

  const sections = useMemo(
    () =>
      buildSectionsFromSchema<Values>(customRoleUpdateSchema, {
        renderers: {
          permissions: ({ onChange, errors }) => (
            <FieldTextarea
              name="permissions"
              label="Permissions (one per line, or comma-separated)"
              hint="Each must be a permission this system defines — anything else grants nothing."
              rows={6}
              value={permissionsText}
              error={errors.permissions}
              onChange={(v) => applyPermissionsText(v, onChange)}
            />
          ),
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [permissionsText],
  );

  const nav = useSectionFormNav(sections, form);
  const { shellCtx, setFieldError, clearErrors } = useFormShellState(customRoleUpdateSchema, {
    sections: nav.sectionMeta,
    onGoToSection: nav.goToSection,
    fieldToSectionIndex: nav.fieldToSectionIndex,
  });

  const onDelete = async () => {
    await deleteAdminRole(API_ROUTES.ADMIN.ROLE_BY_ID(id));
    router.push(String(ROUTES.ADMIN.ROLES));
  };

  const onSubmit = async () => {
    clearErrors();
    const permissions = parsePermissions(permissionsText);

    // A permission outside the catalogue never matches anything, so a role
    // built from typos reads as configured and grants nothing. Name them,
    // rather than reporting an array index the admin cannot map back to the
    // single textarea they typed into.
    const unknown = permissions.filter((perm) => !isKnownPermission(perm));
    if (unknown.length > 0) {
      setFieldError(
        "permissions",
        `Not real permissions: ${unknown.join(", ")}. They would grant nothing.`,
      );
      return;
    }

    const payload = {
      name: form.name,
      description: form.description || undefined,
      scope: form.scope,
      isActive: form.isActive,
      permissions,
    };

    const parsed = customRoleUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues, setFieldError);
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

  return (
    <Section>
      <Container size="md">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Edit Custom Role</Heading>
          <FormShellContext.Provider value={shellCtx}>
            <FormErrorSummary />
            <SectionForm<Values>
              sections={sections}
              values={form}
              onChange={(partial) => setForm((prev) => Object.assign({}, prev, partial))}
              onSubmit={onSubmit}
              schema={customRoleUpdateSchema}
              openIds={nav.openIds}
              onOpenChange={nav.setOpenIds}
              isLoading={saving}
              submitLabel={ACTIONS.ADMIN["save-changes"].label}
              onCancel={() => router.back()}
              cancelLabel="Cancel"
              destructiveAction={{
                label: ACTIONS.STORE["delete-listing"].label,
                onClick: () => setConfirmDelete(true),
              }}
            />
          </FormShellContext.Provider>
        </Stack>
      </Container>
      <ConfirmDeleteModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
        title="Delete role?"
        message="Users with this role will lose its permissions."
      />
    </Section>
  );
}
