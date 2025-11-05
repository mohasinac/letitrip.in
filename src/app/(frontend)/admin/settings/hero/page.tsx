import { redirect } from "next/navigation";

// Hero settings have been disabled
export default function HeroSettings() {
  redirect("/admin/settings/theme");
}
