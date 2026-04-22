import { Grid, Section, Stack, Skeleton } from "@mohasinac/appkit/ui";

export default function Loading() {
  return (
    <Section className="p-6">
      {/* Search bar */}
      <Skeleton variant="rectangular" height="48px" className="rounded-xl mb-6" />
      {/* Results */}
      <Grid className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Stack key={i} gap="sm">
            <Skeleton variant="rectangular" className="w-full pb-[100%] rounded-xl" />
            <Skeleton variant="text" width="75%" />
            <Skeleton variant="text" width="50%" />
          </Stack>
        ))}
      </Grid>
    </Section>
  );
}
