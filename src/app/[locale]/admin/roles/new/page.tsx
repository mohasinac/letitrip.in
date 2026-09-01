"use client";

/**
 * Create a custom role.
 *
 * The fields come from `customRoleCreateSchema`'s annotations. Only
 * `permissions` needs a `renderers` entry: it is a `z.array` — `kind: "list"`,
 * which the generator renders as a disabled placeholder rather than guessing at
 * a list editor — and here it is authored as free text, one permission per line.
 *
 * ## The check that matters is on the permission STRINGS
 *
 * This form used to grant permissions with no validation of any kind, and the
 * route spread the body straight into Firestore, so a role could be created
 * with no name and a permissions list of typos. A permission outside the
 * catalogue is the quiet failure: it matches nothing, so the role reads as
 * configured and grants nothing. `isKnownPermission` rejects those by NAME
 * rather than by array index — the admin typed them into one textarea, and an
 * index means nothing to them.
 */

import {
  Container,
  Stack,
  Heading,
  Section,
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
  ACTIONS,
  customRoleCreateSchema,
  isKnownPermission,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { createAdminRole } from "@/lib/api/admin-client";
import { useMemo, useState } from "react";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender, and any client tree
 * reaching useSearchParams() throws during prerender without a boundary
 * (Root Cause #17). Kept from the concurrent build-fix work; the rest of that
 * file's version was dropped because it predated the SectionForm migration.
 */
export const dynamic = "force-dynamic";


function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** The free-text box, as the array the schema and the route expect. */
function parsePermissions(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

type Values = {
  [key: string]: unknown;
  name: string;
  slug: string;
  description: string;
  permissions: string[];
  scope: string;
  isActive: boolean;
};

const EMPTY: Values = {
  name: "",
  slug: "",
  description: "",
  permissions: [],
  scope: "global",
  isActive: true,
};

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState<Values>(EMPTY);
  const [permissionsText, setPermissionsText] = useState("");
  const [saving, setSaving] = useState(false);

  const applyPermissionsText = (v: string, onChange: (p: Partial<Values>) => void) => {
    setPermissionsText(v);
    onChange({ permissions: parsePermissions(v) });
  };

  const sections = useMemo(
    () =>
      buildSectionsFromSchema<Values>(customRoleCreateSchema, {
        renderers: {
          permissions: ({ onChange, errors }) => (
            <FieldTextarea
              name="permissions"
              label="Permissions (one per line, or comma-separated)"
              hint="Each must be a permission this system defines — anything else grants nothing."
              rows={6}
              placeholder="admin:products:read&#10;admin:products:write&#10;admin:reviews:read"
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
  const { shellCtx, setFieldError, clearErrors } = useFormShellState(customRoleCreateSchema, {
    sections: nav.sectionMeta,
    onGoToSection: nav.goToSection,
    fieldToSectionIndex: nav.fieldToSectionIndex,
  });

  const onSubmit = async () => {
    clearErrors();
    const permissions = parsePermissions(permissionsText);

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
      slug: form.slug || slugify(form.name),
      description: form.description || undefined,
      permissions,
      scope: form.scope,
      isActive: form.isActive,
    };

    const parsed = customRoleCreateSchema.safeParse(payload);
    if (!parsed.success) {
      applyZodIssues(parsed.error.issues, setFieldError);
      return;
    }

    setSaving(true);
    const res = await createAdminRole(API_ROUTES.ADMIN.ROLES, payload);
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
          <FormShellContext.Provider value={shellCtx}>
            <FormErrorSummary />
            <SectionForm<Values>
              sections={sections}
              values={form}
              onChange={(partial) => setForm((prev) => Object.assign({}, prev, partial))}
              onSubmit={onSubmit}
              schema={customRoleCreateSchema}
              openIds={nav.openIds}
              onOpenChange={nav.setOpenIds}
              isLoading={saving}
              submitLabel={ACTIONS.ADMIN["save-changes"].label}
              onCancel={() => router.back()}
              cancelLabel="Cancel"
            />
          </FormShellContext.Provider>
        </Stack>
      </Container>
    </Section>
  );
}
