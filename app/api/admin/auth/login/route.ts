import apiServer from "@/services/apiServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data: res, response } = await apiServer({
      url: "/admin/auth/login",
      method: "POST",
      body,
    });

    if (response.status === 200) {
      const { user, message, success } = res;

      return NextResponse.json(
        { user, message, success },
        { status: response.status },
      );
    }

    console.log(res, response.status);

    return NextResponse.json(res, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
