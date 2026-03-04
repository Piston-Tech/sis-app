import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { error: "Backend URL not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();

    const response = await fetch(`${backendUrl}/admin/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const { token, message } = await response.json();

    (await cookies()).set("adminSessionToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure 'secure' is used in production
      maxAge: 60 * 60 * 24, // Cookie expiration time (e.g., 1 day)
      path: "/", // Cookie available across the whole application
      sameSite: "lax",
    });

    return NextResponse.json({ token, message }, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
