import { Container, Heading, Main, Section, CategoriesIndexListing } from "@mohasinac/appkit";

export const revalidate = 300;

export default function Page() {
  return (
    <Main>
      <Section className="py-10">
        <Container size="xl">
          <Heading level={1} className="mb-8 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            Brands
          </Heading>
          <CategoriesIndexListing brandsOnly />
        </Container>
      </Section>
    </Main>
  );
}
