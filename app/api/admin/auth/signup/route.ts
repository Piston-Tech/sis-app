import { forwardTo } from "@/lib/api/forward";
import { withErrorHandling } from "@/lib/api/respond";
import { NextRequest } from "next/server";

// Creating an admin requires an existing admin session: the backend rejects
// /admin/auth/register without a valid admin access token.
export const POST = withErrorHandling(
  "admin/auth/signup",
  (request: NextRequest) =>
    forwardTo(request, {
      url: "/admin/auth/register",
      authenticateAs: "admin",
    }),
);
