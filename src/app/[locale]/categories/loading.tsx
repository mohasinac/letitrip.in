import { Grid, Section, Skeleton } from "@mohasinac/appkit/ui";

export default function Loading() {
  return (
    <Section className="p-6">
      <Skeleton variant="text" width="220px" height="32px" className="mb-6 mx-auto" />
      <Grid className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height="clamp(112px, 16vh, 160px)"
            className="rounded-xl"
          />
        ))}
      </Grid>
    </Section>
  );
}
