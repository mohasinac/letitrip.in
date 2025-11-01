import RoleGuard from "@/components/features/auth/RoleGuard";
import Reviews from "@/components/features/reviews/Reviews";

export default function AdminReviewsPage() {
  return (
    <RoleGuard requiredRole="admin">
      <Reviews
        title="Reviews Management"
        description="Moderate and manage product reviews"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Reviews", href: "/admin/reviews", active: true },
        ]}
      />
    </RoleGuard>
  );
}
