import { forwardTo } from "@/lib/api/forward";
import { withErrorHandling } from "@/lib/api/respond";
import { NextRequest } from "next/server";

export const POST = withErrorHandling(
  "auth/create-password",
  (request: NextRequest) =>
    forwardTo(request, { url: "/auth/create-password", authenticateAs: null }),
);
