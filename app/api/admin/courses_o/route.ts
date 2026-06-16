



import apiServer from "@/services/apiServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, response } = await apiServer({
      url: "/admin/courses",
      method: "POST",
      body,
      authenticateAs: "admin",
    });

    if (response.status === 201) {
      const { message, success, course } = data;

      return NextResponse.json({ course, message, success }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { data, response } = await apiServer({
      url: "/admin/courses" + request.url.split("/admin/courses")[1],
      method: "GET",
      authenticateAs: "admin",
    });

    if (response.status === 200) {
      const { message, success, courses } = data;

      return NextResponse.json({ courses, message, success }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...body } = await request.json();

    const { data, response } = await apiServer({
      url: "/courses/" + id,
      method: "PUT",
      body,
      authenticateAs: "admin",
    });

    if (response.status === 200) {
      const { message, success, course } = data;

      return NextResponse.json({ course, message, success }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
