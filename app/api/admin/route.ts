import apiServer from "@/services/apiServer";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = (await cookies()).get("adminDetails")?.value;
    // const user = null;

    if (user) {
      return NextResponse.json(
        {
          user: JSON.parse(user),
          message: "You're still logged in",
          success: true,
        },
        { status: 200 },
      );
    }

    // apiServer attaches the admin access token (refreshing it if needed) and
    // stores adminDetails on success.
    const { data: res, response } = await apiServer({
      url: "/admin/auth/me",
      method: "GET",
      authenticateAs: "admin",
    });

    if (response.status === 200) {
      const { user, message, success } = res;

      return NextResponse.json(
        { user, message, success },
        { status: response.status },
      );
    }

    return NextResponse.json(res, { status: response.status });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error", data: error, success: false },
      { status: 500 },
    );
  }
}
