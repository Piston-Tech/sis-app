import apiServer from "@/services/apiServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { data, response } = await apiServer({
    url: "/admin/foundation/programs",
    authenticateAs: "admin",
  });

  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { data, response } = await apiServer({
    url: "/admin/foundation/programs",
    method: "POST",
    body,
    authenticateAs: "admin",
  });

  return NextResponse.json(data, { status: response.status });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...payload } = body;
  const { data, response } = await apiServer({
    url: `/admin/foundation/programs/${id}`,
    method: "PUT",
    body: payload,
    authenticateAs: "admin",
  });

  return NextResponse.json(data, { status: response.status });
}
