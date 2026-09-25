import { forwardTo, toNextResponse } from "@/lib/api/forward";
import { withErrorHandling } from "@/lib/api/respond";
import apiServer from "@/services/apiServer";
import { NextRequest } from "next/server";

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

// The admin edits their own name ({ firstName, lastName })
export const PUT = withErrorHandling("admin/me:update", (request: NextRequest) =>
  forwardTo(request, { url: "/admin/auth/me", authenticateAs: "admin" }),
);
