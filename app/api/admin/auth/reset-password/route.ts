import { forwardTo } from "@/lib/api/forward";
import { withErrorHandling } from "@/lib/api/respond";
import { NextRequest } from "next/server";

// Public: the emailed token is the credential. Signs out every session.
export const POST = withErrorHandling(
  "admin/auth/reset-password",
  (request: NextRequest) =>
    forwardTo(request, {
      url: "/admin/auth/reset-password",
      authenticateAs: null,
    }),
);
