import apiServer from "@/services/apiServer";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = await request.json();

  const { data, response } = await apiServer({
    url: `/admin/foundation/applications/${id}`,
    method: "PATCH",
    body: payload,
    authenticateAs: "admin",
  });

  return NextResponse.json(data, { status: response.status });
}
