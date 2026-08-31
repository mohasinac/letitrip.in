import {
  Container,
  Section,
  Stack,
  Heading,
  Text,
  Div,
  Span,
  Details,
  Summary,
  PERMISSION_DOMAINS,
  getPermissionsForDomain,
  formatPermLabel,
} from "@mohasinac/appkit/client";

/**
 * The permission catalogue, as a panel.
 *
 * It was `/admin/permissions`' whole page until W8 C2 folded it into
 * `/admin/roles` — it is the reference sheet you consult WHILE building a role,
 * and both surfaces are `admin:roles:read`, which is the test that decides
 * whether two pages can be tabs at all.
 */
export function PermissionsCatalogPanel() {
  return (
    <Section>
      <Container size="2xl">
        <Stack gap="lg" padding="y-lg">
          <Heading level={1}>Permissions Catalog</Heading>
          <Text color="muted">
            Every permission string available to custom employee roles, grouped by domain.
            Reference only — assign permissions via Team or Roles.
          </Text>
          <Stack gap="sm">
            {PERMISSION_DOMAINS.map((domain) => {
              const perms = getPermissionsForDomain(domain.prefix);
              if (perms.length === 0) return null;
              return (
                <Details key={domain.prefix} tone="card" padding="none">
                  <Summary
                    paddingX="x-md"
                    paddingY="y-md"
                    weight="semibold"
                    layout="flex"
                    align="center"
                    justify="between"
                  >
                    <Span>{domain.label}</Span>
                    <Span size="xs" color="muted">{perms.length} permissions</Span>
                  </Summary>
                  <Div padding="md" surface="muted">
                    <Stack gap="xs">
                      {perms.map((perm) => (
                        <Stack key={perm} gap="none">
                          <Text weight="medium" size="sm">{formatPermLabel(perm)}</Text>
                          <Text size="xs" color="muted" className="font-mono">{perm}</Text>
                        </Stack>
                      ))}
                    </Stack>
                  </Div>
                </Details>
              );
            })}
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
