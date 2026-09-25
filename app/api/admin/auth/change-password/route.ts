import { forwardTo } from "@/lib/api/forward";
import { withErrorHandling } from "@/lib/api/respond";
import { NextRequest } from "next/server";

// The backend signs out every other session and returns fresh tokens for
// this one; apiServer stores them as httpOnly cookies and forwardTo strips
// them from the JSON sent to the browser.
export const POST = withErrorHandling(
  "admin/auth/change-password",
  (request: NextRequest) =>
    forwardTo(request, {
      url: "/admin/auth/change-password",
      authenticateAs: "admin",
    }),
);
