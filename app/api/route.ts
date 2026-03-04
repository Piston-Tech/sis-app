import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: "Backend URL not configured", success: false },
    { status: 200 },
  );
}
