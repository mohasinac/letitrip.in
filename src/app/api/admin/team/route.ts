import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  userRepository,
  buildSieveFilters,
  getSearchParams,
  getNumberParam,
  getStringParam,
  serverLogger,
  adminUpdateUser,
  getProviders,
  sortBy,
  USER_FIELDS,
} from "@mohasinac/appkit";
import type { UserAdminUpdateInput } from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY, ROLES_TRUST_SAFETY } from "@/constants";

const DEFAULT_SORTS = sortBy(USER_FIELDS.CREATED_AT);

const inviteSchema = z.object({
  email: z.string().email(),
  permissionGroup: z.string().default("custom"),
  permissions: z.array(z.string()).default([]),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_TRUST_SAFETY],
    permission: "admin:team:read",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 25, { min: 1, max: 100 });
      const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;
      const rawFilters = getStringParam(searchParams, "filters") || "";
      const q = (getStringParam(searchParams, "q") || "").trim().toLowerCase();

      const effectiveFilters =
        buildSieveFilters(["role==employee", rawFilters]) || "role==employee";

      const result = await userRepository.list({
        filters: effectiveFilters,
        sorts,
        page,
        pageSize,
      });

      type RawUser = (typeof result.items)[number] & {
        permissionGroup?: string;
        permissions?: string[];
        updatedAt?: unknown;
      };

      const serialize = (u: RawUser) => ({
        id: u.id || u.uid,
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        photoURL: u.photoURL,
        role: u.role,
        permissionGroup: u.permissionGroup,
        permissions: u.permissions ?? [],
        disabled: u.disabled,
        createdAt:
          u.createdAt instanceof Date
            ? u.createdAt.toISOString()
            : (u.createdAt as { toDate?(): Date })?.toDate?.()?.toISOString() ??
              String(u.createdAt),
        updatedAt:
          u.updatedAt instanceof Date
            ? (u.updatedAt as Date).toISOString()
            : (u.updatedAt as { toDate?(): Date })?.toDate?.()?.toISOString() ??
              null,
      });

      const users = q
        ? result.items
            .map((u) => serialize(u as RawUser))
            .filter(
              (u) =>
                (u.displayName ?? "").toLowerCase().includes(q) ||
                (u.email ?? "").toLowerCase().includes(q),
            )
        : result.items.map((u) => serialize(u as RawUser));

      return successResponse({
        users,
        total: q ? users.length : result.total,
        meta: { page: result.page, pageSize: result.pageSize, total: result.total },
      });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<z.infer<typeof inviteSchema>>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:team:write",
    schema: inviteSchema,
    handler: async ({ body, user: adminUser }) => {
      const { email, permissionGroup, permissions } = body!;

      serverLogger.info("Admin inviting employee", {
        adminId: adminUser!.uid,
        permissionGroup,
      });

      const providers = getProviders();
      let uid: string;
      let isNewUser = false;

      // Try to find existing Firestore user by email first
      const existing = await userRepository.findByEmail(email);
      if (existing) {
        uid = existing.uid || existing.id || "";
      } else {
        // Create new Firebase Auth account + Firestore doc
        const tempPassword =
          crypto.randomUUID().replace(/-/g, "").slice(0, 12) + "Aa1!";
        const namePart = email.split("@")[0];
        const created = await providers.auth.createUser({
          email,
          password: tempPassword,
          displayName: namePart,
          emailVerified: false,
        });
        uid = created.uid;
        isNewUser = true;
      }

      const update: UserAdminUpdateInput = {
        role: "employee",
        permissionGroup: permissionGroup as UserAdminUpdateInput["permissionGroup"],
        permissions: permissions as UserAdminUpdateInput["permissions"],
      };

      await adminUpdateUser(adminUser!.uid, uid, update);

      return successResponse(
        { uid, email, permissionGroup, isNewUser },
        "Employee invited",
      );
    },
  }),
);
