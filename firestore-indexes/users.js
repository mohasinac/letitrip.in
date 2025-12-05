// ========================================
// USERS COLLECTION INDEXES
// Supports user management, role-based access, and moderation
// Used by: Admin dashboards, user management, RBAC enforcement
// ========================================

module.exports = {
  indexes: [
    // Query: Get users filtered by role (admin/seller/buyer) sorted by date
    // Use Case: Admin user management, role assignment, permission audits
    // Routes: /api/admin/users?role=seller, admin dashboard user lists
    // RBAC: Critical for role-based access control and permission management
    {
      collectionGroup: "users",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "role", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get users filtered by ban status
    // Use Case: Admin moderation panel, banned users list, account restoration
    // Routes: /api/admin/users?banned=true, moderation dashboards
    // Moderation: Tracks suspended accounts and enforcement actions
    {
      collectionGroup: "users",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "is_banned", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    },

    // Query: Get users filtered by both role and ban status
    // Use Case: Complex admin queries ("Show all banned sellers"), audit reports
    // Routes: /api/admin/users?role=seller&banned=true, compliance reporting
    // Security: Identifies policy violations by user type (banned sellers, etc.)
    {
      collectionGroup: "users",
      queryScope: "COLLECTION",
      fields: [
        { fieldPath: "role", order: "ASCENDING" },
        { fieldPath: "is_banned", order: "ASCENDING" },
        { fieldPath: "created_at", order: "DESCENDING" }
      ]
    }
  ],

  fieldOverrides: []
};
