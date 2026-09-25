import { forwardTo } from "@/lib/api/forward";
import { withErrorHandling } from "@/lib/api/respond";
import { NextRequest } from "next/server";

// Tokens in the backend response are stored as httpOnly cookies by apiServer
// and stripped from the JSON sent to the browser.
export const POST = withErrorHandling(
  "admin/auth/login",
  (request: NextRequest) =>
    forwardTo(request, { url: "/admin/auth/login", authenticateAs: null }),
);
