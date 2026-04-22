import { Section, Stack, Skeleton } from "@mohasinac/appkit/ui";

export default function Loading() {
  return (
    <Section className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <Skeleton variant="text" width="180px" height="28px" className="mb-4" />
          <Stack gap="md">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton variant="rectangular" width="100px" height="100px" className="rounded-lg" />
                <Stack gap="sm" className="flex-grow">
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="20%" />
                </Stack>
              </div>
            ))}
          </Stack>
        </div>
        {/* Summary */}
        <Stack gap="md">
          <Skeleton variant="text" width="140px" height="28px" />
          <Skeleton variant="rectangular" height="150px" className="rounded-lg" />
          <Skeleton variant="rectangular" height="48px" className="rounded-lg" />
        </Stack>
      </div>
    </Section>
  );
}
