import { Grid, Section, Stack, Skeleton } from "@mohasinac/appkit/ui";

export default function Loading() {
  return (
    <Section className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery */}
        <Skeleton variant="rectangular" height="400px" className="rounded-xl w-full" />
        {/* Info */}
        <Stack gap="md">
          <Skeleton variant="text" width="80%" height="32px" />
          <Skeleton variant="text" width="40%" height="24px" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="rectangular" height="48px" className="rounded-lg mt-4" />
        </Stack>
      </div>
    </Section>
  );
}
