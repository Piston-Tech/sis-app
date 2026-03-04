import { logoutAdmin } from "@/services/apiServer";
import { deleteCookie } from "@/utils/cookies";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await logoutAdmin();
    return NextResponse.json(
      { success: true, message: "Loggout Successful" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
