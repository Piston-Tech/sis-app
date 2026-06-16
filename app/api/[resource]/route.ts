import apiServer from "@/services/apiServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;
  try {
    const body = await request.json();

    const { data: resData, response } = await apiServer({
      url: `/${resource}`,
      method: "POST",
      body,
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
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;
  try {
    const { data: resData, response } = await apiServer({
      url: `/${resource}` + (request.url.split(`/${resource}`)[1] ?? ""),
      method: "GET",
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;
  try {
    const { id, ...body } = await request.json();

    const { data: resData, response } = await apiServer({
      url:
        `/${resource}/${id}` +
        (request.url.split(`/${resource}/${id}`)[1] ?? ""),
      method: "PUT",
      body,
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
