import apiServer from "@/services/apiServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { data, response } = await apiServer({
    url: "/admin/foundation/cohorts",
    authenticateAs: "admin",
  });

  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { data, response } = await apiServer({
    url: "/admin/foundation/cohorts",
    method: "POST",
    body,
    authenticateAs: "admin",
  });

  return NextResponse.json(data, { status: response.status });
}
