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
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { API_ROUTES } from "@/constants";
import { useEffect, useState } from "react";
import type { CustomRoleDocument } from "@mohasinac/appkit";

export default function Page() {
  const router = useRouter();
  const [items, setItems] = useState<CustomRoleDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_ROUTES.ADMIN.ROLES)
      .then((r) => r.json())
      .then((j) => setItems(j?.data?.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" className="py-6">
          <Row className="items-center justify-between">
            <Heading level={1}>Custom Roles</Heading>
            <Button
              variant="primary"
              onClick={() => router.push(String(ROUTES.ADMIN.ROLES_NEW))}
            >
              New role
            </Button>
          </Row>
          <Text className="text-zinc-600 dark:text-slate-400">
            Custom roles layer on top of the built-in user/seller/moderator/employee/admin
            roles. Users gain permissions via custom-role membership or per-user overrides.
          </Text>
          {loading ? (
            <Text>Loading…</Text>
          ) : items.length === 0 ? (
            <EmptyState
              title="No custom roles yet"
              description="Define a role with a curated permission set."
            />
          ) : (
            <Stack gap="sm">
              {items.map((r) => (
                <Row
                  key={r.id}
                  className="items-center justify-between p-4 rounded border border-zinc-200 dark:border-slate-700"
                >
                  <Stack gap="xs">
                    <Text className="font-medium">{r.name}</Text>
                    <Text className="text-xs text-zinc-500">
                      {r.scope} · {r.permissions.length} permissions ·{" "}
                      {r.isActive ? "Active" : "Inactive"}
                    </Text>
                  </Stack>
                  <Button
                    variant="outline"
                    onClick={() => router.push(String(ROUTES.ADMIN.ROLES_EDIT(r.id)))}
                  >
                    Edit
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
