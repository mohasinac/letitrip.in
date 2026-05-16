import { redirect } from "@/i18n/navigation";

export const revalidate = 120;

export default function Page() {
  redirect("/promotions/deals");
}
