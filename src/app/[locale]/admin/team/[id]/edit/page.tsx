import { notFound } from "next/navigation";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { requireRecord } from "@mohasinac/appkit/next/routing/require-record";
import { isEmployeeUser } from "@mohasinac/appkit/features/auth/role-predicates";
import { TeamMemberEditClient } from "./TeamMemberEditClient";

/**
 * Edit a team member's permissions.
 *
 * ## 🛑 The 404 gap was the SMALLER of two bugs here
 *
 * This page was `"use client"` and passed `AdminEmployeeEditorView` nothing but
 * a `userId`. Its own docstring asserted "the editor loads them from `userId`
 * itself" — and the editor does no such thing: `currentPermissions` is a PROP,
 * defaulted to `[]`, and `currentPermissionGroup` to `"custom"`.
 *
 * So the drawer opened with **every permission unticked** for a real employee,
 * and `PUT /api/admin/team/[id]` sends `permissions` whenever it is defined.
 * Pressing Save on an untouched form therefore **wiped that member's entire
 * permission set** — Root Cause #98's exact shape (a wrong default, re-sent on
 * save), and invisible because the form looked like an accurate empty state.
 *
 * The list drawer was never affected: there, the row supplies the real values.
 * Only this standalone page, which has no row, was wrong — and a claim in a
 * comment is what kept it that way.
 *
 * Reading server-side fixes both halves at once: an invented id 404s before any
 * client JS loads, and a real member arrives with their actual permissions.
 *
 * ## Only an employee may be edited here
 *
 * `/admin/team` lists `role == "employee"`. Opening a BUYER at this URL and
 * saving would grant them a staff permission set, so a non-employee is a wrong
 * URL rather than a missing record. Role changes belong to `/admin/users`.
 */
export const metadata = { title: "Edit Team Member — Admin" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const member = await requireRecord(() => userRepository.findById(id), {
    route: "/admin/team/[id]/edit",
    key: "users.findById",
  });

  // `member` is null only when the READ failed, which must not 404 a record
  // that exists — see `requireRecord`'s header.
  if (member && !isEmployeeUser(member)) notFound();

  const staff = member as
    | { displayName?: string; permissionGroup?: string; permissions?: string[] }
    | null;

  return (
    <TeamMemberEditClient
      userId={id}
      displayName={staff?.displayName}
      currentPermissionGroup={staff?.permissionGroup}
      currentPermissions={staff?.permissions ?? []}
    />
  );
}
