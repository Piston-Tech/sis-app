import apiServer from "@/services/apiServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;
  const { data, response } = await apiServer({
    url: `/foundation/${resource}`,
    authenticateAs: null,
  });
  return NextResponse.json(data, { status: response.status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;
  const { data, response } = await apiServer({
    url: `/foundation/${resource}`,
    method: "POST",
    body: await request.json(),
    authenticateAs: null,
  });
  return NextResponse.json(data, { status: response.status });
}