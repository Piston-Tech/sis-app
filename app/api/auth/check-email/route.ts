import { forwardTo } from "@/lib/api/forward";
import { withErrorHandling } from "@/lib/api/respond";
import { NextRequest } from "next/server";

export const POST = withErrorHandling(
  "auth/check-email",
  (request: NextRequest) =>
    forwardTo(request, { url: "/auth/check-email", authenticateAs: null }),
);
