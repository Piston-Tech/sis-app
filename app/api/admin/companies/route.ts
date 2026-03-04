import apiServer from "@/services/apiServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, response } = await apiServer({
      url: "/admin/companies",
      method: "POST",
      body,
      authenticateAs: "admin",
    });

    if (response.status === 201) {
      const { message, success, company } = data;

      return NextResponse.json({ company, message, success }, { status: response.status });
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
      url: "/admin/companies" + request.url.split("/admin/companies")[1],
      method: "GET",
      authenticateAs: "admin",
    });

    if (response.status === 200) {
      const { message, success, companies } = data;

      return NextResponse.json({ companies, message, success }, { status: response.status });
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
      url: "/companies/" + id,
      method: "PUT",
      body,
      authenticateAs: "admin",
    });

    if (response.status === 200) {
      const { message, success, company } = data;

      return NextResponse.json({ company, message, success }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
