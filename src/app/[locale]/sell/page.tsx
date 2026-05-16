import { redirect } from "@/i18n/navigation";

export const revalidate = 3600;

export default function Page() {
  redirect("/user/become-seller");
}
