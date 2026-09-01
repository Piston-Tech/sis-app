import apiServer from "@/services/apiServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string; path: string }> },
) {
  const { resource, path } = await params;
  try {
    const body = await request.json();

    const { data: resData, response } = await apiServer({
      url: `/students/${resource}/${path}`,
      method: "POST",
      body,
      // authenticateAs: "admin",
    });

    if (response.status === 201) {
      const { message, success, data } = resData;

      return NextResponse.json(
        { data, message, success },
        { status: response.status },
      );
    }

    return NextResponse.json(resData, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string; path: string }> },
) {
  const { resource, path } = await params;
  try {
    const { data: resData, response } = await apiServer({
      url:
        `/students/${resource}/${path}` +
        (request.url.split(`/students/${resource}/${path}`)[1] ?? ""),
      method: "GET",
      // authenticateAs: "admin",
    });

    if (response.status === 200) {
      if (response.headers.get("Content-Type")?.includes("application/json")) {
        const { message, success, data } = resData;

        return NextResponse.json(
          { data, message, success },
          { status: response.status },
        );
      }

      // Set standard download headers
      const headers = new Headers();
      headers.set("Content-Type", response.headers.get("Content-Type") ?? "");

      return new NextResponse(resData, { status: 200, headers });
    }

    return NextResponse.json(resData, { status: response.status });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string; path: string }> },
) {
  const { resource, path } = await params;
  try {
    const body = await request.json();

    const { data: resData, response } = await apiServer({
      url: `/${resource}/${path}`,
      method: "PUT",
      body,
      authenticateAs: "admin",
    });

    if (response.status === 200) {
      const { message, success, data } = resData;

      return NextResponse.json(
        { data, message, success },
        { status: response.status },
      );
    }

    return NextResponse.json(resData, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
