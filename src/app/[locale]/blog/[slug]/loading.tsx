import { Section, Stack, Skeleton } from "@mohasinac/appkit/ui";

export default function Loading() {
  return (
    <Section className="p-6 max-w-3xl mx-auto">
      <Skeleton variant="rectangular" height="280px" className="rounded-xl mb-6" />
      <Skeleton variant="text" width="80%" height="32px" className="mb-3" />
      <Skeleton variant="text" width="40%" className="mb-6" />
      <Stack gap="sm">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="text" width={`${70 + (i % 3) * 10}%`} />
        ))}
      </Stack>
    </Section>
  );
}
