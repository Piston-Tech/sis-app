import apiServer from "@/services/apiServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, response } = await apiServer({
      url: "/auth/register",
      method: "POST",
      body,
    });

    if (response.status === 201) {
      const { user, message, success } = data;

      return NextResponse.json(
        { user, message, success },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to proxy request" },
      { status: 500 },
    );
  }
}
