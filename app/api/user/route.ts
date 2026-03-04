import apiServer, {
  getUserAccessToken,
  getUserDetails,
} from "@/services/apiServer";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { data, response } = await apiServer({
      url: "/auth/me",
      method: "GET",
    });

    if (response.status === 200) {
      const { user, message, success } = data;

      return NextResponse.json(
        { user, message, success },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error", data: error, success: false },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, response } = await apiServer({
      url: `/students/${body.id}`,
      method: "PUT",
      body,
    });

    if (response.status === 200) {
      const { student, message, success } = data;

      return NextResponse.json(
        { user: student, message, success },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
