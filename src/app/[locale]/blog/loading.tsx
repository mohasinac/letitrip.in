import { Grid, Section, Stack, Skeleton } from "@mohasinac/appkit/ui";

export default function Loading() {
  return (
    <Section className="p-6">
      <Skeleton variant="text" width="200px" height="32px" className="mb-6" />
      <Grid className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Stack key={i} gap="sm">
            <Skeleton variant="rectangular" height="200px" className="rounded-xl" />
            <Skeleton variant="text" width="80%" height="20px" />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </Stack>
        ))}
      </Grid>
    </Section>
  );
}
