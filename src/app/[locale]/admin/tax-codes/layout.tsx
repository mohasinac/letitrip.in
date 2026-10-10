import { makeAdminSectionLayout } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

/*
 * `admin:site:read`, matching the API route. A tax code is site-wide
 * configuration, not catalogue content: a wrong rate here reaches every
 * product derived from every category pointing at it, and then an invoice.
 * The WRITE side of this section is admin-only (see the route).
 */
export default makeAdminSectionLayout("admin:site:read", {
  getUser: getServerSessionUser,
});
