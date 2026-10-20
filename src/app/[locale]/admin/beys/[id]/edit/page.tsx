import { notFound } from "next/navigation";
import { getAdminDb } from "@mohasinac/appkit/providers/db-firebase";
import { BEYS_COLLECTION } from "@mohasinac/appkit/features/beys/schemas/firestore";
import { ReferenceEditClient } from "./reference-edit-client";

/*
 * 🛑 THE EXISTENCE CHECK IS THE POINT OF THIS FILE.
 *
 * Without it an invented id renders a full editor — every field, a Save button
 * and a Delete button — for a record that does not exist. 27 of 40 admin
 * detail pages were like that, and `audit-admin-detail-notfound` exists
 * because of it. `notFound()` is the only accepted 404 here.
 *
 * 🛑 A DIRECT DOC READ, not a query: `id === slug` on both collections, so
 * this needs no index and no scan.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const snap = await getAdminDb().collection(BEYS_COLLECTION).doc(id).get();
  if (!snap.exists) return notFound();

  return <ReferenceEditClient id={id} />;
}
