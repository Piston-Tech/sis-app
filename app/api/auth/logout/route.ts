import { withErrorHandling } from "@/lib/api/respond";
import { logoutUser } from "@/services/apiServer";
import { NextResponse } from "next/server";

export const POST = withErrorHandling("auth/logout", async () => {
  await logoutUser();

  return NextResponse.json(
    { message: "Logged out successfully", success: true },
    { status: 200 },
  );
});
