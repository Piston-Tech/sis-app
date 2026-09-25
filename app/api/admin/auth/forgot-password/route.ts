import { forwardTo } from "@/lib/api/forward";
import { withErrorHandling } from "@/lib/api/respond";
import { NextRequest } from "next/server";

// Public: always answers the same, whether or not the email has an account
export const POST = withErrorHandling(
  "admin/auth/forgot-password",
  (request: NextRequest) =>
    forwardTo(request, {
      url: "/admin/auth/forgot-password",
      authenticateAs: null,
    }),
);
