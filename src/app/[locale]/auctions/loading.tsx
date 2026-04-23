import { Grid, Section, Stack, Skeleton } from "@mohasinac/appkit/ui";

export default function Loading() {
  return (
    <Section className="p-6">
      <div data-testid="auctions-loading-toolbar" className="mb-6 flex items-center justify-between">
        <Skeleton variant="text" width="200px" height="32px" />
        <Skeleton variant="rectangular" width="120px" height="36px" className="rounded-lg" />
      </div>
      <Grid className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Stack key={i} gap="sm">
            <Skeleton variant="rectangular" className="w-full pb-[100%] rounded-xl" />
            <Skeleton variant="text" width="75%" />
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="rectangular" height="28px" className="rounded-md" width="80%" />
          </Stack>
        ))}
      </Grid>
    </Section>
  );
}
