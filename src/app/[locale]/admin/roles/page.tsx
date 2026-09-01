"use client";

import {
  Container,
  Stack,
  Heading,
  Text,
  Button,
  EmptyState,
  Row,
  Section,
  ROUTES,
  Skeleton,
  ACTIONS,
  PageTabs,
  ROLES_TABS,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { getAdminRoles } from "@/lib/api/admin-client";
import { useEffect, useState } from "react";
import type { CustomRoleDocument } from "@mohasinac/appkit/client";
import { PermissionsCatalogPanel } from "@/components/admin/PermissionsCatalogPanel";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender. It also hosts tabs,
 * and `useTabParam` reaches `useSearchParams()`, which throws during prerender
 * without a boundary (Root Cause #17). Carried over from the concurrent
 * build-fix work rather than dropped with the rest of that file's version.
 */
export const dynamic = "force-dynamic";


function RolesPanel() {
  const router = useRouter();
  const [items, setItems] = useState<CustomRoleDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminRoles(API_ROUTES.ADMIN.ROLES)
      .then((r) => r.json())
      .then((j) => setItems(j?.data?.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" padding="y-lg">
          <Row justify="between">
            <Heading level={1}>Custom Roles</Heading>
            <Button
              variant="primary"
              onClick={() => router.push(String(ROUTES.ADMIN.ROLES_NEW))}
            >
              New role
            </Button>
          </Row>
          <Text color="muted">
            Custom roles layer on top of the built-in user/seller/moderator/employee/admin
            roles. Users gain permissions via custom-role membership or per-user overrides.
          </Text>
          {loading ? (
            <Stack gap="sm">
              <Skeleton variant="rectangular" height="64px" />
              <Skeleton variant="rectangular" height="64px" />
              <Skeleton variant="rectangular" height="64px" />
            </Stack>
          ) : items.length === 0 ? (
            <EmptyState
              title="No custom roles yet"
              description="Define a role with a curated permission set."
            />
          ) : (
            <Stack gap="sm">
              {items.map((r) => (
                <Row
                  key={r.id} rounded="default" padding="md" border="default" align="center" justify="between">
                  <Stack gap="xs">
                    <Text weight="medium">{r.name}</Text>
                    <Text size="xs" color="muted">
                      {r.scope} · {r.permissions.length} permissions ·{" "}
                      {r.isActive ? "Active" : "Inactive"}
                    </Text>
                  </Stack>
                  <Button
                    variant="outline"
                    onClick={() => router.push(String(ROUTES.ADMIN.ROLES_EDIT(r.id)))}
                  >
                    {ACTIONS.STORE["edit-listing"].label}
                  </Button>
                </Row>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </Section>
  );
}

/** Roles, and the catalogue you consult while building one. */
export default function Page() {
  return (
    <PageTabs
      tabs={ROLES_TABS}
      panels={{
        roles: <RolesPanel />,
        permissions: <PermissionsCatalogPanel />,
      }}
    />
  );
}
