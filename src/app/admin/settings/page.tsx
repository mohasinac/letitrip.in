import { redirect } from "next/navigation";

export default function AdminSettings() {
  // Redirect to theme settings by default
  redirect("/admin/settings/theme");
}
