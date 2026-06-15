import { Container, Heading, Main, Section, Stack, Text } from "@mohasinac/appkit/client";

type RoutePlaceholderViewProps = {
  title: string;
  description?: string;
};

export function RoutePlaceholderView({
  title,
  description = "This route is wired and ready for feature data bindings.",
}: RoutePlaceholderViewProps) {
  return (
    <Main>
      <Section className="py-12">
        <Container size="xl">
          <Stack gap="md">
            <Heading level={1} size="3xl" weight="semibold" color="primary">
              {title}
            </Heading>
            <Text color="muted">{description}</Text>
          </Stack>
        </Container>
      </Section>
    </Main>
  );
}