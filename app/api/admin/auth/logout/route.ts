import { withErrorHandling } from "@/lib/api/respond";
import { logoutAdmin } from "@/services/apiServer";
import { NextResponse } from "next/server";

export const POST = withErrorHandling("admin/auth/logout", async () => {
  await logoutAdmin();

  return NextResponse.json(
    { message: "Logged out successfully", success: true },
    { status: 200 },
  );
});
