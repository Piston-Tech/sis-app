import { toNextResponse } from "@/lib/api/forward";
import { withErrorHandling } from "@/lib/api/respond";
import apiServer from "@/services/apiServer";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling("student/referrals", async () =>
  toNextResponse(await apiServer({ url: "/students/referrals" })),
);
