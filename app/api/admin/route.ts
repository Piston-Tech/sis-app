import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { error: "Backend URL not configured", success: false },
        { status: 500 },
      );
    }

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

    const token = (await cookies()).get("adminSessionToken")?.value;

    const response = await fetch(`${backendUrl}/admin/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await response.json();

    if (response.status === 200) {
      const { user, message, success } = res;

      (await cookies()).set("adminDetails", JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Ensure 'secure' is used in production
        maxAge: 60 * 60 * 24, // Cookie expiration time (e.g., 1 day)
        path: "/", // Cookie available across the whole application
        sameSite: "lax",
      });

      return NextResponse.json(
        { user, message, success },
        { status: response.status },
      );
    }

    // (await cookies()).set("adminSessionToken", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production", // Ensure 'secure' is used in production
    //   maxAge: 60 * 60 * 24, // Cookie expiration time (e.g., 1 day)
    //   path: "/", // Cookie available across the whole application
    //   sameSite: "lax",
    // });

    return NextResponse.json(res, { status: response.status });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error", data: error, success: false },
      { status: 500 },
    );
  }
}
