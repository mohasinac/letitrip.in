import { Grid, Section, Stack, Skeleton } from "@mohasinac/appkit/ui";

export default function Loading() {
  return (
    <Section className="p-6">
      <Skeleton variant="text" width="200px" height="32px" className="mb-6" />
      <Grid className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Stack key={i} gap="sm">
            <Skeleton variant="rectangular" height="180px" className="rounded-xl" />
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
          </Stack>
        ))}
      </Grid>
    </Section>
  );
}
