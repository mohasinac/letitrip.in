import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { reportsRepository, Anchor } from "@mohasinac/appkit";
import { ROUTES } from "@mohasinac/appkit";
import { Section, Container, Row, Stack, Heading, Text, Badge } from "@mohasinac/appkit/client";
import { ReportDetailActions } from "./ReportDetailActions";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_VARIANT: Record<string, "success" | "danger" | "secondary" | "warning" | "info"> = {
  pending: "warning",
  "under-review": "info",
  actioned: "success",
  dismissed: "secondary",
};

export default async function AdminReportDetailPage({ params }: Props) {
  const { id } = await params;
  const report = await reportsRepository.findById(id).catch(() => null);
  if (!report) return notFound();

  return (
    <Section padding="y-xl">
      <Container size="md">
        <Row className="mb-2" gap="sm">
          <Link
            href={String(ROUTES.ADMIN.REPORTS)}
            className="text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text)]"
          >
            ← Reports
          </Link>
        </Row>

        <Row justify="between" align="center" className="mb-6">
          <Heading level={1} size="2xl" weight="bold">
            {report.reason} · {report.entityType}
          </Heading>
          <Badge variant={STATUS_VARIANT[report.status] ?? "secondary"}>{report.status.replace(/-/g, " ")}</Badge>
        </Row>

        <Stack gap="md" padding="lg" rounded="xl" border="default">
          <Row justify="between">
            <Text color="muted" size="sm">Entity</Text>
            <Text weight="medium">{report.entityType} · {report.entityId}</Text>
          </Row>
          <Row justify="between">
            <Text color="muted" size="sm">Reporter</Text>
            <Text weight="medium">{report.reporterId}</Text>
          </Row>
          <Row justify="between">
            <Text color="muted" size="sm">Submitted at</Text>
            <Text weight="medium">{new Date(report.createdAt).toLocaleString()}</Text>
          </Row>
          <Stack gap="xs">
            <Text color="muted" size="sm">Detail</Text>
            <Text className="whitespace-pre-wrap">{report.detail}</Text>
          </Stack>
          {report.evidenceUrls.length > 0 && (
            <Stack gap="xs">
              <Text color="muted" size="sm">Evidence</Text>
              <Stack gap="xs">
                {report.evidenceUrls.map((url, i) => (
                  <Anchor key={i} href={url} target="_blank">Evidence {i + 1}</Anchor>
                ))}
              </Stack>
            </Stack>
          )}
          {report.assignedTo && (
            <Row justify="between">
              <Text color="muted" size="sm">Assigned to</Text>
              <Text weight="medium">{report.assignedTo}</Text>
            </Row>
          )}
          {report.resolution && (
            <Stack gap="xs">
              <Text color="muted" size="sm">Resolution</Text>
              <Text className="whitespace-pre-wrap">{report.resolution}</Text>
            </Stack>
          )}
        </Stack>

        <Row className="mt-6">
          <ReportDetailActions id={report.id} status={report.status} />
        </Row>
      </Container>
    </Section>
  );
}
