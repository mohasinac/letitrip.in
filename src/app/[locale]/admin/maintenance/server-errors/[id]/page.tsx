import React from "react";
import { notFound } from "next/navigation";
import { ServerErrorDetailView } from "@mohasinac/appkit/client";
import { findRelatedClientErrors, getServerErrorById } from "@mohasinac/appkit/server";

export const dynamic = "force-dynamic";

interface Params {
  id: string;
}

export default async function ServerErrorDetailPage({
  params,
}: {
  params: Promise<Params>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  const doc = await getServerErrorById(id);
  if (!doc) notFound();
  const related = await findRelatedClientErrors(doc.requestId);
  return (
    <ServerErrorDetailView
      doc={doc}
      related={related}
      backHref={`/admin/maintenance/${doc.source === "client" ? "client-errors" : doc.source === "function" ? "function-errors" : "server-errors"}`}
    />
  );
}
