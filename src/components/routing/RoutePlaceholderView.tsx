import { Container, Heading, Main, Section, Stack, Text } from "@mohasinac/appkit";

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
            <Heading level={1} className="text-3xl font-semibold text-zinc-900">
              {title}
            </Heading>
            <Text className="text-zinc-600">{description}</Text>
          </Stack>
        </Container>
      </Section>
    </Main>
  );
}