import { forwardTo } from "@/lib/api/forward";
import { withErrorHandling } from "@/lib/api/respond";
import { NextRequest } from "next/server";

export const POST = withErrorHandling(
  "auth/verify-otp",
  (request: NextRequest) =>
    forwardTo(request, { url: "/auth/verify-otp", authenticateAs: null }),
);
