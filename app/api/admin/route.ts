import { toNextResponse } from "@/lib/api/forward";
import { withErrorHandling } from "@/lib/api/respond";
import apiServer from "@/services/apiServer";

export const dynamic = "force-dynamic";

// Current admin. Always verified with the backend (apiServer refreshes the
// access token when needed and re-writes the adminDetails cookie on success),
// so a revoked admin or an access-level change takes effect immediately instead of
// being served from the 7-day adminDetails cookie.
export const GET = withErrorHandling("admin/me", async () =>
  toNextResponse(
    await apiServer({
      url: "/admin/auth/me",
      method: "GET",
      authenticateAs: "admin",
    }),
  ),
);
