"use client";
import { readListResponse } from "@/lib/api/read-list-response";
import { normalizeError } from "@mohasinac/appkit/client";

import {
  Container,
  Stack,
  Heading,
  Text,
  Button,
  Alert,
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

function RolesPanel() {
  const router = useRouter();
  const [items, setItems] = useState<CustomRoleDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getAdminRoles(API_ROUTES.ADMIN.ROLES)
      .then((r) => readListResponse<CustomRoleDocument>(r, "roles"))
      .then(setItems)
      .catch((err) => setLoadError(normalizeError(err).message))
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
          ) : loadError ? (
            // A FAILED request must not render the empty state. `errorResponse()`
            // is valid JSON with a non-2xx status, so `r.json()` resolved and
            // `?? []` produced an empty list — the page said "nothing here"
            // when it meant "the request failed". See readListResponse.
            <Alert variant="error" title="Couldn't load this list">
              {loadError} Refresh to retry.
            </Alert>
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
