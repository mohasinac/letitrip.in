import { Grid, Section, Stack, Skeleton } from "@mohasinac/appkit/ui";

export default function Loading() {
  return (
    <Section className="p-6">
      {/* Filter bar */}
      <div data-testid="products-loading-toolbar" className="mb-6 flex items-center justify-between">
        <Skeleton variant="rectangular" width="180px" height="36px" className="rounded-lg" />
        <Skeleton variant="rectangular" width="120px" height="36px" className="rounded-lg" />
      </div>
      {/* Product grid */}
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
