import apiServer from "@/services/apiServer";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, response } = await apiServer({ url: "/students/referrals" });
  return NextResponse.json(data, { status: response.status });
}